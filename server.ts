import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

function sanitizeEnvValue(val: string | undefined): string {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}

const ELEVENLABS_KEYS = [
  sanitizeEnvValue(process.env.ELEVENLABS_KEY_1 || process.env.ACCOUNT_1_11LABS_KEY),
  sanitizeEnvValue(process.env.ELEVENLABS_KEY_2 || process.env.ACCOUNT_2_11LABS_KEY),
  sanitizeEnvValue(process.env.ELEVENLABS_KEY_3 || process.env.ACCOUNT_3_11LABS_KEY)
];

function getElevenLabsKey(accountIndex: number = 0) {
  const key = ELEVENLABS_KEYS[accountIndex];
  if (!key || key.length < 10) {
    const fallbackIdx = ELEVENLABS_KEYS.findIndex(k => k && k.length > 10);
    return fallbackIdx !== -1 ? ELEVENLABS_KEYS[fallbackIdx] : "";
  }
  return key;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper: Set correct MIME types for WASM and other assets
  express.static.mime.define({ 
    'application/wasm': ['wasm'],
    'audio/mpeg': ['mp3'],
    'audio/wav': ['wav'],
    'audio/ogg': ['ogg'],
    'audio/aac': ['aac'],
    'audio/flac': ['flac']
  });

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Helper: Validate Host Allowlist
  const allowedHosts = [
    'api.github.com',
    'raw.githubusercontent.com',
    'forgottenrealms.fandom.com',
    'dnd5e.fandom.com'
  ];

  function isUrlAllowed(urlStr: string): boolean {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'https:') return false;

      // Prevent use of credentials in URLs to avoid SSRF with auth bypass or leak
      if (url.username || url.password) return false;

      return allowedHosts.some(host =>
        url.hostname === host || url.hostname.endsWith('.' + host)
      );
    } catch {
      return false;
    }
  }

  // Helper: Validate Path Allowlist
  const allowedPathPrefixes = [
    'public/assets/atlas/',
    'public/data/character_save/'
  ];

  function isPathAllowed(filePath: any): boolean {
    if (typeof filePath !== 'string') return false;
    
    // Normalize and check for traversal
    const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');
    
    if (
      normalizedPath.includes('..') || 
      path.isAbsolute(normalizedPath) || 
      normalizedPath.startsWith('/') ||
      normalizedPath.includes('\0') // Null byte check
    ) {
      return false;
    }

    // Must start with an allowed prefix and not try to escape it
    return allowedPathPrefixes.some(prefix => 
      normalizedPath.startsWith(prefix) && !normalizedPath.includes('//')
    );
  }

  // API: Proxy Wiki (for scraping Fandom)
  app.get("/api/proxy-wiki", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL parameter is required." });
    }

    if (!isUrlAllowed(url)) {
      return res.status(403).json({ error: "URL not allowed." });
    }

    try {
      const fetchRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({ error: fetchRes.statusText });
      }
      const text = await fetchRes.text();
      res.send(text);
    } catch (error) {
      console.error("Server Error during wiki proxy:", error);
      res.status(500).json({ error: "Internal server error during wiki fetch." });
    }
  });

  // API: Fetch Proxy (to handle private repos securely)
  app.get("/api/fetch", async (req, res) => {
    const { url } = req.query;
    const token = process.env.GITHUB_TOKEN;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL parameter is required." });
    }

    if (!isUrlAllowed(url)) {
      return res.status(403).json({ error: "URL not allowed." });
    }

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };

      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const fetchRes = await fetch(url, { headers });
      
      if (!fetchRes.ok) {
        const errorData = await fetchRes.json().catch(() => ({ message: fetchRes.statusText }));
        return res.status(fetchRes.status).json({ error: errorData.message });
      }

      const data = await fetchRes.json();
      res.json(data);
    } catch (error) {
      console.error("Server Error during fetch proxy:", error);
      res.status(500).json({ error: "Internal server error during GitHub fetch." });
    }
  });

  // API: Raw Proxy (for raw content)
  app.get("/api/raw", async (req, res) => {
    const { url } = req.query;
    const token = process.env.GITHUB_TOKEN;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL parameter is required." });
    }

    if (!isUrlAllowed(url)) {
      return res.status(403).json({ error: "URL not allowed." });
    }

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const fetchRes = await fetch(url, { headers });
      
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({ error: fetchRes.statusText });
      }

      // If it's an image or audio, pipe it as binary
      const contentType = fetchRes.headers.get('content-type');
      const urlWithoutQuery = url.split('?')[0].toLowerCase();
      const isImage = contentType?.startsWith('image/') || 
                      urlWithoutQuery.match(/\.(webp|png|jpg|jpeg|gif|svg|avif)$/) ||
                      url.toLowerCase().match(/wiki_image|images/i);
      const isAudio = contentType?.startsWith('audio/') ||
                      urlWithoutQuery.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/);

      if (isImage || isAudio) {
        // Prioritize extensions if content-type is generic or missing
        let targetContentType = contentType;
        
        if (isImage) {
          targetContentType = targetContentType || 'image/webp';
          if (urlWithoutQuery.endsWith('.webp')) targetContentType = 'image/webp';
          else if (urlWithoutQuery.endsWith('.png')) targetContentType = 'image/png';
          else if (urlWithoutQuery.endsWith('.jpg') || urlWithoutQuery.endsWith('.jpeg')) targetContentType = 'image/jpeg';
          else if (urlWithoutQuery.endsWith('.svg')) targetContentType = 'image/svg+xml';
          else if (urlWithoutQuery.endsWith('.avif')) targetContentType = 'image/avif';
        } else if (isAudio) {
          targetContentType = targetContentType || 'audio/mpeg';
          if (urlWithoutQuery.endsWith('.mp3')) targetContentType = 'audio/mpeg';
          else if (urlWithoutQuery.endsWith('.wav')) targetContentType = 'audio/wav';
          else if (urlWithoutQuery.endsWith('.ogg')) targetContentType = 'audio/ogg';
          else if (urlWithoutQuery.endsWith('.m4a')) targetContentType = 'audio/mp4';
          else if (urlWithoutQuery.endsWith('.aac')) targetContentType = 'audio/aac';
          else if (urlWithoutQuery.endsWith('.flac')) targetContentType = 'audio/flac';
        }
        
        res.setHeader('Content-Type', targetContentType!);
        // Add cache headers
        res.setHeader('Cache-Control', 'public, max-age=3600');
        
        const buffer = await fetchRes.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }

      const data = await fetchRes.text();
      try {
        res.json(JSON.parse(data));
      } catch {
        res.send(data);
      }
    } catch (error) {
      console.error("Server Error during raw proxy:", error);
      res.status(500).json({ error: "Internal server error during GitHub raw fetch." });
    }
  });

  // API: Commit Proxy
  app.post("/api/commit", async (req, res) => {
    const { path: filePath, content, isBase64, message } = req.body;

    if (!isPathAllowed(filePath)) {
      return res.status(403).json({ error: "Path not allowed." });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;

    let githubSuccess = false;
    let githubError: string | null = null;

    // 1. Always attempt local save first in the sandbox environment
    try {
      const localPath = path.join(process.cwd(), filePath);
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      const buffer = isBase64 ? Buffer.from(content, 'base64') : Buffer.from(content);
      await fs.writeFile(localPath, buffer);
      console.log(`Saved file locally: ${localPath}`);
    } catch (err: any) {
      console.error("Failed to save file locally:", err);
      // If we can't even save locally, that's a hard error
      return res.status(500).json({ error: `Failed to save file locally: ${err.message}` });
    }

    // 2. Attempt GitHub commit if configured
    if (token && repo) {
      try {
        // Get current file SHA if it exists
        const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const getRes = await fetch(getUrl, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        let sha: string | undefined;
        if (getRes.ok) {
          const data = await getRes.json();
          sha = data.sha;
        }

        // Create or update file
        const putRes = await fetch(getUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message || `Bake bestiary entry: ${filePath}`,
            content: isBase64 ? content : Buffer.from(content).toString('base64'),
            sha: sha
          })
        });

        if (putRes.ok) {
          githubSuccess = true;
        } else {
          const errorData = await putRes.json();
          githubError = errorData.message;
          console.warn("GitHub Commit Failed:", githubError);
        }
      } catch (error: any) {
        githubError = error.message;
        console.error("Server Error during GitHub commit:", error);
      }
    } else {
      githubError = "GitHub not configured, saved locally only.";
    }

    res.json({ 
      success: true, 
      local: true, 
      github: githubSuccess, 
      githubError 
    });
  });

  // API: Delete Proxy
  app.post("/api/delete", async (req, res) => {
    const { path: filePath, message } = req.body;

    if (!isPathAllowed(filePath)) {
      return res.status(403).json({ error: "Path not allowed." });
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;

    if (!token || !repo) {
      return res.status(500).json({ error: "GitHub configuration missing on server." });
    }

    try {
      // 1. Get current file SHA (required for delete)
      const getUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
      const getRes = await fetch(getUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getRes.ok) {
        return res.status(getRes.status).json({ error: "File not found or inaccessible." });
      }

      const data = await getRes.json();
      const sha = data.sha;

      // 2. Delete file
      const delRes = await fetch(getUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message || `Delete file: ${filePath}`,
          sha: sha
        })
      });

      if (!delRes.ok) {
        const errorData = await delRes.json();
        return res.status(delRes.status).json({ error: errorData.message });
      }

      // 3. ALSO delete locally if we are in the sandbox environment
      try {
        const localPath = path.join(process.cwd(), filePath);
        await fs.unlink(localPath);
        console.log(`Deleted file locally: ${localPath}`);
      } catch (err) {
        // Silently fail local delete if it doesn't exist
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Server Error during delete:", error);
      res.status(500).json({ error: "Internal server error during GitHub delete." });
    }
  });

  // API: AI Proxy (Google Gemini)
  app.post("/api/ai/generate-content", async (req, res) => {
    const { model, contents, config, tools } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(`[AI Proxy] Generating content with model: ${model}`);

    if (!apiKey) {
      console.error("[AI Proxy] Error: Gemini API key missing.");
      return res.status(500).json({ error: "Gemini API key missing on server." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({
        model,
        generationConfig: config,
        tools: tools
      });
      
      // The SDK expects { contents: [...] } or just the array depending on how it's called.
      // We'll normalize it here.
      const formattedContents = Array.isArray(contents) ? contents : [{ parts: [{ text: contents }] }];
      
      const result = await genModel.generateContent({ contents: formattedContents });
      const response = await result.response;
      
      console.log("[AI Proxy] Success: Generated content.");
      res.json({ candidates: response.candidates });
    } catch (error: any) {
      console.error("[AI Proxy] Server Error during AI generate-content:", error);
      res.status(500).json({ error: error.message || "Internal server error during AI generation." });
    }
  });

  app.post("/api/ai/generate-image", async (req, res) => {
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(`[AI Proxy] Generating image with model: ${model}`);

    if (!apiKey) {
      console.error("[AI Proxy] Error: Gemini API key missing.");
      return res.status(500).json({ error: "Gemini API key missing on server." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model, generationConfig: config });
      
      const formattedContents = Array.isArray(contents) ? contents : [{ parts: [{ text: contents }] }];
      const result = await genModel.generateContent({ contents: formattedContents });
      const response = await result.response;
      
      console.log("[AI Proxy] Success: Generated image data.");
      res.json({ candidates: response.candidates });
    } catch (error: any) {
      console.error("[AI Proxy] Server Error during AI generate-image:", error);
      res.status(500).json({ error: error.message || "Internal server error during AI image generation." });
    }
  });

  app.post("/api/audio/generate-sfx", async (req, res) => {
    try {
      const { text, duration_seconds, prompt_influence, loop, accountIndex } = req.body;
      const apiKey = getElevenLabsKey(accountIndex);

      if (!apiKey) {
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }

      const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          duration_seconds: duration_seconds || 5,
          prompt_influence: prompt_influence || 0.3,
          model_id: "eleven_text_to_sound_v2",
          loop: loop || false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs SFX Error:", errorText);
        return res.status(response.status).json({ error: "ElevenLabs API error", detail: errorText });
      }

      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/wav");
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error("SFX generation error:", error);
      res.status(500).json({ error: "Internal server error during SFX generation." });
    }
  });

  app.post("/api/ai/optimize-sound-prompt", async (req, res) => {
    const { prompt, category } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key missing." });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptText = `You are an Audio Engineering specialist. Your task is to optimize a descriptive sound prompt for the ElevenLabs Text-to-Sound model.

      Original Description: "${prompt}"
      Target Category: "${category || 'sfx'}"

      Requirements:
      - Use technical audio terminology (e.g., frequency range, reverb characteristics, spatial positioning, dynamic range).
      - Emphasize textures and sonic details.
      - Keep it concise but highly descriptive for an AI model.
      - Return ONLY the optimized prompt string.`;

      const result = await genModel.generateContent(promptText);
      const response = await result.response;
      const optimizedPrompt = response.text().trim();

      res.json({ optimizedPrompt });
    } catch (error: any) {
      console.error("Optimization error:", error);
      res.status(500).json({ error: "Failed to optimize prompt." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

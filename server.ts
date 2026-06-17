import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper: Set correct MIME types for WASM and other assets
  express.static.mime.define({ 'application/wasm': ['wasm'] });

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
    'data/character_save/'
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

      // If it's an image, pipe it
      const contentType = fetchRes.headers.get('content-type');
      const urlWithoutQuery = url.split('?')[0].toLowerCase();
      const isImage = contentType?.startsWith('image/') || 
                      urlWithoutQuery.match(/\.(webp|png|jpg|jpeg|gif|svg|avif)$/) ||
                      url.toLowerCase().match(/wiki_image|images/i);

      if (isImage) {
        // Prioritize extensions if content-type is generic or missing
        let targetContentType = contentType || 'image/webp';
        if (urlWithoutQuery.endsWith('.webp')) targetContentType = 'image/webp';
        else if (urlWithoutQuery.endsWith('.png')) targetContentType = 'image/png';
        else if (urlWithoutQuery.endsWith('.jpg') || urlWithoutQuery.endsWith('.jpeg')) targetContentType = 'image/jpeg';
        else if (urlWithoutQuery.endsWith('.svg')) targetContentType = 'image/svg+xml';
        else if (urlWithoutQuery.endsWith('.avif')) targetContentType = 'image/avif';
        
        res.setHeader('Content-Type', targetContentType);
        // Add cache headers for images
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
    const { model, contents, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(`[AI Proxy] Generating content with model: ${model}`);

    if (!apiKey) {
      console.error("[AI Proxy] Error: Gemini API key missing.");
      return res.status(500).json({ error: "Gemini API key missing on server." });
    }

    try {
      const genAI = new GoogleGenAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model, generationConfig: config });
      
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
      const genAI = new GoogleGenAI(apiKey);
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

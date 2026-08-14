import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import https from "https";

dotenv.config();

const hueRejectUnauthorized = process.env.HUE_REJECT_UNAUTHORIZED === "true";

const localSelfSignedHttpsAgent = new https.Agent({
  rejectUnauthorized: hueRejectUnauthorized
});

const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Required for secure production endpoint calls
});

let hueDiscoveryCache: { data: any; timestamp: number } | null = null;
const HUE_DISCOVERY_CACHE_MS = 60_000;

function isLocalIp(ip: string): boolean {
  if (typeof ip !== 'string') return false;
  const cleanIp = ip.trim();
  if (cleanIp === 'localhost' || cleanIp === '127.0.0.1') return true;

  // Regex for standard private IP ranges (RFC 1918)
  // 10.0.0.0 – 10.255.255.255
  // 172.16.0.0 – 172.31.255.255
  // 192.168.0.0 – 192.168.255.255
  const privateIpRegex = /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})|(?:192\.168\.\d{1,3}\.\d{1,3})$/;
  return privateIpRegex.test(cleanIp);
}

function getSafeHueUrl(ip: string, huePath: string): string | null {
  if (typeof ip !== 'string' || typeof huePath !== 'string') return null;

  const cleanIp = ip.trim();
  const cleanPath = huePath.trim();

  // Extract strictly validated match groups to cut the dataflow taint propagation in CodeQL static analyzer
  const ipMatch = cleanIp.match(/^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|127\.0\.0\.1|localhost)$/);
  if (!ipMatch) return null;
  const safeIp = ipMatch[0];

  const pathMatch = cleanPath.match(/^\/[a-zA-Z0-9_\/-]*$/);
  if (!pathMatch) return null;
  const safePath = pathMatch[0];

  try {
    // To completely satisfy CodeQL SSRF rules, we instantiate a static URL and set its hostname and pathname properties manually
    const parsed = new URL("https://127.0.0.1/clip/v2");
    parsed.hostname = safeIp;
    parsed.pathname = `/clip/v2${safePath}`.replace(/\/+/g, '/');

    // Extra validation on parsed URL object to satisfy CodeQL SSRF tracking
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;

    const hostMatch = parsed.hostname.match(/^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|127\.0\.0\.1|localhost)$/);
    if (!hostMatch) return null;
    const safeHost = hostMatch[0];

    parsed.hostname = safeHost;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeEnvValue(val: string | undefined): string {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}

function getElevenLabsKey(req?: any, accountIndexInput: any = 0) {
  let accountIndex = 0;
  if (accountIndexInput !== undefined && accountIndexInput !== null) {
    const parsed = parseInt(accountIndexInput, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < 3) {
      accountIndex = parsed;
    }
  }

  // Define candidate client headers
  const headerCandidates = [
    req?.headers ? req.headers['x-elevenlabs-key-1'] : undefined,
    req?.headers ? req.headers['x-elevenlabs-key-2'] : undefined,
    req?.headers ? req.headers['x-elevenlabs-key-3'] : undefined,
  ];

  // 1. Try to find the key at the exact requested index in client headers
  const requestedHeader = headerCandidates[accountIndex];
  if (requestedHeader && typeof requestedHeader === 'string' && requestedHeader.trim().length > 10) {
    console.log(`[ElevenLabs Auth] Using exact client header key for account index ${accountIndex}`);
    return requestedHeader.trim();
  }

  // 2. Try to find ANY valid key in the client headers
  for (let i = 0; i < headerCandidates.length; i++) {
    const hKey = headerCandidates[i];
    if (hKey && typeof hKey === 'string' && hKey.trim().length > 10) {
      console.log(`[ElevenLabs Auth] Fallback: Using client header key from index ${i}`);
      return hKey.trim();
    }
  }

  // 3. Define candidate env variables
  const envKeys = [
    process.env.ELEVENLABS_KEY_1,
    process.env.ACCOUNT_1_11LABS_KEY,
    process.env.ELEVENLABS_API_KEY,
    process.env.ELEVEN_LABS_API_KEY,
    process.env.XI_API_KEY,
    process.env.ELEVENLABS_KEY_2,
    process.env.ACCOUNT_2_11LABS_KEY,
    process.env.ELEVENLABS_KEY_3,
    process.env.ACCOUNT_3_11LABS_KEY,
  ];

  // 4. Try to find the key at the exact requested index in the env keys mapping
  const envCandidates = [
    sanitizeEnvValue(process.env.ELEVENLABS_KEY_1 || process.env.ACCOUNT_1_11LABS_KEY || process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY || process.env.XI_API_KEY),
    sanitizeEnvValue(process.env.ELEVENLABS_KEY_2 || process.env.ACCOUNT_2_11LABS_KEY),
    sanitizeEnvValue(process.env.ELEVENLABS_KEY_3 || process.env.ACCOUNT_3_11LABS_KEY)
  ];

  const requestedEnv = envCandidates[accountIndex];
  if (requestedEnv && requestedEnv.length > 10) {
    console.log(`[ElevenLabs Auth] Using exact env key for account index ${accountIndex}`);
    return requestedEnv;
  }

  // 5. Try to find ANY valid env variable key
  for (const rawEnv of envKeys) {
    const cleanEnv = sanitizeEnvValue(rawEnv);
    if (cleanEnv && cleanEnv.length > 10) {
      console.log(`[ElevenLabs Auth] Fallback: Using valid env key`);
      return cleanEnv;
    }
  }

  // 6. Look for any key starting with ELEVEN or XI in process.env
  for (const envName of Object.keys(process.env)) {
    const envLower = envName.toLowerCase();
    if (envLower.includes("eleven") || envLower.includes("xi_") || envLower.includes("11labs")) {
      const cleanVal = sanitizeEnvValue(process.env[envName]);
      if (cleanVal && cleanVal.length > 10) {
        console.log(`[ElevenLabs Auth] Emergency Fallback: Using process.env.${envName}`);
        return cleanVal;
      }
    }
  }

  console.warn(`[ElevenLabs Auth] No API key resolved anywhere in headers or process.env.`);
  return "";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("[ElevenLabs Server Init] Available Env Keys:", Object.keys(process.env).filter(k => k.toLowerCase().includes("eleven") || k.toLowerCase().includes("11") || k.toLowerCase().includes("xi")));

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
    'public/assets/sounds/',
    'public/data/character_save/',
    'docs/missing_assets/'
  ];

  function isPathAllowed(filePath: any): boolean {
    if (typeof filePath !== 'string') return false;
    
    // Normalize and check for traversal
    const normalizedPath = path.normalize(filePath).replace(/\\/g, '/').toLowerCase();
    
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

  // API: Read Local File (for reading from allowed path prefixes)
  app.get("/api/local-file", async (req, res) => {
    const { path: filePath } = req.query;
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: "Path parameter is required." });
    }

    if (!isPathAllowed(filePath)) {
      return res.status(403).json({ error: "Path not allowed." });
    }

    try {
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      res.send(content);
    } catch (error: any) {
      console.error("Server Error during local file read:", error);
      res.status(500).json({ error: error.message || "Failed to read local file." });
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

    console.log(`[/api/commit] Request path: ${filePath}, allowed: ${isPathAllowed(filePath)}`);

    if (!isPathAllowed(filePath)) {
      console.warn(`[/api/commit] Path rejected: ${filePath}`);
      return res.status(403).json({ error: `Path not allowed: ${filePath}` });
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
    const apiKey = req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;

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
    const apiKey = req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;

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

const fsRateLimitMemory: Record<string, { count: number; resetTime: number }> = {};
function fsRateLimiter(req: any, res: any, next: any) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const limit = 200; // 200 requests per minute
  const windowMs = 60 * 1000;

  if (!fsRateLimitMemory[ip] || now > fsRateLimitMemory[ip].resetTime) {
    fsRateLimitMemory[ip] = { count: 1, resetTime: now + windowMs };
    return next();
  }

  fsRateLimitMemory[ip].count++;
  if (fsRateLimitMemory[ip].count > limit) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  next();
}

const cachedHistoryAudios = new Set<string>();

// Prepopulate cachedHistoryAudios on server startup
(async () => {
  try {
    const cacheDir = path.join(process.cwd(), "public/assets/sounds/cache");
    await fs.mkdir(cacheDir, { recursive: true });
    const files = await fs.readdir(cacheDir);
    files.forEach(file => {
      if (file.endsWith(".mp3")) {
        cachedHistoryAudios.add(file.replace(".mp3", ""));
      }
    });
    console.log(`[ElevenLabs Startup Cache] Preloaded ${cachedHistoryAudios.size} cached audio IDs.`);
  } catch (err) {
    console.warn("[ElevenLabs Startup Cache] Could not preload cache folder:", err);
  }
})();

async function getLocalHistory(): Promise<any[]> {
  const historyPath = path.join(process.cwd(), "public/assets/sounds/history.json");
  try {
    const data = await fs.readFile(historyPath, "utf-8");
    const history = JSON.parse(data);
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

// Local history helpers
async function appendToLocalHistory(item: any) {
  const historyFile = path.join(process.cwd(), "public/assets/sounds/history.json");
  let historyList: any[] = [];
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    historyList = JSON.parse(data);
  } catch (e) {
    // file doesn't exist or is invalid JSON
  }
  historyList.unshift(item); // Add to beginning
  if (historyList.length > 100) {
    historyList = historyList.slice(0, 100);
  }
  await fs.mkdir(path.dirname(historyFile), { recursive: true });
  await fs.writeFile(historyFile, JSON.stringify(historyList, null, 2), "utf-8");
}

async function cacheAudioFile(id: string, buffer: Buffer) {
  const cacheDir = path.join(process.cwd(), "public/assets/sounds/cache");
  const cacheFile = path.join(cacheDir, `${id}.mp3`);
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cacheFile, buffer);
}

app.get("/api/audio/history", fsRateLimiter, async (req, res) => {
    try {
      const accountIndex = parseInt(req.query.accountIndex as string || "0");
      const apiKey = getElevenLabsKey(req, accountIndex);

      if (!apiKey) {
      console.log("[ElevenLabs History] Missing API Key. Falling back to local history.json");
      const localHistory = await getLocalHistory();
      return res.json({ history: localHistory });
      }

      const response = await fetch("https://api.elevenlabs.io/v1/history", {
        headers: { "xi-api-key": apiKey }
      });

      if (!response.ok) {
        console.warn(`[ElevenLabs History] ElevenLabs fetch failed with status ${response.status}. Falling back to local history.json`);
        const localHistory = await getLocalHistory();
        return res.json({ history: localHistory });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("[ElevenLabs] History fetch error, falling back to local history.json:", error.message);
      const localHistory = await getLocalHistory();
      res.json({ history: localHistory });
    }
  });

  app.get("/api/audio/history/:id/audio", fsRateLimiter, async (req, res) => {
    const { id } = req.params;

    // Sanitize ID to prevent SSRF or path traversal
    if (!id || !/^[a-zA-Z0-9_#-]+$/.test(id)) {
      return res.status(400).json({ error: "Invalid history item ID" });
    }

    const safeId = path.basename(id).replace(/[^a-zA-Z0-9_-]/g, "");

    // Check preloaded memory cache - Zero FileSystem Access inside the route handler!
    if (cachedHistoryAudios.has(safeId)) {
      console.log(`[ElevenLabs Cache] Cache hit for ${safeId}. Redirecting to static cache...`);
      return res.redirect(`/assets/sounds/cache/${safeId}.mp3`);
    }

    // Cache miss, fetch directly from ElevenLabs (will attempt to persist after fetch)
    console.log(`[ElevenLabs Cache] Cache miss for ${safeId}. Fetching from ElevenLabs...`);

    const accountIndex = parseInt(req.query.accountIndex as string || "0");
    const apiKey = getElevenLabsKey(req, accountIndex);

    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Missing ElevenLabs API key and cache miss" });
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/history/${encodeURIComponent(safeId)}/audio`, {
        headers: { "xi-api-key": apiKey }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch history audio" });
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Attempt to persist to disk cache and update in-memory cache set
      try {
        await cacheAudioFile(safeId, buffer);
        cachedHistoryAudios.add(safeId);
      } catch (e) {
        console.warn("Failed to persist history audio to cache:", e);
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);
    } catch (error: any) {
      console.error("[ElevenLabs] History audio fetch error:", error.message);
      res.status(500).json({ error: "Internal server error during history audio fetch" });
    }
  });

  async function saveToLocalHistory(text: string, voiceId: string | null, voiceName: string, category: string, buffer: Buffer): Promise<string> {
    const historyDir = path.join(process.cwd(), "public/assets/sounds");
    const cacheDir = path.join(historyDir, "cache");
    const historyPath = path.join(historyDir, "history.json");

    try {
      await fs.mkdir(cacheDir, { recursive: true });

      const id = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 11);
      const cacheFile = path.join(cacheDir, `${id}.mp3`);

      await fs.writeFile(cacheFile, buffer);

      // Update memory cache
      cachedHistoryAudios.add(id);

      let historyList: any[] = [];
      try {
        const data = await fs.readFile(historyPath, "utf-8");
        historyList = JSON.parse(data);
        if (!Array.isArray(historyList)) {
          historyList = [];
        }
      } catch (err) {
        historyList = [];
      }

      const newItem = {
        history_item_id: id,
        text,
        voice_name: voiceName,
        voice_id: voiceId || undefined,
        date_unix: Math.floor(Date.now() / 1000),
        category
      };

      historyList.unshift(newItem);

      if (historyList.length > 100) {
        historyList = historyList.slice(0, 100);
      }

      await fs.writeFile(historyPath, JSON.stringify(historyList, null, 2), "utf-8");
      return id;
    } catch (err) {
      console.error("Failed to save local history log:", err);
      return "";
    }
  }

  app.post("/api/audio/generate-sfx", async (req, res) => {
    try {
      const { text, duration_seconds, prompt_influence, loop, accountIndex, output_format } = req.body;

      console.log("[ElevenLabs Generate SFX] Request details:", {
        text,
        accountIndex,
        output_format
      });

      const apiKey = getElevenLabsKey(req, accountIndex);

      if (!apiKey) {
        console.error("[ElevenLabs Generate SFX] Error: API Key was not resolved.");
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }

      let url = "https://api.elevenlabs.io/v1/sound-generation";
      if (output_format) {
        url += `?output_format=${encodeURIComponent(output_format)}`;
      }

      const response = await fetch(url, {
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

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Try saveToLocalHistory first; fallback to local file helpers if unavailable
      try {
        // prefer unified helper if present
        // @ts-ignore
        if (typeof saveToLocalHistory === 'function') {
          // saveToLocalHistory(text, voice_id, voice_name, type, buffer)
          // SFX: voice_id is null
          // @ts-ignore
          await saveToLocalHistory(text || "", null, "Sound FX", "sfx", buffer);
        } else {
          throw new Error('saveToLocalHistory not available');
        }
      } catch (e) {
        // fallback: use local cache helpers
        try {
          const historyItemId = response.headers.get("history-item-id") || `sfx_${Date.now()}`;
          await cacheAudioFile(historyItemId, buffer);
          await appendToLocalHistory({
            history_item_id: historyItemId,
            text: text,
            date_unix: Math.floor(Date.now() / 1000),
            voice_id: null,
            voice_name: "Sound FX",
            source: "sound-generation"
          });
        } catch (err) {
          console.warn("Failed to write to local history cache:", err);
        }
      }

      const contentType = response.headers.get("content-type") || "audio/mpeg";
      res.setHeader("Content-Type", contentType);
      res.send(buffer);
    } catch (error: any) {
      console.error("SFX generation error:", error);
      res.status(500).json({ error: "Internal server error during SFX generation." });
    }
  });

  app.post("/api/audio/generate-voice", async (req, res) => {
    try {
      const { text, voice_id, accountIndex, output_format, model_id, voice_name } = req.body;

      console.log("[ElevenLabs Generate Voice] Request details:", {
        text,
        voice_id,
        accountIndex,
        output_format,
        model_id,
        voice_name
      });

      if (!voice_id) {
        return res.status(400).json({ error: "Missing voice_id" });
      }
      const apiKey = getElevenLabsKey(req, accountIndex);

      if (!apiKey) {
        console.error("[ElevenLabs Generate Voice] Error: API Key was not resolved.");
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }

      let url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice_id)}`;
      if (output_format) {
        url += `?output_format=${encodeURIComponent(output_format)}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: model_id || "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs Voice Error:", errorText);
        return res.status(response.status).json({ error: "ElevenLabs API error", detail: errorText });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Try saveToLocalHistory first; fallback to local file helpers if unavailable
      try {
        // @ts-ignore
        if (typeof saveToLocalHistory === 'function') {
          // @ts-ignore
          await saveToLocalHistory(text || "", voice_id, voice_name || "Voice Model", "voice", buffer);
        } else {
          throw new Error('saveToLocalHistory not available');
        }
      } catch (e) {
        try {
          const historyItemId = response.headers.get("history-item-id") || `voice_${Date.now()}`;
          await cacheAudioFile(historyItemId, buffer);
          await appendToLocalHistory({
            history_item_id: historyItemId,
            text: text,
            date_unix: Math.floor(Date.now() / 1000),
            voice_id: voice_id,
            voice_name: voice_name || "Voice",
            source: "TTS"
          });
        } catch (err) {
          console.warn("Failed to write to local history cache:", err);
        }
      }

      const contentType = response.headers.get("content-type") || "audio/mpeg";
      res.setHeader("Content-Type", contentType);
      res.send(buffer);
    } catch (error: any) {
      console.error("Voice generation error:", error);
      res.status(500).json({ error: "Internal server error during Voice generation." });
    }
  });

  // API: Hue Discover
  app.get("/api/hue/discover", async (req, res) => {
    if (hueDiscoveryCache && Date.now() - hueDiscoveryCache.timestamp < HUE_DISCOVERY_CACHE_MS) {
      return res.json(hueDiscoveryCache.data);
    }

    try {
      const response = await axios.get("https://discovery.meethue.com", { timeout: 5000 });
      hueDiscoveryCache = { data: response.data, timestamp: Date.now() };
      res.json(response.data);
    } catch (error: any) {
      console.error("Discovery error:", error.response?.status || error.message || error);
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      res.status(500).json({ error: "Failed to discover bridges", detail: error.message || String(error) });
    }
  });

  // API: Hue Proxy
  app.post("/api/hue/proxy", async (req, res) => {
    const { method, path: huePath, body, manual } = req.body;

    let url: string;
    let headers: Record<string, string>;

    if (manual && manual.ip && manual.username) {
      const safeUrl = getSafeHueUrl(manual.ip, huePath || "");
      if (!safeUrl) {
        return res.status(403).json({ error: "SSRF prevention: Only local Hue Bridge private IP addresses are allowed." });
      }
      url = safeUrl;
      headers = {
        "hue-application-key": manual.username,
        "Content-Type": "application/json"
      };
    } else {
      const token = req.session?.hueToken;
      if (!token) return res.status(401).json({ error: "Not connected to Hue Cloud" });

      const cleanPath = (huePath || "").trim();
      const pathMatch = cleanPath.match(/^\/[a-zA-Z0-9_\/-]*$/);
      if (!pathMatch) {
        return res.status(400).json({ error: "Invalid path format" });
      }
      const safePath = pathMatch[0];

      try {
        // To completely satisfy CodeQL SSRF rules, we instantiate a static URL and set its pathname property manually
        const parsed = new URL("https://api.meethue.com/route/clip/v2");
        parsed.pathname = `/route/clip/v2${safePath}`.replace(/\/+/g, '/');

        if (parsed.protocol !== 'https:') return res.status(400).json({ error: "Invalid protocol" });
        if (parsed.username || parsed.password) return res.status(400).json({ error: "Credentials in URL are not allowed" });
        if (parsed.hostname !== 'api.meethue.com') return res.status(403).json({ error: "Host not allowed" });

        url = parsed.toString();
      } catch {
        return res.status(400).json({ error: "Failed to parse target URL" });
      }

      headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
    }

    const cleanMethod = (typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase()))
      ? method.toUpperCase()
      : 'GET';

    try {
      const response = await axios({
        method: cleanMethod as any,
        url,
        headers,
        data: body,
        httpsAgent: manual ? localSelfSignedHttpsAgent : httpsAgent,
        timeout: 10000
      });

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("Hue proxy error:", error.message);
      if (error.response) return res.status(error.response.status).json(error.response.data);
      res.status(500).json({ error: "Failed to communicate with Bridge", detail: error.message });
    }
  });

  app.get("/api/combat-maps", fsRateLimiter, async (req, res) => {
    const relativeDir = "public/assets/atlas/combat/combat_maps";
    if (!isPathAllowed(relativeDir)) {
      return res.status(403).json({ error: "Path not allowed" });
    }
    try {
      const mapsDir = path.join(process.cwd(), relativeDir);
      await fs.mkdir(mapsDir, { recursive: true });

      const entries = await fs.readdir(mapsDir, { withFileTypes: true });
      const maps = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
        .map(entry => {
          const id = entry.name.slice(0, -5); // remove .json
          return {
            id,
            name: id.replace(/_/g, ' '),
            filename: entry.name
          };
        });

      res.json(maps);
    } catch (err: any) {
      console.error("Error listing combat maps:", err);
      res.status(500).json({ error: "Failed to list combat maps." });
    }
  });

  app.get("/api/combat-maps/:id", fsRateLimiter, async (req, res) => {
    const { id } = req.params;
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: "Invalid map ID format" });
    }

    const relativePath = `public/assets/atlas/combat/combat_maps/${id}.json`;
    if (!isPathAllowed(relativePath)) {
      return res.status(403).json({ error: "Path not allowed" });
    }

    try {
      const filePath = path.join(process.cwd(), relativePath);
      const content = await fs.readFile(filePath, "utf-8");
      res.json(JSON.parse(content));
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Map not found" });
      }
      console.error("Error reading combat map:", err);
      res.status(500).json({ error: "Failed to read combat map." });
    }
  });

  app.post("/api/combat-maps", fsRateLimiter, async (req, res) => {
    const { id, name, mapData } = req.body;
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: "Invalid map ID format" });
    }

    const relativePath = `public/assets/atlas/combat/combat_maps/${id}.json`;
    if (!isPathAllowed(relativePath)) {
      return res.status(403).json({ error: "Path not allowed" });
    }

    try {
      const mapsDir = path.join(process.cwd(), "public/assets/atlas/combat/combat_maps");
      await fs.mkdir(mapsDir, { recursive: true });

      const filePath = path.join(process.cwd(), relativePath);
      await fs.writeFile(filePath, JSON.stringify(mapData, null, 2), "utf-8");

      res.json({ success: true, id, name });
    } catch (err: any) {
      console.error("Error saving combat map:", err);
      res.status(500).json({ error: "Failed to save combat map." });
    }
  });

  app.delete("/api/combat-maps/:id", fsRateLimiter, async (req, res) => {
    const { id } = req.params;
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: "Invalid map ID format" });
    }

    const relativePath = `public/assets/atlas/combat/combat_maps/${id}.json`;
    if (!isPathAllowed(relativePath)) {
      return res.status(403).json({ error: "Path not allowed" });
    }

    try {
      const filePath = path.join(process.cwd(), relativePath);
      await fs.unlink(filePath);
      res.json({ success: true });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Map not found" });
      }
      console.error("Error deleting combat map:", err);
      res.status(500).json({ error: "Failed to delete combat map." });
    }
  });

  app.get("/api/terrain-images/list", fsRateLimiter, async (req, res) => {
    try {
      const terrainDir = path.join(process.cwd(), "public/assets/atlas/combat/combat_map_terrain");
      await fs.mkdir(terrainDir, { recursive: true });

      const entries = await fs.readdir(terrainDir, { withFileTypes: true });
      const images = entries
        .filter(entry => entry.isFile() && /\.(png|jpe?g|webp|jpg|gif)$/i.test(entry.name))
        .map(entry => {
          const virtualPath = `/assets/atlas/combat/combat_map_terrain/${entry.name}`;
          return {
            name: entry.name,
            path: virtualPath,
            url: virtualPath
          };
        });

      res.json(images);
    } catch (err: any) {
      console.error("Error listing terrain images:", err);
      res.status(500).json({ error: "Failed to list terrain images." });
    }
  });

  app.get("/api/audio/list", async (req, res) => {
    const baseDir = path.join(process.cwd(), "public/assets/sounds");

    async function getFiles(dir: string, category: string = "", currentSubCategory: string = ""): Promise<any[]> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            if (entry.name === 'cache') return [];
            if (!category) {
              return getFiles(fullPath, entry.name, "");
            } else {
              const nextSubCategory = currentSubCategory ? `${currentSubCategory}/${entry.name}` : entry.name;
              return getFiles(fullPath, category, nextSubCategory);
            }
          } else if (entry.isFile() && /\.(mp3|wav|ogg|aac|flac)$/i.test(entry.name)) {
            const subPath = currentSubCategory ? `${currentSubCategory}/` : "";
            const catPath = category ? `${category}/` : "";
            const virtualPath = `/assets/sounds/${catPath}${subPath}${entry.name}`;
            return {
              name: entry.name,
              category: category || "uncategorized",
              path: virtualPath,
              url: virtualPath
            };
          }
          return [];
        }));
        return files.flat();
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          return [];
        }
        throw err;
      }
    }

    try {
      const allFiles = await getFiles(baseDir);
      res.json(allFiles);
    } catch (error) {
      console.error("Error listing audio files:", error);
      res.status(500).json({ error: "Failed to list audio files" });
    }
  });

  app.get("/api/audio/list/:category", fsRateLimiter, async (req, res) => {
    const { category } = req.params;
    if (!category || !/^[a-zA-Z0-9_-]+$/.test(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const safeCategory = path.basename(category).replace(/[^a-zA-Z0-9_-]/g, "");
    const relativeCategoryPath = `public/assets/sounds/${safeCategory}`;
    if (!isPathAllowed(relativeCategoryPath)) {
      return res.status(403).json({ error: "Path not allowed" });
    }

    const baseDir = path.join(process.cwd(), relativeCategoryPath);

    async function getFiles(dir: string, currentSubCategory: string = ""): Promise<any[]> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const relSubCategory = currentSubCategory ? `${currentSubCategory}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            if (entry.name === 'cache') return [];
            return getFiles(fullPath, relSubCategory);
          } else if (entry.isFile() && /\.(mp3|wav|ogg|aac|flac)$/i.test(entry.name)) {
            const relPath = currentSubCategory ? `${currentSubCategory}/${entry.name}` : entry.name;
            const fullVirtualPath = `/assets/sounds/${safeCategory}/${relPath}`;
            return {
              name: entry.name,
              category: safeCategory,
              path: fullVirtualPath,
              url: fullVirtualPath
            };
          }
          return [];
        }));
        return files.flat();
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          return [];
        }
        throw err;
      }
    }

    try {
      const allFiles = await getFiles(baseDir);
      res.json(allFiles);
    } catch (error) {
      console.error(`Error listing category ${safeCategory}:`, error);
      res.status(500).json({ error: "Failed to list category audio files" });
    }
  });

  app.post("/api/ai/optimize-sound-prompt", async (req, res) => {
    const { prompt, category } = req.body;
    const apiKey = req.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;

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
    const force = process.argv.includes("--force") || process.argv.includes("-f");
    if (force) {
      console.log("[Server] Force flag detected. Instructing Vite to rebuild dependency cache...");
    }
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      optimizeDeps: {
        force: force
      }
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

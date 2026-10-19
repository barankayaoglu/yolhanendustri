// dist/ klasörünü yerelde sunar (önizleme). Çalıştırma: node araclar/sun.mjs [port]  (varsayılan 5530)
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const TURLER = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

http.createServer(async (req, res) => {
  try {
    let yol = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (yol.endsWith("/")) yol += "index.html";
    const dosya = path.resolve(DIST, "." + yol);
    if (!dosya.startsWith(DIST + path.sep)) { res.writeHead(403).end(); return; }
    if (!(await stat(dosya)).isFile()) throw new Error("dosya değil");
    res.writeHead(200, { "Content-Type": TURLER[path.extname(dosya)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(dosya));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Bulunamadı");
  }
}).listen(Number(process.argv[2]) || 5530, "127.0.0.1");

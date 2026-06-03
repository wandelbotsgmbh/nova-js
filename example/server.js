// Tiny static file server for the built Vite SPA.
//
// Honours the runtime BASE_PATH so the app can be deployed under a prefix
// on NOVA OS. Falls back to index.html for SPA routes and serves a short
// list of common MIME types.
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { createServer } from "node:http"
import path from "node:path"

const PORT = Number(process.env.PORT || 3000)
const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/$/, "")
const ROOT = path.resolve("dist")

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
}

async function serveFile(res, filePath) {
  try {
    const st = await stat(filePath)
    if (!st.isFile()) return false
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": st.size,
    })
    createReadStream(filePath).pipe(res)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  let url = (req.url || "/").split("?")[0]
  if (BASE_PATH && url.startsWith(BASE_PATH)) {
    url = url.slice(BASE_PATH.length) || "/"
  }
  if (url === "/") url = "/index.html"

  // Prevent path traversal
  const filePath = path.join(ROOT, url)
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403)
    return res.end("Forbidden")
  }

  if (await serveFile(res, filePath)) return

  // SPA fallback
  if (await serveFile(res, path.join(ROOT, "index.html"))) return

  res.writeHead(404)
  res.end("Not found")
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}${BASE_PATH || ""}`)
})

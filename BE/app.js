import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { TaskStore, validateTask } from "./store.js";
import { seedTasks } from "./data/tasks.js";

const FE_DIR = fileURLToPath(new URL("../FE/", import.meta.url));
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "index.html" : pathname.slice(1);
  const normalizedPath = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(FE_DIR, normalizedPath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false;
  }
}

export function createApp({ store = new TaskStore(seedTasks) } = {}) {
  return async function app(request, response) {
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return json(response, 200, { status: "ok" });
      }

      if (request.method === "GET" && url.pathname === "/api/tasks") {
        const tasks = store.list({
          status: url.searchParams.get("status") || undefined,
          priority: url.searchParams.get("priority") || undefined,
          query: url.searchParams.get("q") || undefined
        });
        return json(response, 200, { tasks, total: tasks.length });
      }

      if (request.method === "POST" && url.pathname === "/api/tasks") {
        const input = await readJson(request);
        const errors = validateTask(input);
        if (errors.length) return json(response, 400, { errors });
        return json(response, 201, { task: store.create(input) });
      }

      const taskRoute = url.pathname.match(/^\/api\/tasks\/(\d+)$/);
      if (taskRoute && request.method === "PATCH") {
        const input = await readJson(request);
        const errors = validateTask(input, { partial: true });
        if (errors.length) return json(response, 400, { errors });

        const task = store.update(Number(taskRoute[1]), input);
        return task
          ? json(response, 200, { task })
          : json(response, 404, { error: "Không tìm thấy công việc" });
      }

      if (taskRoute && request.method === "DELETE") {
        return store.remove(Number(taskRoute[1]))
          ? json(response, 200, { message: "Đã xoá công việc" })
          : json(response, 404, { error: "Không tìm thấy công việc" });
      }

      if (!url.pathname.startsWith("/api/") && await serveStatic(url.pathname, response)) {
        return;
      }

      return json(response, 404, { error: "Không tìm thấy endpoint" });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return json(response, 400, { error: "JSON không hợp lệ" });
      }
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return json(response, 413, { error: "Dữ liệu gửi lên quá lớn" });
      }
      console.error(error);
      return json(response, 500, { error: "Lỗi máy chủ" });
    }
  };
}

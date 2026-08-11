import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, beforeEach, describe, test } from "node:test";
import { createApp } from "../app.js";
import { TaskStore } from "../store.js";

let server;
let baseUrl;
let store;

before(async () => {
  server = createServer((request, response) => createApp({ store })(request, response));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  store = new TaskStore([
    { id: 1, title: "Học Git", assignee: "An", priority: "high", status: "todo", createdAt: "2026-01-01T00:00:00.000Z" }
  ]);
});

describe("Task API", () => {
  test("GET /api/tasks trả về danh sách", async () => {
    const response = await fetch(`${baseUrl}/api/tasks`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.total, 1);
    assert.equal(body.tasks[0].title, "Học Git");
  });

  test("POST /api/tasks tạo công việc mới", async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Tạo pull request", assignee: "Bình", priority: "medium" })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.task.id, 2);
    assert.equal(body.task.status, "todo");
  });

  test("POST /api/tasks từ chối dữ liệu sai", async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x", priority: "urgent" })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.errors.length, 2);
  });

  test("PATCH /api/tasks/:id cập nhật trạng thái", async () => {
    const response = await fetch(`${baseUrl}/api/tasks/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.task.status, "done");
  });

  test("DELETE /api/tasks/:id trả về 404 khi không tồn tại", async () => {
    const response = await fetch(`${baseUrl}/api/tasks/999`, { method: "DELETE" });
    assert.equal(response.status, 404);
  });
});


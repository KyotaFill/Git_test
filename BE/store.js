const VALID_STATUSES = new Set(["todo", "doing", "done"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

export class TaskStore {
  constructor(initialTasks = []) {
    this.tasks = structuredClone(initialTasks);
    this.nextId = Math.max(0, ...this.tasks.map((task) => task.id)) + 1;
  }

  list({ status, priority, query } = {}) {
    const normalizedQuery = query?.trim().toLocaleLowerCase("vi") ?? "";

    return this.tasks.filter((task) => {
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      const searchableText = `${task.title} ${task.assignee}`.toLocaleLowerCase("vi");
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesStatus && matchesPriority && matchesQuery;
    });
  }

  create(input) {
    const task = {
      id: this.nextId++,
      title: input.title.trim(),
      assignee: input.assignee?.trim() || "Chưa phân công",
      priority: input.priority || "medium",
      status: "todo",
      createdAt: new Date().toISOString()
    };

    this.tasks.push(task);
    return task;
  }

  update(id, changes) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) return null;

    if (changes.title !== undefined) task.title = changes.title.trim();
    if (changes.assignee !== undefined) {
      task.assignee = changes.assignee.trim() || "Chưa phân công";
    }
    if (changes.priority !== undefined) task.priority = changes.priority;
    if (changes.status !== undefined) task.status = changes.status;

    return task;
  }

  remove(id) {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}

export function validateTask(input, { partial = false } = {}) {
  const errors = [];

  if (!partial || input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length < 3) {
      errors.push("Tiêu đề phải có ít nhất 3 ký tự");
    }
  }

  if (input.assignee !== undefined && typeof input.assignee !== "string") {
    errors.push("Người thực hiện phải là chuỗi");
  }
  if (input.status !== undefined && !VALID_STATUSES.has(input.status)) {
    errors.push("Trạng thái không hợp lệ");
  }
  if (input.priority !== undefined && !VALID_PRIORITIES.has(input.priority)) {
    errors.push("Độ ưu tiên không hợp lệ");
  }

  return errors;
}

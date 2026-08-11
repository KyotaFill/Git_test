const columns = [
  { status: "todo", title: "Cần làm" },
  { status: "doing", title: "Đang làm" },
  { status: "done", title: "Hoàn thành" }
];

const board = document.querySelector("#board");
const form = document.querySelector("#task-form");
const searchInput = document.querySelector("#search");
const priorityFilter = document.querySelector("#priority-filter");
const summary = document.querySelector("#summary");
const toast = document.querySelector("#toast");
const columnTemplate = document.querySelector("#column-template");
const taskTemplate = document.querySelector("#task-template");

let tasks = [];
let searchTerm = "";
let selectedPriority = "all";

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || body.errors?.join(", ") || "Có lỗi xảy ra");
  return body;
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function createTaskCard(task) {
  const fragment = taskTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".task-card");
  const priority = fragment.querySelector(".priority");

  card.dataset.id = task.id;
  fragment.querySelector("h3").textContent = task.title;
  fragment.querySelector(".assignee").textContent = task.assignee;
  fragment.querySelector(".avatar").textContent = initials(task.assignee);
  priority.textContent = { low: "Thấp", medium: "Vừa", high: "Cao" }[task.priority];
  priority.dataset.priority = task.priority;

  const statusSelect = fragment.querySelector(".status");
  statusSelect.value = task.status;
  statusSelect.addEventListener("change", async (event) => {
    try {
      await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: event.target.value })
      });
      await loadTasks();
      showToast("Đã cập nhật trạng thái");
    } catch (error) {
      event.target.value = task.status;
      showToast(error.message, "error");
    }
  });

  fragment.querySelector(".delete").addEventListener("click", async () => {
    if (!window.confirm(`Xoá “${task.title}”?`)) return;
    try {
      await api(`/api/tasks/${task.id}`, { method: "DELETE" });
      await loadTasks();
      showToast("Đã xoá task");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  return fragment;
}

function render() {
  board.replaceChildren();
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("vi");
  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.assignee}`
      .toLocaleLowerCase("vi")
      .includes(normalizedSearch);
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  for (const column of columns) {
    const fragment = columnTemplate.content.cloneNode(true);
    const columnElement = fragment.querySelector(".column");
    const columnTasks = visibleTasks.filter((task) => task.status === column.status);

    columnElement.dataset.status = column.status;
    fragment.querySelector("h2").textContent = column.title;
    fragment.querySelector(".count").textContent = columnTasks.length;
    const list = fragment.querySelector(".task-list");

    if (columnTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Chưa có công việc";
      list.append(empty);
    } else {
      columnTasks.forEach((task) => list.append(createTaskCard(task)));
    }

    board.append(fragment);
  }

  summary.textContent = `${visibleTasks.length} công việc · ${visibleTasks.filter((task) => task.status === "done").length} đã hoàn thành`;
}

async function loadTasks() {
  try {
    const data = await api("/api/tasks");
    tasks = data.tasks;
    render();
  } catch (error) {
    board.innerHTML = `<p class="load-error">Không tải được dữ liệu. Hãy kiểm tra server.</p>`;
    showToast(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    await api("/api/tasks", { method: "POST", body: JSON.stringify(data) });
    form.reset();
    form.elements.priority.value = "medium";
    await loadTasks();
    showToast("Đã thêm task mới");
  } catch (error) {
    showToast(error.message, "error");
  }
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  render();
});

priorityFilter.addEventListener("change", (event) => {
  selectedPriority = event.target.value;
  render();
});

loadTasks();

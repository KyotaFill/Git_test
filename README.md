# Git Team Task Board

Ứng dụng quản lý công việc nhỏ dành cho nhóm thực hành Git workflow. Project gồm giao diện Kanban bằng HTML/CSS/JavaScript và REST API chạy trên HTTP server của Node.js, không cần cài thêm package bên thứ ba.

## Yêu cầu

- [Node.js](https://nodejs.org/) 20 trở lên
- `curl` (nếu muốn thử API từ terminal)

Kiểm tra phiên bản Node.js:

```bash
node --version
```

## Chạy project

Clone repository và chuyển vào thư mục project:

```bash
git clone <URL_REPOSITORY>
cd Git_member_ha
```

Project không có dependency bên ngoài nên có thể chạy ngay, không cần `npm install`.

Chạy ở chế độ phát triển (server tự khởi động lại khi mã backend thay đổi):

```bash
npm run dev
```

Hoặc chạy bình thường:

```bash
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để sử dụng giao diện. Frontend và API được phục vụ trên cùng một địa chỉ.

Để dùng cổng khác, đặt biến môi trường `PORT`:

```bash
PORT=8080 npm start
```

Chạy test API:

```bash
npm test
```

> Dữ liệu được lưu trong bộ nhớ và sẽ trở về danh sách mẫu mỗi khi server khởi động lại.

## API

Base URL mặc định: `http://localhost:3000`

Tất cả response API đều có định dạng JSON. Với request có body, gửi header `Content-Type: application/json`.

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/health` | Kiểm tra trạng thái server |
| `GET` | `/api/tasks` | Lấy danh sách công việc; hỗ trợ lọc và tìm kiếm |
| `POST` | `/api/tasks` | Tạo công việc mới |
| `PATCH` | `/api/tasks/:id` | Cập nhật một phần công việc |
| `DELETE` | `/api/tasks/:id` | Xoá công việc |

### Cấu trúc task

```json
{
  "id": 1,
  "title": "Tạo repository cho team",
  "assignee": "An",
  "priority": "high",
  "status": "done",
  "createdAt": "2026-08-10T02:00:00.000Z"
}
```

| Thuộc tính | Kiểu | Quy tắc |
| --- | --- | --- |
| `id` | number | Server tự tạo |
| `title` | string | Bắt buộc khi tạo, ít nhất 3 ký tự sau khi loại bỏ khoảng trắng thừa |
| `assignee` | string | Không bắt buộc; mặc định là `Chưa phân công` |
| `priority` | string | Một trong `low`, `medium`, `high`; mặc định là `medium` |
| `status` | string | Một trong `todo`, `doing`, `done`; task mới luôn có trạng thái `todo` |
| `createdAt` | string | Thời điểm tạo theo định dạng ISO 8601, do server tự tạo |

### Kiểm tra server

```bash
curl http://localhost:3000/api/health
```

Response `200 OK`:

```json
{"status":"ok"}
```

### Lấy danh sách task

```bash
curl http://localhost:3000/api/tasks
```

Response `200 OK` có dạng:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Tạo repository cho team",
      "assignee": "An",
      "priority": "high",
      "status": "done",
      "createdAt": "2026-08-10T02:00:00.000Z"
    }
  ],
  "total": 1
}
```

Query parameters:

- `status`: lọc chính xác theo trạng thái (`todo`, `doing` hoặc `done`).
- `q`: tìm kiếm không phân biệt chữ hoa/thường trong tiêu đề và tên người thực hiện.

Ví dụ lấy các task đang thực hiện có chứa từ khoá `giao diện`:

```bash
curl --get http://localhost:3000/api/tasks \
  --data-urlencode "status=doing" \
  --data-urlencode "q=giao diện"
```

### Tạo task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Viết tài liệu API",
    "assignee": "Chi",
    "priority": "high"
  }'
```

Response `201 Created`:

```json
{
  "task": {
    "id": 4,
    "title": "Viết tài liệu API",
    "assignee": "Chi",
    "priority": "high",
    "status": "todo",
    "createdAt": "2026-08-12T03:00:00.000Z"
  }
}
```

`id` và `createdAt` trong response thực tế sẽ phụ thuộc vào dữ liệu và thời điểm gọi API.

### Cập nhật task

Chỉ cần gửi các thuộc tính muốn thay đổi (`title`, `assignee`, `priority` hoặc `status`):

```bash
curl -X PATCH http://localhost:3000/api/tasks/4 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "doing",
    "priority": "medium"
  }'
```

Response `200 OK` trả về task sau khi cập nhật:

```json
{
  "task": {
    "id": 4,
    "title": "Viết tài liệu API",
    "assignee": "Chi",
    "priority": "medium",
    "status": "doing",
    "createdAt": "2026-08-12T03:00:00.000Z"
  }
}
```

### Xoá task

```bash
curl -X DELETE http://localhost:3000/api/tasks/4
```

Response `200 OK`:

```json
{"message":"Đã xoá công việc"}
```

### Lỗi thường gặp

| Status | Ý nghĩa | Ví dụ response |
| --- | --- | --- |
| `400 Bad Request` | JSON hoặc dữ liệu đầu vào không hợp lệ | `{"errors":["Tiêu đề phải có ít nhất 3 ký tự"]}` |
| `404 Not Found` | Endpoint hoặc task không tồn tại | `{"error":"Không tìm thấy công việc"}` |
| `413 Payload Too Large` | Body lớn hơn 1 MB | `{"error":"Dữ liệu gửi lên quá lớn"}` |
| `500 Internal Server Error` | Lỗi không mong đợi ở server | `{"error":"Lỗi máy chủ"}` |

## Cấu trúc thư mục

```text
.
├── BE/                  # HTTP server, API, store và test
│   ├── data/tasks.js    # Dữ liệu mẫu
│   ├── tests/           # API tests
│   ├── app.js           # Router API và static file server
│   ├── server.js        # Entry point
│   └── store.js         # Lưu trữ và validation task
├── FE/                  # Giao diện Task Board
├── docs/                # Hướng dẫn Git workflow cho nhóm
└── package.json
```

Xem thêm quy ước đóng góp tại [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) và bài thực hành tại [docs/git-team-lab.md](docs/git-team-lab.md).

# Git Team Task Board

Project full-stack nhỏ để thực hành Git theo team. Ứng dụng cho phép tạo, lọc, cập nhật trạng thái và xoá công việc trên một bảng Kanban.

## Chạy project

Yêu cầu: Node.js 20 trở lên. Project không dùng package bên ngoài nên không cần `npm install`.

```bash
npm start
```

Mở <http://localhost:3000>. Khi sửa backend, có thể dùng chế độ tự khởi động lại:

```bash
npm run dev
```

Chạy test:

```bash
npm test
```

## Cấu trúc

```text
Git_team/
├── BE/                 # REST API Node.js và test
├── FE/                 # Giao diện HTML/CSS/JavaScript
├── docs/               # Hướng dẫn và bài thực hành Git
├── .gitignore
├── package.json
└── README.md
```

## API chính

| Method | Endpoint | Ý nghĩa |
| --- | --- | --- |
| `GET` | `/api/health` | Kiểm tra server |
| `GET` | `/api/tasks` | Lấy danh sách, hỗ trợ `status` và `q` |
| `POST` | `/api/tasks` | Tạo công việc |
| `PATCH` | `/api/tasks/:id` | Sửa công việc hoặc trạng thái |
| `DELETE` | `/api/tasks/:id` | Xoá công việc |

Muốn bắt đầu thực hành, đọc [docs/git-team-lab.md](docs/git-team-lab.md) và [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

# Git_test

# Quy ước làm việc nhóm

## Nhánh

- `main`: luôn chạy được, không code trực tiếp.
- `feature/<ten-ngan>`: tính năng mới, ví dụ `feature/dark-mode`.
- `fix/<ten-loi>`: sửa lỗi, ví dụ `fix/empty-title`.
- `docs/<ten-noi-dung>`: tài liệu.

## Commit

Dùng câu ngắn ở thể mệnh lệnh và chỉ chứa một thay đổi logic:

```text
feat: add task priority filter
fix: prevent empty assignee avatar
test: cover delete task endpoint
docs: explain conflict resolution
```

## Trước khi tạo Pull Request

```bash
git status
npm test
git fetch origin
git rebase origin/main
```

Pull Request nên nhỏ, có mô tả thay đổi, cách kiểm tra và ảnh chụp nếu sửa giao diện. Người viết code không tự merge trước khi có ít nhất một review.

## Khi có conflict

1. Đọc cả hai phía, không xoá vội code của đồng đội.
2. Trao đổi nếu không rõ ý đồ của thay đổi.
3. Sửa file, xoá các marker `<<<<<<<`, `=======`, `>>>>>>>`.
4. Chạy test rồi `git add <file>`.
5. Tiếp tục bằng `git rebase --continue` hoặc tạo merge commit.


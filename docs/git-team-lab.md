# Git Team Lab

Lab dành cho 2–4 người. Một người có thể luyện bằng hai thư mục clone khác nhau.

## 1. Khởi tạo lịch sử chung

Người A:

```bash
git add .
git commit -m "chore: initialize task board"
git remote add origin <URL_REPOSITORY_CUA_BAN>
git push -u origin main
```

Các thành viên còn lại dùng `git clone <URL>` và không chép source thủ công.

## 2. Chia feature độc lập

- Người A: nhánh `feature/filter-priority`, thêm bộ lọc độ ưu tiên ở frontend.
- Người B: nhánh `feature/edit-task`, thêm API và giao diện sửa tiêu đề.
- Người C: nhánh `test/task-filter`, thêm test cho query `status` và `q`.
- Người D: nhánh `docs/api-examples`, thêm ví dụ `curl` vào README.

Mỗi người thực hiện:

```bash
git switch main
git pull --ff-only
git switch -c feature/ten-feature
# sửa code, chạy npm test
git add <dung-file-lien-quan>
git commit -m "feat: mo ta thay doi"
git push -u origin HEAD
```

Sau đó tạo Pull Request, nhờ một người review và chỉ merge khi test pass.

## 3. Luyện review

Reviewer kiểm tra:

- Tính năng có đúng mô tả không?
- Có xử lý trường hợp lỗi/rỗng không?
- Tên biến và commit có dễ hiểu không?
- Có test tương ứng không?
- PR có vô tình chứa file không liên quan không?

Thử yêu cầu một thay đổi, để tác giả push commit mới lên cùng nhánh rồi approve.

## 4. Chủ động tạo conflict

1. Hai người cùng tạo nhánh từ `main`.
2. Cả hai sửa dòng subtitle trong `FE/index.html` theo hai cách khác nhau.
3. Merge PR của người A trước.
4. Người B cập nhật nhánh:

```bash
git fetch origin
git rebase origin/main
```

5. Cùng thảo luận nội dung cuối, giải quyết marker conflict, rồi:

```bash
git add FE/index.html
git rebase --continue
git push --force-with-lease
```

Luôn dùng `--force-with-lease` thay cho `--force` sau rebase để tránh ghi đè commit mới của người khác.

## 5. Luyện hoàn tác an toàn

Sau khi một commit lỗi đã được merge vào nhánh chung:

```bash
git log --oneline
git revert <commit-id>
git push
```

Không dùng `reset --hard` rồi force-push lên nhánh chung. `revert` tạo commit đảo ngược nên giữ được lịch sử và không làm hỏng nhánh của đồng đội.

## Checklist hoàn thành

- [ ] Mỗi người đã tạo ít nhất một feature branch.
- [ ] Mỗi Pull Request đã được người khác review.
- [ ] Team đã giải quyết một conflict có chủ đích.
- [ ] Test chạy xanh sau mỗi lần merge.
- [ ] Team đã thử `revert` một commit.
- [ ] Không ai commit trực tiếp lên `main` sau commit khởi tạo.


# HƯỚNG DẪN ONBOARDING DÀNH CHO AI AGENT CỦA CEO YẾN LÊ
> **Dự án**: TigerInvest (`tigerinvest.cloud`)
> **Hệ điều hành AI**: AI OS Ecosystem

Chào bạn (AI Agent của CEO Yến Lê), đây là tài liệu cấu hình và hướng dẫn bắt đầu để bạn có thể đồng bộ hóa ngữ cảnh và làm việc hiệu quả nhất với CEO Yến Lê trên dự án TigerInvest.

---

## 1. Nguyên tắc tối thượng (Rule Zero)
Bạn bắt buộc phải tuân thủ tài liệu **`NGUYEN_TAC_LAM_VIEC.md`** của hệ thống:
1.  **Luôn đọc file này đầu tiên**: Mỗi khi bắt đầu một phiên chat mới, bạn phải mở và đọc lại tài liệu nguyên tắc làm việc.
2.  **Trình bày trước, code sau**: Khi nhận yêu cầu viết code hoặc thay đổi file, tuyệt đối không được viết code ngay. Bạn phải trình bày **Kế hoạch triển khai (Implementation Plan)** trong khung chat và hỏi: *"Bạn có đồng ý thực hiện không?"*. Chỉ làm khi nhận được xác nhận "Có/Ok/Đồng ý" từ CEO.
3.  **An toàn dữ liệu**: Hỏi ý kiến rõ ràng trước khi xóa bất kỳ file nào. Tuyệt đối không tạo file tạm ngoài thư mục workspace.

---

## 2. Thiết lập Bộ nhớ dài hạn cho AI OS của Yến Lê
Để kích hoạt "Trí nhớ" dài hạn của bạn, hãy yêu cầu CEO tạo (hoặc bạn tự tạo) các file cấu hình sau trong thư mục `.agents/` của workspace TigerInvest:

### File 1: `.agents/USER.md` (Hồ sơ Sếp Yến Lê)
```markdown
# HỒ SƠ NGƯỜI DÙNG (USER PROFILE)

* **Họ tên**: Yến Lê
* **Vai trò**: CEO tại TigerInvest & Co-founder FinPeace.
* **Nhiệm vụ chính**: Vibe code và quản lý nội dung (content) cho hệ thống TigerInvest.
* **Phong cách giao tiếp**: Ngắn gọn, súc tích, phản hồi bằng tiếng Việt.
* **Yêu cầu cốt lõi**:
  - Tuân thủ quy trình lập kế hoạch trước khi code.
  - Tối ưu hóa SEO và cấu trúc trải nghiệm người dùng (UX) cho các trang content/marketing.
```

### File 2: `.agents/MEMORY.md` (Thông số hạ tầng hệ thống)
```markdown
# TRÍ NHỚ HỆ THỐNG (SYSTEM MEMORY)

## 1. Thông tin Dự án
* **Thương hiệu**: TigerInvest (`tigerinvest.cloud`)
* **Mục tiêu sản phẩm**: Nền tảng tư vấn đầu tư thông minh, quant trading, và quản lý tài sản số.

## 2. Thông tin Máy chủ & Deploy (Production)
* **Địa chỉ IP VPS**: `76.13.181.13` (Dùng chung server vật lý với FinPeace nhưng độc lập thư mục).
* **Đường dẫn thư mục chạy Web trên VPS**: `/home/tuananh/tigerinvest-web`
* **Cấu hình Nginx**: Lưu tại `/etc/nginx/sites-available/tigerinvest.cloud` (Đã cấu hình web tĩnh chạy cổng 80).
* **SSL/HTTPS**: Cấp qua Certbot (Let's Encrypt).

## 3. SSH key kết nối VPS
* **Khóa SSH**: Sử dụng SSH Key của hệ thống đã được cấu hình ủy quyền.
* **Lệnh kết nối nhanh**: 
  `ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no root@76.13.181.13`
```

### File 3: `.agents/AGENTS.md` (Luật khởi động hệ thống)
```markdown
# HƯỚNG DẪN HỆ THỐNG (SYSTEM INSTRUCTIONS)

## Nguyên tắc khởi động (Rule Zero)
Khi bắt đầu một phiên làm việc mới (New Session) hoặc đổi ngữ cảnh công việc, Agent BẮT BUỘC phải đọc các file sau trước khi thực hiện hành động tiếp theo:
1. NGUYEN_TAC_LAM_VIEC.md (Quy tắc giao tiếp & an toàn)
2. .agents/USER.md (Hồ sơ người dùng)
3. .agents/MEMORY.md (Trí nhớ hạ tầng hệ thống)
```

---

## 3. Hướng dẫn Deploy code lên Server cho Agent

Khi thực hiện cập nhật nội dung (content) hoặc code giao diện của TigerInvest:
1.  **Chạy thử nghiệm local**: Đảm bảo giao diện chạy mượt mà trên máy của CEO.
2.  **Đồng bộ lên VPS (Production)**: 
    *   Sử dụng lệnh `rsync` để đẩy mã nguồn tĩnh lên thư mục Web của VPS:
        ```bash
        rsync -avz --delete -e 'ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no' \
          ./ root@76.13.181.13:/home/tuananh/tigerinvest-web/
        ```
    *   *(Nếu sau này chuyển sang chạy Next.js/Node.js)*: Đẩy thư mục build `.next/` và restart tiến trình tương ứng trên PM2.
3.  **Reload Nginx (nếu sửa cấu hình server)**:
    ```bash
    ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no root@76.13.181.13 "nginx -t && systemctl reload nginx"
    ```

---

*Hãy nạp các thông tin này vào bộ nhớ của bạn để bắt đầu đồng hành cùng CEO Yến Lê xây dựng TigerInvest!*

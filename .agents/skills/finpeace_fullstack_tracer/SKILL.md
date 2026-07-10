---
name: finpeace_fullstack_tracer
description: "Kỹ năng truy vết, root-cause analysis, debug lỗi sâu trong kiến trúc Next.js App Router, SSR và Cấu hình Nginx/VPS."
---

# Mục Tiêu
Agent (Gemini) đóng vai trò là Kỹ Sư Hệ Thống / DevOps / Backend Lead. Skill này kích hoạt khi dự án `finpeace.cloud` sập nguồn, vướng lỗi Blank Screen, 500 Internal Server Error, hay các lỗi phức tạp liên quan tới Next.js Middleware.

# 1. Tư Duy Truy Vết (Root Cause Analysis)
Khi đối mặt với Bug hệ thống, Agent không vội Vã sửa code rác. Phải theo quy trình:
1. **Kiểm Tra Điểm Cuối (End-point Check):** Kiểm tra log Nginx (nếu là lỗi 400, 502) qua lệnh `tail -n 50 /var/log/nginx/error.log`.
2. **Xác Minh PM2:** Đọc log tiến trình gốc Next.js `pm2 logs finpeace-web`.
3. **Phân Tích Dấu Vết (Stack Trace):** 
   - Nếu là lỗi `Minified React error` (Cannot access variables, Hydration failed), đích thị do lỗi SSR của Turbopack. Giải quyết bằng cách bọc `useMemo`, `useCallback` hoặc ép sang Component `useEffect` Client-side.
   - Nếu lỗi `ERR_TOO_MANY_REDIRECTS`, đích thị do Middleware Auth vòng lặp. Phải đọc `src/utils/supabase/middleware.ts` liền.

# 2. Xử Lý Kiến Trúc Next.js App Router & Supabase Auth
- Luôn cẩn trọng với các thẻ `<Cookie>` của thư viện `@supabase/ssr`. 
- Ghi nhớ: Khi hệ thống dồn ứ Cookie trên trình duyệt khách, nó sẽ văng Lỗi `400 Bad Request Header Too Large`. Khi đó, cấu hình tản nhiệt của Nginx cần được nới rộng `large_client_header_buffers 4 32k;` và người dùng phải xóa Cache cục bộ.

# 3. Kỹ Thuật Đề Xuất Giải Pháp
- Agent luôn phải giải trình TẠI SAO nó chết trước khi đưa ra mã sửa đổi.
- Khi sửa đổi, ưu tiên dùng `replace_file_content` sửa chính xác dòng lỗi thay vì viết lại nguyên file 500 dòng làm sập cấu trúc.
- Sau khi fix, luôn nhắc người dùng Chạy Lệnh Build (Local hoặc trên VPS) để Compiler Type-Check lại một lần nữa. Không bao giờ tin tưởng mù quáng vào code JS vừa gõ.

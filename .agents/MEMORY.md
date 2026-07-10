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

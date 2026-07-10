---
description: Quy trình chụp đồ thị chứng khoán theo cách của User
---
# Cách chụp đồ thị chứng khoán (User's Method)

Quy trình này áp dụng cho bảng giá VNDIRECT để lấy dữ liệu lịch sử dài hạn.

1. Truy cập: `https://banggia.vndirect.com.vn/thong-tin-thi-truong/bieu-do-ky-thuat/[SYMBOL]`
2. Chọn khung thời gian **W** (Weekly/Tuần) ở góc trên bên trái biểu đồ.
3. Di chuột vào vùng giữa biểu đồ giá.
4. Sử dụng con lăn chuột (scroll down) để thu nhỏ (zoom out) và kéo dài dữ liệu về quá khứ.
5. Chụp ảnh màn hình khu vực đồ thị.

// turbo
Để thực hiện lệnh này cho bất kỳ mã nào, hãy gõ: `/chart_user [SYMBOL]`

## Nguyên tắc Phân tích (Học từ User)
Phân tích đồ thị theo sơ đồ **Lồng ghép (Nesting)**:
- **Cấp độ Lớn (Mũi tên Xanh):** Là "đại lộ" chính. Chéo là Trending, Ngang là Sideway. Đây là khung xương quy định xu hướng dài hạn.
- **Cấp độ Trung bình (Mũi tên Vàng):** Là các "con đường" bên trong đại lộ.
    - Trong Trending xanh có thể có nhiều sóng vàng nối tiếp nhau.
    - Trong Sideway xanh có thể có các sóng vàng Trending lên và xuống (nhưng tổng thể chưa thoát khỏi đường ngang xanh).
- **Tương xứng Diện tích (Purple Box - Log Chart):** Trên biểu đồ Log, các vùng thuộc cùng một cấp độ sóng phải có diện tích (Biên độ Giá x Độ dài Thời gian) tương xứng nhau. Sóng biên độ càng lớn thì thời gian điều chỉnh/đi ngang tương ứng càng phải dài để cân bằng năng lượng.

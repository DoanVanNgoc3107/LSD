# LSD — Ôn tập Lịch sử Đảng

Ứng dụng web học **trắc nghiệm** (100 câu) và **tự luận** (10 câu từ file `LSD.pdf`).

## Chạy ứng dụng

Mở `index.html` trong trình duyệt (hoặc dùng Live Server).

## Tự luận — 5 chế độ học thuộc

| Chế độ | Mô tả |
|--------|--------|
| **Đọc Đáp Án** | Xem từng đoạn đáp án, làm quen trước khi ghi nhớ chủ động |
| **Ghép Từng Câu** | Sắp xếp đúng thứ tự **tất cả** từ trong từng đoạn |
| **Điền Khuyết** | Điền từ bị ẩn từ ngân hàng từ (chỉ gồm từ trong đáp án gốc) |
| **Ôn Chủ Động** | Nhớ trong đầu rồi tự chấm — lặp lại ngắt quãng (Leitner) |
| **Thuộc Lòng** | Ghép lần lượt toàn bộ đoạn của đáp án, mục tiêu 100% từ đúng |

## Cập nhật dữ liệu từ PDF

```bash
python scripts/extract_essays.py
```

Nguồn PDF: `C:\Users\ngoc1\Documents\LSD.pdf`

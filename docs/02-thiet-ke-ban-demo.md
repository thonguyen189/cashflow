# Thiết kế bản demo — "Dòng Tiền"

> Đây là bản demo để **thảo luận và chốt**, không phải bản cuối.
> Ngày dựng: 2026-08-06.

---

## 1. Các quyết định đã chốt cùng bạn

| Quyết định | Lựa chọn |
|---|---|
| Nền tảng | Web, chạy hoàn toàn trên trình duyệt, không cần server |
| Số người chơi | Một người |
| Độ dài ván | Chơi đến khi đạt mục tiêu, tối đa 50 năm |
| Tham số cân bằng | Nằm trong file config cho dev sửa |
| Stack | React + TypeScript + Vite |
| Kiến trúc | Lõi thuần `(state, action) => state`, React chỉ làm vỏ |
| Bối cảnh | Việt Nam, đơn vị VNĐ |
| Mỹ thuật | Typography + màu + emoji, không dùng ảnh riêng |
| Cải tiến so với bản gốc | Bảng tài chính + lịch sử năm · tự động lưu ván · cảnh báo rõ khi từ chối thẻ · trần và lợi ích giảm dần cho hạnh phúc |

---

## 2. Những gì đã có trong demo

**Vòng lặp năm hoàn chỉnh:** trả chi phí → chuỗi thẻ tiêu dùng → hành động tự do →
kết thúc năm → tổng kết → năm tiếp theo.

**Các hệ thống:**
- 3 nghề nghiệp có đánh đổi thật (xem mục 4)
- 5 loại tài sản đầu tư với cơ chế cổng chặn theo mức giàu
- 5 bậc giáo dục, tăng lương vĩnh viễn
- Bảo hiểm y tế hiệu lực một năm
- 3 món ước nguyện, một trong đó là khát vọng gắn với nghề
- Vay ngân hàng 1–5 năm, trần theo 50% lương
- 6 cơ hội kinh doanh (4 góp vốn + 2 canh bạc)
- 4 loại sự kiện: lạm phát, ốm đau, sinh con, thưởng Tết
- Tab Sổ sách: dòng tiền, tài sản, nghĩa vụ, lịch sử từng năm

**Chất lượng:** 46 test tự động, trong đó 6 test mô phỏng cân bằng chạy 30 ván
cho mỗi nghề. Toàn bộ đều xanh.

---

## 3. Cơ chế cốt lõi: thẻ tiêu dùng hai chiều

Mỗi năm rút 4–5 thẻ. Mỗi thẻ ghi giá và số điểm `N`:

- Nhận → mất tiền, **+N** hạnh phúc
- Từ chối → giữ tiền, **−N** hạnh phúc

Chênh lệch giữa hai lựa chọn là **2N**. Tỉ lệ đồng trên mỗi điểm chênh nhau tới
**45 lần** giữa các thẻ (từ 167 nghìn tới 7,5 triệu mỗi điểm), nên việc chọn thẻ
nào để nhận là quyết định thật.

Khác bản gốc: giao diện **nói thẳng** là từ chối sẽ mất bao nhiêu điểm. Bản gốc giấu
điều này khiến người chơi mới chết oan.

---

## 4. Cân bằng — số liệu từ mô phỏng

Bot chơi theo chiến lược hợp lý, 30 ván mỗi nghề:

| Nghề | Lương | Chi phí | Thặng dư | Tỉ lệ thắng | Số năm trung bình |
|---|---|---|---|---|---|
| Giáo viên | 180 tr | 108 tr | 72 tr (40%) | 73% | 21,7 (nhanh nhất 16) |
| Bác sĩ | 360 tr | 240 tr | 120 tr (33%) | 80% | 13,5 (nhanh nhất 10) |
| Kỹ sư phần mềm | 600 tr | 435 tr | 165 tr (28%) | 77% | 9,1 (nhanh nhất 7) |

Ba nghề đều thắng được nhưng nhịp độ rất khác nhau — đúng ý đồ thiết kế.

### Hai lỗi cân bằng mà mô phỏng đã bắt được

**1. Lương không bám lạm phát → nghề lương thấp bất khả thi.**
Ban đầu chi phí lạm phát 3–9%/năm còn lương chỉ tăng 1–4%. Sau 20 năm chi phí của
giáo viên vượt lương, thặng dư âm, tỉ lệ thắng **0%**. Đã sửa: lương tăng bằng
lạm phát cộng 0–2,5% tăng thực. Tỉ lệ thắng lên 73%.

**2. Tiêu hoang không hề tệ hơn tiêu dè sẻn — hoá ra lại là cơ chế hay.**

| Nghề | Tiêu chọn lọc | Tiêu hoang |
|---|---|---|
| Giáo viên | 73% thắng · 21,7 năm | **100%** thắng · 28,6 năm |
| Bác sĩ | 80% thắng · 13,5 năm | **100%** thắng · 15,3 năm |

Tiết kiệm thì về đích **nhanh hơn nhưng có rủi ro chết vì hạnh phúc**; tiêu rộng tay
thì **an toàn tuyệt đối nhưng chậm**. Hai lối chơi đều hợp lệ. Tôi giữ nguyên vì đây
là đánh đổi rủi ro/tốc độ lành mạnh, nhưng nếu bạn muốn ép người chơi phải tính toán
sát hơn thì có thể siết lại.

---

## 5. Những điểm cần bạn quyết

1. **Mục tiêu 10 tỷ và trần 50 năm** có hợp lý không? Hiện ván nhanh nhất 7 năm,
   chậm nhất 28 năm. Nếu muốn ván ngắn hơn thì hạ mục tiêu.
2. **Tỉ lệ thắng 73–80% có quá dễ không?** Có thể siết bằng cách tăng biên độ lạm phát,
   giảm lợi tức tài sản, hoặc tăng xác suất sự kiện xấu.
3. **Số liệu bối cảnh Việt Nam** đã sát thực tế chưa — lương, giá vàng, giá căn hộ,
   học phí? Tôi đặt theo ước lượng, bạn rà lại sẽ chuẩn hơn.
4. **Nội dung thẻ tiêu dùng** hiện có 20 thẻ. Cần thêm cho đỡ lặp không?
5. **Cân bằng tiêu hoang vs tiết kiệm** — giữ nguyên hay siết lại?
6. **Còn thiếu so với bản gốc:** sự kiện Ngân hàng Trung ương đổi lãi suất
   (bản gốc có nhắc nhưng bị paywall chặn nên chưa quan sát được). Có cần không?

---

## 6. Việc chưa làm

- Chưa có màn hình hướng dẫn cách chơi trong game
- Chưa có âm thanh, hoạt hình chuyển cảnh
- Chưa tối ưu cho màn hình rộng (hiện thiết kế cho khổ dọc, tối đa 560px)
- Chưa có nút hoàn tác cho giao dịch lỡ tay
- Bảo hiểm mới có một loại; bản gốc gợi ý còn bảo hiểm xe/nhà mở khoá theo tài sản

# Dòng Tiền

Game mô phỏng tài chính cá nhân, chơi trên trình duyệt, một người chơi.
Mỗi lượt là một năm: vừa tích luỹ tài sản, vừa giữ đủ hạnh phúc để đi tiếp.

- **Thắng:** đạt mục tiêu tài sản (mặc định 10 tỷ) — không giới hạn số năm.
  Thắng rồi vẫn có thể chọn **chơi tiếp** để sống trọn hành trình tới tuổi 100.
- **Thua:** để hạnh phúc rơi xuống dưới 50 lúc kết thúc năm
- **Viên mãn:** đi trọn hành trình tới tuổi 100 — ván khép lại bằng một kết thúc
  riêng, nhìn lại cả cuộc đời

## Cốt truyện trăm năm

Nhân vật bắt đầu năm 1 ở tuổi 21. Các cột mốc đời người được hẹn lịch ngay khi
tạo ván (tất định theo seed) và tự diễn ra khi tới năm đó:

- **Cưới** (tuổi 26–32): tốn một năm chi phí sinh hoạt, cộng hạnh phúc; từ đó
  bạn đời góp 25% lương của bạn mỗi năm, đổi lại chi phí gia đình tăng 20%.
- **Hai con** lần lượt chào đời sau đám cưới: mỗi con đang nuôi cộng thêm 25%
  chi phí cố định; con 18 tuổi thì đóng học phí **đại học** một lần; con 22 tuổi
  thì **tự lập**, chi phí gia đình nhẹ hẳn đi.
- **Lên chức ông bà** khi con tròn 30 tuổi.
- **Nghỉ hưu** tuổi 60: lương còn 45% và từ đó chỉ tăng theo lạm phát; không còn
  khoá học, thưởng Tết hay thăng chức; xác suất ốm đau tăng dần theo tuổi.
- **Tuổi già có giá của nó:** phí bảo hiểm leo theo tuổi, và từ tuổi 70 bảo hiểm
  chỉ còn chi trả 70% viện phí — phần còn lại người chơi tự gánh. Xen giữa là
  những chuyện đời thường của tuổi già: bạn cũ ra đi, cháu về chơi, họp lớp.
- **Mừng thọ** tuổi 70, 80, 90: con cháu quây quần, thưởng hạnh phúc.
- Qua tuổi **100**: ván kết thúc viên mãn.

Thẻ tiêu dùng cũng đổi theo giai đoạn đời: có thẻ chỉ xuất hiện khi đã lập
gia đình, khi đang nuôi con nhỏ, hoặc khi đã sang tuổi già.

Trên đường tới đích 10 tỷ có các **mốc tài sản trung gian** (1 tỷ · 2,5 tỷ ·
5 tỷ) — chạm mỗi mốc lần đầu được ghi nhận thành sự kiện và thưởng hạnh phúc,
để ván chơi dài luôn có cảm giác tiến bộ.

Hai điểm tựa tài chính đáng chú ý:

- **Ngân hàng:** lãi vay 8% mỗi năm, kỳ hạn tối đa 10 năm — vay để mua cơ hội
  kinh doanh trở thành quyết định cân não thật sự.
- **Ước nguyện:** giá được khoá ngay từ đầu ván, không leo theo lạm phát —
  giấc mơ không chạy nhanh hơn khả năng tích luỹ của người chơi.

## Chạy

```bash
npm install
npm run dev        # mở http://localhost:5173
```

```bash
npm test           # logic engine + định dạng + mô phỏng cân bằng
npm run build      # build ra thư mục dist/, mở bằng file:// cũng chạy
```

## Chỉnh độ khó

Toàn bộ số liệu cân bằng nằm trong **[src/game/config.ts](src/game/config.ts)** — mục tiêu
tài sản, ngưỡng hạnh phúc, biên độ lạm phát, lãi vay, xác suất sự kiện.

Nội dung game (nghề nghiệp, thẻ tiêu dùng, khoá học, tài sản, cơ hội kinh doanh)
nằm trong **[src/game/content.ts](src/game/content.ts)**.

Sau khi sửa số, chạy `npm test`. Bộ test cân bằng sẽ mô phỏng 30 ván cho mỗi nghề
và báo đỏ nếu game trở nên bất khả thi hoặc quá dễ.

## Cấu trúc

```
src/game/          lõi thuần, không phụ thuộc React — test được độc lập
  types.ts         kiểu dữ liệu trạng thái và action
  config.ts        bảng cân bằng (dev chỉnh ở đây)
  content.ts       nội dung: nghề, thẻ, khoá học, tài sản, cơ hội
  engine.ts        reducer thuần (state, action) => state + hàm dẫn xuất
  sim.ts           bot tự chơi, dùng để kiểm tra cân bằng
  format.ts        định dạng tiền kiểu Việt Nam, không viết tắt (12,5 tỷ · 350 triệu)
  luu.ts           tự động lưu ván vào localStorage
src/ui/            các component React, chỉ hiển thị và phát action
```

Trạng thái game là một object bất biến duy nhất, mọi chuyển đổi là hàm thuần.
Nhờ vậy việc lưu ván chỉ là `JSON.stringify(state)`, và toàn bộ toán kinh tế
kiểm thử được mà không cần dựng DOM.

## Ghi chú

Game này được viết lại từ đầu sau khi phân tích cơ chế của một app cùng thể loại
(xem [docs/01-phan-tich-game-goc.md](docs/01-phan-tich-game-goc.md)). Luật chơi và
công thức không được bảo hộ bản quyền; toàn bộ văn bản, số liệu, nội dung thẻ bài
và giao diện ở đây là nguyên bản.

# Dòng Tiền

Game mô phỏng tài chính cá nhân, chơi trên trình duyệt, một người chơi.
Mỗi lượt là một năm: vừa tích luỹ tài sản, vừa giữ đủ hạnh phúc để đi tiếp.

- **Thắng:** đạt mục tiêu tài sản (mặc định 10 tỷ) — không giới hạn số năm
- **Thua:** để hạnh phúc rơi xuống dưới 50 lúc kết thúc năm

## Chạy

```bash
npm install
npm run dev        # mở http://localhost:5173
```

```bash
npm test           # 53 test: logic engine + định dạng + mô phỏng cân bằng
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

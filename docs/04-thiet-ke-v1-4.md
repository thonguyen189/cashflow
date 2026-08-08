# Thiết kế bản v1.4 — Tự do tài chính thay cho con số 10 tỷ

Ngày chốt: 08/08/2026. Bản này thay điều kiện thắng của game: từ **đạt mục tiêu tài
sản 10 tỷ** sang **đạt tự do tài chính**, và gắn cột mốc tài sản vào nghề nghiệp.

## Vì sao phải đổi

Ba vấn đề của `mucTieuTaiSan: 10 * TY` ở các bản trước:

**1. Số danh nghĩa, không chống lạm phát.** Mục tiêu cố định trong khi lạm phát 3–9%
mỗi năm và ván có thể kéo tới 80 năm. Hệ quả là nghề về đích chậm được giảm giá vé:
kỹ sư thắng quanh năm thứ 9 (chỉ số giá ≈ 1,6) phải gom lượng của cải tương đương
6,3 tỷ tiền năm đầu, còn giáo viên thắng quanh năm thứ 22 (chỉ số giá ≈ 3,4) chỉ cần
2,9 tỷ. Cùng một dòng chữ "10 tỷ" nhưng độ khó thật chênh nhau hơn hai lần.

**2. Game tên là "Dòng Tiền" nhưng luật chơi đo tổng tài sản.** Tự do tài chính đúng
nghĩa là dòng tiền thụ động đủ nuôi chi phí sống. Nguyên liệu đã có sẵn trong code —
thu nhập doanh nghiệp, lợi tức trái phiếu, cổ tức, tiền thuê bất động sản — nhưng
điều kiện thắng không đụng tới con số nào trong đó. Gom vàng và tiền mã hoá (hai kênh
không sinh một đồng dòng tiền nào) thắng ngang bằng với người kiên nhẫn xây dòng
tiền. Chính chiến lược mà cái tên game cổ vũ lại không được thưởng.

**3. Thắng xong là hết mục tiêu tài chính.** Sau khi đạt đích, thanh tiến độ chuyển
sang đếm tuổi; sáu tới tám chục năm còn lại không còn cột mốc tiền bạc nào.

Đích dòng tiền giải quyết luôn cả ba: chi phí sống đã leo theo lạm phát nên mục tiêu
tự neo giá, và vì mỗi nghề một mức chi phí nên mục tiêu tự khác nhau theo nghề.

---

## A. Điều kiện thắng mới

```
dòngTiềnThụĐộng(s)  ≥  nghĩaVụHàngNăm(s) × heSoAnToan
```

Kiểm tra tại thời điểm bấm **Kết thúc năm**, sau khi `chuyenNam` đã chạy — giống hệt
chỗ luật cũ xét mục tiêu tài sản. Chạm là thắng, không cần duy trì nhiều năm.

### Vế trái — `dongTienThuDong(s)`

Thu nhập nền của các doanh nghiệp đã góp vốn (`thuNhapThuDong` sẵn có) cộng lợi tức
**kỳ vọng** của danh mục đầu tư:

| Kênh | `loiTucMin`–`loiTucMax` | Lợi tức kỳ vọng |
|---|---|---|
| 🏦 Trái phiếu & tiền gửi | 5%–7% | 6% |
| 📈 Cổ phiếu | 0%–6% | 3% |
| 🥇 Vàng | 0%–0% | **0%** |
| ⚡ Tiền mã hoá | 0%–0% | **0%** |
| 🏢 Bất động sản | 4%–7% | 5,5% |

Dùng mức kỳ vọng chứ không phải số thực nhận của năm đó là quyết định có chủ đích:
con số đứng yên cho người chơi lên kế hoạch, và việc thắng hay chưa không được phép
nhảy qua lại theo may rủi cổ tức.

Hệ quả cố ý: vàng và tiền mã hoá không mua nổi tự do, dù vẫn là kênh làm giàu và trú
ẩn tốt. Đây là bài học tài chính chính của bản này.

### Vế phải — `nghiaVuHangNam(s)`

```
chiPhiHangNam + phiBaoHiem(s) + traNoMoiNam(s)
```

Hai quyết định đáng ghi lại:

- **Phí bảo hiểm y tế tính cả trong năm chưa mua.** Tự do tài chính mà bỏ bảo hiểm
  thì là tự do giả, và nếu miễn khoản này thì "nhịn bảo hiểm" sẽ thành mẹo thắng sớm.
- **Trả nợ vào vế này.** Nếu không, vay kịch trần (50% lương, kỳ hạn 10 năm) mua
  doanh nghiệp sinh lời 20% sẽ là con đường tắt tới chiến thắng trong khi người chơi
  đang gánh một cục nợ mười năm.

### Hệ số an toàn — `CONFIG.tuDoTaiChinh.heSoAnToan = 1.5`

Vì dòng tiền tính theo mức kỳ vọng mà thực nhận thì dao động mạnh (quán cà phê có năm
âm 35%, cổ tức có năm bằng 0), đòi đúng 100% kỳ vọng nghĩa là cứ hai năm lại hụt một
năm. Đệm 50% vừa đủ để năm xấu nhất của một doanh nghiệp vẫn không làm người chơi
phải đi làm lại.

Mô phỏng cho thấy hệ số này điều chỉnh **nhịp độ**, không phải tỉ lệ thắng:

| Hệ số | Giáo viên | Bác sĩ | Kỹ sư phần mềm |
|---|---|---|---|
| 1,0 | 93% · 14,4 năm | 100% · 11,3 năm | 90% · 9,0 năm |
| 1,5 | 93% · 17,5 năm | 100% · 14,0 năm | 90% · 11,7 năm |
| 2,0 | 93% · 19,8 năm | 100% · 16,0 năm | 90% · 13,9 năm |

Tỉ lệ thắng đứng yên vì dưới luật mới, thua chỉ đến từ hạnh phúc — ai sống sót đủ lâu
thì sớm muộn cũng gây dựng được dòng tiền.

---

## B. Cột mốc tài sản theo nghề

Không còn là điều kiện thắng, chỉ là huy hiệu ghi nhận đường đi. Công thức duy nhất:

```
mốc cao nhất = chi phí sinh hoạt gốc của nghề × 25 × chỉ số giá
các mốc      = 10% · 25% · 50% · 100% của mốc cao nhất, làm tròn tới 100 triệu
```

Con số 25 là mặt kia của quy tắc rút 4%. Kết quả tại mặt bằng giá năm 1:

| Nghề | Chi phí gốc | Mốc 1 | Mốc 2 | Mốc 3 | Mốc cao nhất |
|---|---|---|---|---|---|
| 📚 Giáo viên | 108 triệu | 300 triệu | 700 triệu | 1,4 tỷ | 2,7 tỷ |
| 🩺 Bác sĩ | 240 triệu | 600 triệu | 1,5 tỷ | 3 tỷ | 6 tỷ |
| 💻 Kỹ sư phần mềm | 435 triệu | 1,1 tỷ | 2,7 tỷ | 5,4 tỷ | 10,9 tỷ |

Con số 10 tỷ của các bản trước hoá ra vốn là mốc của riêng kỹ sư phần mềm; hai nghề
kia lâu nay bị bắt leo cột của người giàu nhất.

**Ghi nhận theo chỉ số mốc, không theo số tiền.** `mocTaiSanDaQua` đổi từ mảng số
tiền sang mảng chỉ số `0..3`. Vì giá trị mỗi mốc leo theo chỉ số giá từng năm, lưu số
tiền sẽ khiến mốc cũ được trao đi trao lại.

---

## C. Chữ ký hàm mới trong `engine.ts`

```ts
loiTucKyVong(ts: TaiSan): number
dongTienThuDong(s: GameState): Tien
nghiaVuHangNam(s: GameState): Tien
mucTieuTuDo(s: GameState): Tien          // nghĩa vụ × hệ số an toàn
daTuDoTaiChinh(s: GameState): boolean
tienDoTuDo(s: GameState): number         // 0..1
nghiaVuNamDau(nghe: Nghe): Tien          // cho màn chọn nghề, chưa có ván
mocTaiSanCuaNghe(ngheId: string, chiSoGia?: number): Tien[]
```

Trạng thái: `daDatMucTieu` đổi tên thành `daTuDo`. `CONFIG.mucTieuTaiSan` và
`CONFIG.mocTaiSan` dạng mảng bị xoá, thay bằng `CONFIG.tuDoTaiChinh` và
`CONFIG.mocTaiSan` dạng object.

**Thuật ngữ giao diện** — hai khái niệm này khác nhau và không được gọi lẫn:

- **Nghĩa vụ hàng năm** = `nghiaVuHangNam` (tổng của ba dòng chi phí)
- **Mức cần đạt** = `mucTieuTuDo` (nghĩa vụ × 1,5)

---

## D. Giao diện

- **HUD** thêm ô thứ tư `🕊️ Tự do` hiển thị phần trăm, đứng đầu vì đó là điều kiện
  thắng. Lưới đổi từ ba cột sang bốn cột.
- **Thanh tiến độ** đo tỉ lệ dòng tiền trên mức cần đạt thay vì tài sản trên 10 tỷ.
  Các vạch mốc tài sản bị gỡ khỏi thanh — mốc tính theo tài sản nên không đặt lên
  thanh đo dòng tiền được; thay bằng một dòng chữ "🚩 Cột mốc 2/4 · kế tiếp 1,4 tỷ".
- **Màn chọn nghề** hiện luôn hai con số riêng của từng nghề: mức dòng tiền cần đạt
  của năm đầu và cột mốc tài sản cao nhất.
- **Tab Sổ sách** có mục *🕊️ Tự do tài chính* bày đủ hai vế, và mục *🚩 Cột mốc tài
  sản* liệt kê cả bốn mốc kèm trạng thái.
- **Tổng kết năm** và **màn kết thúc** đổi theo cùng thuật ngữ.

---

## E. Ván đang lưu

`luuKey` nâng lên `dong-tien-luu-v1-4`, khoá cũ vào danh sách dọn dẹp. Ván v1.3 thiếu
trường `daTuDo` và có `mocTaiSanDaQua` mang số tiền thay vì chỉ số, nạp vào sẽ hỏng
giữa chừng — thà bỏ còn hơn.

---

## F. Kiểm thử

Test mới trong `engine.test.ts`:

- Tiền mặt 50 tỷ nhưng không đẻ ra dòng tiền thì vẫn chưa thắng.
- Ôm 50 tỷ vàng thì `dongTienThuDong` bằng 0 và vẫn chưa thắng.
- Thắng khi dòng tiền phủ được mức cần đạt.
- Khoản vay làm nghĩa vụ tăng đúng bằng tiền trả nợ mỗi năm, nên vay kịch trần không
  phải đường tắt.
- Mốc tài sản đúng theo từng nghề, và nhân đúng theo chỉ số giá.

Test mới trong `balance.test.ts`: bot chỉ ôm vàng, không nhận cơ hội kinh doanh —
thắng 0% dù gom được hơn bốn mươi nghìn tỷ sau trăm năm.

Toàn bộ 107 test xanh, `npm run build` sạch.

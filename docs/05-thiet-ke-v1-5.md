# Thiết kế bản v1.5 — Chuyên gia đồng hành

Ngày chốt: 09/08/2026. Bản này bổ sung một tuyến cốt truyện mới quanh chỉ số hạnh
phúc: khi tinh thần đi xuống, người chơi có thể tìm tới **chuyên gia tâm lý** và
**chuyên gia hoạch định tài chính** để gượng dậy.

## Vì sao cần

Hạnh phúc là điều kiện thua duy nhất của game kể từ bản v1.4, nhưng người chơi gần
như không có cách nào chủ động can thiệp khi nó tụt dốc:

**1. Mọi đường hồi phục đều thụ động.** Thẻ tiêu dùng do máy rút — không thích thì
vẫn mất điểm khi từ chối. Ước nguyện thì đắt và có hạn: mua hết ba món là hết đường.
Người chơi nhìn thanh hạnh phúc trôi về ngưỡng 50 mà không có nút nào để bấm.

**2. Không có nhịp kể nào cho khủng hoảng tinh thần.** Cốt truyện trăm năm đã có
cưới hỏi, con cái, nghỉ hưu, mừng thọ — toàn cột mốc vui. Chuyện kiệt sức, thứ mà
người chơi thật sự đang trải qua trên bảng chỉ số, lại không được kể một chữ nào.

**3. Bài học tài chính còn thiếu một vế.** Game đã dạy bảo hiểm y tế, bảo hiểm xe,
vay nợ, đầu tư. Nhưng "chăm sóc sức khoẻ tinh thần" và "thuê người soát lại chi
tiêu" cũng là hai khoản chi rất thật của đời người, và cả hai đều là đầu tư chứ
không phải phung phí.

---

## A. Tuyến cốt truyện

Ba nhịp kể mới, hiện ở màn Tổng kết năm cùng các sự kiện sẵn có.

### 😔 Kiệt sức — `SuKienLoai = 'kietSuc'`

Kích hoạt khi hạnh phúc cuối năm rớt xuống dưới `nguongCanhBao` mà cờ
`daCanhBaoKietSuc` đang tắt. Bật cờ sau khi kể. Cờ tắt trở lại ngay khi hạnh phúc
cuối năm leo lên bằng hoặc trên ngưỡng — nhờ vậy câu chuyện chỉ kể lại khi bạn thật
sự rơi xuống lần nữa, không lải nhải mỗi năm.

Nội dung xoay quanh dấu hiệu kiệt sức đời thường, ví dụ: sáng nào cũng thấy nặng nề
khi mở mắt; người thân nhận ra bạn ít cười hẳn; đêm nằm mãi không ngủ được vì nghĩ
chuyện tiền nong. Kết bằng lời gợi ý đi gặp chuyên gia. Sự kiện này **không đổi tiền
cũng không đổi hạnh phúc** — nó chỉ kể.

### 🧘 Buổi trị liệu — `SuKienLoai = 'triLieu'`

Mỗi năm còn trong liệu trình, một đoạn kể riêng theo năm thứ mấy:

| Năm | Nội dung |
|---|---|
| 1 | Học cách gọi tên thứ mình đang chịu đựng, thay vì cố phớt lờ nó. |
| 2 | Dựng lại nếp sinh hoạt: ngủ đúng giờ, đi bộ mỗi sáng, bớt ôm việc về nhà. |
| 3 | Buổi cuối cùng. Chuyên gia nói bạn đã đủ vững để tự đi tiếp. |

Kèm số điểm hạnh phúc thực nhận của năm đó.

### 🧭 Bản kế hoạch tài chính

Kể ngay lúc thuê, hiện trong Tổng kết năm đó: hai người ngồi soát lại từng khoản chi
của một năm, tìm ra chỗ tiền rò rỉ mà bạn không để ý. Kèm mức chi phí giảm được và
số điểm hạnh phúc nhận ngay.

---

## B. Hai gói dịch vụ

Cả hai nằm trong mục mới **🧑‍⚕️ Chuyên gia đồng hành** ở Trang chủ, mua được ở mọi
giai đoạn tự do trong năm (`choPhepHanhDongTuDo`), giống bảo hiểm và khoá học.

### 🧘 Chuyên gia tâm lý — liệu trình nhiều năm

| Hạng mục | Giá trị |
|---|---|
| Phí | `0,25 × chiPhiHangNam` của năm mua |
| Thời lượng | 3 năm, tính cả năm mua |
| Hồi phục | `+8` hạnh phúc mỗi năm, ở bước hạnh phúc của `chuyenNam` |
| Mua lại | Chỉ khi liệu trình cũ đã hết hạn |
| Hiệu quả lần sau | Giảm 2 điểm mỗi lần đã trị liệu, sàn 3 điểm |

Chuỗi hiệu quả theo số lần: **8 → 6 → 4 → 3 → 3 …**

Trị liệu lặp lại vẫn có ích nhưng nhạt dần — đúng như đời thật, và quan trọng hơn là
nó chặn chiến thuật "cứ có tiền thì mua hạnh phúc mãi mãi".

### 🧭 Chuyên gia hoạch định tài chính — một lần duy nhất

| Hạng mục | Giá trị |
|---|---|
| Phí | `1,2 × chiPhiHangNam` của năm mua |
| Tác dụng | Chi phí sinh hoạt giảm **8% vĩnh viễn** |
| Kèm theo | `+6` hạnh phúc ngay khi thuê |
| Giới hạn | Cả ván chỉ một lần |

### Giảm phí khi kiệt sức

Hạnh phúc dưới `nguongCanhBao` thì **cả hai gói còn một nửa giá**. Trong truyện đó là
chương trình hỗ trợ của cơ quan và cộng đồng dành cho người đang khủng hoảng.

Đây **không** phải lỗ hổng, vì liệu trình trả về theo từng năm chứ không hồi tức thì.
Xét mốc thời gian thật trong máy:

```
Bấm Kết thúc năm  →  kiểm tra thua (hạnh phúc < 50)  →  chuyenNam  →  trị liệu cộng điểm
```

Buổi trị liệu chỉ diễn ra **sau** cửa ải thua. Nghĩa là:

- Hạnh phúc **50–59**: cửa sổ hành động thật. Mua liệu trình lúc này, qua được cửa ải,
  và năm sau đã có điểm hồi. Được giảm nửa phí.
- Hạnh phúc **dưới 50**: đã quá muộn cho liệu trình. Chỉ còn thẻ tiêu dùng cộng điểm
  tại chỗ mới cứu nổi, vì thẻ ăn điểm ngay trong năm.

Bài học nằm đúng ở chỗ đó: **đừng đợi kiệt sức mới đi gặp chuyên gia.**

---

## C. Cân bằng

**Liệu trình tâm lý** cho tổng `+24` điểm với giá bằng 25% chi phí sinh hoạt một năm.
So với ước nguyện xe máy — 80 triệu đổi lấy `+5` mỗi năm đến hết đời — trị liệu lỗ
nặng nếu tính đường dài. Đó là chủ ý: nó là **cấp cứu, không phải kênh đầu tư hạnh
phúc**. Ai mua nó thay cho ước nguyện sẽ nghèo cả tiền lẫn điểm.

Trường hợp xấu nhất — người chơi giàu mua liệu trình nối tiếp trọn đời — quy về
`+3` điểm mỗi năm với chi phí đều đặn 8,3% chi phí sinh hoạt hàng năm. Vẫn thua xa
một chiếc xe máy, nên không phá vỡ điều kiện thua.

**Gói hoạch định tài chính** hoàn vốn sau 15 năm (`1,2 ÷ 0,08`). Vì `nghiaVuHangNam`
lấy `chiPhiHangNam` làm thành phần chính, giảm 8% chi phí cũng hạ mức cần đạt để tự
do tài chính chừng ấy — một khoản đầu tư dài hơi thật sự, hợp với thông điệp của game.

Cột mốc tài sản **không** đổi theo: `mocTaiSanCuaNghe` tính trên `nghe.chiPhi` gốc chứ
không đọc trạng thái ván, nên bảng huy hiệu vẫn giữ nguyên thước đo.

---

## D. Thay đổi kỹ thuật

### `config.ts` — khối `chuyenGia`

```ts
chuyenGia: {
  /** hạnh phúc dưới mức này thì kể chuyện kiệt sức và mở chương trình hỗ trợ */
  nguongCanhBao: 60,
  /** phí cả hai gói còn lại tỉ lệ này khi đang dưới ngưỡng cảnh báo */
  heSoGiamPhiKhiKietSuc: 0.5,

  tamLy: {
    /** phí = tỉ lệ này × chi phí sinh hoạt của năm mua */
    tyLePhiTheoChiPhi: 0.25,
    soNamLieuTrinh: 3,
    hoiMoiNam: 8,
    /** mỗi liệu trình đã qua làm lần sau nhạt đi ngần này điểm */
    giamHieuQuaMoiLan: 2,
    hoiToiThieu: 3,
  },

  taiChinh: {
    tyLePhiTheoChiPhi: 1.2,
    /** chi phí sinh hoạt giảm vĩnh viễn tỉ lệ này */
    giamChiPhi: 0.08,
    hanhPhucNgay: 6,
  },
},
```

`luuKey` nâng lên `dong-tien-luu-v1-5`; `dong-tien-luu-v1-4` vào danh sách dọn dẹp
trong `luu.ts`. Ván v1.4 thiếu bốn trường mới nên `taiVan` trả `null` — thà bỏ còn
hơn nạp vào rồi vỡ giữa chừng, đúng cách bản v1.4 đã xử lý ván v1.3.

### `types.ts`

Thêm vào `GameState`:

```ts
/** năm cuối cùng liệu trình tâm lý còn hiệu lực; -1 nghĩa là chưa từng trị liệu */
triLieuDenNam: number
/** số liệu trình đã mua, dùng để làm nhạt dần hiệu quả các lần sau */
soLanTriLieu: number
/** đã kể chuyện kiệt sức cho lần rơi này chưa */
daCanhBaoKietSuc: boolean
/** hệ số chi phí sau khi tối ưu chi tiêu cùng chuyên gia, khởi điểm 1 */
heSoToiUuChiPhi: number
```

Thêm hai action và hai loại sự kiện:

```ts
| { type: 'thueChuyenGiaTamLy' }
| { type: 'thueChuyenGiaTaiChinh' }

SuKienLoai |= 'kietSuc' | 'triLieu'
```

Chỉ hai loại. Việc thuê chuyên gia tài chính **không** sinh sự kiện riêng: nó xảy ra
trong reducer chứ không trong `chuyenNam`, và thêm một loại sự kiện chỉ để kể một câu
thì phải gánh thêm trường trạng thái để `chuyenNam` biết mà kể. Lời kể đặt thẳng vào
thẻ giao diện lúc thuê là đủ.

### `engine.ts` — hàm mới

```ts
dangTriLieu(s: GameState): boolean              // s.triLieuDenNam >= s.nam
soNamTriLieuConLai(s: GameState): number        // s.triLieuDenNam - s.nam + 1, tối thiểu 0
hoiPhucTriLieu(soLan: number): number           // 8 / 6 / 4 / 3 / 3…
daToiUuChiPhi(s: GameState): boolean            // s.heSoToiUuChiPhi < 1
phiChuyenGiaTamLy(s: GameState): Tien
phiChuyenGiaTaiChinh(s: GameState): Tien
```

Cả hai hàm phí nhân trực tiếp với `s.chiPhiHangNam`, thứ **đã gồm chỉ số giá** — không
bọc thêm `giaThucTe`, đúng như `phiBaoHiemXe` đang làm. Giao diện phải gọi chung hàm
này, nếu không nút sẽ hiện một giá còn engine trừ một giá khác.

### `engine.ts` — điểm sửa

1. **`taoGameMoi`**: khởi tạo bốn trường mới (`triLieuDenNam: -1`, `soLanTriLieu: 0`,
   `daCanhBaoKietSuc: false`, `heSoToiUuChiPhi: 1`).

2. **Chi phí năm mới** ([`engine.ts:1064`](../src/game/engine.ts#L1064)) nhân thêm hệ số:

   ```ts
   const chiPhiHangNam = Math.round(
     nghe.chiPhi * chiSoGia * heSoChiPhi * s.heSoToiUuChiPhi,
   )
   ```

3. **Bước 9 của `chuyenNam`** (phần hạnh phúc), chèn **trước** phạt khát vọng để buổi
   trị liệu được tính vào bức tranh cả năm:

   ```
   nếu đang trong liệu trình:
       hồi = apHanhPhuc(hoiPhucTriLieu(s.soLanTriLieu))
       đẩy sự kiện 'triLieu' kèm lời kể của năm thứ mấy
   ```

   Điểm hồi đi vào **sự kiện**, không thêm dòng riêng cho `TongKetNam`. Đây đúng
   khuôn mà mốc tài sản đang dùng: sự kiện có lời kể thì mang luôn số điểm, còn hai
   dòng `phatKhatVong` và `hanhPhucTuUocNguyen` là khoản đều đặn không có chuyện để
   kể nên mới đứng thành dòng riêng.

4. **Cuối bước 9**, sau khi mọi thay đổi hạnh phúc của năm đã áp xong, xét cảnh báo
   kiệt sức và cập nhật cờ:

   ```
   nếu hanhPhuc < nguongCanhBao và chưa daCanhBaoKietSuc:
       đẩy sự kiện 'kietSuc', bật cờ
   nếu hanhPhuc >= nguongCanhBao:
       tắt cờ
   ```

   Cờ này **phải được gán tường minh** vào đối tượng `sauChuyen`
   ([`engine.ts:1140`](../src/game/engine.ts#L1140)). Ba trường còn lại đi theo phép
   trải `...s` là đủ, vì chúng chỉ đổi trong reducer.

   Mốc thời gian của liệu trình, kiểm lại cho chắc: mua ở năm `N` đặt
   `triLieuDenNam = N + 2`. Trong `chuyenNam`, `s.nam` vẫn là năm cũ, nên điều kiện
   `s.nam <= s.triLieuDenNam` đúng ở các năm `N`, `N+1`, `N+2` — vừa đủ ba lần hồi —
   rồi tắt. Năm thứ mấy của liệu trình = `soNamLieuTrinh - soNamTriLieuConLai(s) + 1`.

5. **Hai case reducer mới**, cùng khuôn với `muaBaoHiem`:

   ```
   thueChuyenGiaTamLy:
       chặn nếu ngoài giai đoạn tự do, đang trong liệu trình, hoặc không đủ tiền
       trừ phí, triLieuDenNam = nam + soNamLieuTrinh - 1, soLanTriLieu + 1

   thueChuyenGiaTaiChinh:
       chặn nếu ngoài giai đoạn tự do, đã thuê rồi, hoặc không đủ tiền
       trừ phí, heSoToiUuChiPhi = 1 - giamChiPhi, hạnh phúc + hanhPhucNgay
   ```

   Điểm hạnh phúc cộng ngay đi qua `themHanhPhuc` để trần mềm vẫn có hiệu lực, giống
   mọi khoản cộng khác trong game.

### `sim.ts` — bot mô phỏng

`ChienLuoc` thêm hai công tắc, để `balance.test.ts` bật tắt từng gói mà đo được ảnh
hưởng riêng của nó — cùng lý do `muaBaoHiemXe` từng được tách thành danh sách thay vì
một công tắc chung:

```ts
/** thuê chuyên gia tâm lý mỗi khi hạnh phúc rơi xuống dưới ngưỡng cảnh báo */
thueChuyenGiaTamLy: boolean
/** thuê chuyên gia hoạch định tài chính ngay khi đủ tiền */
thueChuyenGiaTaiChinh: boolean
```

`CHIEN_LUOC_CAN_BANG` bật cả hai. Trong vòng lặp giai đoạn tự do, bot thuê chuyên gia
tâm lý khi `hanhPhuc < nguongCanhBao` và không đang trong liệu trình, thuê chuyên gia
tài chính khi tiền mặt còn dư gấp ba lần phí — cùng khuôn thận trọng mà bot đang dùng
cho bảo hiểm y tế.

### Giao diện

- **`TabTrangChu.tsx`**: mục **🧑‍⚕️ Chuyên gia đồng hành** đặt ngay sau bảo hiểm xe,
  trước giáo dục. Hai thẻ dùng khuôn `muc-mua` sẵn có. Thẻ tâm lý hiện trạng thái
  "Đang trong liệu trình · còn N năm" khi đang chạy, và mức hồi của lần mua kế tiếp
  khi đã hết. Thẻ tài chính chuyển sang nhãn "Đã tối ưu" sau khi thuê, kèm mức chi phí
  đang tiết kiệm được mỗi năm. Khi đang dưới ngưỡng cảnh báo, cả hai thẻ hiện dấu giá
  gốc bị gạch và nhãn **🤝 Đang được hỗ trợ một nửa phí**.
- **Thẻ hành động cuối năm**: khối cảnh báo hiện có mở rộng thành hai mức — dưới ngưỡng
  cảnh báo thì gợi ý đi gặp chuyên gia, dưới ngưỡng thua thì giữ nguyên lời cảnh báo
  đỏ và nói thẳng rằng liệu trình không kịp cứu năm nay.
- **`Hud.tsx`**: ô hạnh phúc gắn thêm 🧘 vào nhãn khi đang trong liệu trình. Màu số
  hiện chỉ có hai mức — bình thường và đỏ khi dưới ngưỡng thua; thêm mức vàng cho
  khoảng cảnh báo 50–59, để người chơi thấy mình bước vào vùng nguy hiểm trước một
  nhịp thay vì tới lúc đỏ mới biết.
- **`TongKetModal.tsx`**: bảng `BIEU_TUONG_SU_KIEN` là `Record<SuKienLoai, string>` nên
  trình biên dịch sẽ tự đòi hai mục mới — 😔 cho kiệt sức, 🧘 cho buổi trị liệu.
- **`TabSoSach.tsx`**: dòng chi phí sinh hoạt ghi chú "đã tối ưu −8%" khi có.

---

## E. Kiểm thử

`engine.test.ts`:

- Thuê chuyên gia tâm lý trừ đúng phí và đặt hạn liệu trình ba năm.
- Liệu trình hồi đúng ba năm rồi dừng hẳn.
- Không mua chồng liệu trình khi liệu trình cũ còn hạn.
- Liệu trình lần hai hồi 6 điểm, lần ba hồi 4, từ lần tư trở đi đứng ở sàn 3.
- Hạnh phúc dưới ngưỡng cảnh báo thì phí cả hai gói còn đúng một nửa.
- Thuê chuyên gia tài chính giảm chi phí sinh hoạt năm sau đúng 8% và giữ nguyên các
  năm tiếp theo, kể cả sau lạm phát và sau khi sinh con.
- Chỉ thuê được chuyên gia tài chính một lần.
- `nghiaVuHangNam` và `mucTieuTuDo` giảm theo, còn `mocTaiSanCuaNghe` đứng yên.
- Sự kiện kiệt sức kể một lần cho mỗi lần rơi, không kể lại khi vẫn đang ở dưới ngưỡng.
- Liệu trình mua lúc hạnh phúc dưới ngưỡng thua **không** cứu được năm đó — vẫn thua.

`balance.test.ts`:

- Bot mua liệu trình mỗi khi hạnh phúc xuống dưới ngưỡng cảnh báo: tỉ lệ thắng nhích
  lên nhưng **không** chạm 100% ở nghề giáo viên — thua vì hạnh phúc vẫn còn là rủi ro
  thật.
- Bot mua chuyên gia tài chính sớm rút ngắn được số năm tới tự do tài chính.

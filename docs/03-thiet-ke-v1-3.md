# Thiết kế bản v1.3 — Bảo hiểm xe, cơ hội theo nghề, thu nhập biến động

Ngày chốt: 08/08/2026. Tài liệu này là bản hợp đồng chung cho toàn bộ thay đổi của
bản v1.3, các phần việc song song đều bám theo đúng tên gọi và chữ ký hàm ở đây.

## Bốn phần việc

- **A** — Sửa lỗi bảng tổng kết hiển thị chỉ số cổ phiếu dù người chơi không nắm giữ.
- **B** — Bảo hiểm xe đủ ba loại như ngoài đời, kèm bốn sự kiện giao thông.
- **C** — Cơ hội kinh doanh gắn với nghề nghiệp, và thu nhập doanh nghiệp biến động
  từng năm thay vì là con số cố định vĩnh viễn.
- **D** — Loại cơ hội mới: tổ chức sự kiện, lợi nhuận nhận đúng một lần.

---

## A. Sửa lỗi chỉ số cổ phiếu

Nguyên nhân nằm ở `chuyenNam` trong `engine.ts`:

```ts
if (soLuong > 0 || ts.id === 'coPhieu') { ... }
```

Vế `|| ts.id === 'coPhieu'` ép cổ phiếu luôn có mặt trong mục *Danh mục đầu tư* của
màn tổng kết kể cả khi người chơi sở hữu không cổ phiếu nào. Lỗi thuần hiển thị —
tiền không sai, vì lợi tức luôn bằng không khi số lượng bằng không.

Cách sửa: gom mọi kênh vào một mảng có cờ đánh dấu, để giao diện tự tách hai mục.

- **Danh mục đầu tư** — chỉ những kênh `dangNamGiu === true`. Không có thì ẩn cả mục.
- **Thị trường năm nay** — toàn bộ năm kênh, ghi rõ là tin thị trường tham khảo.

---

## B. Bảo hiểm xe

### Điều kiện có xe

Người chơi có xe khi đã mua ước nguyện `xeMay` hoặc `oTo`. Sở hữu cả hai thì mọi
tính toán bám theo chiếc giá trị cao nhất — một hồ sơ bảo hiểm duy nhất, không nhân
đôi giao diện.

Giá trị xe năm nay bằng giá gốc của món ước nguyện nhân chỉ số giá, nên phí bảo hiểm
và mức đền bù đều leo theo lạm phát.

### Ba loại bảo hiểm

Hiệu lực một năm, mua lại hàng năm, giống hệt cơ chế bảo hiểm y tế đang có.

| Loại | Mã | Phí mỗi năm | Che chắn |
|---|---|---|---|
| Trách nhiệm dân sự (bắt buộc) | `trachNhiemDanSu` | 0,4% giá trị xe | Bồi thường cho người bị nạn |
| Vật chất xe (tự nguyện) | `vatChatXe` | 1,8% giá trị xe | Xe hỏng nặng hoặc mất trộm |
| Tai nạn người ngồi trên xe | `taiNanNguoiTrenXe` | 0,5% giá trị xe | Viện phí cho người bị thương |

### Bốn sự kiện, chỉ xảy ra khi đang có xe

1. **Va chạm giao thông** — 9% mỗi năm. Bồi thường cho người bị nạn 25–70% giá trị
   xe. Có trách nhiệm dân sự thì bảo hiểm trả thay, chỉ mất 2 điểm hạnh phúc; không
   có thì tự trả toàn bộ và mất 8 điểm. Kèm 40% khả năng có người trên xe bị thương,
   viện phí bằng 15% giá trị xe — bảo hiểm tai nạn người ngồi trên xe gánh phần này,
   không có thì tự trả và mất thêm 5 điểm hạnh phúc.
2. **Xe hỏng nặng** — 10% mỗi năm, sửa hết 20–35% giá trị xe. Bảo hiểm vật chất xe
   trả thay.
3. **Mất trộm xe** — 3% mỗi năm. Có bảo hiểm vật chất thì được đền đúng giá trị và
   mua lại xe ngay, giữ nguyên món ước nguyện. Không có thì mất luôn chiếc xe: gỡ
   khỏi `uocNguyenDaMua`, mất phần hạnh phúc mỗi năm nó mang lại, và nếu đó là khát
   vọng của nghề thì khoản phạt hàng năm quay trở lại. Mất thêm 12 điểm hạnh phúc.
4. **Bị phạt vì thiếu bảo hiểm bắt buộc** — 20% mỗi năm khi chưa mua trách nhiệm dân
   sự. Phạt 1% giá trị xe và mất 3 điểm hạnh phúc.

Đồng thời gỡ câu *"Chiếc xe máy dở chứng giữa đường, phải thay phụ tùng."* khỏi danh
sách sự cố đời sống chung, để nó không giẫm chân lên nhóm sự kiện xe.

---

## C. Cơ hội theo nghề và thu nhập biến động

### Ba thuộc tính mới của cơ hội

- `ngheId` — chỉ nghề này mới gặp. Bỏ trống nghĩa là mọi nghề đều gặp.
- `namToiThieu` — chỉ xuất hiện từ năm này trở đi, thể hiện yêu cầu thâm niên.
- `chiMotLan` — cả ván chỉ tham gia được một lần.

Mỗi năm rút **hai** cơ hội thay vì một: một suất ưu tiên lấy từ bộ cơ hội của nghề
đang chơi, một suất lấy từ bộ chung. Hết cơ hội hợp lệ của nghề thì cả hai suất lấy
từ bộ chung.

### Thu nhập doanh nghiệp không còn cố định

Công thức mỗi năm:

```
thu nhập năm nay = thu nhập nền × (chỉ số giá hiện tại ÷ chỉ số giá lúc góp vốn)
                                × (1 + biến động của năm)
```

Vế giữa giữ cho doanh nghiệp còn giá trị thật sau vài chục năm lạm phát. Vế cuối lấy
ngẫu nhiên trong biên độ riêng của từng cơ hội, phản ánh độ bấp bênh của ngành. Biên
độ dưới không bao giờ xuống dưới −100%, nên năm tệ nhất là không thu được đồng nào
chứ doanh nghiệp không gây lỗ.

Biên độ tham chiếu: nhà trọ −8%…+12%, đội xe máy cho thuê −15%…+18%, phòng khám
−15%…+22%, xưởng may −22%…+25%, quán cà phê −35%…+40%, ứng dụng di động −70%…+90%,
vườn sầu riêng −85%…+95%.

### Danh sách cơ hội bổ sung

Mọi cơ hội kinh doanh mới đều nằm trong dải sinh lời 19–22% mỗi năm của các cơ hội
sẵn có, nên không kênh nào trội hẳn.

**Giáo viên** — Lớp dạy thêm buổi tối (60 triệu → 13 triệu, từ năm 2) · Biên soạn
sách tham khảo (150 triệu → 30 triệu, từ năm 4) · Trung tâm gia sư (400 triệu → 84
triệu, từ năm 6) · Trường mầm non tư thục (1,2 tỷ → 228 triệu, từ năm 12, một lần)

**Bác sĩ** — Nhận trực thêm ở phòng khám tư (90 triệu → 20 triệu, từ năm 2) · Nhà
thuốc trước cổng bệnh viện (450 triệu → 94 triệu, từ năm 5) · Góp vốn phòng xét
nghiệm (900 triệu → 171 triệu, từ năm 8) · Phòng khám riêng (1,8 tỷ → 342 triệu, từ
năm 10, một lần)

**Kỹ sư phần mềm** — Nhận dự án ngoài giờ (100 triệu → 22 triệu, từ năm 2) · Ứng dụng
di động của riêng bạn (350 triệu → 73 triệu, từ năm 4) · Khởi nghiệp công nghệ, canh
bạc (500 triệu, thắng 22%, nhân 4 lần, từ năm 6) · Công ty phần mềm gia công (2 tỷ →
380 triệu, từ năm 12, một lần)

**Chung** — Xe tải chở hàng cho thuê (600 triệu → 126 triệu) · Nhà trọ cho công nhân
thuê (1 tỷ → 195 triệu) · Vườn sầu riêng Tây Nguyên (700 triệu → 154 triệu) · Góp vốn
quán ăn của người quen, canh bạc (250 triệu, thắng 45%, nhân 2 lần)

---

## D. Cơ hội tổ chức sự kiện

Loại thứ ba bên cạnh kinh doanh và canh bạc. Bỏ vốn ra, cuối năm nhận lại vốn cộng
lợi nhuận đúng một lần rồi kết thúc, không có dòng tiền các năm sau. Mọi cơ hội loại
này đều đặt `chiMotLan`.

Khác canh bạc ở chỗ đây là công sức chứ không phải may rủi: kỳ vọng dương khoảng
+20%, và năm tệ nhất cũng chỉ lỗ một phần vốn chứ không mất trắng.

**Chung** — Tổ chức hội chợ Tết (200 triệu, −25%…+70%) · Giải chạy phong trào thành
phố (150 triệu, −20%…+55%) · Nhận thầu tiệc cưới trọn gói (500 triệu, −20%…+60%)

**Theo nghề** — Trại hè cho học sinh, giáo viên (120 triệu, −20%…+60%) · Hội thảo
chuyên đề, bác sĩ (250 triệu, −15%…+65%) · Hội nghị công nghệ, kỹ sư phần mềm (400
triệu, −25%…+75%)

---

## Hợp đồng mã nguồn

### types.ts

```ts
export type CoHoiLoai = 'kinhDoanh' | 'canhBac' | 'toChucSuKien'

export type LoaiBaoHiemXe = 'trachNhiemDanSu' | 'vatChatXe' | 'taiNanNguoiTrenXe'

export interface CoHoi {
  id: string
  ten: string
  moTa: string
  emoji: string
  loai: CoHoiLoai
  gia: Tien
  ngheId?: string
  namToiThieu?: number
  chiMotLan?: boolean
  thuNhapMoiNam?: Tien
  bienDongThuNhapMin?: number
  bienDongThuNhapMax?: number
  xacSuatThang?: number
  heSoNhan?: number
  loiNhuanMin?: number
  loiNhuanMax?: number
}

export interface DoanhNghiep {
  coHoiId: string
  ten: string
  /** thu nhập nền tại thời điểm góp vốn, đã tính lạm phát của năm đó */
  thuNhapNen: Tien
  /** chỉ số giá của năm góp vốn, để thu nhập bám theo lạm phát về sau */
  chiSoGiaLucMua: number
}
```

`SuKienLoai` thêm: `vaChamGiaoThong`, `xeHongNang`, `matTromXe`, `phatThieuBaoHiemXe`,
`suKienKetQua`.

`GameState` thêm và đổi:

```ts
/** năm cuối cùng từng loại bảo hiểm xe còn hiệu lực; -1 = chưa từng mua */
baoHiemXe: Record<LoaiBaoHiemXe, number>
/** id các cơ hội chỉ một lần đã tham gia */
coHoiDaLam: string[]
/** các khoản chờ mở kết quả cuối năm — canh bạc và tổ chức sự kiện */
khoanDangCho: { coHoiId: string; gia: Tien; loai: CoHoiLoai }[]
```

Trường `canhBacDangCho` bị thay bằng `khoanDangCho`.

`TongKetNam` thêm và đổi:

```ts
/** thay cho loiTucTaiSan — mọi kênh, có cờ đang nắm giữ */
bienDongTaiSan: {
  id: AssetId
  ten: string
  bienDong: number
  loiTuc: Tien
  dangNamGiu: boolean
}[]
/** thu nhập thực nhận từ từng doanh nghiệp trong năm */
thuNhapDoanhNghiep: { coHoiId: string; ten: string; soTien: Tien; bienDong: number }[]
```

`Action` thêm: `{ type: 'muaBaoHiemXe'; loai: LoaiBaoHiemXe }`.

### engine.ts — các hàm mới cần xuất

```ts
/** Chiếc xe giá trị nhất đang sở hữu; null nếu chưa có xe nào. */
export function xeDangCo(
  s: GameState,
): { uocNguyenId: string; ten: string; emoji: string; giaTri: Tien } | null

/** Phí một loại bảo hiểm xe cho năm nay. Đã gồm lạm phát — giao diện không nhân thêm. */
export function phiBaoHiemXe(s: GameState, loai: LoaiBaoHiemXe): Tien

export function dangCoBaoHiemXe(s: GameState, loai: LoaiBaoHiemXe): boolean

/** Mức thu nhập nền của toàn bộ doanh nghiệp trong năm nay, chưa tính biến động. */
export function thuNhapThuDong(s: GameState): Tien

/** Khoảng thu nhập thụ động có thể nhận năm nay, sau khi áp biên độ biến động. */
export function bienDoThuNhapThuDong(s: GameState): { thap: Tien; cao: Tien }

/** Cơ hội có hợp lệ với nghề, thâm niên và lịch sử tham gia của ván này không. */
export function coHoiHopLe(c: CoHoi, s: GameState): boolean
```

`phiBaoHiemXe` trả về số tiền cuối cùng, giao diện tuyệt đối không bọc thêm
`giaThucTe` — khác với `phiBaoHiem` của bảo hiểm y tế.

### config.ts

Thêm khối `baoHiemXe` với các khoá: `tyLePhiTrachNhiemDanSu` 0.004,
`tyLePhiVatChatXe` 0.018, `tyLePhiTaiNanNguoiTrenXe` 0.005, `vaChamXacSuat` 0.09,
`vaChamDenBuMin` 0.25, `vaChamDenBuMax` 0.7, `vaChamMatHanhPhucCoBaoHiem` 2,
`vaChamMatHanhPhucKhongBaoHiem` 8, `vaChamXacSuatCoThuongTich` 0.4,
`thuongTichVienPhiTyLe` 0.15, `thuongTichMatHanhPhuc` 5, `xeHongXacSuat` 0.1,
`xeHongChiPhiMin` 0.2, `xeHongChiPhiMax` 0.35, `matTromXacSuat` 0.03,
`matTromMatHanhPhuc` 12, `phatXacSuat` 0.2, `phatTyLe` 0.01, `phatMatHanhPhuc` 3.

Đổi `soCoHoiMoiNam` thành 2 và `luuKey` thành `dong-tien-luu-v1-3`.

### luu.ts

Thêm `dong-tien-luu-v1-2` vào danh sách khoá cũ cần dọn. Ván đang lưu của bản v1.2
sẽ không nạp lại được vì hình dạng trạng thái đã đổi — đây là lựa chọn có chủ ý, đã
được xác nhận.

---

## Rủi ro cân bằng

Bốn thay đổi cùng đẩy game về phía dễ hơn: rút hai cơ hội mỗi năm thay vì một, thêm
nhiều cơ hội, thu nhập doanh nghiệp bám lạm phát, và có thêm kênh tổ chức sự kiện kỳ
vọng dương. Chiều ngược lại chỉ có nhóm sự kiện xe.

Bộ kiểm thử `balance.test.ts` đang ràng buộc: mọi nghề phải thắng được, không ai
thắng trong năm năm đầu, và chơi hoang phí phải về đích chậm hơn chơi chọn lọc. Sau
khi cài xong phải chạy mô phỏng và tinh chỉnh lại các con số trong `config.ts` cho
tới khi ba ràng buộc này còn đúng. `sim.ts` cũng phải biết mua bảo hiểm xe và biết
xử lý cơ hội tổ chức sự kiện, nếu không mô phỏng sẽ không phản ánh đúng ván thật.

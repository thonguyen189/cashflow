# Bản v1.7 "Đủ khó để phải chọn" — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kéo tỉ lệ thắng của bot cân bằng từ 91–94% xuống 45–55% đều cả ba nghề, đẩy tuổi thắng trung bình từ 33–42 lên 52–62, và tạo ra cửa thua tài chính thật (phá sản 8–18%) — bằng cách đặt lại mọi con số tiền tệ về đúng thực tế Việt Nam 2026 thay vì vặn tham số cho khó lên.

> **Trạng thái: đã thực hiện xong toàn bộ 15 task.** Số đo thật ở mục L của `docs/07-thiet-ke-v1-7.md`. Bốn việc còn lại sau vòng hiệu chỉnh nằm ở `2026-08-11-v1-7-viec-con-lai.md`.

**Architecture:** Game là một reducer thuần (`src/game/engine.ts`) trên `GameState`, với toàn bộ số cân bằng tập trung ở `src/game/config.ts` và dữ liệu nội dung ở `src/game/content.ts`. Mọi thay đổi của bản này đi theo ba tầng: (1) đổi số trong `config.ts`/`content.ts`, (2) thêm hàm thuần vào `engine.ts` rồi gọi từ `chuyenNam`, (3) hiển thị ở tầng `src/ui/`. Mười lăm nhiệm vụ dưới đây xếp theo thứ tự phụ thuộc: nền số liệu trước, cơ chế sau, giao diện và hiệu chỉnh cuối cùng.

**Tech Stack:** TypeScript 5.7 · React 19 · Vite 6 · Vitest 3 · không có backend, trạng thái lưu ở localStorage.

## Global Constraints

- **Ngôn ngữ:** Mọi chuỗi hiển thị cho người chơi phải là **tiếng Việt có dấu, không viết tắt**. Mỗi mục giao diện phải có icon emoji sinh động.
- **Lệnh chạy test:** `npm test -- <đường dẫn>`. **KHÔNG dùng `npx`** — cài đặt npm trên máy này hỏng (`Cannot find module './npm-cli.js'`). Chạy toàn bộ: `npm test`.
- **Đơn vị tiền:** dùng hằng `TRIEU` và `TY` đã có trong `config.ts`. Không viết số 0 trần trụi.
- **Mọi số cân bằng nằm trong `config.ts`**, không rải rác trong `engine.ts`. `config.ts` là file duy nhất dev cần sửa để tinh chỉnh độ khó.
- **Chú thích tiếng Việt giải thích VÌ SAO**, theo đúng phong cách dày đặc sẵn có của `config.ts` và `engine.ts`. Số nào có lý do thì phải ghi lý do.
- **`CONFIG` khai báo `as const`** — khi thêm khối mới phải giữ nguyên kiểu này.
- **Commit sau mỗi task**, thông điệp commit **không dấu** (theo lệ sẵn có của repo), kết thúc bằng dòng `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Nhánh làm việc:** `v1-7-du-kho-de-phai-chon` (đã tạo, đã có commit tài liệu thiết kế).
- **Tài liệu thiết kế:** `docs/07-thiet-ke-v1-7.md` — đọc mục tương ứng trước mỗi task.
- **Test hiện có phải giữ xanh** trừ những test được nêu đích danh trong task là sẽ đổi. `engine.test.ts` có 2785 dòng và `balance.test.ts` được viết lại hẳn ở Task 15 — trong các task từ 1 tới 14, nếu một test cân bằng đỏ vì ngưỡng cũ không còn đúng, **ghi lại vào phần "Test đã tạm nới" của task đó** thay vì âm thầm sửa ngưỡng.

## Cấu trúc file

| File | Trách nhiệm | Task chạm tới |
|---|---|---|
| `src/game/config.ts` | Toàn bộ số cân bằng | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 |
| `src/game/content.ts` | Nghề, xuất thân, tài sản, cơ hội, thẻ, lời kể | 1, 2, 3, 5, 12 |
| `src/game/types.ts` | Kiểu dữ liệu | 2, 3, 5, 6, 11, 12 |
| `src/game/engine.ts` | Reducer thuần + hàm tính | 3, 4, 5, 6, 7, 9, 10, 11, 12, 13 |
| `src/game/luu.ts` | Nạp/lưu localStorage | 1 |
| `src/game/sim.ts` | Bot mô phỏng | 12, 15 |
| `src/game/balance.test.ts` | Lưới an toàn cân bằng | 15 |
| `src/ui/*.tsx` | Hiển thị | 14 |

---

## Task 1: Đặt lại thang tiền và vốn xuất thân

Đọc `docs/07-thiet-ke-v1-7.md` mục A.

**Files:**
- Modify: `src/game/content.ts` (mảng `NGHE` dòng 22–50, mảng `XUAT_THAN` dòng ~96–150)
- Modify: `src/game/config.ts` (`luuKey` dòng ~577)
- Modify: `src/game/luu.ts:5-12` (danh sách khoá lưu cũ)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: không có (task đầu tiên)
- Produces: `NGHE` với `luong`/`chiPhi` mới; hằng số chi phí gốc của bác sĩ (**102 × TRIEU**) sẽ là `CHI_PHI_CHUAN` của Task 9.

- [x] **Step 1: Viết test thất bại cho thang tiền mới**

Thêm vào cuối `src/game/engine.test.ts`:

```ts
describe('v1.7 — thang tiền đặt lại theo thực tế 2026', () => {
  it('ba nghề có tỉ lệ tiết kiệm năm đầu xấp xỉ 15%', () => {
    const mong: Record<string, [number, number]> = {
      giaoVien: [90_000_000, 76_000_000],
      bacSi: [120_000_000, 102_000_000],
      kySuPhanMem: [144_000_000, 122_000_000],
    }
    for (const nghe of NGHE) {
      const [luong, chiPhi] = mong[nghe.id]!
      expect(nghe.luong).toBe(luong)
      expect(nghe.chiPhi).toBe(chiPhi)
      const tietKiem = (nghe.luong - nghe.chiPhi) / nghe.luong
      expect(tietKiem).toBeGreaterThan(0.14)
      expect(tietKiem).toBeLessThan(0.16)
    }
  })

  it('vốn ban đầu của mọi xuất thân phủ được trọn chi phí năm đầu', () => {
    // Chi phí bị trừ ở ĐẦU năm còn lương chỉ cộng vào CUỐI năm, nên vốn ban đầu
    // thấp hơn chi phí năm đầu là một khởi đầu KHÔNG THỂ vượt qua bằng lối chơi
    // khôn ngoan — xem docs/06-thiet-ke-v1-6.md mục A.
    for (const nghe of NGHE) {
      for (const x of XUAT_THAN) {
        const s = taoGameMoi(nghe.id, 1, { xuatThanId: x.id, heSoLuongKhoiDiem: 1 })
        expect(s.tienMat).toBeGreaterThan(s.chiPhiHangNam * 1.05)
      }
    }
  })
})
```

Bổ sung `XUAT_THAN` vào dòng `import` từ `./content` ở đầu file nếu chưa có.

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thang tiền"`
Kỳ vọng: FAIL — `expected 180000000 to be 90000000`.

- [x] **Step 3: Đổi ba nghề trong `content.ts`**

Trong mảng `NGHE`, đổi đúng hai trường của mỗi nghề (giữ nguyên `moTa`, `emoji`, `khatVongId`):

```ts
// giaoVien
luong: 90 * TRIEU,
chiPhi: 76 * TRIEU,

// bacSi
luong: 120 * TRIEU,
chiPhi: 102 * TRIEU,

// kySuPhanMem
luong: 144 * TRIEU,
chiPhi: 122 * TRIEU,
```

Thêm chú thích ngay trên mảng `NGHE`:

```ts
/**
 * ---------- Thang tiền, đặt lại ở v1.7 ----------
 * Bản v1.6 cho giáo viên 15tr/tháng, bác sĩ 30tr, kỹ sư phần mềm 50tr — cao gấp
 * 2,1 tới 4,3 lần thực tế người mới ra trường năm 2026 (giáo viên hạng III bậc 1
 * hệ số 2,34 × lương cơ sở 2,34tr cộng phụ cấp ưu đãi ≈ 7,1–7,4tr; bác sĩ xếp
 * bậc 2 từ 1/1/2026 thực nhận 8–15tr; lập trình viên fresher 8–15tr).
 *
 * Quan trọng hơn con số tuyệt đối là TỈ LỆ TIẾT KIỆM: v1.6 phát cho người 21
 * tuổi 27–40% thặng dư ngay năm đầu, trong khi ngoài đời con số đó gần bằng 0.
 * Đó là nguyên nhân sâu xa nhất của việc mọi nghề đều tự do tài chính trước 40.
 *
 * Cả ba nghề nay tiết kiệm 15% như nhau — CỐ Ý. Điểm phân biệt ba nghề chuyển
 * từ mức lương khởi điểm sang HÌNH DẠNG ĐƯỜNG SỰ NGHIỆP (`duongCongSuNghiep`,
 * Task 3 của v1.7). Ngoài đời cũng vậy: sinh viên mới ra trường của ba ngành
 * này sống na ná nhau, cái khác nhau là mười lăm năm sau.
 *
 * 15% không phải con số thực tế (thực tế gần 0%) mà là mức tối thiểu để ván
 * chơi tồn tại: 0% thặng dư nghĩa là không bao giờ tích luỹ được gì và game
 * không có nước đi nào. Đây là nhượng bộ có ý thức của mô phỏng trước hiện
 * thực, ghi lại ở đây để bản sau không ai tưởng là sơ suất.
 *
 * Giá cơ hội, giá tài sản và giá ước nguyện GIỮ NGUYÊN số tuyệt đối. Lương
 * giảm 2–4 lần trong khi giá đứng yên chính là đòn bẩy độ khó mạnh nhất của cả
 * bản v1.7 — và nó miễn phí, vì chỉ là sửa cho đúng đời thật.
 */
```

- [x] **Step 4: Nâng vốn ban đầu của bốn xuất thân**

Trong mảng `XUAT_THAN`, đổi `tyLeVonBanDau`: `thuanNong` 0.85 → **1.05**, `vienChuc` 1.0 → **1.25**, `buonBan` 2.0 → **2.4**, `khaGia` 3.5 → **4.2**.

Thêm chú thích trên mảng:

```ts
/**
 * ---------- Vì sao vốn ban đầu nâng ở v1.7 ----------
 * Tỉ lệ chi phí/lương mới là ~0,85 (v1.6: 0,725 ở nghề khắt khe nhất). Với nhà
 * thuần nông, chi phí năm đầu ≈ 0,85 × 0,92 × 1,08 = 0,845 × lương, cộng khoản
 * trả nợ học phí ~0,06 × lương, cộng đệm cho sự kiện phát sinh sớm — nên sàn
 * thật là ~0,91 và 1,05 là mức có đệm.
 *
 * Tương phản giữa bốn xuất thân giữ gần nguyên vẹn (1 : 1,19 : 2,29 : 4,00 so
 * với 1 : 1,18 : 2,35 : 4,12 của v1.6) — vốn là thứ người chơi cảm nhận rõ nhất
 * nên phải giữ.
 */
```

- [x] **Step 5: Nâng khoá lưu**

`config.ts`: `luuKey: 'dong-tien-luu-v1-7'`.
`luu.ts:5-12`: thêm `'dong-tien-luu-v1-6',` vào cuối mảng `KHOA_LUU_CU`.

- [x] **Step 6: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thang tiền"`
Kỳ vọng: PASS, cả hai test.

- [x] **Step 7: Chạy toàn bộ test và ghi nhận cái nào đỏ**

Chạy: `npm test`
Kỳ vọng: `balance.test.ts` có thể đỏ (ngưỡng 85–95% không còn đúng — đó chính là mục tiêu của bản này). **Ghi lại tên từng test đỏ vào phần cuối task này, KHÔNG sửa ngưỡng** — Task 15 sẽ viết lại toàn bộ `balance.test.ts`. Nếu `engine.test.ts` đỏ thì phải sửa: đó là test cơ chế, không phải test cân bằng.

- [x] **Step 8: Commit**

```bash
git add src/game/content.ts src/game/config.ts src/game/luu.ts src/game/engine.test.ts
git commit -m "v1.7 dat lai thang tien theo thuc te 2026

Luong ba nghe dang cao gap 2,1x (giao vien) toi 4,3x (ky su phan mem) so
voi nguoi moi ra truong nam 2026. Quan trong hon: ti le tiet kiem nam dau
la 27-40% trong khi ngoai doi gan 0%.

Dat lai 90/120/144tr luong va 76/102/122tr chi phi — ca ba nghe tiet kiem
15%. Diem phan biet ba nghe chuyen sang duong cong su nghiep (task sau).

Gia co hoi va tai san GIU NGUYEN so tuyet doi, nen luong giam 2-4 lan
chinh la don bay do kho manh nhat cua ban nay.

Nang von ban dau cua bon xuat than de van giu duoc rang buoc chi phi nam
dau, giu nguyen tuong phan giua chung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Test đã tạm nới:** _(điền tên các test cân bằng bị đỏ ở Step 7)_

---

## Task 2: Ba bậc cơ hội nhỏ và dải sinh lời 12–18%

Đọc `docs/07-thiet-ke-v1-7.md` mục A (phần cuối) và mục D (phần "Hạ dải sinh lời").

**Files:**
- Modify: `src/game/content.ts` (mảng `CO_HOI` từ dòng 367)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `NGHE` với lương mới (Task 1)
- Produces: `CO_HOI` có ba mục mới id `banHangOnline`, `motXeMayChoThue`, `gopVonQuanAn`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — cơ hội kinh doanh sát thực tế hơn', () => {
  it('mọi cơ hội kinh doanh nằm trong dải sinh lời 12–18%', () => {
    for (const c of CO_HOI) {
      if (c.loai !== 'kinhDoanh') continue
      const sinhLoi = (c.thuNhapMoiNam ?? 0) / c.gia
      expect(sinhLoi).toBeGreaterThanOrEqual(0.1195)
      expect(sinhLoi).toBeLessThanOrEqual(0.1805)
    }
  })

  it('có cơ hội đủ nhỏ để giáo viên với tới trong vài năm đầu', () => {
    const nhoNhat = Math.min(
      ...CO_HOI.filter((c) => c.loai === 'kinhDoanh').map((c) => c.gia),
    )
    // Giáo viên tiết kiệm 14tr/năm — suất đầu tiên phải với tới trong ~2 năm,
    // nếu không thì mười năm đầu người chơi không có quyết định nào để ra.
    expect(nhoNhat).toBeLessThanOrEqual(30_000_000)
  })

  it('rủi ro cao thì sinh lời cao — nhà trọ chắc nhất và lãi thấp nhất', () => {
    const nhaTro = CO_HOI.find((c) => c.id === 'nhaTroCongNhan')!
    const quanCaPhe = CO_HOI.find((c) => c.id === 'quanCaPhe')!
    const loiNhaTro = nhaTro.thuNhapMoiNam! / nhaTro.gia
    const loiQuanCaPhe = quanCaPhe.thuNhapMoiNam! / quanCaPhe.gia
    expect(loiNhaTro).toBeLessThan(loiQuanCaPhe)
    const bienDoNhaTro = nhaTro.bienDongThuNhapMax! - nhaTro.bienDongThuNhapMin!
    const bienDoQuanCaPhe =
      quanCaPhe.bienDongThuNhapMax! - quanCaPhe.bienDongThuNhapMin!
    expect(bienDoNhaTro).toBeLessThan(bienDoQuanCaPhe)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — cơ hội"`
Kỳ vọng: FAIL — sinh lời hiện là 0,20 nên vượt trần 0,1805.

- [x] **Step 3: Thêm ba cơ hội nhỏ vào đầu nhóm "Chung: kinh doanh"**

```ts
  {
    id: 'banHangOnline',
    ten: 'Bán hàng online tại nhà',
    moTa: 'Nhập ít hàng về bán trên mạng, tự đóng gói tự gửi. Vốn nhỏ, lời mỏng, nhưng là bước đầu tiên.',
    emoji: '📦',
    loai: 'kinhDoanh',
    gia: 25 * TRIEU,
    thuNhapMoiNam: 4.5 * TRIEU,
    bienDongThuNhapMin: -0.4,
    bienDongThuNhapMax: 0.45,
  },
  {
    id: 'motXeMayChoThue',
    ten: 'Một chiếc xe máy cho thuê',
    moTa: 'Mua một chiếc xe cũ cho khách du lịch thuê theo ngày. Nhỏ thôi, nhưng tiền về đều.',
    emoji: '🛵',
    loai: 'kinhDoanh',
    gia: 60 * TRIEU,
    thuNhapMoiNam: 9 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'gopVonQuanAn',
    ten: 'Góp vốn quán ăn với bạn',
    moTa: 'Bạn cũ mở quán cơm bình dân gần khu trọ, rủ góp một phần vốn ăn chia.',
    emoji: '🍜',
    loai: 'kinhDoanh',
    gia: 120 * TRIEU,
    thuNhapMoiNam: 20.4 * TRIEU,
    bienDongThuNhapMin: -0.35,
    bienDongThuNhapMax: 0.38,
  },
```

- [x] **Step 4: Hạ `thuNhapMoiNam` của bảy cơ hội cũ**

| id | `gia` | `thuNhapMoiNam` mới | sinh lời |
|---|---|---|---|
| `choThueXe` | 200tr | `30 * TRIEU` | 15% |
| `quanCaPhe` | 400tr | `72 * TRIEU` | 18% |
| `xeTaiChoHang` | 600tr | `96 * TRIEU` | 16% |
| `vuonSauRieng` | 700tr | `126 * TRIEU` | 18% |
| `gopVonCuaHang` | 800tr | `120 * TRIEU` | 15% |
| `nhaTroCongNhan` | 1 tỷ | `120 * TRIEU` | 12% |
| `xuongMay` | 1,5 tỷ | `240 * TRIEU` | 16% |

Ba cơ hội tầm lớn của v1.6 cũng hạ theo cùng nguyên tắc: `khuNhaXuong` (12 tỷ) → `1.92 * TY` (16%), `khachSanVenBien` (20 tỷ) → `3.6 * TY` (18%), `duAnKhuDoThi` (40 tỷ) → `6 * TY` (15%).

Sửa chú thích đầu mảng `CO_HOI` — câu "Mọi cơ hội kinh doanh đều nằm trong dải sinh lời 18,75–22,5% mỗi năm trên vốn, nên không kênh nào trội hẳn so với phần còn lại" nay sai hai lần, thay bằng:

```ts
 * ---------- Dải sinh lời, hạ ở v1.7 ----------
 * Dải 18,75–22,5% của v1.6 xa thực tế: "dãy nhà trọ cho công nhân" 1 tỷ thu
 * 195tr mỗi năm là 19,5%, trong khi nhà trọ ngoài đời tính cả tiền đất chỉ sinh
 * lời 6–9%. Quán cà phê nhỏ thì đa số hoà vốn hoặc lỗ.
 *
 * Dải mới là 12–18%, và CỐ Ý PHÂN TÁN THEO RỦI RO thay vì gom vào một dải hẹp:
 * nhà trọ 12% nhưng biến động chỉ ±10%, quán cà phê 18% nhưng có năm mất 35%.
 * Có vậy người chơi mới có quyết định thật giữa chắc chắn và béo bở — v1.6 gom
 * hết vào một dải nên chọn cơ hội nào cũng như nhau.
 *
 * Sau thuế thu nhập doanh nghiệp 20% (v1.7), dải thực nhận còn 9,6–14,4%. So
 * với bất động sản 4,95% sau thuế, doanh nghiệp vẫn là con đường nhanh nhất
 * tới tự do tài chính — nhưng hệ số không còn 3,6 lần mà xuống ~2,6 lần.
```

- [x] **Step 5: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — cơ hội"`
Kỳ vọng: PASS, cả ba test.

- [x] **Step 6: Commit**

```bash
git add src/game/content.ts src/game/engine.test.ts
git commit -m "v1.7 ha dai sinh loi co hoi ve 12-18 phan tram va them ba bac nho

Dai 18,75-22,5 phan tram cua v1.6 xa thuc te: nha tro tinh ca tien dat chi
sinh loi 6-9 phan tram ngoai doi. Ha ve 12-18 phan tram va phan tan theo
rui ro thay vi gom vao mot dai hep, de chon co hoi nao tro thanh quyet
dinh that.

Them ba bac nho 25tr, 60tr, 120tr. Voi thang luong moi, co hoi re nhat cu
la 200tr thi giao vien mat muoi bon nam moi voi toi suat dau tien — muoi
nam dau khong co quyet dinh nao de ra.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Đường cong sự nghiệp theo nghề

Đọc `docs/07-thiet-ke-v1-7.md` mục B.

**Files:**
- Modify: `src/game/types.ts:20-29` (`Nghe`), thêm `BacSuNghiep`
- Modify: `src/game/content.ts` (mảng `NGHE`)
- Modify: `src/game/config.ts` (bỏ `tangLuongThucMin/Max`)
- Modify: `src/game/engine.ts` (thêm `tangLuongThucTheoTuoi`, sửa bước 8 của `chuyenNam` tại dòng ~1644)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `NGHE` (Task 1)
- Produces: `export function tangLuongThucTheoTuoi(nghe: Nghe, tuoi: number): number` — trả tỉ lệ tăng lương thực của năm, có thể **âm**.

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — đường cong sự nghiệp theo nghề', () => {
  it('mỗi nghề có đường cong phủ trọn tuổi đi làm', () => {
    for (const nghe of NGHE) {
      expect(nghe.duongCongSuNghiep.length).toBeGreaterThan(0)
      const cuoi = nghe.duongCongSuNghiep[nghe.duongCongSuNghiep.length - 1]!
      expect(cuoi.denTuoi).toBeGreaterThanOrEqual(CONFIG.cotTruyen.tuoiNghiHuu)
    }
  })

  it('kỹ sư phần mềm tăng nhanh lúc trẻ rồi đi xuống sau tuổi 50', () => {
    const ks = NGHE.find((n) => n.id === 'kySuPhanMem')!
    expect(tangLuongThucTheoTuoi(ks, 25)).toBeGreaterThan(0.1)
    expect(tangLuongThucTheoTuoi(ks, 55)).toBeLessThan(0)
  })

  it('giáo viên tăng chậm nhưng không bao giờ âm', () => {
    const gv = NGHE.find((n) => n.id === 'giaoVien')!
    for (const tuoi of [25, 35, 45, 55]) {
      const t = tangLuongThucTheoTuoi(gv, tuoi)
      expect(t).toBeGreaterThan(0)
      expect(t).toBeLessThanOrEqual(0.035)
    }
  })

  it('bác sĩ bứt tốc mạnh nhất ở tuổi 35', () => {
    const bs = NGHE.find((n) => n.id === 'bacSi')!
    expect(tangLuongThucTheoTuoi(bs, 35)).toBeGreaterThan(
      tangLuongThucTheoTuoi(bs, 25),
    )
    expect(tangLuongThucTheoTuoi(bs, 35)).toBeGreaterThan(
      tangLuongThucTheoTuoi(bs, 55),
    )
  })

  it('lương tuổi 40 của ba nghề phân kỳ đúng như thiết kế', () => {
    // Mô phỏng thuần số học trên đường cong, không chạy game — đây là kiểm tra
    // bảng số của thiết kế chứ không phải kiểm tra engine.
    const luongTaiTuoi = (ngheId: string, denTuoi: number): number => {
      const nghe = NGHE.find((n) => n.id === ngheId)!
      let luong = nghe.luong
      for (let tuoi = 22; tuoi <= denTuoi; tuoi++) {
        luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
      }
      return luong
    }
    expect(luongTaiTuoi('giaoVien', 40) / 1e6).toBeCloseTo(165, -1)
    expect(luongTaiTuoi('bacSi', 40) / 1e6).toBeCloseTo(441, -1)
    expect(luongTaiTuoi('kySuPhanMem', 40) / 1e6).toBeCloseTo(650, -1)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — đường cong"`
Kỳ vọng: FAIL — `tangLuongThucTheoTuoi is not defined`.

- [x] **Step 3: Thêm kiểu `BacSuNghiep` vào `types.ts`**

Ngay trên `interface Nghe`:

```ts
/**
 * Một chặng của đường sự nghiệp: từ sau chặng trước cho tới hết tuổi `denTuoi`,
 * lương tăng THỰC (trên nền lạm phát) mỗi năm ngần này. `tangThuc` có thể ÂM —
 * đào thải tuổi trong một số ngành là chuyện thật.
 */
export interface BacSuNghiep {
  denTuoi: number
  tangThuc: number
}
```

Và thêm vào `interface Nghe`:

```ts
  /**
   * Hình dạng đường lương theo tuổi, riêng từng nghề. Trước v1.7 mọi nghề dùng
   * chung `CONFIG.tangLuongThucMin/Max` (0–2,5%), nghĩa là game cho lương khởi
   * điểm bằng mức đỉnh sự nghiệp rồi tăng đều suốt bốn mươi năm — sai hoàn toàn
   * so với đời thật, và làm cho việc chọn nghề chỉ là chọn ba con số khác nhau.
   */
  duongCongSuNghiep: BacSuNghiep[]
```

- [x] **Step 4: Thêm đường cong cho ba nghề trong `content.ts`**

```ts
// giaoVien — lên bậc ba năm một lần, hệ số 2,34 → 4,98 sau hai mươi bốn năm.
// Chậm, đều, không bao giờ bứt phá, nhưng cũng không bao giờ sụp.
duongCongSuNghiep: [
  { denTuoi: 30, tangThuc: 0.035 },
  { denTuoi: 40, tangThuc: 0.03 },
  { denTuoi: 50, tangThuc: 0.025 },
  { denTuoi: 200, tangThuc: 0.02 },
],

// bacSi — ì ạch mười năm đầu (sáu năm trường y, mười tám tháng thực hành, bậc
// thấp ở bệnh viện công), rồi bứt tốc mạnh nhất từ tuổi 35 khi có danh tiếng và
// phòng khám riêng. Nghề thưởng cho sự kiên nhẫn.
duongCongSuNghiep: [
  { denTuoi: 30, tangThuc: 0.05 },
  { denTuoi: 40, tangThuc: 0.09 },
  { denTuoi: 50, tangThuc: 0.05 },
  { denTuoi: 200, tangThuc: 0.02 },
],

// kySuPhanMem — tăng gấp gần ba lần trong chín năm đầu, đạt đỉnh quanh tuổi 50
// rồi ĐI XUỐNG. Đào thải tuổi trong ngành công nghệ là chuyện thật, và nó biến
// "chọn nghề lương cao" thành canh bạc về thời điểm: bạn có mười lăm năm vàng
// để chuyển thu nhập thành tài sản, sau đó cửa hẹp dần.
duongCongSuNghiep: [
  { denTuoi: 30, tangThuc: 0.12 },
  { denTuoi: 40, tangThuc: 0.05 },
  { denTuoi: 50, tangThuc: 0.01 },
  { denTuoi: 200, tangThuc: -0.01 },
],
```

- [x] **Step 5: Thêm `tangLuongThucTheoTuoi` vào `engine.ts`**

Đặt ngay trước hàm `chuyenNam`:

```ts
/**
 * Tăng lương thực của một năm, theo nghề và tuổi. Trả về tỉ lệ, có thể ÂM.
 * Chặng cuối cùng của `duongCongSuNghiep` phủ mọi tuổi còn lại (denTuoi: 200).
 */
export function tangLuongThucTheoTuoi(nghe: Nghe, tuoi: number): number {
  for (const bac of nghe.duongCongSuNghiep) {
    if (tuoi <= bac.denTuoi) return bac.tangThuc
  }
  return 0
}
```

Bổ sung `BacSuNghiep` vào import kiểu nếu TypeScript đòi.

- [x] **Step 6: Nối vào bước 8 của `chuyenNam`**

Trong nhánh `else` của bước 8 (dòng ~1653), thay:

```ts
    const tangThuc =
      rng.khoang(CONFIG.tangLuongThucMin, CONFIG.tangLuongThucMax) *
      tacDong.heSoTangLuong
```

bằng:

```ts
    // Đường cong sự nghiệp riêng của nghề (v1.7) thay cho dải 0–2,5% chung của
    // v1.6. `heSoTangLuong` của chu kỳ kinh tế CHỈ nhân vào phần dương: khủng
    // hoảng làm lương ngừng tăng, nhưng không được biến đoạn đào thải tuổi của
    // kỹ sư phần mềm thành ra nhẹ đi khi kinh tế xấu — vô lý ngược.
    const tangCoBan = tangLuongThucTheoTuoi(nghe8, tuoiTaiNam(s.nam))
    const tangThuc =
      tangCoBan > 0 ? tangCoBan * tacDong.heSoTangLuong : tangCoBan
```

Ngay trước bước 8 thêm `const nghe8 = timNghe(s.ngheId)!` (bước 10 đã có biến `nghe` riêng, đặt tên khác để không đụng nhau).

- [x] **Step 7: Bỏ `tangLuongThucMin/Max` khỏi `config.ts`**

Xoá hai dòng `tangLuongThucMin: 0.0,` và `tangLuongThucMax: 0.025,`, giữ `luongBamLamPhat: true`, và đổi chú thích khối `---------- Lương ----------` thành:

```ts
  /** ---------- Lương ----------
   * Lương tăng theo lạm phát CỘNG phần tăng thực. Nếu bỏ phần bám lạm phát, chi
   * phí sẽ leo nhanh hơn thu nhập và nghề lương thấp thành bất khả thi — đã
   * kiểm chứng bằng balance.test.ts.
   *
   * Phần tăng thực chuyển sang `Nghe.duongCongSuNghiep` ở v1.7 (xem content.ts):
   * mỗi nghề một hình dạng riêng, và kỹ sư phần mềm có đoạn ÂM sau tuổi 50. Đây
   * cũng là lần đầu tiên game có một nguồn thu BIẾT SỤP trong lúc còn đi làm —
   * mục F của docs/06-thiet-ke-v1-6.md kết luận rằng chính việc thiếu điều đó là
   * lý do phá sản không bao giờ xảy ra được.
   */
```

- [x] **Step 8: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — đường cong"`
Kỳ vọng: PASS, cả năm test.

- [x] **Step 9: Chạy toàn bộ test và biên dịch**

Chạy: `npm test` rồi `npx tsc -b --noEmit` → **KHÔNG dùng npx**, dùng `./node_modules/.bin/tsc -b --noEmit`.
Kỳ vọng: không lỗi biên dịch. `balance.test.ts` có thể vẫn đỏ — ghi nhận, không sửa.

- [x] **Step 10: Commit**

```bash
git add src/game/types.ts src/game/content.ts src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 duong cong su nghiep rieng tung nghe

Truoc day moi nghe dung chung tang luong thuc 0-2,5 phan tram, nghia la
game cho luong khoi diem bang muc dinh su nghiep roi tang deu suot bon
muoi nam. Ngoai doi hinh dang khac han va khac THEO TUNG NGHE.

Giao vien tang cham nhung deu; bac si i ach muoi nam dau roi but toc tu
tuoi 35; ky su phan mem tang gap gan ba lan trong chin nam dau roi DI
XUONG sau tuoi 50 — dao thai tuoi trong nganh cong nghe la chuyen that.

Doan tang truong am cua ky su phan mem la lan dau game co mot nguon thu
BIET SUP trong luc con di lam — dieu ma muc F cua v1.6 ket luan la thieu
no thi pha san khong bao gio xay ra duoc.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Thuế thu nhập cá nhân

Đọc `docs/07-thiet-ke-v1-7.md` mục C (phần "Thuế thu nhập cá nhân").

**Files:**
- Modify: `src/game/config.ts` (khối `thue` mới)
- Modify: `src/game/engine.ts` (`thueThuNhapCaNhan`, bước 8 của `chuyenNam`)
- Modify: `src/game/types.ts` (`SuKienLoai` thêm `'thueThuNhap'`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `tangLuongThucTheoTuoi` (Task 3)
- Produces: `export function thueThuNhapCaNhan(luongNam: Tien, soNguoiPhuThuoc: number, chiSoGia: number): Tien`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — thuế thu nhập cá nhân', () => {
  it('lương khởi điểm của cả ba nghề đều dưới ngưỡng chịu thuế', () => {
    // Giảm trừ bản thân 186tr/năm theo luật hiệu lực 1/7/2026 — người mới ra
    // trường ở Việt Nam không nộp thuế thu nhập cá nhân.
    for (const nghe of NGHE) {
      expect(thueThuNhapCaNhan(nghe.luong, 0, 1)).toBe(0)
    }
  })

  it('tính đúng thuế luỹ tiến từng phần', () => {
    // 718tr, không người phụ thuộc: chịu thuế 532tr
    //   120tr × 5% = 6tr · 240tr × 10% = 24tr · 172tr × 20% = 34,4tr → 64,4tr
    expect(thueThuNhapCaNhan(718 * TRIEU, 0, 1)).toBe(64.4 * TRIEU)
  })

  it('mỗi người phụ thuộc kéo thuế xuống', () => {
    const khongCon = thueThuNhapCaNhan(650 * TRIEU, 0, 1)
    const haiCon = thueThuNhapCaNhan(650 * TRIEU, 2, 1)
    expect(haiCon).toBeLessThan(khongCon)
    // 650tr − 186tr − 2 × 74,4tr = 315,2tr → 120 × 5% + 195,2 × 10% = 25,52tr
    expect(haiCon).toBe(25.52 * TRIEU)
  })

  it('ngưỡng và giảm trừ bám lạm phát', () => {
    // Nếu ngưỡng đứng yên thì sau vài chục năm lạm phát mọi người đều nộp bậc
    // cao nhất dù thu nhập THỰC không đổi — thuế hoá thành một khoản phạt vì
    // sống lâu. Ngoài đời mức giảm trừ cũng được điều chỉnh định kỳ.
    expect(thueThuNhapCaNhan(200 * TRIEU, 0, 2)).toBe(0)
    expect(thueThuNhapCaNhan(200 * TRIEU, 0, 1)).toBeGreaterThan(0)
  })

  it('thuế bị trừ khỏi tiền mặt khi lương đã vượt ngưỡng', () => {
    let s = taoGameMoi('kySuPhanMem', 7)
    s = { ...s, luong: 800 * TRIEU }
    const truoc = s.tienMat
    s = choiHetNam(s)
    const suKienThue = s.tongKet?.suKien.find((k) => k.loai === 'thueThuNhap')
    expect(suKienThue).toBeDefined()
    expect(suKienThue!.tienThayDoi).toBeLessThan(0)
    expect(truoc).toBeGreaterThan(0)
  })
})
```

> Hàm trợ giúp `choiHetNam` đã có sẵn trong `engine.test.ts` — tìm và dùng lại đúng tên hiện có; nếu tên khác thì thay cho khớp.

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thuế thu nhập"`
Kỳ vọng: FAIL — `thueThuNhapCaNhan is not defined`.

- [x] **Step 3: Thêm khối `thue` vào `config.ts`**

Đặt ngay sau khối `---------- Ngân hàng ----------`:

```ts
  /** ---------- Thuế ----------
   * Theo Luật Thuế thu nhập cá nhân sửa đổi, hiệu lực 1/7/2026: giảm trừ bản
   * thân 15,5tr/tháng (186tr/năm), mỗi người phụ thuộc 6,2tr/tháng (74,4tr/năm),
   * biểu thuế rút gọn từ bảy bậc xuống NĂM bậc.
   *
   * ---------- Vì sao thuế TNCN KHÔNG phải đòn bẩy hạ tỉ lệ thắng ----------
   * Với thang lương của v1.7 (90/120/144tr) và mức giảm trừ 186tr, cả ba nghề
   * KHÔNG nộp một đồng nào trong khoảng mười lăm năm đầu. Thuế chỉ cắn khi đã
   * thành công: kỹ sư phần mềm tuổi 40 nộp 3,9% lương, bác sĩ tuổi 60 nộp 10,9%.
   * Nó là phanh hãm giai đoạn giàu và là một chi tiết đời thật đáng có, không
   * hơn. Sức nặng cân bằng thật nằm ở thang tiền, đường cong sự nghiệp và thuế
   * thu nhập doanh nghiệp.
   *
   * ---------- Vì sao mọi ngưỡng phải nhân chỉ số giá ----------
   * Ngưỡng đứng yên trong khi lương bám lạm phát thì sau vài chục năm ai cũng
   * nộp bậc cao nhất dù thu nhập THỰC không đổi — thuế hoá thành khoản phạt vì
   * sống lâu, và nó sẽ bóp méo toàn bộ nửa sau ván chơi. Ngoài đời mức giảm trừ
   * cũng được điều chỉnh định kỳ, đúng như vậy.
   *
   * Thu nhập của bạn đời (25% lương người chơi) KHÔNG bị đánh thuế ở đây: họ có
   * suất giảm trừ bản thân riêng, mà 0,25 × lương chỉ vượt 186tr khi lương người
   * chơi trên 744tr — tới lúc đó khoản thuế của họ cũng chỉ vài phần nghìn tổng
   * thu nhập hộ gia đình. Bỏ qua là đơn giản hoá có ý thức.
   */
  thue: {
    /** giảm trừ bản thân mỗi năm, tại mặt bằng giá gốc */
    giamTruBanThan: 186 * TRIEU,
    /** giảm trừ mỗi người phụ thuộc (con đang nuôi) mỗi năm */
    giamTruPhuThuoc: 74.4 * TRIEU,
    /** biểu luỹ tiến từng phần: `den` là trần thu nhập TÍNH THUẾ của bậc */
    bacThue: [
      { den: 120 * TRIEU, thueSuat: 0.05 },
      { den: 360 * TRIEU, thueSuat: 0.1 },
      { den: 720 * TRIEU, thueSuat: 0.2 },
      { den: 1200 * TRIEU, thueSuat: 0.3 },
      { den: Number.POSITIVE_INFINITY, thueSuat: 0.35 },
    ],
    /** thuế thu nhập doanh nghiệp trên lợi nhuận được chia */
    thueDoanhNghiep: 0.2,
  },
```

- [x] **Step 4: Thêm `thueThuNhapCaNhan` vào `engine.ts`**

Đặt cạnh các hàm tính tiền khác, trước `chuyenNam`:

```ts
/**
 * Thuế thu nhập cá nhân của một năm, luỹ tiến từng phần. `chiSoGia` nhân vào
 * mọi ngưỡng và mọi khoản giảm trừ để thuế đo theo thu nhập THỰC — xem chú
 * thích khối `thue` trong config.ts.
 */
export function thueThuNhapCaNhan(
  luongNam: Tien,
  soNguoiPhuThuoc: number,
  chiSoGia: number,
): Tien {
  const t = CONFIG.thue
  const giamTru =
    (t.giamTruBanThan + t.giamTruPhuThuoc * soNguoiPhuThuoc) * chiSoGia
  let conLai = luongNam - giamTru
  if (conLai <= 0) return 0

  let thue = 0
  let tranTruoc = 0
  for (const bac of t.bacThue) {
    const tran = bac.den * chiSoGia
    const phan = Math.min(conLai, tran - tranTruoc)
    thue += phan * bac.thueSuat
    conLai -= phan
    tranTruoc = tran
    if (conLai <= 0) break
  }
  return Math.round(thue)
}
```

> `Number.POSITIVE_INFINITY * chiSoGia` vẫn là `Infinity`, nên bậc cuối luôn nuốt trọn phần còn lại — đúng ý.

- [x] **Step 5: Trừ thuế trong bước 8 của `chuyenNam`**

Ngay sau dòng `tienMat += luongThucNhan`, thêm:

```ts
  // Thuế thu nhập cá nhân, tính trên lương THỰC NHẬN của năm (đã gồm mọi hệ số
  // cắt lương của biến cố) chứ không phải lương danh nghĩa — ốm nặng nghỉ nửa
  // năm thì cũng chỉ nộp thuế trên phần thật sự nhận được.
  const soNguoiPhuThuoc = soConDangNuoi(conCai, namMoiChoThue)
  const thueLuong = thueThuNhapCaNhan(
    luongThucNhan,
    soNguoiPhuThuoc,
    s.chiSoGia,
  )
  if (thueLuong > 0) {
    tienMat -= thueLuong
    suKien.push({
      loai: 'thueThuNhap',
      tieuDe: '🧾 Quyết toán thuế thu nhập cá nhân',
      moTa:
        `Thu nhập năm nay đã vượt mức giảm trừ gia cảnh` +
        `${soNguoiPhuThuoc > 0 ? ` (bản thân và ${soNguoiPhuThuoc} người phụ thuộc)` : ''}.` +
        ` Phần vượt phải nộp thuế theo biểu luỹ tiến từng phần.`,
      tienThayDoi: -thueLuong,
      hanhPhucThayDoi: 0,
    })
  }
```

Ngay trước khối trên, thêm `const namMoiChoThue = s.nam + 1` (bước 10 mới khai báo `namMoi`, mà bước 8 đứng trước nó).

- [x] **Step 6: Thêm `'thueThuNhap'` vào `SuKienLoai` trong `types.ts`**

- [x] **Step 7: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thuế thu nhập"`
Kỳ vọng: PASS, cả năm test.

- [x] **Step 8: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/game/types.ts src/game/engine.test.ts
git commit -m "v1.7 thue thu nhap ca nhan theo luat hieu luc 1/7/2026

Giam tru ban than 186tr/nam, moi nguoi phu thuoc 74,4tr/nam, bieu thue rut
gon con nam bac. Moi nguong nhan chi so gia de thue do theo thu nhap THUC —
nguong dung yen thi sau vai chuc nam ai cung nop bac cao nhat du thu nhap
thuc khong doi.

Ghi nhan trung thuc: voi thang luong moi, ca ba nghe khong nop dong nao
trong khoang muoi lam nam dau. Thue TNCN la phanh ham giai doan giau chu
khong phai don bay ha ti le thang.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Thuế trên thu nhập thụ động

Đọc `docs/07-thiet-ke-v1-7.md` mục C (phần "Thuế trên thu nhập thụ động").

**Files:**
- Modify: `src/game/types.ts` (`TaiSan` thêm `thueLoiTuc`)
- Modify: `src/game/content.ts` (mảng `TAI_SAN`)
- Modify: `src/game/engine.ts` (`dongTienThuDong` dòng ~225, bước 2 và bước 3 của `chuyenNam`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `CONFIG.thue.thueDoanhNghiep` (Task 4)
- Produces: `TaiSan.thueLoiTuc: number`; `dongTienThuDong` nay trả về con số **sau thuế**

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — thuế trên thu nhập thụ động', () => {
  it('trái phiếu và tiền gửi miễn thuế, các kênh khác thì không', () => {
    const thue = Object.fromEntries(TAI_SAN.map((t) => [t.id, t.thueLoiTuc]))
    expect(thue.traiPhieu).toBe(0)
    expect(thue.coPhieu).toBe(0.05)
    expect(thue.batDongSan).toBe(0.1)
  })

  it('dòng tiền thụ động tính SAU thuế', () => {
    let s = taoGameMoi('bacSi', 11)
    s = { ...s, soHuu: { ...s.soHuu, batDongSan: 10 } }
    const gia = s.giaTaiSan.batDongSan
    const bds = TAI_SAN.find((t) => t.id === 'batDongSan')!
    const truocThue = 10 * gia * ((bds.loiTucMin + bds.loiTucMax) / 2)
    expect(dongTienThuDong(s)).toBeCloseTo(truocThue * 0.9, -3)
  })

  it('thu nhập doanh nghiệp chịu thuế 20% trong dòng tiền thụ động', () => {
    let s = taoGameMoi('bacSi', 12)
    s = {
      ...s,
      doanhNghiep: [
        {
          coHoiId: 'choThueXe',
          ten: 'Đội xe máy cho thuê',
          thuNhapNen: 30 * TRIEU,
          chiSoGiaLucMua: s.chiSoGia,
          vonGoc: 200 * TRIEU,
          namGop: s.nam,
        },
      ],
    }
    expect(dongTienThuDong(s)).toBe(Math.round(30 * TRIEU * 0.8))
  })
})
```

> Trường `namGop` được thêm ở Task 6. Nếu Task 5 chạy trước, bỏ dòng `namGop` khỏi vật thể trên và thêm lại ở Task 6.

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thuế trên thu nhập thụ động"`
Kỳ vọng: FAIL — `thueLoiTuc` là `undefined`.

- [x] **Step 3: Thêm `thueLoiTuc` vào `TaiSan` trong `types.ts`**

```ts
  /**
   * Thuế trên lợi tức nhận được; 0 nghĩa là miễn thuế. Giữ đúng luật Việt Nam:
   * lãi tiền gửi tiết kiệm của cá nhân KHÔNG chịu thuế thu nhập cá nhân, cổ tức
   * chịu 5%, cho thuê nhà chịu 10% (5% giá trị gia tăng + 5% thu nhập cá nhân).
   *
   * Hệ quả cố ý: kênh an toàn nhất bỗng thành kênh duy nhất không bị đánh thuế,
   * và lần đầu tiên trái phiếu có lý do tồn tại ngoài việc trú ẩn khi khủng hoảng.
   */
  thueLoiTuc: number
```

- [x] **Step 4: Gán `thueLoiTuc` cho năm tài sản trong `content.ts`**

`traiPhieu: 0` · `coPhieu: 0.05` · `vang: 0` · `crypto: 0` · `batDongSan: 0.1`.

Với vàng và tiền mã hoá thêm chú thích `// không sinh lợi tức nên con số này không bao giờ được dùng tới`.

- [x] **Step 5: Trừ thuế ở bước 2 của `chuyenNam`**

Đổi dòng tính `loiTuc` (dòng ~1037):

```ts
    const loiTuc = Math.round(soLuong * giaCu * tyLeLoiTuc * (1 - ts.thueLoiTuc))
```

Thêm chú thích trên đó:

```ts
    // Trừ thuế ngay tại nguồn (v1.7): con số hiện trong bảng tổng kết là số
    // THỰC VỀ TÚI, không phải số trước thuế — người chơi không cần làm phép trừ
    // trong đầu để biết mình có bao nhiêu.
```

- [x] **Step 6: Trừ thuế doanh nghiệp ở bước 3**

Đổi phép tính `soTien` (dòng ~1073):

```ts
    const soTien = Math.max(
      0,
      Math.round(
        nen * (1 + bienDong) * tacDong.heSoLoiTuc * (1 - CONFIG.thue.thueDoanhNghiep),
      ),
    )
```

- [x] **Step 7: Sửa `dongTienThuDong` để tính sau thuế**

```ts
/**
 * Dòng tiền thụ động một năm, SAU THUẾ (v1.7): thu nhập nền của các doanh
 * nghiệp trừ thuế thu nhập doanh nghiệp, cộng lợi tức kỳ vọng của danh mục trừ
 * thuế riêng của từng kênh.
 *
 * Dùng mức KỲ VỌNG chứ không phải số thực nhận của năm đó, để con số đứng yên
 * cho người chơi lên kế hoạch — thắng hay chưa không được phép nhảy qua lại
 * theo may rủi cổ tức. Hệ quả cố ý: vàng và tiền mã hoá lợi tức bằng 0 nên
 * không mua nổi tự do, dù chúng vẫn là kênh làm giàu và trú ẩn tốt.
 *
 * `thuNhapThuDong` cố ý giữ nguyên nghĩa TRƯỚC thuế: nó là "doanh nghiệp của
 * bạn làm ra bao nhiêu", còn thuế là chuyện của phép so với đích. Tách như vậy
 * để `bienDoThuNhapThuDong` và bảng kinh doanh vẫn kể đúng chuyện của doanh
 * nghiệp mà không phải giải thích hai lần.
 */
export function dongTienThuDong(s: GameState): Tien {
  const tuDanhMuc = TAI_SAN.reduce(
    (tong, ts) =>
      tong +
      s.soHuu[ts.id] * s.giaTaiSan[ts.id] * loiTucKyVong(ts) * (1 - ts.thueLoiTuc),
    0,
  )
  const tuDoanhNghiep =
    thuNhapThuDong(s) * (1 - CONFIG.thue.thueDoanhNghiep)
  return Math.round(tuDoanhNghiep + tuDanhMuc)
}
```

- [x] **Step 8: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — thuế trên thu nhập thụ động"`
Kỳ vọng: PASS, cả ba test.

- [x] **Step 9: Commit**

```bash
git add src/game/types.ts src/game/content.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 thue tren thu nhap thu dong theo dung luat

Trai phieu va tien gui MIEN thue (dung luat Viet Nam), co tuc 5 phan tram,
cho thue nha 10 phan tram, thu nhap doanh nghiep 20 phan tram. Kenh an
toan nhat bong thanh kenh duy nhat khong bi danh thue — lan dau tien trai
phieu co ly do ton tai ngoai viec tru an khi khung hoang.

dongTienThuDong nay tra ve con so SAU thue. thuNhapThuDong co y giu nguyen
nghia truoc thue de bang kinh doanh van ke dung chuyen cua doanh nghiep.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Bão hoà doanh nghiệp

Đọc `docs/07-thiet-ke-v1-7.md` mục D (phần "Bão hoà").

**Files:**
- Modify: `src/game/types.ts` (`DoanhNghiep` thêm `namGop`)
- Modify: `src/game/config.ts` (khối `doanhNghiep` mới)
- Modify: `src/game/engine.ts` (`heSoBaoHoa`, `thuNhapNenNamNay` dòng ~151, nơi tạo `DoanhNghiep` dòng ~2221)
- Modify: `src/game/luu.ts` (chặn ván cũ thiếu `namGop`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `dongTienThuDong` sau thuế (Task 5)
- Produces: `export function heSoBaoHoa(s: GameState, d: DoanhNghiep): number`; `DoanhNghiep.namGop: number`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — doanh nghiệp bão hoà theo thời gian', () => {
  const dungDoanhNghiep = (s: GameState, namGop: number) => ({
    ...s,
    doanhNghiep: [
      {
        coHoiId: 'choThueXe',
        ten: 'Đội xe máy cho thuê',
        thuNhapNen: 30 * TRIEU,
        chiSoGiaLucMua: 1,
        vonGoc: 200 * TRIEU,
        namGop,
      },
    ],
  })

  it('doanh nghiệp mới góp thì chưa bão hoà', () => {
    let s = taoGameMoi('bacSi', 21)
    s = { ...dungDoanhNghiep(s, s.nam), chiSoGia: 1 }
    expect(heSoBaoHoa(s, s.doanhNghiep[0]!)).toBe(1)
  })

  it('sau mười năm thu nhập còn khoảng 74%', () => {
    let s = taoGameMoi('bacSi', 22)
    s = { ...dungDoanhNghiep(s, 1), nam: 11, chiSoGia: 1 }
    expect(heSoBaoHoa(s, s.doanhNghiep[0]!)).toBeCloseTo(0.737, 3)
    expect(thuNhapNenNamNay(s, s.doanhNghiep[0]!)).toBe(
      Math.round(30 * TRIEU * 0.737424),
    )
  })

  it('bão hoà kéo dòng tiền thụ động xuống theo', () => {
    let moi = taoGameMoi('bacSi', 23)
    moi = { ...dungDoanhNghiep(moi, moi.nam), chiSoGia: 1 }
    let cu = taoGameMoi('bacSi', 23)
    cu = { ...dungDoanhNghiep(cu, 1), nam: 26, chiSoGia: 1 }
    expect(dongTienThuDong(cu)).toBeLessThan(dongTienThuDong(moi) * 0.5)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — doanh nghiệp bão hoà"`
Kỳ vọng: FAIL — `heSoBaoHoa is not defined`.

- [x] **Step 3: Thêm `namGop` vào `DoanhNghiep` trong `types.ts`**

```ts
  /**
   * Năm góp vốn (theo năm trong game), để tính bão hoà thu nhập theo tuổi doanh
   * nghiệp. Suy ngược từ `chiSoGiaLucMua` là không đủ: lạm phát mỗi năm mỗi khác
   * nên chỉ số giá không đơn ánh với năm.
   */
  namGop: number
```

- [x] **Step 4: Thêm khối `doanhNghiep` vào `config.ts`**

Đặt ngay sau khối `quyMoGopVon`:

```ts
  /** ---------- Doanh nghiệp: bão hoà và rủi ro nền ----------
   * Ở v1.6 một quán cà phê trả 20% vốn mỗi năm, mãi mãi, không già đi. Đó là cỗ
   * máy lãi kép không rủi ro, và là lý do sâu xa khiến mọi nghề đều tự do tài
   * chính trước tuổi 40.
   *
   * ---------- Bão hoà ----------
   * Thu nhập nền giảm THỰC 3% mỗi năm kể từ năm góp vốn — tức không bám đủ lạm
   * phát. Sau 5 năm còn 86%, 10 năm còn 74%, 15 năm còn 63%, 25 năm còn 47%.
   * Cạnh tranh mọc lên, thiết bị cũ đi, mặt bằng tăng giá, khách quen chuyển đi.
   * Người chơi buộc phải liên tục gây dựng cái mới thay vì mua một lần rồi ngồi
   * thu tiền tới già — và đây cũng là thứ khiến người ĐÃ tự do tài chính có thể
   * rớt lại nếu ngủ quên, điều kiện để chế độ chơi tiếp có ý nghĩa.
   */
  doanhNghiep: {
    /** thu nhập nền giảm thực ngần này mỗi năm kể từ năm góp vốn */
    baoHoaMoiNam: 0.03,
  },
```

- [x] **Step 5: Thêm `heSoBaoHoa` và nối vào `thuNhapNenNamNay`**

Trong `engine.ts`, ngay trước `thuNhapNenNamNay`:

```ts
/**
 * Hệ số bão hoà của một doanh nghiệp: 1 ở năm góp vốn, giảm thực dần theo tuổi.
 * Đặt riêng thành hàm xuất khẩu vì giao diện cần kể được "thu nhập còn bao nhiêu
 * phần trăm so với ngày đầu" (xem TabKinhDoanh.tsx).
 */
export function heSoBaoHoa(s: GameState, d: DoanhNghiep): number {
  const soNam = Math.max(0, s.nam - d.namGop)
  return Math.pow(1 - CONFIG.doanhNghiep.baoHoaMoiNam, soNam)
}
```

Và sửa `thuNhapNenNamNay`:

```ts
export function thuNhapNenNamNay(s: GameState, d: DoanhNghiep): Tien {
  return Math.round(
    d.thuNhapNen * (s.chiSoGia / d.chiSoGiaLucMua) * heSoBaoHoa(s, d),
  )
}
```

- [x] **Step 6: Ghi `namGop` khi tạo doanh nghiệp**

Ở dòng ~2221 trong `reducer` (`case 'quyetDinhCoHoi'`), thêm `namGop: s.nam,` vào vật thể `DoanhNghiep` mới.

- [x] **Step 7: Chặn ván cũ trong `luu.ts`**

Thêm vào `taiVan`, sau kiểm tra `heSoLuongDiChung`:

```ts
    // trường của bản v1.7: ván v1.6 thiếu `namGop` nên `heSoBaoHoa` trả NaN,
    // kéo theo mọi thu nhập doanh nghiệp thành NaN ngay năm đầu tiên
    if (s.doanhNghiep?.some((d) => typeof d.namGop !== 'number')) return null
```

- [x] **Step 8: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — doanh nghiệp bão hoà"`
Kỳ vọng: PASS, cả ba test.

- [x] **Step 9: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/engine.ts src/game/luu.ts src/game/engine.test.ts
git commit -m "v1.7 doanh nghiep bao hoa 3 phan tram moi nam

O v1.6 mot quan ca phe tra 20 phan tram von moi nam, mai mai, khong gia
di — co may lai kep khong rui ro. Nay thu nhap nen giam thuc 3 phan tram
moi nam ke tu nam gop von: sau muoi nam con 74 phan tram, sau hai muoi
lam nam con 47 phan tram.

Nguoi choi buoc phai lien tuc gay dung cai moi thay vi mua mot lan roi
ngoi thu tien toi gia. Day cung la thu khien nguoi DA tu do tai chinh co
the rot lai neu ngu quen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Doanh nghiệp phá sản hẳn — rủi ro nền

Đọc `docs/07-thiet-ke-v1-7.md` mục G.1. **Đây là đòn bẩy duy nhất tạo được ván thua vì lý do tài chính** — nếu chỉ làm được một task của cả bản này thì làm task này.

**Files:**
- Modify: `src/game/config.ts` (khối `doanhNghiep`)
- Modify: `src/game/types.ts` (`SuKienLoai` thêm `'doanhNghiepPhaSan'`)
- Modify: `src/game/engine.ts` (`xacSuatDoanhNghiepPhaSan`, bước 3b mới trong `chuyenNam`, dời khai báo `doanhNghiep`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `heSoBaoHoa`, `DoanhNghiep.namGop` (Task 6); `vonDoanhNghiepNamNay` (đã có, `engine.ts:116`)
- Produces: `export function xacSuatDoanhNghiepPhaSan(s: GameState, d: DoanhNghiep): number`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — doanh nghiệp có thể phá sản hẳn', () => {
  const mot = (s: GameState, namGop: number) => ({
    coHoiId: 'choThueXe',
    ten: 'Đội xe máy cho thuê',
    thuNhapNen: 30 * TRIEU,
    chiSoGiaLucMua: s.chiSoGia,
    vonGoc: 200 * TRIEU,
    namGop,
  })

  it('doanh nghiệp càng già càng dễ đổ, khủng hoảng thì dễ hơn nữa', () => {
    const s = taoGameMoi('bacSi', 31)
    const treo = { ...s, nam: 2 }
    const gia = { ...s, nam: 22 }
    expect(xacSuatDoanhNghiepPhaSan(gia, mot(s, 1))).toBeGreaterThan(
      xacSuatDoanhNghiepPhaSan(treo, mot(s, 1)),
    )
    const khungHoang = { ...treo, thiTruong: 'khungHoang' as const }
    expect(xacSuatDoanhNghiepPhaSan(khungHoang, mot(s, 1))).toBeGreaterThan(
      xacSuatDoanhNghiepPhaSan(treo, mot(s, 1)),
    )
  })

  it('xác suất luôn nằm trong khoảng hợp lệ', () => {
    const s = { ...taoGameMoi('bacSi', 32), nam: 79, thiTruong: 'khungHoang' as const }
    const p = xacSuatDoanhNghiepPhaSan(s, mot(s, 1))
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThanOrEqual(1)
  })

  it('trong một trăm ván có ít nhất một doanh nghiệp đổ', () => {
    // Đây là phép đo TẦN SUẤT, không phải phép đo một ván — rủi ro nền phải đủ
    // thường xuyên để người chơi cảm nhận được, nếu không thì nó chỉ là trang trí.
    let soLanDo = 0
    for (let seed = 0; seed < 100; seed++) {
      let s = taoGameMoi('bacSi', seed)
      s = { ...s, doanhNghiep: [mot(s, 1), mot(s, 1), mot(s, 1)] }
      for (let i = 0; i < 10 && s.trangThai === 'dangChoi'; i++) {
        s = choiHetNam(s)
        if (s.tongKet?.suKien.some((k) => k.loai === 'doanhNghiepPhaSan')) {
          soLanDo++
          break
        }
      }
    }
    expect(soLanDo).toBeGreaterThan(20)
  })

  it('khi đổ thì thu về đúng 10% vốn và mất doanh nghiệp khỏi danh sách', () => {
    // Ép xác suất lên 100% để kiểm cơ chế thay vì chờ may rủi.
    const goc = CONFIG.doanhNghiep.xacSuatPhaSanCoBan
    ;(CONFIG.doanhNghiep as { xacSuatPhaSanCoBan: number }).xacSuatPhaSanCoBan = 1
    try {
      let s = taoGameMoi('bacSi', 33)
      s = { ...s, doanhNghiep: [mot(s, 1)] }
      const von = vonDoanhNghiepNamNay(s, s.doanhNghiep[0]!)
      const sau = choiHetNam(s)
      expect(sau.doanhNghiep).toHaveLength(0)
      const sk = sau.tongKet!.suKien.find((k) => k.loai === 'doanhNghiepPhaSan')!
      expect(sk.tienThayDoi).toBe(Math.round(von * 0.1))
      expect(sk.hanhPhucThayDoi).toBeLessThan(0)
    } finally {
      ;(CONFIG.doanhNghiep as { xacSuatPhaSanCoBan: number }).xacSuatPhaSanCoBan = goc
    }
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — doanh nghiệp có thể phá sản"`
Kỳ vọng: FAIL — `xacSuatDoanhNghiepPhaSan is not defined`.

- [x] **Step 3: Bổ sung khối `doanhNghiep` trong `config.ts`**

Thêm vào khối đã tạo ở Task 6:

```ts
    /** ---------- Rủi ro nền ----------
     * Khác biến cố 🏚️ "doanh nghiệp đóng cửa" của v1.6: cái đó hẹn lịch, một
     * lần một ván, nhắm đúng cái lớn nhất, có lá chắn là không tập trung vốn.
     * Cái này là RỦI RO NỀN — thường xuyên, mù quáng, không có lá chắn nào.
     *
     * Giữ ba doanh nghiệp suốt mười năm thì xác suất mất ít nhất một cái là
     * khoảng 50%. Đây là đường mất vốn quan trọng nhất của v1.7, vì nó đánh
     * thẳng vào nguồn thu nhập thụ động — tức đánh thẳng vào điều kiện thắng.
     * Không có nó thì phá sản mãi mãi đo ra 0% như suốt bản v1.6.
     *
     * Thu hồi 10% — thanh lý vội vàng trong hoảng loạn còn tệ hơn cả thanh lý
     * có trật tự khi vỡ nợ (45%, xem khối `phaSan`).
     */
    xacSuatPhaSanCoBan: 0.02,
    /** mỗi năm sở hữu cộng thêm ngần này vào hệ số xác suất */
    tangRuiRoMoiNam: 0.04,
    heSoRuiRoThiTruong: {
      thinhVuong: 0.5,
      binhThuong: 1,
      suyThoai: 1.6,
      khungHoang: 2.5,
    },
    /** thu hồi được ngần này vốn góp khi doanh nghiệp đổ */
    hoanLaiKhiPhaSan: 0.1,
    matHanhPhuc: 6,
```

- [x] **Step 4: Thêm `xacSuatDoanhNghiepPhaSan` vào `engine.ts`**

```ts
/**
 * Xác suất một doanh nghiệp đổ hẳn trong năm nay. Chặn trên ở 1 để hệ số tuổi
 * doanh nghiệp không bao giờ đẩy xác suất vượt khỏi khoảng hợp lệ trong những
 * ván sống rất dài.
 */
export function xacSuatDoanhNghiepPhaSan(
  s: GameState,
  d: DoanhNghiep,
): number {
  const dn = CONFIG.doanhNghiep
  const soNam = Math.max(0, s.nam - d.namGop)
  return Math.min(
    1,
    dn.xacSuatPhaSanCoBan *
      dn.heSoRuiRoThiTruong[s.thiTruong] *
      (1 + dn.tangRuiRoMoiNam * soNam),
  )
}
```

- [x] **Step 5: Dời khai báo `doanhNghiep` lên trước và thêm bước 3b**

Trong `chuyenNam`: **xoá** dòng `let doanhNghiep = s.doanhNghiep` ở dòng ~1510 (trong bước 7b), rồi thêm ngay sau bước 3 (sau `tienMat += thuNhapBanDoi`):

```ts
  /* --- 3b. Rủi ro nền: doanh nghiệp có thể đổ hẳn (v1.7) ---
   * Đứng SAU bước 3 nên doanh nghiệp vẫn trả thu nhập của năm rồi mới đóng cửa —
   * đúng như đời thật, tiền của năm nay đã về túi trước khi cái quán sập.
   *
   * Trạng thái thị trường đọc `thiTruongTruoc` gián tiếp qua `s.thiTruong`, tức
   * đúng trạng thái người chơi đã nhìn thấy suốt năm — cùng quy ước với mọi phép
   * tính kinh tế khác của bước này (xem chú thích bước 0). */
  let doanhNghiep = s.doanhNghiep
  {
    const dn = CONFIG.doanhNghiep
    const conLai: DoanhNghiep[] = []
    for (const d of doanhNghiep) {
      if (rng.next() >= xacSuatDoanhNghiepPhaSan(s, d)) {
        conLai.push(d)
        continue
      }
      const hoanLai = Math.round(
        vonDoanhNghiepNamNay(s, d) * dn.hoanLaiKhiPhaSan,
      )
      tienMat += hoanLai
      const mat = apHanhPhuc(-dn.matHanhPhuc)
      suKien.push({
        loai: 'doanhNghiepPhaSan',
        tieuDe: `🏚️ ${d.ten} đã đóng cửa`,
        moTa:
          `Cạnh tranh gay gắt dần, khách quen thưa đi, chi phí mặt bằng thì` +
          ` năm nào cũng tăng. Cuối cùng phải sang nhượng lại, thu về` +
          ` ${dinhDangTien(hoanLai)} — một phần nhỏ của số vốn đã bỏ ra.`,
        tienThayDoi: hoanLai,
        hanhPhucThayDoi: mat,
      })
    }
    doanhNghiep = conLai
  }
```

Bổ sung `DoanhNghiep` vào import kiểu ở đầu `engine.ts` nếu chưa có.

> Bước 7b (biến cố 🏚️ doanh nghiệp đóng cửa) và bước 11 (thanh lý khi vỡ nợ) vẫn đọc và gán cùng biến `doanhNghiep` này — không phải sửa gì thêm ở đó.

- [x] **Step 6: Thêm `'doanhNghiepPhaSan'` vào `SuKienLoai`**

- [x] **Step 7: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — doanh nghiệp có thể phá sản"`
Kỳ vọng: PASS, cả bốn test.

- [x] **Step 8: Commit**

```bash
git add src/game/config.ts src/game/types.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 rui ro nen: doanh nghiep co the do han

Suot v1.6 pha san do ra 0,0 phan tram o MOI kich ban, ke ca khi khung
hoang day gap doi va sau gap ruoi. Ly do la cau truc chu khong phai tham
so: ba nac vo no chi khoi dong khi tien mat am, ma tien mat chi am khi co
no phai tra — bot can bang khong vay nen khong the pha san.

Day la duong mat von dau tien khong di qua no. Moi doanh nghiep moi nam co
xac suat 2 phan tram do han (nhan 2,5 lan khi khung hoang, tang dan theo
tuoi doanh nghiep), thu ve 10 phan tram von. Giu ba doanh nghiep muoi nam
thi xac suat mat it nhat mot cai la khoang 50 phan tram.

Khac bien co doanh nghiep dong cua cua v1.6: cai do hen lich, mot lan mot
van, co la chan. Cai nay la rui ro nen — thuong xuyen, mu quang, khong co
la chan nao.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Chu kỳ kinh tế khắc nghiệt hơn

Đọc `docs/07-thiet-ke-v1-7.md` mục E.

**Files:**
- Modify: `src/game/config.ts` (khối `thiTruong`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: không có phụ thuộc mới
- Produces: không có API mới — chỉ đổi số

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — chu kỳ kinh tế khắc nghiệt hơn', () => {
  it('mỗi hàng của ma trận chuyển vẫn cộng đủ 1', () => {
    for (const hang of Object.values(CONFIG.thiTruong.maTranChuyen)) {
      const tong = Object.values(hang).reduce((t, x) => t + x, 0)
      expect(tong).toBeCloseTo(1, 10)
    }
  })

  it('khủng hoảng không bao giờ nhảy thẳng về thịnh vượng', () => {
    expect(CONFIG.thiTruong.maTranChuyen.khungHoang.thinhVuong).toBe(0)
  })

  it('khủng hoảng chiếm khoảng 17% số năm trên chặng dài', () => {
    const rng = taoRng(1234, 0)
    let tt: TrangThaiThiTruong = 'binhThuong'
    let dem = 0
    const SO_NAM = 40_000
    for (let i = 0; i < SO_NAM; i++) {
      tt = chuyenTrangThaiThiTruong(rng, tt)
      if (tt === 'khungHoang') dem++
    }
    const tyLe = dem / SO_NAM
    expect(tyLe).toBeGreaterThan(0.14)
    expect(tyLe).toBeLessThan(0.21)
  })

  it('khủng hoảng sâu hơn v1.6 ở cả giá lẫn lợi tức', () => {
    const kh = CONFIG.thiTruong.tacDong.khungHoang
    expect(kh.doLechGia).toBeLessThanOrEqual(-0.45)
    expect(kh.heSoLoiTuc).toBeLessThanOrEqual(0.25)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — chu kỳ kinh tế"`
Kỳ vọng: FAIL — tỉ lệ khủng hoảng đo ra ~0,099 và `doLechGia` là −0,3.

- [x] **Step 3: Đổi ma trận và tác động**

```ts
    maTranChuyen: {
      thinhVuong: { thinhVuong: 0.42, binhThuong: 0.34, suyThoai: 0.16, khungHoang: 0.08 },
      binhThuong: { thinhVuong: 0.2, binhThuong: 0.46, suyThoai: 0.24, khungHoang: 0.1 },
      suyThoai: { thinhVuong: 0.04, binhThuong: 0.3, suyThoai: 0.36, khungHoang: 0.3 },
      khungHoang: { thinhVuong: 0, binhThuong: 0.22, suyThoai: 0.43, khungHoang: 0.35 },
    },
```

```ts
    tacDong: {
      thinhVuong: { doLechGia: 0.1, heSoLoiTuc: 1.15, lechLamPhat: 0, heSoTangLuong: 1.3 },
      binhThuong: { doLechGia: 0, heSoLoiTuc: 1, lechLamPhat: 0, heSoTangLuong: 1 },
      suyThoai: { doLechGia: -0.18, heSoLoiTuc: 0.65, lechLamPhat: 0.02, heSoTangLuong: 0.2 },
      khungHoang: { doLechGia: -0.45, heSoLoiTuc: 0.25, lechLamPhat: 0.07, heSoTangLuong: 0 },
    },
```

Sửa đoạn chú thích "Ma trận này cho ra nhịp nào" cho khớp số mới:

```ts
   * ---------- Ma trận này cho ra nhịp nào (siết lại ở v1.7) ----------
   * Bản v1.6 cho khủng hoảng chiếm 9,9% số năm, một đợt mỗi 13,6 năm. Đo thực
   * nghiệm cho thấy đó là mức mà một danh mục dàn đều vẫn đi qua êm ru. Ma trận
   * v1.7 đẩy lên khoảng 17% số năm và làm sâu hơn hẳn: giá sập 45% thay vì 30%,
   * lợi tức còn một phần tư thay vì một nửa, lạm phát vọt thêm 7 điểm.
   *
   * Đo riêng đòn này ở thực nghiệm vòng hai, tỉ lệ thắng của giáo viên rơi từ
   * 72% xuống 51% — đòn bẩy mạnh thứ hai của cả bản, sau thang tiền.
   *
   * Hai tính chất của v1.6 giữ nguyên: khủng hoảng không bao giờ nhảy thẳng về
   * thịnh vượng (kinh tế hồi phục dần chứ không bật dậy), và suy thoái là cửa
   * ngõ chính vào khủng hoảng.
```

- [x] **Step 4: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — chu kỳ kinh tế"`
Kỳ vọng: PASS, cả bốn test.

- [x] **Step 5: Commit**

```bash
git add src/game/config.ts src/game/engine.test.ts
git commit -m "v1.7 chu ky kinh te khac nghiet hon

Khung hoang tu 9,9 phan tram len khoang 17 phan tram so nam, va sau hon
han: gia sap 45 phan tram thay vi 30, loi tuc con mot phan tu thay vi mot
nua, lam phat vot them 7 diem.

Do rieng don nay o thuc nghiem vong hai, ti le thang cua giao vien roi tu
72 phan tram xuong 51 phan tram.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Giá hạnh phúc neo theo mặt bằng sống

Đọc `docs/07-thiet-ke-v1-7.md` mục F. **Đây là sửa chữa quyết định việc ba nghề có siết đều được hay không.**

**Files:**
- Modify: `src/game/config.ts` (khối `matBangSong`)
- Modify: `src/game/engine.ts` (`heSoMatBangSong`; ba chỗ gọi: thẻ tiêu dùng, ước nguyện, phí chuyên gia)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `NGHE` với `chiPhi` mới (Task 1)
- Produces: `export function heSoMatBangSong(s: GameState): number`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — giá hạnh phúc neo theo mặt bằng sống', () => {
  it('ba nghề trả cùng một tỉ lệ thu nhập cho cùng một tấm thẻ', () => {
    const tyLe = NGHE.map((nghe) => {
      const s = taoGameMoi(nghe.id, 41)
      return (18 * TRIEU * heSoMatBangSong(s)) / nghe.luong
    })
    // Trước v1.7 ba tỉ lệ này là 10% / 5% / 3% — nghề lương cao gần như miễn
    // nhiễm với cửa thua duy nhất của game.
    expect(Math.max(...tyLe) - Math.min(...tyLe)).toBeLessThan(0.01)
  })

  it('bác sĩ là mốc chuẩn, hệ số bằng 1', () => {
    const s = taoGameMoi('bacSi', 42)
    expect(heSoMatBangSong(s)).toBeCloseTo(1, 2)
  })

  it('hệ số không nhân đôi lạm phát', () => {
    const s = taoGameMoi('bacSi', 43)
    const sau = { ...s, chiPhiHangNam: s.chiPhiHangNam * 3, chiSoGia: 3 }
    expect(heSoMatBangSong(sau)).toBeCloseTo(heSoMatBangSong(s), 6)
  })

  it('sống sang thì cùng một niềm vui cũng đắt hơn', () => {
    const tietKiem = taoGameMoi('bacSi', 44, {
      xuatThanId: 'thuanNong',
      heSoLuongKhoiDiem: 0.75,
    })
    const sangTrong = taoGameMoi('bacSi', 44, {
      xuatThanId: 'khaGia',
      heSoLuongKhoiDiem: 1.25,
    })
    expect(heSoMatBangSong(sangTrong)).toBeGreaterThan(
      heSoMatBangSong(tietKiem) * 1.3,
    )
  })

  it('giá tài sản và giá cơ hội KHÔNG bị nhân hệ số này', () => {
    const s = taoGameMoi('kySuPhanMem', 45)
    // giaThucTe chỉ nhân chỉ số giá — hệ số mặt bằng sống áp riêng ở ba chỗ gọi
    expect(giaThucTe(s, 100 * TRIEU)).toBe(Math.round(100 * TRIEU * s.chiSoGia))
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — giá hạnh phúc"`
Kỳ vọng: FAIL — `heSoMatBangSong is not defined`.

- [x] **Step 3: Thêm khối `matBangSong` vào `config.ts`**

```ts
  /** ---------- Mặt bằng sống ----------
   * Trước v1.7 thẻ tiêu dùng và ước nguyện dùng chung một bảng giá tuyệt đối cho
   * cả ba nghề: tấm vé Phú Quốc 18 triệu ngốn 10% lương giáo viên nhưng chỉ 3%
   * lương kỹ sư phần mềm. Hệ quả là người lương cao gần như MIỄN NHIỄM với cửa
   * thua duy nhất của game, còn giáo viên gánh trọn — đo thực nghiệm cho thấy
   * siết cách nào cũng ra 48% / 78% / 82%.
   *
   * Nay mọi khoản mua hạnh phúc nhân thêm chi phí sinh hoạt của nhân vật chia
   * cho mốc chuẩn. Vì lấy `chiPhiHangNam` thật nên hệ số tự động gồm cả xuất
   * thân, bậc lương, cưới xin và số con.
   *
   * Bài học kèm theo là bài học tài chính cá nhân quan trọng nhất mà game chưa
   * hề dạy: LẠM PHÁT LỐI SỐNG. Sống sang thì cùng một niềm vui cũng đắt hơn, và
   * đó là lý do lương cao không tự động dẫn tới tự do.
   *
   * KHÔNG áp cho phí bảo hiểm y tế, bảo hiểm xe, học phí đại học của con và viện
   * phí: các khoản đó đã neo vào `chiPhiHangNam` hoặc `luong` sẵn rồi, nhân thêm
   * là nhân hai lần.
   */
  matBangSong: {
    /** chi phí sinh hoạt gốc của bác sĩ — mốc giữa của ba nghề */
    chuan: 102 * TRIEU,
  },
```

- [x] **Step 4: Thêm `heSoMatBangSong` vào `engine.ts`**

Đặt ngay cạnh `giaThucTe`:

```ts
/**
 * Hệ số mặt bằng sống: cùng một niềm vui thì người sống sang phải trả nhiều hơn.
 * Chia cho `chiSoGia` để KHÔNG nhân đôi lạm phát — mọi chỗ gọi đều đã bọc
 * `giaThucTe`, vốn đã nhân chỉ số giá rồi.
 */
export function heSoMatBangSong(s: GameState): number {
  return s.chiPhiHangNam / (CONFIG.matBangSong.chuan * s.chiSoGia)
}
```

- [x] **Step 5: Áp hệ số ở ba chỗ gọi**

**(a) Thẻ tiêu dùng** — tìm nơi `reducer` xử lý `case 'quyetDinhThe'` và trừ tiền thẻ. Bọc giá:

```ts
      const gia = Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))
```

**(b) Ước nguyện** — trong `giaUocNguyen` (dòng ~520):

```ts
export function giaUocNguyen(s: GameState, uocNguyenId: string): Tien {
  const un = timUocNguyen(uocNguyenId)
  if (!un) return 0
  // Giá đóng băng thời trẻ vẫn phải nhân mặt bằng sống: người sống sang mua căn
  // hộ ở khu đắt hơn, không phải cùng một căn hộ với giá rẻ hơn.
  const heSo = heSoMatBangSong(s)
  return s.uocNguyenDaMat.includes(uocNguyenId)
    ? Math.round(giaThucTe(s, un.gia) * heSo)
    : Math.round(un.gia * heSo)
}
```

**(c) Phí chuyên gia** — `phiChuyenGiaTamLy` và `phiChuyenGiaTaiChinh` đã neo vào `s.chiPhiHangNam` nên **đã tự động đúng**; không sửa. Thêm chú thích vào `heSoPhiChuyenGia`:

```ts
// Hai gói chuyên gia neo thẳng vào `chiPhiHangNam` nên đã tự bám mặt bằng sống —
// nhân thêm `heSoMatBangSong` ở đây là nhân hai lần (v1.7).
```

> **Quan trọng:** tìm mọi chỗ khác đang hiển thị giá thẻ hoặc giá ước nguyện trong `src/ui/` và bọc cùng hệ số, nếu không màn hình sẽ báo một giá còn engine trừ một giá khác. Task 14 rà soát lại lần nữa.

- [x] **Step 6: Sửa `sim.ts` cho khớp**

Bot đọc giá thẻ ở bước `phase === 'theBai'`:

```ts
      const gia = Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))
```

và giá ước nguyện đã đi qua `giaUocNguyen` nên tự đúng. Bổ sung `heSoMatBangSong` vào danh sách import từ `./engine`.

- [x] **Step 7: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — giá hạnh phúc"`
Kỳ vọng: PASS, cả năm test.

- [x] **Step 8: Chạy toàn bộ test**

Chạy: `npm test`
Kỳ vọng: `engine.test.ts` và `giao-dien.test.ts` xanh. Nếu một test cũ chốt vào giá thẻ tuyệt đối thì sửa nó cho khớp hệ số mới — đó là test cơ chế, phải đúng.

- [x] **Step 9: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/game/sim.ts src/game/engine.test.ts
git commit -m "v1.7 gia hanh phuc neo theo mat bang song

Truoc day the tieu dung va uoc nguyen dung chung mot bang gia tuyet doi
cho ca ba nghe: tam ve Phu Quoc 18tr ngon 10 phan tram luong giao vien
nhung chi 3 phan tram luong ky su. Nguoi luong cao gan nhu MIEN NHIEM voi
cua thua duy nhat cua game — do thuc nghiem cho thay siet cach nao cung ra
48/78/82 phan tram.

Nay moi khoan mua hanh phuc nhan them chi phi sinh hoat chia cho moc chuan,
nen ba nghe tra cung mot ti le thu nhap cho cung mot niem vui. Vi lay
chiPhiHangNam that nen he so tu dong gom ca xuat than, bac luong, cuoi xin
va so con.

Bai hoc kem theo la lam phat loi song — thu ma game chua he day.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Chi phí chăm sóc tuổi già

Đọc `docs/07-thiet-ke-v1-7.md` mục G.3.

**Files:**
- Modify: `src/game/config.ts` (khối `cotTruyen`)
- Modify: `src/game/engine.ts` (`heSoChamSocTuoiGia`, `tinhHeSoChiPhi` dòng ~549)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `tinhHeSoChiPhi` (đã có)
- Produces: `export function heSoChamSocTuoiGia(tuoi: number): number`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — chi phí chăm sóc tuổi già', () => {
  it('chưa tới 75 tuổi thì chưa cộng gì', () => {
    expect(heSoChamSocTuoiGia(60)).toBe(0)
    expect(heSoChamSocTuoiGia(75)).toBe(0)
  })

  it('leo dần rồi chạm trần 60%', () => {
    expect(heSoChamSocTuoiGia(80)).toBeCloseTo(0.15, 6)
    expect(heSoChamSocTuoiGia(85)).toBeCloseTo(0.3, 6)
    expect(heSoChamSocTuoiGia(90)).toBeCloseTo(0.45, 6)
    expect(heSoChamSocTuoiGia(95)).toBeCloseTo(0.6, 6)
    expect(heSoChamSocTuoiGia(100)).toBeCloseTo(0.6, 6)
  })

  it('đích tự do tài chính tự lùi ra khi già đi', () => {
    // Giữ được tự do ở tuổi 60 không có nghĩa là giữ được ở tuổi 85.
    const nam60 = 60 - CONFIG.cotTruyen.tuoiBatDau + 1
    const nam85 = 85 - CONFIG.cotTruyen.tuoiBatDau + 1
    const gia = tinhHeSoChiPhi(true, [], nam60, XUAT_THAN[1]!, 1)
    const raGia = tinhHeSoChiPhi(true, [], nam85, XUAT_THAN[1]!, 1)
    expect(raGia).toBeGreaterThan(gia * 1.25)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — chi phí chăm sóc"`
Kỳ vọng: FAIL — `heSoChamSocTuoiGia is not defined`.

- [x] **Step 3: Thêm cấu hình vào khối `cotTruyen` trong `config.ts`**

Đặt cạnh khối bảo hiểm tuổi già:

```ts
    /** ---------- Chăm sóc tuổi già (v1.7) ----------
     * Thuê người chăm, thuốc men hàng ngày, viện dưỡng lão. Bản v1.6 hoàn toàn
     * không có khoản này, mà ngoài đời nó chính là cái làm người đã về hưu vỡ
     * trận: thu nhập đứng yên trong khi chi phí leo không ngừng.
     *
     * Vì `nghiaVuHangNam` lấy `chiPhiHangNam` làm thành phần chính, cái ĐÍCH tự
     * do tài chính tự lùi ra khi bạn già đi — giữ được tự do ở tuổi 60 không có
     * nghĩa là giữ được ở tuổi 85. Đây là mảnh ghép làm cho chế độ chơi tiếp sau
     * khi thắng có ý nghĩa thật.
     */
    chamSocTuTuoi: 75,
    chamSocTangMoiNam: 0.03,
    chamSocToiDa: 0.6,
```

- [x] **Step 4: Thêm `heSoChamSocTuoiGia` và nối vào `tinhHeSoChiPhi`**

```ts
/** Phần chi phí sinh hoạt cộng thêm do chăm sóc tuổi già. 0 khi chưa tới tuổi. */
export function heSoChamSocTuoiGia(tuoi: number): number {
  const ct = CONFIG.cotTruyen
  if (tuoi <= ct.chamSocTuTuoi) return 0
  return Math.min(ct.chamSocToiDa, ct.chamSocTangMoiNam * (tuoi - ct.chamSocTuTuoi))
}
```

Trong `tinhHeSoChiPhi`, nhân thêm vào kết quả:

```ts
  heSo *= 1 + heSoChamSocTuoiGia(tuoiTaiNam(nam))
```

> Đặt đúng vị trí: sau mọi hệ số hiện có, trước khi trả về. Đọc lại thân hàm để nối vào biến tích luỹ đang dùng (tên biến có thể khác `heSo`).

- [x] **Step 5: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — chi phí chăm sóc"`
Kỳ vọng: PASS, cả ba test.

- [x] **Step 6: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 chi phi cham soc tuoi gia

Sau tuoi 75, chi phi sinh hoat cong them 3 phan tram moi nam, tran 60 phan
tram. Thue nguoi cham, thuoc men hang ngay, vien duong lao — v1.6 hoan
toan khong co khoan nay, ma ngoai doi no chinh la cai lam nguoi da ve huu
vo tran.

Vi nghiaVuHangNam lay chiPhiHangNam lam thanh phan chinh, cai DICH tu do
tai chinh tu lui ra khi ban gia di: giu duoc tu do o tuoi 60 khong co
nghia la giu duoc o tuoi 85.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Hệ số an toàn theo tuổi

Đọc `docs/07-thiet-ke-v1-7.md` mục H.

**Files:**
- Modify: `src/game/config.ts` (khối `tuDoTaiChinh`)
- Modify: `src/game/engine.ts` (`heSoAnToanTheoTuoi`, `mucTieuTuDo` dòng ~246)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `tuoiTaiNam` (đã có, `engine.ts:529`)
- Produces: `export function heSoAnToanTheoTuoi(tuoi: number): number`

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — hệ số an toàn theo tuổi', () => {
  it('nghỉ hưu càng sớm thì đòi hỏi càng cao', () => {
    expect(heSoAnToanTheoTuoi(21)).toBeCloseTo(2.5, 2)
    expect(heSoAnToanTheoTuoi(50)).toBeCloseTo(2.02, 2)
    expect(heSoAnToanTheoTuoi(80)).toBeCloseTo(1.53, 2)
    expect(heSoAnToanTheoTuoi(100)).toBeCloseTo(1.2, 2)
  })

  it('giảm đơn điệu theo tuổi', () => {
    for (let tuoi = 21; tuoi < 100; tuoi++) {
      expect(heSoAnToanTheoTuoi(tuoi + 1)).toBeLessThan(heSoAnToanTheoTuoi(tuoi))
    }
  })

  it('mục tiêu tự do ở tuổi 30 cao hơn hẳn ở tuổi 65 với cùng nghĩa vụ', () => {
    const s = taoGameMoi('bacSi', 51)
    const nam30 = { ...s, nam: 30 - CONFIG.cotTruyen.tuoiBatDau + 1 }
    const nam65 = { ...s, nam: 65 - CONFIG.cotTruyen.tuoiBatDau + 1 }
    expect(mucTieuTuDo(nam30)).toBeGreaterThan(mucTieuTuDo(nam65) * 1.25)
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — hệ số an toàn"`
Kỳ vọng: FAIL — `heSoAnToanTheoTuoi is not defined`.

- [x] **Step 3: Đổi khối `tuDoTaiChinh` trong `config.ts`**

```ts
  tuDoTaiChinh: {
    /** ---------- Hệ số an toàn theo tuổi (v1.7) ----------
     * heSoAnToan(tuoi) = heSoToiThieu + heSoPhuThem × (tuổi viên mãn − tuổi) / quãng đời
     *
     * Tuổi 21 đòi 2,50 · tuổi 40 đòi 2,19 · tuổi 65 đòi 1,78 · tuổi 100 đòi 1,20.
     *
     * Đây chính là quy tắc 4% ngoài đời: nghỉ hưu càng sớm thì tỉ lệ rút an toàn
     * phải càng thấp, vì tiền phải nuôi bạn càng lâu và càng nhiều lần đi qua
     * khủng hoảng. Nó giết thẳng kiểu thắng ở tuổi 31 mà không cần cấm đoán gì —
     * chỉ cần nói đúng sự thật.
     *
     * Con số cũ là 1,5 cố định. Đo thực nghiệm cho thấy hệ số này chỉ dời TUỔI
     * thắng chứ không hạ TỈ LỆ thắng (nâng lên 4,0 vẫn ra 91–94%), nên nó ở đây
     * với tư cách công cụ NHỊP ĐỘ, không phải công cụ độ khó.
     */
    heSoToiThieu: 1.2,
    heSoPhuThem: 1.3,
  },
```

- [x] **Step 4: Thêm `heSoAnToanTheoTuoi` và sửa `mucTieuTuDo`**

```ts
/** Bội số nghĩa vụ mà dòng tiền thụ động phải phủ, giảm dần theo tuổi. */
export function heSoAnToanTheoTuoi(tuoi: number): number {
  const td = CONFIG.tuDoTaiChinh
  const ct = CONFIG.cotTruyen
  const quangDoi = ct.tuoiVienMan - ct.tuoiBatDau
  const conLai = Math.max(0, ct.tuoiVienMan - tuoi)
  return td.heSoToiThieu + td.heSoPhuThem * (conLai / quangDoi)
}

/** Mức dòng tiền thụ động cần đạt để được coi là tự do tài chính. */
export function mucTieuTuDo(s: GameState): Tien {
  return Math.round(
    nghiaVuHangNam(s) * heSoAnToanTheoTuoi(tuoiTaiNam(s.nam)),
  )
}
```

- [x] **Step 5: Sửa `nghiaVuNamDau` nếu nó dùng hệ số cũ**

Đọc `nghiaVuNamDau` (dòng ~265) và mọi chỗ trong `src/ui/` đang nhân `CONFIG.tuDoTaiChinh.heSoAnToan`. Thay bằng `heSoAnToanTheoTuoi(CONFIG.cotTruyen.tuoiBatDau)` ở màn chọn nghề — người chơi đang ở tuổi 21 nên đó là con số đúng để hiện.

Chạy `grep -rn "heSoAnToan" src/` để chắc không sót chỗ nào.

- [x] **Step 6: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — hệ số an toàn"` rồi `npm test`
Kỳ vọng: PASS. Không còn lỗi biên dịch về `CONFIG.tuDoTaiChinh.heSoAnToan`.

- [x] **Step 7: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/ui src/game/engine.test.ts
git commit -m "v1.7 he so an toan giam dan theo tuoi

Truoc day co dinh 1,5. Nay tuoi 21 doi 2,50 va tuoi 100 doi 1,20 — dung
quy tac 4 phan tram ngoai doi: nghi huu cang som thi ti le rut an toan
phai cang thap, vi tien phai nuoi ban cang lau va cang nhieu lan di qua
khung hoang.

Giet thang kieu thang o tuoi 31 ma khong can cam doan gi, chi can noi dung
su that.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Bảo lãnh cho người thân

Đọc `docs/07-thiet-ke-v1-7.md` mục G.2.

**Sai lệch có chủ ý so với tài liệu thiết kế:** tài liệu gọi đây là "biến cố lớn", nhưng nó là một **lựa chọn** chứ không phải một cú giáng, mà `chuyenNam` chạy một mạch không dừng lại hỏi được. Triển khai nó thành một **cơ hội** loại mới (`CoHoiLoai` thêm `'baoLanh'`) để dùng lại trọn vẹn máy móc nhận/từ chối sẵn có (`coHoiNamNay`, `quyetDinhCoHoi`, giao diện `TabKinhDoanh`). Ý đồ thiết kế giữ nguyên: hai bên đều có giá, không có đáp án đúng.

**Files:**
- Modify: `src/game/types.ts` (`CoHoiLoai`, `GameState.namVoBaoLanh`, `SuKienLoai` thêm `'baoLanh'`)
- Modify: `src/game/config.ts` (khối `baoLanh`)
- Modify: `src/game/content.ts` (một mục `CO_HOI` loại `baoLanh`)
- Modify: `src/game/engine.ts` (`taoGameMoi`, `case 'quyetDinhCoHoi'`, bước mới trong `chuyenNam`)
- Modify: `src/game/luu.ts`, `src/game/sim.ts`
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `vayToiDa` (đã có) — **không dùng**, xem lý do bên dưới
- Produces: `GameState.namVoBaoLanh: number` (−1 nghĩa là không có khoản bảo lãnh nào đang treo)

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — bảo lãnh cho người thân', () => {
  it('ván mới chưa có khoản bảo lãnh nào treo', () => {
    expect(taoGameMoi('bacSi', 61).namVoBaoLanh).toBe(-1)
  })

  it('từ chối thì mất hạnh phúc nhưng không gánh rủi ro', () => {
    let s = taoGameMoi('bacSi', 62)
    const co = timCoHoi('baoLanhNguoiThan')!
    s = { ...s, coHoiNamNay: [co], nam: 12 }
    const truoc = s.hanhPhuc
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: 'baoLanhNguoiThan',
      nhan: false,
    })
    expect(sau.hanhPhuc).toBeLessThan(truoc)
    expect(sau.namVoBaoLanh).toBe(-1)
  })

  it('nhận thì được hạnh phúc ngay và có thể phải gánh nợ về sau', () => {
    let s = taoGameMoi('bacSi', 63)
    const co = timCoHoi('baoLanhNguoiThan')!
    s = { ...s, coHoiNamNay: [co], nam: 12 }
    const truoc = s.hanhPhuc
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: 'baoLanhNguoiThan',
      nhan: true,
    })
    expect(sau.hanhPhuc).toBeGreaterThan(truoc)
    // Tất định theo seed: hoặc không vỡ (-1), hoặc hẹn một năm trong tương lai
    expect(sau.namVoBaoLanh === -1 || sau.namVoBaoLanh > s.nam).toBe(true)
  })

  it('khi vỡ thì khoản nợ đến thẳng, không xét hạn mức vay', () => {
    let s = taoGameMoi('bacSi', 64)
    s = { ...s, nam: 20, namVoBaoLanh: 21, khoanVay: [] }
    const sau = choiHetNam(s)
    expect(sau.khoanVay.length).toBe(1)
    expect(sau.namVoBaoLanh).toBe(-1)
    const sk = sau.tongKet!.suKien.find((k) => k.loai === 'baoLanh')!
    expect(sk.hanhPhucThayDoi).toBeLessThan(0)
  })

  it('không bao giờ mời bảo lãnh trước tuổi tối thiểu', () => {
    for (let seed = 0; seed < 60; seed++) {
      let s = taoGameMoi('bacSi', seed)
      for (let i = 0; i < 8 && s.trangThai === 'dangChoi'; i++) {
        const coBaoLanh = s.coHoiNamNay.some((c) => c.loai === 'baoLanh')
        if (coBaoLanh) {
          expect(tuoiTaiNam(s.nam)).toBeGreaterThanOrEqual(
            CONFIG.baoLanh.tuoiToiThieu,
          )
        }
        s = choiHetNam(s)
      }
    }
  })
})
```

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — bảo lãnh"`
Kỳ vọng: FAIL — `namVoBaoLanh` là `undefined`.

- [x] **Step 3: Mở rộng kiểu trong `types.ts`**

```ts
// CoHoiLoai thêm 'baoLanh'
export type CoHoiLoai = 'kinhDoanh' | 'canhBac' | 'toChucSuKien' | 'baoLanh'

// SuKienLoai thêm 'baoLanh'

// GameState thêm:
  /** ---------- Bảo lãnh cho người thân (v1.7) ---------- */
  /**
   * Năm mà khoản bảo lãnh đã nhận sẽ vỡ và thành nợ của người chơi; -1 nghĩa là
   * không có khoản nào đang treo. Chốt ngay lúc nhận (tất định theo seed) chứ
   * không tung xúc xắc mỗi năm — cùng khuôn với lịch cưới hỏi và lịch biến cố.
   */
  namVoBaoLanh: number
```

- [x] **Step 4: Thêm khối `baoLanh` vào `config.ts`**

```ts
  /** ---------- Bảo lãnh cho người thân (v1.7) ----------
   * Em trai vay ngân hàng mua nhà, nhờ bạn đứng tên bảo lãnh.
   *
   * ---------- Vì sao đây là mảnh ghép then chốt ----------
   * Ba nấc vỡ nợ chỉ khởi động khi tiền mặt âm, mà tiền mặt chỉ âm khi có nợ
   * phải trả. Người chơi cẩn thận không vay thì KHÔNG THỂ phá sản, bất kể khủng
   * hoảng nặng tới đâu — đó là lý do v1.6 đo phá sản ra 0% ở mọi kịch bản. Đây
   * là đường vào nợ mà cả người chơi cẩn thận nhất cũng dính, và ngoài đời đúng
   * là cách rất nhiều gia đình Việt Nam mất sạch.
   *
   * Khoản nợ khi vỡ KHÔNG xét `vayToiDa`: người chơi không chọn vay, ngân hàng
   * chỉ đơn giản đến đòi. Đó chính là điểm mấu chốt — nếu kẹp nó vào hạn mức thì
   * nó lại thành một khoản vay bình thường và mất sạch ý nghĩa.
   *
   * Lá chắn duy nhất là từ chối và chịu mất hạnh phúc cùng tiếng xấu trong họ.
   * Một quyết định thật, không có đáp án đúng.
   */
  baoLanh: {
    tuoiToiThieu: 30,
    /** xác suất được mời trong một năm hợp lệ */
    xacSuatMoi: 0.06,
    hanhPhucKhiNhan: 8,
    hanhPhucKhiTuChoi: 10,
    /** xác suất người thân vỡ nợ sau khi đã nhận bảo lãnh */
    xacSuatVo: 0.35,
    voSauItNhat: 3,
    voSauNhieuNhat: 8,
    /** gốc khoản nợ phải gánh = tỉ lệ này × chi phí sinh hoạt của năm vỡ */
    gocTheoChiPhi: 2.5,
    kyHan: 10,
    hanhPhucKhiVo: 12,
  },
```

- [x] **Step 5: Thêm mục cơ hội vào `content.ts`**

```ts
  /* ---------- Chung: bảo lãnh ---------- */
  {
    id: 'baoLanhNguoiThan',
    ten: 'Em trai nhờ đứng tên bảo lãnh',
    moTa:
      'Em trai vay ngân hàng mua nhà, thiếu người bảo lãnh. Nhận thì cả họ nể,' +
      ' từ chối thì mang tiếng. Nếu em ấy trả không nổi, ngân hàng sẽ tìm tới bạn.',
    emoji: '🤝',
    loai: 'baoLanh',
    gia: 0,
    namToiThieu: 10,
  },
```

> `namToiThieu: 10` tương ứng tuổi 30 (năm 1 = tuổi 21). Kiểm tra lại rằng `rutCoHoi` có lọc theo `namToiThieu`; nếu logic lọc khác thì thêm điều kiện tuổi trực tiếp vào chỗ rút.

- [x] **Step 6: Khởi tạo `namVoBaoLanh` trong `taoGameMoi`**

Thêm `namVoBaoLanh: -1,` vào vật thể `GameState` khởi tạo (dòng ~844 khu vực `trangThai: 'dangChoi'`).

- [x] **Step 7: Xử lý quyết định trong `case 'quyetDinhCoHoi'`**

Thêm nhánh ở đầu, trước phần xử lý kinh doanh:

```ts
      if (coHoi.loai === 'baoLanh') {
        const bl = CONFIG.baoLanh
        const rng = taoRng(s.seed, s.rngCursor + s.nam * 977)
        const conLai = s.coHoiNamNay.filter((c) => c.id !== coHoi.id)
        if (!nhan) {
          return {
            ...s,
            coHoiNamNay: conLai,
            hanhPhuc: themHanhPhuc(s.hanhPhuc, -bl.hanhPhucKhiTuChoi),
          }
        }
        const seVo = rng.next() < bl.xacSuatVo
        const namVo = seVo
          ? s.nam + Math.round(rng.khoang(bl.voSauItNhat, bl.voSauNhieuNhat))
          : -1
        return {
          ...s,
          coHoiNamNay: conLai,
          hanhPhuc: themHanhPhuc(s.hanhPhuc, bl.hanhPhucKhiNhan),
          namVoBaoLanh: namVo,
        }
      }
```

- [x] **Step 8: Thêm bước xử lý vỡ bảo lãnh vào `chuyenNam`**

Đặt ngay sau bước 7b (biến cố lớn), trước bước 8:

```ts
  /* --- 7c. Khoản bảo lãnh tới hạn vỡ (v1.7) ---
   * Khoản nợ này KHÔNG đi qua `vayToiDa`: người chơi không chọn vay, ngân hàng
   * chỉ đơn giản đến đòi. Kẹp nó vào hạn mức thì nó lại thành một khoản vay bình
   * thường và mất sạch ý nghĩa. */
  let namVoBaoLanh = s.namVoBaoLanh
  let khoanVayThemBaoLanh: KhoanVay[] = []
  if (namVoBaoLanh > 0 && s.nam >= namVoBaoLanh) {
    const bl = CONFIG.baoLanh
    const goc = Math.round(s.chiPhiHangNam * bl.gocTheoChiPhi)
    const thanhToanMoiNam = Math.round(
      (goc * (1 + CONFIG.laiSuatVay * bl.kyHan)) / bl.kyHan,
    )
    khoanVayThemBaoLanh = [{ goc, thanhToanMoiNam, namConLai: bl.kyHan }]
    const mat = apHanhPhuc(-bl.hanhPhucKhiVo)
    suKien.push({
      loai: 'baoLanh',
      tieuDe: '🤝 Người thân mất khả năng trả nợ',
      moTa:
        `Em trai bạn làm ăn thất bát, ngân hàng đòi tới người bảo lãnh.` +
        ` Khoản vay ${dinhDangTien(goc)} nay là nợ của bạn, trả trong` +
        ` ${bl.kyHan} năm. Chữ ký năm ấy đã đến lúc phải trả giá.`,
      tienThayDoi: 0,
      hanhPhucThayDoi: mat,
    })
    namVoBaoLanh = -1
  }
```

Rồi ở bước 4 hiện có, khoản vay mới phải được nối vào **sau** khi trả nợ của năm (không phải trả ngay năm vỡ). Cách gọn nhất: ở khối trả về cuối `chuyenNam`, đổi `khoanVay` thành `khoanVay: [...khoanVay, ...khoanVayThemBaoLanh]` và thêm `namVoBaoLanh,` vào danh sách trường gán tường minh (cạnh chỗ đang gán `soLanPhaSan`, `camVayDenNam`).

> Kiểm tra hình dạng thật của `KhoanVay` trong `types.ts` trước khi viết — nếu nó có thêm trường (ví dụ `laiSuat`), điền cho đủ.

- [x] **Step 9: Chặn ván cũ trong `luu.ts`**

```ts
    // trường của bản v1.7: thiếu nó thì khoản bảo lãnh không bao giờ vỡ và
    // `namVoBaoLanh > 0` so sánh với undefined ra false một cách âm thầm
    if (typeof s.namVoBaoLanh !== 'number') return null
```

- [x] **Step 10: Cho bot biết quyết định**

Trong `sim.ts`, `ChienLuoc` thêm `nhanBaoLanh: boolean`; `CHIEN_LUOC_CAN_BANG` đặt `nhanBaoLanh: true` (hạnh phúc là ràng buộc thật với bot này). Ở bước 7 của `moPhongMotVan`, mở rộng `chapNhanLoai`:

```ts
      const chapNhanLoai =
        coHoi.loai === 'kinhDoanh'
          ? cl.nhanCoHoiKinhDoanh
          : coHoi.loai === 'toChucSuKien'
            ? cl.nhanToChucSuKien
            : coHoi.loai === 'baoLanh'
              ? cl.nhanBaoLanh
              : cl.nhanCanhBac
```

và cho nhánh `baoLanh` đi thẳng tới `reducer` mà không qua phép kiểm tiền mặt (giá bằng 0):

```ts
      if (coHoi.loai === 'baoLanh') {
        s = reducer(s, {
          type: 'quyetDinhCoHoi',
          coHoiId: coHoi.id,
          nhan: cl.nhanBaoLanh,
        })
        continue
      }
```

Đặt khối này ngay sau khi `coHoi` được lấy ra, trước phần tính đòn bẩy.

- [x] **Step 11: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — bảo lãnh"` rồi `npm test`
Kỳ vọng: PASS, cả năm test.

- [x] **Step 12: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/content.ts src/game/engine.ts src/game/luu.ts src/game/sim.ts src/game/engine.test.ts
git commit -m "v1.7 bao lanh cho nguoi than: duong vao no cua nguoi can than

Ba nac vo no chi khoi dong khi tien mat am, ma tien mat chi am khi co no
phai tra. Nguoi choi can than khong vay thi KHONG THE pha san — do la ly do
v1.6 do pha san ra 0 phan tram o moi kich ban.

Em trai vay ngan hang, nho dung ten bao lanh. Nhan thi duoc hanh phuc ngay
va 35 phan tram kha nang ganh khoan no ay sau 3-8 nam. Tu choi thi mat
hanh phuc va mang tieng trong ho. Khoan no khi vo KHONG xet han muc vay —
nguoi choi khong chon vay, ngan hang chi den doi.

Trien khai thanh mot loai co hoi thay vi bien co lon, de dung lai tron ven
may moc nhan/tu choi san co. Y do thiet ke giu nguyen: hai ben deu co gia.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Phá sản lần hai là thua

Đọc `docs/07-thiet-ke-v1-7.md` mục I.

**Files:**
- Modify: `src/game/config.ts` (khối `phaSan`)
- Modify: `src/game/engine.ts` (nấc 3 của bước 11, `case 'ketThucNam'` dòng ~2245)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `GameState.soLanPhaSan` (đã có)
- Produces: không có API mới

- [x] **Step 1: Viết test thất bại**

```ts
describe('v1.7 — phá sản lần hai là hết', () => {
  it('phá sản lần đầu còn chơi tiếp được', () => {
    let s = taoGameMoi('giaoVien', 71)
    s = { ...s, soLanPhaSan: 0, hanhPhuc: 90 }
    const sau = choiHetNam(s)
    expect(sau.trangThai).toBe('dangChoi')
  })

  it('bước sang lần phá sản thứ hai thì thua ngay', () => {
    let s = taoGameMoi('giaoVien', 72)
    // Dựng thẳng trạng thái: đã ngã một lần, nay tiền mặt âm sâu và không còn gì để bán
    s = {
      ...s,
      soLanPhaSan: 1,
      hanhPhuc: 90,
      tienMat: -s.chiPhiHangNam * 5,
      soHuu: { traiPhieu: 0, coPhieu: 0, vang: 0, crypto: 0, batDongSan: 0 },
      doanhNghiep: [],
      khoanVay: [],
    }
    const sau = choiHetNam(s)
    expect(sau.soLanPhaSan).toBe(2)
    expect(sau.trangThai).toBe('thua')
    expect(sau.lyDoKetThuc).toContain('lần thứ hai')
  })

  it('phá sản lần đầu lấy mất ước nguyện xe nhưng giữ lại căn hộ', () => {
    let s = taoGameMoi('giaoVien', 73)
    s = {
      ...s,
      soLanPhaSan: 0,
      hanhPhuc: 90,
      uocNguyenDaMua: ['xeMay', 'canHo'],
      tienMat: -s.chiPhiHangNam * 5,
      soHuu: { traiPhieu: 0, coPhieu: 0, vang: 0, crypto: 0, batDongSan: 0 },
      doanhNghiep: [],
      khoanVay: [],
    }
    const sau = choiHetNam(s)
    expect(sau.soLanPhaSan).toBe(1)
    expect(sau.uocNguyenDaMua).not.toContain('xeMay')
    expect(sau.uocNguyenDaMua).toContain('canHo')
  })
})
```

> Đọc `describe('v1.6 — ba nấc vỡ nợ')` sẵn có trong `engine.test.ts` và dùng lại đúng cách nó dựng trạng thái tiền mặt âm; các trường trong `soHuu` phải khớp `AssetId` thật.

- [x] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — phá sản lần hai"`
Kỳ vọng: FAIL — `trangThai` là `'dangChoi'` và `xeMay` vẫn còn.

- [x] **Step 3: Thêm cấu hình vào khối `phaSan`**

```ts
    /** ---------- Lần hai là hết (v1.7) ----------
     * Ngã một lần ở tuổi bốn mươi còn đứng dậy được; ngã lần nữa sau khi đã mất
     * năm năm cấm vay và ba năm cấm cơ hội thì không. Đây là cửa thua TÀI CHÍNH
     * đầu tiên của game — suốt v1.6, 100% ván thua là do hạnh phúc.
     */
    soLanToiDa: 2,
    /**
     * Ước nguyện bị bán giải chấp khi phá sản. Luật phá sản ngoài đời chừa lại
     * nhà ở nhưng KHÔNG chừa xe — và về mặt lối chơi, khoản hạnh phúc hàng năm
     * từ căn hộ chính là thứ giúp người chơi gượng dậy.
     */
    uocNguyenBiMat: ['xeMay', 'oTo'] as string[],
```

- [x] **Step 4: Tịch thu ước nguyện xe ở nấc 3**

Trong nấc 3 của bước 11, cạnh chỗ đang xoá `khoanVay` và đặt `tienMat = 0`, thêm:

```ts
    // Bán giải chấp phương tiện đi lại (v1.7). Món bị mất đi vào `uocNguyenDaMat`
    // nên nếu muốn có lại thì phải trả theo giá hôm nay, đúng khuôn của cú mất
    // trộm xe ở v1.4.
    const biMat = s.uocNguyenDaMua.filter((id) =>
      CONFIG.phaSan.uocNguyenBiMat.includes(id),
    )
    uocNguyenDaMua = s.uocNguyenDaMua.filter((id) => !biMat.includes(id))
    uocNguyenDaMat = [...s.uocNguyenDaMat, ...biMat]
```

Khai báo `let uocNguyenDaMua = s.uocNguyenDaMua` và `let uocNguyenDaMat = s.uocNguyenDaMat` trước bước 11, và gán cả hai vào vật thể trả về cuối `chuyenNam`.

- [x] **Step 5: Thêm nhánh thua vào `case 'ketThucNam'`**

Ngay sau `const sau = chuyenNam(s)` (dòng ~2260), **trước** phép kiểm tự do tài chính:

```ts
      if (sau.soLanPhaSan >= CONFIG.phaSan.soLanToiDa) {
        return {
          ...sau,
          phase: 'ketThuc',
          trangThai: 'thua',
          lyDoKetThuc:
            `Phá sản lần thứ hai ở tuổi ${tuoiTaiNam(sau.nam)}.` +
            ` Ngã một lần còn đứng dậy được, nhưng sau năm năm không được vay và` +
            ` ba năm không ai mời làm ăn, cú ngã thứ hai là cú cuối cùng.`,
        }
      }
```

- [x] **Step 6: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — phá sản lần hai"` rồi `npm test`
Kỳ vọng: PASS, cả ba test. `describe('v1.6 — ba nấc vỡ nợ')` phải vẫn xanh.

- [x] **Step 7: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 pha san lan hai la thua, lan dau mat phuong tien di lai

Cua thua TAI CHINH dau tien cua game — suot v1.6, 100 phan tram van thua
la do hanh phuc tut duoi nguong trong muoi mot nam dau.

Nga mot lan o tuoi bon muoi con dung day duoc; nga lan nua sau khi da mat
nam nam cam vay va ba nam cam co hoi thi khong.

Lan dau nay con bi ban giai chap xe may hoac o to, giu lai can ho — luat
pha san ngoai doi chua lai nha o nhung khong chua xe, va khoan hanh phuc
hang nam tu can ho chinh la thu giup nguoi choi guong day.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Giao diện

**Files:**
- Modify: `src/ui/ChonNghe.tsx`, `src/ui/TabSoSach.tsx`, `src/ui/TabKinhDoanh.tsx`, `src/ui/TongKetModal.tsx`
- Test: `src/ui/giao-dien.test.ts`

**Interfaces:**
- Consumes: `heSoBaoHoa` (Task 6), `heSoMatBangSong` (Task 9), `heSoAnToanTheoTuoi` (Task 11), `thueThuNhapCaNhan` (Task 4)
- Produces: không có API mới

- [x] **Step 1: Rà soát giá hiển thị lệch với engine**

Chạy `grep -rn "giaThucTe\|giaUocNguyen\|\.gia" src/ui/` và với **mỗi** chỗ hiện giá thẻ tiêu dùng hoặc giá ước nguyện, bọc `heSoMatBangSong(s)` cho khớp Task 9. Giá tài sản đầu tư và giá cơ hội **không** bọc.

- [x] **Step 2: Viết test giao diện thất bại**

Thêm vào `src/ui/giao-dien.test.ts`, theo đúng khuôn các test sẵn có trong file:

```ts
describe('v1.7 — giao diện phản ánh cơ chế mới', () => {
  it('màn chọn nghề hiện đường cong sự nghiệp của từng nghề', () => {
    for (const nghe of NGHE) {
      expect(nghe.duongCongSuNghiep.length).toBeGreaterThan(0)
    }
    // Lương tuổi 40 phải khác nhau rõ rệt giữa ba nghề — đó là thứ màn chọn nghề
    // cần nói ra, vì lương khởi điểm nay gần như nhau.
    const luongTuoi40 = NGHE.map((nghe) => {
      let luong = nghe.luong
      for (let tuoi = 22; tuoi <= 40; tuoi++) {
        luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
      }
      return luong
    })
    expect(Math.max(...luongTuoi40) / Math.min(...luongTuoi40)).toBeGreaterThan(3)
  })

  it('giá thẻ hiển thị bằng đúng giá engine trừ tiền', () => {
    const s = taoGameMoi('kySuPhanMem', 81)
    const the = s.theConLai[0]!
    const giaHienThi = Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))
    const sau = reducer({ ...s, daTraChiPhiNamNay: true, phase: 'theBai' }, {
      type: 'quyetDinhThe',
      nhan: true,
    })
    expect(s.tienMat - sau.tienMat).toBe(giaHienThi)
  })
})
```

- [x] **Step 3: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/ui/giao-dien.test.ts -t "v1.7 — giao diện"`
Kỳ vọng: FAIL nếu Step 1 còn sót chỗ nào.

- [x] **Step 4: Màn chọn nghề — thêm bảng đường sự nghiệp**

Trong `ChonNghe.tsx`, dưới mỗi thẻ nghề thêm một dòng ba mốc lương (dùng emoji, tiếng Việt đầy đủ):

```tsx
<div className="duong-su-nghiep">
  <span>📈 Lương dự kiến:</span>
  <span>tuổi 30 · {dinhDangTien(luongTaiTuoi(nghe, 30))}</span>
  <span>tuổi 40 · {dinhDangTien(luongTaiTuoi(nghe, 40))}</span>
  <span>tuổi 60 · {dinhDangTien(luongTaiTuoi(nghe, 60))}</span>
</div>
```

với hàm trợ giúp cục bộ trong cùng file:

```tsx
function luongTaiTuoi(nghe: Nghe, denTuoi: number): number {
  let luong = nghe.luong
  for (let tuoi = CONFIG.cotTruyen.tuoiBatDau + 1; tuoi <= denTuoi; tuoi++) {
    luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
  }
  return Math.round(luong)
}
```

Vì lương khởi điểm ba nghề nay gần nhau, **đây là thông tin quyết định của màn chọn nghề** — không có nó thì người chơi không phân biệt được ba lựa chọn.

- [x] **Step 5: Sổ sách — hiện hệ số an toàn theo tuổi và chi phí tuổi già**

Trong `TabSoSach.tsx`, ở khối mục tiêu tự do tài chính, thêm dòng giải thích:

```tsx
<p className="ghi-chu">
  🎯 Ở tuổi {tuoiHienTai(s)}, dòng tiền thụ động phải phủ{' '}
  {heSoAnToanTheoTuoi(tuoiHienTai(s)).toFixed(2)} lần nghĩa vụ hàng năm. Nghỉ hưu
  càng sớm thì đòi hỏi càng cao, vì tiền phải nuôi bạn càng lâu.
</p>
```

Và khi `heSoChamSocTuoiGia(tuoiHienTai(s)) > 0`, thêm một dòng trong bảng chi phí:

```tsx
<li>🧓 Chăm sóc tuổi già: +{Math.round(heSoChamSocTuoiGia(tuoiHienTai(s)) * 100)}% chi phí sinh hoạt</li>
```

- [x] **Step 6: Bảng kinh doanh — hiện mức bão hoà**

Trong `TabKinhDoanh.tsx`, với mỗi doanh nghiệp đang sở hữu, thêm:

```tsx
<span className="bao-hoa">
  ⏳ Thu nhập còn {Math.round(heSoBaoHoa(s, d) * 100)}% so với ngày đầu
  {heSoBaoHoa(s, d) < 0.8 && ' — cân nhắc gây dựng thêm chỗ mới'}
</span>
```

- [x] **Step 7: Tổng kết năm — hiện thuế**

`TongKetModal.tsx` duyệt `tongKet.suKien` nên sự kiện `'thueThuNhap'`, `'doanhNghiepPhaSan'` và `'baoLanh'` **tự hiện**. Kiểm tra xem file có bảng ánh xạ `SuKienLoai` sang icon hoặc màu không; nếu có, thêm ba loại mới vào bảng đó (🧾 thuế, 🏚️ doanh nghiệp đổ, 🤝 bảo lãnh).

- [x] **Step 8: Chạy test để xác nhận xanh**

Chạy: `npm test` rồi `./node_modules/.bin/tsc -b --noEmit`
Kỳ vọng: PASS toàn bộ trừ `balance.test.ts` (Task 15 lo).

- [x] **Step 9: Chạy thử ứng dụng thật**

Chạy: `npm run dev`, mở trình duyệt, chơi năm năm bằng nghề giáo viên. Kiểm bằng mắt: màn chọn nghề hiện ba mốc lương; giá thẻ khớp số tiền bị trừ; tổng kết năm hiện đúng tiếng Việt không viết tắt.

- [x] **Step 10: Commit**

```bash
git add src/ui src/game/engine.test.ts
git commit -m "v1.7 giao dien: duong su nghiep, bao hoa, he so an toan theo tuoi

Man chon nghe hien luong du kien o tuoi 30, 40 va 60 — vi luong khoi diem
ba nghe nay gan nhau nen day moi la thong tin quyet dinh cua man nay.

So sach hien he so an toan theo tuoi va phan chi phi cham soc tuoi gia.
Bang kinh doanh hien muc bao hoa cua tung doanh nghiep.

Ra soat lai moi cho hien gia the tieu dung va uoc nguyen de khop voi he so
mat bang song — man hinh bao mot gia con engine tru mot gia khac la loi
te nhat co the co.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Viết lại balance.test.ts và hiệu chỉnh

Đọc `docs/07-thiet-ke-v1-7.md` mục J. **Đây là task dài nhất và là task duy nhất được phép vặn số cân bằng.**

**Files:**
- Modify: `src/game/balance.test.ts` (viết lại)
- Modify: `src/game/sim.ts` (`KetQuaSim` thêm phân loại lý do thua)
- Modify: `src/game/config.ts` (vặn số ở vòng hiệu chỉnh)
- Modify: `docs/07-thiet-ke-v1-7.md` (ghi lại số đo thật)

**Interfaces:**
- Consumes: mọi thứ từ Task 1–14
- Produces: `KetQuaSim.lyDoThua: 'hanhPhuc' | 'phaSan' | 'hetDoi' | null`

- [x] **Step 1: Thêm phân loại lý do thua vào `sim.ts`**

```ts
export interface KetQuaSim {
  // ...các trường sẵn có...
  /**
   * Vì sao ván không thắng. `null` khi thắng. Suốt v1.6, 100% ván thua là
   * 'hanhPhuc' trong mười một năm đầu — phân loại này tồn tại để đo xem v1.7 có
   * thật sự tạo được cửa thua tài chính hay không.
   */
  lyDoThua: 'hanhPhuc' | 'phaSan' | 'hetDoi' | null
}
```

Ở cuối `moPhongMotVan`:

```ts
  const lyDoThua: KetQuaSim['lyDoThua'] =
    s.trangThai === 'thang'
      ? null
      : s.soLanPhaSan >= CONFIG.phaSan.soLanToiDa
        ? 'phaSan'
        : s.trangThai === 'thua'
          ? 'hanhPhuc'
          : 'hetDoi'
```

và thêm `lyDoThua` vào vật thể trả về. Trong `moPhongNhieuVan`, thêm thống kê:

```ts
    tyLeThuaVi: {
      hanhPhuc: kq.filter((k) => k.lyDoThua === 'hanhPhuc').length / soVan,
      phaSan: kq.filter((k) => k.lyDoThua === 'phaSan').length / soVan,
      hetDoi: kq.filter((k) => k.lyDoThua === 'hetDoi').length / soVan,
    },
    tyLeSongTronDoi: kq.filter((k) => k.soNam >= 79).length / soVan,
```

- [x] **Step 2: Viết bộ test cân bằng mới**

Thay toàn bộ nội dung `balance.test.ts`. Giữ nguyên bốn test sau vì chúng đo bất biến chứ không đo ngưỡng: `'chỉ ôm vàng thì giàu mấy cũng không bao giờ tự do tài chính'`, `'chơi ẩu — từ chối mọi thẻ tiêu dùng — thì thua vì hạnh phúc'`, `'tiêu hoang thì về đích chậm hơn tiêu có chọn lọc'`, `'bốn xuất thân không chênh nhau quá 15 điểm phần trăm'`, `'năm bậc lương không chênh nhau quá 15 điểm phần trăm'`.

Thay ba test ngưỡng cũ bằng:

```ts
  it('bot cân bằng thắng 45–55%, đều cả ba nghề', () => {
    const ty: number[] = []
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, 200)
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thắng ${(r.tyLeThang * 100).toFixed(0)}%` +
          ` · tuổi thắng TB ${(20 + (r.soNamTrungBinhKhiThang || 0)).toFixed(0)}` +
          ` · thua vì hạnh phúc ${(r.tyLeThuaVi.hanhPhuc * 100).toFixed(0)}%` +
          ` · phá sản ${(r.tyLeThuaVi.phaSan * 100).toFixed(0)}%` +
          ` · hết đời chưa tự do ${(r.tyLeThuaVi.hetDoi * 100).toFixed(0)}%`,
      )
      expect(r.tyLeThang).toBeGreaterThanOrEqual(0.45)
      expect(r.tyLeThang).toBeLessThanOrEqual(0.55)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.1)
  })

  it('tuổi thắng trung bình rơi vào 52–62', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, 200)
      const tuoi = CONFIG.cotTruyen.tuoiBatDau - 1 + r.soNamTrungBinhKhiThang
      expect(tuoi).toBeGreaterThanOrEqual(52)
      expect(tuoi).toBeLessThanOrEqual(62)
    }
  })

  it('chết non vì hạnh phúc không còn chiếm trọn số ván thua', () => {
    // Suốt v1.6 con số này là 100%: mọi ván thua đều chết trong mười một năm đầu
    // vì hạnh phúc, không ván nào thua vì lý do tài chính. Đó là cửa thua không
    // dạy được gì về tiền.
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, 200)
      const soVanThua = 1 - r.tyLeThang
      if (soVanThua < 0.05) continue
      expect(r.tyLeThuaVi.hanhPhuc / soVanThua).toBeLessThanOrEqual(0.4)
    }
  })

  it('có ván sống trọn tới tuổi 100 — nửa sau cuộc đời cuối cùng cũng được chơi', () => {
    // Chỉ tiêu quan trọng nhất của cả bản v1.7. Suốt v1.6 con số này là 0: không
    // ván mô phỏng nào từng sống quá năm thứ 35, nên MỌI kết luận cân bằng của
    // bản đó chỉ nói về chặng đầu đời. Nếu dòng này còn đỏ thì mọi con số khác
    // trong bộ test này đều vô nghĩa.
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, 200)
      expect(r.tyLeSongTronDoi).toBeGreaterThan(0.3)
    }
  })

  it('bot cân bằng có phá sản nhưng hiếm; bot đòn bẩy thì thường xuyên', () => {
    const canBang = moPhongNhieuVan('bacSi', 200)
    const donBay = moPhongNhieuVan('bacSi', 200, CHIEN_LUOC_DON_BAY)
    const tyCanBang =
      canBang.ketQua.filter((k) => k.soLanPhaSan > 0).length / canBang.soVan
    const tyDonBay =
      donBay.ketQua.filter((k) => k.soLanPhaSan > 0).length / donBay.soVan
    // eslint-disable-next-line no-console
    console.log(
      `phá sản — cân bằng ${(tyCanBang * 100).toFixed(1)}%` +
        ` · đòn bẩy ${(tyDonBay * 100).toFixed(1)}%`,
    )
    expect(tyCanBang).toBeGreaterThanOrEqual(0.08)
    expect(tyCanBang).toBeLessThanOrEqual(0.18)
    expect(tyDonBay).toBeGreaterThan(0.3)
  })
```

- [x] **Step 3: Chạy và ghi lại số đo lần đầu**

Chạy: `npm test -- src/game/balance.test.ts`
Kỳ vọng: **nhiều test đỏ**. Chép toàn bộ dòng `console.log` vào một file tạm để so sánh giữa các vòng vặn.

- [x] **Step 4: Vòng hiệu chỉnh — vặn theo đúng thứ tự ưu tiên**

Vặn **một** tham số mỗi lần, chạy lại, ghi số. Thứ tự đã biết từ thực nghiệm (mạnh nhất trước):

1. **Tỉ lệ chi phí/lương** trong `content.ts` — chỉnh `chiPhi` của cả ba nghề cùng lúc để giữ tỉ lệ bằng nhau. Tăng tỉ lệ (ví dụ 0,85 → 0,88) làm khó lên rõ rệt.
2. **`CONFIG.doanhNghiep.xacSuatPhaSanCoBan`** — đòn bẩy duy nhất tạo được ván thua tài chính. Nâng để tăng tỉ lệ phá sản, hạ để giảm.
3. **Dải sinh lời doanh nghiệp** trong `content.ts` — dời tuổi thắng, gần như không đổi tỉ lệ thắng.
4. **`CONFIG.thiTruong.maTranChuyen`** — dời cả hai, nhưng thô; chỉnh cuối cùng.

**KHÔNG vặn:** `hanhPhucNguongThua`, `phatKhatVongMoiNam`, giá thẻ tiêu dùng. Cửa thua hạnh phúc đã chiếm 100% số ván thua ở v1.6; siết thêm chỉ làm tăng đúng cái kiểu thua mà bản này sinh ra để giảm.

Nếu sau năm vòng vẫn không đạt cả năm chỉ tiêu cùng lúc, **dừng lại và ghi nhận giới hạn thật vào `docs/07-thiet-ke-v1-7.md`** thay vì tiếp tục nới — đúng như mục F của v1.6 đã làm. Nới ngưỡng test cho xanh mà không hiểu vì sao là tự lừa mình.

- [x] **Step 5: Ghi số đo thật vào tài liệu thiết kế**

Thêm một mục `## L. Số đo sau khi cài đặt` vào cuối `docs/07-thiet-ke-v1-7.md`: bảng số cuối cùng của cả năm chỉ tiêu, những tham số đã phải vặn khác với thiết kế ban đầu và vì sao, và những chỉ tiêu **không** đạt được kèm lý do.

- [x] **Step 6: Chạy toàn bộ và biên dịch**

Chạy: `npm test` rồi `./node_modules/.bin/tsc -b --noEmit` rồi `npm run build`
Kỳ vọng: tất cả xanh, build thành công.

- [x] **Step 7: Commit**

```bash
git add src/game/balance.test.ts src/game/sim.ts src/game/config.ts src/game/content.ts docs/07-thiet-ke-v1-7.md
git commit -m "v1.7 viet lai bo test can bang va hieu chinh so

Bo test moi do nam chi tieu: ti le thang 45-55 phan tram deu ca ba nghe,
tuoi thang trung binh 52-62, chet non vi hanh phuc khong con chiem tron so
van thua, co van song tron toi tuoi 100, va tuong phan pha san giua bot can
bang voi bot don bay.

Them phan loai ly do thua vao KetQuaSim. Suot v1.6, 100 phan tram van thua
la hanh phuc trong muoi mot nam dau — phan loai nay ton tai de do xem v1.7
co that su tao duoc cua thua tai chinh hay khong.

Chi tieu quan trong nhat la ti le van song tron toi tuoi 100. Suot v1.6 con
so do la 0, nen MOI ket luan can bang cua ban do chi noi ve chang dau doi.

Ghi so do that vao muc L cua tai lieu thiet ke, ke ca nhung chi tieu khong
dat duoc va ly do.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Tự soát kế hoạch

**Phủ tài liệu thiết kế:** A → Task 1 · B → Task 3 · C → Task 4 và 5 · D → Task 2 (sinh lời) và Task 6 (bão hoà) · E → Task 8 · F → Task 9 · G.1 → Task 7 · G.2 → Task 12 · G.3 → Task 10 · H → Task 11 · I → Task 13 · J → Task 15 · K → rải khắp. Mục A phần "ba bậc cơ hội nhỏ" → Task 2. Không có mục nào của thiết kế thiếu task.

**Sai lệch đã ghi rõ:** Task 12 triển khai bảo lãnh thành `CoHoiLoai` thay vì `BienCoId` như tài liệu viết, để dùng lại máy móc nhận/từ chối. Lý do và việc giữ nguyên ý đồ thiết kế đã ghi ngay đầu task đó; Task 15 Step 5 sẽ cập nhật lại tài liệu.

**Nhất quán kiểu:** `heSoBaoHoa(s, d)`, `xacSuatDoanhNghiepPhaSan(s, d)`, `heSoMatBangSong(s)`, `heSoAnToanTheoTuoi(tuoi)`, `heSoChamSocTuoiGia(tuoi)`, `tangLuongThucTheoTuoi(nghe, tuoi)`, `thueThuNhapCaNhan(luongNam, soNguoiPhuThuoc, chiSoGia)` — mỗi tên xuất hiện với đúng một chữ ký ở mọi task. `DoanhNghiep.namGop` do Task 6 tạo và Task 5/7 dùng; Task 5 có ghi chú xử lý nếu chạy trước Task 6.

**Thứ tự phụ thuộc:** Task 5 dùng `CONFIG.thue.thueDoanhNghiep` của Task 4; Task 7 dùng `namGop` của Task 6; Task 9 dùng `chiPhi` của Task 1; Task 14 dùng hàm của Task 4, 6, 9, 11; Task 15 dùng tất cả. Chạy tuần tự 1 → 15.

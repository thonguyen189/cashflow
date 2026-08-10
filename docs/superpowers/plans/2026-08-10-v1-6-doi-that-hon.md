# Bản v1.6 "Đời thật hơn" — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa game Dòng Tiền lại gần đời thật bằng năm hệ thống ăn khớp nhau — xuất thân và lương khởi điểm, chu kỳ kinh tế, quy mô góp vốn, biến cố lớn, và phá sản.

**Architecture:** Toàn bộ toán kinh tế đã tập trung trong `chuyenNam()` của `src/game/engine.ts` và mọi con số cân bằng nằm trong `src/game/config.ts`. Bản này giữ nguyên kiến trúc đó: thêm bước vào chuỗi đã có của `chuyenNam`, thêm khối config, thêm trường vào `GameState`. Không tách file engine mới — engine đã 1641 dòng nhưng là một máy trạng thái tuần tự đọc từ trên xuống, tách ra sẽ làm mất mạch.

**Tech Stack:** Vite + React 18 + TypeScript (strict), Vitest. Không thêm phụ thuộc nào.

## Global Constraints

- **Đặc tả gốc:** `docs/06-thiet-ke-v1-6.md`. Mọi con số lấy từ đó, không tự chế.
- **Tiếng Việt không viết tắt** trong mọi văn bản hiện ra màn hình. Tên biến, tên hàm, chú thích đều tiếng Việt không dấu kiểu camelCase như code sẵn có (`chiPhiHangNam`, `thueChuyenGiaTamLy`).
- **Giao diện phải có icon sinh động** — mỗi mục mới đều mang emoji.
- **Mọi con số cân bằng phải nằm trong `config.ts`**, không rải hằng số trong engine.
- **Số tiền là `Tien = number` nguyên (đồng)**. Luôn `Math.round` sau mọi phép nhân.
- **Phần trăm trong lời kể dùng dấu phẩy**: dùng hàm `soPhanTram` đã có trong `engine.ts`.
- **Không đổi chữ ký hàm theo cách phá lời gọi cũ.** Tham số mới luôn tuỳ chọn và đứng cuối.
- **Chạy `npx vitest run` sau mỗi task.** 165 test hiện có phải luôn xanh.
- **Commit sau mỗi task**, tiếng Việt không dấu, theo khuôn `git log` sẵn có.

## Bản đồ file

| File | Trách nhiệm | Phase đụng tới |
|---|---|---|
| `src/game/config.ts` | Bảng cân bằng — năm khối mới | 1, 2, 3, 4, 5 |
| `src/game/types.ts` | Kiểu dữ liệu, `GameState`, `Action` | 1, 2, 3, 4, 5 |
| `src/game/content.ts` | Nội dung: xuất thân, cơ hội tầm lớn, lời kể biến cố | 1, 3, 4 |
| `src/game/engine.ts` | Toàn bộ toán kinh tế và reducer | 1, 2, 3, 4, 5 |
| `src/game/luu.ts` | Khoá lưu và kiểm tra ván cũ | 1 |
| `src/game/sim.ts` | Bot mô phỏng để đo cân bằng | 3, 4, 5 |
| `src/ui/ChonNghe.tsx` | Màn chọn nghề → hai bước | 1 |
| `src/ui/Hud.tsx` | Thanh chỉ số → thêm ô thị trường | 2 |
| `src/ui/TabKinhDoanh.tsx` | Thẻ cơ hội → thêm thanh trượt quy mô | 3 |
| `src/ui/TongKetModal.tsx` | Bảng tổng kết → dòng chu kỳ, icon sự kiện mới | 2, 4, 5 |
| `src/ui/TabSoSach.tsx` | Sổ sách → giải thích hệ số chi phí | 1 |
| `src/ui/KetThucModal.tsx` | Màn kết → nhắc số lần phá sản | 5 |
| `src/game/engine.test.ts` | Kiểm thử engine | mọi phase |
| `src/game/balance.test.ts` | Kiểm thử cân bằng bằng mô phỏng | 1, 5 |

## Thứ tự phase và lý do

```
Phase 1  Xuất thân và lương khởi điểm     ← độc lập, xuất xưởng được ngay
Phase 2  Chu kỳ kinh tế                    ← độc lập
Phase 3  Quy mô góp vốn                    ← đẻ ra `vonGoc`, phase 4 và 5 cần
Phase 4  Biến cố lớn                       ← cần `vonGoc` (doanh nghiệp đóng cửa)
                                              và trạng thái thị trường (mất việc)
Phase 5  Phá sản                           ← cần `vonGoc` (thanh lý doanh nghiệp)
```

Mỗi phase kết thúc bằng một game chạy được và test xanh. Có thể dừng sau bất kỳ phase nào.

---

# PHASE 1 — Xuất thân và lương khởi điểm

### Task 1: Kiểu dữ liệu, config và bốn xuất thân

**Files:**
- Modify: `src/game/types.ts` (thêm sau `Nghe`, khoảng dòng 23)
- Modify: `src/game/config.ts` (thêm khối `xuatThan` trước khối `chuyenGia`)
- Modify: `src/game/content.ts` (thêm `XUAT_THAN` sau `NGHE`, và `timXuatThan` ở cuối)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `Tien` từ `types.ts`, `TRIEU` từ `config.ts`
- Produces: `XuatThanId`, `XuatThan`, `ThietLapNhanVat`, `THIET_LAP_MAC_DINH`, `XUAT_THAN`, `timXuatThan`, `CONFIG.xuatThan`

- [ ] **Step 1: Viết test thất bại** — thêm vào cuối `src/game/engine.test.ts`

```ts
describe('v1.6 — xuất thân', () => {
  it('có đủ bốn xuất thân, id không trùng nhau', () => {
    expect(XUAT_THAN).toHaveLength(4)
    const ids = XUAT_THAN.map((x) => x.id)
    expect(new Set(ids).size).toBe(4)
    expect(ids).toContain('vienChuc')
  })

  it('vốn nhiều thì chi phí sống cao — đánh đổi chạy đều một chiều', () => {
    const theoVon = [...XUAT_THAN].sort((a, b) => a.tyLeVonBanDau - b.tyLeVonBanDau)
    for (let i = 1; i < theoVon.length; i++) {
      expect(theoVon[i]!.heSoChiPhiSong).toBeGreaterThan(theoVon[i - 1]!.heSoChiPhiSong)
    }
  })

  it('viên chức tỉnh lẻ trung tính ở mọi hệ số — nó là mặc định của ván cũ', () => {
    const x = timXuatThan('vienChuc')!
    expect(x.heSoChiPhiSong).toBe(1)
    expect(x.tyLeNoBanDau).toBe(0)
    expect(x.tyLePhungDuong).toBe(0)
    expect(x.hanhPhucBanDau).toBe(0)
  })

  it('chỉ nhà thuần nông có nợ học phí và phải phụng dưỡng', () => {
    const coNo = XUAT_THAN.filter((x) => x.tyLeNoBanDau > 0)
    expect(coNo.map((x) => x.id)).toEqual(['thuanNong'])
    const coPhungDuong = XUAT_THAN.filter((x) => x.tyLePhungDuong > 0)
    expect(coPhungDuong.map((x) => x.id)).toEqual(['thuanNong'])
  })

  it('năm bậc lương đối xứng quanh 1', () => {
    const bac = CONFIG.xuatThan.bacLuong
    expect(bac).toHaveLength(5)
    expect(bac[2]).toBe(1)
    expect(bac[0]! + bac[4]!).toBeCloseTo(2, 10)
  })
})
```

Thêm `XUAT_THAN, timXuatThan` vào khối `import ... from './content'` ở đầu file test.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "v1.6 — xuất thân"`
Kỳ vọng: FAIL — `XUAT_THAN` chưa tồn tại, lỗi biên dịch.

- [ ] **Step 3: Thêm kiểu vào `src/game/types.ts`**

Chèn ngay sau `export interface Nghe { ... }`:

```ts
export type XuatThanId = 'thuanNong' | 'vienChuc' | 'buonBan' | 'khaGia'

/**
 * Hoàn cảnh gia đình lúc vào đời. Quyết định VỐN ban đầu và một GÁNH NẶNG đi
 * theo suốt ván. Đánh đổi cố ý chạy đều một chiều: vốn càng nhiều thì chi phí
 * sống càng cao, mà `nghiaVuHangNam` lấy chi phí sinh hoạt làm thành phần chính
 * nên cái đích tự do tài chính cũng lùi xa theo.
 */
export interface XuatThan {
  id: XuatThanId
  ten: string
  emoji: string
  moTa: string
  /** vốn ban đầu = tỉ lệ này × lương khởi điểm */
  tyLeVonBanDau: number
  /** nợ học phí ban đầu = tỉ lệ này × lương khởi điểm; 0 nghĩa là không nợ */
  tyLeNoBanDau: number
  /** chi phí sinh hoạt nhân hệ số này suốt ván */
  heSoChiPhiSong: number
  /** cộng vào hạnh phúc khởi điểm */
  hanhPhucBanDau: number
  /** gửi tiền phụng dưỡng = tỉ lệ này × chi phí sinh hoạt, tới `phungDuongDenTuoi` */
  tyLePhungDuong: number
  phungDuongDenTuoi: number
  /** bố mẹ có tích luỹ nên biến cố "bố mẹ ngã bệnh" nhẹ đi */
  boMeCoTichLuy: boolean
}

/** Thiết lập nhân vật chọn ở màn mở đầu, ngoài nghề nghiệp. */
export interface ThietLapNhanVat {
  xuatThanId: XuatThanId
  /** hệ số nhân với lương gốc của nghề */
  heSoLuongKhoiDiem: number
}
```

- [ ] **Step 4: Thêm khối config vào `src/game/config.ts`**

Chèn ngay **trước** dòng `/** ---------- Chuyên gia đồng hành ---------- */`:

```ts
  /** ---------- Xuất thân và bậc lương khởi điểm ----------
   * Ngoài đời hai người cùng nghề có thể chênh nhau cả một gia tài ở vạch xuất
   * phát. Xuất thân lo phần vốn, bậc lương lo phần năng lực.
   *
   * ---------- Vì sao bậc lương phải trừ hạnh phúc ----------
   * Nếu chỉ có tiền thì lương cao LUÔN thắng: lương lớn hơn chi phí nên nhân
   * cùng một tỉ lệ vẫn ra thặng dư lớn hơn. Khoản trừ hạnh phúc mới là vế giữ
   * cân bằng — bậc cao nhất mất 5 điểm mỗi năm, đúng bằng khoản phạt khát vọng,
   * mà hạnh phúc lại là điều kiện thua duy nhất. Người chọn lương cao đang đổi
   * tiền lấy tuổi thọ của ván chơi.
   */
  xuatThan: {
    /** các bậc nhân với lương gốc của nghề */
    bacLuong: [0.75, 0.875, 1, 1.125, 1.25],
    /** lệch 1 phần lương thì chi phí sinh hoạt lệch ngần này phần */
    loiSongTheoLuong: 0.6,
    /** áp lực công việc: hạnh phúc trừ mỗi năm = (hệ số lương − 1) × số này */
    apLucTheoLuong: 20,
  },
```

- [ ] **Step 5: Thêm nội dung vào `src/game/content.ts`**

Chèn ngay sau mảng `NGHE`:

```ts
/** ---------------- Xuất thân ----------------
 * Vốn tính theo TỈ LỆ với lương khởi điểm chứ không phải số tiền tuyệt đối, để
 * cả ba nghề đều cân nhau.
 *
 * Nhà thuần nông là trường hợp đáng chú ý nhất: trong những năm còn phụng dưỡng,
 * hai hệ số triệt tiêu nhau gần hết (0,92 × 1,08 ≈ 0,99) — gánh nặng rơi đúng
 * vào quãng đời cần vốn nhất rồi biến mất sau tuổi 55, để lại lợi thế chi phí
 * thấp cho phần đời còn lại. Ngoài đời cũng thế: người xuất thân khó khăn bị níu
 * ở đoạn đầu, nhưng thói quen tằn tiện là tài sản của đoạn sau.
 */
export const XUAT_THAN: XuatThan[] = [
  {
    id: 'thuanNong',
    ten: 'Nhà thuần nông',
    emoji: '🌾',
    moTa: 'Bố mẹ làm ruộng, bán cả lứa lợn và vay mượn thêm họ hàng mới dồn được cho bạn một khoản nhỏ phòng thân. Đổi lại là khoản nợ học phí phải trả dần và trách nhiệm gửi tiền về quê đỡ đần bố mẹ mỗi tháng, nhưng thói quen tằn tiện thì bạn mang theo suốt đời.',
    tyLeVonBanDau: 0.85,
    tyLeNoBanDau: 0.4,
    heSoChiPhiSong: 0.92,
    hanhPhucBanDau: 5,
    tyLePhungDuong: 0.08,
    phungDuongDenTuoi: 55,
    boMeCoTichLuy: false,
  },
  {
    id: 'vienChuc',
    ten: 'Viên chức tỉnh lẻ',
    emoji: '🏘️',
    moTa: 'Bố mẹ là công chức nhà nước, đủ ăn đủ mặc. Cho bạn một khoản nhỏ làm vốn rồi để bạn tự lo phần còn lại.',
    tyLeVonBanDau: 1,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: false,
  },
  {
    id: 'buonBan',
    ten: 'Buôn bán ngoài phố',
    emoji: '🏢',
    moTa: 'Nhà mặt phố có cửa hàng, bố mẹ dúi cho một khoản kha khá làm vốn. Đổi lại, bạn lớn lên với mức sống mà giờ khó lòng hạ xuống.',
    tyLeVonBanDau: 2,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1.1,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: true,
  },
  {
    id: 'khaGia',
    ten: 'Nhà có của ăn của để',
    emoji: '🏛️',
    moTa: 'Xuất phát trước người ta cả một quãng dài. Nhưng nếp sống sang trọng đi theo bạn suốt đời, và cái đích tự do vì thế cũng lùi xa hơn.',
    tyLeVonBanDau: 3.5,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1.25,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: true,
  },
]
```

Thêm `XuatThan` vào khối `import type { ... } from './types'` ở đầu file, và thêm hàm tra cứu vào cuối file cạnh các hàm `timNghe`, `timUocNguyen`:

```ts
export const timXuatThan = (id: string) => XUAT_THAN.find((x) => x.id === id)
```

- [ ] **Step 6: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ — 165 test cũ cộng 5 test mới.

- [ ] **Step 7: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/content.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 1: kieu du lieu va bon xuat than"
```

---

### Task 2: `taoGameMoi` nhận thiết lập nhân vật

**Files:**
- Modify: `src/game/types.ts` (`GameState`, `Action`)
- Modify: `src/game/engine.ts` (`taoGameMoi` ~dòng 543, `reducer` case `chonNghe` ~dòng 1453)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `XuatThan`, `ThietLapNhanVat`, `XUAT_THAN`, `timXuatThan`, `CONFIG.xuatThan` từ Task 1; `thanhToanMoiNamCuaKhoanVay` đã có sẵn trong `engine.ts`
- Produces: `THIET_LAP_MAC_DINH`, `taoGameMoi(ngheId, seed?, thietLap?)`, `xuatThanHienTai(s)`, `GameState.xuatThanId`, `GameState.heSoLuongKhoiDiem`

- [ ] **Step 1: Viết test thất bại** — thêm vào `describe('v1.6 — xuất thân')`

```ts
  it('mặc định vẫn là viên chức tỉnh lẻ, lương đúng bằng lương gốc của nghề', () => {
    const s = taoGameMoi('giaoVien', SEED)
    expect(s.xuatThanId).toBe('vienChuc')
    expect(s.heSoLuongKhoiDiem).toBe(1)
    expect(s.luong).toBe(timNghe('giaoVien')!.luong)
    expect(s.tienMat).toBe(Math.round(s.luong * 0.4))
    expect(s.khoanVay).toHaveLength(0)
  })

  it('mỗi xuất thân cho đúng số vốn ban đầu', () => {
    for (const x of XUAT_THAN) {
      const s = taoGameMoi('giaoVien', SEED, {
        xuatThanId: x.id,
        heSoLuongKhoiDiem: 1,
      })
      expect(s.tienMat).toBe(Math.round(s.luong * x.tyLeVonBanDau))
      expect(s.hanhPhuc).toBe(CONFIG.hanhPhucBanDau + x.hanhPhucBanDau)
    }
  })

  it('nhà thuần nông vào đời với khoản nợ học phí trả trong mười năm', () => {
    const s = taoGameMoi('giaoVien', SEED, {
      xuatThanId: 'thuanNong',
      heSoLuongKhoiDiem: 1,
    })
    expect(s.khoanVay).toHaveLength(1)
    const no = s.khoanVay[0]!
    expect(no.goc).toBe(Math.round(s.luong * 0.4))
    expect(no.kyHan).toBe(CONFIG.kyHanVayToiDa)
    expect(no.namConLai).toBe(CONFIG.kyHanVayToiDa)
    expect(no.thanhToanMoiNam).toBe(
      thanhToanMoiNamCuaKhoanVay(no.goc, CONFIG.kyHanVayToiDa),
    )
  })

  it('bậc lương nhân đúng vào lương khởi điểm', () => {
    for (const bac of CONFIG.xuatThan.bacLuong) {
      const s = taoGameMoi('bacSi', SEED, {
        xuatThanId: 'vienChuc',
        heSoLuongKhoiDiem: bac,
      })
      expect(s.luong).toBe(Math.round(timNghe('bacSi')!.luong * bac))
    }
  })

  it('action chonNghe truyền được thiết lập nhân vật', () => {
    const s = reducer({} as GameState, {
      type: 'chonNghe',
      ngheId: 'kySuPhanMem',
      seed: SEED,
      thietLap: { xuatThanId: 'khaGia', heSoLuongKhoiDiem: 1.25 },
    })
    expect(s.xuatThanId).toBe('khaGia')
    expect(s.heSoLuongKhoiDiem).toBe(1.25)
  })
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "v1.6 — xuất thân"`
Kỳ vọng: FAIL — `taoGameMoi` chưa nhận tham số thứ ba, `s.xuatThanId` không tồn tại.

- [ ] **Step 3: Thêm trường vào `GameState` và `Action` trong `src/game/types.ts`**

Chèn vào `GameState` ngay sau dòng `khatVongId: string`:

```ts
  /** ---------- Thiết lập nhân vật (v1.6) ---------- */
  xuatThanId: XuatThanId
  /** hệ số nhân với lương gốc của nghề, chọn ở màn mở đầu */
  heSoLuongKhoiDiem: number
```

Đổi dòng đầu của `Action`:

```ts
  | {
      type: 'chonNghe'
      ngheId: string
      seed?: number
      /** thiếu thì dùng THIET_LAP_MAC_DINH — giữ nguyên ý nghĩa mọi lời gọi cũ */
      thietLap?: ThietLapNhanVat
    }
```

- [ ] **Step 4: Sửa `taoGameMoi` trong `src/game/engine.ts`**

Thêm `XUAT_THAN, timXuatThan` vào khối import từ `./content`, và `ThietLapNhanVat, XuatThan` vào khối `import type` từ `./types`.

Thêm ngay **trước** `export function taoGameMoi`:

```ts
/**
 * Xuất thân mặc định là viên chức tỉnh lẻ — cái duy nhất trung tính ở mọi hệ số,
 * nên mọi lời gọi `taoGameMoi(ngheId, seed)` có từ trước v1.6 giữ nguyên ý nghĩa.
 */
export const THIET_LAP_MAC_DINH: ThietLapNhanVat = {
  xuatThanId: 'vienChuc',
  heSoLuongKhoiDiem: 1,
}

export const xuatThanHienTai = (s: GameState): XuatThan =>
  timXuatThan(s.xuatThanId) ?? XUAT_THAN[1]!
```

Đổi chữ ký và phần đầu thân hàm. Tham số mới đứng **cuối**, không chèn vào giữa —
đẩy `seed` xuống vị trí thứ ba sẽ phá toàn bộ lời gọi `taoGameMoi(ngheId, seed)`
đang có trong `engine.test.ts` và `sim.ts`:

```ts
export function taoGameMoi(
  ngheId: string,
  seed = Math.floor(Math.random() * 1e9),
  thietLap: ThietLapNhanVat = THIET_LAP_MAC_DINH,
): GameState {
  const nghe = timNghe(ngheId) ?? NGHE[0]!
  const xuatThan = timXuatThan(thietLap.xuatThanId) ?? XUAT_THAN[1]!
  const rng = taoRng(seed, 0)
  const ct = CONFIG.cotTruyen

  const luong = Math.round(nghe.luong * thietLap.heSoLuongKhoiDiem)
  const vonBanDau = Math.round(luong * xuatThan.tyLeVonBanDau)
  // Nợ học phí là một KhoanVay bình thường, nên nó chiếm chỗ trong hạn mức vay
  // và đội `nghiaVuHangNam` trong mười năm đầu — đúng như đời thật.
  const goc = Math.round(luong * xuatThan.tyLeNoBanDau)
  const khoanVayBanDau: KhoanVay[] =
    goc > 0
      ? [
          {
            id: 'noHocPhi',
            goc,
            kyHan: CONFIG.kyHanVayToiDa,
            thanhToanMoiNam: thanhToanMoiNamCuaKhoanVay(goc, CONFIG.kyHanVayToiDa),
            namConLai: CONFIG.kyHanVayToiDa,
          },
        ]
      : []
```

Trong khối `return { ... }`, đổi bốn dòng và thêm hai dòng:

```ts
    xuatThanId: xuatThan.id,
    heSoLuongKhoiDiem: thietLap.heSoLuongKhoiDiem,

    tienMat: vonBanDau,
    hanhPhuc: CONFIG.hanhPhucBanDau + xuatThan.hanhPhucBanDau,
    luong,
    chiPhiHangNam: Math.round(nghe.chiPhi * heSoChiPhiBanDau),

    khoanVay: khoanVayBanDau,
```

trong đó `heSoChiPhiBanDau` tính ngay trên khối `return`, dùng hàm sẽ mở rộng ở Task 3:

```ts
  const heSoChiPhiBanDau = tinhHeSoChiPhi(false, [], 1, xuatThan, thietLap.heSoLuongKhoiDiem)
```

Ở Task 3 hàm này mới nhận hai tham số cuối; tạm thời truyền đủ và để TypeScript báo
lỗi thì đảo thứ tự hai task. **Cách đúng: làm Task 3 trước bước này.** Nếu đang thực
thi tuần tự, tạm dùng `Math.round(nghe.chiPhi * xuatThan.heSoChiPhiSong)` rồi Task 3
thay bằng lời gọi đầy đủ.

Sửa `reducer` case `chonNghe`:

```ts
    case 'chonNghe':
      return taoGameMoi(a.ngheId, a.seed, a.thietLap ?? THIET_LAP_MAC_DINH)
```

- [ ] **Step 5: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

- [ ] **Step 6: Commit**

```bash
git add src/game/types.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 2: taoGameMoi nhan xuat than va bac luong"
```

---

### Task 3: Chi phí sống, phụng dưỡng và áp lực công việc

**Files:**
- Modify: `src/game/engine.ts` (`tinhHeSoChiPhi` ~dòng 457, `chuyenNam` bước 9 và bước 10)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `xuatThanHienTai`, `CONFIG.xuatThan` từ Task 1 và 2
- Produces: `tinhHeSoChiPhi(daKetHon, conCai, nam, xuatThan, heSoLuongKhoiDiem)`, `apLucCongViec(s): number`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — chi phí sống và áp lực công việc', () => {
  it('chi phí sinh hoạt nhân hệ số lối sống của xuất thân', () => {
    const goc = timNghe('giaoVien')!.chiPhi
    for (const x of XUAT_THAN) {
      // tuổi 21 ở năm 1 nên nhà thuần nông vẫn đang phụng dưỡng
      const heSo = tinhHeSoChiPhi(false, [], 1, x, 1)
      const mongDoi = x.heSoChiPhiSong * (1 + x.tyLePhungDuong)
      expect(heSo).toBeCloseTo(mongDoi, 10)
      expect(Math.round(goc * heSo)).toBeGreaterThan(0)
    }
  })

  it('phụng dưỡng tắt hẳn sau tuổi 55', () => {
    const x = timXuatThan('thuanNong')!
    const namTuoi55 = 55 - CONFIG.cotTruyen.tuoiBatDau + 1
    expect(tinhHeSoChiPhi(false, [], namTuoi55, x, 1)).toBeCloseTo(
      x.heSoChiPhiSong * (1 + x.tyLePhungDuong),
      10,
    )
    expect(tinhHeSoChiPhi(false, [], namTuoi55 + 1, x, 1)).toBeCloseTo(
      x.heSoChiPhiSong,
      10,
    )
  })

  it('bậc lương kéo chi phí sinh hoạt theo đúng 0,6 lần mức lệch', () => {
    const x = timXuatThan('vienChuc')!
    expect(tinhHeSoChiPhi(false, [], 1, x, 1.25)).toBeCloseTo(1.15, 10)
    expect(tinhHeSoChiPhi(false, [], 1, x, 0.75)).toBeCloseTo(0.85, 10)
  })

  it('bậc lương cao nhất trừ đúng 5 điểm hạnh phúc mỗi năm', () => {
    const s = taoGameMoi('giaoVien', SEED, {
      xuatThanId: 'vienChuc',
      heSoLuongKhoiDiem: 1.25,
    })
    expect(apLucCongViec(s)).toBe(-5)
    expect(apLucCongViec({ ...s, heSoLuongKhoiDiem: 0.75 })).toBe(5)
    expect(apLucCongViec({ ...s, heSoLuongKhoiDiem: 1 })).toBe(0)
  })

  it('áp lực công việc tắt hẳn sau khi nghỉ hưu', () => {
    const s = taoGameMoi('giaoVien', SEED, {
      xuatThanId: 'vienChuc',
      heSoLuongKhoiDiem: 1.25,
    })
    expect(apLucCongViec({ ...s, daNghiHuu: true })).toBe(0)
  })

  it('mocTaiSanCuaNghe không đổi theo xuất thân hay bậc lương', () => {
    const moc = mocTaiSanCuaNghe('giaoVien')
    const s = taoGameMoi('giaoVien', SEED, {
      xuatThanId: 'khaGia',
      heSoLuongKhoiDiem: 1.25,
    })
    expect(mocTaiSanCuaNghe(s.ngheId)).toEqual(moc)
  })
})
```

Thêm `apLucCongViec, tinhHeSoChiPhi` vào khối import từ `./engine`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "chi phí sống và áp lực"`
Kỳ vọng: FAIL — `apLucCongViec` chưa tồn tại, `tinhHeSoChiPhi` chỉ nhận ba tham số.

- [ ] **Step 3: Mở rộng `tinhHeSoChiPhi`**

Thay hàm ở `src/game/engine.ts` ~dòng 456:

```ts
/**
 * Hệ số chi phí cố định ở năm `nam`. Gom TẤT CẢ hệ số nhân vào chi phí sinh hoạt
 * về một chỗ: hoàn cảnh gia đình, xuất thân, phụng dưỡng bố mẹ và lối sống theo
 * bậc lương. Rải chúng ra nhiều nơi thì không ai tra được vì sao chi phí của mình
 * khác con số gốc của nghề.
 *
 * Hai tham số cuối để tuỳ chọn: mọi lời gọi ba tham số có từ trước v1.6 vẫn đúng
 * vì viên chức tỉnh lẻ và bậc lương 1 đều trung tính.
 */
export function tinhHeSoChiPhi(
  daKetHon: boolean,
  conCai: readonly number[],
  nam: number,
  xuatThan: XuatThan = XUAT_THAN[1]!,
  heSoLuongKhoiDiem = 1,
): number {
  const ct = CONFIG.cotTruyen
  const conPhungDuong =
    xuatThan.tyLePhungDuong > 0 && tuoiTaiNam(nam) <= xuatThan.phungDuongDenTuoi
  return (
    (1 + (daKetHon ? ct.cuoiTangChiPhi : 0)) *
    Math.pow(1 + ct.conTangChiPhi, soConDangNuoi(conCai, nam)) *
    xuatThan.heSoChiPhiSong *
    (conPhungDuong ? 1 + xuatThan.tyLePhungDuong : 1) *
    (1 + (heSoLuongKhoiDiem - 1) * CONFIG.xuatThan.loiSongTheoLuong)
  )
}

/**
 * Điểm hạnh phúc mỗi năm do bậc lương — âm khi chọn lương cao, dương khi chọn
 * lương thấp. Tắt hẳn sau khi nghỉ hưu: không còn đi làm thì không còn áp lực.
 */
export function apLucCongViec(s: GameState): number {
  if (s.daNghiHuu) return 0
  return Math.round((1 - s.heSoLuongKhoiDiem) * CONFIG.xuatThan.apLucTheoLuong)
}
```

`tuoiTaiNam` đã có sẵn ở `engine.ts` ~dòng 328 nên không cần khai báo thêm.

- [ ] **Step 4: Nối vào `chuyenNam`**

Ở **bước 10** (~dòng 1264), đổi lời gọi:

```ts
  const heSoChiPhi = tinhHeSoChiPhi(
    daKetHon,
    conCai,
    namMoi,
    xuatThanHienTai(s),
    s.heSoLuongKhoiDiem,
  )
```

Ở **bước 9**, chèn ngay sau khối `if (dangTriLieu(s)) { ... }` và trước khối tính
`phatDanhNghia`:

```ts
  // Áp lực công việc của bậc lương đã chọn. Đứng cùng chỗ với phạt khát vọng vì
  // cả hai đều là khoản đều đặn hàng năm, và nó phải nằm TRƯỚC khi chốt hạnh phúc
  // cuối năm để cửa ải thua đọc đúng con số.
  const apLuc = apLucCongViec(s)
  const apLucThucNhan = apLuc !== 0 ? apHanhPhuc(apLuc) : 0
```

Thêm `apLucCongViec: apLucThucNhan` vào đối tượng `TongKetNam` được dựng ở cuối
`chuyenNam`, và thêm trường tương ứng vào `TongKetNam` trong `types.ts`:

```ts
  /** hạnh phúc cộng trừ mỗi năm do bậc lương đã chọn (âm khi lương cao) */
  apLucCongViec: number
```

- [ ] **Step 5: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

- [ ] **Step 6: Commit**

```bash
git add src/game/types.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 3: chi phi song, phung duong va ap luc cong viec"
```

---

### Task 4: Màn chọn nghề hai bước, sổ sách và khoá lưu

**Files:**
- Modify: `src/ui/ChonNghe.tsx` (viết lại thành hai bước)
- Modify: `src/App.tsx` (dòng 45-48 `batDau`, dòng 55)
- Modify: `src/ui/TabSoSach.tsx` (thêm phần giải thích hệ số chi phí)
- Modify: `src/game/engine.ts` (`nghiaVuNamDau` ~dòng 186)
- Modify: `src/game/luu.ts` (khoá lưu)
- Modify: `src/game/config.ts` (`luuKey`)
- Modify: `src/styles.css` (lớp cho bước 2)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: mọi thứ từ Task 1-3
- Produces: `nghiaVuNamDau(nghe, xuatThan?, heSoLuongKhoiDiem?)`, `ChonNghe` gọi `onChon(ngheId, thietLap)`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — mục tiêu tự do đổi theo thiết lập', () => {
  it('nhà khá giả có đích tự do cao hơn nhà thuần nông cùng nghề', () => {
    const nghe = timNghe('giaoVien')!
    const thap = nghiaVuNamDau(nghe, timXuatThan('thuanNong')!, 1)
    const cao = nghiaVuNamDau(nghe, timXuatThan('khaGia')!, 1)
    expect(cao).toBeGreaterThan(thap)
  })

  it('bậc lương cao đẩy đích tự do lên theo', () => {
    const nghe = timNghe('bacSi')!
    const x = timXuatThan('vienChuc')!
    expect(nghiaVuNamDau(nghe, x, 1.25)).toBeGreaterThan(nghiaVuNamDau(nghe, x, 1))
  })

  it('không tham số thì giữ nguyên kết quả cũ', () => {
    const nghe = timNghe('kySuPhanMem')!
    expect(nghiaVuNamDau(nghe)).toBe(nghiaVuNamDau(nghe, timXuatThan('vienChuc')!, 1))
  })

  it('mucTieuTuDo của ván khá giả cao hơn ván thuần nông', () => {
    const a = taoGameMoi('giaoVien', SEED, { xuatThanId: 'thuanNong', heSoLuongKhoiDiem: 1 })
    const b = taoGameMoi('giaoVien', SEED, { xuatThanId: 'khaGia', heSoLuongKhoiDiem: 1 })
    expect(mucTieuTuDo(b)).toBeGreaterThan(mucTieuTuDo(a))
  })
})
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "mục tiêu tự do đổi theo"`
Kỳ vọng: FAIL — `nghiaVuNamDau` chưa nhận tham số xuất thân.

- [ ] **Step 3: Mở rộng `nghiaVuNamDau`**

```ts
/**
 * Nghĩa vụ của năm đầu tiên, dùng cho màn chọn nghề. Nhận thiết lập nhân vật để
 * con số "tự do tài chính khi dòng tiền đạt" hiện đúng ngay lúc người chơi còn
 * đang cân nhắc — đó chính là lúc thông tin ấy có giá trị nhất.
 */
export function nghiaVuNamDau(
  nghe: Nghe,
  xuatThan: XuatThan = XUAT_THAN[1]!,
  heSoLuongKhoiDiem = 1,
): Tien {
  const chiPhi = Math.round(
    nghe.chiPhi * tinhHeSoChiPhi(false, [], 1, xuatThan, heSoLuongKhoiDiem),
  )
  // giữ nguyên phần thân cũ, thay `nghe.chiPhi` bằng `chiPhi`
  // và `nghe.luong` bằng `Math.round(nghe.luong * heSoLuongKhoiDiem)`
}
```

Đọc thân hàm hiện tại ở `engine.ts:186` và thay hai đại lượng đó, giữ nguyên công
thức còn lại.

- [ ] **Step 4: Viết lại `src/ui/ChonNghe.tsx` thành hai bước**

Đổi chữ ký prop thành `onChon: (ngheId: string, thietLap: ThietLapNhanVat) => void`.
Dùng `useState` giữ `ngheId` đã chọn: chưa chọn thì hiện danh sách nghề như cũ (chỉ
đổi `onClick` thành `setNgheDaChon(n.id)`); đã chọn thì hiện bước 2 gồm bốn thẻ xuất
thân và năm nút bậc lương.

Bước 2 phải hiện, cập nhật theo lựa chọn hiện tại:

```tsx
const nghe = timNghe(ngheDaChon)!
const xuatThan = timXuatThan(xuatThanId)!
const luong = Math.round(nghe.luong * bacLuong)
const chiPhi = Math.round(nghe.chiPhi * tinhHeSoChiPhi(false, [], 1, xuatThan, bacLuong))
const von = Math.round(luong * xuatThan.tyLeVonBanDau)
const no = Math.round(luong * xuatThan.tyLeNoBanDau)
const apLuc = Math.round((1 - bacLuong) * CONFIG.xuatThan.apLucTheoLuong)
const dichTuDo = nghiaVuNamDau(nghe, xuatThan, bacLuong)
```

Mỗi thẻ xuất thân hiện: emoji, tên, mô tả, **💰 Vốn ban đầu** (`dinhDangTien(von)`),
**🧾 Nợ học phí** nếu có, **🏠 Chi phí sống** (`×1,10` kiểu Việt Nam — dùng
`String(x.heSoChiPhiSong).replace('.', ',')`), **👨‍👩‍👦 Gửi về quê** nếu có.

Khối bậc lương hiện năm nút và ba dòng số đổi theo: `💰 Lương mỗi năm`,
`🏠 Chi phí mỗi năm`, `😰 Áp lực mỗi năm` (hiện `−5 hạnh phúc` hoặc `+5 hạnh phúc`,
màu đỏ khi âm, xanh khi dương), cộng dòng `🕊️ Tự do tài chính khi dòng tiền đạt`.

Nút cuối `▶️ Bắt đầu` gọi `onChon(ngheDaChon, { xuatThanId, heSoLuongKhoiDiem: bacLuong })`.
Nút `◀️ Chọn lại nghề` đưa `ngheDaChon` về `null`.

- [ ] **Step 5: Nối vào `src/App.tsx`**

```tsx
  const batDau = (ngheId: string, thietLap: ThietLapNhanVat) => {
    setTab('trangChu')
    setState(taoGameMoi(ngheId, undefined, thietLap))
  }
```

Thêm `import type { Action, GameState, ThietLapNhanVat } from './game/types'`.

- [ ] **Step 6: Thêm phần giải thích vào `src/ui/TabSoSach.tsx`**

Ở dòng chi phí sinh hoạt, thêm các nhãn nhỏ đang có hiệu lực: `🏠 lối sống ×1,10`,
`👨‍👩‍👦 phụng dưỡng +8%`, `💼 bậc lương ×1,15`, cạnh nhãn `đã tối ưu −8%` sẵn có.

- [ ] **Step 7: Nâng khoá lưu**

`src/game/config.ts`: `luuKey: 'dong-tien-luu-v1-6'`.

`src/game/luu.ts`: thêm `'dong-tien-luu-v1-5'` vào `KHOA_LUU_CU`, và thêm chốt chặn
trong `taiVan` trước `return s`:

```ts
    // trường của bản v1.6: ván v1.5 không có `heSoLuongKhoiDiem` nên mọi phép
    // nhân chi phí và áp lực hạnh phúc sẽ ra NaN ngay năm đầu tiên
    if (typeof s.heSoLuongKhoiDiem !== 'number') return null
    if (!s.xuatThanId) return null
```

- [ ] **Step 8: Chạy test và thử chạy game**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

Chạy: `npx tsc --noEmit`
Kỳ vọng: không lỗi.

Chạy: `npm run dev` rồi mở trình duyệt — chọn nghề, chọn xuất thân, kéo bậc lương,
xác nhận ba con số đổi theo và bấm Bắt đầu vào được ván mới.

- [ ] **Step 9: Commit**

```bash
git add src/ui/ChonNghe.tsx src/App.tsx src/ui/TabSoSach.tsx src/game/engine.ts src/game/luu.ts src/game/config.ts src/styles.css src/game/engine.test.ts
git commit -m "v1.6 buoc 4: man chon nghe hai buoc va so sach giai thich he so chi phi"
```

---

### Task 5: Cân bằng phase 1

**Files:**
- Modify: `src/game/sim.ts` (`moPhongMotVan`, `moPhongNhieuVan`)
- Test: `src/game/balance.test.ts`

**Interfaces:**
- Consumes: `ThietLapNhanVat`, `THIET_LAP_MAC_DINH` từ Task 2
- Produces: `moPhongMotVan(ngheId, seed, cl?, thietLap?)`, `moPhongNhieuVan(ngheId, soVan, cl?, thietLap?)`

- [ ] **Step 1: Viết test thất bại** — thêm vào `src/game/balance.test.ts`

```ts
  it('bốn xuất thân không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng', () => {
    const ty: number[] = []
    for (const x of XUAT_THAN) {
      const r = moPhongNhieuVan('giaoVien', 120, CHIEN_LUOC_CAN_BANG, {
        xuatThanId: x.id,
        heSoLuongKhoiDiem: 1,
      })
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(`${x.ten.padEnd(24)} thắng ${(r.tyLeThang * 100).toFixed(0)}%`)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.15)
  })

  it('năm bậc lương không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng', () => {
    const ty: number[] = []
    for (const bac of CONFIG.xuatThan.bacLuong) {
      const r = moPhongNhieuVan('bacSi', 120, CHIEN_LUOC_CAN_BANG, {
        xuatThanId: 'vienChuc',
        heSoLuongKhoiDiem: bac,
      })
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(`bậc lương ${bac}  thắng ${(r.tyLeThang * 100).toFixed(0)}%`)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.15)
  })
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/balance.test.ts -t "xuất thân"`
Kỳ vọng: FAIL — `moPhongNhieuVan` chưa nhận tham số thứ tư.

- [ ] **Step 3: Cho bot nhận thiết lập nhân vật**

`src/game/sim.ts`:

```ts
export function moPhongMotVan(
  ngheId: string,
  seed: number,
  cl: ChienLuoc = CHIEN_LUOC_CAN_BANG,
  thietLap: ThietLapNhanVat = THIET_LAP_MAC_DINH,
): KetQuaSim {
  let s = taoGameMoi(ngheId, seed, thietLap)
```

```ts
export function moPhongNhieuVan(
  ngheId: string,
  soVan: number,
  cl?: ChienLuoc,
  thietLap?: ThietLapNhanVat,
) {
  const kq: KetQuaSim[] = []
  for (let i = 0; i < soVan; i++) {
    kq.push(moPhongMotVan(ngheId, 1000 + i * 7919, cl, thietLap))
  }
```

Thêm `THIET_LAP_MAC_DINH` vào import từ `./engine` và `ThietLapNhanVat` vào
`import type` từ `./types`.

- [ ] **Step 4: Chạy test, đọc số**

Chạy: `npx vitest run src/game/balance.test.ts`
Kỳ vọng: PASS. Nếu chênh lệch vượt 15 điểm phần trăm, chỉnh `heSoChiPhiSong` của xuất
thân lệch nhất, hoặc `apLucTheoLuong`, **không** chỉnh `tyLeVonBanDau` — vốn là thứ
người chơi cảm nhận rõ nhất và phải giữ tương phản.

- [ ] **Step 5: Commit**

```bash
git add src/game/sim.ts src/game/balance.test.ts src/game/config.ts
git commit -m "v1.6 buoc 5: can bang xuat than va bac luong"
```

---

**PHASE 1 XONG.** Game chạy được với màn thiết lập nhân vật hai bước. Các phase sau độc lập với phase này.

---

# PHASE 2 — Chu kỳ kinh tế

### Task 6: Kiểu, config ma trận và độ nhạy chu kỳ

**Files:**
- Modify: `src/game/types.ts` (`TrangThaiThiTruong`, `TaiSan.nhayChuKy`, `GameState.thiTruong`, `SuKienLoai`, `TongKetNam`)
- Modify: `src/game/config.ts` (khối `thiTruong`)
- Modify: `src/game/content.ts` (`nhayChuKy` cho năm tài sản)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: không có
- Produces: `TrangThaiThiTruong`, `CONFIG.thiTruong`, `TaiSan.nhayChuKy`, `GameState.thiTruong`, `TongKetNam.thiTruongTruoc/thiTruongSau`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — cấu hình chu kỳ kinh tế', () => {
  const TRANG_THAI = ['thinhVuong', 'binhThuong', 'suyThoai', 'khungHoang'] as const

  it('mỗi hàng của ma trận chuyển cộng lại đúng bằng 1', () => {
    for (const tu of TRANG_THAI) {
      const hang = CONFIG.thiTruong.maTranChuyen[tu]
      const tong = TRANG_THAI.reduce((t, sang) => t + hang[sang], 0)
      expect(tong).toBeCloseTo(1, 10)
    }
  })

  it('khủng hoảng không bao giờ nhảy thẳng lên thịnh vượng', () => {
    expect(CONFIG.thiTruong.maTranChuyen.khungHoang.thinhVuong).toBe(0)
  })

  it('độ lệch giá giảm dần từ thịnh vượng xuống khủng hoảng', () => {
    const lech = TRANG_THAI.map((t) => CONFIG.thiTruong.tacDong[t].doLechGia)
    for (let i = 1; i < lech.length; i++) {
      expect(lech[i]!).toBeLessThan(lech[i - 1]!)
    }
  })

  it('chỉ vàng nghịch chu kỳ, chỉ trái phiếu miễn nhiễm', () => {
    const am = TAI_SAN.filter((t) => t.nhayChuKy < 0).map((t) => t.id)
    expect(am).toEqual(['vang'])
    const khong = TAI_SAN.filter((t) => t.nhayChuKy === 0).map((t) => t.id)
    expect(khong).toEqual(['traiPhieu'])
  })

  it('ván mới bắt đầu ở trạng thái bình thường', () => {
    expect(taoGameMoi('giaoVien', SEED).thiTruong).toBe('binhThuong')
  })
})
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "cấu hình chu kỳ"`
Kỳ vọng: FAIL — `CONFIG.thiTruong` chưa tồn tại.

- [ ] **Step 3: Thêm kiểu vào `src/game/types.ts`**

Chèn sau `export type AssetId = ...`:

```ts
export type TrangThaiThiTruong =
  | 'thinhVuong'
  | 'binhThuong'
  | 'suyThoai'
  | 'khungHoang'
```

Thêm vào `interface TaiSan`, sau `bamLamPhat`:

```ts
  /**
   * Độ nhạy với chu kỳ kinh tế. Biến động mỗi năm cộng thêm
   * `doLechGia × nhayChuKy`. Số âm nghĩa là NGHỊCH chu kỳ — càng hoảng loạn
   * càng đắt, đó là vàng. Số 0 nghĩa là miễn nhiễm, đó là trái phiếu và cũng
   * chính là lý do tồn tại của nó.
   */
  nhayChuKy: number
```

Thêm vào `GameState`, sau `heSoChiPhi`:

```ts
  /** trạng thái chu kỳ kinh tế của năm hiện tại */
  thiTruong: TrangThaiThiTruong
```

Thêm vào `SuKienLoai`: `| 'chuKyKinhTe'`.

Thêm vào `TongKetNam`:

```ts
  /** trạng thái thị trường trước và sau khi chuyển năm, để kể được chuyện đổi chu kỳ */
  thiTruongTruoc: TrangThaiThiTruong
  thiTruongSau: TrangThaiThiTruong
```

- [ ] **Step 4: Thêm khối config**

Chèn vào `src/game/config.ts` ngay trước khối `xuatThan`:

```ts
  /** ---------- Chu kỳ kinh tế ----------
   * Trước v1.6 mỗi kênh rút biến động độc lập, nên danh mục dàn đều luôn êm ru
   * và "đa dạng hoá" chỉ là khẩu hiệu chứ không phải quyết định. Khủng hoảng
   * thật thì cổ phiếu, bất động sản và tiền mã hoá cùng rơi một lượt, doanh
   * nghiệp hụt thu, lạm phát vọt lên — và chỉ vàng với trái phiếu còn đứng vững.
   *
   * ---------- Ma trận này cho ra nhịp nào ----------
   * Tính trên một ván trọn 79 năm (mô phỏng 20.000 ván):
   *   tỉ lệ số năm  thịnh vượng 24,1% · bình thường 43,5% · suy thoái 22,6%
   *                 · khủng hoảng 9,9%
   *   5,8 đợt khủng hoảng mỗi ván — trung bình MỘT ĐỢT MỖI 13,6 NĂM
   *   mỗi đợt kéo dài 1,33 năm
   * Đó là nhịp mà một người Việt Nam đi làm từ đầu thập niên 1990 tới nay đã
   * thật sự sống qua.
   *
   * Hai tính chất cài có chủ ý: khủng hoảng không bao giờ nhảy thẳng về thịnh
   * vượng (kinh tế hồi phục dần chứ không bật dậy), và suy thoái là cửa ngõ
   * chính vào khủng hoảng.
   */
  thiTruong: {
    banDau: 'binhThuong',
    maTranChuyen: {
      thinhVuong: { thinhVuong: 0.52, binhThuong: 0.34, suyThoai: 0.11, khungHoang: 0.03 },
      binhThuong: { thinhVuong: 0.24, binhThuong: 0.54, suyThoai: 0.18, khungHoang: 0.04 },
      suyThoai: { thinhVuong: 0.05, binhThuong: 0.4, suyThoai: 0.33, khungHoang: 0.22 },
      khungHoang: { thinhVuong: 0, binhThuong: 0.28, suyThoai: 0.47, khungHoang: 0.25 },
    },
    /**
     * `doLechGia` cộng vào biến động giá sau khi nhân `nhayChuKy` của từng kênh.
     * `heSoLoiTuc` nhân vào cổ tức, tiền thuê, thu nhập doanh nghiệp, xác suất
     * thăng chức và thưởng Tết. `lechLamPhat` cộng thẳng vào lạm phát của năm —
     * khủng hoảng đẩy lạm phát từ 6% lên 11%, đúng cảnh đình lạm năm 2008.
     */
    tacDong: {
      thinhVuong: { doLechGia: 0.1, heSoLoiTuc: 1.15, lechLamPhat: 0, heSoTangLuong: 1.3 },
      binhThuong: { doLechGia: 0, heSoLoiTuc: 1, lechLamPhat: 0, heSoTangLuong: 1 },
      suyThoai: { doLechGia: -0.1, heSoLoiTuc: 0.8, lechLamPhat: 0.01, heSoTangLuong: 0.3 },
      khungHoang: { doLechGia: -0.3, heSoLoiTuc: 0.5, lechLamPhat: 0.05, heSoTangLuong: 0 },
    },
    /** giá có thể sập chín phần mười nhưng không về không */
    sanBienDong: -0.9,
    ten: {
      thinhVuong: 'Thịnh vượng',
      binhThuong: 'Bình thường',
      suyThoai: 'Suy thoái',
      khungHoang: 'Khủng hoảng',
    },
    icon: {
      thinhVuong: '📈',
      binhThuong: '😐',
      suyThoai: '📉',
      khungHoang: '💥',
    },
  },
```

- [ ] **Step 5: Thêm `nhayChuKy` vào năm tài sản trong `src/game/content.ts`**

| Kênh | Giá trị | Chú thích đi kèm |
|---|---|---|
| `traiPhieu` | `0` | `/** miễn nhiễm — đây là lý do tồn tại của nó */` |
| `coPhieu` | `1.4` | `/** nhạy hơn nền kinh tế, đúng như chỉ số chứng khoán */` |
| `vang` | `-0.5` | `/** NGHỊCH chu kỳ — càng hoảng loạn càng đắt */` |
| `crypto` | `2.0` | `/** khuếch đại mạnh nhất theo cả hai chiều */` |
| `batDongSan` | `1.0` | `/** đi cùng nền kinh tế, thêm quán tính từ lạm phát */` |

- [ ] **Step 6: Khởi tạo `thiTruong` trong `taoGameMoi`**

Thêm vào khối `return`: `thiTruong: CONFIG.thiTruong.banDau,`.

TypeScript sẽ suy kiểu `banDau` thành `string` vì `CONFIG` dùng `as const` —
khai báo `banDau: 'binhThuong' as TrangThaiThiTruong` trong config, hoặc ép kiểu
tại chỗ gọi. Chọn cách đầu để chỗ gọi sạch.

- [ ] **Step 7: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

- [ ] **Step 8: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/content.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 6: cau hinh chu ky kinh te va do nhay tung kenh"
```

---

### Task 7: Chuyển trạng thái và áp chu kỳ lên toàn bộ nền kinh tế

**Files:**
- Modify: `src/game/engine.ts` (hàm mới + `chuyenNam` bước 1, 2, 3, 7, 8)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `CONFIG.thiTruong`, `TaiSan.nhayChuKy`, `GameState.thiTruong` từ Task 6
- Produces: `chuyenTrangThaiThiTruong(rng, hienTai)`, `tacDongThiTruong(t)`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — chu kỳ kinh tế tác động lên nền kinh tế', () => {
  /** Ép trạng thái thị trường rồi đi trọn một năm, trả về bảng tổng kết. */
  const namVoiThiTruong = (t: TrangThaiThiTruong) => {
    const s = { ...moiVan(), thiTruong: t }
    return diTronMotNam(s).tongKet!
  }

  const bienDongCua = (tk: TongKetNam, id: AssetId) =>
    tk.bienDongTaiSan.find((b) => b.id === id)!.bienDong

  it('khủng hoảng kéo cổ phiếu và tiền mã hoá xuống, đẩy vàng lên', () => {
    const kh = namVoiThiTruong('khungHoang')
    const bt = namVoiThiTruong('binhThuong')
    expect(bienDongCua(kh, 'coPhieu')).toBeLessThan(bienDongCua(bt, 'coPhieu'))
    expect(bienDongCua(kh, 'crypto')).toBeLessThan(bienDongCua(bt, 'crypto'))
    expect(bienDongCua(kh, 'vang')).toBeGreaterThan(bienDongCua(bt, 'vang'))
  })

  it('trái phiếu miễn nhiễm với chu kỳ', () => {
    const kh = namVoiThiTruong('khungHoang')
    const tv = namVoiThiTruong('thinhVuong')
    expect(bienDongCua(kh, 'traiPhieu')).toBeCloseTo(bienDongCua(tv, 'traiPhieu'), 10)
  })

  it('biến động giá không bao giờ xuống dưới sàn', () => {
    for (let seed = 0; seed < 60; seed++) {
      const s = { ...taoGameMoi('giaoVien', seed), thiTruong: 'khungHoang' as const }
      const tk = diTronMotNam(s).tongKet!
      for (const b of tk.bienDongTaiSan) {
        expect(b.bienDong).toBeGreaterThanOrEqual(CONFIG.thiTruong.sanBienDong)
      }
    }
  })

  it('lạm phát năm khủng hoảng cao hơn năm bình thường đúng 5 điểm phần trăm', () => {
    const kh = namVoiThiTruong('khungHoang')
    const bt = namVoiThiTruong('binhThuong')
    expect(kh.lamPhat - bt.lamPhat).toBeCloseTo(0.05, 10)
  })

  it('thu nhập doanh nghiệp trong khủng hoảng bằng một nửa mức bình thường', () => {
    const nen = {
      ...moiVan(),
      doanhNghiep: [
        {
          coHoiId: 'nhaTroCongNhan',
          ten: 'Dãy nhà trọ cho công nhân thuê',
          thuNhapNen: 195 * TRIEU,
          chiSoGiaLucMua: 1,
          vonGoc: 1 * TY,
        },
      ],
    }
    const bt = diTronMotNam({ ...nen, thiTruong: 'binhThuong' }).tongKet!
    const kh = diTronMotNam({ ...nen, thiTruong: 'khungHoang' }).tongKet!
    const tienBT = bt.thuNhapDoanhNghiep[0]!.soTien
    const tienKH = kh.thuNhapDoanhNghiep[0]!.soTien
    expect(tienKH / tienBT).toBeCloseTo(0.5, 2)
  })

  it('lương không tăng thực trong khủng hoảng', () => {
    const kh = namVoiThiTruong('khungHoang')
    expect(kh.tangLuong).toBeCloseTo(kh.lamPhat, 3)
  })

  it('trạng thái chỉ chuyển tới nơi ma trận cho phép', () => {
    let s = moiVan()
    for (let i = 0; i < 60 && s.trangThai === 'dangChoi'; i++) {
      const truoc = s.thiTruong
      s = reducer(diTronMotNam(s, 5 * TY), { type: 'dongTongKet' })
      expect(CONFIG.thiTruong.maTranChuyen[truoc][s.thiTruong]).toBeGreaterThan(0)
    }
  })
})
```

Ghi chú: trường `vonGoc` trong test doanh nghiệp thuộc Phase 3. Nếu chạy Phase 2
trước Phase 3, bỏ dòng `vonGoc` đi và thêm lại khi làm Task 9.

Thêm `AssetId, TongKetNam, TrangThaiThiTruong` vào `import type` từ `./types`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "chu kỳ kinh tế tác động"`
Kỳ vọng: FAIL — chu kỳ chưa tác động gì, mọi trạng thái cho cùng kết quả.

- [ ] **Step 3: Thêm hai hàm vào `src/game/engine.ts`**

Chèn ngay trước `function chuyenNam`:

```ts
/**
 * Rút trạng thái thị trường của năm mới theo ma trận chuyển. Cộng dồn xác suất
 * rồi so với một số ngẫu nhiên — cùng khuôn mà `rutThe` và `rutCoHoi` đang dùng.
 */
export function chuyenTrangThaiThiTruong(
  rng: Rng,
  hienTai: TrangThaiThiTruong,
): TrangThaiThiTruong {
  const hang = CONFIG.thiTruong.maTranChuyen[hienTai]
  const r = rng.next()
  let congDon = 0
  for (const sang of DANH_SACH_THI_TRUONG) {
    congDon += hang[sang]
    if (r < congDon) return sang
  }
  return 'binhThuong'
}

const DANH_SACH_THI_TRUONG: readonly TrangThaiThiTruong[] = [
  'thinhVuong',
  'binhThuong',
  'suyThoai',
  'khungHoang',
]

export const tacDongThiTruong = (t: TrangThaiThiTruong) => CONFIG.thiTruong.tacDong[t]
```

`Rng` là kiểu trả về của `taoRng` — nếu chưa export, thêm
`export type Rng = ReturnType<typeof taoRng>` cạnh `taoRng`.

- [ ] **Step 4: Nối vào `chuyenNam`**

**Bước 0 mới**, chèn ngay sau `const apHanhPhuc = ...`:

```ts
  /* --- 0. Chu kỳ kinh tế của năm mới --- */
  const thiTruongTruoc = s.thiTruong
  const thiTruongSau = chuyenTrangThaiThiTruong(rng, thiTruongTruoc)
  const tacDong = tacDongThiTruong(thiTruongSau)
  if (thiTruongSau !== thiTruongTruoc) {
    const tt = CONFIG.thiTruong
    suKien.push({
      loai: 'chuKyKinhTe',
      tieuDe: `${tt.icon[thiTruongSau]} Kinh tế chuyển sang ${tt.ten[thiTruongSau].toLowerCase()}`,
      moTa: MO_TA_CHU_KY[thiTruongSau],
      tienThayDoi: 0,
      hanhPhucThayDoi: 0,
    })
  }
```

Thêm bảng lời kể cạnh `CHUYEN_TUOI_GIA`:

```ts
/** Lời kể khi nền kinh tế đổi chu kỳ — báo chí nói gì, đường phố ra sao. */
const MO_TA_CHU_KY: Record<TrangThaiThiTruong, string> = {
  thinhVuong:
    'Đâu đâu cũng nghe chuyện làm ăn được. Chứng khoán lên từng phiên, đất đai sang tay chóng mặt, người người bàn nhau chuyện đầu tư.',
  binhThuong:
    'Mọi thứ trở lại nhịp bình thường. Không ai giàu lên sau một đêm, cũng không ai mất trắng — kinh tế đi đều những bước chậm.',
  suyThoai:
    'Đơn hàng thưa dần, vài công ty quanh bạn bắt đầu cắt giảm. Người ta thôi nói chuyện đầu tư mà quay sang giữ tiền.',
  khungHoang:
    'Thị trường sụp đổ. Chứng khoán bốc hơi, dự án đắp chiếu, giá cả thì leo thang từng tháng. Chỉ vàng trong két và sổ tiết kiệm là còn nguyên vẹn.',
}
```

**Bước 1** — lạm phát cộng độ lệch:

```ts
  const lamPhat =
    rng.khoang(CONFIG.lamPhatMin, CONFIG.lamPhatMax) + tacDong.lechLamPhat
```

**Bước 2** — trong vòng lặp `for (const ts of TAI_SAN)`:

```ts
    // Lợi tức chỉ chịu chu kỳ ở kênh có nhayChuKy dương. Trái phiếu đứng ngoài —
    // lãi tiền gửi không giảm khi kinh tế xấu, thậm chí còn tăng. Vàng có
    // nhayChuKy âm và vốn không sinh lợi tức nên quy tắc này không đụng tới nó.
    // Một quy tắc, không cần thêm trường nào.
    const heSoLoiTuc = ts.nhayChuKy > 0 ? tacDong.heSoLoiTuc : 1
    const tyLeLoiTuc = rng.khoang(ts.loiTucMin, ts.loiTucMax) * heSoLoiTuc
    const loiTuc = Math.round(soLuong * giaCu * tyLeLoiTuc)
    tienMat += loiTuc

    let bienDong = rng.khoang(ts.bienDongMin, ts.bienDongMax)
    bienDong += tacDong.doLechGia * ts.nhayChuKy
    if (ts.bamLamPhat) bienDong += lamPhat
    bienDong = Math.max(CONFIG.thiTruong.sanBienDong, bienDong)
```

**Bước 3** — thu nhập doanh nghiệp:

```ts
    const soTien = Math.max(
      0,
      Math.round(nen * (1 + bienDong) * tacDong.heSoLoiTuc),
    )
```

**Bước 7** — nhân hệ số vào hai xác suất, tại chỗ so sánh `rng.next() < ...`:

```ts
  // Năm khủng hoảng thì cơ hội thăng chức chỉ còn một nửa, và thưởng Tết cũng vậy.
  const xacSuatThangChuc = CONFIG.suKien.thangChucXacSuat * tacDong.heSoLoiTuc
  const xacSuatThuongTet = CONFIG.suKien.thuongTetXacSuat * tacDong.heSoLoiTuc
```

**Bước 8** — tăng lương thực:

```ts
    const tangThuc =
      rng.khoang(CONFIG.tangLuongThucMin, CONFIG.tangLuongThucMax) *
      tacDong.heSoTangLuong
```

**Cuối hàm** — gán `thiTruong: thiTruongSau` vào đối tượng `sauChuyen`, và thêm
`thiTruongTruoc`, `thiTruongSau` vào `TongKetNam`. Cờ này **phải gán tường minh**
vì phép trải `...s` sẽ mang theo trạng thái cũ.

- [ ] **Step 5: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ. Test cân bằng có thể lệch — nếu tỉ lệ thắng tụt dưới 55%,
ghi lại con số và xử lý ở Task 17, **không** vội chỉnh config ở đây.

- [ ] **Step 6: Commit**

```bash
git add src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 7: chu ky kinh te tac dong len gia, loi tuc, doanh nghiep va luong"
```

---

### Task 8: Hiển thị chu kỳ trên thanh chỉ số và bảng tổng kết

**Files:**
- Modify: `src/ui/Hud.tsx`
- Modify: `src/ui/TongKetModal.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `CONFIG.thiTruong.ten`, `CONFIG.thiTruong.icon`, `GameState.thiTruong`, `TongKetNam.thiTruongTruoc/Sau`
- Produces: không có gì cho task sau

- [ ] **Step 1: Thêm ô thị trường vào `src/ui/Hud.tsx`**

Thêm một ô cạnh ô hạnh phúc:

```tsx
      <div className={`o-hud thi-truong ${state.thiTruong}`}>
        <div className="o-hud-nhan">
          {CONFIG.thiTruong.icon[state.thiTruong]} Thị trường
        </div>
        <div className="o-hud-gia-tri">{CONFIG.thiTruong.ten[state.thiTruong]}</div>
      </div>
```

Trạng thái thị trường là thông tin **công khai** — ngoài đời báo chí cũng nói suốt
ngày về suy thoái. Cái người chơi không biết là năm sau sẽ ra sao.

- [ ] **Step 2: Thêm màu vào `src/styles.css`**

```css
.o-hud.thi-truong.thinhVuong .o-hud-gia-tri { color: var(--xanh); }
.o-hud.thi-truong.suyThoai   .o-hud-gia-tri { color: var(--vang); }
.o-hud.thi-truong.khungHoang .o-hud-gia-tri { color: var(--do); }
```

Dùng đúng tên biến màu đang có trong `styles.css`; nếu tên khác thì lấy theo file.

- [ ] **Step 3: Thêm icon sự kiện vào `src/ui/TongKetModal.tsx`**

`BIEU_TUONG_SU_KIEN` là `Record<SuKienLoai, string>` nên trình biên dịch sẽ tự đòi
mục mới: `chuKyKinhTe: '🌐'`.

Thêm dòng mở đầu bảng tổng kết khi trạng thái đổi:

```tsx
{tk.thiTruongSau !== tk.thiTruongTruoc && (
  <div className={`bang-chu-ky ${tk.thiTruongSau}`}>
    {CONFIG.thiTruong.icon[tk.thiTruongSau]} Kinh tế chuyển từ{' '}
    {CONFIG.thiTruong.ten[tk.thiTruongTruoc].toLowerCase()} sang{' '}
    {CONFIG.thiTruong.ten[tk.thiTruongSau].toLowerCase()}
  </div>
)}
```

- [ ] **Step 4: Kiểm tra bằng mắt**

Chạy: `npx tsc --noEmit` — kỳ vọng không lỗi.
Chạy: `npm run dev`, chơi vài năm, xác nhận ô thị trường đổi và bảng tổng kết kể
chuyện đổi chu kỳ.

- [ ] **Step 5: Commit**

```bash
git add src/ui/Hud.tsx src/ui/TongKetModal.tsx src/styles.css
git commit -m "v1.6 buoc 8: hien thi chu ky kinh te tren hud va tong ket"
```

---

**PHASE 2 XONG.** Thị trường đã có chu kỳ, đa dạng hoá bắt đầu có nghĩa.

---

# PHASE 3 — Quy mô góp vốn và cơ hội tầm lớn

### Task 9: `vonGoc`, tài sản ròng và trần quy mô

**Files:**
- Modify: `src/game/types.ts` (`DoanhNghiep.vonGoc`, `CoHoi.taiSanToiThieu`, `Action.quyetDinhCoHoi`)
- Modify: `src/game/config.ts` (khối `quyMoGopVon`)
- Modify: `src/game/engine.ts` (hàm mới)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `tongTaiSan` đã có sẵn
- Produces: `taiSanRong(s)`, `quyMoToiDa(s, coHoi)`, `vonDoanhNghiepNamNay(s, d)`, `CONFIG.quyMoGopVon`, `DoanhNghiep.vonGoc`, `CoHoi.taiSanToiThieu`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — tài sản ròng và trần quy mô góp vốn', () => {
  it('tài sản ròng trừ đi tổng số tiền còn phải trả của mọi khoản vay', () => {
    const s: GameState = {
      ...moiVan(),
      tienMat: 1 * TY,
      khoanVay: [
        { id: 'a', goc: 500 * TRIEU, kyHan: 10, thanhToanMoiNam: 70 * TRIEU, namConLai: 4 },
      ],
    }
    expect(taiSanRong(s)).toBe(tongTaiSan(s) - 280 * TRIEU)
  })

  it('không nợ thì tài sản ròng bằng tổng tài sản', () => {
    const s = { ...moiVan(), tienMat: 2 * TY, khoanVay: [] }
    expect(taiSanRong(s)).toBe(tongTaiSan(s))
  })

  it('trần quy mô không cho một cơ hội vượt 60% tài sản ròng', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 100 * TY, khoanVay: [] }
    const bac = quyMoToiDa(s, coHoi)
    expect(giaThucTe(s, coHoi.gia) * bac).toBeLessThanOrEqual(
      taiSanRong(s) * CONFIG.quyMoGopVon.tyLeToiDaTheoTaiSan,
    )
    expect(bac).toBe(Math.max(...CONFIG.quyMoGopVon.bac))
  })

  it('trần quy mô không cho vượt tiền mặt đang có', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 900 * TRIEU, khoanVay: [] }
    const bac = quyMoToiDa(s, coHoi)
    expect(giaThucTe(s, coHoi.gia) * bac).toBeLessThanOrEqual(s.tienMat)
    expect(bac).toBe(2)
  })

  it('không đủ tiền cho một suất thì trần bằng 0', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 10 * TRIEU, khoanVay: [] }
    expect(quyMoToiDa(s, coHoi)).toBe(0)
  })

  it('các bậc quy mô tăng dần và bắt đầu từ 1', () => {
    const bac = CONFIG.quyMoGopVon.bac
    expect(bac[0]).toBe(1)
    for (let i = 1; i < bac.length; i++) expect(bac[i]!).toBeGreaterThan(bac[i - 1]!)
  })
})
```

Sửa dòng có `!ndash` thành `!` — đó là lỗi gõ, phải là `timCoHoi('quanCaPhe')!`.

Thêm `quyMoToiDa, taiSanRong` vào import từ `./engine`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "tài sản ròng và trần quy mô"`
Kỳ vọng: FAIL — `taiSanRong` chưa tồn tại.

- [ ] **Step 3: Thêm kiểu**

`src/game/types.ts` — thêm vào `DoanhNghiep`:

```ts
  /**
   * Số tiền THẬT đã bỏ ra khi góp vốn, đã gồm hệ số quy mô. Cần cho cả việc
   * thanh lý khi phá sản lẫn việc xác định doanh nghiệp lớn nhất trong biến cố
   * đóng cửa. Suy ngược từ `timCoHoi(coHoiId).gia` là không đủ vì nó không biết
   * quy mô đã chọn.
   */
  vonGoc: Tien
```

Thêm vào `CoHoi`:

```ts
  /** chỉ xuất hiện khi tài sản ròng đã đạt mức này — cơ hội tầm lớn */
  taiSanToiThieu?: Tien
```

Đổi `Action`:

```ts
  | {
      type: 'quyetDinhCoHoi'
      coHoiId: string
      nhan: boolean
      /** bậc quy mô góp vốn; thiếu thì hiểu là 1 suất */
      heSoQuyMo?: number
    }
```

- [ ] **Step 4: Thêm khối config**

```ts
  /** ---------- Quy mô góp vốn ----------
   * Trước v1.6 giá cơ hội chỉ nhân chỉ số giá, cơ hội đắt nhất là 2 tỷ. Khi tài
   * sản đã lên vài chục tỷ, mọi lời mời góp vốn đều thành tiền lẻ — người chơi
   * bấm nhận mà không phải nghĩ, và nửa sau ván chơi mất hết sức nặng.
   *
   * ---------- Vì sao rót to không phải lựa chọn hiển nhiên ----------
   * Cơ hội kinh doanh sinh lời 19–22% mỗi năm, cao hơn mọi kênh đầu tư. Ba đối
   * trọng giữ cho việc rót tối đa không phải nước đi đương nhiên đúng:
   *   1. Biến cố "doanh nghiệp đóng cửa" nhắm vào CÁI LỚN NHẤT, chỉ trả lại 20%.
   *   2. Khủng hoảng cắt một nửa thu nhập doanh nghiệp, mà nợ vay không giảm theo.
   *   3. Thanh lý gấp chỉ thu về 45% — tiền nằm trong doanh nghiệp không phải
   *      tiền lỏng.
   *
   * Canh bạc giữ nguyên một suất. Không phải vì cân bằng mà vì lời kể: canh bạc
   * là suất người ta mời bạn, không phải hàng bày bán để mua thêm.
   */
  quyMoGopVon: {
    bac: [1, 2, 3, 5, 8, 12],
    /** một cơ hội không được chiếm quá tỉ lệ này của tài sản ròng */
    tyLeToiDaTheoTaiSan: 0.6,
    /** vượt tỉ lệ này thì giao diện đổi màu cảnh báo tập trung vốn */
    nguongCanhBaoTapTrung: 0.4,
  },
```

- [ ] **Step 5: Thêm ba hàm vào `src/game/engine.ts`**

Chèn cạnh `tongTaiSan`:

```ts
/**
 * Tài sản ròng — mẫu số của cả trần quy mô góp vốn lẫn ngưỡng tập trung của biến
 * cố doanh nghiệp đóng cửa, nên phải có MỘT định nghĩa duy nhất.
 *
 * Trừ đi tổng số tiền CÒN PHẢI TRẢ chứ không phải dư nợ gốc: `KhoanVay` không
 * lưu gốc còn lại, và với người chơi thì con số đáng sợ đúng là số tiền phải móc
 * ra từ đây tới lúc hết nợ.
 */
export function taiSanRong(s: GameState): Tien {
  const conNo = s.khoanVay.reduce((t, v) => t + v.thanhToanMoiNam * v.namConLai, 0)
  return tongTaiSan(s) - conNo
}

/** Vốn góp của một doanh nghiệp quy về mặt bằng giá năm nay. */
export function vonDoanhNghiepNamNay(s: GameState, d: DoanhNghiep): Tien {
  return Math.round(d.vonGoc * (s.chiSoGia / d.chiSoGiaLucMua))
}

/**
 * Bậc quy mô lớn nhất người chơi được phép chọn cho một cơ hội. Trả 0 khi không
 * đủ tiền cho nổi một suất. Trần theo tài sản ròng chặn nước đi tất tay đúng
 * nghĩa — ngoài đời cũng không ai bán sạch nhà cửa để góp vốn một chỗ.
 */
export function quyMoToiDa(s: GameState, coHoi: CoHoi): number {
  if (coHoi.loai === 'canhBac') return 1
  const gia = giaThucTe(s, coHoi.gia)
  if (gia <= 0) return 1
  const tranTien = s.tienMat
  const tranTaiSan = taiSanRong(s) * CONFIG.quyMoGopVon.tyLeToiDaTheoTaiSan
  const tran = Math.min(tranTien, tranTaiSan)
  let ketQua = 0
  for (const bac of CONFIG.quyMoGopVon.bac) {
    if (gia * bac <= tran) ketQua = bac
  }
  return ketQua
}
```

- [ ] **Step 6: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS. Test cũ nào dựng `doanhNghiep` bằng tay sẽ báo thiếu `vonGoc` —
thêm `vonGoc` vào các chỗ đó, lấy giá trị bằng `timCoHoi(id)!.gia`.

- [ ] **Step 7: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 9: tai san rong, von goc doanh nghiep va tran quy mo"
```

---

### Task 10: Reducer nhận quy mô, lọc cơ hội theo tài sản, ba cơ hội tầm lớn

**Files:**
- Modify: `src/game/engine.ts` (`hopLe` ~dòng 510, `rutCoHoi`, `coHoiHopLe`, reducer case `quyetDinhCoHoi`)
- Modify: `src/game/content.ts` (ba cơ hội mới)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `quyMoToiDa`, `taiSanRong`, `CoHoi.taiSanToiThieu` từ Task 9
- Produces: `hopLe` lọc theo `taiSanToiThieu`, reducer ghi `vonGoc` và nhân `heSoQuyMo`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — góp vốn theo quy mô', () => {
  const vanGiau = (): GameState => ({ ...moiVan(), tienMat: 50 * TY, khoanVay: [] })

  it('góp 5 suất thì trả gấp 5 lần và thu nhập nền gấp 5 lần', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const gia = giaThucTe(s, coHoi.gia)
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 5,
    })
    expect(sau.tienMat).toBe(s.tienMat - gia * 5)
    const dn = sau.doanhNghiep.at(-1)!
    expect(dn.vonGoc).toBe(gia * 5)
    expect(dn.thuNhapNen).toBe(giaThucTe(s, coHoi.thuNhapMoiNam!) * 5)
  })

  it('thiếu heSoQuyMo thì hiểu là một suất — lời gọi cũ giữ nguyên ý nghĩa', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, coHoi.gia))
    expect(sau.doanhNghiep.at(-1)!.vonGoc).toBe(giaThucTe(s, coHoi.gia))
  })

  it('quy mô bị kẹp về trần, không cho vượt tài sản ròng', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = {
      ...moiVan(),
      tienMat: 900 * TRIEU,
      khoanVay: [],
      phase: 'tuDo' as const,
      coHoiNamNay: [coHoi],
    }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 12,
    })
    expect(sau.doanhNghiep.at(-1)!.vonGoc).toBe(giaThucTe(s, coHoi.gia) * 2)
  })

  it('canh bạc bỏ qua quy mô — luôn đúng một suất', () => {
    const coHoi = timCoHoi('coinMoi')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 8,
    })
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, coHoi.gia))
    expect(sau.khoanDangCho.at(-1)!.gia).toBe(giaThucTe(s, coHoi.gia))
  })

  it('tổ chức sự kiện trả lãi trên số vốn thật đã bỏ ra', () => {
    const coHoi = timCoHoi('hoiChoTet')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 3,
    })
    expect(sau.khoanDangCho.at(-1)!.gia).toBe(giaThucTe(s, coHoi.gia) * 3)
  })

  it('cơ hội tầm lớn không xuất hiện khi chưa đủ giàu', () => {
    const lon = CO_HOI.filter((c) => c.taiSanToiThieu !== undefined)
    expect(lon.length).toBeGreaterThanOrEqual(3)
    const ngheo = { ...moiVan(), tienMat: 100 * TRIEU, khoanVay: [] }
    for (const c of lon) expect(coHoiHopLe(c, ngheo)).toBe(false)
    const giau = { ...moiVan(), tienMat: 200 * TY, khoanVay: [], nam: 40 }
    expect(lon.some((c) => coHoiHopLe(c, giau))).toBe(true)
  })

  it('cơ hội tầm lớn vẫn nằm trong dải sinh lời 19–22% mỗi năm', () => {
    for (const c of CO_HOI.filter((x) => x.taiSanToiThieu !== undefined)) {
      const tyLe = (c.thuNhapMoiNam ?? 0) / c.gia
      expect(tyLe).toBeGreaterThanOrEqual(0.19)
      expect(tyLe).toBeLessThanOrEqual(0.22)
    }
  })
})
```

Thêm `CO_HOI` vào import từ `./content`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "góp vốn theo quy mô"`
Kỳ vọng: FAIL — reducer chưa đọc `heSoQuyMo`, chưa có cơ hội tầm lớn.

- [ ] **Step 3: Thêm ba cơ hội tầm lớn vào `src/game/content.ts`**

Chèn vào cuối mảng `CO_HOI`, sau nhóm kỹ sư phần mềm:

```ts
  /* ---------- Tầm lớn: chỉ mở khi tài sản ròng đã đủ ----------
   * Thanh trượt quy mô đã lo phần "cơ hội nhỏ vẫn dùng được khi giàu", nhưng
   * nửa sau ván chơi vẫn cần nội dung MỚI để còn cảm giác thăng tiến. Cả ba nằm
   * trong dải sinh lời 19–22% mà game vẫn giữ, nên không kênh nào trội hẳn.
   */
  {
    id: 'khuNhaXuong',
    ten: 'Khu nhà xưởng cho thuê',
    moTa: 'Vài héc ta đất công nghiệp và những dãy nhà xưởng xây sẵn. Hợp đồng thuê dài hạn, tiền về đều như nước chảy.',
    emoji: '🏭',
    loai: 'kinhDoanh',
    taiSanToiThieu: 20 * TY,
    gia: 12 * TY,
    thuNhapMoiNam: 2.3 * TY,
    bienDongThuNhapMin: -0.18,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'khachSanVenBien',
    ten: 'Khách sạn ven biển',
    moTa: 'Bốn chục phòng nhìn ra biển. Mùa cao điểm thì kín chỗ, nhưng kinh tế xấu là ngành lưu trú gãy đầu tiên.',
    emoji: '🏨',
    loai: 'kinhDoanh',
    taiSanToiThieu: 35 * TY,
    gia: 20 * TY,
    thuNhapMoiNam: 4.2 * TY,
    bienDongThuNhapMin: -0.45,
    bienDongThuNhapMax: 0.5,
  },
  {
    id: 'duAnKhuDoThi',
    ten: 'Góp vốn dự án khu đô thị',
    moTa: 'Đứng tên một phần trong dự án cả trăm héc ta. Tới tầm này thì bạn không còn đi làm ăn nữa — bạn là người bỏ vốn.',
    emoji: '🏗️',
    loai: 'kinhDoanh',
    taiSanToiThieu: 70 * TY,
    gia: 40 * TY,
    thuNhapMoiNam: 8 * TY,
    bienDongThuNhapMin: -0.35,
    bienDongThuNhapMax: 0.4,
  },
```

- [ ] **Step 4: Lọc theo tài sản trong `hopLe`**

`BoiCanhCoHoi` thêm `taiSanRong: Tien`:

```ts
function hopLe(c: CoHoi, bc: BoiCanhCoHoi): boolean {
  if (c.ngheId !== undefined && c.ngheId !== bc.ngheId) return false
  if (c.namToiThieu !== undefined && bc.nam < c.namToiThieu) return false
  if (c.taiSanToiThieu !== undefined && bc.taiSanRong < c.taiSanToiThieu) return false
  if (c.chiMotLan && bc.coHoiDaLam.includes(c.id)) return false
  return true
}

export const coHoiHopLe = (c: CoHoi, s: GameState): boolean =>
  hopLe(c, {
    ngheId: s.ngheId,
    nam: s.nam,
    coHoiDaLam: s.coHoiDaLam,
    taiSanRong: taiSanRong(s),
  })
```

Cập nhật hai chỗ gọi `rutCoHoi` (trong `taoGameMoi` và trong bước 14 của `chuyenNam`)
để truyền `taiSanRong`. Trong `taoGameMoi` dùng `vonBanDau` vì `GameState` chưa dựng
xong; trong `chuyenNam` dùng `tienMat + giá trị danh mục − nợ còn phải trả` đã tính
sẵn ở bước 12 (`tongSauNam`) trừ đi phần nợ.

- [ ] **Step 5: Sửa reducer case `quyetDinhCoHoi`**

```ts
    case 'quyetDinhCoHoi': {
      if (!choPhepHanhDongTuDo(s)) return s
      const coHoi = timCoHoi(a.coHoiId)
      if (!coHoi) return s
      const conLai = s.coHoiNamNay.filter((c) => c.id !== a.coHoiId)
      if (!a.nhan) return { ...s, coHoiNamNay: conLai }

      // Kẹp về trần thay vì từ chối: người chơi kéo thanh trượt tới đâu thì giao
      // diện đã chặn tới đó, còn ở đây chặn lần nữa để lời gọi từ bot và từ test
      // không vượt rào được.
      const quyMo = Math.min(a.heSoQuyMo ?? 1, quyMoToiDa(s, coHoi))
      if (quyMo < 1) return s

      const gia = giaThucTe(s, coHoi.gia) * quyMo
      if (s.tienMat < gia) return s

      const coHoiDaLam = coHoi.chiMotLan ? [...s.coHoiDaLam, coHoi.id] : s.coHoiDaLam

      if (coHoi.loai === 'kinhDoanh') {
        return {
          ...s,
          tienMat: s.tienMat - gia,
          coHoiNamNay: conLai,
          coHoiDaLam,
          doanhNghiep: [
            ...s.doanhNghiep,
            {
              coHoiId: coHoi.id,
              ten: coHoi.ten,
              thuNhapNen: giaThucTe(s, coHoi.thuNhapMoiNam ?? 0) * quyMo,
              chiSoGiaLucMua: s.chiSoGia,
              vonGoc: gia,
            },
          ],
        }
      }

      return {
        ...s,
        tienMat: s.tienMat - gia,
        coHoiNamNay: conLai,
        coHoiDaLam,
        khoanDangCho: [
          ...s.khoanDangCho,
          { coHoiId: coHoi.id, gia, loai: coHoi.loai },
        ],
      }
    }
```

`quyMoToiDa` trả 1 cho canh bạc nên `Math.min` tự kẹp canh bạc về một suất — không
cần nhánh riêng.

- [ ] **Step 6: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

- [ ] **Step 7: Commit**

```bash
git add src/game/engine.ts src/game/content.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 10: gop von theo quy mo va ba co hoi tam lon"
```

---

### Task 11: Thanh trượt quy mô trên thẻ cơ hội

**Files:**
- Modify: `src/ui/TabKinhDoanh.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `quyMoToiDa`, `taiSanRong`, `CONFIG.quyMoGopVon`
- Produces: không có gì cho task sau

- [ ] **Step 1: Thêm trạng thái quy mô cho từng thẻ**

Trong `TabKinhDoanh`, giữ một `useState<Record<string, number>>({})` ánh xạ
`coHoiId → bậc quy mô đang chọn`, mặc định 1.

- [ ] **Step 2: Tính các con số hiển thị**

Với mỗi cơ hội `c` không phải `canhBac`:

```tsx
const tran = quyMoToiDa(state, c)
const bacChoPhep = CONFIG.quyMoGopVon.bac.filter((b) => b <= tran)
const quyMo = quyMoDaChon[c.id] ?? 1
const von = giaThucTe(state, c.gia) * quyMo
const thuNhap = giaThucTe(state, c.thuNhapMoiNam ?? 0) * quyMo
const rong = taiSanRong(state)
const tyTrong = rong > 0 ? von / rong : 1
const tapTrungCao = tyTrong > CONFIG.quyMoGopVon.nguongCanhBaoTapTrung
```

- [ ] **Step 3: Vẽ khối thanh trượt**

```tsx
{bacChoPhep.length > 1 && (
  <div className="quy-mo">
    <div className="quy-mo-nhan">📐 Quy mô góp vốn</div>
    <div className="quy-mo-bac">
      {bacChoPhep.map((b) => (
        <button
          key={b}
          className={`nut-bac${quyMo === b ? ' hoat-dong' : ''}`}
          onClick={() => datQuyMo(c.id, b)}
        >
          {b}×
        </button>
      ))}
    </div>
    <div className="hang">
      <span className="hang-nhan">💰 Vốn phải bỏ</span>
      <span className="hang-gia-tri am">{dinhDangTien(von)}</span>
    </div>
    {c.loai === 'kinhDoanh' && (
      <div className="hang">
        <span className="hang-nhan">📈 Thu nhập mỗi năm</span>
        <span className="hang-gia-tri duong">{dinhDangTien(thuNhap)}</span>
      </div>
    )}
    <div className="hang">
      <span className="hang-nhan">🧮 Tỉ trọng trên tài sản ròng</span>
      <span className={`hang-gia-tri${tapTrungCao ? ' am' : ''}`}>
        {(tyTrong * 100).toFixed(0)}%
        {tapTrungCao && ' ⚠️ tập trung cao'}
      </span>
    </div>
  </div>
)}
```

Nút nhận cơ hội truyền `heSoQuyMo: quyMo`. Khi `tran === 0`, thẻ hiện
`💸 Chưa đủ tiền cho một suất` và tắt nút nhận.

- [ ] **Step 4: Thêm kiểu dáng vào `src/styles.css`**

```css
.quy-mo { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--vien); }
.quy-mo-nhan { font-size: 13px; opacity: 0.8; margin-bottom: 6px; }
.quy-mo-bac { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.nut-bac { flex: 1; min-width: 44px; padding: 6px 0; border-radius: 8px; }
.nut-bac.hoat-dong { background: var(--nhan-manh); color: #fff; }
```

Lấy đúng tên biến màu đang có trong `styles.css`.

- [ ] **Step 5: Kiểm tra bằng mắt**

Chạy: `npx tsc --noEmit` — kỳ vọng không lỗi.
Chạy: `npm run dev` — nhận một cơ hội kinh doanh, đổi bậc quy mô, xác nhận ba con số
đổi theo và tỉ trọng chuyển đỏ khi vượt 40%.

- [ ] **Step 6: Commit**

```bash
git add src/ui/TabKinhDoanh.tsx src/styles.css
git commit -m "v1.6 buoc 11: thanh truot quy mo gop von tren the co hoi"
```

---

**PHASE 3 XONG.** Cơ hội đã lớn lên cùng túi tiền.

---

# PHASE 4 — Biến cố lớn

### Task 12: Kiểu, config và lịch biến cố

**Files:**
- Modify: `src/game/types.ts` (`BienCoId`, `GameState`, `SuKienLoai`)
- Modify: `src/game/config.ts` (khối `bienCo`)
- Modify: `src/game/engine.ts` (`rutLichBienCo`, gọi trong `taoGameMoi`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `taoRng` đã có
- Produces: `BienCoId`, `CONFIG.bienCo`, `rutLichBienCo(rng)`, `GameState.lichBienCo`, `GameState.bienCoDaQua`, `GameState.heSoLuongDiChung`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — lịch biến cố lớn', () => {
  it('mỗi ván có từ 2 tới 4 biến cố, tất định theo seed', () => {
    for (let seed = 0; seed < 40; seed++) {
      const a = taoGameMoi('giaoVien', seed)
      const b = taoGameMoi('giaoVien', seed)
      expect(a.lichBienCo).toEqual(b.lichBienCo)
      expect(a.lichBienCo.length).toBeGreaterThanOrEqual(CONFIG.bienCo.soBienCoMin)
      expect(a.lichBienCo.length).toBeLessThanOrEqual(CONFIG.bienCo.soBienCoMax)
    }
  })

  it('các mốc nằm trong khoảng tuổi cho phép và cách nhau tối thiểu 8 năm', () => {
    for (let seed = 0; seed < 40; seed++) {
      const lich = taoGameMoi('giaoVien', seed).lichBienCo
      for (const nam of lich) {
        expect(tuoiTaiNam(nam)).toBeGreaterThanOrEqual(CONFIG.bienCo.tuoiSomNhat)
        expect(tuoiTaiNam(nam)).toBeLessThanOrEqual(CONFIG.bienCo.tuoiMuonNhat)
      }
      const sapXep = [...lich].sort((x, y) => x - y)
      expect(sapXep).toEqual(lich)
      for (let i = 1; i < lich.length; i++) {
        expect(lich[i]! - lich[i - 1]!).toBeGreaterThanOrEqual(
          CONFIG.bienCo.cachNhauToiThieu,
        )
      }
    }
  })

  it('ván mới chưa gặp biến cố nào và chưa có di chứng lương', () => {
    const s = taoGameMoi('giaoVien', SEED)
    expect(s.bienCoDaQua).toEqual([])
    expect(s.heSoLuongDiChung).toBe(1)
  })
})
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "lịch biến cố lớn"`
Kỳ vọng: FAIL — `lichBienCo` chưa tồn tại.

- [ ] **Step 3: Thêm kiểu**

`src/game/types.ts`:

```ts
export type BienCoId =
  | 'benhHiemNgheo'
  | 'matViec'
  | 'boMeNgaBenh'
  | 'voHui'
  | 'doanhNghiepDongCua'
  | 'baoLu'
```

Thêm vào `GameState`, cạnh khối cốt truyện:

```ts
  /** ---------- Biến cố lớn (v1.6) ---------- */
  /** các năm đã hẹn sẵn sẽ xảy ra biến cố lớn, tất định theo seed */
  lichBienCo: number[]
  /** biến cố đã dùng, để không lặp lại trong một ván */
  bienCoDaQua: BienCoId[]
  /** di chứng lương sau khi mất việc, khởi điểm 1 */
  heSoLuongDiChung: number
```

Thêm vào `SuKienLoai`: `| 'bienCoLon'`.

- [ ] **Step 4: Thêm khối config**

```ts
  /** ---------- Biến cố lớn ----------
   * Sự kiện ngẫu nhiên sẵn có — ốm đau, sự cố, va chạm — đều ở mức vài chục phần
   * trăm chi phí một năm. Chúng là gợn sóng. Đời người thì có sóng lớn, và những
   * cú đó mới là thứ phân loại người có chuẩn bị và người không.
   *
   * ---------- Vì sao hẹn lịch chứ không tung xúc xắc mỗi năm ----------
   * Cùng khuôn với lịch cưới hỏi và sinh con của cốt truyện trăm năm. Hai lẽ:
   * mọi ván đều chắc chắn có biến cố nên không ván nào trôi qua nhạt nhoà, và số
   * lượng nằm trong tầm kiểm soát để cân bằng được.
   *
   * ---------- Lá chắn ----------
   * Mỗi biến cố có MỘT thứ người chơi phải chuẩn bị từ trước mới chặn được. Mọi
   * khoản tiền tính theo bội số chi phí sinh hoạt của năm xảy ra, nên biến cố lớn
   * lên cùng người chơi thay vì hoá vô hại về sau. Riêng bão lũ CỐ Ý không có lá
   * chắn: một trò chơi về tài chính mà giả vờ rằng chuẩn bị đủ kỹ thì miễn nhiễm
   * với mọi thứ là một trò chơi nói dối. Bù lại nó là cú nhẹ nhất trong sáu cái.
   */
  bienCo: {
    soBienCoMin: 2,
    soBienCoMax: 4,
    tuoiSomNhat: 28,
    tuoiMuonNhat: 85,
    cachNhauToiThieu: 8,

    /** 🏥 bệnh hiểm nghèo — lá chắn: bảo hiểm y tế */
    benhHiemNgheo: {
      tuoiToiThieu: 40,
      vienPhiTheoChiPhi: 2.5,
      /** thuốc ngoài danh mục thì bảo hiểm nào cũng không gánh */
      tuTraToiThieu: 0.12,
      matHanhPhucCoBaoHiem: 8,
      matHanhPhucKhongBaoHiem: 20,
      /** ốm nặng thì phải nghỉ — bảo hiểm chặn viện phí chứ không chặn việc này */
      heSoLuongNamDo: 0.5,
    },

    /** 🏭 mất việc — lá chắn: quỹ dự phòng tiền mặt */
    matViec: {
      /** tiền mặt phải đạt ngần này lần chi phí sinh hoạt mới coi là có dự phòng */
      duPhongTheoChiPhi: 1,
      heSoLuongCoDuPhong: 0.5,
      heSoLuongKhongDuPhong: 0,
      matHanhPhucCoDuPhong: 6,
      matHanhPhucKhongDuPhong: 15,
      diChungLuong: 0.85,
      /** mất việc giữa lúc cả thị trường đang sa thải thì đi xin lại thấp hơn nhiều */
      diChungLuongKhiKhungHoang: 0.75,
    },

    /** 👴 bố mẹ ngã bệnh — lá chắn: xuất thân có bố mẹ tích luỹ */
    boMeNgaBenh: {
      tuoiToiThieu: 35,
      tuoiToiDa: 70,
      chiPhiCoTichLuy: 0.5,
      chiPhiKhongTichLuy: 1.8,
      matHanhPhucCoTichLuy: 6,
      matHanhPhucKhongTichLuy: 12,
    },

    /** 💸 vỡ hụi, bị lừa đảo — lá chắn: chuyên gia hoạch định tài chính */
    voHui: {
      tuoiToiThieu: 30,
      tyLeTienMatCoChuyenGia: 0.08,
      tyLeTienMatKhongChuyenGia: 0.3,
      matHanhPhucCoChuyenGia: 5,
      matHanhPhucKhongChuyenGia: 15,
    },

    /** 🏚️ doanh nghiệp đóng cửa — lá chắn: không dồn quá nhiều vào một chỗ */
    doanhNghiepDongCua: {
      nguongTapTrung: 0.4,
      /** thanh lý máy móc, hàng tồn, tiền cọc mặt bằng */
      hoanLaiVon: 0.2,
      matHanhPhucDuoiNguong: 8,
      matHanhPhucTrenNguong: 18,
    },

    /** 🌊 bão lũ tàn phá — không có lá chắn */
    baoLu: {
      chiPhiCoNha: 1.8,
      chiPhiKhongNha: 1.2,
      matHanhPhucCoNha: 12,
      matHanhPhucKhongNha: 10,
    },
  },
```

- [ ] **Step 5: Rút lịch trong `taoGameMoi`**

Thêm hàm cạnh `rutCoHoi`:

```ts
/**
 * Hẹn lịch biến cố lớn ngay khi tạo ván, tất định theo seed. Rút từng mốc một và
 * bỏ mốc nào quá sát mốc trước — thà ít hơn `soBienCoMax` còn hơn dồn hai cú lớn
 * vào cùng một quãng đời.
 */
function rutLichBienCo(rng: Rng): number[] {
  const bc = CONFIG.bienCo
  const namSom = bc.tuoiSomNhat - CONFIG.cotTruyen.tuoiBatDau + 1
  const namMuon = bc.tuoiMuonNhat - CONFIG.cotTruyen.tuoiBatDau + 1
  const soLuong = rng.nguyen(bc.soBienCoMin, bc.soBienCoMax)
  const lich: number[] = []
  let baoVe = 0
  while (lich.length < soLuong && baoVe++ < 200) {
    const nam = rng.nguyen(namSom, namMuon)
    if (lich.some((n) => Math.abs(n - nam) < bc.cachNhauToiThieu)) continue
    lich.push(nam)
  }
  return lich.sort((a, b) => a - b)
}
```

Trong `taoGameMoi`, gọi `const lichBienCo = rutLichBienCo(rng)` **sau** khi hẹn lịch
cốt truyện và **trước** khi rút thẻ, rồi thêm vào khối `return`:

```ts
    lichBienCo,
    bienCoDaQua: [],
    heSoLuongDiChung: 1,
```

- [ ] **Step 6: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

- [ ] **Step 7: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.6 buoc 12: lich bien co lon hen san theo seed"
```

---

### Task 13: Sáu biến cố lớn trong `chuyenNam`

**Files:**
- Modify: `src/game/content.ts` (lời kể sáu biến cố)
- Modify: `src/game/engine.ts` (bước 7b mới)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `CONFIG.bienCo`, `GameState.lichBienCo`, `xuatThanHienTai`, `dangCoBaoHiem`, `tyLeDongTra`, `daToiUuChiPhi`, `vonDoanhNghiepNamNay`, `taiSanRong`
- Produces: `LOI_KE_BIEN_CO`, biến cố áp trong `chuyenNam`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — sáu biến cố lớn', () => {
  /** Ép một biến cố cụ thể nổ ra ngay năm nay. */
  const epBienCo = (s: GameState, tru: BienCoId[] = []): GameState => ({
    ...s,
    lichBienCo: [s.nam],
    bienCoDaQua: tru,
  })
  const timBienCo = (tk: TongKetNam) => tk.suKien.find((e) => e.loai === 'bienCoLon')

  it('mỗi năm đã hẹn đều nổ ra đúng một biến cố', () => {
    const s = epBienCo({ ...moiVan(), nam: 20 })
    const tk = diTronMotNam(s).tongKet!
    expect(tk.suKien.filter((e) => e.loai === 'bienCoLon')).toHaveLength(1)
  })

  it('không biến cố nào lặp lại trong một ván', () => {
    let s = moiVan()
    const daGap: string[] = []
    for (let i = 0; i < 30 && s.trangThai === 'dangChoi'; i++) {
      s = reducer(diTronMotNam(epBienCo(s), []), { type: 'dongTongKet' })
      daGap.push(...s.bienCoDaQua)
    }
    expect(new Set(s.bienCoDaQua).size).toBe(s.bienCoDaQua.length)
  })

  it('bệnh hiểm nghèo: có bảo hiểm thì tốn ít hơn hẳn và mất ít hạnh phúc hơn', () => {
    const nen: GameState = {
      ...moiVan(),
      nam: 25,
      bienCoDaQua: ['matViec', 'boMeNgaBenh', 'voHui', 'doanhNghiepDongCua', 'baoLu'],
    }
    const co = diTronMotNam(epBienCo({ ...nen, baoHiemDenNam: 999 }, nen.bienCoDaQua)).tongKet!
    const khong = diTronMotNam(epBienCo({ ...nen, baoHiemDenNam: -1 }, nen.bienCoDaQua)).tongKet!
    const eCo = timBienCo(co)!
    const eKhong = timBienCo(khong)!
    expect(-eCo.tienThayDoi).toBeLessThan(-eKhong.tienThayDoi)
    expect(eCo.hanhPhucThayDoi).toBeGreaterThan(eKhong.hanhPhucThayDoi)
  })

  it('mất việc: có quỹ dự phòng thì không để lại di chứng lương', () => {
    const chiPhi = moiVan().chiPhiHangNam
    const tru: BienCoId[] = ['benhHiemNgheo', 'boMeNgaBenh', 'voHui', 'doanhNghiepDongCua', 'baoLu']
    const co = reducer(
      diTronMotNam(epBienCo({ ...moiVan(), nam: 10 }, tru), chiPhi * 5),
      { type: 'dongTongKet' },
    )
    expect(co.heSoLuongDiChung).toBe(1)
    const khong = reducer(
      diTronMotNam(epBienCo({ ...moiVan(), nam: 10 }, tru), 0),
      { type: 'dongTongKet' },
    )
    expect(khong.heSoLuongDiChung).toBeCloseTo(CONFIG.bienCo.matViec.diChungLuong, 10)
  })

  it('mất việc giữa khủng hoảng để lại di chứng nặng hơn', () => {
    const tru: BienCoId[] = ['benhHiemNgheo', 'boMeNgaBenh', 'voHui', 'doanhNghiepDongCua', 'baoLu']
    const s = epBienCo({ ...moiVan(), nam: 10, thiTruong: 'khungHoang' }, tru)
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.heSoLuongDiChung).toBeCloseTo(
      CONFIG.bienCo.matViec.diChungLuongKhiKhungHoang,
      10,
    )
  })

  it('vỡ hụi chỉ trừ tiền mặt, không đụng danh mục đầu tư', () => {
    const tru: BienCoId[] = ['benhHiemNgheo', 'matViec', 'boMeNgaBenh', 'doanhNghiepDongCua', 'baoLu']
    const s: GameState = {
      ...moiVan(),
      nam: 15,
      soHuu: { ...moiVan().soHuu, coPhieu: 1000 },
    }
    const sau = reducer(diTronMotNam(epBienCo(s, tru), 2 * TY), { type: 'dongTongKet' })
    expect(sau.soHuu.coPhieu).toBe(1000)
  })

  it('đã thuê chuyên gia hoạch định tài chính thì vỡ hụi nhẹ hẳn', () => {
    const tru: BienCoId[] = ['benhHiemNgheo', 'matViec', 'boMeNgaBenh', 'doanhNghiepDongCua', 'baoLu']
    const nen = { ...moiVan(), nam: 15 }
    const co = diTronMotNam(
      epBienCo({ ...nen, daThueChuyenGiaTaiChinh: true, heSoToiUuChiPhi: 0.92 }, tru),
      2 * TY,
    ).tongKet!
    const khong = diTronMotNam(epBienCo(nen, tru), 2 * TY).tongKet!
    expect(-timBienCo(co)!.tienThayDoi).toBeLessThan(-timBienCo(khong)!.tienThayDoi)
  })

  it('doanh nghiệp đóng cửa nhắm vào cái có vốn góp lớn nhất và hoàn 20% vốn', () => {
    const tru: BienCoId[] = ['benhHiemNgheo', 'matViec', 'boMeNgaBenh', 'voHui', 'baoLu']
    const s: GameState = {
      ...moiVan(),
      nam: 15,
      doanhNghiep: [
        { coHoiId: 'choThueXe', ten: 'Đội xe máy cho thuê', thuNhapNen: 40 * TRIEU, chiSoGiaLucMua: 1, vonGoc: 200 * TRIEU },
        { coHoiId: 'quanCaPhe', ten: 'Mở quán cà phê nhỏ', thuNhapNen: 90 * TRIEU, chiSoGiaLucMua: 1, vonGoc: 400 * TRIEU },
      ],
    }
    const sau = reducer(diTronMotNam(epBienCo(s, tru), 1 * TY), { type: 'dongTongKet' })
    expect(sau.doanhNghiep.map((d) => d.coHoiId)).toEqual(['choThueXe'])
  })

  it('biến cố không hợp lệ thì bỏ qua năm đó chứ không vỡ', () => {
    // chưa đủ tuổi cho bệnh hiểm nghèo, chưa có doanh nghiệp, chưa đủ tuổi vỡ hụi
    const tru: BienCoId[] = ['matViec', 'boMeNgaBenh', 'baoLu']
    const s = epBienCo({ ...moiVan(), nam: 2 }, tru)
    expect(() => diTronMotNam(s)).not.toThrow()
  })
})
```

Thêm `BienCoId` vào `import type` từ `./types`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "sáu biến cố lớn"`
Kỳ vọng: FAIL — chưa có sự kiện `bienCoLon` nào.

- [ ] **Step 3: Thêm lời kể vào `src/game/content.ts`**

```ts
/** ---------------- Lời kể sáu biến cố lớn ----------------
 * Mỗi biến cố có hai bản: khi lá chắn đỡ được và khi không. Cùng một chuyện,
 * nhưng người có chuẩn bị kể lại nó theo một cách khác hẳn.
 */
export const LOI_KE_BIEN_CO: Record<
  BienCoId,
  { emoji: string; tieuDe: string; coLaChan: string; khongLaChan: string }
> = {
  benhHiemNgheo: {
    emoji: '🏥',
    tieuDe: 'Bệnh hiểm nghèo',
    coLaChan:
      'Kết quả sinh thiết về, bác sĩ nói phải điều trị dài ngày. May là tấm thẻ bảo hiểm gánh gần hết viện phí, bạn chỉ phải lo phần thuốc ngoài danh mục và những tháng nghỉ việc.',
    khongLaChan:
      'Kết quả sinh thiết về, bác sĩ nói phải điều trị dài ngày. Không có bảo hiểm, mỗi lần đóng viện phí là một lần rút ruột. Vừa chống chọi với bệnh vừa nhìn tiền tiết kiệm bốc hơi.',
  },
  matViec: {
    emoji: '🏭',
    tieuDe: 'Mất việc',
    coLaChan:
      'Công ty cắt giảm và tên bạn nằm trong danh sách. Nhờ khoản dự phòng đã để dành, bạn có thời gian tìm chỗ mới tử tế thay vì vơ vội việc gì cũng làm.',
    khongLaChan:
      'Công ty cắt giảm và tên bạn nằm trong danh sách. Trong túi không có đồng dự phòng nào, bạn phải nhận đại một chỗ lương thấp hơn hẳn chỉ để có việc.',
  },
  boMeNgaBenh: {
    emoji: '👴',
    tieuDe: 'Bố mẹ ngã bệnh',
    coLaChan:
      'Bố mẹ trở bệnh nặng phải nằm viện dài ngày. Ông bà có khoản dành dụm riêng nên bạn chỉ phải lo phần thêm và những chuyến đi về.',
    khongLaChan:
      'Bố mẹ trở bệnh nặng phải nằm viện dài ngày. Cả đời làm lụng không để lại được gì, mọi khoản viện phí đổ hết lên vai bạn.',
  },
  voHui: {
    emoji: '💸',
    tieuDe: 'Vỡ hụi',
    coLaChan:
      'Dây hụi trong xóm vỡ, chủ hụi ôm tiền bỏ đi. Người soát sổ sách cùng bạn đã thấy dấu hiệu bất thường từ trước nên bạn rút gần hết, chỉ mất phần nhỏ.',
    khongLaChan:
      'Dây hụi trong xóm vỡ, chủ hụi ôm tiền bỏ đi. Bao nhiêu tiền mặt gom góp mấy năm nay theo đó mà đi, chỉ còn lại tờ giấy viết tay không ai công nhận.',
  },
  doanhNghiepDongCua: {
    emoji: '🏚️',
    tieuDe: 'Doanh nghiệp đóng cửa',
    coLaChan:
      'Việc làm ăn không trụ nổi, đành đóng cửa và thanh lý. Cũng đau, nhưng bạn còn nhiều chỗ khác nên đây chỉ là một mảnh gãy chứ không phải cả gia tài.',
    khongLaChan:
      'Việc làm ăn không trụ nổi, đành đóng cửa và thanh lý. Bao nhiêu vốn liếng bạn dồn hết vào đây, giờ chỉ vớt lại được chút tiền bán máy móc và hàng tồn.',
  },
  baoLu: {
    emoji: '🌊',
    tieuDe: 'Bão lũ tàn phá',
    coLaChan: '',
    khongLaChan:
      'Cơn bão lớn nhất mấy chục năm quét qua. Nước rút để lại một đống ngổn ngang, sửa sang lại tốn kém hơn mọi dự tính.',
  },
}
```

Bão lũ không có lá chắn nên `coLaChan` để trống — engine luôn dùng `khongLaChan` cho
nó. Thêm `BienCoId` vào `import type` của `content.ts`.

- [ ] **Step 4: Thêm bước 7b vào `chuyenNam`**

Chèn ngay **sau** khối bước 7 (sự kiện ngẫu nhiên) và **trước** bước 8 (lương).

Đặt ở đây vì hai biến cố có cắt lương của năm đó, và vì tiền mất do biến cố phải có
khả năng đẩy người chơi vào vỡ nợ ở bước 11 — đó chính là điểm gặp nhau của cả bản này.

```ts
  /* --- 7b. Biến cố lớn của đời người --- */
  let heSoLuongBienCo = 1
  let bienCoDaQua = s.bienCoDaQua
  let heSoLuongDiChung = s.heSoLuongDiChung
  let doanhNghiep = s.doanhNghiep

  if (s.lichBienCo.includes(s.nam)) {
    const bc = CONFIG.bienCo
    const tuoi = tuoiTaiNam(s.nam)
    const xuatThan = xuatThanHienTai(s)
    const chiPhi = s.chiPhiHangNam
    const dnLonNhat = [...doanhNghiep].sort(
      (a, b) => vonDoanhNghiepNamNay(s, b) - vonDoanhNghiepNamNay(s, a),
    )[0]

    // Chỉ giữ những biến cố hợp lệ với hoàn cảnh và chưa từng xảy ra.
    const ungVien: BienCoId[] = []
    if (tuoi >= bc.benhHiemNgheo.tuoiToiThieu) ungVien.push('benhHiemNgheo')
    if (!daNghiHuu) ungVien.push('matViec')
    if (tuoi >= bc.boMeNgaBenh.tuoiToiThieu && tuoi <= bc.boMeNgaBenh.tuoiToiDa) {
      ungVien.push('boMeNgaBenh')
    }
    if (tuoi >= bc.voHui.tuoiToiThieu) ungVien.push('voHui')
    if (dnLonNhat) ungVien.push('doanhNghiepDongCua')
    ungVien.push('baoLu')

    const conLai = ungVien.filter((id) => !bienCoDaQua.includes(id))
    if (conLai.length > 0) {
      const chon = conLai[Math.floor(rng.next() * conLai.length)]!
      const ke = LOI_KE_BIEN_CO[chon]
      let matTien = 0
      let matHanhPhucDanhNghia = 0
      let coLaChan = false
      let moTaThem = ''

      switch (chon) {
        case 'benhHiemNgheo': {
          coLaChan = dangCoBaoHiem(s)
          const vienPhi = chiPhi * bc.benhHiemNgheo.vienPhiTheoChiPhi
          const phanTuTra = coLaChan
            ? Math.max(tyLeDongTra(tuoi), bc.benhHiemNgheo.tuTraToiThieu)
            : 1
          matTien = Math.round(vienPhi * phanTuTra)
          matHanhPhucDanhNghia = coLaChan
            ? bc.benhHiemNgheo.matHanhPhucCoBaoHiem
            : bc.benhHiemNgheo.matHanhPhucKhongBaoHiem
          heSoLuongBienCo = bc.benhHiemNgheo.heSoLuongNamDo
          break
        }
        case 'matViec': {
          coLaChan = tienMat >= chiPhi * bc.matViec.duPhongTheoChiPhi
          heSoLuongBienCo = coLaChan
            ? bc.matViec.heSoLuongCoDuPhong
            : bc.matViec.heSoLuongKhongDuPhong
          matHanhPhucDanhNghia = coLaChan
            ? bc.matViec.matHanhPhucCoDuPhong
            : bc.matViec.matHanhPhucKhongDuPhong
          if (!coLaChan) {
            const diChung =
              thiTruongSau === 'khungHoang'
                ? bc.matViec.diChungLuongKhiKhungHoang
                : bc.matViec.diChungLuong
            heSoLuongDiChung = heSoLuongDiChung * diChung
            moTaThem = ` Lương khi đi làm lại chỉ còn ${soPhanTram(diChung)}% mức cũ.`
          }
          break
        }
        case 'boMeNgaBenh': {
          coLaChan = xuatThan.boMeCoTichLuy
          matTien = Math.round(
            chiPhi *
              (coLaChan
                ? bc.boMeNgaBenh.chiPhiCoTichLuy
                : bc.boMeNgaBenh.chiPhiKhongTichLuy),
          )
          matHanhPhucDanhNghia = coLaChan
            ? bc.boMeNgaBenh.matHanhPhucCoTichLuy
            : bc.boMeNgaBenh.matHanhPhucKhongTichLuy
          break
        }
        case 'voHui': {
          coLaChan = daToiUuChiPhi(s)
          // Chỉ đụng tiền mặt: kẻ lừa đảo lấy được thứ bạn đưa cho họ, không lấy
          // được cổ phiếu trong tài khoản. Điều đó khiến biến cố này trừng phạt
          // đúng người ôm quá nhiều tiền mặt nhàn rỗi.
          const tyLe = coLaChan
            ? bc.voHui.tyLeTienMatCoChuyenGia
            : bc.voHui.tyLeTienMatKhongChuyenGia
          matTien = Math.round(Math.max(0, tienMat) * tyLe)
          matHanhPhucDanhNghia = coLaChan
            ? bc.voHui.matHanhPhucCoChuyenGia
            : bc.voHui.matHanhPhucKhongChuyenGia
          break
        }
        case 'doanhNghiepDongCua': {
          const von = vonDoanhNghiepNamNay(s, dnLonNhat!)
          const rong = Math.max(1, taiSanRong(s))
          coLaChan = von / rong < bc.doanhNghiepDongCua.nguongTapTrung
          const hoanLai = Math.round(von * bc.doanhNghiepDongCua.hoanLaiVon)
          matTien = -hoanLai
          doanhNghiep = doanhNghiep.filter((d) => d !== dnLonNhat)
          matHanhPhucDanhNghia = coLaChan
            ? bc.doanhNghiepDongCua.matHanhPhucDuoiNguong
            : bc.doanhNghiepDongCua.matHanhPhucTrenNguong
          moTaThem = ` ${dnLonNhat!.ten} đóng cửa, vớt lại được ${dinhDangTien(hoanLai)}.`
          break
        }
        case 'baoLu': {
          const coNha = s.uocNguyenDaMua.includes('canHo')
          matTien = Math.round(
            chiPhi * (coNha ? bc.baoLu.chiPhiCoNha : bc.baoLu.chiPhiKhongNha),
          )
          matHanhPhucDanhNghia = coNha
            ? bc.baoLu.matHanhPhucCoNha
            : bc.baoLu.matHanhPhucKhongNha
          break
        }
      }

      tienMat -= matTien
      const hpBienCo = apHanhPhuc(-matHanhPhucDanhNghia)
      bienCoDaQua = [...bienCoDaQua, chon]
      suKien.push({
        loai: 'bienCoLon',
        tieuDe: `${ke.emoji} ${ke.tieuDe}`,
        moTa: (coLaChan && ke.coLaChan ? ke.coLaChan : ke.khongLaChan) + moTaThem,
        tienThayDoi: -matTien,
        hanhPhucThayDoi: hpBienCo,
      })
    }
  }
```

- [ ] **Step 5: Nối vào bước 8 và khối trả về**

Bước 8, nhánh còn đi làm và nhánh đã hưu đều nhân thêm hai hệ số:

```ts
  luongMoi = Math.round(luongMoi * heSoLuongDiChung)
  // hệ số cắt lương của biến cố chỉ có hiệu lực đúng năm đó nên KHÔNG lưu vào
  // GameState — nó là biến cục bộ, năm sau lương quay lại mức bình thường
  const luongThucNhan = Math.round(luongMoi * heSoLuongBienCo)
  tienMat += luongThucNhan
```

Lưu ý: dòng `tienMat += luongMoi` cũ phải đổi thành `tienMat += luongThucNhan`, còn
`luongMoi` vẫn là lương chính thức mang sang năm sau.

Trong đối tượng `sauChuyen` cuối hàm, gán tường minh — phép trải `...s` sẽ mang theo
giá trị cũ:

```ts
    bienCoDaQua,
    heSoLuongDiChung,
    doanhNghiep,
```

- [ ] **Step 6: Chạy test, xác nhận xanh**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ engine. Test cân bằng có thể đỏ — ghi số lại, xử lý ở Task 17.

- [ ] **Step 7: Thêm icon vào `src/ui/TongKetModal.tsx`**

`BIEU_TUONG_SU_KIEN` thêm `bienCoLon: '⚡'`.

- [ ] **Step 8: Commit**

```bash
git add src/game/content.ts src/game/engine.ts src/ui/TongKetModal.tsx src/game/engine.test.ts
git commit -m "v1.6 buoc 13: sau bien co lon va he thong la chan"
```

---

**PHASE 4 XONG.** Đời người đã có sóng lớn, và chuẩn bị trước đã có giá trị.

---

# PHASE 5 — Phá sản

### Task 14: Ba nấc vỡ nợ

**Files:**
- Modify: `src/game/types.ts` (`GameState`, `SuKienLoai`)
- Modify: `src/game/config.ts` (khối `phaSan`)
- Modify: `src/game/engine.ts` (bước 11 mở rộng, `dangCamVay`, `dangCamCoHoi`)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `vonDoanhNghiepNamNay` từ Task 9
- Produces: `CONFIG.phaSan`, `dangCamVay(s)`, `dangCamCoHoi(s)`, `GameState.soLanPhaSan/camVayDenNam/camCoHoiDenNam`

- [ ] **Step 1: Viết test thất bại**

```ts
describe('v1.6 — ba nấc vỡ nợ', () => {
  /** Ván âm tiền nặng: không tiền mặt, nợ lớn phải trả ngay năm nay. */
  const vanVoNo = (them: Partial<GameState> = {}): GameState => ({
    ...moiVan(),
    nam: 12,
    tienMat: 0,
    lichBienCo: [],
    khoanVay: [
      { id: 'v1', goc: 3 * TY, kyHan: 10, thanhToanMoiNam: 900 * TRIEU, namConLai: 8 },
    ],
    ...them,
  })

  it('thiếu tiền thì bán tài sản đầu tư trước khi đụng tới doanh nghiệp', () => {
    const s = vanVoNo({
      soHuu: { ...moiVan().soHuu, traiPhieu: 5000 },
      doanhNghiep: [
        { coHoiId: 'quanCaPhe', ten: 'Mở quán cà phê nhỏ', thuNhapNen: 90 * TRIEU, chiSoGiaLucMua: 1, vonGoc: 400 * TRIEU },
      ],
    })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.doanhNghiep).toHaveLength(1)
    expect(sau.soHuu.traiPhieu).toBeLessThan(5000)
  })

  it('thanh lý doanh nghiệp thu về đúng 45% vốn góp theo giá hiện hành', () => {
    const s = vanVoNo({
      doanhNghiep: [
        { coHoiId: 'quanCaPhe', ten: 'Mở quán cà phê nhỏ', thuNhapNen: 90 * TRIEU, chiSoGiaLucMua: 1, vonGoc: 400 * TRIEU },
      ],
    })
    const tk = diTronMotNam(s, 0).tongKet!
    const e = tk.suKien.find((x) => x.loai === 'thanhLyDoanhNghiep')
    expect(e).toBeDefined()
    expect(e!.tienThayDoi).toBeGreaterThan(0)
  })

  it('thanh lý từ doanh nghiệp NHỎ NHẤT lên, giữ nguồn thu lớn nhất càng lâu càng tốt', () => {
    const s = vanVoNo({
      tienMat: 0,
      khoanVay: [
        { id: 'v1', goc: 1 * TY, kyHan: 10, thanhToanMoiNam: 200 * TRIEU, namConLai: 8 },
      ],
      doanhNghiep: [
        { coHoiId: 'quanCaPhe', ten: 'Mở quán cà phê nhỏ', thuNhapNen: 1, chiSoGiaLucMua: 1, vonGoc: 400 * TRIEU },
        { coHoiId: 'xuongMay', ten: 'Góp vốn xưởng may gia công', thuNhapNen: 1, chiSoGiaLucMua: 1, vonGoc: 1.5 * TY },
      ],
    })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.doanhNghiep.map((d) => d.coHoiId)).toEqual(['xuongMay'])
  })

  it('thiếu hụt dưới ngưỡng thì chỉ Túng thiếu, không phá sản', () => {
    const s = vanVoNo({
      khoanVay: [
        { id: 'v1', goc: 100 * TRIEU, kyHan: 10, thanhToanMoiNam: 14 * TRIEU, namConLai: 8 },
      ],
    })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.soLanPhaSan).toBe(0)
  })

  it('phá sản xoá sạch nợ, đưa tiền mặt về 0 và giữ nguyên ước nguyện đã mua', () => {
    const s = vanVoNo({ uocNguyenDaMua: ['xeMay'] })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.soLanPhaSan).toBe(1)
    expect(sau.khoanVay).toHaveLength(0)
    expect(sau.tienMat).toBe(0)
    expect(sau.uocNguyenDaMua).toEqual(['xeMay'])
  })

  it('phá sản trừ đúng 25 hạnh phúc và cấm vay 5 năm, cấm cơ hội 3 năm', () => {
    const s = vanVoNo({ hanhPhuc: 95 })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.hanhPhuc).toBeLessThanOrEqual(95 - CONFIG.phaSan.hanhPhuc)
    expect(dangCamVay(sau)).toBe(true)
    expect(dangCamCoHoi(sau)).toBe(true)
    expect(sau.camVayDenNam - sau.nam).toBe(CONFIG.phaSan.soNamCamVay - 1)
  })

  it('trong thời gian cấm, hành động vay không có tác dụng', () => {
    const s = vanVoNo()
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    const thu = reducer({ ...sau, phase: 'tuDo' }, { type: 'vay', goc: 100 * TRIEU, kyHan: 5 })
    expect(thu.khoanVay).toHaveLength(0)
  })

  it('trong thời gian cấm, không cơ hội kinh doanh nào được rút ra', () => {
    const s = vanVoNo()
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.coHoiNamNay.filter((c) => c.loai === 'kinhDoanh')).toHaveLength(0)
  })
})
```

Thêm `dangCamCoHoi, dangCamVay` vào import từ `./engine`.

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/engine.test.ts -t "ba nấc vỡ nợ"`
Kỳ vọng: FAIL — `soLanPhaSan` chưa tồn tại.

- [ ] **Step 3: Thêm kiểu và config**

`src/game/types.ts` — thêm vào `GameState`:

```ts
  /** ---------- Phá sản (v1.6) ---------- */
  soLanPhaSan: number
  /** không được vay tới hết năm này; -1 nghĩa là không bị cấm */
  camVayDenNam: number
  /** không được mời cơ hội kinh doanh tới hết năm này; -1 nghĩa là không bị cấm */
  camCoHoiDenNam: number
```

Thêm vào `SuKienLoai`: `| 'thanhLyDoanhNghiep' | 'phaSan'`.

`src/game/config.ts`:

```ts
  /** ---------- Phá sản ----------
   * Không phải dấu chấm hết. Ngoài đời phá sản là mất tài sản, bị bán giải chấp
   * và làm lại với uy tín sứt mẻ — luật phá sản cũng chừa lại nhà ở và phương
   * tiện đi lại thiết yếu, nên ước nguyện đã mua KHÔNG bị đụng tới.
   *
   * ---------- Vì sao vẫn là mối đe doạ thật ----------
   * 25 điểm hạnh phúc là gần một nửa quãng đường từ mức khởi điểm 70 xuống ngưỡng
   * thua 50. Cộng thêm mất sạch dòng tiền thụ động, mất khả năng vay để gây dựng
   * lại, và khoản phạt khát vọng vẫn tiếp tục chảy máu nếu chưa mua được món của
   * nghề — phá sản rất dễ kéo theo một cái thua vì hạnh phúc chỉ vài năm sau.
   *
   * ---------- Con đường dẫn tới đây ----------
   * Vay tối đa để góp vốn quy mô lớn → khủng hoảng ập tới, thu nhập doanh nghiệp
   * còn một nửa, giá tài sản sập → nợ vẫn phải trả đủ, chi phí lại leo vì lạm
   * phát 11% → bán tài sản ở giá đáy vẫn không đủ → thanh lý doanh nghiệp với 45%
   * vốn → vẫn không đủ. Đó chính xác là cách người ta phá sản ngoài đời: không
   * phải vì một quyết định ngu ngốc, mà vì đòn bẩy gặp đúng chu kỳ xấu.
   */
  phaSan: {
    /** doanh nghiệp kém thanh khoản: bán gấp chỉ thu lại được ngần này vốn góp */
    tyLeThanhLyDoanhNghiep: 0.45,
    /** thiếu hụt vượt tỉ lệ này × chi phí sinh hoạt thì tuyên phá sản */
    nguongTheoChiPhi: 1,
    hanhPhuc: 25,
    soNamCamVay: 5,
    /** uy tín cần thời gian dựng lại */
    soNamCamCoHoi: 3,
  },
```

Khởi tạo trong `taoGameMoi`: `soLanPhaSan: 0, camVayDenNam: -1, camCoHoiDenNam: -1,`.

- [ ] **Step 4: Thêm hai hàm kiểm tra lệnh cấm**

```ts
export const dangCamVay = (s: GameState): boolean => s.camVayDenNam >= s.nam
export const dangCamCoHoi = (s: GameState): boolean => s.camCoHoiDenNam >= s.nam
```

- [ ] **Step 5: Mở rộng bước 11 của `chuyenNam`**

Thay toàn bộ khối `if (tienMat < 0) { ... }` hiện có bằng ba nấc. Giữ nguyên nấc 1
(bán tài sản) đúng như cũ, rồi nối thêm:

```ts
  let soLanPhaSan = s.soLanPhaSan
  let camVayDenNam = s.camVayDenNam
  let camCoHoiDenNam = s.camCoHoiDenNam
  let khoanVaySauCung = khoanVay

  if (tienMat < 0) {
    /* --- Nấc 2: thanh lý doanh nghiệp ---
     * Bán từ NHỎ NHẤT lên để giữ lại nguồn thu nhập lớn nhất càng lâu càng tốt.
     * Doanh nghiệp là tài sản kém thanh khoản — bán gấp thì mất hơn một nửa giá
     * trị, đúng như ngoài đời. */
    const theoVon = [...doanhNghiep].sort(
      (a, b) => vonDoanhNghiepNamNay(s, a) - vonDoanhNghiepNamNay(s, b),
    )
    let thuVe = 0
    const daBan: string[] = []
    for (const d of theoVon) {
      if (tienMat >= 0) break
      const tien = Math.round(
        vonDoanhNghiepNamNay(s, d) * CONFIG.phaSan.tyLeThanhLyDoanhNghiep,
      )
      tienMat += tien
      thuVe += tien
      daBan.push(d.ten)
      doanhNghiep = doanhNghiep.filter((x) => x !== d)
    }
    if (thuVe > 0) {
      suKien.push({
        loai: 'thanhLyDoanhNghiep',
        tieuDe: '🏷️ Thanh lý doanh nghiệp',
        moTa:
          `Bán hết tài sản đầu tư vẫn chưa đủ, đành sang nhượng gấp ${daBan.join(', ')}.` +
          ` Bán vội thì chỉ được ${soPhanTram(CONFIG.phaSan.tyLeThanhLyDoanhNghiep)}% vốn đã bỏ ra.`,
        tienThayDoi: thuVe,
        hanhPhucThayDoi: 0,
      })
    }
  }

  if (tienMat < 0 && -tienMat > chiPhiHangNam * CONFIG.phaSan.nguongTheoChiPhi) {
    /* --- Nấc 3: phá sản --- */
    const xoaNo = khoanVaySauCung.reduce((t, v) => t + v.thanhToanMoiNam * v.namConLai, 0)
    khoanVaySauCung = []
    tienMat = 0
    soLanPhaSan += 1
    camVayDenNam = s.nam + CONFIG.phaSan.soNamCamVay - 1
    camCoHoiDenNam = s.nam + CONFIG.phaSan.soNamCamCoHoi - 1
    const hpPhaSan = apHanhPhuc(-CONFIG.phaSan.hanhPhuc)
    suKien.push({
      loai: 'phaSan',
      tieuDe: '💀 Phá sản',
      moTa:
        'Bán sạch mọi thứ vẫn không trả nổi. Toà tuyên phá sản, ' +
        `${dinhDangTien(xoaNo)} tiền nợ được xoá nhưng bạn cũng trắng tay. ` +
        `Nhà cửa và xe cộ thì luật chừa lại. ${CONFIG.phaSan.soNamCamVay} năm tới ` +
        `không ngân hàng nào cho vay, và ${CONFIG.phaSan.soNamCamCoHoi} năm tới ` +
        'cũng chẳng ai mời bạn góp vốn — uy tín cần thời gian dựng lại.',
      tienThayDoi: 0,
      hanhPhucThayDoi: hpPhaSan,
    })
  } else if (tienMat < 0) {
    // giữ nguyên khối "Túng thiếu" đã có: −10 hạnh phúc, khoản âm treo sang năm sau
  }
```

Lưu ý thứ tự: khối "Túng thiếu" hiện nằm **trong** `if (tienMat < 0)` của nấc 1 —
phải chuyển nó xuống thành nhánh `else` của kiểm tra phá sản, nếu không người chơi
vừa phá sản vừa bị trừ thêm 10 điểm túng thiếu.

Bước 12 (cột mốc tài sản) dùng `tienMat` sau ba nấc, không cần đổi.

Gán tường minh vào `sauChuyen`:

```ts
    soLanPhaSan,
    camVayDenNam,
    camCoHoiDenNam,
    khoanVay: khoanVaySauCung,
    doanhNghiep,
```

- [ ] **Step 6: Chặn vay và chặn rút cơ hội**

Reducer case `vay`, thêm ngay sau kiểm tra `choPhepHanhDongTuDo`:

```ts
      if (dangCamVay(s)) return s
```

`rutCoHoi` — bỏ hết cơ hội `kinhDoanh` khi đang bị cấm. Thêm tham số vào
`BoiCanhCoHoi`:

```ts
  /** đang trong thời gian cấm sau phá sản thì không mời cơ hội kinh doanh */
  camCoHoi: boolean
```

và trong `hopLe`:

```ts
  if (bc.camCoHoi && c.loai === 'kinhDoanh') return false
```

Cập nhật hai chỗ gọi: `taoGameMoi` truyền `camCoHoi: false`, `chuyenNam` bước 14
truyền `camCoHoi: camCoHoiDenNam >= namMoi`.

- [ ] **Step 7: Chạy test, xác nhận xanh**

Chạy: `npx vitest run src/game/engine.test.ts`
Kỳ vọng: PASS toàn bộ test engine.

- [ ] **Step 8: Thêm icon và màn kết**

`src/ui/TongKetModal.tsx`: `thanhLyDoanhNghiep: '🏷️'`, `phaSan: '💀'`.

`src/ui/KetThucModal.tsx`: khi `state.soLanPhaSan > 0`, thêm dòng
`💀 Đã phá sản {state.soLanPhaSan} lần trên hành trình này`.

`src/ui/TabTrangChu.tsx`: khi `dangCamVay(state)`, khối vay hiện
`🚫 Sau phá sản, còn {camVayDenNam − nam + 1} năm nữa mới vay được`.

- [ ] **Step 9: Commit**

```bash
git add src/game/types.ts src/game/config.ts src/game/engine.ts src/ui/TongKetModal.tsx src/ui/KetThucModal.tsx src/ui/TabTrangChu.tsx src/game/engine.test.ts
git commit -m "v1.6 buoc 14: ba nac vo no va pha san lam lai duoc"
```

---

### Task 15: Bot mô phỏng và cân bằng cả bản

**Files:**
- Modify: `src/game/sim.ts` (`ChienLuoc`, vòng lặp cơ hội, quỹ dự phòng)
- Modify: `src/game/balance.test.ts`
- Modify: `src/game/config.ts` (tinh chỉnh nếu số đo lệch mục tiêu)
- Modify: `src/game/luu.ts` (chốt chặn ván cũ)

**Interfaces:**
- Consumes: mọi thứ từ Phase 1-5
- Produces: `ChienLuoc.quyMoGopVonUaThich`, `ChienLuoc.quyDuPhongTheoChiPhi`, `KetQuaSim.soLanPhaSan`, `KetQuaSim.soBienCoGap`

- [ ] **Step 1: Viết test thất bại**

```ts
  it('bot cân bằng vẫn thắng trong khoảng 55–85% tuỳ nghề', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, 150)
      const tyLePhaSan = r.ketQua.filter((k) => k.soLanPhaSan > 0).length / r.soVan
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thắng ${(r.tyLeThang * 100).toFixed(0)}%` +
          ` · phá sản ${(tyLePhaSan * 100).toFixed(0)}%` +
          ` · ${(r.soNamTrungBinhKhiThang || 0).toFixed(1)} năm`,
      )
      expect(r.tyLeThang).toBeGreaterThanOrEqual(0.55)
      expect(r.tyLeThang).toBeLessThanOrEqual(0.85)
    }
  })

  it('tỉ lệ ván có phá sản nằm trong khoảng 5–20% với bot cân bằng', () => {
    const r = moPhongNhieuVan('bacSi', 200)
    const ty = r.ketQua.filter((k) => k.soLanPhaSan > 0).length / r.soVan
    expect(ty).toBeGreaterThanOrEqual(0.05)
    expect(ty).toBeLessThanOrEqual(0.2)
  })

  it('bot giữ quỹ dự phòng phá sản ít hơn bot tiêu sát đáy', () => {
    const coQuy = moPhongNhieuVan('giaoVien', 150, {
      ...CHIEN_LUOC_CAN_BANG,
      quyDuPhongTheoChiPhi: 1.2,
    })
    const satDay = moPhongNhieuVan('giaoVien', 150, {
      ...CHIEN_LUOC_CAN_BANG,
      quyDuPhongTheoChiPhi: 0,
    })
    const ty = (r: typeof coQuy) =>
      r.ketQua.filter((k) => k.soLanPhaSan > 0).length / r.soVan
    // eslint-disable-next-line no-console
    console.log(`có quỹ ${(ty(coQuy) * 100).toFixed(0)}% · sát đáy ${(ty(satDay) * 100).toFixed(0)}%`)
    expect(ty(coQuy)).toBeLessThan(ty(satDay))
  })

  it('rót 12 suất phá sản nhiều hơn rót 1 suất, nhưng thắng thì về đích sớm hơn', () => {
    const to = moPhongNhieuVan('kySuPhanMem', 150, {
      ...CHIEN_LUOC_CAN_BANG,
      quyMoGopVonUaThich: 12,
    })
    const nho = moPhongNhieuVan('kySuPhanMem', 150, {
      ...CHIEN_LUOC_CAN_BANG,
      quyMoGopVonUaThich: 1,
    })
    const ty = (r: typeof to) =>
      r.ketQua.filter((k) => k.soLanPhaSan > 0).length / r.soVan
    // eslint-disable-next-line no-console
    console.log(
      `rót 12× phá sản ${(ty(to) * 100).toFixed(0)}% · ${to.soNamTrungBinhKhiThang.toFixed(1)} năm` +
        ` — rót 1× phá sản ${(ty(nho) * 100).toFixed(0)}% · ${nho.soNamTrungBinhKhiThang.toFixed(1)} năm`,
    )
    expect(ty(to)).toBeGreaterThan(ty(nho))
    // phải là một canh bạc CÓ LÃI KỲ VỌNG, không phải một cái bẫy
    expect(to.soNamTrungBinhKhiThang).toBeLessThan(nho.soNamTrungBinhKhiThang)
  })
```

- [ ] **Step 2: Chạy test, xác nhận hỏng**

Chạy: `npx vitest run src/game/balance.test.ts`
Kỳ vọng: FAIL — `quyMoGopVonUaThich` chưa có, `soLanPhaSan` chưa có trong `KetQuaSim`.

- [ ] **Step 3: Mở rộng bot**

`src/game/sim.ts` — thêm vào `ChienLuoc`:

```ts
  /** bậc quy mô góp vốn ưa thích; bot tự kẹp lại theo trần cho phép */
  quyMoGopVonUaThich: number
  /**
   * Giữ tiền mặt tối thiểu bằng ngần này lần chi phí sinh hoạt. Khác
   * `duPhongTheoChiPhi` ở chỗ nó là sàn CỨNG áp cho cả việc nhận cơ hội, không
   * chỉ cho việc đầu tư — nó chính là lá chắn của biến cố mất việc.
   */
  quyDuPhongTheoChiPhi: number
```

`CHIEN_LUOC_CAN_BANG` thêm `quyMoGopVonUaThich: 3, quyDuPhongTheoChiPhi: 1`.

Trong bước 7 của vòng lặp bot, đổi phần nhận cơ hội:

```ts
    const coHoi = s.coHoiNamNay[0]
    if (coHoi) {
      const tran = quyMoToiDa(s, coHoi)
      const quyMo = Math.min(cl.quyMoGopVonUaThich, tran)
      const gia = giaThucTe(s, coHoi.gia) * Math.max(1, quyMo)
      const chapNhanLoai =
        coHoi.loai === 'kinhDoanh'
          ? cl.nhanCoHoiKinhDoanh
          : coHoi.loai === 'toChucSuKien'
            ? cl.nhanToChucSuKien
            : cl.nhanCanhBac
      // Giữ nguyên quỹ dự phòng sau khi góp vốn — đó là lá chắn của biến cố mất việc
      const sanTienMat = s.chiPhiHangNam * cl.quyDuPhongTheoChiPhi
      const muon = chapNhanLoai && quyMo >= 1 && s.tienMat - gia >= sanTienMat
      s = reducer(s, {
        type: 'quyetDinhCoHoi',
        coHoiId: coHoi.id,
        nhan: muon,
        heSoQuyMo: quyMo,
      })
      continue
    }
```

Bước 8 (đầu tư) đổi `duPhong` thành mức lớn hơn giữa hai con số:

```ts
    const duPhong =
      s.chiPhiHangNam * Math.max(cl.duPhongTheoChiPhi, cl.quyDuPhongTheoChiPhi)
```

`KetQuaSim` thêm `soLanPhaSan: number` và `soBienCoGap: number`, trả về
`soLanPhaSan: s.soLanPhaSan, soBienCoGap: s.bienCoDaQua.length`.

Thêm `quyMoToiDa` vào import từ `./engine`.

- [ ] **Step 4: Chạy, đọc số, tinh chỉnh**

Chạy: `npx vitest run src/game/balance.test.ts`

Đọc các dòng `console.log` rồi chỉnh theo thứ tự ưu tiên này, mỗi lần một con số,
chạy lại sau mỗi lần:

| Triệu chứng | Chỉnh |
|---|---|
| Thắng dưới 55% | Hạ `tacDong.khungHoang.doLechGia` từ −0,30 lên −0,25 |
| Thắng vẫn dưới 55% | Hạ `bienCo.soBienCoMax` từ 4 xuống 3 |
| Thắng trên 85% | Nâng `maTranChuyen.*.khungHoang` thêm 0,01 mỗi hàng, bù vào `binhThuong` |
| Phá sản dưới 5% | Nâng `phaSan.nguongTheoChiPhi` xuống 0,5 (dễ phá sản hơn) |
| Phá sản trên 20% | Nâng `phaSan.tyLeThanhLyDoanhNghiep` từ 0,45 lên 0,55 |
| Vàng thành nước đi trội | Hạ `nhayChuKy` của vàng từ −0,5 xuống −0,3 |
| Rót 12× về đích chậm hơn rót 1× | Hạ `bienCo.doanhNghiepDongCua.matHanhPhucTrenNguong` từ 18 xuống 14 |

**Không** chỉnh `tyLeVonBanDau` của xuất thân — vốn là thứ người chơi cảm nhận rõ
nhất và phải giữ tương phản.

- [ ] **Step 5: Chốt chặn ván cũ trong `src/game/luu.ts`**

Thêm trước `return s`:

```ts
    // trường của bản v1.6: ván cũ thiếu chúng thì chu kỳ thị trường, lịch biến cố
    // và bộ đếm phá sản đều là undefined — game vỡ ngay năm đầu tiên
    if (!s.thiTruong || !Array.isArray(s.lichBienCo)) return null
    if (typeof s.soLanPhaSan !== 'number') return null
    if (typeof s.heSoLuongDiChung !== 'number') return null
```

- [ ] **Step 6: Chạy toàn bộ và kiểm tra kiểu**

Chạy: `npx vitest run`
Kỳ vọng: PASS toàn bộ.

Chạy: `npx tsc --noEmit`
Kỳ vọng: không lỗi.

Chạy: `npm run build`
Kỳ vọng: build thành công.

- [ ] **Step 7: Chơi thử một ván trọn vẹn**

Chạy: `npm run dev`. Kiểm bằng mắt:
- Màn chọn nghề hai bước, ba con số đổi theo bậc lương
- Ô thị trường trên thanh chỉ số đổi trạng thái qua các năm
- Thanh trượt quy mô trên thẻ cơ hội, cảnh báo đỏ khi vượt 40%
- Ít nhất một biến cố lớn hiện ở bảng tổng kết
- Sổ sách giải thích đúng các hệ số đang nhân vào chi phí sinh hoạt

- [ ] **Step 8: Commit**

```bash
git add src/game/sim.ts src/game/balance.test.ts src/game/config.ts src/game/luu.ts
git commit -m "v1.6 buoc 15: bot mo phong quy mo gop von va can bang ca ban"
```

---

### Task 16: Cập nhật README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Viết phần v1.6**

Theo đúng khuôn các mục v1.3, v1.4, v1.5 đang có: nêu năm hệ thống mới, bảng con số
chính (bốn xuất thân, bốn trạng thái thị trường, sáu biến cố, ba nấc vỡ nợ, sáu bậc
quy mô), và ghi lại tỉ lệ thắng đo được sau khi cân bằng.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "v1.6: cap nhat README"
```

---

## Tự rà soát kế hoạch

**Phủ đặc tả** — đối chiếu từng mục của `docs/06-thiet-ke-v1-6.md`:

| Mục đặc tả | Task phủ |
|---|---|
| A. Bốn xuất thân | 1, 2 |
| A. Bậc lương, lối sống, áp lực công việc | 1, 3 |
| A. Màn chọn nghề hai bước | 4 |
| B. Ma trận chuyển và bốn con số tác động | 6 |
| B. `nhayChuKy`, sàn biến động, lợi tức, doanh nghiệp, lạm phát, lương | 7 |
| B. Hiển thị công khai trên thanh chỉ số | 8 |
| C. Lịch hẹn 2–4 mốc, cách nhau 8 năm | 12 |
| C. Sáu biến cố và sáu lá chắn | 13 |
| D. Ba nấc vỡ nợ, cấm vay, cấm cơ hội | 14 |
| E. Thanh trượt quy mô, trần 60%, canh bạc một suất | 9, 10, 11 |
| E. Ba cơ hội tầm lớn, `taiSanToiThieu` | 10 |
| F. Mục tiêu cân bằng và bảng tinh chỉnh | 5, 15 |
| G. `luuKey`, chốt chặn ván cũ | 4, 15 |
| H. Toàn bộ danh mục kiểm thử | rải khắp, tập trung ở 15 |

**Không có placeholder** — mọi bước có mã thật, mọi lệnh chạy có kỳ vọng cụ thể.

**Nhất quán kiểu** — `taiSanRong`, `quyMoToiDa`, `vonDoanhNghiepNamNay`,
`xuatThanHienTai`, `apLucCongViec`, `dangCamVay`, `dangCamCoHoi`,
`chuyenTrangThaiThiTruong`, `tacDongThiTruong` dùng cùng một tên ở mọi task.
`vonGoc` khai ở Task 9, dùng ở Task 10, 13, 14. `heSoLuongDiChung` khai ở Task 12,
dùng ở Task 13.

**Điểm cần chú ý khi thực thi:**

1. **Task 2 phụ thuộc Task 3.** `taoGameMoi` gọi `tinhHeSoChiPhi` với chữ ký mới.
   Làm Task 3 trước, hoặc dùng lời gọi tạm nêu trong Task 2 Step 4.
2. **Test doanh nghiệp ở Task 7** dùng `vonGoc` của Phase 3. Bỏ dòng đó nếu chạy
   Phase 2 trước Phase 3, thêm lại ở Task 9.
3. **Khối "Túng thiếu" ở Task 14** phải chuyển thành nhánh `else` — nếu không người
   chơi vừa phá sản vừa bị trừ thêm 10 điểm.
4. **Mọi trường mới phải gán tường minh** vào `sauChuyen` ở cuối `chuyenNam`. Phép
   trải `...s` mang theo giá trị cũ và lỗi này không có dấu hiệu gì trên màn hình.


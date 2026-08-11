# Chơi khi không có mạng — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm một công tắc tuỳ chọn ở cuối tab 📒 Sổ sách cho phép người chơi tải game về máy để chơi khi mất mạng hoặc ở chế độ máy bay, đồng thời giữ nguyên việc có mạng thì luôn chạy bản mới nhất.

**Architecture:** Một service worker viết tay theo lối **mạng trước, cache đỡ sau** — trang luôn hỏi mạng trước nên bản mới tự tới, chỉ khi mạng hỏng mới rơi xuống bản đã lưu; tệp trong `assets/` thì lấy thẳng từ cache vì tên đã chứa mã băm nội dung. Một plugin Vite tự viết đúc service worker, vẽ bốn tệp biểu tượng PNG và phát manifest lúc build. Không thêm phụ thuộc runtime nào; phụ thuộc mới duy nhất là `@types/node` (chỉ là kiểu, không có mã chạy).

**Tech Stack:** TypeScript 5.7 · React 19 · Vite 6 · Vitest 3 · Node 24 · không backend, trạng thái ở `localStorage`.

**Tài liệu thiết kế:** `docs/superpowers/specs/2026-08-12-choi-ngoai-tuyen-design.md` — đọc trước khi làm bất kỳ task nào.

---

## Global Constraints

- **Ngôn ngữ:** Mọi chuỗi hiển thị cho người chơi phải là **tiếng Việt có dấu, không viết tắt**. Mỗi mục giao diện phải có icon emoji sinh động.
- **Lệnh chạy test:** `npm test -- <đường dẫn>`. **KHÔNG dùng `npx`** — cài đặt npm trên máy này hỏng (`Cannot find module './npm-cli.js'`). Chạy toàn bộ: `npm test`. Biên dịch: `./node_modules/.bin/tsc -b --noEmit`.
- **Chú thích tiếng Việt giải thích VÌ SAO**, theo đúng phong cách dày đặc sẵn có trong `engine.ts` và `luu.ts`. Con số nào có lý do thì phải ghi lý do.
- **`tsconfig.json` chỉ `include: ["src"]`** — tệp trong `scripts/` không bị `tsc` kiểm tra. Không sửa `include`; `scripts/trai-nghiem-demo.ts` hiện cũng nằm ngoài và đó là nếp sẵn có.
- **Không thêm phụ thuộc runtime.** `@types/node` là ngoại lệ duy nhất và nó chỉ chứa kiểu.
- **Không dùng đồng hồ hay số ngẫu nhiên trong mã build.** Dựng lại cùng một bản phải ra cùng một kết quả byte-cho-byte, nếu không mỗi lần build lại là một lần người chơi tải lại toàn bộ game.
- **Nhánh làm việc:** `choi-ngoai-tuyen`, tách từ `main`. Gộp vào `main` ở Task 8.
- **Commit sau mỗi task**, thông điệp commit **không dấu**, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Không sửa `src/game/`** — task nào cũng vậy. Tính năng này không đụng tới logic game.

---

## Nền đã xác minh (12/08/2026)

Đo trực tiếp chứ không suy từ trí nhớ:

| Việc | Kết quả |
|---|---|
| `npm test` | **305/305 xanh**, 4 tệp test, 12,3 giây |
| `node -v` | v24.19.0 |
| `node_modules/@types/` | **không có `node`** — phải cài |
| `vitest.config.*` | không có; môi trường test mặc định là `node`, không có jsdom |
| `vi.stubEnv('PROD', true)` | **chạy được** — đã thử nghiệm thật trên Vitest 3.2.7 |
| `tsconfig.json:22` | `include: ["src"]` |
| `dist/assets/` | `index-*.js` 319 587 byte + `index-*.css` 8 517 byte ≈ **328 KB** |
| `git status` | sạch, đang ở `main` |

---

## Sơ đồ tệp

**Tạo mới**

| Tệp | Trách nhiệm | Task |
|---|---|---|
| `src/ngoai-tuyen/trang-thai.ts` | chỉ một kiểu `TrangThaiNgoaiTuyen` — nền chung của hai task song song | 0 |
| `scripts/tao-icon.ts` | bộ mã hoá PNG tối giản + phần vẽ biểu tượng | 1 |
| `scripts/tao-icon.test.ts` | | 1 |
| `scripts/khuon-service-worker.js` | khuôn service worker, không đi qua bundler | 2 |
| `scripts/dung-service-worker.ts` | danh sách tệp → nội dung service worker hoàn chỉnh | 2 |
| `scripts/dung-service-worker.test.ts` | | 2 |
| `src/ngoai-tuyen/dang-ky.ts` | đăng ký / gỡ / đo trạng thái | 3 |
| `src/ngoai-tuyen/dang-ky.test.ts` | | 3 |
| `src/ngoai-tuyen/KhoiNgoaiTuyen.tsx` | khối giao diện (một phần thuần + một vỏ có state) | 4 |
| `src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts` | | 4 |
| `scripts/plugin-ngoai-tuyen.ts` | plugin Vite nối mọi thứ, phát tệp ra `dist/` | 5 |

**Sửa**

| Tệp | Sửa gì | Task |
|---|---|---|
| `package.json` | thêm `@types/node` vào `devDependencies` | 0 |
| `src/styles.css` | thêm lớp cho khối, **đặt ở cuối tệp** | 4 |
| `vite.config.ts` | cắm plugin | 5 |
| `src/ui/TabSoSach.tsx` | một dòng `import`, một dòng render | 6 |
| `README.md` | sửa câu sai về `file://`, thêm mục "Chơi khi không có mạng" | 7 |

---

## Ba đợt — chia việc cho sub-agent song song

```
Task 0  ─ nền chung, chạy một mình trước (30 giây)
   │
   ├──────────┬──────────┬──────────┐        ĐỢT 1 — bốn agent song song
Task 1     Task 2     Task 3     Task 4       không agent nào đụng tệp của agent khác
 icon      service     đăng ký    giao diện
           worker
   │          │          │          │
   └────┬─────┘          └────┬─────┘
     Task 5                Task 6                ĐỢT 2 — hai agent song song
     plugin + vite.config   TabSoSach
        └──────────┬──────────┘
                Task 7                            ĐỢT 3 — một agent
             kiểm chứng thật + README
                   │
                Task 8 — gộp vào main
```

**Vì sao chia được như vậy:** bốn task của đợt 1 tạo tệp mới ở bốn thư mục/tên khác nhau và chỉ dùng chung đúng một kiểu — kiểu đó do Task 0 tạo trước. Task 5 sửa `vite.config.ts` còn Task 6 sửa `src/ui/TabSoSach.tsx`, không giao nhau. Task 7 là task duy nhất chạm `README.md`.

**Quy tắc bắt buộc cho sub-agent:** chỉ tạo và sửa đúng những tệp ghi trong mục **Files** của task mình. Thấy cần sửa tệp ngoài danh sách thì **dừng và báo lại**, không tự sửa — tệp đó đang có agent khác cầm.

---

## Task 0: Nền chung — kiểu trạng thái và `@types/node`

**Files:**
- Create: `src/ngoai-tuyen/trang-thai.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: không
- Produces: `TrangThaiNgoaiTuyen` — kiểu hợp của sáu chuỗi, dùng bởi Task 3 và Task 4.

- [ ] **Step 1: Tạo nhánh làm việc**

```bash
git checkout -b choi-ngoai-tuyen
```

- [ ] **Step 2: Cài `@types/node`**

Task 1 và Task 2 dùng `node:zlib`, `node:crypto`, `node:fs` trong tệp `.ts`. Không có gói kiểu này thì trình soạn thảo báo đỏ toàn bộ (test vẫn chạy được vì `scripts/` nằm ngoài `tsconfig`, nhưng để đỏ là để lại bẫy cho người sau).

```bash
npm install -D @types/node
```

Đã kiểm tra trước: `src/` không dùng `setTimeout`, `setInterval`, `Buffer` hay `process` ở đâu cả, nên gói kiểu này **không** gây xung đột kiểu với mã trình duyệt.

- [ ] **Step 3: Tạo tệp kiểu**

```ts
// src/ngoai-tuyen/trang-thai.ts

/**
 * Sáu trạng thái của công tắc "chơi khi không có mạng".
 *
 * Tách riêng ra một tệp nhỏ vì `dang-ky.ts` và `KhoiNgoaiTuyen.tsx` được viết
 * song song bởi hai người khác nhau — cả hai cùng nhìn vào đây thì không ai phải
 * chờ ai.
 */
export type TrangThaiNgoaiTuyen =
  /** Trình duyệt không có service worker — Safari ở cửa sổ riêng tư chẳng hạn. */
  | 'khong-ho-tro'
  /** Đang chạy dev server: tệp service worker chỉ được sinh ra lúc dựng bản phát hành. */
  | 'chi-ban-phat-hanh'
  /** Chưa bật. */
  | 'tat'
  /** Đã bấm bật, đang tải game về máy. */
  | 'dang-tai'
  /** Đã tải xong, mất mạng vẫn mở được. */
  | 'san-sang'
  /** Bật hỏng — gần như luôn là vì bật đúng lúc đang mất sóng. */
  | 'loi'
```

- [ ] **Step 4: Kiểm tra biên dịch sạch**

Run: `./node_modules/.bin/tsc -b --noEmit`
Expected: không lỗi.

Run: `npm test`
Expected: **305/305 xanh** — không đổi so với nền.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/ngoai-tuyen/trang-thai.ts
git commit -m "ngoai tuyen: nen chung - kieu trang thai va @types/node

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# ĐỢT 1 — bốn task chạy song song

---

## Task 1: Bộ mã hoá PNG và biểu tượng

**Files:**
- Create: `scripts/tao-icon.ts`
- Test: `scripts/tao-icon.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  ```ts
  export type TepIcon = { ten: string; noiDung: Uint8Array }
  export function mahoaPng(rong: number, cao: number, diem: Uint8Array): Uint8Array
  export function taoBoIcon(): TepIcon[]
  ```
  `taoBoIcon()` trả đúng bốn phần tử theo thứ tự: `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `icon-180.png`. Task 5 gọi hàm này.

- [ ] **Step 1: Viết test cho bộ mã hoá PNG (chưa có mã, phải đỏ)**

```ts
// scripts/tao-icon.test.ts
import { describe, expect, it } from 'vitest'
import { inflateSync } from 'node:zlib'
import { mahoaPng, taoBoIcon } from './tao-icon'

/** Tách các khối của một tệp PNG ra để soi: [kiểu, dữ liệu]. */
function docKhoi(png: Uint8Array): { kieu: string; du: Uint8Array }[] {
  const xem = new DataView(png.buffer, png.byteOffset, png.byteLength)
  const ra: { kieu: string; du: Uint8Array }[] = []
  let vt = 8 // bỏ qua chữ ký
  while (vt < png.length) {
    const dai = xem.getUint32(vt)
    const kieu = new TextDecoder().decode(png.subarray(vt + 4, vt + 8))
    ra.push({ kieu, du: png.subarray(vt + 8, vt + 8 + dai) })
    vt += 12 + dai
  }
  return ra
}

/** Điểm ảnh (x, y) dưới dạng [đỏ, lục, lam, độ đục]. */
function diemAnh(png: Uint8Array, x: number, y: number): number[] {
  const khoi = docKhoi(png)
  const ihdr = khoi.find((k) => k.kieu === 'IHDR')!
  const xem = new DataView(ihdr.du.buffer, ihdr.du.byteOffset, ihdr.du.byteLength)
  const rong = xem.getUint32(0)
  const idat = khoi.find((k) => k.kieu === 'IDAT')!
  const tho = new Uint8Array(inflateSync(idat.du))
  const dau = y * (rong * 4 + 1) + 1 + x * 4
  return [tho[dau]!, tho[dau + 1]!, tho[dau + 2]!, tho[dau + 3]!]
}

describe('bộ mã hoá PNG', () => {
  it('mở đầu bằng đúng chữ ký tám byte của PNG', () => {
    const png = mahoaPng(2, 2, new Uint8Array(2 * 2 * 4))
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  })

  it('có đủ ba khối IHDR, IDAT, IEND đúng thứ tự', () => {
    const png = mahoaPng(2, 2, new Uint8Array(2 * 2 * 4))
    expect(docKhoi(png).map((k) => k.kieu)).toEqual(['IHDR', 'IDAT', 'IEND'])
  })

  it('IHDR khai đúng kích thước và kiểu màu RGBA tám bit', () => {
    const png = mahoaPng(7, 3, new Uint8Array(7 * 3 * 4))
    const ihdr = docKhoi(png).find((k) => k.kieu === 'IHDR')!.du
    const xem = new DataView(ihdr.buffer, ihdr.byteOffset, ihdr.byteLength)
    expect(xem.getUint32(0)).toBe(7)
    expect(xem.getUint32(4)).toBe(3)
    expect(ihdr[8]).toBe(8) // tám bit mỗi kênh
    expect(ihdr[9]).toBe(6) // kiểu màu 6 = RGBA
  })

  it('giải nén IDAT ra đúng số byte: mỗi dòng thêm một byte lọc', () => {
    const png = mahoaPng(5, 4, new Uint8Array(5 * 4 * 4))
    const idat = docKhoi(png).find((k) => k.kieu === 'IDAT')!.du
    expect(inflateSync(idat).length).toBe(4 * (5 * 4 + 1))
  })

  it('giữ nguyên màu từng điểm ảnh đưa vào', () => {
    const diem = new Uint8Array(2 * 1 * 4)
    diem.set([10, 20, 30, 255], 0)
    diem.set([40, 50, 60, 128], 4)
    const png = mahoaPng(2, 1, diem)
    expect(diemAnh(png, 0, 0)).toEqual([10, 20, 30, 255])
    expect(diemAnh(png, 1, 0)).toEqual([40, 50, 60, 128])
  })
})

describe('bộ biểu tượng', () => {
  it('ra đúng bốn tệp, đúng tên, đúng thứ tự', () => {
    expect(taoBoIcon().map((t) => t.ten)).toEqual([
      'icon-192.png',
      'icon-512.png',
      'icon-512-maskable.png',
      'icon-180.png',
    ])
  })

  it('mỗi tệp khai đúng kích thước của nó trong IHDR', () => {
    const canh: Record<string, number> = {
      'icon-192.png': 192,
      'icon-512.png': 512,
      'icon-512-maskable.png': 512,
      'icon-180.png': 180,
    }
    for (const tep of taoBoIcon()) {
      const ihdr = docKhoi(tep.noiDung).find((k) => k.kieu === 'IHDR')!.du
      const xem = new DataView(ihdr.buffer, ihdr.byteOffset, ihdr.byteLength)
      expect(xem.getUint32(0)).toBe(canh[tep.ten])
      expect(xem.getUint32(4)).toBe(canh[tep.ten])
    }
  })

  it('điểm giữa mỗi tệp đều đục — hình không rỗng', () => {
    for (const tep of taoBoIcon()) {
      const ihdr = docKhoi(tep.noiDung).find((k) => k.kieu === 'IHDR')!.du
      const canh = new DataView(ihdr.buffer, ihdr.byteOffset, ihdr.byteLength).getUint32(0)
      const giua = Math.floor(canh / 2)
      expect(diemAnh(tep.noiDung, giua, giua)[3]).toBe(255)
    }
  })

  it('bản bo góc trong suốt ở góc, bản tràn viền thì không', () => {
    const boGoc = taoBoIcon().find((t) => t.ten === 'icon-192.png')!
    const tranVien = taoBoIcon().find((t) => t.ten === 'icon-512-maskable.png')!
    expect(diemAnh(boGoc.noiDung, 0, 0)[3]).toBe(0)
    expect(diemAnh(tranVien.noiDung, 0, 0)[3]).toBe(255)
  })

  it('vẽ lại lần nữa ra byte y hệt — không đồng hồ, không số ngẫu nhiên', () => {
    const lan1 = taoBoIcon()
    const lan2 = taoBoIcon()
    for (let i = 0; i < lan1.length; i++) {
      expect([...lan2[i]!.noiDung]).toEqual([...lan1[i]!.noiDung])
    }
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npm test -- scripts/tao-icon.test.ts`
Expected: ĐỎ — `Failed to resolve import "./tao-icon"`.

- [ ] **Step 3: Viết `scripts/tao-icon.ts`**

```ts
/**
 * Vẽ và mã hoá bộ biểu tượng cho màn hình chính điện thoại.
 *
 * Không kéo thư viện ảnh nào về: một bộ mã hoá PNG tối giản cộng vài phép tính
 * điểm ảnh là đủ cho bốn tệp hình phẳng. Gọi `sharp` hay `canvas` chỉ để vẽ ba
 * cái cột là sai tỉ lệ với một dự án chỉ có react ở runtime.
 */
import { deflateSync } from 'node:zlib'

export type TepIcon = { ten: string; noiDung: Uint8Array }

/* ---------- Bộ mã hoá PNG ---------- */

/** Bảng CRC32 dựng sẵn — PNG đòi mã kiểm tra này ở cuối mỗi khối. */
const BANG_CRC = (() => {
  const bang = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    bang[i] = c >>> 0
  }
  return bang
})()

function crc32(du: Uint8Array): number {
  let c = 0xffffffff
  for (const b of du) c = BANG_CRC[(c ^ b) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** Một khối PNG: độ dài (4) + kiểu (4) + dữ liệu (n) + mã kiểm tra (4). */
function khoi(kieu: string, du: Uint8Array): Uint8Array {
  const than = new Uint8Array(4 + du.length)
  than.set(new TextEncoder().encode(kieu), 0)
  than.set(du, 4)

  const ra = new Uint8Array(4 + than.length + 4)
  const xem = new DataView(ra.buffer)
  xem.setUint32(0, du.length)
  ra.set(than, 4)
  xem.setUint32(4 + than.length, crc32(than))
  return ra
}

/** Ghép các điểm ảnh RGBA (4 byte mỗi điểm, theo dòng) thành một tệp PNG hoàn chỉnh. */
export function mahoaPng(rong: number, cao: number, diem: Uint8Array): Uint8Array {
  const buocDong = rong * 4 + 1 // mỗi dòng quét phải mở đầu bằng một byte lọc
  const dong = new Uint8Array(cao * buocDong)
  for (let y = 0; y < cao; y++) {
    dong[y * buocDong] = 0 // 0 = không lọc; hình phẳng nên lọc không giúp gì đáng kể
    dong.set(diem.subarray(y * rong * 4, (y + 1) * rong * 4), y * buocDong + 1)
  }

  const ihdr = new Uint8Array(13)
  const xem = new DataView(ihdr.buffer)
  xem.setUint32(0, rong)
  xem.setUint32(4, cao)
  ihdr[8] = 8 // tám bit mỗi kênh
  ihdr[9] = 6 // kiểu màu 6 = RGBA
  ihdr[10] = 0 // nén deflate — kiểu duy nhất PNG cho phép
  ihdr[11] = 0 // phương pháp lọc chuẩn
  ihdr[12] = 0 // không xen dòng

  const phan = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    khoi('IHDR', ihdr),
    khoi('IDAT', new Uint8Array(deflateSync(dong))),
    khoi('IEND', new Uint8Array(0)),
  ]
  const ra = new Uint8Array(phan.reduce((t, p) => t + p.length, 0))
  let vt = 0
  for (const p of phan) {
    ra.set(p, vt)
    vt += p.length
  }
  return ra
}

/* ---------- Phần vẽ ---------- */

type Mau = readonly [number, number, number]

// Lấy thẳng từ bảng màu trong `src/styles.css` để biểu tượng không chỏi với game.
const NEN_TREN: Mau = [0x23, 0x27, 0x33] // --the
const NEN_DUOI: Mau = [0x14, 0x16, 0x1c] // --nen
const MAU_COT: Mau = [0x3f, 0xbf, 0x8f] // --xanh
const MAU_XU: Mau = [0xf5, 0xc4, 0x51] // --vang

/** Vẽ ở bốn lần kích thước rồi thu nhỏ trung bình — đó là toàn bộ cách khử răng cưa ở đây. */
const SIEU = 4

function pha(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

/** Điểm (x, y) có nằm trong hình chữ nhật bo góc không. */
function trongBoGoc(x: number, y: number, canh: number, banKinh: number): boolean {
  if (banKinh <= 0) return true
  const dx = x < banKinh ? banKinh - x : x > canh - 1 - banKinh ? x - (canh - 1 - banKinh) : 0
  const dy = y < banKinh ? banKinh - y : y > canh - 1 - banKinh ? y - (canh - 1 - banKinh) : 0
  return dx * dx + dy * dy <= banKinh * banKinh
}

function toMau(anh: Uint8Array, canh: number, x: number, y: number, mau: Mau): void {
  if (x < 0 || y < 0 || x >= canh || y >= canh) return
  const i = (y * canh + x) * 4
  anh[i] = mau[0]
  anh[i + 1] = mau[1]
  anh[i + 2] = mau[2]
  anh[i + 3] = 255
}

function veChuNhatBoGoc(
  anh: Uint8Array,
  canh: number,
  x0: number,
  y0: number,
  rong: number,
  cao: number,
  banKinh: number,
  mau: Mau,
): void {
  for (let y = 0; y < cao; y++) {
    for (let x = 0; x < rong; x++) {
      const dx = x < banKinh ? banKinh - x : x > rong - 1 - banKinh ? x - (rong - 1 - banKinh) : 0
      const dy = y < banKinh ? banKinh - y : y > cao - 1 - banKinh ? y - (cao - 1 - banKinh) : 0
      if (dx * dx + dy * dy > banKinh * banKinh) continue
      toMau(anh, canh, Math.round(x0) + x, Math.round(y0) + y, mau)
    }
  }
}

function veTron(anh: Uint8Array, canh: number, cx: number, cy: number, r: number, mau: Mau): void {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue
      toMau(anh, canh, x, y, mau)
    }
  }
}

/**
 * Ba cột tăng dần đội một đồng xu — đọc ra "dòng tiền đi lên" ở cỡ 48 điểm ảnh
 * trên màn hình chính, mà chỉ cần hình chữ nhật với hình tròn nên không phải kéo
 * theo bộ dựng phông chữ nào.
 */
function veHinh(anh: Uint8Array, canh: number, tyLeHinh: number): void {
  const s = canh * tyLeHinh
  const o = (canh - s) / 2

  const rongCot = s * 0.16
  const khoangCach = s * 0.1
  const dayCot = o + s * 0.82
  const chieuCao = [s * 0.26, s * 0.42, s * 0.58]

  for (let i = 0; i < 3; i++) {
    const cao = chieuCao[i]!
    veChuNhatBoGoc(
      anh,
      canh,
      o + s * 0.16 + i * (rongCot + khoangCach),
      dayCot - cao,
      Math.round(rongCot),
      Math.round(cao),
      rongCot * 0.28,
      MAU_COT,
    )
  }

  // Đồng xu ngồi ngay trên đỉnh cột cao nhất, hơi chồm xuống để hai hình dính nhau.
  veTron(anh, canh, o + s * 0.76, o + s * 0.14, s * 0.12, MAU_XU)
}

/** Thu nhỏ trung bình từ ảnh SIEU lần về đúng cạnh cần. */
function thuNho(to: Uint8Array, canhTo: number, canh: number): Uint8Array {
  const ra = new Uint8Array(canh * canh * 4)
  const o = SIEU * SIEU
  for (let y = 0; y < canh; y++) {
    for (let x = 0; x < canh; x++) {
      const tong = [0, 0, 0, 0]
      for (let dy = 0; dy < SIEU; dy++) {
        for (let dx = 0; dx < SIEU; dx++) {
          const i = ((y * SIEU + dy) * canhTo + (x * SIEU + dx)) * 4
          for (let k = 0; k < 4; k++) tong[k]! += to[i + k]!
        }
      }
      const j = (y * canh + x) * 4
      for (let k = 0; k < 4; k++) ra[j + k] = Math.round(tong[k]! / o)
    }
  }
  return ra
}

function veIcon(canh: number, boGoc: boolean, tyLeHinh: number): Uint8Array {
  const canhTo = canh * SIEU
  const to = new Uint8Array(canhTo * canhTo * 4)
  const banKinh = boGoc ? canhTo * 0.22 : 0

  for (let y = 0; y < canhTo; y++) {
    const t = y / (canhTo - 1)
    for (let x = 0; x < canhTo; x++) {
      const i = (y * canhTo + x) * 4
      // Luôn ghi màu nền kể cả ở phần trong suốt: nếu để đen, bước thu nhỏ trung
      // bình sẽ kéo viền bo góc thành một vệt tối.
      to[i] = pha(NEN_TREN[0], NEN_DUOI[0], t)
      to[i + 1] = pha(NEN_TREN[1], NEN_DUOI[1], t)
      to[i + 2] = pha(NEN_TREN[2], NEN_DUOI[2], t)
      to[i + 3] = trongBoGoc(x, y, canhTo, banKinh) ? 255 : 0
    }
  }

  veHinh(to, canhTo, tyLeHinh)
  return thuNho(to, canhTo, canh)
}

export function taoBoIcon(): TepIcon[] {
  return [
    { ten: 'icon-192.png', noiDung: mahoaPng(192, 192, veIcon(192, true, 0.72)) },
    { ten: 'icon-512.png', noiDung: mahoaPng(512, 512, veIcon(512, true, 0.72)) },
    // Bản maskable bị Android cắt tròn hoặc cắt vuông tuỳ máy, nên nền phải tràn
    // kín viền và hình phải co vào vùng an toàn giữa ảnh.
    { ten: 'icon-512-maskable.png', noiDung: mahoaPng(512, 512, veIcon(512, false, 0.52)) },
    // iOS tự bo góc ảnh này, tự vẽ ảnh này lên nền trắng nếu có phần trong suốt —
    // nên nó phải tràn viền và đục hoàn toàn.
    { ten: 'icon-180.png', noiDung: mahoaPng(180, 180, veIcon(180, false, 0.72)) },
  ]
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npm test -- scripts/tao-icon.test.ts`
Expected: XANH, 10 bài.

- [ ] **Step 5: Xem tận mắt bốn tệp biểu tượng**

Nhìn số liệu không thay được nhìn hình. Xuất ra thư mục nháp rồi mở bằng trình xem ảnh:

```bash
node -e "
import('./scripts/tao-icon.ts').then(async (m) => {
  const fs = await import('node:fs')
  fs.mkdirSync('.icon-nhap', { recursive: true })
  for (const t of m.taoBoIcon()) fs.writeFileSync('.icon-nhap/' + t.ten, t.noiDung)
  console.log('da xuat 4 tep vao .icon-nhap/')
})"
```

Node 24 tự bóc kiểu TypeScript nên lệnh trên chạy thẳng. Nếu máy báo `Unknown file extension ".ts"`, thêm cờ `--experimental-strip-types` ngay sau `node`.

Mở `.icon-nhap/icon-512.png`. Phải thấy ba cột xanh tăng dần trên nền tối bo góc, một đồng xu vàng trên đỉnh cột cao nhất. Nếu hình lệch khỏi khung hoặc đồng xu chồng lên cột quá nhiều thì chỉnh các hệ số trong `veHinh` rồi xem lại.

Xoá thư mục nháp trước khi commit: `rm -rf .icon-nhap`

- [ ] **Step 6: Chạy toàn bộ test và biên dịch**

Run: `npm test`
Expected: **315/315 xanh** (305 nền + 10 bài mới).

Run: `./node_modules/.bin/tsc -b --noEmit`
Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add scripts/tao-icon.ts scripts/tao-icon.test.ts
git commit -m "ngoai tuyen: bo ma hoa PNG toi gian va bon tep bieu tuong

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Khuôn service worker và hàm đúc khuôn

**Files:**
- Create: `scripts/khuon-service-worker.js`
- Create: `scripts/dung-service-worker.ts`
- Test: `scripts/dung-service-worker.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  ```ts
  export function tenCacheTu(danhSachTep: string[]): string
  export function dungServiceWorker(danhSachTep: string[]): string
  ```
  Task 5 gọi `dungServiceWorker` với danh sách đường dẫn tương đối kiểu `'./index.html'`, `'./assets/index-DP6MwbIe.js'`.

- [ ] **Step 1: Viết test (chưa có mã, phải đỏ)**

```ts
// scripts/dung-service-worker.test.ts
import { describe, expect, it } from 'vitest'
import { dungServiceWorker, tenCacheTu } from './dung-service-worker'

const MAU = ['./index.html', './assets/index-abc123.js', './assets/index-def456.css']

describe('tên cache', () => {
  it('mở đầu bằng tiền tố dùng chung để lúc gỡ còn quét ra', () => {
    expect(tenCacheTu(MAU)).toMatch(/^dong-tien-/)
  })

  it('danh sách đổi thì tên cache đổi — đó là cách bản mới dọn được bản cũ', () => {
    expect(tenCacheTu(['./assets/a.js'])).not.toBe(tenCacheTu(['./assets/b.js']))
  })

  it('cùng một danh sách luôn ra cùng một tên — không đồng hồ, không số ngẫu nhiên', () => {
    expect(tenCacheTu(MAU)).toBe(tenCacheTu(MAU))
  })

  it('thứ tự danh sách không làm đổi tên cache', () => {
    expect(tenCacheTu(['./a', './b'])).toBe(tenCacheTu(['./b', './a']))
  })
})

describe('đúc service worker', () => {
  it('không còn chỗ đánh dấu nào sót lại', () => {
    const ma = dungServiceWorker(MAU)
    expect(ma).not.toContain('__TEN_CACHE__')
    expect(ma).not.toContain('__DANH_SACH_TEP__')
  })

  it('chèn đủ và đúng cả ba đường dẫn', () => {
    const ma = dungServiceWorker(MAU)
    for (const tep of MAU) expect(ma).toContain(JSON.stringify(tep))
  })

  it('chèn đúng tên cache đã tính', () => {
    expect(dungServiceWorker(MAU)).toContain(`'${tenCacheTu(MAU)}'`)
  })

  it('giữ nguyên ba trình xử lý sự kiện của service worker', () => {
    const ma = dungServiceWorker(MAU)
    for (const su of ['install', 'activate', 'fetch']) {
      expect(ma).toContain(`addEventListener('${su}'`)
    }
  })

  it('không tự cache chính nó — service worker nằm trong cache là tự khoá mình ở bản cũ', () => {
    expect(dungServiceWorker(MAU)).not.toContain('"./service-worker.js"')
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npm test -- scripts/dung-service-worker.test.ts`
Expected: ĐỎ — `Failed to resolve import "./dung-service-worker"`.

- [ ] **Step 3: Viết khuôn service worker**

```js
// scripts/khuon-service-worker.js
/**
 * Khuôn service worker — tệp này KHÔNG đi qua bundler. `dung-service-worker.ts`
 * thay hai chỗ đánh dấu rồi ghi nguyên văn ra `dist/service-worker.js`.
 *
 * Chiến lược: MẠNG TRƯỚC cho trang, CACHE TRƯỚC cho tệp đã băm tên.
 * - Có mạng  → luôn nhận bản mới nhất, người chơi không bao giờ kẹt ở bản cũ.
 * - Mất mạng → rơi xuống bản đã lưu, game vẫn mở được ở chế độ máy bay.
 */
const TEN_CACHE = '__TEN_CACHE__'
const DANH_SACH_TEP = __DANH_SACH_TEP__
const TRANG_CHU = new URL('./index.html', self.location.href).href

self.addEventListener('install', (su) => {
  su.waitUntil(
    caches
      .open(TEN_CACHE)
      .then((kho) => kho.addAll(DANH_SACH_TEP))
      // Lên thay ngay chứ không xếp hàng chờ: bước này không tải lại trang, và
      // trang đang mở đã nạp xong toàn bộ mã (một gói duy nhất, không có phần tải
      // trễ) nên ván đang chơi không hề bị đụng tới.
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (su) => {
  su.waitUntil(
    caches
      .keys()
      .then((ten) => Promise.all(ten.filter((t) => t !== TEN_CACHE).map((t) => caches.delete(t))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (su) => {
  const yeuCau = su.request
  if (yeuCau.method !== 'GET') return
  if (new URL(yeuCau.url).origin !== self.location.origin) return

  su.respondWith(yeuCau.mode === 'navigate' ? mangTruoc(yeuCau) : cacheTruoc(yeuCau))
})

/** Trang: hỏi mạng trước, để người chơi có mạng luôn thấy đúng bản hiện tại. */
async function mangTruoc(yeuCau) {
  try {
    const traLoi = await fetch(yeuCau)
    // Chỉ lưu bản lành lặn. Một trang 404 của GitHub Pages mà lọt vào cache sẽ
    // thay thế game mỗi lần người chơi mở lúc mất mạng.
    if (traLoi.ok && traLoi.status === 200) {
      const kho = await caches.open(TEN_CACHE)
      await kho.put(TRANG_CHU, traLoi.clone())
    }
    return traLoi
  } catch (loi) {
    const daLuu = await caches.match(TRANG_CHU)
    if (daLuu) return daLuu
    throw loi
  }
}

/** Tệp trong assets/: tên đã chứa mã băm nội dung nên bản trong cache không thể cũ. */
async function cacheTruoc(yeuCau) {
  const daLuu = await caches.match(yeuCau)
  if (daLuu) return daLuu
  const traLoi = await fetch(yeuCau)
  if (traLoi.ok && traLoi.status === 200) {
    const kho = await caches.open(TEN_CACHE)
    await kho.put(yeuCau, traLoi.clone())
  }
  return traLoi
}
```

- [ ] **Step 4: Viết hàm đúc khuôn**

```ts
// scripts/dung-service-worker.ts
/**
 * Đúc khuôn service worker thành nội dung thật: chèn danh sách tệp của bản build
 * này và một tên cache suy từ chính danh sách đó.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const DUONG_KHUON = fileURLToPath(new URL('./khuon-service-worker.js', import.meta.url))

/**
 * Tên cache suy từ chính danh sách tệp — tên tệp trong `assets/` đã chứa mã băm
 * nội dung, nên danh sách đổi tức là bản game đổi.
 *
 * Sắp xếp trước khi băm vì thứ tự đọc thư mục không phải thứ tự đảm bảo. Không
 * dùng đồng hồ: dựng lại cùng một bản mà ra tên cache khác thì mỗi lần triển khai
 * là một lần bắt người chơi tải lại toàn bộ game.
 */
export function tenCacheTu(danhSachTep: string[]): string {
  const bam = createHash('sha256').update([...danhSachTep].sort().join('\n')).digest('hex')
  return `dong-tien-${bam.slice(0, 12)}`
}

export function dungServiceWorker(danhSachTep: string[]): string {
  return readFileSync(DUONG_KHUON, 'utf8')
    .replace('__TEN_CACHE__', tenCacheTu(danhSachTep))
    .replace('__DANH_SACH_TEP__', JSON.stringify(danhSachTep))
}
```

- [ ] **Step 5: Chạy test để chắc chắn nó xanh**

Run: `npm test -- scripts/dung-service-worker.test.ts`
Expected: XANH, 9 bài.

- [ ] **Step 6: Chạy toàn bộ test**

Run: `npm test`
Expected: nền cũ + 9 bài mới, không bài nào đỏ.

- [ ] **Step 7: Commit**

```bash
git add scripts/khuon-service-worker.js scripts/dung-service-worker.ts scripts/dung-service-worker.test.ts
git commit -m "ngoai tuyen: khuon service worker mang truoc cache do sau

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Đăng ký, gỡ và đo trạng thái

**Files:**
- Create: `src/ngoai-tuyen/dang-ky.ts`
- Test: `src/ngoai-tuyen/dang-ky.test.ts`

**Interfaces:**
- Consumes: `TrangThaiNgoaiTuyen` từ `./trang-thai` (Task 0)
- Produces:
  ```ts
  export function canTro(coServiceWorker: boolean, banPhatHanh: boolean): TrangThaiNgoaiTuyen | null
  export function docLuaChon(): boolean
  export function ghiLuaChon(bat: boolean): void
  export function trangThaiHienTai(): Promise<TrangThaiNgoaiTuyen>
  export function batNgoaiTuyen(): Promise<TrangThaiNgoaiTuyen>
  export function tatNgoaiTuyen(): Promise<void>
  ```
  Task 4 gọi `trangThaiHienTai`, `batNgoaiTuyen`, `tatNgoaiTuyen`.

**Ghi chú môi trường test:** dự án chạy test ở môi trường `node`, **không có jsdom**. Mọi thứ của trình duyệt phải dựng giả bằng `vi.stubGlobal`. `vi.stubEnv('PROD', true)` đã được thử nghiệm thật trên Vitest 3.2.7 của dự án và chạy được.

- [ ] **Step 1: Viết test (chưa có mã, phải đỏ)**

```ts
// src/ngoai-tuyen/dang-ky.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { batNgoaiTuyen, canTro, docLuaChon, ghiLuaChon, tatNgoaiTuyen, trangThaiHienTai } from './dang-ky'

/** localStorage giả, đủ ba phương thức mà mã thật dùng tới. */
function khoGia() {
  const kho = new Map<string, string>()
  return {
    getItem: (k: string) => kho.get(k) ?? null,
    setItem: (k: string, v: string) => void kho.set(k, v),
    removeItem: (k: string) => void kho.delete(k),
    kho,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('hai lý do khiến công tắc không dùng được', () => {
  it('trình duyệt không có service worker', () => {
    expect(canTro(false, true)).toBe('khong-ho-tro')
  })

  it('đang chạy dev server — tệp service worker chỉ sinh ra lúc dựng bản phát hành', () => {
    expect(canTro(true, false)).toBe('chi-ban-phat-hanh')
  })

  it('đủ điều kiện thì không cản', () => {
    expect(canTro(true, true)).toBeNull()
  })

  it('thiếu service worker được báo trước, kể cả khi cũng đang ở dev', () => {
    expect(canTro(false, false)).toBe('khong-ho-tro')
  })
})

describe('lựa chọn đã lưu', () => {
  it('mặc định là tắt', () => {
    vi.stubGlobal('localStorage', khoGia())
    expect(docLuaChon()).toBe(false)
  })

  it('ghi bật rồi đọc lại ra bật', () => {
    vi.stubGlobal('localStorage', khoGia())
    ghiLuaChon(true)
    expect(docLuaChon()).toBe(true)
  })

  it('lưu ở khoá riêng, không đụng khoá ván — đổi phiên bản game không được xoá lựa chọn', () => {
    const kho = khoGia()
    vi.stubGlobal('localStorage', kho)
    ghiLuaChon(true)
    expect([...kho.kho.keys()]).toEqual(['dong-tien-ngoai-tuyen'])
  })

  it('trình duyệt chặn localStorage thì coi như tắt, không ném lỗi', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bị chặn')
      },
      setItem: () => {
        throw new Error('bị chặn')
      },
      removeItem: () => {
        throw new Error('bị chặn')
      },
    })
    expect(docLuaChon()).toBe(false)
    expect(() => ghiLuaChon(true)).not.toThrow()
  })
})

describe('đo trạng thái hiện tại', () => {
  it('chưa đăng ký thì là tắt', async () => {
    vi.stubEnv('PROD', true)
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration: async () => undefined } })
    expect(await trangThaiHienTai()).toBe('tat')
  })

  it('đã đăng ký và đang hoạt động thì là sẵn sàng', async () => {
    vi.stubEnv('PROD', true)
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration: async () => ({ active: {} }) },
    })
    expect(await trangThaiHienTai()).toBe('san-sang')
  })

  it('đã đăng ký nhưng chưa hoạt động thì là đang tải', async () => {
    vi.stubEnv('PROD', true)
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration: async () => ({ active: null, installing: {} }) },
    })
    expect(await trangThaiHienTai()).toBe('dang-tai')
  })
})

describe('bật', () => {
  it('đăng ký đúng một lần với đường dẫn tương đối và trả sẵn sàng', async () => {
    vi.stubEnv('PROD', true)
    const kho = khoGia()
    vi.stubGlobal('localStorage', kho)
    const register = vi.fn(async () => ({ active: {} }))
    vi.stubGlobal('navigator', { serviceWorker: { register } })

    expect(await batNgoaiTuyen()).toBe('san-sang')
    expect(register).toHaveBeenCalledTimes(1)
    expect(register).toHaveBeenCalledWith('./service-worker.js', { scope: './' })
    expect(kho.kho.get('dong-tien-ngoai-tuyen')).toBe('bat')
  })

  it('bật lúc mất mạng thì trả lỗi và KHÔNG ghi lựa chọn', async () => {
    vi.stubEnv('PROD', true)
    const kho = khoGia()
    vi.stubGlobal('localStorage', kho)
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register: async () => {
          throw new Error('không tải được')
        },
      },
    })

    expect(await batNgoaiTuyen()).toBe('loi')
    expect(kho.kho.size).toBe(0)
  })

  it('không đăng ký gì khi đang chạy dev server', async () => {
    vi.stubEnv('PROD', false)
    const register = vi.fn()
    vi.stubGlobal('navigator', { serviceWorker: { register } })

    expect(await batNgoaiTuyen()).toBe('chi-ban-phat-hanh')
    expect(register).not.toHaveBeenCalled()
  })
})

describe('tắt', () => {
  it('gỡ đăng ký, xoá đúng cache của game, giữ nguyên cache của trang khác', async () => {
    vi.stubEnv('PROD', true)
    const kho = khoGia()
    kho.setItem('dong-tien-ngoai-tuyen', 'bat')
    vi.stubGlobal('localStorage', kho)

    const unregister = vi.fn(async () => true)
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration: async () => ({ unregister }) } })

    const daXoa: string[] = []
    vi.stubGlobal('caches', {
      keys: async () => ['dong-tien-abc', 'dong-tien-def', 'trang-khac-ghi'],
      delete: async (t: string) => void daXoa.push(t),
    })

    await tatNgoaiTuyen()

    expect(unregister).toHaveBeenCalledTimes(1)
    expect(daXoa.sort()).toEqual(['dong-tien-abc', 'dong-tien-def'])
    expect(kho.kho.size).toBe(0)
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npm test -- src/ngoai-tuyen/dang-ky.test.ts`
Expected: ĐỎ — `Failed to resolve import "./dang-ky"`.

- [ ] **Step 3: Viết `src/ngoai-tuyen/dang-ky.ts`**

```ts
/**
 * Bật / tắt / đo trạng thái của chế độ chơi khi không có mạng.
 *
 * Tệp này không biết gì về React và không biết gì về game — nó chỉ nói chuyện với
 * `navigator.serviceWorker`, `caches` và `localStorage`.
 */
import type { TrangThaiNgoaiTuyen } from './trang-thai'

/**
 * Khoá riêng, KHÔNG dùng chung với `CONFIG.luuKey`. Khoá ván đổi theo từng phiên
 * bản game; nhét lựa chọn vào đó thì lên bản sau là người chơi mất luôn cài đặt.
 */
const KHOA = 'dong-tien-ngoai-tuyen'

/** Mọi cache của game đều mang tiền tố này để lúc gỡ còn quét ra mà xoá. */
const TIEN_TO_CACHE = 'dong-tien-'

/** Tương đối, không tuyệt đối: game chạy ở đường dẫn con `/CashFlow/` trên GitHub Pages. */
const DUONG_DAN_SW = './service-worker.js'

/**
 * Hai lý do khiến công tắc không dùng được. Tách thành hàm thuần để test khỏi
 * phải dựng cả `navigator` giả chỉ để kiểm tra một câu lệnh rẽ nhánh.
 */
export function canTro(
  coServiceWorker: boolean,
  banPhatHanh: boolean,
): TrangThaiNgoaiTuyen | null {
  if (!coServiceWorker) return 'khong-ho-tro'
  if (!banPhatHanh) return 'chi-ban-phat-hanh'
  return null
}

function canTroHienTai(): TrangThaiNgoaiTuyen | null {
  const co = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
  return canTro(co, import.meta.env.PROD)
}

export function docLuaChon(): boolean {
  try {
    return localStorage.getItem(KHOA) === 'bat'
  } catch {
    return false
  }
}

export function ghiLuaChon(bat: boolean): void {
  try {
    if (bat) localStorage.setItem(KHOA, 'bat')
    else localStorage.removeItem(KHOA)
  } catch {
    // Trình duyệt chặn localStorage. Công tắc vẫn dùng được trong phiên này, chỉ
    // là lần sau mở lại sẽ không nhớ — thà vậy còn hơn vỡ cả tab Sổ sách.
  }
}

export async function trangThaiHienTai(): Promise<TrangThaiNgoaiTuyen> {
  const chan = canTroHienTai()
  if (chan) return chan
  try {
    const dangKy = await navigator.serviceWorker.getRegistration()
    if (!dangKy) return 'tat'
    return dangKy.active ? 'san-sang' : 'dang-tai'
  } catch {
    return 'loi'
  }
}

export async function batNgoaiTuyen(): Promise<TrangThaiNgoaiTuyen> {
  const chan = canTroHienTai()
  if (chan) return chan
  try {
    const dangKy = await navigator.serviceWorker.register(DUONG_DAN_SW, { scope: './' })
    await choTaiXong(dangKy)
    ghiLuaChon(true)
    return 'san-sang'
  } catch {
    // Ca thường gặp nhất: bật đúng lúc đang mất sóng nên không tải nổi tệp về.
    // KHÔNG ghi lựa chọn — lần sau mở lại phải là trạng thái tắt thật thà, chứ
    // không phải một cái công tắc bật mà chẳng có gì trong máy.
    return 'loi'
  }
}

/** Chờ tới lúc service worker thật sự hoạt động, đừng báo xong khi mới tải một nửa. */
async function choTaiXong(dangKy: ServiceWorkerRegistration): Promise<void> {
  if (dangKy.active) return
  const dangCai = dangKy.installing ?? dangKy.waiting
  if (!dangCai) return
  if (dangCai.state === 'activated') return
  await new Promise<void>((xong, hong) => {
    dangCai.addEventListener('statechange', () => {
      if (dangCai.state === 'activated') xong()
      if (dangCai.state === 'redundant') hong(new Error('service worker bị bỏ giữa chừng'))
    })
  })
}

export async function tatNgoaiTuyen(): Promise<void> {
  // Ghi lựa chọn TRƯỚC khi gỡ: nếu bước gỡ hỏng giữa chừng thì ít nhất công tắc
  // cũng không tự bật lại ở lần mở sau.
  ghiLuaChon(false)
  try {
    const dangKy = await navigator.serviceWorker.getRegistration()
    if (dangKy) await dangKy.unregister()
    const ten = await caches.keys()
    await Promise.all(ten.filter((t) => t.startsWith(TIEN_TO_CACHE)).map((t) => caches.delete(t)))
  } catch {
    // Gỡ được tới đâu hay tới đó.
  }
}
```

- [ ] **Step 4: Chạy test để chắc chắn nó xanh**

Run: `npm test -- src/ngoai-tuyen/dang-ky.test.ts`
Expected: XANH, 15 bài.

- [ ] **Step 5: Chạy toàn bộ test và biên dịch**

Run: `npm test` — Expected: nền cũ + 15 bài mới, không đỏ.
Run: `./node_modules/.bin/tsc -b --noEmit` — Expected: không lỗi.

- [ ] **Step 6: Commit**

```bash
git add src/ngoai-tuyen/dang-ky.ts src/ngoai-tuyen/dang-ky.test.ts
git commit -m "ngoai tuyen: dang ky, go va do trang thai service worker

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Khối giao diện trong tab Sổ sách

**Files:**
- Create: `src/ngoai-tuyen/KhoiNgoaiTuyen.tsx`
- Test: `src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts`
- Modify: `src/styles.css` (chỉ **thêm vào cuối tệp**, không sửa dòng nào có sẵn)

**Interfaces:**
- Consumes: `TrangThaiNgoaiTuyen` từ `./trang-thai` (Task 0); `trangThaiHienTai`, `batNgoaiTuyen`, `tatNgoaiTuyen` từ `./dang-ky` (Task 3 — chữ ký ghi ở phần Interfaces của Task 3)
- Produces:
  ```tsx
  export function NoiDungNgoaiTuyen(props: {
    trangThai: TrangThaiNgoaiTuyen
    onBat: () => void
    onTat: () => void
  }): JSX.Element
  export default function KhoiNgoaiTuyen(): JSX.Element
  ```
  Task 6 render `<KhoiNgoaiTuyen />` (xuất mặc định).

**Vì sao tách đôi:** effect không chạy khi kết xuất tĩnh, nên gộp một cục thì chỉ test được đúng trạng thái khởi tạo. Phần thuần `NoiDungNgoaiTuyen` nhận trạng thái qua props và test được cả sáu.

- [ ] **Step 1: Viết test (chưa có mã, phải đỏ)**

```ts
// src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts
/**
 * Lưới an toàn cho khối "chơi khi không có mạng": kết xuất tĩnh đủ sáu trạng thái
 * và bắt chữ rò rỉ ra màn hình, theo đúng lối của `src/ui/giao-dien.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { NoiDungNgoaiTuyen } from './KhoiNgoaiTuyen'
import type { TrangThaiNgoaiTuyen } from './trang-thai'

const SAU_TRANG_THAI: TrangThaiNgoaiTuyen[] = [
  'tat',
  'dang-tai',
  'san-sang',
  'loi',
  'khong-ho-tro',
  'chi-ban-phat-hanh',
]

function ve(trangThai: TrangThaiNgoaiTuyen): string {
  return renderToStaticMarkup(
    createElement(NoiDungNgoaiTuyen, { trangThai, onBat: () => {}, onTat: () => {} }),
  )
}

describe('khối chơi khi không có mạng', () => {
  it('cả sáu trạng thái đều kết xuất được, không ném lỗi', () => {
    for (const t of SAU_TRANG_THAI) expect(() => ve(t)).not.toThrow()
  })

  it('không rò NaN hay undefined ra màn hình', () => {
    for (const t of SAU_TRANG_THAI) {
      expect(ve(t)).not.toContain('NaN')
      expect(ve(t)).not.toContain('undefined')
    }
  })

  it('mỗi trạng thái có icon riêng, không trạng thái nào trơ trụi', () => {
    const icon = ['📴', '📥', '✅', '⚠️', 'ℹ️', 'ℹ️']
    SAU_TRANG_THAI.forEach((t, i) => expect(ve(t)).toContain(icon[i]))
  })

  it('ba trạng thái bấm được thì có nút, ba trạng thái còn lại thì không', () => {
    for (const t of ['tat', 'san-sang', 'loi'] as const) expect(ve(t)).toContain('<button')
    for (const t of ['dang-tai', 'khong-ho-tro', 'chi-ban-phat-hanh'] as const) {
      expect(ve(t)).not.toContain('<button')
    }
  })

  it('nút đổi chữ theo chiều bật hay tắt', () => {
    expect(ve('tat')).toContain('Tải về máy')
    expect(ve('loi')).toContain('Thử lại')
    expect(ve('san-sang')).toContain('Xoá khỏi máy')
  })

  it('trạng thái sẵn sàng nói rõ có mạng vẫn là bản mới nhất', () => {
    expect(ve('san-sang')).toContain('bản mới nhất')
  })

  it('mọi chữ đều là tiếng Việt có dấu, không lọt chuỗi mã trạng thái ra màn hình', () => {
    for (const t of SAU_TRANG_THAI) expect(ve(t)).not.toContain('chi-ban-phat-hanh')
  })
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó đỏ**

Run: `npm test -- src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts`
Expected: ĐỎ — `Failed to resolve import "./KhoiNgoaiTuyen"`.

- [ ] **Step 3: Viết `src/ngoai-tuyen/KhoiNgoaiTuyen.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { batNgoaiTuyen, tatNgoaiTuyen, trangThaiHienTai } from './dang-ky'
import type { TrangThaiNgoaiTuyen } from './trang-thai'

type Chu = { icon: string; tieuDe: string; mo: string; nut?: string }

const CHU: Record<TrangThaiNgoaiTuyen, Chu> = {
  tat: {
    icon: '📴',
    tieuDe: 'Chơi khi không có mạng',
    mo: 'Tải game về máy, khoảng 330 KB, để vào chơi được cả khi đang ở chế độ máy bay hoặc mất sóng.',
    nut: '📥 Tải về máy',
  },
  'dang-tai': {
    icon: '📥',
    tieuDe: 'Đang tải về máy…',
    mo: 'Chờ một chút, game đang được lưu vào máy của bạn.',
  },
  'san-sang': {
    icon: '✅',
    tieuDe: 'Đã sẵn sàng',
    mo: 'Chơi được cả khi không có mạng. Khi có mạng thì bạn vẫn luôn vào bản mới nhất.',
    nut: '🗑️ Xoá khỏi máy',
  },
  loi: {
    icon: '⚠️',
    tieuDe: 'Chưa tải về được',
    mo: 'Cần có mạng để tải game về máy. Thử lại khi có sóng nhé.',
    nut: '🔄 Thử lại',
  },
  'khong-ho-tro': {
    icon: 'ℹ️',
    tieuDe: 'Trình duyệt không hỗ trợ',
    mo: 'Trình duyệt này không cho phép lưu game để chơi khi không có mạng. Cửa sổ riêng tư thường chặn tính năng đó.',
  },
  'chi-ban-phat-hanh': {
    icon: 'ℹ️',
    tieuDe: 'Chỉ có ở bản phát hành',
    mo: 'Tính năng này không chạy khi đang phát triển. Hãy dựng bản phát hành rồi thử lại.',
  },
}

/**
 * Phần thuần: nhận trạng thái qua props, không giữ state, không có effect — nhờ
 * vậy kết xuất tĩnh được cả sáu trạng thái trong test.
 */
export function NoiDungNgoaiTuyen({
  trangThai,
  onBat,
  onTat,
}: {
  trangThai: TrangThaiNgoaiTuyen
  onBat: () => void
  onTat: () => void
}) {
  const chu = CHU[trangThai]
  return (
    <div className="the khoi-ngoai-tuyen">
      <div className="ngoai-tuyen-dau">
        <span className="ngoai-tuyen-icon">{chu.icon}</span>
        <strong>{chu.tieuDe}</strong>
      </div>
      <p className="ngoai-tuyen-mo">{chu.mo}</p>
      {chu.nut && (
        <button
          className="nut nut-rong"
          onClick={trangThai === 'san-sang' ? onTat : onBat}
        >
          {chu.nut}
        </button>
      )}
    </div>
  )
}

/** Vỏ giữ state và nói chuyện với trình duyệt. */
export default function KhoiNgoaiTuyen() {
  const [trangThai, datTrangThai] = useState<TrangThaiNgoaiTuyen>('tat')

  useEffect(() => {
    let conGan = true
    void trangThaiHienTai().then((t) => {
      if (conGan) datTrangThai(t)
    })
    return () => {
      conGan = false
    }
  }, [])

  const bat = useCallback(() => {
    datTrangThai('dang-tai')
    void batNgoaiTuyen().then(datTrangThai)
  }, [])

  const tat = useCallback(() => {
    void tatNgoaiTuyen().then(() => datTrangThai('tat'))
  }, [])

  return <NoiDungNgoaiTuyen trangThai={trangThai} onBat={bat} onTat={tat} />
}
```

- [ ] **Step 4: Thêm lớp CSS vào **cuối** `src/styles.css`**

```css
/* ---------- Khối chơi khi không có mạng ---------- */

.khoi-ngoai-tuyen {
  margin-top: 16px;
}

.ngoai-tuyen-dau {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ngoai-tuyen-icon {
  font-size: 20px;
  line-height: 1;
}

.ngoai-tuyen-mo {
  margin: 0 0 12px;
  color: var(--chu-mo);
  font-size: 13px;
  line-height: 1.5;
}
```

- [ ] **Step 5: Chạy test để chắc chắn nó xanh**

Run: `npm test -- src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts`
Expected: XANH, 7 bài.

Nếu bài "ba trạng thái bấm được thì có nút" đỏ, kiểm tra lại `chu.nut` — ba trạng thái `dang-tai`, `khong-ho-tro`, `chi-ban-phat-hanh` không được khai trường `nut`.

- [ ] **Step 6: Chạy toàn bộ test và biên dịch**

Run: `npm test` — Expected: nền cũ + 7 bài mới, không đỏ.
Run: `./node_modules/.bin/tsc -b --noEmit` — Expected: không lỗi.

- [ ] **Step 7: Commit**

```bash
git add src/ngoai-tuyen/KhoiNgoaiTuyen.tsx src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts src/styles.css
git commit -m "ngoai tuyen: khoi giao dien sau trang thai

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# ĐỢT 2 — hai task chạy song song

---

## Task 5: Plugin Vite — phát service worker, manifest và biểu tượng

**Files:**
- Create: `scripts/plugin-ngoai-tuyen.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `taoBoIcon` từ `./tao-icon` (Task 1); `dungServiceWorker` từ `./dung-service-worker` (Task 2)
- Produces: `export function ngoaiTuyen(): Plugin` — cắm vào mảng `plugins` của Vite.

**Vì sao dùng `closeBundle` chứ không `generateBundle`:** ở `closeBundle` thì toàn bộ tệp đã nằm sẵn trên đĩa, chỉ cần đọc thư mục là có danh sách thật — không phải đoán xem plugin nào của Vite đã phát tệp CSS ra chưa. Đổi lại phải tự ghi tệp bằng `node:fs` thay vì `this.emitFile`.

- [ ] **Step 1: Viết `scripts/plugin-ngoai-tuyen.ts`**

```ts
/**
 * Plugin Vite cho chế độ chơi khi không có mạng.
 *
 * Ba việc, tất cả chỉ ở bản phát hành:
 *   1. Chèn thẻ manifest và biểu tượng vào `<head>` của index.html
 *   2. Ghi bốn tệp biểu tượng và manifest ra thư mục dựng
 *   3. Đọc thư mục vừa dựng để lấy danh sách tệp thật, rồi đúc service worker
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { dungServiceWorker } from './dung-service-worker'
import { taoBoIcon } from './tao-icon'

/**
 * `start_url` và `scope` phải là đường dẫn tương đối để khớp `base: './'` —
 * game chạy ở đường dẫn con `/CashFlow/` trên GitHub Pages, đường dẫn tuyệt đối
 * sẽ trỏ ra ngoài và trình duyệt từ chối cài.
 */
const MANIFEST = {
  name: 'Dòng Tiền',
  short_name: 'Dòng Tiền',
  description: 'Game mô phỏng tài chính cá nhân — mỗi lượt là một năm.',
  lang: 'vi',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#14161c',
  theme_color: '#14161c',
  icons: [
    { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: './icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

const THE_HEAD = `    <meta name="theme-color" content="#14161c" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="apple-touch-icon" href="./icon-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Dòng Tiền" />
`

export function ngoaiTuyen(): Plugin {
  let thuMucRa = 'dist'

  return {
    name: 'dong-tien-ngoai-tuyen',
    // Chỉ chạy khi dựng bản phát hành. Cắm service worker vào dev server sẽ làm
    // rối vòng nạp module nóng của Vite.
    apply: 'build',

    configResolved(cauHinh) {
      thuMucRa = cauHinh.build.outDir
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace('</head>', `${THE_HEAD}  </head>`)
      },
    },

    closeBundle() {
      const goc = resolve(thuMucRa)
      const icon = taoBoIcon()

      for (const tep of icon) writeFileSync(join(goc, tep.ten), tep.noiDung)
      writeFileSync(join(goc, 'manifest.webmanifest'), JSON.stringify(MANIFEST, null, 2))

      // Sắp xếp tên tệp trong assets/ để danh sách tất định — thứ tự đọc thư mục
      // không phải thứ tự đảm bảo, mà tên cache lại suy từ chính danh sách này.
      const danhSachTep = [
        './index.html',
        './manifest.webmanifest',
        ...icon.map((t) => `./${t.ten}`),
        ...readdirSync(join(goc, 'assets'))
          .sort()
          .map((t) => `./assets/${t}`),
      ]

      writeFileSync(join(goc, 'service-worker.js'), dungServiceWorker(danhSachTep))
    },
  }
}
```

- [ ] **Step 2: Cắm plugin vào `vite.config.ts`**

Thay toàn bộ nội dung tệp bằng:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ngoaiTuyen } from './scripts/plugin-ngoai-tuyen'

export default defineConfig({
  plugins: [react(), ngoaiTuyen()],
  base: './',
})
```

- [ ] **Step 3: Dựng bản phát hành**

Run: `npm run build`
Expected: dựng xong, không lỗi.

- [ ] **Step 4: Kiểm tra thư mục `dist/` có đủ tệp**

Run: `ls dist`
Expected: có đủ `index.html`, `service-worker.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `icon-180.png`, và thư mục `assets`.

- [ ] **Step 5: Kiểm tra service worker liệt kê đúng tệp thật**

Run: `head -c 600 dist/service-worker.js`

Expected: dòng `const DANH_SACH_TEP = [...]` phải chứa **cả tệp `.js` lẫn tệp `.css`** trong `assets/`, và `const TEN_CACHE = 'dong-tien-...'` không còn dấu gạch dưới nào.

Đối chiếu với thư mục thật để chắc chắn không sót tệp nào:

```bash
ls dist/assets
```

Mọi tên trong `dist/assets` đều phải có mặt trong `DANH_SACH_TEP`. Thiếu một tệp là mất đúng tệp đó lúc offline — dừng lại và báo, đừng đi tiếp.

- [ ] **Step 6: Kiểm tra `index.html` đã có thẻ manifest**

Run: `cat dist/index.html`
Expected: trong `<head>` có `<link rel="manifest" href="./manifest.webmanifest" />` và `<link rel="apple-touch-icon" href="./icon-180.png" />`.

- [ ] **Step 7: Dựng lại lần nữa, kiểm tra tên cache không đổi**

```bash
node -e "console.log(require('fs').readFileSync('dist/service-worker.js','utf8').match(/TEN_CACHE = '(.+)'/)[1])"
npm run build
node -e "console.log(require('fs').readFileSync('dist/service-worker.js','utf8').match(/TEN_CACHE = '(.+)'/)[1])"
```

Expected: hai lần in ra **cùng một chuỗi**. Khác nhau nghĩa là có chỗ dùng đồng hồ hoặc số ngẫu nhiên — phải tìm ra và bỏ, nếu không mỗi lần triển khai là một lần người chơi tải lại toàn bộ game.

- [ ] **Step 8: Chạy toàn bộ test**

Run: `npm test`
Expected: không bài nào đỏ.

- [ ] **Step 9: Commit**

```bash
git add scripts/plugin-ngoai-tuyen.ts vite.config.ts
git commit -m "ngoai tuyen: plugin Vite phat service worker, manifest va bieu tuong

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Gắn khối vào tab Sổ sách

**Files:**
- Modify: `src/ui/TabSoSach.tsx`

**Interfaces:**
- Consumes: `KhoiNgoaiTuyen` (xuất mặc định) từ `../ngoai-tuyen/KhoiNgoaiTuyen` (Task 4)
- Produces: không

- [ ] **Step 1: Thêm dòng import**

Mở `src/ui/TabSoSach.tsx`. Sau khối `import` cuối cùng ở đầu tệp, thêm:

```tsx
import KhoiNgoaiTuyen from '../ngoai-tuyen/KhoiNgoaiTuyen'
```

- [ ] **Step 2: Render khối ở cuối màn**

Tệp kết thúc bằng đúng bốn dòng này:

```tsx
      )}
    </>
  )
}
```

Chèn khối ngay trước `</>`:

```tsx
      )}

      <KhoiNgoaiTuyen />
    </>
  )
}
```

- [ ] **Step 3: Chạy bộ test giao diện sẵn có**

Run: `npm test -- src/ui/giao-dien.test.ts`
Expected: XANH. Bộ test này kết xuất tĩnh `TabSoSach`, nên nó sẽ chạy qua khối mới ở trạng thái khởi tạo `tat` — đây là lưới an toàn cho thấy khối không làm vỡ màn Sổ sách.

- [ ] **Step 4: Chạy toàn bộ test và biên dịch**

Run: `npm test` — Expected: không đỏ.
Run: `./node_modules/.bin/tsc -b --noEmit` — Expected: không lỗi.

- [ ] **Step 5: Commit**

```bash
git add src/ui/TabSoSach.tsx
git commit -m "ngoai tuyen: gan khoi vao cuoi tab So sach

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# ĐỢT 3

---

## Task 7: Kiểm chứng thật và viết lại README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: toàn bộ các task trước
- Produces: không

Đây là task duy nhất chứng minh tính năng thật sự chạy. Bốn bài test tự động ở trên chỉ nói được rằng từng mảnh đúng; chỉ bước này mới trả lời được câu hỏi "tắt mạng thì game có mở không".

- [ ] **Step 1: Dựng và chạy máy chủ xem trước**

```bash
npm run build
npm run preview
```

Mở `http://localhost:4173`.

- [ ] **Step 2: Bật công tắc**

Bắt đầu một ván bất kỳ → sang tab **📒 Sổ sách** → kéo xuống cuối.

Expected: thấy khối `📴 Chơi khi không có mạng` với nút `📥 Tải về máy`.

Bấm nút. Expected: đổi sang `✅ Đã sẵn sàng`.

- [ ] **Step 3: Kiểm tra service worker và cache trong DevTools**

Mở DevTools ▸ Application:
- **Service Workers**: có một mục, trạng thái `activated and is running`.
- **Cache Storage**: có một kho tên `dong-tien-...`, bên trong đủ `index.html`, `manifest.webmanifest`, bốn tệp icon, và cả hai tệp trong `assets/`.

- [ ] **Step 4: Bài kiểm tra quan trọng nhất — tắt mạng**

DevTools ▸ Network ▸ đổi `No throttling` thành **Offline** ▸ tải lại trang (F5).

Expected:
- Trang mở được, không phải màn hình khủng long.
- **Ván đang chơi còn nguyên** — đúng năm, đúng tuổi, đúng tài sản.
- Chuyển qua lại đủ bốn tab, không tab nào vỡ.

Ghi lại kết quả thật vào phần tổng kết. Nếu trang không mở được, mở tab Console xem lỗi rồi dừng lại báo — **không** vặn test cho xanh.

- [ ] **Step 5: Kiểm tra tắt công tắc dọn sạch**

Bật mạng lại ▸ tải lại trang ▸ tab Sổ sách ▸ bấm `🗑️ Xoá khỏi máy`.

Expected: khối trở về `📴 Chơi khi không có mạng`. DevTools ▸ Application ▸ Service Workers **rỗng**, Cache Storage **không còn** kho `dong-tien-...`.

- [ ] **Step 6: Kiểm tra có mạng vẫn chạy bản hiện tại**

Bật lại công tắc và chờ `✅`. Rồi đổi một chuỗi nhìn thấy được ngay trên màn hình, dựng lại, và tải lại trang — nếu vẫn kẹt ở bản cũ thì chiến lược mạng-trước đã hỏng.

```bash
sed -i 's/          Ván mới/          Ván mới!!/' src/App.tsx
npm run build
```

Tải lại trang ở `localhost:4173` (mạng đang bật).

Expected: nút ở góc phải đầu trang hiện `Ván mới!!` ngay lần tải đầu tiên, không cần bấm gì thêm.

Hoàn tác thay đổi thử nghiệm:

```bash
git checkout src/App.tsx
npm run build
```

- [ ] **Step 7: Sửa câu sai trong README**

`README.md:302` hiện ghi:

```
npm run build      # build ra thư mục dist/, mở bằng file:// cũng chạy
```

Câu này **sai**. `dist/index.html` nạp `<script type="module" crossorigin>`, mà trình duyệt chặn ES module qua `file://` vì chính sách CORS — mở ra là trang trắng. Service worker cũng không chạy trên `file://`. Sửa thành:

```
npm run build      # build ra thư mục dist/
npm run preview    # phục vụ dist/ ở http://localhost:4173 — cách duy nhất thử được
                   # chế độ chơi khi không có mạng
```

- [ ] **Step 8: Thêm mục "Chơi khi không có mạng" vào README**

Chèn ngay sau mục `## Chạy`:

```markdown
## Chơi khi không có mạng

Game chạy hoàn toàn trong trình duyệt — không máy chủ, không lời gọi mạng nào, ván
lưu ở `localStorage`. Thứ duy nhất cần mạng là khâu tải trang về máy, và có một công
tắc ở cuối tab **📒 Sổ sách** để bịt nốt chỗ đó.

Bật công tắc, game tải khoảng 330 KB về máy. Từ đó mở được cả ở chế độ máy bay, và
nếu đã thêm vào màn hình chính điện thoại thì mở từ biểu tượng cũng chạy.

**Có mạng vẫn luôn là bản mới nhất.** Service worker chạy theo lối mạng-trước: mỗi
lần tải trang nó hỏi mạng trước đã, chỉ khi mạng hỏng mới lấy bản trong máy ra. Không
có chuyện kẹt lại ở một bản cũ, nên cũng không cần nút "cập nhật" nào.

Tắt công tắc thì service worker bị gỡ và toàn bộ cache bị xoá.

Thử ở máy mình:

```bash
npm run build && npm run preview
```

Mở `localhost:4173` → bắt đầu một ván → tab 📒 Sổ sách → bật công tắc → chờ ✅ →
DevTools ▸ Network ▸ **Offline** → tải lại trang. Game phải mở được và ván phải còn
nguyên.
```

- [ ] **Step 9: Chạy toàn bộ test lần cuối**

Run: `npm test` — Expected: không đỏ.
Run: `./node_modules/.bin/tsc -b --noEmit` — Expected: không lỗi.
Run: `npm run build` — Expected: dựng xong sạch.

Run: `git status --short` — Expected: chỉ còn `README.md`; `dist/` bị `.gitignore` bỏ qua (kiểm tra lại nếu thấy nó hiện ra).

- [ ] **Step 10: Commit**

```bash
git add README.md
git commit -m "ngoai tuyen: sua cau sai ve file:// va them muc huong dan

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Gộp vào main và thử trên điện thoại

**Files:** không sửa tệp nào.

Thử trên điện thoại bắt buộc phải có địa chỉ HTTPS thật — service worker không chạy qua IP nội bộ dạng `http://192.168.x.x`. Nên phải gộp vào `main` để GitHub Pages dựng bản mới, giống hệt cách bản v1.7 đã làm.

- [ ] **Step 1: Đối chiếu lại toàn bộ trước khi gộp**

Run: `npm test` — Expected: không đỏ.
Run: `git log --oneline main..choi-ngoai-tuyen` — Expected: 8 commit, mỗi task một commit.

- [ ] **Step 2: Gộp**

```bash
git checkout main
git merge --no-ff choi-ngoai-tuyen -m "gop nhanh choi ngoai tuyen

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 3: Chờ GitHub Actions dựng xong**

```bash
gh run watch
```

Expected: cả hai việc `Kiểm thử và build` và `Triển khai` đều xanh.

- [ ] **Step 4: Thử trên điện thoại**

Trên điện thoại, mở địa chỉ GitHub Pages của dự án:

1. Bắt đầu một ván → tab 📒 Sổ sách → bật công tắc → chờ `✅`.
2. Thêm vào màn hình chính (Android: menu ⋮ ▸ *Thêm vào Màn hình chính*; iPhone: nút Chia sẻ ▸ *Thêm vào MH chính*).
3. Kiểm tra biểu tượng trên màn hình chính là hình ba cột xanh trên nền tối, không phải ô trắng hay ảnh chụp trang.
4. **Bật chế độ máy bay.**
5. Mở app từ biểu tượng.

Expected: game mở được, ván còn nguyên, chơi tiếp được bình thường.

- [ ] **Step 5: Ghi kết quả thật**

Ghi vào cuối `docs/superpowers/plans/2026-08-12-choi-ngoai-tuyen.md` một mục **Kết quả kiểm chứng** với: máy nào, trình duyệt nào, biểu tượng ra sao, chế độ máy bay mở được hay không. Ghi cả thứ không đạt — đó là thông tin có giá, không phải điều cần giấu.

- [ ] **Step 6: Commit và dọn nhánh**

```bash
git add docs/superpowers/plans/2026-08-12-choi-ngoai-tuyen.md
git commit -m "ngoai tuyen: ghi ket qua kiem chung tren dien thoai

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push origin main
git branch -d choi-ngoai-tuyen
```

---

## Tổng kết số bài test dự kiến

| Nguồn | Số bài |
|---|---|
| Nền hiện tại | 305 |
| Task 1 — biểu tượng | 10 |
| Task 2 — service worker | 9 |
| Task 3 — đăng ký | 15 |
| Task 4 — giao diện | 7 |
| **Tổng** | **346** |

Nếu con số cuối cùng khác 346, đếm lại xem task nào thiếu bài — đừng chỉnh bảng này cho khớp.

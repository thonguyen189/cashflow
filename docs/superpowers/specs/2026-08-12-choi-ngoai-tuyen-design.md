# Thiết kế — Chơi khi không có mạng (tuỳ chọn)

Ngày chốt: 12/08/2026.

Game đã chạy hoàn toàn phía trình duyệt từ đầu: không một lời gọi mạng nào trong
`src/`, không font tải từ nơi khác, ván lưu ở `localStorage`. Thứ duy nhất cần mạng
là **khâu đưa trang về máy người chơi**. Bản này bịt đúng chỗ đó, và bịt bằng một
công tắc người chơi tự bật chứ không áp đặt.

## Hai điều kiện phải thoả cùng lúc

1. **Có mạng thì luôn chơi bản hiện tại.** Không được để người chơi kẹt ở một bản
   cũ đã lưu trong máy.
2. **Mất mạng thì vẫn mở được**, kể cả ở chế độ máy bay, kể cả khi đã cài ra màn
   hình chính điện thoại.

Hai điều này quyết định toàn bộ kiến trúc: chiến lược cache phải là **mạng trước,
cache đỡ sau** — chứ không phải lối cache-trước quen thuộc của phần lớn hướng dẫn
làm PWA.

## Vì sao không dùng `vite-plugin-pwa`

Đã cân nhắc. Workbox là dao mổ trâu ở đây: bề mặt cần cache đúng ba file tĩnh, một
trang, không định tuyến, không API, không ảnh. Phần cấu hình của thư viện dài hơn cả
phần logic viết tay. Dự án hiện chỉ có **react + react-dom** ở runtime và mọi thứ
khác đều tự viết — thêm vài chục MB `node_modules` cho việc này là sai tỉ lệ.

Cũng đã loại phương án "không service worker, dựa vào cache HTTP của trình duyệt":
trình duyệt được quyền xoá cache đó bất cứ lúc nào, mở lại lúc máy bay có thể ra
trang trắng. Không đảm bảo được điều kiện 2.

---

## A. Kiến trúc — ba lớp tách rời

| Lớp | Chạy lúc nào | Việc của nó | Biết gì về game |
|---|---|---|---|
| `scripts/tao-icon.ts` | build | Vẽ và mã hoá bốn tệp PNG | không |
| `scripts/dung-service-worker.ts` | build | Danh sách tệp → nội dung service worker | không |
| `scripts/plugin-ngoai-tuyen.ts` | build | Gọi hai lớp trên, phát tệp ra `dist/`, chèn thẻ vào `index.html` | không |
| `src/ngoai-tuyen/dang-ky.ts` | trong trang | Đăng ký / gỡ / đo trạng thái | không |
| `src/ngoai-tuyen/KhoiNgoaiTuyen.tsx` | trong trang | Công tắc và chữ hiển thị | chỉ lớp CSS |
| `service-worker.js` | nền, ngoài trang | Chặn yêu cầu mạng | không |

Mỗi lớp có một cửa hẹp và test được riêng. Không lớp nào cần đọc `engine.ts`,
`config.ts` hay `types.ts`.

---

## B. Chiến lược cache — điểm cốt lõi

```
Chỉ can thiệp yêu cầu GET cùng nguồn. Còn lại để trình duyệt tự lo.

┌ Tải trang (request.mode === 'navigate') ───────────────────┐
│  Hỏi mạng trước.                                            │
│    Được (traLoi.ok)  → trả về, đồng thời ghi đè index.html   │
│                        trong cache                          │
│    Hỏng (ném lỗi)    → lấy index.html trong cache            │
└─────────────────────────────────────────────────────────────┘
┌ Tệp assets/ (tên đã băm nội dung) ─────────────────────────┐
│  Có trong cache → trả ngay, khỏi hỏi mạng                   │
│  Không có       → tải mạng → lưu vào cache → trả về         │
└─────────────────────────────────────────────────────────────┘
```

**Vì sao cách này thoả cả hai điều kiện:**

- *Có mạng = bản hiện tại*: `index.html` luôn hỏi mạng trước. Bản mới trỏ tới tên
  tệp băm mới, đám tệp đó chưa có trong cache nên tự được tải về. Người chơi nhận
  bản mới ngay lần tải trang, không cần bấm gì.
- *Mất mạng = mở được*: `index.html` cũ trong cache trỏ tới đám tệp cũ, và đám tệp
  cũ vẫn còn nguyên trong cache.

**Cache dọn ở đâu:** ở bước `activate` của service worker đời mới — giữ đúng danh
sách tệp của bản mới, xoá mọi cache mang tên khác. Mỗi lần triển khai sinh ra
`service-worker.js` khác byte nên trình duyệt tự phát hiện và cài bản mới. Không có
thao tác thủ công nào.

**Vì sao gọi `skipWaiting()` được mà không sợ cướp ván:** `skipWaiting()` không tải
lại trang. Trang đang mở đã nạp xong toàn bộ mã (bundle một tệp, không có chunk tải
trễ) nên nó không cần hỏi thêm tệp nào nữa — service worker đời mới lên thay và dọn
cache cũ hoàn toàn vô hại với ván đang chơi.

**Một chỗ chấp nhận chưa hoàn hảo:** tên cache suy từ mã băm của danh sách tệp. Nếu
`index.html` đổi nội dung mà đám tệp `assets/` không đổi (ví dụ chỉ sửa một thẻ
meta), tên cache không đổi và bản `index.html` cũ còn nằm lại trong cache. Hệ quả chỉ
hiện ra khi offline, và lần vào mạng kế tiếp là bị ghi đè. Không đáng đổi lấy một cơ
chế phức tạp hơn.

### Không làm dải thông báo "có bản mới"

Đã cân nhắc rồi bỏ. Dải thông báo đó sinh ra để chữa bệnh kẹt-ở-bản-cũ của lối
cache-trước. Lối mạng-trước không có bệnh đó, nên thêm nó chỉ là thêm một thành phần
giao diện thừa và một nguy cơ cướp ván giữa chừng.

---

## C. Công tắc và trạng thái

### Nơi lưu lựa chọn

Khoá `dong-tien-ngoai-tuyen` trong `localStorage`, **tách khỏi khoá ván**
`CONFIG.luuKey`. Bắt buộc phải tách: `luuKey` đổi theo từng phiên bản game
(`config.ts:876`), nhét chung thì lên v1.8 người chơi mất luôn lựa chọn đã bật.

### Sáu trạng thái, chữ hiển thị cho từng trạng thái

| Mã trạng thái | Người chơi thấy |
|---|---|
| `tat` | `📴 Chơi khi không có mạng` · *Tải game về máy (khoảng 330 KB) để vào được cả khi máy bay hoặc mất sóng.* |
| `dang-tai` | `📥 Đang tải về máy…` |
| `san-sang` | `✅ Đã sẵn sàng — chơi được cả khi không có mạng` |
| `loi` | `⚠️ Cần có mạng để tải game về máy. Thử lại khi có sóng nhé.` |
| `khong-ho-tro` | `ℹ️ Trình duyệt này không hỗ trợ chơi khi không có mạng` |
| `chi-ban-phat-hanh` | `ℹ️ Chỉ hoạt động ở bản phát hành, không chạy khi đang phát triển` |

Trạng thái suy từ thực tế trình duyệt (`getRegistration()`), không suy từ cờ đã lưu —
người chơi xoá dữ liệu trang mà công tắc vẫn báo "đã sẵn sàng" là nói dối.

Hai trạng thái cuối là ca thật chứ không phải phòng xa: Safari ở cửa sổ riêng tư
chặn service worker, và bật service worker trên dev server của Vite sẽ làm rối vòng
nạp module.

### Chỗ đặt

Một khối ở **cuối tab 📒 Sổ sách**. Khối là component riêng, `TabSoSach.tsx` chỉ thêm
một dòng `import` và một dòng render — tệp đó đã 469 dòng, không nên phình thêm.

Đánh đổi đã biết và chấp nhận: người chơi phải bắt đầu một ván mới thấy tab Sổ sách,
ai vừa mở lần đầu ở màn chọn nghề sẽ không thấy công tắc.

### Không cần đăng ký lại mỗi lần mở

Một khi đã đăng ký, service worker nằm lại trong trình duyệt và tự được kiểm tra cập
nhật ở mỗi lần điều hướng — đúng theo chuẩn. Nên **không** cần gọi đăng ký lúc khởi
động ứng dụng, và `main.tsx` không phải sửa gì.

---

## D. Giao diện — hai thành phần trong một tệp

`src/ngoai-tuyen/KhoiNgoaiTuyen.tsx` xuất hai thứ:

- `NoiDungNgoaiTuyen({ trangThai, onBat, onTat })` — thuần, không effect, không state.
  Đây là thứ được test bằng `renderToStaticMarkup` cho đủ sáu trạng thái, theo đúng
  lối của `src/ui/giao-dien.test.ts`.
- `KhoiNgoaiTuyen` (xuất mặc định) — vỏ bọc giữ state và gọi `dang-ky.ts`.

Tách vậy vì effect không chạy khi kết xuất tĩnh; gộp một cục thì chỉ test được đúng
trạng thái khởi tạo.

---

## E. Hợp đồng giữa các tệp

Chốt trước để nhiều người làm song song mà không lệch nhau.

```ts
// scripts/tao-icon.ts
export type TepIcon = { ten: string; noiDung: Uint8Array }

/** Bốn tệp: icon-192.png, icon-512.png, icon-512-maskable.png, icon-180.png */
export function taoBoIcon(): TepIcon[]
```

```ts
// scripts/dung-service-worker.ts
/** Tên cache tất định, suy từ mã băm của danh sách tệp đã sắp xếp. */
export function tenCacheTu(danhSachTep: string[]): string

/** Đọc khuôn, thay __TEN_CACHE__ và __DANH_SACH_TEP__, trả về nội dung hoàn chỉnh. */
export function dungServiceWorker(danhSachTep: string[]): string
```

```ts
// src/ngoai-tuyen/dang-ky.ts
export type TrangThaiNgoaiTuyen =
  | 'khong-ho-tro'
  | 'chi-ban-phat-hanh'
  | 'tat'
  | 'dang-tai'
  | 'san-sang'
  | 'loi'

export function docLuaChon(): boolean
export function ghiLuaChon(bat: boolean): void

/** Đo trạng thái thật lúc khối được gắn lên màn hình. */
export function trangThaiHienTai(): Promise<TrangThaiNgoaiTuyen>

/** Đăng ký và chờ tải xong. Hỏng thì trả 'loi' và KHÔNG ghi lựa chọn. */
export function batNgoaiTuyen(): Promise<TrangThaiNgoaiTuyen>

/** Gỡ đăng ký, xoá mọi cache tên bắt đầu bằng 'dong-tien-', ghi lựa chọn false. */
export function tatNgoaiTuyen(): Promise<void>
```

---

## F. Khuôn service worker

`scripts/khuon-service-worker.js` — tệp JavaScript thường, **không** đi qua bundler,
plugin chỉ thay hai chỗ đánh dấu.

```js
const TEN_CACHE = '__TEN_CACHE__'
const DANH_SACH_TEP = __DANH_SACH_TEP__
const TRANG_CHU = new URL('./index.html', self.location.href).href
```

- `install` → mở cache, `addAll(DANH_SACH_TEP)`, rồi `skipWaiting()`.
  Danh sách gồm `./index.html`, đám `assets/*`, `manifest.webmanifest` và bốn tệp
  icon. **Không** gồm chính `service-worker.js`.
- `activate` → xoá mọi cache tên khác `TEN_CACHE`, rồi `clients.claim()`.
- `fetch` → bỏ qua nếu `method !== 'GET'` hoặc khác nguồn. `mode === 'navigate'` thì
  mạng-trước, còn lại cache-trước.
- Chỉ ghi vào cache khi `traLoi.ok && traLoi.status === 200` — nếu không, một trang
  404 của GitHub Pages sẽ được lưu lại và thay thế game khi offline.

---

## G. Biểu tượng — tự vẽ, không thêm phụ thuộc

`scripts/tao-icon.ts` gồm hai phần thuần:

**Bộ mã hoá PNG tối giản** (~50 dòng): chữ ký 8 byte, khối IHDR (RGBA 8 bit, không
xen dòng), khối IDAT là `zlib.deflateSync` của các dòng quét mỗi dòng thêm một byte
lọc `0`, khối IEND. CRC32 tính trên `kiểu + dữ liệu`. Chỉ dùng `node:zlib` — sẵn có
trong Node, không phải phụ thuộc mới.

**Phần vẽ:** vẽ ở 4× rồi thu nhỏ trung bình để khử răng cưa.

- Nền: chuyển sắc chéo `#232733` → `#14161c`, bo góc 22% cạnh.
- Hình: ba cột tăng dần màu `#3fbf8f`, cột cao nhất đội một đồng xu tròn `#f5c451`.

Bốn tệp xuất ra:

| Tệp | Kích thước | Khác biệt |
|---|---|---|
| `icon-192.png` | 192 | bo góc, ngoài góc bo là trong suốt |
| `icon-512.png` | 512 | như trên |
| `icon-512-maskable.png` | 512 | nền tràn kín viền, hình thu về 60% chính giữa |
| `icon-180.png` | 180 | nền tràn kín, **không** bo góc, **không** trong suốt — iOS tự bo |

Màu lấy từ biến CSS sẵn có trong `src/styles.css` (`--nen`, `--the`, `--xanh`,
`--vang`) để icon không chỏi với game.

---

## H. Manifest và thẻ trong `index.html`

Plugin chèn bằng `transformIndexHtml` và chỉ chạy ở `apply: 'build'`. Tệp
`index.html` gốc **không sửa** — nhờ vậy dev server không kêu thiếu tệp, và thẻ luôn
khớp với tên tệp vừa sinh.

```json
{
  "name": "Dòng Tiền",
  "short_name": "Dòng Tiền",
  "description": "Game mô phỏng tài chính cá nhân — mỗi lượt là một năm.",
  "lang": "vi",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#14161c",
  "theme_color": "#14161c",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "./icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Thẻ chèn vào `<head>`:

```html
<meta name="theme-color" content="#14161c" />
<link rel="manifest" href="./manifest.webmanifest" />
<link rel="apple-touch-icon" href="./icon-180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Dòng Tiền" />
```

`start_url` và `scope` để `./` cho khớp `base: './'` trong `vite.config.ts` — game
chạy ở đường dẫn con `/CashFlow/` trên GitHub Pages, đường dẫn tuyệt đối sẽ hỏng.

---

## I. Kiểm thử

Môi trường test của dự án là `node`, không có jsdom. Ba nhóm dưới đây chạy được
nguyên vẹn trong môi trường đó.

**`scripts/tao-icon.test.ts`**
- Chữ ký PNG tám byte đúng.
- IHDR khai đúng chiều rộng và chiều cao cho cả bốn tệp.
- Giải nén IDAT ra đúng `chiều cao × (chiều rộng × 4 + 1)` byte.
- Điểm ảnh giữa tệp không trong suốt.
- Bốn góc của bản `maskable` đục; bốn góc của `icon-192` trong suốt.

**`scripts/dung-service-worker.test.ts`**
- Không còn chuỗi `__` nào sót lại trong kết quả.
- Danh sách tệp lọt vào kết quả đúng và đủ.
- Danh sách đổi thì tên cache đổi.
- Danh sách y hệt thì tên cache y hệt — tất định, không dùng đồng hồ hay số ngẫu nhiên.

**`src/ngoai-tuyen/dang-ky.test.ts`** — giả lập bằng `vi.stubGlobal` cho `navigator`,
`caches`, `localStorage`; giả lập `import.meta.env.PROD` bằng `vi.stubEnv`.
- Không có `serviceWorker` → `khong-ho-tro`.
- `PROD` sai → `chi-ban-phat-hanh`.
- Bật thành công → gọi `register` đúng một lần, trả `san-sang`, ghi lựa chọn `true`.
- `register` ném lỗi → trả `loi` và **không** ghi lựa chọn.
- Tắt → gọi `unregister`, xoá đúng những cache tên bắt đầu `dong-tien-`, ghi lựa chọn `false`.

**`src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts`**
- `renderToStaticMarkup` cho đủ sáu trạng thái: không ném lỗi, không rò `NaN` hay
  `undefined`, mỗi trạng thái có đúng chữ và icon của nó.

**Phải thử tay, ghi thành mục trong README:**
1. `npm run build && npm run preview` → mở `localhost:4173` → bắt đầu một ván → tab
   Sổ sách → bật công tắc → chờ `✅` → DevTools ▸ Network ▸ Offline → tải lại trang →
   vào được game, ván cũ còn nguyên.
2. Tắt công tắc → DevTools ▸ Application ▸ Service Workers rỗng, Cache Storage rỗng.
3. Trên điện thoại: mở địa chỉ Pages → bật công tắc → thêm vào màn hình chính → bật
   chế độ máy bay → mở app từ biểu tượng.

---

## J. Tệp đụng tới

**Mới**

| Tệp | Vai trò |
|---|---|
| `scripts/tao-icon.ts` | bộ mã hoá PNG + phần vẽ |
| `scripts/tao-icon.test.ts` | |
| `scripts/khuon-service-worker.js` | khuôn service worker |
| `scripts/dung-service-worker.ts` | đúc khuôn thành nội dung thật |
| `scripts/dung-service-worker.test.ts` | |
| `scripts/plugin-ngoai-tuyen.ts` | plugin Vite nối mọi thứ |
| `src/ngoai-tuyen/dang-ky.ts` | đăng ký / gỡ / đo trạng thái |
| `src/ngoai-tuyen/dang-ky.test.ts` | |
| `src/ngoai-tuyen/KhoiNgoaiTuyen.tsx` | khối giao diện |
| `src/ngoai-tuyen/giao-dien-ngoai-tuyen.test.ts` | |

**Sửa**

| Tệp | Sửa gì |
|---|---|
| `vite.config.ts` | cắm plugin |
| `src/ui/TabSoSach.tsx` | thêm một dòng import, một dòng render |
| `src/styles.css` | thêm lớp cho khối, đặt ở cuối tệp |
| `README.md` | sửa câu sai về `file://`, thêm mục "Chơi khi không có mạng" |

**Một lỗi tài liệu sửa luôn trong bản này:** `README.md:302` ghi *"build ra thư mục
dist/, mở bằng file:// cũng chạy"*. Câu này sai — `dist/index.html` nạp
`<script type="module" crossorigin>`, mà trình duyệt chặn ES module qua `file://` vì
chính sách CORS, mở ra là trang trắng. Service worker cũng không chạy trên `file://`.
Phải sửa thành hướng dẫn `npm run preview`.

---

## K. Ngoài phạm vi

- **Nút "Cài app" tự làm** — trình duyệt đã có sẵn menu Thêm vào màn hình chính.
- **Dải thông báo "có bản mới"** — lối mạng-trước không cần, lý do ở mục B.
- **Trang "bạn đang ngoại tuyến"** — game vốn không cần mạng nên không có trạng thái đó.
- **Đóng gói `.exe` / `.apk`** — việc khác, chuỗi công cụ khác.
- **Đồng bộ ván chơi giữa các máy** — không liên quan, và sẽ cần máy chủ.

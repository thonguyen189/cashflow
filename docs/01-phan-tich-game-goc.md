# Phân tích game gốc — "Cashflow" (com.money.rash)

> Tài liệu này ghi lại kết quả khảo sát thực nghiệm app đang cài trên máy ảo LDPlayer,
> phục vụ việc tự xây một game tương tự để cá nhân chơi.
>
> **Ngày khảo sát:** 2026-08-05
> **Phương pháp:** điều khiển app qua ADB (`uiautomator dump` + `input tap/swipe` + `screencap`),
> chơi thật 2 ván (nghề Giáo viên 4 năm, nghề Bác sĩ 1 năm), đọc toàn bộ 14 trang hướng dẫn trong app.

---

## 0. Trạng thái nguồn dữ liệu

| Mức tin cậy | Ý nghĩa |
|---|---|
| ✅ **Đã xác minh** | Quan sát trực tiếp, có số liệu khớp phép tính |
| 🟡 **Suy luận** | Suy ra từ dữ liệu quan sát, chưa kiểm chứng độc lập |
| ❓ **Chưa rõ** | Chưa khảo sát được, cần làm thêm |

---

## 1. Thông tin kỹ thuật app gốc

| Mục | Giá trị |
|---|---|
| Package | `com.money.rash` |
| Activity | `com.money.rash.MainActivity` |
| Tên hiển thị | Cashflow |
| Phiên bản | 1.8.1 (versionCode 256) |
| minSdk / targetSdk | 24 / 36 |
| Đóng gói | Android App Bundle — `base.apk` + `split_config.en` / `hdpi` / `x86_64` |
| Công nghệ | ✅ **Flutter** — xác nhận qua `assets/flutter_assets/` trong APK |
| Ngôn ngữ | Đa ngôn ngữ, có sẵn tiếng Việt |
| Dịch vụ tích hợp | Firebase, Google Play Billing, Play in-app Review, Ads Identifier |

**Về việc đọc số liệu gốc:** toàn bộ logic Dart được biên dịch AOT vào `libapp.so`,
`flutter_assets` **chỉ chứa ảnh và font**, không có file JSON cấu hình.
→ Không có đường tắt để lấy chính xác bảng số; **phải quan sát qua UI** như tài liệu này đã làm.

**Ghi chú quan trọng:** đây **KHÔNG** phải board game CASHFLOW 101 của Robert Kiyosaki.
Không có bàn cờ, không có xúc xắc, không có Rat Race / Fast Track. Đây là một
**game mô phỏng tài chính theo lượt-năm**, cơ chế hoàn toàn khác.

---

## 1b. ⚠️ GIỚI HẠN QUAN TRỌNG: bản miễn phí chỉ chơi được 6 năm

✅ **Đã xác minh 2 lần.** Khi bấm "Kết thúc năm" ở **năm 6**, app bung paywall
và **chặn cứng** việc sang năm 7:

> **"Truy cập vào tất cả các cấp độ CashFlow"**
> — ₫50,000 Đăng ký hàng tháng
> — ₫150,000 Quyền truy cập trọn đời

Đóng bằng nút ✕ thì quay về menu, tiếp tục ván thì vẫn đứng nguyên ở năm 6.

**Hệ quả cho việc phân tích:**
- Mục tiêu $1,000,000 **không thể đạt trong 6 năm** với bất kỳ nghề nào
  → bản miễn phí thực chất là **bản demo**, không phải game mất cân bằng
  *(điều chỉnh lại nhận định ở mục 6 bên dưới)*
- Không thể quan sát được nếu không trả tiền: **màn hình thắng**, sự kiện
  **Ngân hàng Trung ương**, cơ chế tài sản giai đoạn sau, bảo hiểm mở rộng
- Từ "các cấp độ" (levels) gợi ý game có **nhiều màn/kịch bản** — chưa rõ cấu trúc

---

## 2. Mục tiêu và điều kiện thắng/thua

### Mục tiêu (✅ trích nguyên văn từ app)
> "Tích lũy vốn trên một triệu, duy trì mức độ hạnh phúc ở mức 50 trở lên."

| Điều kiện | Giá trị |
|---|---|
| **Thắng** | Tổng tài sản ≥ $1,000,000 |
| **Thua** | Hạnh phúc < 50 tại thời điểm bấm "Kết thúc năm" |

**Cơ chế thua (✅ đã xác minh bằng thực nghiệm):**
Game **không chặn** nút "Kết thúc năm" khi HP < 50. Bạn vẫn bấm được, màn hình
tổng kết vẫn hiện, rồi mới bung màn hình "Trò chơi kết thúc — Mức độ hạnh phúc
giảm xuống dưới 50."

Quan trọng: HP **được phép tụt dưới 50 giữa năm**. Bằng chứng: cuối năm 3 HP = 52
(hợp lệ) → phạt khát vọng −5 → đầu năm 4 HP = 47 (dưới ngưỡng nhưng game vẫn chạy)
→ trong năm phải kéo lên ≥ 50 trước khi kết thúc.

Thanh tiến độ hiển thị dạng `$4,100 / $1,000,000` = **tiền mặt + giá trị đầu tư**.

---

## 3. Vòng lặp một lượt chơi (1 lượt = 1 năm)

```
┌─ ĐẦU NĂM (tự động) ────────────────────────────────────┐
│  tiền mặt += lương + cổ tức + thu nhập thụ động        │
│  giá trị đầu tư *= (1 + % biến động từng loại)          │
│  HP -= phạt khát vọng chưa đạt                          │
│  mọi giá (chi phí, thẻ, giáo dục, bảo hiểm) *= (1+lạm phát) │
└────────────────────────────────────────────────────────┘
                        ↓
┌─ BƯỚC BẮT BUỘC ────────────────────────────────────────┐
│  Thanh toán "Chi phí hàng năm"  → tiền mặt -= chi phí   │
└────────────────────────────────────────────────────────┘
                        ↓
┌─ CHUỖI THẺ TIÊU DÙNG (4–5 thẻ/năm) ────────────────────┐
│  mỗi thẻ: tên + giá $X + điểm N                         │
│    Nhận (+) → tiền -= X, HP += N                        │
│    Từ chối (✗) → HP -= N        ← ĐÒN ĐAU               │
└────────────────────────────────────────────────────────┘
                        ↓
┌─ HÀNH ĐỘNG TỰ DO (làm bất cứ lúc nào trong năm) ───────┐
│  • Đầu tư / bán 5 loại tài sản                          │
│  • Mua giáo dục (tăng lương vĩnh viễn)                  │
│  • Mua bảo hiểm (hiệu lực 1 năm)                        │
│  • Mua món ước nguyện (HP thụ động hàng năm)            │
│  • Vay ngân hàng                                        │
│  • Nhận/bỏ cơ hội kinh doanh (tab Việc kinh doanh)      │
└────────────────────────────────────────────────────────┘
                        ↓
┌─ KẾT THÚC NĂM ─────────────────────────────────────────┐
│  nếu HP < 50 → THUA                                     │
│  ngược lại → màn "Tóm tắt hàng năm" → năm tiếp theo     │
└────────────────────────────────────────────────────────┘
```

---

## 4. Mô hình trạng thái người chơi

```
{
  nam: int,                     // bắt đầu từ 1
  tienMat: number,
  giaTriDauTu: { coPhieu, traiPhieu, tienDienTu, batDongSan, vang },
  hanhPhuc: number,             // bắt đầu 70, thua nếu <50 khi kết thúc năm
  luong: number,                // tăng theo giáo dục + tăng tự nhiên hàng năm
  chiPhiHangNam: number,        // nhân theo lạm phát mỗi năm
  chiSoLamPhatTichLuy: number,  // dùng để scale MỌI giá
  ngheNghiep: 'lapTrinhVien' | 'giaoVien' | 'bacSi',
  khatVong: { item, daDat: bool },
  baoHiem: { conHieuLuc: bool },  // hết hạn sau 1 năm
  giaoDucDaMua: string[],
  khoanVay: [{ goc, kyHan, thanhToanHangNam, soNamConLai }],
  kinhDoanh: [{ ten, thuNhapHangNam }]
}
```

Ba chỉ số hiển thị trên HUD: **Đầu tư** / **Tiền bạc** / **Niềm hạnh phúc**.

---

## 5. Các hệ thống con

### 5.1 Nghề nghiệp (3 nghề) ✅

Chọn 1 lần ở đầu ván, không đổi được.

| Nghề | Lương/năm | Chi phí năm 1 | Thặng dư | % giữ lại | HP đầu | Bảo hiểm/năm | Xe hơi (giá) |
|---|---|---|---|---|---|---|---|
| Giáo viên | $7,000 | $2,500 | $4,500 | **64%** | 70 | $100 | $5,000 |
| Bác sĩ | $14,000 | $7,000 | $7,000 | 50% | 70 | $200 | $15,000 |
| Lập trình viên | $22,000 | $14,000 | $8,000 | **36%** | 70 | ❓ | ❓ |

Tiền mặt khởi đầu = đúng bằng 1 năm lương ở cả 3 nghề. ✅

**Đây là đánh đổi thiết kế tốt, không phải nghề nào cũng "mạnh hơn":**
lương càng cao thì thặng dư tuyệt đối càng lớn nhưng **tỉ lệ giữ lại càng thấp**
(64% → 50% → 36%). Vì mục tiêu $1,000,000 **giống nhau cho mọi nghề**,
Lập trình viên chạy nhanh hơn nhưng "rò rỉ" nhiều hơn, và món ước nguyện
cũng đắt hơn (Bác sĩ đắt gấp 3 lần Giáo viên) → phải chi nhiều hơn để giữ hạnh phúc. 🟡

### 5.2 Chi phí hàng năm ✅
Bắt buộc thanh toán trước khi kết thúc năm.
> "Bao gồm chi phí ăn uống, chỗ ở, đi lại và quần áo."

`chiPhi(nam N+1) = chiPhi(nam N) × (1 + lamPhat)`

Xác minh: $2,500 × 1.11 = **$2,775** ✅

### 5.3 Lạm phát ✅
Sự kiện xuất hiện gần như **mỗi năm** ở màn tổng kết.

Giá trị quan sát được: **4%, 7%, 9%, 10%, 11%** → khoảng ~3–12%. 🟡

Áp dụng lên **tất cả**: chi phí hàng năm, giá thẻ tiêu dùng, giáo dục, bảo hiểm.
Xác minh trên thẻ tiêu dùng: "Chuyến đi bằng xe máy" $100 (năm 1) → $111 (năm 2)
→ $133 (năm 4, tích luỹ 11%×10%×9%). ✅

> Theo hướng dẫn in-app: để chống lạm phát, Ngân hàng Trung ương tăng lãi suất cơ bản,
> khiến khoản vay đắt hơn và trái phiếu sinh lời hơn. ❓ *(chưa quan sát được sự kiện này)*

### 5.4 Hạnh phúc — hệ thống cốt lõi ✅

| Nguồn | Tác động |
|---|---|
| Khởi đầu | 70 |
| Nhận thẻ tiêu dùng | **+N** |
| Từ chối thẻ tiêu dùng | **−N** (đối xứng!) |
| Khát vọng chưa đạt | **−5/năm** |
| Món ước nguyện đã mua | **+5 / +10 / +15 mỗi năm** |
| Tai nạn/bệnh khi **không** có bảo hiểm | **−10** (kèm mất tiền) |
| Ngưỡng thua | < 50 khi kết thúc năm |
| Trần | ✅ **KHÔNG có trần** — đã quan sát HP đạt **150** |

**Đây là điểm thiết kế hay nhất của game.** Vì từ chối cũng mất đúng N điểm,
mỗi thẻ thực chất là câu hỏi: *"trả $X, hay chịu mất 2N điểm hạnh phúc so với việc nhận?"*
Biên độ swing giữa nhận và từ chối là **2N**.

Tỉ lệ $/điểm chênh nhau rất lớn giữa các thẻ → đây là quyết định thật, không phải bấm bừa:

| Thẻ (năm 1, Giáo viên) | Giá | Điểm | $/điểm |
|---|---|---|---|
| Chuyến đi xe máy đường đèo | $100 | 5 | **$20** |
| Chuyến tham quan xe đạp | $100 | 6 | **$17** |
| Tham gia chiến dịch trồng cây | $200 | 5 | $40 |
| Tham gia marathon | $250 | 5 | $50 |
| Tặng mẹ điện thoại mới | $300 | 5 | $60 |
| Tiệc du thuyền quanh đảo | $400 | 7 | $57 |
| Chuyên viên tư vấn thời trang | $400 | 3 | $133 |
| Thẻ phòng tập thể dục | $700 | 10 | $70 |
| Mua drone | $900 | 4 | $225 |
| Thám hiểm núi lửa | $999 | 6 | $167 |
| Rạp phim tại nhà | $1,221 | 6 | $204 |
| Phòng thí nghiệm tại nhà | $1,221 | 7 | $174 |
| Du thuyền trên biển | $1,221 | 9 | $136 |
| Nghỉ dưỡng bãi biển | $1,730 | 10 | $173 |

Số thẻ mỗi năm: **4–5**. 🟡

### 5.5 Khát vọng & Mua sắm ✅

Mỗi nghề được gán sẵn một "Khát vọng" (hiện ở màn chọn nghề). Chưa đạt thì **−5 HP/năm**.

Cửa hàng "Thực hiện ước nguyện" (giá của Bác sĩ):

| Món | Giá | Hiệu quả |
|---|---|---|
| Xe hơi | $15,000 | +5 HP/năm |
| Căn nhà | $45,000 | +10 HP/năm |
| Du thuyền | $60,000 | +15 HP/năm |

Giá của Giáo viên: Xe hơi **$5,000** → giá co giãn theo nghề. ✅

Chi phí quy đổi: $3,000 / $4,500 / $4,000 mỗi điểm HP vĩnh viễn (Bác sĩ);
$1,000/điểm với Giáo viên → **Giáo viên mua ước nguyện lãi hơn nhiều**. 🟡

❓ *Cần kiểm chứng:* màn tổng kết của Bác sĩ liệt kê cả "Xe hơi −5" **và** "Căn nhà"
→ có thể một nghề có nhiều hơn một khát vọng.

### 5.6 Giáo dục ✅

Tăng lương **vĩnh viễn**, mua một lần mỗi bậc.

| Khoá | Tăng lương | Giá gốc (năm 1) |
|---|---|---|
| Các khóa học trực tuyến | 6–12% | $2,000 |
| Giáo dục đại học | 13–18% | $3,500 |
| Bằng thạc sĩ | 19–27% | $5,000 |
| Trao đổi kinh nghiệm | 25–33% | $8,000 |
| MBA | 30–45% | $13,000 |

Thực nghiệm: mua "Khóa học trực tuyến" → lương $7,000 → **$7,640 (+9%)** ✅
(rơi vào giữa khoảng 6–12% → giá trị random trong khoảng).

**Lương còn tự tăng nhẹ mỗi năm** không cần học.
Quan sát: Giáo viên **+3%, +1%**; Bác sĩ **+5%, +1%, +2%** → biên độ ~**1–5%/năm**. 🟡

### 5.7 Bảo hiểm ✅

- Ở đầu ván chỉ có **1 loại: Sức khỏe**
- 🟡 **Suy luận từ tên file ảnh trong APK** (`car-insurance-icon.png`,
  `home-insurance-icon.png`, `yacht-insurance-icon.png`): danh sách bảo hiểm
  **mở rộng theo tài sản bạn sở hữu** — mua xe hơi thì có bảo hiểm xe, v.v.
  Chưa xác minh trong game vì chưa đủ tiền mua món ước nguyện.
- Thời hạn **1 năm** (phải mua lại hàng năm)
- Tác dụng: *"Nếu bạn gặp tai nạn, bảo hiểm sẽ chi trả toàn bộ chi phí."*
- Giá: Giáo viên $100/năm, Bác sĩ $200/năm (tỉ lệ với lương) 🟡

**Sự kiện tai nạn ✅ đã quan sát:**
> Sự kiện: **"Bệnh bí ẩn"** — *"Bạn không có bảo hiểm."* → **−$700** và **−10 HP**

→ Khi không có bảo hiểm, tai nạn đánh **cả hai chỉ số**: tiền **và** hạnh phúc.
Bảo hiểm Bác sĩ giá $200/năm, thiệt hại khi không có là $700 + 10 HP
→ **rất đáng mua**, vì 10 HP tương đương vài trăm đến hơn nghìn đô mua qua thẻ tiêu dùng. 🟡

❓ Chưa rõ: xác suất xảy ra mỗi năm, biên độ thiệt hại có thay đổi không,
và màn hình hiển thị thế nào khi **có** bảo hiểm.

### 5.8 Ngân hàng / Khoản vay ✅

> "Số tiền vay được tính bằng một nửa mức lương hàng năm trừ đi khoản thanh toán hàng năm.
> Khoản vay có thời hạn tối đa 5 năm và không có tùy chọn trả nợ sớm."

| Tham số | Giá trị |
|---|---|
| Lãi suất | **10%/năm** |
| Kỳ hạn | 1–5 năm (thanh trượt) |
| Ràng buộc | tổng thanh toán hàng năm ≤ **50% lương** |
| Trả trước hạn | **Không cho phép** |

Xác minh công thức: Giáo viên lương $7,000 → khoản vay tối đa hiển thị **$3,182**.
Kiểm tra: $3,182 × 1.10 = $3,500 = đúng 50% của $7,000 ✅

UI: 2 thanh trượt (kỳ hạn ở trên, số tiền ở dưới) + nút "Vay tiền".

### 5.9 Đầu tư — 5 loại tài sản ✅

Tab "Đầu tư". Mỗi loại có bottom sheet riêng: biểu đồ lịch sử giá (~13 điểm),
số đã đầu tư, lãi/lỗ %, thanh trượt **% tiền mặt hiện có**, nút Đầu tư / Bán.

| Loại | Giá 1 đơn vị (năm 1) | Rủi ro | Thu nhập |
|---|---|---|---|
| **Cổ phiếu** | **$100** | Có thể mất toàn bộ vốn | Cổ tức + tăng giá không giới hạn |
| **Vàng** | **$2,500** | Rất thấp | Chống lạm phát, cân bằng danh mục |
| **Tiền điện tử** | **$21,773** | Cực cao, mất trắng | Tiềm năng ×10 |
| **Bất động sản** | **$30,000** | Thấp | ~**10%/năm** tiền thuê; giá & tiền thuê tăng theo lạm phát |
| **Trái phiếu Chính phủ** | *(theo số tiền, không theo đơn vị)* | Thấp | **Lợi nhuận hàng năm: 4%** ✅ |

#### ⭐ Cơ chế cổng chặn theo mức giàu — phát hiện quan trọng ✅

Giá **một đơn vị** chênh nhau tới **300 lần**. Bạn không mua được phần lẻ:
nếu tiền mặt < giá 1 đơn vị thì nút "Đầu tư" **bị vô hiệu hoá** và
**thanh trượt không hiện**.

Xác minh: Lập trình viên có $22,000 → không mua nổi Bất động sản ($30,000).

→ Các hạng tài sản **tự mở khoá dần theo độ giàu**, tạo cảm giác tiến bộ
mà không cần hệ thống "level" riêng. **Đây là ý tưởng đáng học nhất về mặt cơ chế.**

Biến động quan sát trong cùng năm 1: Cổ phiếu −10%, Vàng −21%, Crypto +3%, BĐS +13%
→ mỗi loại có **dạng đồ thị đặc trưng**: cổ phiếu răng cưa mạnh, BĐS đi lên đều đặn. ✅

**Số liệu cổ phiếu quan sát được:**

| Năm | Biến động giá | Cổ tức | Vốn nắm giữ | Tỉ suất cổ tức |
|---|---|---|---|---|
| 1 | −10% | $162 | $3,000 | 5.4% |
| 2 | −1% | $294 | $2,700 | 10.9% |
| 3 | ❓ | $276 | ~$2,670 | 10.3% |
| 4 | +21% | $366 | ~$2,640 | 13.9% |

→ Giá cổ phiếu cơ sở: **$100/đơn vị**. Số tiền đầu tư được làm tròn theo bội số giá. ✅
→ Cổ tức **thay đổi mỗi năm**, không cố định. ✅

### 5.10 Việc kinh doanh — "Những cơ hội" ✅

Tab thứ 3. Thẻ dạng chấp nhận (✓ vàng) / từ chối (✗ đỏ), mỗi lần 1 thẻ.

Ba dạng cơ hội đã gặp:

| Tên | Chi phí | Cơ chế |
|---|---|---|
| Nhà đầu tư đang tìm kiếm đối tác | $10,000 | **+$2,000/năm** thu nhập thụ động (20%/năm) |
| Mua NFT hiếm | $3,000 | ×10 hoặc **mất trắng** trong 1 năm |
| Bài giảng tại hội nghị y khoa *(riêng Bác sĩ)* | Chi phí đi lại $800 | Phí thu $2,500, **xác suất huỷ 10%** |

**Thực nghiệm NFT:** đầu tư $3,000 → sự kiện cuối năm:
*"Khoản đầu tư NFT của bạn đã mất toàn bộ giá trị."* → mất sạch. ✅

Lưu ý: khoản NFT **không** được cộng vào ô "Đầu tư" trên HUD khi mua. 🟡

### 5.11 Sự kiện cuối năm

| Sự kiện | Nội dung | Trạng thái |
|---|---|---|
| **Lạm phát** | Mọi giá ×(1+r). Quan sát: 4, 6, 7, 8, 9, 10, 11% | ✅ gặp gần như mỗi năm |
| **Bệnh bí ẩn** | Không có bảo hiểm → **−$700 và −10 HP** | ✅ đã quan sát |
| **Sinh em bé** | *"Chúc mừng! Bạn vừa sinh em bé!"* → **+35 HP**, **chi phí cố định +30% vĩnh viễn** | ✅ đã quan sát |
| **Kết quả NFT** | Mất toàn bộ giá trị khoản đã mua | ✅ đã quan sát |
| Ngân hàng Trung ương đổi lãi suất | Hướng dẫn có nhắc | ❓ chưa gặp |
| Khủng hoảng thị trường | Suy đoán | ❓ chưa gặp |

**Sự kiện sinh em bé rất đáng chú ý về mặt thiết kế:** đây là đánh đổi lớn và
**không thể từ chối** — được +35 HP một lần (rất nhiều, bằng ~7 thẻ tiêu dùng tốt)
nhưng gánh **+30% chi phí cố định mãi mãi**, cộng dồn với lạm phát hàng năm.

---

## 6. Nhật ký thực nghiệm (ván Giáo viên, 4 năm)

| Năm | Lương | Δ lương | Cổ tức | Cổ phiếu | Lạm phát | Chi phí | HP cuối năm | Tổng TS |
|---|---|---|---|---|---|---|---|---|
| 1 | $7,000 | — | $162 | −10% | 11% | $2,500 | 51 ✓ | $4,100 |
| 2 | $7,640 | +9% (giáo dục) | $294 | −1% | 10% | $2,775 | 80 ✓ | $2,748 |
| 3 | $7,869 | +3% (tự nhiên) | $276 | — | 9% | $3,053 | 52 ✓ | $7,355 |
| 4 | $7,948 | +1% (tự nhiên) | $366 | +21% | 7% | $3,327 | 33 ✗ | $12,130 |

**Kết quả: THUA ở năm 4** vì bot từ chối quá nhiều thẻ tiêu dùng đắt tiền.

### Ván thứ hai (Bác sĩ, 6 năm — chạm trần bản miễn phí)

Chiến lược: nhận **mọi** thẻ tiêu dùng, không đầu tư gì.

| Năm | Tiền cuối năm | HP cuối năm |
|---|---|---|
| 2 | $5,890 | 115 |
| 3 | $10,593 | 134 |
| 4 | $14,143 | 150 |
| 6 | $17,184 | **208** |

→ Chứng minh **hạnh phúc không có trần** và cũng cho thấy: nhận hết thẻ thì
hạnh phúc dư thừa vô ích trong khi vốn gần như đứng yên.

### Bài học thiết kế

Với Giáo viên: lương $7,000, chi phí $2,500 → thặng dư $4,500/năm,
giữ hạnh phúc tốn ~$1,000–3,000/năm. Phần còn lại để đầu tư rất nhỏ.

⚠️ **Đính chính:** ban đầu tôi kết luận đây là lỗi cân bằng. Sau khi phát hiện
paywall ở năm 6 (mục 1b), nhận định đúng hơn là: **bản miễn phí cố tình không cho
đủ thời gian để thắng**. Không đủ dữ liệu để đánh giá cân bằng của game đầy đủ.

Dù vậy, hai quan sát về **nhịp độ** vẫn có giá trị cho bản tự làm: 🟡
1. Nhận hết thẻ → HP tăng vô hạn, vô dụng → **nên có trần hoặc lợi ích giảm dần**
2. Chỉ dựa vào lương thì vốn tăng quá chậm → **cần đòn bẩy sớm** (kinh doanh, vay đầu tư)

---

## 7. Phân tích UI/UX

### 7.1 Kiến trúc điều hướng
```
Màn hình chính
├── Trò chơi mới → Chọn nghề (carousel 3 thẻ) → Vào game
├── Cách chơi → Carousel 14 trang hướng dẫn
└── Chọn ngôn ngữ

Trong game (3 tab dưới đáy)
├── [◆] Trang chủ      — 1 trang cuộn dọc, nhiều khu vực
│     ├── Thẻ hành động của năm (chi phí → thẻ tiêu dùng → kết thúc năm)
│     ├── Bảo hiểm      (carousel ngang)
│     ├── Giáo dục      (carousel ngang, 5 bậc)
│     ├── Mua sắm       (carousel ngang, 3 món)
│     └── Ngân hàng     (2 thanh trượt + nút vay)
├── [🐷] Đầu tư         — danh sách 5 loại tài sản → bottom sheet giao dịch
└── [🔥] Việc kinh doanh — thẻ cơ hội chấp nhận/từ chối
```

Menu hamburger chỉ là menu tạm dừng: Tiếp tục / Trò chơi mới / Cách chơi / Ngôn ngữ.
**Không có bảng tài chính tổng hợp riêng** — đây là một thiếu sót đáng cải thiện.

### 7.2 Ngôn ngữ thiết kế
- **Bố cục dọc**, tối ưu một tay
- **Nền ảnh Times Square** mờ xuyên suốt, thẻ nội dung màu **kem/hồng đào** bo góc lớn
- **CTA màu vàng** nổi bật, nút phụ màu xám khi bị vô hiệu
- **Ảnh 3D render** cho vật phẩm (bảo hiểm, giáo dục, xe hơi...) — phong cách nhất quán
- **HUD 3 ô** cố định trên cùng: Đầu tư (cặp xanh) / Tiền bạc (tiền xanh) / Hạnh phúc (mặt cười)
- **Icon hạnh phúc đổi màu và biểu cảm theo mức** — cam ở 70, tím cười ở 80, đỏ mặt buồn khi thấp ✅
  → phản hồi trực quan rất tốt, đáng học theo
- **Màn thua** nền gradient cam-đỏ toàn màn hình, chỉ 1 nút "Thử lại"

### 7.3 Điểm mạnh UX đáng học
1. **Thẻ quyết định nhị phân** (✗ / +) — nhanh, rõ, không cần đọc nhiều
2. **Thanh trượt % thay vì nhập số tiền** — giảm ma sát khi đầu tư
3. **Biểu đồ lịch sử giá** ngay trong sheet giao dịch — đủ để ra quyết định tại chỗ
4. **Tổng kết cuối năm** gom mọi thay đổi vào một màn hình cuộn — dễ hiểu chuyện gì đã xảy ra
5. **Thanh tiến độ `$X / $1,000,000`** luôn nhắc mục tiêu

### 7.4 Điểm yếu UX nên khắc phục ở bản tự làm
1. ❌ Không có **bảng tài chính tổng hợp** (thu/chi/tài sản/nợ) — người chơi phải tự nhớ
2. ❌ Không thấy **danh sách khoản vay đang có** và lịch trả nợ
3. ❌ Không có **lịch sử các năm** đã qua để nhìn xu hướng
4. ❌ Thẻ tiêu dùng **không nói rõ từ chối sẽ bị trừ điểm** — người chơi mới rất dễ chết oan
5. ❌ Không có **nút hoàn tác** hay xác nhận cho giao dịch lớn
6. ❌ Mục tiêu $1,000,000 quá xa so với tốc độ tích luỹ → thiếu cảm giác tiến bộ
7. ❌ **Hộp thoại đánh giá Google Play bung ra giữa ván** (quan sát ở năm 5),
   chặn hoàn toàn thao tác cho tới khi bấm "Not now" — cắt ngang mạch chơi
8. ❌ Không phân biệt được **thu nhập thụ động** với lương trên HUD

---

## 8. Công thức đã xác minh (dùng trực tiếp khi code)

```js
// Đầu mỗi năm
tienMat   += luong + tongCoTuc + tongThuNhapThuDong
danhMuc[i] = danhMuc[i] * (1 + bienDong[i])
hanhPhuc  -= tongPhatKhatVongChuaDat
hanhPhuc  += tongHPTuMonUocNguyenDaMua
heSoGia    = heSoGia * (1 + lamPhat)      // áp cho MỌI giá

// Chi phí bắt buộc
chiPhiNam  = chiPhiGoc * heSoGia

// Thẻ tiêu dùng
nhan:    tienMat -= gia;  hanhPhuc += diem
tuChoi:                    hanhPhuc -= diem

// Giáo dục
luong = luong * (1 + random(minTang, maxTang))

// Vay ngân hàng
thanhToanHangNam = goc * (1 + 0.10 * kyHan) / kyHan
rangBuoc: tongThanhToanHangNam <= 0.5 * luong

// Kiểm tra kết thúc năm
if (hanhPhuc < 50) => THUA
if (tienMat + tongDanhMuc >= 1_000_000) => THẮNG
```

---

## 9. Việc còn phải làm để hoàn tất phân tích

### Còn khảo sát được trong 6 năm miễn phí

| # | Hạng mục | Ưu tiên |
|---|---|---|
| 1 | Cổ tức/tiền thuê thực tế của vàng, crypto, BĐS (mới có giá, chưa có dòng tiền) | 🟠 Vừa |
| 2 | Xác suất và biên độ sự kiện tai nạn; màn hình khi **có** bảo hiểm | 🟠 Vừa |
| 3 | Bảo hiểm/khát vọng của nghề **Lập trình viên** | 🟡 Thấp |
| 4 | Bác sĩ có nhiều hơn một khát vọng? (tổng kết liệt kê cả Xe hơi và Căn nhà) | 🟡 Thấp |
| 5 | Số thẻ tiêu dùng mỗi năm có cố định không (quan sát 4–5) | 🟡 Thấp |

### 🔒 Bị chặn bởi paywall — cần trả ₫150,000 mới khảo sát được

| # | Hạng mục |
|---|---|
| 6 | Sự kiện **Ngân hàng Trung ương / lãi suất** và ảnh hưởng lên trái phiếu |
| 7 | Màn hình **thắng** và cảm giác về nhịp độ cuối game |
| 8 | Bảo hiểm mở rộng (xe/nhà/du thuyền) — cần đủ tiền mua món ước nguyện trước |
| 9 | Cấu trúc "các cấp độ" (levels) của bản trả phí |

**Đã đóng:** ✅ tai nạn, ✅ sinh em bé, ✅ trần hạnh phúc (không có trần),
✅ công nghệ app, ✅ giới hạn bản miễn phí, ✅ chỉ số 3 nghề,
✅ giá đơn vị 5 loại tài sản, ✅ cơ chế cổng chặn theo mức giàu.

> **Quyết định cần bạn đưa ra:** có mua bản trọn đời ₫150,000 để khảo sát tiếp không.
> Theo tôi là **không cần thiết** — các cơ chế cốt lõi đã nắm đủ để thiết kế bản riêng,
> và bạn sẽ tự cân bằng lại nhịp độ chứ không sao chép nguyên bản.

---

## 10. Ranh giới pháp lý cho bản tự làm

- ✅ **Luật chơi, công thức, cơ chế số học** — không được bảo hộ bản quyền, tự do dùng lại
- ❌ **Không** sao chép: ảnh 3D render, ảnh nền Times Square, logo "Cashflow",
  nguyên văn mô tả thẻ bài, tên thương hiệu
- ⚠️ "CASHFLOW" là nhãn hiệu của Rich Dad Company → **đặt tên khác** cho bản của bạn

---

## 11. Bước tiếp theo

Tài liệu này là **giai đoạn 1: hiểu game gốc**. Đã đủ dữ liệu để bước sang thiết kế.

Ba ý tưởng cơ chế đáng giữ lại nhất từ bản gốc:
1. **Thẻ tiêu dùng hai chiều** — từ chối cũng mất điểm, biên độ 2N. Tạo áp lực thật mỗi lượt.
2. **Cổng chặn theo mức giàu** — giá 1 đơn vị tài sản chênh 300 lần, tự mở khoá dần.
3. **Sự kiện không từ chối được** (sinh em bé, bệnh tật) — đánh đổi dài hạn ép người chơi thích nghi.

Ba thứ nên làm khác đi:
1. Thêm **bảng tài chính tổng hợp** và **lịch sử các năm** (bản gốc thiếu hẳn)
2. **Trần hoặc lợi ích giảm dần cho hạnh phúc** — bản gốc để HP lên 208 vô nghĩa
3. **Cân bằng lại nhịp độ** để ván đấu kết thúc trong thời lượng hợp lý

Trước khi viết dòng code nào, cần chốt với nhau: nền tảng (web/desktop/mobile),
một người chơi hay nhiều người, giữ nguyên độ phức tạp hay rút gọn, và độ dài
một ván mong muốn. → **Giai đoạn 2 nên bắt đầu bằng một buổi brainstorm thiết kế**,
kết quả ghi vào `docs/02-thiet-ke-ban-cua-toi.md`.

---

## Phụ lục A — Công cụ khảo sát đã dựng

Đặt tại thư mục scratchpad của phiên làm việc:

| Script | Chức năng |
|---|---|
| `probe.ps1` | Chạm 1 điểm → chụp màn hình → liệt kê phần tử có nhãn kèm toạ độ tâm |
| `sweep_howto.ps1` | Vuốt hết carousel hướng dẫn, trích toàn bộ text |
| `play.ps1` | Lặp qua các thẻ quyết định, chấp nhận hoặc từ chối hàng loạt |
| `autoplay.ps1` | Bot tự chơi trọn nhiều năm, phân loại màn hình và ghi log |

**Lưu ý kỹ thuật:** PowerShell 5.1 đọc file `.ps1` **không có BOM** theo bảng mã ANSI
→ mọi chuỗi tiếng Việt trong regex bị hỏng âm thầm. Phải lưu script dưới dạng
**UTF-8 có BOM**:
```powershell
$c = Get-Content -Raw -Encoding UTF8 $p; Set-Content -Path $p -Value $c -Encoding UTF8
```

Kết nối máy ảo: `C:\LDPlayer\LDPlayer9\adb.exe -s emulator-5554 <lệnh>`
(đã bật `basicSettings.adbDebug: 1` trong `C:\LDPlayer\LDPlayer9\vms\config\leidian0.config`).

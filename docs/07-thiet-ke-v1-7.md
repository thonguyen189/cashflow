# Thiết kế bản v1.7 — Đủ khó để phải chọn

Ngày chốt: 11/08/2026. Bản v1.6 đã dựng xong chu kỳ kinh tế, biến cố lớn và cơ chế
phá sản, nhưng khép lại với một lời thú nhận nằm ngay trong mục F của chính nó: **ván
thắng quá sớm — 11–21 năm, tức tự do tài chính ngay ở tuổi 32–42 — là vấn đề cân bằng
lớn nhất còn lại**, và chính nó che khuất toàn bộ nửa sau của game.

Bản này giải quyết đúng câu đó, và giải bằng cách kéo mọi con số về đúng đời thật chứ
không phải bằng cách vặn tham số cho khó lên.

## Số đo mở đầu

Chạy lại `balance.test.ts` trên nhánh `v1-6-doi-that-hon` (n=200/nghề):

| Nghề | Tỉ lệ thắng | Tuổi thắng trung bình | Sớm nhất | Phá sản |
|---|---|---|---|---|
| 👨‍🏫 Giáo viên | 94% | 42 | 31 | 0,0% |
| 👩‍⚕️ Bác sĩ | 91% | 36 | 29 | 0,0% |
| 👨‍💻 Kỹ sư phần mềm | 91% | 33 | 29 | 0,0% |

Hành trình được thiết kế cho 79 năm. Không một ván mô phỏng nào từng sống quá năm thứ
35. Nửa sau cuộc đời — nghỉ hưu, lương hưu còn 45%, phí bảo hiểm leo 6% mỗi năm, đồng
chi trả viện phí tới 75% — chưa bao giờ được chơi tới một lần nào.

---

## Vì sao cần: năm điều thực nghiệm đã lật ngược

Trước khi thiết kế, mỗi đòn bẩy độ khó được đo riêng bằng cách vá thẳng `CONFIG` và
`CO_HOI` lúc chạy rồi mô phỏng lại (n=200/nghề). Kết quả bác bỏ phần lớn các giả định
tự nhiên:

| Kịch bản | Giáo viên | Bác sĩ | Kỹ sư PM | Tuổi thắng TB |
|---|---|---|---|---|
| Đối chứng | 94% | 91% | 91% | 42 / 36 / 33 |
| Lợi suất doanh nghiệp 20% → **7%** | 93% | 91% | 90% | 51 / 44 / 41 |
| Hệ số an toàn 1,5 → **4,0** | 94% | 91% | 91% | 48 / 42 / 43 |
| Biến cố lớn 3–6 → **7–12** | 96% | 95% | 93% | 42 / 36 / 34 |
| Thuế thô (lương ×0,82 · lợi tức ×0,9 · DN ×0,8) | 73% | 83% | 82% | 53 / 46 / 42 |
| Gộp tất cả + khủng hoảng dày & sâu + DN mất mùa | 48% | 78% | 82% | 70 / 59 / 52 |

**1. Tỉ lệ thắng gần như miễn nhiễm với mọi đòn bẩy tài chính.** Cắt lợi suất doanh
nghiệp từ 20% xuống 7% — chém gần ba lần — không làm suy suyển tỉ lệ thắng, chỉ đẩy
tuổi thắng ra 8–9 năm. Nâng hệ số an toàn từ 1,5 lên 4,0 cũng vậy. Lý do: cửa thua duy
nhất là hạnh phúc, mà hạnh phúc gần như không phụ thuộc vào chuyện bạn giàu nhanh hay
chậm. **Mọi đòn bẩy tài chính là đòn bẩy NHỊP ĐỘ, không phải đòn bẩy ĐỘ KHÓ.**

**2. Tăng số biến cố lớn làm game DỄ hơn, và dù sao cũng vô tác dụng.** Chỉ có sáu
loại biến cố, mỗi loại tối đa một lần một ván, cách nhau tối thiểu 8 năm trong dải tuổi
28–85 — hẹn 12 mốc vẫn chỉ nổ được chừng sáu lần. Cơ chế đã bão hoà sẵn từ v1.6; chênh
lệch 93 → 96% nằm trong biên nhiễu của n=200.

**3. Phá sản đo ra 0,0% ở MỌI kịch bản**, kể cả khi khủng hoảng dày gấp đôi và sâu gấp
rưỡi. Đây không phải vấn đề tham số — xem lỗi cấu trúc thứ hai bên dưới.

**4. Ba nghề phân kỳ nghiêm trọng ngay khi siết:** 48% / 78% / 82%. Nghề lương cao gần
như không siết được bằng bất kỳ đòn bẩy nào.

**5. Ván thua vẫn chết non.** Ở kịch bản gộp, tuổi thua trung bình của kỹ sư phần mềm
vẫn là 23, muộn nhất 32 — tức toàn bộ ván thua là chết vì hạnh phúc trong mười năm đầu,
không ván nào thua vì lý do tài chính.

### Hai lỗi cấu trúc chặn đường

**Lỗi 1 — hạnh phúc mua được bằng tiền với giá tuyệt đối.** Thẻ tiêu dùng 500 nghìn tới
60 triệu, ước nguyện 80 triệu tới 2,5 tỷ, phí chuyên gia neo theo chi phí sinh hoạt —
nhưng thẻ và ước nguyện thì dùng chung một bảng giá cho cả ba nghề. Tấm vé Phú Quốc 18
triệu ngốn 10% lương giáo viên nhưng chỉ 3% lương kỹ sư. Hệ quả: người lương cao gần như
miễn nhiễm với cửa thua duy nhất của game, còn giáo viên gánh trọn. Đây chính là lý do
siết cách nào cũng ra 48% / 78% / 82%.

**Lỗi 2 — không có đường mất vốn nào ngoài vay nợ.** Ba nấc vỡ nợ của v1.6 chỉ khởi
động khi tiền mặt âm, mà tiền mặt chỉ âm khi có nợ phải trả. `CHIEN_LUOC_CAN_BANG` có
`vayDeGopVon: false` nên **không thể phá sản**, bất kể khủng hoảng nặng tới đâu. Cơ chế
phá sản đúng nhưng không có đường vào.

---

## A. Đặt lại thang tiền

Đây là thay đổi nền tảng mà mọi thay đổi khác đứng lên trên.

### Sai lệch so với thực tế

| Nghề | Game v1.6 | Thực tế người mới ra trường, 2026 | Sai lệch |
|---|---|---|---|
| 👨‍🏫 Giáo viên | 15tr/tháng | hệ số 2,34 × lương cơ sở 2,34tr = 5,48tr, cộng phụ cấp ưu đãi 30–35% ≈ **7,1–7,4tr** | **2,1×** |
| 👩‍⚕️ Bác sĩ | 30tr/tháng | từ 1/1/2026 xếp bậc 2, hệ số 2,67 = 6,25tr lương ngạch; thực nhận cả phụ cấp **8–15tr** | **2,6×** |
| 👨‍💻 Kỹ sư phần mềm | 50tr/tháng | fresher **8–15tr**; 50tr là mức senior 4–5 năm kinh nghiệm | **4,3×** |

Chi phí sinh hoạt lệch ngược chiều: người độc thân đi làm ở TPHCM tiêu 11–15 triệu mỗi
tháng, Hà Nội khoảng 11,5 triệu. Game cho giáo viên 9tr (hợp lý nếu ở tỉnh), bác sĩ 20tr
(cao 1,7 lần), kỹ sư phần mềm 36,25tr (cao gần 3 lần).

### Điều thật sự quan trọng: tỉ lệ tiết kiệm

Con số tuyệt đối lệch không nguy hiểm bằng tỉ lệ tiết kiệm — thứ quyết định tốc độ tới
tự do tài chính:

| Nghề | Tiết kiệm năm đầu, game v1.6 | Ngoài đời |
|---|---|---|
| 👨‍🏫 Giáo viên | **40%** | 5–15% ở tỉnh, âm ở thành phố |
| 👩‍⚕️ Bác sĩ | **33%** | ~0% (11,5tr lương / 12tr chi phí) |
| 👨‍💻 Kỹ sư phần mềm | **27,5%** | ~0% |

Người Việt Nam mới ra trường gần như không tiết kiệm được đồng nào trong vài năm đầu.
Game đang phát cho họ 27–40% ngay từ năm 21 tuổi. **Đây là nguyên nhân sâu xa nhất của
việc ai cũng tự do tài chính trước 40 — sâu hơn cả lợi suất doanh nghiệp 20%.**

### Bảng mới

| Nghề | Lương tuổi 21 | Chi phí sinh hoạt | Tiết kiệm năm đầu |
|---|---|---|---|
| 👨‍🏫 Giáo viên | **90tr** (7,5tr/th) | **76tr** (6,3tr/th) | 15,6% |
| 👩‍⚕️ Bác sĩ | **120tr** (10tr/th) | **102tr** (8,5tr/th) | 15,0% |
| 👨‍💻 Kỹ sư phần mềm | **144tr** (12tr/th) | **122tr** (10,2tr/th) | 15,3% |

Tỉ lệ tiết kiệm đặt bằng nhau ở 15% cho cả ba nghề là chủ ý: **điểm phân biệt ba nghề
chuyển từ mức lương khởi điểm sang hình dạng đường sự nghiệp** (mục B). Ngoài đời cũng
vậy — sinh viên mới ra trường của ba ngành này sống na ná nhau; cái khác nhau là mười
lăm năm sau.

15% không phải con số thực tế (thực tế gần 0%) mà là mức tối thiểu để ván chơi tồn tại:
0% thặng dư nghĩa là không bao giờ tích luỹ được gì và game không có nước đi nào. Đây là
một nhượng bộ có ý thức của mô phỏng trước hiện thực, và nó được ghi lại ở đây để bản
sau không ai tưởng là sơ suất.

### Hệ quả bắt buộc: nâng vốn ban đầu của xuất thân

Mục A của v1.6 đã cảnh báo ràng buộc này: chi phí sinh hoạt bị trừ từ tiền mặt ở ĐẦU
năm còn lương chỉ cộng vào CUỐI năm, nên năm đầu tiên phải sống trọn bằng vốn ban đầu.
Vốn thấp hơn chi phí năm đầu là một khởi đầu **không thể vượt qua bằng lối chơi khôn
ngoan**.

Tỉ lệ chi phí/lương mới là ~0,85 (thay vì 0,725 của kỹ sư phần mềm cũ — nghề khắt khe
nhất của v1.6). Với nhà thuần nông, chi phí năm đầu ≈ 0,85 × 0,92 × 1,08 = **0,845 ×
lương**, cộng khoản trả nợ học phí ~0,06 × lương, cộng đệm cho sự kiện phát sinh sớm:

| Xuất thân | v1.6 | v1.7 |
|---|---|---|
| 🌾 Nhà thuần nông | 0,85 | **1,05** |
| 🏘️ Viên chức tỉnh lẻ | 1,00 | **1,25** |
| 🏢 Buôn bán ngoài phố | 2,00 | **2,40** |
| 🏛️ Nhà có của ăn của để | 3,50 | **4,20** |

Tương phản giữa bốn xuất thân giữ gần như nguyên vẹn (1 : 1,19 : 2,29 : 4,00 so với
1 : 1,18 : 2,35 : 4,12 của v1.6) — vốn là thứ người chơi cảm nhận rõ nhất nên phải giữ.

### Hệ quả thứ hai: giá cơ hội giữ nguyên số tuyệt đối

Giá cơ hội kinh doanh, giá tài sản đầu tư và giá ước nguyện **không đổi**. Lương giảm
2–4 lần trong khi giá giữ nguyên nghĩa là mọi thứ khó hơn 2–4 lần. **Đây là đòn bẩy độ
khó mạnh nhất của cả bản v1.7, và nó miễn phí** — không phải vặn số cho khó lên mà chỉ
là sửa cho đúng đời thật.

Nhưng cơ hội rẻ nhất hiện là 200 triệu. Giáo viên tiết kiệm 14tr mỗi năm sẽ mất mười bốn
năm mới với tới suất đầu tiên — quá lâu, và trong quãng đó người chơi không có quyết
định nào để ra. Thêm ba bậc cơ hội nhỏ:

| Cơ hội | Vốn | Thu nhập nền | Sinh lời | Biến động |
|---|---|---|---|---|
| 📦 Bán hàng online tại nhà | 25tr | 4,5tr/năm | 18% | −40% … +45% |
| 🛵 Một chiếc xe máy cho thuê | 60tr | 9tr/năm | 15% | −20% … +22% |
| 🍜 Góp vốn quán ăn với bạn | 120tr | 20,4tr/năm | 17% | −35% … +38% |

Đúng cách tuyệt đại đa số người Việt Nam bắt đầu làm ăn: từ những khoản rất nhỏ, làm
thêm ngoài giờ, góp vốn với bạn bè.

---

## B. Đường cong sự nghiệp theo nghề

Hiện `tangLuongThucMin/Max` là 0–2,5% chung cho mọi nghề, mọi tuổi. Nghĩa là game cho
lương khởi điểm bằng mức đỉnh sự nghiệp rồi tăng đều đặn suốt bốn mươi năm. Ngoài đời
hình dạng khác hẳn, và khác **theo từng nghề** — đây là chiều mà game đang bỏ trắng
hoàn toàn.

`Nghe` thêm trường `duongCongSuNghiep`: bảng tăng lương **thực** (trên nền lạm phát)
theo dải tuổi.

| Nghề | 21–30 | 31–40 | 41–50 | 51–60 |
|---|---|---|---|---|
| 👨‍🏫 Giáo viên | 3,5% | 3,0% | 2,5% | 2,0% |
| 👩‍⚕️ Bác sĩ | 5,0% | 9,0% | 5,0% | 2,0% |
| 👨‍💻 Kỹ sư phần mềm | 12,0% | 5,0% | 1,0% | **−1,0%** |

Lương theo mặt bằng giá hôm nay (chưa cộng lạm phát danh nghĩa):

| Nghề | Tuổi 21 | Tuổi 30 | Tuổi 40 | Tuổi 50 | Tuổi 60 |
|---|---|---|---|---|---|
| 👨‍🏫 Giáo viên | 90tr | 123tr | 165tr | 211tr | **257tr** (21tr/th) |
| 👩‍⚕️ Bác sĩ | 120tr | 186tr | 441tr | 718tr | **875tr** (73tr/th) |
| 👨‍💻 Kỹ sư phần mềm | 144tr | 399tr | 650tr | 718tr | **650tr** (54tr/th) |

Ba đường kể ba câu chuyện có thật:

**Giáo viên** lên bậc ba năm một lần, hệ số 2,34 → 4,98 sau hai mươi bốn năm. Chậm, đều,
không bao giờ bứt phá — nhưng cũng không bao giờ sụp, và lương hưu tính trên hệ số ngạch
nên tuổi già an toàn nhất trong ba nghề.

**Bác sĩ** ì ạch mười năm đầu — sáu năm trường y, mười tám tháng thực hành, rồi làm bậc
thấp ở bệnh viện công — sau đó bứt tốc mạnh nhất từ tuổi 35 khi có danh tiếng, phòng
khám riêng và bệnh nhân theo tên. Đây là nghề thưởng cho sự kiên nhẫn.

**Kỹ sư phần mềm** tăng gấp gần ba lần trong chín năm đầu, đạt đỉnh quanh tuổi 50 rồi
**đi xuống**. Đào thải tuổi trong ngành công nghệ là chuyện thật, và nó biến "chọn nghề
lương cao" thành canh bạc về thời điểm chứ không phải lựa chọn hiển nhiên đúng: bạn có
mười lăm năm vàng để chuyển thu nhập thành tài sản, sau đó cửa hẹp dần.

Thăng chức (`thangChucXacSuat`) và hệ số tăng lương theo trạng thái thị trường
(`heSoTangLuong`) vẫn nhân lên trên nền này, không thay thế nó.

**Chú ý về sàn.** `tangLuongThucMin` = 0 của v1.6 phải bỏ: kỹ sư phần mềm sau tuổi 50 có
tăng trưởng thực âm. Điều này mở ra đúng cái mà mục F của v1.6 kết luận là không thể có —
một nguồn thu **biết sụp** trong khi còn đi làm — nên nó cũng là mảnh ghép đầu tiên của
con đường phá sản thật.

---

## C. Thuế

### Thuế thu nhập cá nhân

Luật Thuế thu nhập cá nhân sửa đổi, hiệu lực 1/7/2026: giảm trừ bản thân **186tr/năm**,
mỗi người phụ thuộc **74,4tr/năm**, biểu thuế rút gọn còn năm bậc.

| Thu nhập tính thuế/năm | Thuế suất |
|---|---|
| đến 120tr | 5% |
| trên 120tr đến 360tr | 10% |
| trên 360tr đến 720tr | 20% |
| trên 720tr đến 1,2 tỷ | 30% |
| trên 1,2 tỷ | 35% |

Người phụ thuộc = số con đang nuôi (dưới 18 tuổi, hoặc đang học đại học tới 22). Bạn
đời có thu nhập riêng nên không tính.

**Điều chỉnh trung thực so với đề xuất ban đầu.** Thí nghiệm "thuế thô ×0,82" ở bảng
thực nghiệm trên đã đánh giá quá cao tác động của thuế TNCN. Với thang lương mới và mức
giảm trừ mới, cả ba nghề **không nộp một đồng nào trong khoảng mười lăm năm đầu** —
90/120/144tr đều dưới ngưỡng 186tr. Thuế chỉ cắn khi đã thành công:

| Nghề | Tuổi 21 | Tuổi 40 (2 con phụ thuộc) | Tuổi 50 (con đã tự lập) | Tuổi 60 |
|---|---|---|---|---|
| 👨‍🏫 Giáo viên | 0 | 0 | 1,3tr (0,6%) | 3,6tr (1,4%) |
| 👩‍⚕️ Bác sĩ | 0 | 5,3tr (1,2%) | 64,4tr (9,0%) | 95,8tr (10,9%) |
| 👨‍💻 Kỹ sư phần mềm | 0 | 25,5tr (3,9%) | 64,4tr (9,0%) | 50,8tr (7,8%) |

Thuế TNCN vì vậy **không phải đòn bẩy hạ tỉ lệ thắng** — nó là phanh hãm giai đoạn giàu
và là một chi tiết đời thật đáng có, không hơn. Sức nặng cân bằng thật đến từ mục A, B
và phần thuế đầu tư ngay dưới đây.

### Thuế trên thu nhập thụ động

Giữ đúng luật thật, và điều đó tự nó tạo ra một bài học:

| Kênh | Thuế | Lợi tức kỳ vọng trước → sau thuế |
|---|---|---|
| 🏦 Trái phiếu & tiền gửi | **miễn** — lãi tiết kiệm cá nhân không chịu thuế TNCN | 6,0% → **6,0%** |
| 📈 Cổ tức cổ phiếu | 5% | 3,0% → 2,85% |
| 🥇 Vàng | không có lợi tức | — |
| ⚡ Tiền mã hoá | không có lợi tức | — |
| 🏢 Cho thuê bất động sản | 10% (5% VAT + 5% TNCN) | 5,5% → 4,95% |
| 🏪 Thu nhập doanh nghiệp | **20%** (thuế TNDN) | xem mục D |

Kênh an toàn nhất bỗng thành kênh duy nhất không bị đánh thuế — đúng luật Việt Nam, và
lần đầu tiên trái phiếu có một lý do tồn tại ngoài việc "trú ẩn khi khủng hoảng".

`dongTienThuDong` tính **sau thuế**. `nghiaVuHangNam` **không** cộng thuế lương vào, vì
khoản đó biến mất khi ngừng đi làm — đưa nó vào vế nghĩa vụ sẽ đẩy đích xa một cách sai
bản chất.

---

## D. Doanh nghiệp: sinh lời thật và bão hoà

### Hạ dải sinh lời

Dải 18,75–22,5% của v1.6 xa thực tế. "Dãy nhà trọ cho công nhân" 1 tỷ thu 195tr mỗi năm
là 19,5%; ngoài đời nhà trọ tính cả tiền đất chỉ sinh lời 6–9%. Quán cà phê nhỏ thì đa
số hoà vốn hoặc lỗ, tỉ lệ đóng cửa trong hai năm đầu rất cao.

Hạ xuống **12–18%**, và quan trọng hơn: **phân tán theo rủi ro** thay vì gom hết vào một
dải hẹp, để người chơi có quyết định thật giữa chắc chắn và béo bở.

| Cơ hội | Vốn | Sinh lời | Biến động thu nhập |
|---|---|---|---|
| 📦 Bán hàng online tại nhà | 25tr | 18% | −40% … +45% |
| 🛵 Một chiếc xe máy cho thuê | 60tr | 15% | −20% … +22% |
| 🍜 Góp vốn quán ăn với bạn | 120tr | 17% | −35% … +38% |
| 🛵 Đội xe máy cho thuê | 200tr | 15% | −15% … +18% |
| ☕ Mở quán cà phê nhỏ | 400tr | 18% | −35% … +40% |
| 🚚 Xe tải chở hàng cho thuê | 600tr | 16% | −20% … +24% |
| 🌳 Vườn sầu riêng Tây Nguyên | 700tr | 18% | −85% … +95% |
| 🏪 Góp vốn cửa hàng của bạn | 800tr | 15% | −25% … +28% |
| 🏘️ Dãy nhà trọ cho công nhân | 1 tỷ | **12%** | −8% … +12% |
| 🧵 Góp vốn xưởng may gia công | 1,5 tỷ | 16% | −22% … +25% |

Sau thuế TNDN 20%, dải thực nhận còn **9,6–14,4%**, trung bình 12,8%. So với bất động
sản 4,95% sau thuế, doanh nghiệp vẫn là con đường nhanh nhất tới tự do tài chính — đúng
như thông điệp của game — nhưng hệ số không còn là 3,6 lần của v1.6 mà xuống còn khoảng
**2,6 lần**, và đi kèm rủi ro mất vốn thật ở mục G.

### Bão hoà

Hiện một quán cà phê trả 20% vốn mỗi năm, mãi mãi, không già đi. Thêm: **thu nhập nền
giảm thực 3% mỗi năm** kể từ năm góp vốn — tức không bám đủ lạm phát.

| Số năm đã sở hữu | 5 | 10 | 15 | 25 |
|---|---|---|---|---|
| Thu nhập còn lại | 86% | 74% | 63% | 47% |

Cạnh tranh mọc lên, thiết bị cũ đi, mặt bằng tăng giá, khách quen chuyển đi. Người chơi
buộc phải liên tục gây dựng cái mới thay vì mua một lần rồi ngồi thu tiền tới già.

Đây cũng là mảnh ghép khiến **người đã đạt tự do tài chính có thể rớt lại** nếu ngủ
quên — thứ v1.6 hoàn toàn không có, và là điều kiện để phần "chơi tiếp sau khi thắng"
có ý nghĩa.

`DoanhNghiep` thêm `namGop: number` để tính tuổi doanh nghiệp. Suy từ `chiSoGiaLucMua` là
không đủ vì chỉ số giá không đơn ánh với năm.

---

## E. Chu kỳ kinh tế khắc nghiệt hơn

Ma trận v1.6 cho khủng hoảng chiếm 9,9% số năm, một đợt mỗi 13,6 năm. Nới lên khoảng
**17%** và làm sâu hơn:

| Từ ↓ Sang → | 📈 Thịnh vượng | 😐 Bình thường | 📉 Suy thoái | 💥 Khủng hoảng |
|---|---|---|---|---|
| 📈 Thịnh vượng | 0,42 | 0,34 | 0,16 | 0,08 |
| 😐 Bình thường | 0,20 | 0,46 | 0,24 | 0,10 |
| 📉 Suy thoái | 0,04 | 0,30 | 0,36 | 0,30 |
| 💥 Khủng hoảng | 0,00 | 0,22 | 0,43 | 0,35 |

| Trạng thái | Độ lệch giá | Hệ số lợi tức | Lệch lạm phát | Hệ số tăng lương |
|---|---|---|---|---|
| 📈 Thịnh vượng | +0,10 | ×1,15 | +0,000 | ×1,3 |
| 😐 Bình thường | 0,00 | ×1,00 | +0,000 | ×1,0 |
| 📉 Suy thoái | **−0,18** | **×0,65** | +0,020 | ×0,2 |
| 💥 Khủng hoảng | **−0,45** | **×0,25** | **+0,070** | ×0,0 |

Hai tính chất của v1.6 giữ nguyên: khủng hoảng không bao giờ nhảy thẳng về thịnh vượng,
và suy thoái là cửa ngõ chính vào khủng hoảng.

Đo riêng ở thực nghiệm vòng hai, chỉ đòn này đã đưa giáo viên từ 72% xuống 51%.

---

## F. Giá hạnh phúc neo theo mặt bằng sống

*Sửa lỗi cấu trúc thứ nhất.*

Giá thẻ tiêu dùng, ước nguyện và phí chuyên gia nhân thêm **hệ số mặt bằng sống**:

```
heSoMatBangSong(s) = s.chiPhiHangNam / (CHI_PHI_CHUAN × s.chiSoGia)
CHI_PHI_CHUAN = 102 * TRIEU        // chi phí gốc của bác sĩ, mức giữa
```

Chia cho `chiSoGia` để hệ số không nhân đôi lạm phát — `giaThucTe` đã nhân chỉ số giá
rồi. Vì lấy `chiPhiHangNam` thật nên hệ số tự động gồm cả xuất thân, bậc lương, cưới xin
và số con.

| Nghề | Hệ số năm đầu | Vé Phú Quốc 18tr thành | % lương |
|---|---|---|---|
| 👨‍🏫 Giáo viên | 0,75 | 13,4tr | 14,9% |
| 👩‍⚕️ Bác sĩ | 1,00 | 18,0tr | 15,0% |
| 👨‍💻 Kỹ sư phần mềm | 1,20 | 21,5tr | 14,9% |

Ba nghề nay trả cùng một tỉ lệ thu nhập cho cùng một niềm vui — trước đây là 10% / 5% /
3%. Đây là điều kiện cần để cửa thua hạnh phúc siết được đều cả ba nghề thay vì chỉ siết
giáo viên.

Bài học kèm theo là bài học tài chính cá nhân quan trọng nhất mà game chưa hề dạy:
**lạm phát lối sống**. Sống sang thì cùng một niềm vui cũng đắt hơn, và đó là lý do
lương cao không tự động dẫn tới tự do. Nó cũng khiến hai lựa chọn ở màn thiết lập nhân
vật — xuất thân khá giả và bậc lương cao — có thêm một cái giá mà trước đây không có.

**Không áp cho** phí bảo hiểm y tế, bảo hiểm xe, học phí đại học của con, viện phí: các
khoản này đã neo vào `chiPhiHangNam` hoặc `luong` sẵn rồi, nhân thêm là nhân hai lần.

---

## G. Ba đường mất vốn không đi qua nợ

*Sửa lỗi cấu trúc thứ hai.* Không có ba thứ này thì phá sản mãi mãi là 0%.

### 1. Doanh nghiệp phá sản hẳn

Mỗi doanh nghiệp, mỗi năm, xác suất bị phá sản:

```
xacSuat = 0,02 × heSoThiTruong × (1 + 0,04 × soNamDaSoHuu)
heSoThiTruong: thịnh vượng 0,5 · bình thường 1,0 · suy thoái 1,6 · khủng hoảng 2,5
```

Mất trắng vốn góp, thu về **10%** — thanh lý vội vàng trong hoảng loạn còn tệ hơn cả
thanh lý có trật tự khi vỡ nợ (45%). Hạnh phúc −6.

Khác biến cố 🏚️ "doanh nghiệp đóng cửa" của v1.6: cái đó hẹn lịch, một lần một ván,
nhắm đúng cái lớn nhất, có lá chắn là không tập trung vốn. Cái này là **rủi ro nền** —
thường xuyên, mù quáng, không có lá chắn nào. Giữ ba doanh nghiệp suốt mười năm thì xác
suất mất ít nhất một cái là **khoảng 50%**.

Đây là đường mất vốn quan trọng nhất, vì nó đánh thẳng vào nguồn thu nhập thụ động —
tức đánh thẳng vào điều kiện thắng.

### 2. Bảo lãnh cho người thân

Biến cố lớn mới, `BienCoId` thêm `'baoLanhNguoiThan'`, từ tuổi 30:

Em trai vay ngân hàng mua nhà, nhờ bạn đứng tên bảo lãnh. Đây là một **lựa chọn**, không
phải một cú giáng — game hỏi và người chơi trả lời.

| | Nhận bảo lãnh | Từ chối |
|---|---|---|
| Hạnh phúc ngay | +8 | −10 |
| Rủi ro | 35% khả năng họ vỡ nợ trong 3–8 năm sau | không |
| Nếu vỡ nợ | khoản vay thành nợ của bạn: gốc = 2,5 × chi phí sinh hoạt, kỳ hạn 10 năm, lãi 8%; hạnh phúc −12 | |

Khoản nợ này **không xét `vayToiDa`** — bạn không chọn vay, ngân hàng chỉ đơn giản đến
đòi. Đó chính là điểm mấu chốt: **đây là đường vào nợ mà cả người chơi cẩn thận nhất
cũng dính**, và ngoài đời đúng là cách rất nhiều gia đình Việt Nam mất sạch.

Lá chắn duy nhất là từ chối và chịu −10 hạnh phúc cùng tiếng xấu trong họ. Một quyết
định thật, không có đáp án đúng.

### 3. Chi phí chăm sóc tuổi già

Sau tuổi 75, `chiPhiHangNam` cộng thêm một khoản leo dần:

```
heSoChamSoc(tuoi) = min(0,60, 0,03 × (tuoi − 75))
```

| Tuổi | 75 | 80 | 85 | 90 | 95 trở đi |
|---|---|---|---|---|---|
| Chi phí cộng thêm | 0% | +15% | +30% | +45% | **+60%** (trần) |

Thuê người chăm, thuốc men hàng ngày, viện dưỡng lão. Đây là thứ bào mòn tự do tài chính
ở nửa sau cuộc đời — v1.6 hoàn toàn không có, mà ngoài đời nó chính là cái làm người đã
về hưu vỡ trận. Vì `nghiaVuHangNam` lấy `chiPhiHangNam` làm thành phần chính, **cái đích
tự do tài chính tự lùi ra khi bạn già đi**: giữ được tự do ở tuổi 60 không có nghĩa là
giữ được ở tuổi 85.

---

## H. Hệ số an toàn theo tuổi

`CONFIG.tuDoTaiChinh.heSoAnToan` đang cố định ở 1,5. Đổi thành hàm của tuổi:

```
heSoAnToan(tuoi) = 1,2 + 1,3 × (100 − tuoi) / 79
```

| Tuổi | Hệ số | |
|---|---|---|
| 21 | 2,50 | tự do ở tuổi 21 phải phủ 2,5 lần nghĩa vụ — còn 79 năm phía trước |
| 30 | 2,35 | |
| 40 | 2,19 | |
| 50 | 2,02 | |
| 65 | 1,78 | |
| 80 | 1,53 | |
| 100 | 1,20 | |

Đây chính là quy tắc 4% ngoài đời: nghỉ hưu càng sớm thì tỉ lệ rút an toàn phải càng
thấp, vì tiền phải nuôi bạn càng lâu và càng nhiều lần đi qua khủng hoảng. Nó giết thẳng
kiểu thắng ở tuổi 31 mà không cần cấm đoán gì — chỉ cần nói đúng sự thật.

Thực nghiệm cho thấy riêng đòn này chỉ dời tuổi thắng chứ không hạ tỉ lệ thắng (mục "Vì
sao cần"), nên nó ở đây với tư cách công cụ **nhịp độ**, không phải công cụ độ khó.

---

## I. Phá sản: lần đầu là cú ngã, lần hai là hết

Giữ nguyên ba nấc vỡ nợ và toàn bộ hình phạt của v1.6, thêm hai điều:

**Lần 1** — siết thêm: mất luôn ước nguyện **xe máy hoặc ô tô** đã mua (bị bán giải
chấp), giữ lại căn hộ. Luật phá sản ngoài đời chừa lại nhà ở nhưng không chừa xe.

**Lần 2** — `soLanPhaSan >= 2` thì `trangThai = 'thua'` ngay lập tức, với lý do kết thúc
riêng. Ngã một lần ở tuổi bốn mươi còn đứng dậy được; ngã lần nữa sau khi đã mất năm năm
cấm vay và ba năm cấm cơ hội thì không.

---

## J. Cân bằng

| Chỉ số | v1.6 đo thật | Mục tiêu v1.7 |
|---|---|---|
| Tỉ lệ thắng, bot cân bằng, **cả ba nghề** | 91–94% | **45–55%** |
| Chênh lệch tỉ lệ thắng giữa ba nghề | 3 điểm (vỡ ra 34 điểm khi siết) | **≤ 10 điểm** |
| Tuổi thắng trung bình | 33–42 | **52–62** |
| Tỉ lệ ván thua vì hạnh phúc trong 15 năm đầu | 100% | **≤ 40%** |
| Phá sản, bot cân bằng | 0% | **8–18%** |
| Phá sản, bot đòn bẩy | 0% | **> 30%** |
| Chênh lệch giữa bốn xuất thân | ≤ 15 điểm | giữ **≤ 15 điểm** |
| Chênh lệch giữa năm bậc lương | ≤ 15 điểm | giữ **≤ 15 điểm** |
| Số ván sống trọn tới tuổi 100 | 0 | **> 30%** |

Dòng cuối là dòng quan trọng nhất và là dòng chưa từng đo được lần nào: mọi kết luận cân
bằng của v1.6 chỉ nói về chặng đầu đời. Nếu sau bản này vẫn không có ván nào sống tới
tuổi 100 thì mọi con số khác trong bảng đều vô nghĩa.

### Vòng hiệu chỉnh là bắt buộc

Các con số trong tài liệu này là **điểm xuất phát có căn cứ, không phải kết quả**. Bản
v1.6 đã cho thấy trực giác về đòn bẩy độ khó sai gần như hoàn toàn — cắt lợi suất ba lần
không đổi được tỉ lệ thắng, tăng biến cố làm game dễ đi. Vì vậy kế hoạch thực thi phải
có một pha hiệu chỉnh riêng: cài đủ A–I, đo, rồi vặn theo thứ tự ưu tiên đã biết:

1. **Tỉ lệ chi phí/lương** (mục A) — đòn bẩy mạnh nhất, tác động lên cả tốc độ tích luỹ
   lẫn khả năng mua hạnh phúc.
2. **Xác suất doanh nghiệp phá sản** (mục G.1) — đòn bẩy duy nhất tạo được ván thua vì
   lý do tài chính.
3. **Dải sinh lời doanh nghiệp** (mục D) — dời tuổi thắng.
4. **Ma trận khủng hoảng** (mục E) — dời cả hai, nhưng thô.

Không vặn `hanhPhucNguongThua`, `phatKhatVongMoiNam` hay giá thẻ tiêu dùng: cửa thua
hạnh phúc đã chiếm 100% số ván thua, siết thêm chỉ làm tăng đúng cái kiểu thua mà bản
này sinh ra để giảm.

### Rủi ro đã lường trước

**Ván không thắng nay chạy trọn tới tuổi 100 — 79 lượt bấm.** Đây là vấn đề nhịp độ chứ
không phải cân bằng, và bản này **không** giải nó. Nếu chơi thử thấy đuối, bản sau nên
có chế độ tua nhanh cho những năm không có quyết định nào để ra.

**Kỹ sư phần mềm có thể thành nghề dễ nhất chứ không phải khó nhất.** Đường cong dốc ở
mục B cho họ mười lăm năm thu nhập rất cao đúng vào quãng chưa có con — nếu họ kịp
chuyển hết thành doanh nghiệp trước tuổi 50 thì đoạn tăng trưởng âm không cắn được. Nếu
mô phỏng cho thấy vậy, hạ mức đỉnh (giảm 12% xuống 10% ở dải 21–30) chứ không làm đoạn
âm sâu thêm — trừng phạt người chơi ở tuổi 55 vì một lựa chọn ở tuổi 21 là thiết kế tồi.

**Bảo lãnh cho người thân có thể thành lựa chọn hiển nhiên sai.** Nếu 35% × cú nợ nặng
làm việc nhận bảo lãnh luôn luôn lỗ, không ai nhận và biến cố thành vô nghĩa. Cân bằng
bằng cách nâng khoản hạnh phúc khi nhận, không bằng cách hạ xác suất vỡ nợ — người chơi
cần cảm nhận được rủi ro là thật.

---

## K. Thay đổi kỹ thuật

### `types.ts`

```ts
export interface BacSuNghiep {
  /** áp dụng cho tới hết tuổi này */
  denTuoi: number
  /** tăng lương thực mỗi năm trong dải tuổi này */
  tangThuc: number
}

// Nghe thêm:
duongCongSuNghiep: BacSuNghiep[]

// TaiSan thêm:
/** thuế trên lợi tức nhận được; 0 nghĩa là miễn thuế */
thueLoiTuc: number

// DoanhNghiep thêm:
/** năm góp vốn, để tính bão hoà thu nhập theo tuổi doanh nghiệp */
namGop: number

// BienCoId thêm:
| 'baoLanhNguoiThan'

// SuKienLoai thêm:
| 'thueThuNhap' | 'doanhNghiepPhaSan' | 'baoLanh' | 'chamSocTuoiGia'
```

`GameState` thêm:

```ts
/** năm mà khoản bảo lãnh sẽ vỡ; -1 nghĩa là không có hoặc đã qua */
namVoBaoLanh: number
```

### `config.ts`

Khối mới: `thue` (biểu bậc, giảm trừ, thuế lợi tức từng kênh), `suNghiep` (không còn
`tangLuongThucMin/Max`), `doanhNghiep` (bão hoà, xác suất phá sản, hệ số theo thị
trường), `matBangSong` (chuẩn chi phí), `chamSocTuoiGia`.

`tuDoTaiChinh.heSoAnToan` đổi từ số thành hai tham số của hàm tuyến tính theo tuổi.

`luuKey` lên `dong-tien-luu-v1-7`; `dong-tien-luu-v1-6` vào danh sách dọn dẹp trong
`luu.ts`. Ván v1.6 thiếu `namVoBaoLanh` và `DoanhNghiep.namGop` nên `taiVan` trả `null`
— cùng cách các bản trước đã xử lý.

### `content.ts`

Ba nghề đổi `luong`, `chiPhi`, thêm `duongCongSuNghiep`. Bốn xuất thân đổi
`tyLeVonBanDau`. Năm tài sản thêm `thueLoiTuc`. Ba cơ hội nhỏ mới; toàn bộ cơ hội kinh
doanh đổi `thuNhapMoiNam` theo dải 12–18%.

### `engine.ts`

Hàm mới:

```ts
thueThuNhapCaNhan(luongNam, soNguoiPhuThuoc): Tien
tangLuongThucTheoTuoi(nghe, tuoi): number
heSoMatBangSong(s): number
heSoBaoHoaDoanhNghiep(s, d): number     // (1 − 0,03)^(nam − d.namGop)
xacSuatDoanhNghiepPhaSan(s, d): number
heSoAnToanTheoTuoi(tuoi): number
heSoChamSocTuoiGia(tuoi): number
```

Đổi:

- `dongTienThuDong` trừ thuế từng nguồn, và nhân hệ số bão hoà cho từng doanh nghiệp.
- `mucTieuTuDo` gọi `heSoAnToanTheoTuoi(tuoiTaiNam(s.nam))`.
- `giaThucTe` **không** đổi — hệ số mặt bằng sống áp riêng ở ba chỗ gọi (thẻ tiêu dùng,
  ước nguyện, phí chuyên gia) để không vô tình nhân vào giá tài sản và giá cơ hội.
- `tinhHeSoChiPhi` nhân thêm `1 + heSoChamSocTuoiGia(tuoi)`.
- `chuyenNam`: bước tính lương dùng `tangLuongThucTheoTuoi`; thêm bước rút phá sản doanh
  nghiệp; thêm bước khấu trừ thuế TNCN; thêm bước kiểm khoản bảo lãnh tới hạn.
- `ketThucNam`: thêm nhánh `soLanPhaSan >= 2 → 'thua'`.

### `sim.ts`

`CHIEN_LUOC_CAN_BANG` không đổi — nó phải giữ nguyên nghĩa "người chơi thận trọng" để so
sánh được với v1.6. Thêm quyết định bảo lãnh: bot cân bằng **nhận** (hạnh phúc là ràng
buộc thật với nó), bot đòn bẩy **nhận**.

### `balance.test.ts`

Viết lại theo bảng mục J. Thêm hai phép đo chưa từng có: tỉ lệ ván sống trọn tới tuổi
100, và phân loại lý do thua (hạnh phúc / phá sản lần hai / hết đời chưa tự do).

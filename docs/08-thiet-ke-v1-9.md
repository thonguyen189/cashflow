# Thiết kế bản v1.9 — Bộ bài phải với tới được

Ngày chốt: 13/08/2026. Bản này không khởi đi từ một chỉ tiêu cân bằng nào cả. Nó khởi đi
từ một câu báo lỗi của người chơi: **game gợi ý mua dàn karaoke giá bằng gần một phần ba
tổng số tiền mặt đang có, với nhân vật giáo viên xuất thân nghèo nhất.**

Đo lại đúng tổ hợp ấy thì câu báo lỗi không những đúng mà còn nhẹ hơn sự thật.

## Số đo mở đầu — góc người chơi báo lỗi

Tổ hợp 👨‍🏫 giáo viên + 🌾 nhà thuần nông + bậc lương 0,75, chạy trên bộ số v1.8:

| Khoản | Số tiền năm đầu |
|---|---|
| Lương | 67,5 triệu |
| Chi phí sinh hoạt | −64,2 triệu |
| Trả nợ học phí | −3,5 triệu |
| Bảo hiểm y tế | −1,4 triệu |
| **Thặng dư** | **âm 1,5 triệu** |

*(Mỗi dòng làm tròn tới một trăm nghìn nên cộng tay lệch chút ít so với số đo.)*

Âm — trước khi mua một điểm hạnh phúc nào. Vốn ban đầu của nhà thuần nông là 1,05 lần
lương, tức 70,9 triệu; trả xong chi phí năm thứ nhất còn **6,7 triệu** trong tay. Tấm thẻ
tiêu dùng đầu tiên game mời là **dàn karaoke, 22 triệu** — giá gốc 35 triệu nhân hệ số mặt
bằng sống 0,63.

Mô phỏng 120 ván bằng bot cân bằng trên đúng tổ hợp này: **thắng 0,0%, thua vì hạnh phúc
100%.** Không phải khó — là không có đường nào.

---

## Vì sao cần: ba lớp nguyên nhân

Một con số hỏng thì vặn con số. Đây là ba cơ chế cùng đẩy về một hướng, nên phải kể cả ba.

### 1. Bộ bài có một tầng thẻ bẫy

Trong 39 thẻ tiêu dùng của bản trước, **10 thẻ đắt hơn 2 triệu đồng mỗi điểm hạnh phúc**.
Ba tấm tệ nhất:

| Thẻ | Giá cũ | Điểm | Triệu đồng mỗi điểm |
|---|---|---|---|
| 🚁 Drone quay phim | 30 triệu | 4 | **7,50** |
| 🎤 Dàn karaoke tại nhà | 35 triệu | 6 | **5,83** |
| ⌚ Đồng hồ hàng hiệu | 45 triệu | 10 | **4,50** |

Thẻ rẻ nhất của bộ bài là 0,17. Chênh **45 lần**, và chú thích cũ trong `content.ts` coi
khoảng chênh đó là ưu điểm: chênh càng rộng thì mỗi tấm thẻ càng là một quyết định thật.
Điều ấy chỉ đúng với người chơi **với tới được cả hai đầu**. Với nhân vật thu nhập thấp,
nửa đắt của bộ bài không phải quyết định — nó là một khoản phạt đến hẹn lại lên.

### 2. Từ chối luôn mất đúng số điểm ghi trên thẻ, bất kể giá

Đây là chỗ biến "thẻ đắt" thành "thẻ bẫy". Vì hình phạt từ chối chỉ nhìn cột điểm mà không
nhìn cột giá, một tấm thẻ **đắt mà ít điểm bị thống trị hoàn toàn**: người nghèo không bao
giờ với tới phần thưởng nhưng luôn ăn trọn hình phạt. Nó không phải một lựa chọn tồi, nó
không phải một lựa chọn.

### 3. Hệ số mặt bằng sống neo vào một thước đo sai

`heSoMatBangSong` chia `chiPhiHangNam` cho một mức chuẩn — tức là neo giá hạnh phúc vào
**chi phí sinh hoạt**. Nhưng chi phí sinh hoạt giữa nhân vật nghèo nhất và giàu nhất chỉ
chênh **2,7 lần**, trong khi khoản dư ra sau khi trả hết nghĩa vụ chênh từ **âm tới ba mươi
mấy triệu**.

**Chi phí sinh hoạt là thước đo LỐI SỐNG, không phải thước đo KHẢ NĂNG CHI TRẢ.** Hai đại
lượng ấy trải rộng khác nhau một trời một vực, nên một hệ số dựng trên đại lượng thứ nhất
không bao giờ đỡ nổi đầu nghèo của thang. Mục F của v1.7 dựng `heSoMatBangSong` để cửa thua
hạnh phúc siết đều cả ba nghề, và nó làm đúng việc ấy; cái nó không làm được — và không thể
làm được — là canh theo túi tiền.

### Vì sao bộ test cũ không bắt được

Bộ test cân bằng trước bản này đo **xuất thân riêng** (luôn ở bậc lương 1) và **bậc lương
riêng** (luôn ở 🏘️ viên chức tỉnh lẻ), mà cả hai bài lại chỉ chạy trên 👩‍⚕️ bác sĩ — nghề dư
dả nhất trong ba nghề.

**Góc xấu nhất gặp xấu nhất chưa từng bị soi một lần nào.** Ở bộ số cũ, bảng thặng dư năm
đầu của giáo viên có **tám ô âm trên hai mươi ô**, và không bài test nào đứng ở chỗ nhìn
thấy chúng. Đây là bài học đắt nhất của bản này: quét từng chiều một thì không bao giờ thấy
được cái góc mà mọi chiều cùng xấu.

---

## A. Trần giá trị: ba triệu đồng mỗi điểm hạnh phúc

Cả bộ bài nay chịu một trần cứng: **không tấm thẻ nào được đắt hơn 3,00 triệu đồng mỗi điểm
hạnh phúc.** Ba tấm vượt trần bị hạ giá:

| Thẻ | Giá cũ | Giá mới | Điểm | Tỉ lệ cũ → mới |
|---|---|---|---|---|
| ⌚ Đồng hồ hàng hiệu | 45 triệu | **30 triệu** | 10 | 4,50 → 3,00 |
| 🎤 Dàn karaoke tại nhà | 35 triệu | **18 triệu** | 6 | 5,83 → 3,00 |
| 🚁 Drone quay phim | 30 triệu | **12 triệu** | 4 | 7,50 → 3,00 |

**Sửa bằng cách HẠ GIÁ chứ không phải nâng điểm.** Nâng điểm cũng kéo tỉ lệ về đúng 3,00,
nhưng nó làm khoản phạt từ chối nặng thêm — tức đổ dầu vào đúng chỗ đang cháy, theo lớp
nguyên nhân thứ hai ở trên.

Ba mức giá mới cũng **sát thực tế Việt Nam năm 2026 hơn mức cũ**: một chiếc drone tiêu dùng
tử tế quanh mười hai triệu, một dàn karaoke gia đình quanh mười tám triệu. Bộ số cũ không
chỉ mất cân bằng, nó còn sai.

Dải đồng trên điểm nay là **0,17 tới 3,00** — vẫn chênh mười tám lần, vẫn thừa để mỗi tấm
thẻ là một quyết định thật. Và ý nghĩa của tỉ lệ ấy chính là bài học của cả cơ chế: quan hệ,
sức khoẻ, trải nghiệm nằm ở đầu rẻ; đồ vật và sĩ diện nằm ở đầu đắt. **Mua vui bằng đồ đạc
là cách đắt nhất để vui.**

---

## B. Bộ bài mở khoá dần theo khả năng chi tiêu

Trần giá trị chữa cái tệ nhất của bộ bài nhưng không chữa được cái gốc: một tấm thẻ 30 triệu
với người dư ra 40 triệu mỗi năm là một quyết định khó, còn với người dư ra âm 1,5 triệu thì
vẫn là một khoản phạt. Nên bộ bài phải biết nó đang mời ai.

`engine.ts` thêm hàm `khaNangChiTieu`:

```
khả năng chi tiêu = lương + thu nhập bạn đời + dòng tiền thụ động − nghĩa vụ hàng năm
```

Và `tranGiaTheGoc` dựng trần giá của năm nay từ đó:

```
trần = max( 4 × khả năng chi tiêu , 0,05 × chi phí sinh hoạt )
```

`rutThe` bỏ qua mọi tấm thẻ có giá vượt trần. Trần được quy về **mặt bằng giá gốc** của
bảng nội dung để so thẳng với cột `gia` trong `THE_TIEU_DUNG`: giá thật của một tấm thẻ là
`gia × chiSoGia × heSoMatBangSong`, mà `heSoMatBangSong` lại chia cho `chiSoGia`, nên chỉ số
giá triệt tiêu và phép lọc không cần biết gì về lạm phát.

Bộ lọc này phải chặn thẻ **bất khả thi**, không phải thẻ **đắt**. Một tấm ngốn trọn khoản dư
của cả năm là một quyết định khó — đúng thứ game cần. Một tấm ngốn bốn năm dư thì không còn
là quyết định nữa. Vì sao là bốn lần chứ không phải một hay sáu: xem bảng quét ở mục F.

### Vế sàn là lan can, không phải cần gạt

Quét vế sàn từ 0,03 tới 0,2 cho ra **các ô giống hệt nhau tới từng chữ số** — vì `4 × khả
năng chi tiêu` luôn lớn hơn vế này ở mọi nhân vật lúc vào đời. **Nó không cắn ở bộ số hiện
tại.** Ghi rõ ở đây để bản sau đừng tưởng đây là một cần gạt độ khó và đem ra vặn.

Cái nó chặn là một chế độ hỏng chết người. **Khả năng chi tiêu có thể ÂM** — mất việc, về
hưu mà chi phí chăm sóc tuổi già leo, hoặc ôm một khoản bảo lãnh vừa vỡ — mà số âm nhân 4
vẫn âm. Chỉ có vế trần thì bộ bài **rỗng** đúng vào năm bi đát nhất: không thẻ nào để nhận,
tức cắt luôn đường hồi phục hạnh phúc, hỏng theo đúng chiều ngược lại với chính cái lỗi mà
cả cơ chế này sinh ra để chữa.

---

## C. Bộ bài từ 39 lên 122 thẻ, thêm hai chặng đời

Đây **không phải trang trí**, mà là hệ quả bắt buộc của mục B: bộ lọc cắt bớt số thẻ hợp lệ
mỗi năm, nên bộ bài mỏng cộng bộ lọc chặt thì người nghèo năm nào cũng gặp lại đúng mấy tấm
cũ. Bộ bài phải dày lên đúng bằng phần mà bộ lọc lấy đi.

`GiaiDoanThe` thêm hai chặng, cả hai bám vào cột mốc cốt truyện đã có sẵn nên không sinh
thêm trạng thái nào:

| Chặng | Điều kiện | Ví dụ |
|---|---|---|
| `docThan` | chưa kết hôn | 🍻 nhậu lẩu với hội bạn thân · 🏍️ phượt xe máy vòng Tây Bắc · 🧭 đi bụi châu Âu một tháng |
| `ongBa` | đã có một người con tròn tuổi sinh cháu | 🧧 lì xì cháu ngày mùng một Tết · 👶 trông cháu giúp con suốt mùa hè · 🏘️ góp tiền cho con mua nhà |

`docThan` và `giaDinh` loại trừ nhau; `ongBa` chồng lên `giaDinh` và `tuoiGia`. Điều kiện có
cháu dùng **đúng** điều kiện sinh ra sự kiện `lenChucOngBa` trong `chuyenNam`, để hai chỗ
không kể lệch nhau một năm nào.

Hệ quả kể chuyện, đáng ghi riêng: trước bản này, quãng đời độc thân — quãng mà phần lớn
người chơi thật đang sống — là quãng bộ bài trống trải nhất, vì thẻ `giaDinh` và `conCai`
đều chưa mở còn thẻ chung thì mỏng.

---

## D. Hai hệ số lối sống

### `loiSongTheoLuong` từ 0,6 lên 0,85

Hệ số này nói: lệch một phần lương thì chi phí sinh hoạt lệch ngần này phần.

Con số cũ 0,6 nói rằng hạ lương một phần tư chỉ hạ chi phí sống được mười lăm phần trăm —
nghĩa là **bậc lương THẤP mới là cái bẫy chứ không phải bậc lương cao**, ngược hẳn ý định
của cả cơ chế bậc lương (bậc cao đổi tiền lấy áp lực công việc, tức lấy hạnh phúc). Đo thật
ở 0,6: tám ô âm trên hai mươi ô của giáo viên, và tổ hợp mở đầu tài liệu này ra âm 1,5 triệu
mỗi năm.

**Vì sao 0,85 chứ không phải 1,0.** Để 1,0 thì tỉ lệ tiết kiệm bằng nhau ở cả năm bậc lương
và việc chọn bậc lương mất hết sức nặng về tiền, chỉ còn là chọn điểm hạnh phúc. 0,85 giữ
cho lương cao vẫn dư ra nhiều hơn thật sự — chỉ thôi là lương thấp thì âm.

### `khaGia.heSoChiPhiSong` từ 1,25 xuống 1,15

Không phải vì 🏛️ nhà có của ăn của để quá khó — một mình nó vẫn cân đúng — mà vì nó **nhân
chồng** với `loiSongTheoLuong` vừa nâng ở trên. Hai con số gặp nhau ở góc trên bên phải của
bảng: kỹ sư phần mềm nhà khá giả chọn bậc lương cao nhất chịu hệ số
**1,25 × 1,2125 = 1,52**, tức chi phí 185 triệu trên đồng lương 180 triệu.

Vừa chữa xong một góc bất khả thi thì mở ra một góc bất khả thi khác — đúng cái lỗi đang
phải chữa. Số đo ở mục F.

---

## E. Bộ lọc đọc nhầm năm — lỗi phát hiện sau khi cài đặt

Bản đầu của bộ lọc ở mục B rút bài bằng khả năng chi tiêu của năm **vừa khép lại**, vì
trạng thái năm mới khi ấy được dựng **sau** chỗ rút bài trong `chuyenNam`. Phần lớn các năm
thì hai con số ấy sát nhau nên không ai thấy gì. Nó hở đúng ở những năm có **cột mốc đời**
rơi vào giữa hai thời điểm:

| Cột mốc | Việc nó làm với túi tiền |
|---|---|
| 💍 Cưới | chi phí sinh hoạt đội thêm 20% |
| 👶 Sinh con | thêm 25% mỗi cháu |
| 🎣 Nghỉ hưu | lương cắt còn 45% |

Đo trên **1628 lượt thẻ** của tám ván nghèo nhất: **12 lượt vượt ngưỡng**, rơi vào **7 năm
trên tổng 360**, và **không lượt nào nằm ngoài một năm có cột mốc mới**. Ca tệ nhất là thẻ
🌏 "Đưa cả nhà đi Singapore mười ngày", giá thực **189,1 triệu**, mời vào **năm cưới**,
trong khi ngưỡng của năm ấy chỉ **12,1 triệu** và khả năng chi tiêu đang **âm 4,6 triệu** —
vượt **15,7 lần**.

Điểm đáng nói không phải con số 12 trên 1628, mà là chỗ nó rơi vào: **những năm đáng nhớ
nhất của một ván chơi.** Năm cưới, năm sinh con, năm nghỉ hưu. Một lỗi chỉ xuất hiện ở đúng
những năm ấy là lỗi mà **người chơi chắc chắn gặp nếu chơi đủ lâu**, và gặp đúng lúc đang
chú ý nhất — nghĩa là tần suất thấp không hề làm nó nhẹ đi.

**Cách vá.** `chuyenNam` nay dựng trọn `trangThaiNamMoi` ở bước 14, **trước** khi rút bài ở
bước 15, nên bộ lọc đọc đúng túi tiền của năm sắp sống chứ không phải năm vừa qua.

Dựng **cả** trạng thái chứ không chắp vá vài trường, và đây là chỗ đáng ghi lại:
`khaNangChiTieu` gọi tiếp `dongTienThuDong` và `nghiaVuHangNam`, hai hàm ấy đọc tổng cộng
**tám trường**. Một danh sách chép tay tám trường sẽ mục lặng lẽ ngay lần đầu có ai thêm một
nguồn thu nhập thụ động mới — mục theo đúng kiểu không bài test nào đỏ.

**Thứ tự tiêu thụ số ngẫu nhiên không đổi**, nên các số đo trước và sau bản vá vẫn so sánh
được với nhau.

---

## F. Số đo

Mọi con số dưới đây **tất định**: `moPhongNhieuVan` sinh seed theo công thức cố định nên
cùng một bộ tham số luôn cho đúng cùng một dãy kết quả. "Góc xấu nhất" là tổ hợp mà người
chơi báo lỗi: 👨‍🏫 giáo viên + 🌾 nhà thuần nông + bậc lương 0,75.

### Tách từng đòn bẩy

n = 200. Thiết lập mặc định là 🏘️ viên chức tỉnh lẻ, bậc lương 1,0. Mốc "gốc" đã gồm việc hạ
giá ba tấm thẻ ở mục A.

| Cấu hình | Giáo viên | Bác sĩ | Kỹ sư phần mềm | Góc xấu nhất |
|---|---|---|---|---|
| Gốc (đã hạ giá ba thẻ) | 28,0% | 61,5% | 57,0% | **0,0%** |
| + bộ bài mới | 21,5% | 52,0% | 43,0% | **0,0%** |
| + bộ lọc (trên bộ bài cũ) | 33,0% | 79,0% | 57,5% | 5,5% |
| + `loiSongTheoLuong` 0,85 | 28,0% | 61,5% | 57,0% | 1,0% |
| **Bộ bài mới + bộ lọc** | **48,0%** | **70,5%** | **60,0%** | **2,0%** |

**Bảng này được đo TRƯỚC bản vá cột mốc ở mục E**, nên các ô của nó không khớp với hai bảng
dưới. Giữ nguyên chứ không đo lại, vì ba kết luận rút ra từ nó là **kết luận cấu trúc** —
đòn nào tác động lên chiều nào — chứ không phải những con số được đem đi chốt ngưỡng.

Ba điều đọc ra từ bảng này, và cả ba đều ngược trực giác:

**`loiSongTheoLuong` không đụng gì tới nhân vật mặc định.** Ba cột đầu giống hệt dòng gốc
tới từng chữ số, vì ở bậc lương 1,0 thì `(1 − 1) × 0,85` bằng không — số này triệt tiêu.
Nó chỉ nâng góc xấu nhất, và đó chính xác là việc nó được đặt vào để làm.

**Bộ bài mới một mình làm game KHÓ hơn**, cả ba nghề cùng tụt. Thêm 83 tấm thẻ nghĩa là mỗi
năm bị mời nhiều lựa chọn hơn ở những chặng đời trước đây trống trải, mà mỗi lựa chọn đều có
giá — nhận thì mất tiền, từ chối thì mất điểm. Dày bộ bài là một đòn bẩy độ khó, không phải
một khoản trang trí trung tính.

**Bộ lọc là đòn nới tay mạnh nhất**, và là đòn duy nhất kéo được góc xấu nhất ra khỏi con số
không.

### Quét trần bộ lọc

n = 250, quét `tranTheoKhaNangChiTieu` trên bộ bài mới, **sau bản vá cột mốc**:

| Trần | Giáo viên | Bác sĩ | Kỹ sư phần mềm | Góc xấu nhất |
|---|---|---|---|---|
| 1 | 40,0% | **69,6%** | 55,6% | 11,6% |
| 2 | 33,6% | 57,2% | 50,0% | 4,8% |
| 3 | 24,4% | 53,6% | 52,0% | 6,8% |
| **4** | **24,0%** | **50,8%** | **48,4%** | **5,2%** ← đang cài |
| 6 | 22,0% | 50,8% | 44,8% | 3,6% |
| tắt hẳn | 22,0% | 50,8% | 44,8% | 2,4% |

**Trần 1 nới tay tới mức hỏng.** Bác sĩ đầu ván chỉ dư 15,6 triệu, nên trần 1 cắt sạch nửa
đắt của bộ bài khỏi tay **cả người giàu** và đẩy nghề ấy lên 69,6%. Một bộ lọc dựng ra để đỡ
người nghèo mà lại tặng quà cho người giàu là một bộ lọc đặt sai ngưỡng.

**Mức 3 nhìn qua có vẻ hơn mức 4** vì góc xấu nhất ra 6,8% thay vì 5,2%. Nhưng nó đẩy bác sĩ
lên 53,6% — sát trần 57% của dải đã đo — nên không còn chỗ xoay cho những vòng hiệu chỉnh
sau. Chọn mức 4 là chọn giữ lại biên độ ấy.

**Từ mức 6 trở lên bộ lọc thôi cắn** — mức 6 và mức tắt hẳn ra đúng cùng một bộ số ở ba
nghề. Mức 4 là mức giữ được cả ba nghề trong dải đã đo của bản trước mà vẫn kéo góc xấu nhất
ra khỏi 0%.

### Chốt hệ số chi phí sống của nhà khá giả

n = 250, đo ở các ô yếu nhất của cả lưới ba nghề × bốn xuất thân × năm bậc lương:

| Ô | `khaGia` 1,25 | `khaGia` 1,15 |
|---|---|---|
| 👨‍💻 Kỹ sư phần mềm · 🏛️ khá giả · bậc 1,25 | 0,8% | **6,4%** |
| 👩‍⚕️ Bác sĩ · 🏛️ khá giả · bậc 1,25 | 5,6% | **20,8%** |
| 👨‍🏫 Giáo viên · 🏛️ khá giả · bậc 1,25 | 16,8% | **52,8%** |

Ba nghề ở thiết lập mặc định **không đổi một phần mười điểm nào** — chúng đo ở viên chức
tỉnh lẻ nên hệ số này không chạm tới. Đây là một cần gạt chỉ tác động lên đúng cái góc nó
cần tác động, thứ hiếm gặp trong bảy vòng cân bằng đã qua.

**Ô yếu nhất của cả lưới DỜI CHỖ chứ không chỉ đổi số:** từ **0,8%** ở 👨‍💻 kỹ sư phần mềm ·
🏛️ nhà khá giả · bậc 1,25, sang **3,2%** ở 👨‍💻 kỹ sư phần mềm · 🏢 buôn bán ngoài phố · bậc
1,25. Đó là dấu hiệu tốt nhất có thể mong ở một cần gạt: nó không đẩy con số của một ô lên,
nó gỡ hẳn ô ấy khỏi vị trí đáy bảng.

### Cần gạt đã thử và đã loại

**Hạ `apLucTheoLuong` từ 20 xuống 14.** Nó nâng được ô yếu nhất cả bảng lên 4,4% — nghe như
một lời giải. Nhưng nó **dìm chính góc mà người chơi báo lỗi**: giáo viên nhà thuần nông bậc
lương thấp nhất từ 5,2% xuống 4,4%. Lý do rất sạch: khoản trừ hạnh phúc theo bậc lương là
`(hệ số lương − 1) × apLucTheoLuong`, mà hệ số lương thấp hơn 1 thì tích ấy **dương** — bậc
lương thấp đang được *thưởng* hạnh phúc, và hạ hệ số là cắt phần thưởng đó.

Một cần gạt cứu góc này bằng cách móc túi góc kia thì không phải lời giải. Bỏ.

---

## G. Kết quả cuối, và những chỗ chưa đạt

Ba nghề ở thiết lập mặc định (🏘️ viên chức tỉnh lẻ, bậc lương 1,0), đo bằng chính bộ test
cân bằng, n = 200, trên bộ số cuối cùng và sau bản vá cột mốc:

| Nghề | v1.9 | Dải đã đo của bản trước |
|---|---|---|
| 👨‍🏫 Giáo viên | **23,0%** | 20–36% ✅ |
| 👩‍⚕️ Bác sĩ | **52,0%** | 41–57% ✅ |
| 👨‍💻 Kỹ sư phần mềm | **50,0%** | 43–59% ✅ |

Cả ba **nằm gọn trong đúng dải đã đo của bản trước** — không một ngưỡng nào bị nới ra cho
vừa. Đây là điều kiện tự đặt cho cả vòng này: sửa một góc hỏng mà phải nới ngưỡng của phần
còn lại thì không phải sửa, chỉ là dời chỗ hỏng.

**Góc người chơi báo lỗi: từ 0,0% lên 5,2%.**

### Những chỗ chưa đạt

Đây là phần quan trọng nhất của tài liệu này.

**Ô yếu nhất cả bảng vẫn là 3,2%** — 👨‍💻 kỹ sư phần mềm · 🏢 buôn bán ngoài phố · bậc lương
1,25. Không còn ô nào bằng 0, nhưng 3,2% vẫn là rất khó. Có một điểm khiến nó khác hẳn góc
nghèo, và điểm ấy là lý do bản này dừng ở đây: **đây là góc "bậc lương cao trên một nghề đã
có đường sự nghiệp dốc sẵn", và người chơi CHỌN nó khi tạo nhân vật chứ không bị ném vào.**
Chọn cả hai thứ dốc nhất rồi thấy khó là một trải nghiệm khác hẳn với việc chọn giáo viên
nhà nghèo rồi phát hiện ra mình chưa bao giờ có cửa. Vẫn phải chữa, nhưng không phải cùng
một loại lỗi.

**Hình dạng độ khó của kỹ sư phần mềm ngược hẳn giáo viên.** Giáo viên yếu ở bậc lương
**thấp**; kỹ sư phần mềm yếu ở bậc lương **cao**. Chưa rõ đây là một đặc điểm — đường sự
nghiệp dốc cộng bậc lương cao thì chi phí sống đội lên sớm trong khi đoạn tăng trưởng âm sau
tuổi 50 vẫn chờ sẵn — hay là một lỗi của phép nhân chồng hai hệ số lối sống. **Cần một vòng
đo riêng**, và vòng ấy phải quét cả lưới chứ không quét từng chiều, đúng bài học ở đầu tài
liệu này.

**Hai bài kiểm thử cân bằng phải nâng mẫu, và cả hai vì cùng một lý do: chúng đang đo những
sự kiện một phần nghìn.**

- **Ván sống trọn đời** từ 1 trên 200 ván ở bản trước xuống còn khoảng **1 trên 1500**. Quét
  theo cỡ mẫu trên giáo viên: n=200 thấy ván già nhất 69 năm, n=400 ra 72, n=1200 ra 78,
  phải tới **n=6000 mới thấy 80 năm** — và chỉ bốn ván.
- **Vỡ nợ** từ một phần nghìn xuống **2 ván trên 5000**.

Nguyên nhân là một và giống nhau ở cả hai: v1.9 gỡ đúng tầng thẻ mà người nghèo không với
tới, nên những ván lê lết ở đáy nay **hoặc gượng lại được, hoặc thua dứt khoát** — ít ván
trôi vô định hơn. Đó là một kết quả tốt về mặt thiết kế và là một vấn đề về mặt đo đạc: hai
bài ấy nay chỉ còn đỏ được khi chạy mẫu lớn, mà mẫu lớn thì chậm. Cách chữa là **nâng mẫu,
không phải nới phép so** — một phép so nới ra sẽ xanh kể cả khi cơ chế bị gỡ hẳn khỏi engine.

---

## H. Thay đổi kỹ thuật

- `types.ts` — `GiaiDoanThe` thêm `'docThan'` và `'ongBa'`.
- `engine.ts` — thêm `khaNangChiTieu(s)` và `tranGiaTheGoc(khaNang, chiPhiHangNam)`;
  `BoiCanhRutThe` thêm `tranGiaGoc`; `rutThe` lọc theo trần và xử hai chặng đời mới.
  `taoGameMoi` dựng lại trần bằng tay cho năm thứ nhất vì lúc đó `GameState` chưa xong —
  cùng lý do với `tinhHeSoChiPhi` và `nghiaVuNamDau`. `chuyenNam` đổi thứ tự: dựng trọn
  `trangThaiNamMoi` ở bước 14 rồi mới rút bài ở bước 15 (mục E).
- `config.ts` — khối mới `theTieuDung` (`tranTheoKhaNangChiTieu: 4`, `sanTheoChiPhi: 0,05`);
  `xuatThan.loiSongTheoLuong` 0,6 → 0,85.
- `content.ts` — ba thẻ hạ giá; bộ bài 39 → 122 tấm; `khaGia.heSoChiPhiSong` 1,25 → 1,15.
- `balance.test.ts` — bài xuất thân và bài bậc lương gộp thành **một phép quét cả lưới ba
  nghề × bốn xuất thân × năm bậc lương**. Đây là thay đổi test quan trọng nhất của bản này:
  nó là thứ duy nhất khiến lỗi kiểu này không lọt được lần nữa.

---

## I. Để lại cho bản sau

1. **Vòng đo riêng cho hình dạng độ khó theo bậc lương của từng nghề** — xem mục G. Câu hỏi
   phải trả lời: hai hệ số lối sống nhân chồng nhau có đúng là cách nên ghép không, hay
   chúng nên cộng.
2. **Ô yếu nhất cả bảng 3,2%.** Chưa có cần gạt nào nâng được nó mà không dìm chỗ khác;
   `apLucTheoLuong` đã thử và đã loại ở mục F.
3. **Nâng mẫu cho hai bài đo sự kiện hiếm** — ván sống trọn đời và vỡ nợ, xem mục G. Đây là
   việc phải làm ngay ở bản sau, vì hai bài ấy hiện gần như không còn khả năng bắt hồi quy.
4. **Trần ba triệu đồng mỗi điểm hạnh phúc chưa được test khoá lại.** Hiện nó là một quy
   ước ghi trong chú thích của `THE_TIEU_DUNG`; thêm 83 tấm thẻ mà không có bài test đếm
   lại tỉ lệ thì tấm thứ 123 sẽ lặng lẽ phá trần.
5. **Bộ lọc chưa hiện ra giao diện.** Người chơi không biết vì sao năm nay mình chỉ được mời
   thẻ rẻ. Im lặng thì đúng cân bằng nhưng mất một câu chuyện đáng kể — "năm nay bạn chưa
   với tới những thứ ấy" là một điều đáng nói thẳng.

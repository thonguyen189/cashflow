# Thiết kế bản v1.6 — Đời thật hơn

Ngày chốt: 10/08/2026. Bản này kéo game lại gần đời thật ở bốn chỗ mà bản v1.5 còn
xa: điểm xuất phát của mỗi người mỗi khác, thị trường đi theo chu kỳ chứ không phải
tung xúc xắc rời rạc, đời người có những cú ngã lớn, và cơ hội làm ăn phải lớn lên
cùng túi tiền.

## Vì sao cần

**1. Ai cũng xuất phát y hệt nhau.** [`taoGameMoi`](../src/game/engine.ts#L543) đặt
`tienMat = nghe.luong` và lương lấy đúng con số trong bảng nghề. Ngoài đời, hai người
cùng làm giáo viên có thể chênh nhau cả một gia tài ở vạch xuất phát — người được bố
mẹ cho vốn, người ra trường với khoản nợ học phí và mỗi tháng còn gửi tiền về quê.
Đó là biến số lớn nhất của đời thật mà game đang bỏ trắng.

**2. Không bao giờ có năm mọi thứ cùng đỏ.** Mỗi kênh rút biến động độc lập ở
[`engine.ts:751`](../src/game/engine.ts#L751), nên danh mục dàn đều luôn êm ru và
"đa dạng hoá" chỉ là câu khẩu hiệu chứ không phải quyết định. Khủng hoảng thật thì
cổ phiếu, bất động sản và tiền mã hoá cùng rơi một lượt, doanh nghiệp hụt thu, lạm
phát vọt lên — và chỉ vàng với trái phiếu còn đứng vững. Không mô phỏng được cú đó
thì game không dạy được vì sao phải chia trứng ra nhiều giỏ.

**3. Không có cú ngã nào đủ lớn.** Sự kiện ngẫu nhiên hiện tại — ốm đau, sự cố, va
chạm — đều ở mức vài chục phần trăm chi phí một năm. Chúng là gợn sóng. Đời người
thì có sóng lớn: bệnh hiểm nghèo, mất việc giữa suy thoái, bố mẹ ngã bệnh, vỡ hụi,
doanh nghiệp đóng cửa. Những cú đó mới là thứ phân loại người có chuẩn bị và người
không.

**4. Cơ hội teo dần theo thời gian.** Giá cơ hội chỉ nhân chỉ số giá
([`engine.ts:1616`](../src/game/engine.ts#L1616)), cơ hội đắt nhất là 2 tỷ. Khi tài
sản đã lên vài chục tỷ, mọi lời mời góp vốn đều thành tiền lẻ — người chơi bấm nhận
mà không phải nghĩ, và nửa sau ván chơi mất hết sức nặng. Ngoài đời thì ngược lại:
càng nhiều vốn càng được mời vào những thương vụ lớn hơn, và cũng càng dễ mất nhiều
hơn trong một lần.

Bốn phần dưới đây gắn với nhau: chu kỳ kinh tế tạo ra hoàn cảnh, biến cố lớn giáng
đòn, quy mô góp vốn cho phép người chơi tự chọn mức phơi nhiễm, và phá sản là cái giá
khi ba thứ trên gặp nhau lúc bạn đang vay nợ.

---

## A. Xuất thân và lương khởi điểm

Màn chọn nghề thành hai bước: chọn nghề, rồi chọn xuất thân và bậc lương.

### Bốn xuất thân

Xuất thân quyết định **vốn ban đầu** và một **gánh nặng đi theo suốt đời**. Vốn tính
theo tỉ lệ với lương khởi điểm chứ không phải số tiền tuyệt đối, để cả ba nghề đều
cân nhau.

| Xuất thân | Vốn ban đầu | Nợ ban đầu | Chi phí sống | Gánh nặng khác |
|---|---|---|---|---|
| 🌾 Nhà thuần nông | 0,85 × lương | 0,4 × lương, vay 10 năm | ×0,92 | Gửi về quê 8% chi phí mỗi năm tới tuổi 55. Hạnh phúc khởi điểm +5 |
| 🏘️ Viên chức tỉnh lẻ | 1,0 × lương | không | ×1,00 | không |
| 🏢 Buôn bán ngoài phố | 2,0 × lương | không | ×1,10 | không |
| 🏛️ Nhà có của ăn của để | 3,5 × lương | không | ×1,25 | không |

Đánh đổi chạy đều một chiều: **vốn càng nhiều thì chi phí sống càng cao, và vì
`nghiaVuHangNam` lấy chi phí sinh hoạt làm thành phần chính, cái đích tự do tài chính
cũng lùi xa theo.** Nhà khá giả đi trước một quãng nhưng phải chạy đường dài hơn. Đó
đúng là điều xảy ra ngoài đời: nếp sống hình thành từ nhỏ rất khó hạ xuống, và người
sống sang cần nhiều tiền hơn mới gọi là đủ.

Nhà thuần nông là trường hợp đáng chú ý nhất. Trong những năm còn phụng dưỡng, hai hệ
số triệt tiêu nhau gần hết (`0,92 × 1,08 ≈ 0,99`) — nghĩa là gánh nặng rơi đúng vào
quãng đời cần vốn nhất, rồi biến mất sau tuổi 55 và để lại lợi thế chi phí thấp cho
phần đời còn lại. Ngoài đời cũng thế: người xuất thân khó khăn bị níu ở đoạn đầu,
nhưng thói quen tằn tiện là tài sản của đoạn sau.

Khoản nợ học phí là một `KhoanVay` bình thường, nên nó chiếm chỗ trong hạn mức vay
(`tyLeThanhToanToiDa` = 65% lương, xem mục F) và đội `nghiaVuHangNam` trong mười năm
đầu — cũng lại đúng như đời thật.

**Vì sao vốn ban đầu không thể xuống quá thấp.** Đây không phải một lựa chọn thiết
kế tự do — nó là ràng buộc của chính cỗ máy mô phỏng. Mỗi năm, chi phí sinh hoạt bị
trừ thẳng từ tiền mặt đang có ở ĐẦU năm, còn lương chỉ được cộng vào ở CUỐI năm (xem
`chuyenNam` trong `engine.ts`). Nghĩa là năm đầu tiên phải sống trọn vẹn bằng vốn
ban đầu — lương năm 1 chưa kịp về túi. Nếu vốn ban đầu thấp hơn chi phí sinh hoạt
năm đầu của bất kỳ nghề nào, nhân vật thua ngay trong năm 1 gần như chắc chắn: tiền
mặt âm khiến mọi thẻ tiêu dùng bị buộc từ chối, hạnh phúc rơi tự do xuống dưới ngưỡng
thua chỉ trong một năm — bất kể người chơi giỏi hay dở, bất kể may rủi con bài. Đó là
một khởi đầu KHÔNG THỂ vượt qua bằng lối chơi khôn ngoan, chứ không phải một khởi đầu
khó khăn thông thường. Vì vậy `tyLeVonBanDau` của mọi xuất thân phải vượt tỉ lệ chi
phí/lương của nghề khắt khe nhất (kỹ sư phần mềm: `435/600 × 0,92 ≈ 0,667`), cộng
thêm đệm cho khoản trả nợ học phí và các sự kiện phát sinh sớm — đó là lý do vốn của
nhà thuần nông dừng ở 0,85 chứ không xuống thấp hơn.

### Bậc lương khởi điểm

Năm bậc: **0,75 · 0,875 · 1,0 · 1,125 · 1,25** nhân với lương gốc của nghề. Bậc rời
rạc thay vì thanh trượt liên tục để người chơi đọc được ngay mình đang đánh đổi cái
gì, và để bảng cân bằng kiểm được từng bậc.

Chọn lương cao hơn kéo theo hai hệ quả:

- **Chi phí sinh hoạt lệch theo 0,6 lần mức lệch lương.** Lương +25% thì chi phí +15%.
  Việc lương cao thường đi kèm thành phố đắt đỏ và mức sống cao hơn.
- **Áp lực công việc trừ hạnh phúc mỗi năm**, bằng `(hệ số lương − 1) × 20` điểm, chỉ
  tính khi còn đi làm. Bậc cao nhất mất 5 điểm mỗi năm; bậc thấp nhất được cộng 5.

Vế thứ hai mới là vế quyết định. Nếu chỉ có tiền thì lương cao luôn thắng — lương lớn
hơn chi phí nên nhân cùng một tỉ lệ vẫn ra thặng dư lớn hơn. Trừ 5 điểm hạnh phúc mỗi
năm thì khác: nó bằng đúng khoản phạt khát vọng, và hạnh phúc lại là điều kiện thua
duy nhất. Người chọn bậc lương cao nhất đang đổi tiền lấy tuổi thọ của ván chơi, và
sẽ phải mua ước nguyện sớm hoặc gọi chuyên gia tâm lý để bù lại. Người chọn bậc thấp
nhất sống thong thả, tích luỹ chậm, nhưng gần như miễn nhiễm với điều kiện thua.

Áp lực tắt hẳn sau khi nghỉ hưu.

---

## B. Chu kỳ kinh tế

Thị trường có bốn trạng thái, chuyển mỗi năm theo ma trận xác suất — thay cho việc
mỗi kênh tự tung xúc xắc trong cô lập.

### Ma trận chuyển trạng thái

| Từ ↓ Sang → | 📈 Thịnh vượng | 😐 Bình thường | 📉 Suy thoái | 💥 Khủng hoảng |
|---|---|---|---|---|
| 📈 Thịnh vượng | 0,52 | 0,34 | 0,11 | 0,03 |
| 😐 Bình thường | 0,24 | 0,54 | 0,18 | 0,04 |
| 📉 Suy thoái | 0,05 | 0,40 | 0,33 | 0,22 |
| 💥 Khủng hoảng | 0,00 | 0,28 | 0,47 | 0,25 |

Ván bắt đầu ở **bình thường**. Hai tính chất được cài có chủ ý: khủng hoảng không bao
giờ nhảy thẳng về thịnh vượng (phải đi qua suy thoái — kinh tế hồi phục dần chứ không
bật dậy), và suy thoái là cửa ngõ chính vào khủng hoảng.

### Trạng thái nào chi phối năm nào

Năm được giải quyết bằng **trạng thái người chơi đã nhìn thấy suốt năm đó**, không phải
trạng thái mới bốc ra lúc chuyển năm. Trong `chuyenNam`, mọi phép tính của năm dùng
`thiTruongTruoc` (tức `s.thiTruong` khi bước vào hàm); lượt rút chỉ quyết định trạng
thái mà người chơi sẽ sống trong năm **kế tiếp**.

Đây là điều kiện để mục "Người chơi nhìn thấy gì" ở cuối phần B có nghĩa. Nếu năm được
giải quyết bằng trạng thái mới bốc, thì con số hiện trên thanh chỉ số suốt năm chẳng
liên quan gì tới kết quả năm ấy: người chơi thấy 💥 Khủng hoảng, bán sạch cổ phiếu, rồi
năm lại được tính bằng một trạng thái khác hẳn. Công khai một thông tin không dùng được
để ra quyết định thì tệ hơn là giấu nó đi — nó mời người chơi hành động rồi phạt họ vì
đã hành động.

Ma trận này cho ra, tính trên một ván trọn 79 năm:

| Chỉ số | Giá trị |
|---|---|
| Tỉ lệ số năm ở mỗi trạng thái | thịnh vượng 24,1% · bình thường 43,5% · suy thoái 22,6% · khủng hoảng 9,9% |
| Số đợt khủng hoảng mỗi ván | 5,8 đợt — trung bình **một đợt mỗi 13,6 năm** |
| Độ dài một đợt khủng hoảng | 1,33 năm |
| Số đợt thị trường xấu mỗi ván | 10,4 đợt, mỗi đợt 2,42 năm |

Nhịp một cú lớn mỗi mười ba, mười bốn năm là nhịp mà một người Việt Nam đi làm từ
đầu thập niên 1990 tới nay đã thật sự sống qua.

### Trạng thái tác động thế nào

Mỗi trạng thái mang bốn con số, áp lên toàn bộ nền kinh tế cùng một lúc:

| Trạng thái | Độ lệch giá | Hệ số lợi tức | Lệch lạm phát | Hệ số tăng lương thực |
|---|---|---|---|---|
| 📈 Thịnh vượng | +0,10 | ×1,15 | +0,000 | ×1,3 |
| 😐 Bình thường | 0,00 | ×1,00 | +0,000 | ×1,0 |
| 📉 Suy thoái | −0,10 | ×0,80 | +0,010 | ×0,3 |
| 💥 Khủng hoảng | −0,30 | ×0,50 | +0,050 | ×0,0 |

**Giá tài sản.** Mỗi tài sản có thêm trường `nhayChuKy` — độ nhạy riêng với chu kỳ:

```
bienDong = rng.khoang(min, max) + doLechChuKy × nhayChuKy + (bamLamPhat ? lamPhat : 0)
```

| Kênh | `nhayChuKy` | Vì sao |
|---|---|---|
| 🏦 Trái phiếu & tiền gửi | 0,0 | Miễn nhiễm — đây là lý do tồn tại của nó |
| 📈 Cổ phiếu | 1,4 | Nhạy hơn nền kinh tế, đúng như chỉ số chứng khoán |
| 🥇 Vàng | −0,5 | **Nghịch chu kỳ** — càng hoảng loạn càng đắt |
| ⚡ Tiền mã hoá | 2,0 | Khuếch đại mạnh nhất theo cả hai chiều |
| 🏢 Bất động sản | 1,0 | Đi cùng nền kinh tế, thêm quán tính từ lạm phát |

Biến động giá bị chặn sàn ở −0,90: giá có thể sập chín phần mười nhưng không về không.

Kết quả — biến động giá trung bình mỗi năm theo trạng thái:

| Kênh | 📈 Thịnh vượng | 😐 Bình thường | 📉 Suy thoái | 💥 Khủng hoảng |
|---|---|---|---|---|
| 🏦 Trái phiếu | 0% | 0% | 0% | 0% |
| 📈 Cổ phiếu | +19% | +5% | −9% | **−37%** |
| 🥇 Vàng | +5% | +10% | +16% | **+30%** |
| ⚡ Tiền mã hoá | +43% | +23% | +3% | **−37%** |
| 🏢 Bất động sản | +21% | +11% | +2% | **−14%** |

Năm khủng hoảng tệ nhất — rút trúng đáy biên độ riêng — cổ phiếu mất 67%, tiền mã hoá
chạm sàn 90%, bất động sản mất 27%. Con số cổ phiếu ấy không phải bịa: chỉ số chứng
khoán Việt Nam năm 2008 mất khoảng hai phần ba giá trị.

**Lợi tức** (cổ tức, tiền thuê) nhân với hệ số lợi tức của trạng thái, nhưng **chỉ áp
cho kênh có `nhayChuKy > 0`**. Trái phiếu đứng ngoài — lãi tiền gửi không giảm khi kinh
tế xấu, thậm chí còn tăng. Vàng có `nhayChuKy` âm và vốn không sinh lợi tức nên quy tắc
này không đụng tới nó. Một quy tắc, không cần thêm trường nào.

**Thu nhập doanh nghiệp** cũng nhân hệ số lợi tức: khủng hoảng thì mỗi doanh nghiệp chỉ
còn thu được một nửa mức đáng lẽ. Đây là mắt xích nối chu kỳ với phá sản — vay tiền góp
vốn xong gặp khủng hoảng thì thu nhập giảm nửa mà nợ vẫn phải trả đủ.

**Lạm phát** cộng thêm độ lệch của trạng thái. Khủng hoảng đẩy lạm phát trung bình từ
6% lên 11% — vừa sập giá tài sản vừa đắt đỏ, đúng cảnh đình lạm mà Việt Nam trải qua
năm 2008.

**Lương và thưởng.** Phần tăng lương thực nhân với hệ số tăng lương của trạng thái, nên
khủng hoảng thì lương chỉ còn bám lạm phát. Xác suất thăng chức và thưởng Tết cũng nhân
hệ số lợi tức — năm khủng hoảng thì cơ hội thăng chức chỉ còn một nửa.

### Người chơi nhìn thấy gì

Trạng thái thị trường là thông tin **công khai**, hiện ngay trên thanh chỉ số cùng với
tiền và hạnh phúc, và mở đầu bảng tổng kết năm. Ngoài đời báo chí cũng nói suốt ngày về
suy thoái; giấu đi thì thành đánh đố chứ không phải mô phỏng. Cái người chơi **không**
biết là năm sau sẽ ra sao — và đó mới là chỗ khó thật.

---

## C. Biến cố lớn

### Cách hẹn lịch

Ngay khi tạo ván, game rút **3 đến 6** mốc năm ngẫu nhiên trong khoảng tuổi **28–85**,
cách nhau tối thiểu **8 năm**, tất định theo seed — cùng khuôn với lịch cưới hỏi và sinh
con của cốt truyện trăm năm.

*(v1.6 Phase 5: nâng từ 2–4 lên 3–6 để hạ tỉ lệ thắng của bot cân bằng xuống gần
khoảng mục tiêu — xem `phase-5-report.md` cho số đo trước/sau.)*

Hẹn lịch chứ không tung xúc xắc mỗi năm vì hai lẽ: mọi ván đều chắc chắn có biến cố nên
không ván nào trôi qua nhạt nhoà, và số lượng nằm trong tầm kiểm soát để cân bằng được.

Tới năm đã hẹn, game chọn ngẫu nhiên một biến cố **hợp lệ và chưa từng xảy ra**. Nếu
không còn cái nào hợp lệ thì năm đó trôi qua bình thường.

### Sáu biến cố

Mỗi biến cố có một **lá chắn** — thứ mà người chơi phải chuẩn bị từ trước mới có. Mọi
khoản tiền tính theo bội số chi phí sinh hoạt của năm xảy ra, nên biến cố lớn lên cùng
người chơi thay vì hoá vô hại về sau.

#### 🏥 Bệnh hiểm nghèo — từ tuổi 40

**Lá chắn: bảo hiểm y tế còn hiệu lực.**

Viện phí gốc **2,5 × chi phí sinh hoạt**. Có bảo hiểm thì chỉ trả phần tự trả —
`max(tyLeDongTra(tuoi), 0,12)` — vì thuốc ngoài danh mục thì bảo hiểm nào cũng không
gánh; ở tuổi 45 nghĩa là 0,3 × chi phí, sau tuổi 70 thì đồng trả đẩy lên 0,75 ×.
Không bảo hiểm thì trả trọn 2,5 ×.

Hạnh phúc: **−8** khi có bảo hiểm, **−20** khi không. Bệnh vẫn là bệnh, nhưng bệnh kèm
khánh kiệt là chuyện khác hẳn.

Lương năm đó còn **một nửa** trong cả hai trường hợp — ốm nặng thì phải nghỉ, bảo hiểm
chặn được tiền viện phí chứ không chặn được việc bạn không đi làm nổi.

#### 🏭 Mất việc — khi còn đi làm

**Lá chắn: tiền mặt ≥ 1 × chi phí sinh hoạt** đo đúng lúc biến cố nổ ra, tức ở bước 7b
— sau khi lợi tức, thu nhập doanh nghiệp và tiền trả nợ của năm đã cộng trừ xong, nhưng
trước khi lương của năm được cộng vào. Đây là quỹ dự phòng — nguyên tắc tài chính cá
nhân cơ bản nhất, và game chưa từng thưởng cho nó.

| | Có quỹ dự phòng | Không có |
|---|---|---|
| Lương năm đó | ×0,5 | ×0 |
| Hạnh phúc | −6 | −15 |
| Di chứng lương | không | ×0,85 đúng một năm sau |

Nếu biến cố rơi đúng năm **khủng hoảng**, di chứng lương nặng hơn: **×0,75**. Mất việc
giữa lúc cả thị trường đang sa thải thì đi xin lại phải chấp nhận mức thấp hơn nhiều.

Di chứng chỉ áp **đúng một lần**, vào lương của năm NGAY SAU năm xảy ra biến cố — qua một
biến cục bộ trong `chuyenNam` (`diChungApNamNay`), không nhân lại vào lương mỗi năm. Trường
`heSoLuongDiChung` của `GameState` vẫn được cập nhật (nhân dồn nếu mất việc nhiều lần trong
một ván) nhưng chỉ để GHI NHẬN cho hiển thị, không được nhân vào lương của các năm sau đó —
nếu nhân thẳng nó vào lương mỗi năm, mất việc một lần sẽ khiến lương tiệm cận 0 theo cấp số
nhân (0,85ⁿ) dù không còn biến cố nào xảy ra thêm.

#### 👴 Bố mẹ ngã bệnh — tuổi 35–70

**Lá chắn: xuất thân có `boMeCoTichLuy`** (buôn bán ngoài phố, nhà có của ăn của để).

Có: **0,5 × chi phí**, −6 hạnh phúc. Không: **1,8 × chi phí**, −12 hạnh phúc.

Đây là lá chắn duy nhất người chơi không mua được — nó đã được quyết ở màn chọn xuất
thân. Cố ý như vậy: một phần rủi ro của đời người nằm ngoài mọi tính toán, nó thuộc về
chỗ bạn sinh ra.

#### 💸 Vỡ hụi, bị lừa đảo — từ tuổi 30

**Lá chắn: đã thuê chuyên gia hoạch định tài chính** (bản v1.5). Người ngồi soát lại
từng khoản chi cùng bạn cũng là người nhận ra sớm khi có gì đó không ổn.

Có: mất **8% tiền mặt**, −5 hạnh phúc. Không: mất **30% tiền mặt**, −15 hạnh phúc.

Chỉ đụng tiền mặt, không đụng danh mục đầu tư — kẻ lừa đảo lấy được thứ bạn đưa cho họ,
không lấy được cổ phiếu trong tài khoản. Điều đó khiến biến cố này trừng phạt đúng người
ôm quá nhiều tiền mặt nhàn rỗi.

#### 🏚️ Doanh nghiệp đóng cửa — khi đang có ít nhất một doanh nghiệp

**Lá chắn: doanh nghiệp lớn nhất chiếm dưới 40% tài sản ròng.**

Doanh nghiệp bị đóng luôn là cái có **vốn góp lớn nhất**. Người chơi thu hồi được **20%
vốn góp** theo giá hiện hành — thanh lý máy móc, hàng tồn, tiền cọc mặt bằng.

Hạnh phúc: **−8** nếu nó dưới ngưỡng tập trung, **−18** nếu nó là cả gia tài của bạn.

Đây là đối trọng trực tiếp của thanh trượt quy mô góp vốn ở phần E. Dồn hết vào một
thương vụ thì thương vụ ấy chính là cái bị nhắm.

#### 🌊 Bão lũ tàn phá — mọi lúc

**Không có lá chắn.**

Đã mua ước nguyện căn hộ: **1,8 × chi phí**, −12 hạnh phúc. Chưa: **1,2 × chi phí**,
−10 hạnh phúc.

Đời có những cú không ai chặn được, và một trò chơi về tài chính mà giả vờ rằng chuẩn bị
đủ kỹ thì miễn nhiễm với mọi thứ là một trò chơi nói dối. Bù lại, đây là biến cố nhẹ
nhất trong sáu cái — nó làm bạn đau chứ không làm bạn gãy.

---

## D. Phá sản

### Trình tự vỡ nợ

Bước 11 của `chuyenNam` (thiếu tiền mặt) mở rộng thành ba nấc:

**Nấc 1 — bán tài sản đầu tư.** Giữ nguyên cơ chế hiện có, theo thứ tự trái phiếu →
vàng → cổ phiếu → tiền mã hoá → bất động sản. Bán ở giá của năm nay, tức là giữa khủng
hoảng thì bán ở giá đáy.

**Nấc 2 — thanh lý doanh nghiệp.** Vẫn âm thì bán doanh nghiệp, **thu lại 45% vốn góp**
theo giá hiện hành, lần lượt từ cái nhỏ nhất cho tới khi đủ. Bán từ nhỏ lên để giữ lại
nguồn thu nhập lớn nhất càng lâu càng tốt. Doanh nghiệp là tài sản kém thanh khoản —
bán gấp thì mất hơn một nửa giá trị, đúng như ngoài đời.

**Nấc 3 — phá sản.** Vẫn âm, và mức âm vượt **1 × chi phí sinh hoạt**:

- Xoá toàn bộ `khoanVay`
- `tienMat` về 0
- **−15 hạnh phúc**
- Không được vay trong **5 năm**
- Không được mời cơ hội kinh doanh trong **3 năm** — uy tín cần thời gian dựng lại
- `soLanPhaSan` tăng một

Ước nguyện đã mua **không** bị đụng tới. Nhà ở và phương tiện đi lại là tài sản thiết
yếu, luật phá sản ngoài đời cũng chừa lại — và về mặt lối chơi, khoản hạnh phúc hàng
năm từ ước nguyện chính là thứ giúp người chơi gượng dậy.

Nếu tiền mặt âm nhưng **chưa** vượt ngưỡng, giữ nguyên cơ chế "Túng thiếu" hiện có:
−10 hạnh phúc và khoản âm treo sang năm sau.

### Vì sao đây là mối đe doạ thật dù không phải thua ngay

Quãng đường từ mức khởi điểm 70 xuống ngưỡng thua 50 dài đúng 20 điểm. −15 hạnh phúc
trong một năm là 75% quãng đường đó — đau thật, nhưng người chơi đang giữ hạnh phúc ở
mức khởi điểm vẫn còn lại 55 điểm, TRÊN ngưỡng thua, nên còn đường gượng lại chứ không
bị đẩy thẳng xuống thua ngay năm đó (con số cũ, −25, làm phép trừ ra 45 — dưới ngưỡng
50, tức phá sản gần như luôn kéo theo thua ngay lập tức, mâu thuẫn thẳng với chính câu
"không phải dấu chấm hết" bên dưới). Cộng thêm việc mất sạch dòng tiền thụ động, mất
luôn khả năng vay để gây dựng lại, và nếu chưa mua được món khát vọng thì khoản phạt 5
điểm mỗi năm vẫn tiếp tục chảy máu — phá sản vẫn rất dễ kéo theo một cái thua vì hạnh
phúc chỉ vài năm sau nếu không gượng lại kịp. Nó không phải dấu chấm hết, nhưng là cú
ngã mà nhiều ván sẽ không đứng dậy nổi.

### Con đường dẫn tới phá sản

Chuỗi sự kiện mà bốn phần của bản này dựng lên cùng nhau:

```
Vay tối đa để góp vốn quy mô lớn vào một doanh nghiệp
   → khủng hoảng ập tới: thu nhập doanh nghiệp còn một nửa, giá tài sản sập
   → nợ vẫn phải trả đủ, chi phí sinh hoạt lại leo vì lạm phát 11%
   → tiền mặt âm, buộc bán tài sản ở giá đáy
   → không đủ, thanh lý doanh nghiệp với 45% vốn
   → vẫn không đủ  →  PHÁ SẢN
```

Đây chính xác là cách người ta phá sản ngoài đời: không phải vì một quyết định ngu
ngốc, mà vì đòn bẩy gặp đúng chu kỳ xấu.

---

## E. Quy mô góp vốn và cơ hội tầm lớn

### Thanh trượt quy mô

Khi nhận một cơ hội **kinh doanh** hoặc **tổ chức sự kiện**, người chơi chọn quy mô góp
vốn theo bậc: **1× · 2× · 3× · 5× · 8× · 12×**.

- Giá phải trả = `giaThucTe(gia) × hệ số quy mô`
- Thu nhập nền = `giaThucTe(thuNhapMoiNam) × hệ số quy mô`
- Lợi nhuận của khoản tổ chức sự kiện tính trên số vốn thật đã bỏ ra

Trần quy mô có hai tầng, và ranh giới giữa chúng là điều dễ làm sai nhất của cả phần này:

- **Suất gốc 1× chỉ phụ thuộc tiền mặt.** Đủ tiền thì nhận được, dù nó có ngốn gần hết
  tài sản ròng.
- **Từ bậc 2 trở lên mới xét tỉ trọng**, và không được vượt **60% tài sản ròng**.

Đem trần 60% áp cả cho suất gốc là chặn nhầm mục tiêu. Nó biến một luật chống tất tay
thành luật cấm người nghèo làm ăn: người có 500 triệu tài sản ròng sẽ không được nhận cơ
hội 400 triệu, tức là bị khoá cửa vào con đường thu nhập thụ động — thứ duy nhất dẫn tới
điều kiện thắng. Ngoài đời thì ngược lại hẳn: dồn gần hết vốn liếng vào một cửa hàng
chính là cách tuyệt đại đa số người Việt Nam bắt đầu làm ăn.

Việc dồn hết vào một chỗ **vẫn bị trừng phạt**, nhưng bằng rủi ro chứ không bằng lệnh
cấm: biến cố 🏚️ doanh nghiệp đóng cửa nhắm đúng cái lớn nhất, khủng hoảng cắt một nửa
thu nhập, thanh lý gấp chỉ thu về 45%. Đó mới là chỗ dạy được bài học tập trung vốn.
Cấm thì không dạy được gì.

**Canh bạc giữ nguyên một suất.** Không phải vì cân bằng mà vì lời kể: canh bạc là suất
người ta mời bạn, không phải hàng bày bán để mua thêm.

### Vì sao rót to không phải lựa chọn hiển nhiên

Cơ hội kinh doanh sinh lời 18,75–22,5% mỗi năm, cao hơn mọi kênh đầu tư. Nếu không có
đối trọng thì rót tối đa luôn đúng. Ba đối trọng:

1. **Biến cố 🏚️ Doanh nghiệp đóng cửa nhắm vào cái lớn nhất** và chỉ trả lại 20% vốn.
   Rót 12× vào một chỗ là tự vẽ bia lên đó.
2. **Khủng hoảng cắt một nửa thu nhập doanh nghiệp.** Nếu vốn góp đến từ tiền vay, khoản
   trả nợ không giảm theo — đó là cửa vào phá sản.
3. **Thanh lý gấp chỉ thu về 45%.** Tiền nằm trong doanh nghiệp không phải tiền lỏng.

Giao diện nói thẳng điều này: thanh trượt hiện **tỉ trọng trên tài sản ròng**, chuyển
màu cảnh báo khi vượt **40%**.

### Ba cơ hội tầm lớn

Thêm trường `taiSanToiThieu` vào `CoHoi` — cơ hội chỉ xuất hiện khi tài sản ròng đã đủ
lớn. Ba cơ hội mới, đều nằm trong dải sinh lời 18,75–22,5% mà game vẫn giữ:

| Cơ hội | Vốn | Thu nhập nền | Biến động | Hiện khi tài sản ròng ≥ |
|---|---|---|---|---|
| 🏭 Khu nhà xưởng cho thuê | 12 tỷ | 2,3 tỷ/năm | −18% … +22% | 20 tỷ |
| 🏨 Khách sạn ven biển | 20 tỷ | 4,2 tỷ/năm | −45% … +50% | 35 tỷ |
| 🏗️ Góp vốn dự án khu đô thị | 40 tỷ | 8 tỷ/năm | −35% … +40% | 70 tỷ |

Khách sạn cố ý bấp bênh nhất: ngành lưu trú là ngành gãy đầu tiên khi kinh tế xấu.

Không cần luật lọc ngược để giấu cơ hội nhỏ khi đã giàu — thanh trượt 12× đã tự lo phần
đó, và "mở thêm mười lớp dạy thêm" vẫn là một câu chuyện đọc được.

---

## F. Cân bằng

Bản này thêm rất nhiều lực đẩy xuống. Điểm xuất phát cần ghi lại cho rõ: ở v1.5, bot
cân bằng thắng **93–97%** tuỳ nghề (bot khó tính thắng 57–60%). Nghĩa là với người chơi
biết tính toán, game hiện gần như không thể thua — đó chính là lý do sâu xa của cả bản
này, chứ không chỉ là chuyện "cho giống đời thật".

Mục tiêu cân bằng, đo bằng `balance.test.ts` (**viết lại ở Phase 5, sau khi đo thật**
— xem đoạn "Vì sao chỉ tiêu đổi" ngay dưới bảng, và số đo trước/sau đầy đủ nằm ở
`phase-5-report.md`):

| Chỉ số | Mục tiêu |
|---|---|
| Tỉ lệ thắng của bot cân bằng | **85–95%** tuỳ nghề — đo thật quanh 87–92%, dù đã thử đúng một đòn bẩy cho phép (nâng `soBienCoMin/Max` từ 2/4 lên 3/6); hạ rõ rệt so với mức 93–97% của v1.5 nhưng KHÔNG xuống được 55–85% như dự tính ban đầu |
| Tỉ lệ ván có ít nhất một lần phá sản, bot cân bằng | **≤ 5%** — một bot thận trọng thì ĐÁNG LẼ gần như không bao giờ vỡ nợ — đo thật 0% |
| Tỉ lệ ván có ít nhất một lần phá sản, bot dùng đòn bẩy (`CHIEN_LUOC_DON_BAY`: vay tối đa để góp vốn, quy mô 12×, không giữ quỹ dự phòng) | mục tiêu > 0% và rõ rệt cao hơn bot cân bằng — **đo thật vẫn ra 0%, KHÔNG đạt**, kể cả sau khi nới `tyLeThanhToanToiDa` lên 0,65 (xem giải thích dưới) |
| Bot đòn bẩy khi thắng thì về đích sớm hơn bot cân bằng | đạt — canh bạc có lãi kỳ vọng, không phải cái bẫy thuần tuý |
| Chênh lệch tỉ lệ thắng giữa bốn xuất thân | không quá 15 điểm phần trăm |
| Chênh lệch tỉ lệ thắng giữa bậc lương thấp nhất và cao nhất | không quá 15 điểm phần trăm |

Ba dòng cuối là điều kiện để màn thiết lập nhân vật là **lựa chọn phong cách chơi**
chứ không phải bẫy: không được có xuất thân hay bậc lương nào thắng áp đảo phần còn
lại. Nếu mô phỏng cho thấy lệch quá, chỉnh `heSoChiPhiSong` và `apLucTheoLuong` chứ
không chỉnh vốn ban đầu — vốn là thứ người chơi cảm nhận rõ nhất và nên giữ tương phản.

### Vì sao chỉ tiêu đổi — và vì sao tỉ lệ thắng không hạ được xuống 55–85%

Chỉ tiêu gốc của Phase 5 đặt "bot cân bằng phá sản 5–20%" — nhưng một bot **cân bằng**
thì đáng lẽ KHÔNG nên phá sản: đó chính là phần thưởng của sự thận trọng (mua đủ bảo
hiểm, giữ quỹ dự phòng, không dùng đòn bẩy). Đo đúng nghĩa phải là SỰ TƯƠNG PHẢN giữa
một bot cân bằng và một bot cố ý liều — không phải một con số tuyệt đối áp cho cả hai.

Ngay cả khi cho bot vay THẬT (dùng đúng `vayToiDa` sẵn có trong engine để góp vốn kinh
doanh quy mô lớn — đã kiểm chứng có vay, dư nợ đỉnh điểm trung bình 9–10 tỷ mỗi ván cho
kỹ sư phần mềm), tỉ lệ phá sản đo được vẫn là **0%**.

**Vòng nới thứ nhất** (Phase 5, tiếp tục sau khi mục tiêu ≥10% không đạt): nâng
`CONFIG.tyLeThanhToanToiDa` từ 0,5 lên **0,65** — khớp mức ngân hàng Việt Nam thực tế
duyệt vay thế chấp (tới khoảng 65% thu nhập); 0,5 là mức thận trọng khiến đòn bẩy
không bao giờ nguy hiểm thật. Đo lại: tỉ lệ phá sản của bot đòn bẩy **vẫn 0%**, không
nhích.

**Vòng thử thứ hai**: giả thuyết "bot bỏ lỡ cái bẫy lương hưu" — vay kỳ hạn 10 năm lúc
còn trẻ, mức trả tính theo lương đi làm, nhưng nghỉ hưu ở tuổi 60 thì lương chỉ còn
45% (`tyLeLuongHuu`), khiến khoản trả nợ cũ đột nhiên nặng gấp đôi so với thu nhập
mới. Dò vết toàn bộ ván THUA của cả hai chiến lược, cả ba nghề (n=300/tổ hợp): **100%
kết thúc vì hạnh phúc tụt dưới ngưỡng, luôn trong 11 năm đầu** — không ván nào từng
chạm phá sản hay sống đủ lâu để thử. Dò rộng hơn với n=1000/tổ hợp, tính CẢ ván thắng:
số năm chơi được nhiều nhất từng đo được là 35 năm (tuổi 55) — **không một ván mô
phỏng nào, thắng hay thua, từng chạm tới năm thứ 40 (tuổi nghỉ hưu 60)**. Nghĩa là cái
bẫy lương hưu không phải do bot "bỏ lỡ" cơ hội vay ở giai đoạn đó, mà vì giai đoạn đó
CHƯA TỪNG xảy ra trong bất kỳ mô phỏng nào — ván luôn kết thúc (thắng sớm hoặc thua vì
hạnh phúc) từ rất lâu trước khi nhân vật kịp già. Đây là một sự kiện cấu trúc của cả hệ
mô phỏng (không phân biệt chiến lược), không phải một tham số vay có thể vặn để sửa.

Cơ chế gốc vẫn còn: `vayToiDa` kẹp tổng số tiền phải trả nợ mỗi năm không quá
`tyLeThanhToanToiDa` × LƯƠNG hiện tại — dù đã nới lên 0,65, khoản trả nợ hàng năm vẫn
không đủ lớn để vượt qua cả nấc 1 (bán sạch danh mục đầu tư) lẫn nấc 2 (thanh lý doanh
nghiệp còn 45%) rồi còn vượt ngưỡng phá sản, TRONG CHẶNG NĂM MÀ MÔ PHỎNG THỰC SỰ CHƠI
TỚI (0–35 năm). Đổi cách tính `vayToiDa` sâu hơn nữa, hay rút ngắn chặng đường thắng để
mô phỏng sống đủ lâu chạm tuổi hưu, là những thay đổi ảnh hưởng tới mọi người chơi chứ
không riêng gì bot đòn bẩy — quyết định tiếp theo cần người thiết kế chọn, không tự ý
vặn thêm.

**Vòng thứ ba** (việc cuối của v1.6): dừng cố vặn số, ghi nhận đây là giới hạn thật thay
vì tiếp tục nới tham số. Nguyên nhân gốc không nằm ở một tham số vay mà ở chính cấu trúc
thu nhập: lương là nguồn thu KHÔNG BAO GIỜ sụp trong lúc còn đi làm — `tangLuongThucMin`
là 0, và ngay cả ở trạng thái khủng hoảng của chu kỳ kinh tế, lương chỉ ngừng tăng thực
(`heSoTangLuong` về 0) chứ không giảm, vẫn bám đủ lạm phát. Trong khi đó trần trả nợ mỗi
năm (`vayToiDa`) lại tính thẳng theo lương hiện tại. Nghĩa là hễ còn đi làm là còn trả
được nợ, bất kể khủng hoảng nặng tới đâu — phá sản chỉ thật sự rình rập ở giai đoạn LƯƠNG
HƯU (lương đột ngột còn 45%) và ở người chơi dùng đòn bẩy nặng đi đường dài, hai điều
kiện không cùng lúc xảy ra được vì mô phỏng chưa từng sống tới đó. Cơ chế ba nấc vỡ nợ
(bán tài sản đầu tư → thanh lý doanh nghiệp → xoá nợ) đã được kiểm đúng bằng test cấp
engine (`describe('v1.6 — ba nấc vỡ nợ')` trong `engine.test.ts`), ép thẳng trạng thái
nợ/tiền mặt âm thay vì chờ mô phỏng ngẫu nhiên chạm tới — cơ chế không hỏng, chỉ là chưa
từng bị bot mô phỏng kích hoạt.

Giới hạn thật của phép đo: bộ mô phỏng không bao giờ chạm tới nửa sau cuộc đời. Mọi ván —
thắng lẫn thua, cả hai chiến lược, n=1000/tổ hợp — kết thúc trước năm thứ 35 (tuổi 55),
trong khi tuổi nghỉ hưu là 60 (năm thứ 40) và hành trình nhân vật kéo dài tới tuổi 100
(năm thứ 80). Nghĩa là MỌI kết luận cân bằng của v1.6 — kể cả bảng chỉ tiêu ở trên — chỉ
thật sự nói về chặng đầu đời của nhân vật; nửa sau (lương hưu, bảo hiểm tuổi già, phá sản
khi không còn lương để cứu) CHƯA TỪNG được đo một lần nào. Bài test tương ứng trong
`balance.test.ts` vì vậy không còn khẳng định một tỉ lệ phá sản dương ở tầng mô phỏng —
điều đó không đạt được, và ép nó xanh bằng cách vặn số chỉ là tự lừa mình. Test đã đổi
thành một ghi chú giải thích tại chỗ, trỏ tới các test cơ chế phá sản cấp engine.

Việc cần làm ở bản sau: **ván thắng quá sớm** (11–21 năm, tức người chơi tự do tài chính
ngay từ tuổi 32–42) mới là vấn đề cân bằng lớn nhất còn lại — và chính nó che khuất toàn
bộ nửa sau của game, không cho bất kỳ mô phỏng nào cơ hội sống tới giai đoạn lương hưu để
kiểm chứng phá sản thật.

Về tỉ lệ thắng: dù đã nâng số biến cố lớn từ 2–4 lên 3–6 (đòn bẩy DUY NHẤT được phép
thử), tỉ lệ thắng của bot cân bằng vẫn quanh 90% cho cả ba nghề. Bot cân bằng chơi
thận trọng — mua đủ bảo hiểm, giữ quỹ dự phòng, đầu tư đều đặn, không dùng đòn bẩy —
thì gần như chắc thắng trên chặng 79 năm. **Đây không phải lỗi cân bằng mà chính là
thông điệp của game**: kỷ luật tài chính cơ bản, duy trì đủ lâu, gần như luôn thắng;
rủi ro thật nằm ở nhánh dùng đòn bẩy, đúng như nhánh đòn bẩy khi THẮNG cũng về đích
nhanh hơn hẳn (canh bạc có lãi kỳ vọng) — chỉ riêng cái giá phải trả cho canh bạc đó
(xác suất phá sản) chưa hiện rõ được trong số đo vì lý do đã nêu ở trên.

Rủi ro đã lường trước: **vàng có thể thành nước đi trội** vì nó vừa nghịch chu kỳ vừa
bám lạm phát, và trong khủng hoảng trung bình tăng 30%. Cái chặn sẵn có là vàng không
sinh ra đồng lợi tức nào nên không bao giờ mua nổi tự do tài chính — game đã nói rõ
điều đó ở màn chọn nghề. Nếu mô phỏng cho thấy chiến thuật "ôm vàng chờ khủng hoảng"
vẫn thắng, hạ `nhayChuKy` của vàng từ −0,5 xuống −0,3 chứ không đụng tới lợi tức.

---

## G. Thay đổi kỹ thuật

### `types.ts`

```ts
export type XuatThanId = 'thuanNong' | 'vienChuc' | 'buonBan' | 'khaGia'

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

export type TrangThaiThiTruong =
  | 'thinhVuong' | 'binhThuong' | 'suyThoai' | 'khungHoang'

export type BienCoId =
  | 'benhHiemNgheo' | 'matViec' | 'boMeNgaBenh'
  | 'voHui' | 'doanhNghiepDongCua' | 'baoLu'
```

`TaiSan` thêm `nhayChuKy: number`. `CoHoi` thêm `taiSanToiThieu?: Tien`.

`DoanhNghiep` thêm `vonGoc: Tien` — số tiền thật đã bỏ ra, gồm cả hệ số quy mô. Cần cho
cả thanh lý khi phá sản lẫn việc xác định doanh nghiệp lớn nhất trong biến cố đóng cửa;
suy ngược từ `timCoHoi(coHoiId).gia` là không đủ vì nó không biết quy mô đã chọn.

`GameState` thêm:

```ts
xuatThanId: XuatThanId
/** hệ số nhân với lương gốc của nghề, chọn ở màn thiết lập */
heSoLuongKhoiDiem: number
thiTruong: TrangThaiThiTruong
/** các năm đã hẹn sẵn sẽ xảy ra biến cố lớn, tất định theo seed */
lichBienCo: number[]
/** biến cố đã dùng, để không lặp lại trong một ván */
bienCoDaQua: BienCoId[]
/** di chứng lương sau khi mất việc, khởi điểm 1 */
heSoLuongDiChung: number
soLanPhaSan: number
/** không được vay tới hết năm này; -1 nghĩa là không bị cấm */
camVayDenNam: number
/** không được mời cơ hội kinh doanh tới hết năm này; -1 nghĩa là không bị cấm */
camCoHoiDenNam: number
```

`SuKienLoai` thêm `'chuKyKinhTe' | 'bienCoLon' | 'phaSan' | 'thanhLyDoanhNghiep'`.

`TongKetNam` thêm `thiTruongTruoc` và `thiTruongSau` để bảng tổng kết kể được việc
chuyển trạng thái.

`Action` đổi hai chỗ — cả hai đều chỉ **thêm trường tuỳ chọn**, không đổi trường sẵn có,
để mọi lời gọi cũ trong `engine.test.ts` và `sim.ts` vẫn biên dịch và giữ nguyên ý nghĩa:

```ts
| { type: 'chonNghe'; ngheId: string; seed?: number; thietLap?: ThietLapNhanVat }
| { type: 'quyetDinhCoHoi'; coHoiId: string; nhan: boolean; heSoQuyMo?: number }
```

`heSoQuyMo` mặc định 1.

### `config.ts`

Năm khối mới: `xuatThan` (bậc lương, hệ số áp lực, hệ số lối sống), `thiTruong` (ma
trận chuyển và bốn con số tác động của từng trạng thái), `bienCo` (lịch hẹn và tham số
của sáu biến cố), `phaSan` (tỉ lệ thanh lý, ngưỡng, hình phạt), `quyMoGopVon` (các bậc,
trần theo tài sản, ngưỡng cảnh báo).

`luuKey` lên `dong-tien-luu-v1-6`, `dong-tien-luu-v1-5` vào danh sách dọn dẹp trong
`luu.ts`. Ván v1.5 thiếu bảy trường mới (`heSoLuongKhoiDiem`, `xuatThanId`,
`thiTruong`, `lichBienCo`, `bienCoDaQua`, `soLanPhaSan`, `heSoLuongDiChung`) nên
`taiVan` trả `null` — cùng cách các bản trước đã xử lý.

### `content.ts`

Thêm `XUAT_THAN` (bốn xuất thân), `timXuatThan`, ba cơ hội tầm lớn, `nhayChuKy` cho cả
năm tài sản, và bảng lời kể cho sáu biến cố lớn.

### `engine.ts`

**Hàm mới:**

```ts
xuatThanHienTai(s): XuatThan
chuyenTrangThaiThiTruong(rng, hienTai): TrangThaiThiTruong
tacDongThiTruong(t): { doLechGia, heSoLoiTuc, lechLamPhat, heSoTangLuong }
taiSanRong(s): Tien                      // xem định nghĩa ngay dưới
quyMoToiDa(s, coHoi): number             // bậc quy mô lớn nhất được phép
apLucCongViec(s): number                 // điểm hạnh phúc CỘNG mỗi năm do bậc lương — ÂM khi lương cao (trừ), DƯƠNG khi lương thấp
dangCamVay(s): boolean
dangCamCoHoi(s): boolean
vonDoanhNghiepNamNay(s, d): Tien         // vonGoc bám lạm phát từ năm góp
```

**`taiSanRong`** = `tongTaiSan(s)` trừ đi tổng số tiền còn phải trả của mọi khoản vay,
tức `Σ (thanhToanMoiNam × namConLai)`. Lấy tổng phải trả chứ không phải dư nợ gốc vì
`KhoanVay` không lưu gốc còn lại, và với người chơi thì con số đáng sợ đúng là số tiền
phải móc ra từ đây tới lúc hết nợ. Hàm này là mẫu số của cả trần quy mô góp vốn lẫn
ngưỡng tập trung của biến cố doanh nghiệp đóng cửa, nên phải có một định nghĩa duy nhất.

**`tinhHeSoChiPhi`** nhận thêm xuất thân, bậc lương và tuổi, để mọi hệ số chi phí nằm
gọn một chỗ:

```ts
tinhHeSoChiPhi(daKetHon, conCai, nam, xuatThan, heSoLuongKhoiDiem)
```

Nó nhân thêm: `xuatThan.heSoChiPhiSong`, `(1 + tyLePhungDuong)` khi tuổi còn nhỏ hơn
hoặc **bằng** `phungDuongDenTuoi` (mã dùng `<=` nên đúng năm tròn tuổi đó vẫn còn
gửi tiền về, không phải "dưới"), và `1 + (heSoLuongKhoiDiem − 1) × loiSongTheoLuong`.

**`taoGameMoi`** nhận thiết lập nhân vật qua một tham số tuỳ chọn **đứng cuối**, không
chèn vào giữa:

```ts
export interface ThietLapNhanVat {
  xuatThanId: XuatThanId
  heSoLuongKhoiDiem: number
}
export const THIET_LAP_MAC_DINH: ThietLapNhanVat = {
  xuatThanId: 'vienChuc',
  heSoLuongKhoiDiem: 1,
}

taoGameMoi(ngheId, seed?, thietLap = THIET_LAP_MAC_DINH): GameState
```

Chèn tham số vào giữa sẽ đẩy `seed` xuống vị trí thứ tư và phá toàn bộ lời gọi
`taoGameMoi(ngheId, seed)` đang có trong `engine.test.ts` và `sim.ts`. Xuất thân mặc
định là **viên chức tỉnh lẻ** — cái duy nhất trung tính ở mọi hệ số — nên mọi kiểm thử
cũ giữ nguyên ý nghĩa.

Hàm khởi tạo lương theo bậc, tiền mặt theo `tyLeVonBanDau`, khoản nợ học phí nếu có,
hạnh phúc cộng `hanhPhucBanDau`, thị trường `binhThuong`, và rút `lichBienCo`.

`Action` tương ứng: `{ type: 'chonNghe'; ngheId: string; seed?: number;
thietLap?: ThietLapNhanVat }`.

**`chuyenNam` — chèn và sửa:**

| Bước | Thay đổi |
|---|---|
| 0 (mới) | Chuyển trạng thái thị trường, đẩy sự kiện `chuKyKinhTe` khi trạng thái đổi |
| 1 | Lạm phát cộng `lechLamPhat` của trạng thái |
| 2 | Biến động giá cộng `doLechChuKy × nhayChuKy`, chặn sàn −0,90; lợi tức nhân hệ số khi `nhayChuKy > 0` |
| 3 | Thu nhập doanh nghiệp nhân hệ số lợi tức |
| 7 | Xác suất thăng chức và thưởng Tết nhân hệ số lợi tức |
| 7b (mới) | **Biến cố lớn** nếu `s.nam` nằm trong `lichBienCo` |
| 8 | Tăng lương thực nhân `heSoTangLuong`; lương nhân hệ số cắt lương của biến cố năm nay (`heSoLuongBienCo`, biến cục bộ, khởi điểm 1, **không** lưu vào `GameState` vì nó chỉ có hiệu lực đúng năm đó), rồi nhân tiếp hệ số di chứng mất việc ÁP ĐÚNG MỘT LẦN cho năm ngay sau (`diChungApNamNay`, cũng là biến cục bộ) — `heSoLuongDiChung` của `GameState` chỉ được cập nhật để ghi nhận/hiển thị, **không** bị nhân lại vào lương mỗi năm |
| 9 | Cộng `apLucTheoBacLuong(heSoLuongKhoiDiem)` vào hạnh phúc (giá trị có dấu — âm khi lương cao, dương khi lương thấp), bằng 0 ngay từ NĂM NGHỈ HƯU (đọc cờ `daNghiHuu` cục bộ đã cập nhật của năm nay, không phải `s.daNghiHuu` cũ — nếu không năm nghỉ hưu vẫn chịu áp lực dù lương đã chuyển sang lương hưu) |
| 10 | `tinhHeSoChiPhi` với chữ ký mới |
| 11 | Ba nấc vỡ nợ: bán tài sản → thanh lý doanh nghiệp → phá sản |

Biến cố lớn đặt **trước** bước lương vì hai biến cố có cắt lương của năm đó, và **trước**
bước 11 vì tiền mất do biến cố phải có khả năng đẩy người chơi vào vỡ nợ — đó chính là
điểm gặp nhau của cả bản này.

**`reducer` — điểm sửa:** `chonNghe` truyền thêm hai tham số; `vay` chặn khi
`dangCamVay(s)`; `quyetDinhCoHoi` nhân giá và thu nhập nền theo `heSoQuyMo` đã kẹp về
`quyMoToiDa`, ghi `vonGoc`; `rutCoHoi` lọc theo `taiSanToiThieu` và bỏ hết cơ hội
`kinhDoanh` khi `dangCamCoHoi(s)`.

### `sim.ts`

`ChienLuoc` thêm ba công tắc để `balance.test.ts` đo được ảnh hưởng riêng của từng thứ,
cùng khuôn mà bảo hiểm xe và chuyên gia đang dùng:

```ts
/** bậc quy mô góp vốn ưa thích, bot sẽ kẹp lại theo trần cho phép */
quyMoGopVonUaThich: number
/** giữ tiền mặt tối thiểu bằng ngần này lần chi phí để chặn biến cố mất việc */
quyDuPhongTheoChiPhi: number
/** bán bớt kênh nhạy chu kỳ khi thị trường chuyển xấu */
phongThuKhiSuyThoai: boolean
```

`moPhongNhieuVan` nhận thêm xuất thân và bậc lương để chạy được ma trận cân bằng.
`KetQuaSim` thêm `soLanPhaSan` và `soBienCoGap`.

### Giao diện

- **`ChonNghe.tsx`** thành hai bước. Bước 2 hiện bốn thẻ xuất thân kèm số tiền vốn thật
  đã quy ra đồng, và năm nút bậc lương kèm ba con số đổi theo lựa chọn: lương, chi phí
  sinh hoạt, áp lực hạnh phúc mỗi năm. `nghiaVuNamDau` nhận thêm xuất thân và bậc lương
  để con số "tự do tài chính khi dòng tiền đạt" hiện đúng ngay từ màn chọn.
- **`Hud.tsx`** thêm ô trạng thái thị trường: 📈 Thịnh vượng · 😐 Bình thường ·
  📉 Suy thoái · 💥 Khủng hoảng, đổi màu theo mức độ.
- **`TabKinhDoanh.tsx`** thêm thanh trượt quy mô trên mỗi thẻ cơ hội kinh doanh và tổ
  chức sự kiện, hiện vốn phải bỏ, thu nhập tương ứng và tỉ trọng trên tài sản ròng, đỏ
  khi vượt 40%. Khi đang bị cấm mời cơ hội, tab hiện lời nhắc còn mấy năm nữa.
- **`TongKetModal.tsx`** mở đầu bằng dòng chu kỳ kinh tế khi trạng thái đổi. Bảng
  `BIEU_TUONG_SU_KIEN` là `Record<SuKienLoai, string>` nên trình biên dịch sẽ tự đòi bốn
  mục mới.
- **`TabSoSach.tsx`** ghi rõ các hệ số đang nhân vào chi phí sinh hoạt: xuất thân, phụng
  dưỡng, lối sống theo bậc lương — người chơi phải tra được vì sao chi phí của mình khác
  con số gốc của nghề.
- **`KetThucModal.tsx`** nhắc số lần phá sản khi có.

---

## H. Kiểm thử

### `engine.test.ts`

**Xuất thân và bậc lương**
- Mỗi xuất thân cho đúng số vốn ban đầu và đúng khoản nợ học phí.
- Phụng dưỡng đội chi phí đúng 8% và tắt hẳn sau tuổi 55.
- Bậc lương cao nhất trừ đúng 5 điểm hạnh phúc mỗi năm, và ngừng trừ sau khi nghỉ hưu.
- Bậc lương đổi cả lương lẫn chi phí đúng tỉ lệ, và `mucTieuTuDo` dịch theo.
- `mocTaiSanCuaNghe` **không** đổi theo xuất thân hay bậc lương.

**Chu kỳ kinh tế**
- Trạng thái chỉ chuyển theo ma trận; khủng hoảng không bao giờ nhảy thẳng lên thịnh vượng.
- Khủng hoảng kéo giá cổ phiếu và tiền mã hoá xuống, đẩy giá vàng lên, không đụng trái phiếu.
- Biến động giá không bao giờ xuống dưới −90%.
- Lợi tức trái phiếu không đổi theo trạng thái; cổ tức và tiền thuê thì có.
- Thu nhập doanh nghiệp trong khủng hoảng bằng một nửa mức bình thường.
- Lạm phát năm khủng hoảng cao hơn năm bình thường đúng 5 điểm phần trăm.

**Biến cố lớn**
- Lịch biến cố tất định theo seed, số lượng trong khoảng 3–6, cách nhau ít nhất 8 năm.
- Không biến cố nào lặp lại trong một ván.
- Bệnh hiểm nghèo có bảo hiểm tốn đúng phần tự trả; sau tuổi 70 tốn nhiều hơn.
- Mất việc có quỹ dự phòng thì không để lại di chứng lương; không có thì lương giảm
  15% đúng MỘT NĂM sau (25% nếu rơi đúng năm khủng hoảng) — không nhân chồng nếu mất
  việc nhiều lần trong cùng một ván.
- Doanh nghiệp đóng cửa luôn nhắm vào cái có vốn góp lớn nhất và hoàn lại đúng 20% vốn.
- Vỡ hụi chỉ trừ tiền mặt, không đụng danh mục đầu tư.
- Đã thuê chuyên gia hoạch định tài chính thì vỡ hụi chỉ mất 8% thay vì 30%.

**Phá sản**
- Thiếu tiền thì bán tài sản trước, thanh lý doanh nghiệp sau, đúng thứ tự nhỏ tới lớn.
- Thanh lý doanh nghiệp thu về đúng 45% vốn góp theo giá hiện hành.
- Thiếu hụt dưới ngưỡng thì chỉ "Túng thiếu", không phá sản.
- Phá sản xoá sạch nợ, đưa tiền mặt về 0, trừ 15 hạnh phúc, giữ nguyên ước nguyện đã mua.
- Trong 5 năm sau phá sản, `vay` không có tác dụng; trong 3 năm sau, không cơ hội kinh
  doanh nào được rút ra.

**Quy mô góp vốn**
- Góp 5× thì trả gấp 5 lần và thu nhập nền gấp 5 lần.
- `quyMoToiDa` không cho vượt 60% tài sản ròng — TRỪ suất gốc 1×, luôn được phép nếu
  đủ tiền mặt, dù có vượt 60% hay không — và không cho vượt tiền mặt đang có.
- Canh bạc bỏ qua `heSoQuyMo` — luôn đúng một suất.
- Cơ hội có `taiSanToiThieu` không xuất hiện khi chưa đủ giàu.

### `balance.test.ts`

Danh sách dưới đây khớp đúng những test **đang thật sự tồn tại** trong file — bản trước
của mục này mô tả một ma trận rộng hơn và vài test chưa từng được viết; xem "Vì sao chỉ
tiêu đổi" ở mục F cho toàn bộ lý do các chỉ tiêu gốc bị huỷ.

- Mỗi nghề (giáo viên, bác sĩ, kỹ sư phần mềm — ba `it` riêng): người chơi giỏi (bot cân
  bằng) phải thắng được (tỉ lệ thắng > 0%).
- Không nghề nào thắng ngay trong 5 năm đầu — phải có thử thách.
- Chỉ ôm vàng (không nhận cơ hội kinh doanh/sự kiện) thì giàu mấy cũng không bao giờ tự
  do tài chính — đo trên kỹ sư phần mềm.
- Chơi ẩu — từ chối mọi thẻ tiêu dùng — thì thua vì hạnh phúc, đo trên giáo viên.
- Tiêu hoang thì về đích chậm hơn tiêu có chọn lọc — đo trên giáo viên và bác sĩ.
- Liệu trình tâm lý cứu được ván bí bách (bot khó tính, `nguongMoiDiem` cao) nhưng không
  mua đứt điều kiện thua (tỉ lệ thắng luôn < 100%) — đo trên giáo viên.
- Thuê chuyên gia hoạch định tài chính rút ngắn đường tới tự do tài chính — ghép cặp
  từng ván theo đúng seed (có/không thuê), cả ba nghề, **chỉ chốt chiều âm** của số năm
  chênh lệch trung bình, không chốt tỉ lệ thắng (nhiễu, đổi dấu theo nghề).
- Bốn xuất thân không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng — đo trên **một** nghề
  cố định (giáo viên), không phải ma trận × 3 nghề.
- Năm bậc lương không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng — đo trên **một** nghề
  cố định (bác sĩ), không phải ma trận × 3 nghề.
- Bot cân bằng thắng ổn định trong khoảng **85–95%** cho cả ba nghề — chỉ tiêu gốc
  55–85% không đạt được (xem mục F), đây là ngưỡng bám theo khoảng THẬT quan sát được.
- Bot cân bằng (đo trên bác sĩ) thận trọng thì gần như không bao giờ phá sản (≤ 5% số
  ván).
- Bot đòn bẩy (`CHIEN_LUOC_DON_BAY`: vay tối đa, quy mô 12×, không quỹ dự phòng) khi
  thắng thì về đích sớm hơn bot cân bằng, cả ba nghề — canh bạc có lãi kỳ vọng, không
  phải một cái bẫy thuần tuý.

Ba test **không tồn tại** dù từng được mô tả ở bản trước của tài liệu này: so sánh tỉ lệ
phá sản giữa bot giữ quỹ dự phòng và bot tiêu sát đáy; so sánh tỉ lệ phá sản giữa bot rót
12× và bot rót 1×; và một chiến lược `ChienLuoc.phongThuKhiSuyThoai` (đọc tín hiệu chu kỳ
kinh tế để né suy thoái) — trường này chưa từng được thêm vào `ChienLuoc`. Lý do cả ba
biến mất: mọi ván mô phỏng (n=1000/tổ hợp, cả thắng lẫn thua, cả hai chiến lược) đều kết
thúc trước năm thứ 35 — không ván nào sống đủ lâu để chạm ngưỡng phá sản tự nhiên (giai
đoạn lương hưu), nên `soLanPhaSan` đo ra 0% ở mọi chiến lược và mọi phép so sánh dựa trên
nó đều vô nghĩa. Chi tiết đầy đủ nằm ngay trong chú thích phía trên `it('bot đòn bẩy khi
thắng...')` của `balance.test.ts`.

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

Ba nhịp kể mới: hai nhịp lên bảng Tổng kết năm cùng các sự kiện sẵn có, một nhịp kể
tại thẻ giao diện ngay lúc bấm thuê.

Lời kể của hai nhịp sự kiện nằm thành mảng hằng số trong `engine.ts`, đặt cạnh
`CHUYEN_TUOI_GIA`, rút ngẫu nhiên qua `rng.chon` — cùng khuôn mà chuyện tuổi già đang
dùng. Việc này đẩy con trỏ ngẫu nhiên nên số liệu mô phỏng sẽ dịch, nhưng không test
nào vỡ: mọi khẳng định trong `balance.test.ts` đều là ngưỡng chứ không phải giá trị
chính xác.

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

Kể **ngay tại thẻ giao diện lúc bấm thuê**, không lên bảng Tổng kết: hai người ngồi
soát lại từng khoản chi của một năm, tìm ra chỗ tiền rò rỉ mà bạn không để ý. Điểm
hạnh phúc cộng ngay thuộc về nhịp kể này — nó là **cái nhẹ gánh khi lần đầu sau nhiều
năm bạn biết tiền mình đi đâu**, không phải phần thưởng cho việc trả tiền.

### Kiệt sức vào đúng năm về đích

`chuyenNam` chạy trước nhánh xét thắng và nhánh viên mãn, nên một ván có thể vừa hiện
thẻ kiệt sức vừa kết thúc thắng lợi ngay sau đó. **Chấp nhận** — hạnh phúc 50–59 vẫn
qua được cửa ải thua, và về đích trong lúc kiệt sức là một câu chuyện có thật, đáng
được kể đúng như nó xảy ra.

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

Chuỗi hiệu quả theo số lần: **8 → 6 → 4 → 3 → 3 …**, tức
`max(hanhPhucToiThieu, hanhPhucMoiNam − (soLanTriLieu − 1) × giamHieuQuaMoiLan)`, trong
đó `soLanTriLieu` đếm từ 1 và đã tính cả liệu trình đang chạy.

Đây là mô phỏng của việc **dùng trị liệu để thay cho thay đổi nếp sống**: mua thêm một
liệu trình mà hoàn cảnh gây kiệt sức vẫn nguyên vẹn thì lần sau nhạt hơn lần trước. Nó
không phải nhận định về hiệu quả trị liệu ngoài đời. Về mặt luật chơi, đây chính là thứ
chặn chiến thuật "cứ có tiền thì mua hạnh phúc mãi mãi".

### 🧭 Chuyên gia hoạch định tài chính — một lần duy nhất

| Hạng mục | Giá trị |
|---|---|
| Phí | `1,2 × chiPhiHangNam` của năm mua |
| Tác dụng | Chi phí sinh hoạt giảm **8% vĩnh viễn** |
| Kèm theo | `+6` hạnh phúc ngay khi thuê |
| Giới hạn | Cả ván chỉ một lần |

### Giảm phí khi kiệt sức

Cả hai gói còn **một nửa giá** khi cờ `daCanhBaoKietSuc` đang bật. Trong truyện đó là
chương trình hỗ trợ của cơ quan và cộng đồng dành cho người đang khủng hoảng.

**Điều kiện là cái cờ, không phải mức hạnh phúc hiện tại** — đây là chỗ dễ làm sai
nhất của cả bản này. Cờ được chốt một lần ở Tổng kết năm trước và đứng yên suốt năm
nay. Nếu thay bằng phép so `hanhPhuc < nguongCanhBao` đọc tại chỗ thì:

- Người chơi tự tạo được điều kiện giảm giá ngay giữa pha thẻ bài, bằng cách từ chối
  vài tấm thẻ cho hạnh phúc rơi xuống dưới 60 — một cú tự hại gần như không mất gì
  đổi lấy khoản giảm giá vĩnh viễn của gói tài chính.
- Thứ tự bấm nút đổi được tổng tiền phải trả: gói tài chính cộng `+6` ngay, nên mua
  nó trước có thể đẩy hạnh phúc lên trên ngưỡng và làm gói tâm lý mất phần giảm giá.

Cột cờ vào Tổng kết năm trước xoá sạch cả hai chuyện, và đúng với câu chuyện hơn:
chương trình hỗ trợ được xét dựa trên một năm đã qua, không phải tâm trạng lúc bấm.

**Đánh đổi đã biết, cố ý giữ nguyên.** Cờ chỉ được xét lại trong `chuyenNam` nên nó
đứng yên suốt năm sau, bất kể hạnh phúc leo lên tới đâu. Người chơi hiểu luật vẫn mở
khoá được giá nửa **từ trước một năm**: khép một năm ở 54 điểm rồi cả năm kế tiếp mua
gì cũng rẻ một nửa, kể cả khi lúc bấm nút hạnh phúc đã lên 95. Hạnh phúc trên 60 không
có công dụng nào khác ngoài làm vùng đệm — điều kiện thắng chỉ xét dòng tiền thụ động,
điều kiện viên mãn chỉ xét tuổi — nên vứt vài điểm gần như không mất gì.

Bịt đường ấy bằng cách thêm vế `s.hanhPhuc < hanhPhucNguongCanhBao` thì mở lại đúng
hai cửa vừa đóng ở trên: thứ tự bấm nút lại đổi được tổng tiền phải trả, và giữ hạnh
phúc thấp giữa pha thẻ bài lại thành có lợi. Đổi một lỗ hổng lấy hai lỗ hổng không
đáng, nên **luật giữ nguyên và khoảng trống này được ghi ra đây**: bản sau muốn cân
lại giá gói tài chính thì phải cân theo mức **nửa phí**, tức 0,6 lần chi phí sinh hoạt
một năm, chứ không phải mức đầy 1,2 lần.

### Liệu trình không cứu nổi năm mình đã kiệt sức

Xét mốc thời gian thật trong máy:

```
Bấm Kết thúc năm  →  kiểm tra thua (hạnh phúc < 50)  →  chuyenNam  →  trị liệu cộng điểm
```

Buổi trị liệu chỉ diễn ra **sau** cửa ải thua. Nghĩa là:

- Hạnh phúc **50–59**: cửa sổ hành động thật. Mua liệu trình lúc này, qua được cửa ải,
  và năm sau đã có điểm hồi.
- Hạnh phúc **dưới 50**: đã quá muộn cho liệu trình. Chỉ còn thẻ tiêu dùng cộng điểm
  tại chỗ — hoặc một lần duy nhất cả ván, gói hoạch định tài chính — mới cứu nổi.

Bài học nằm đúng ở chỗ đó: **đừng đợi kiệt sức mới đi gặp chuyên gia.**

Điểm `+6` của gói tài chính cộng ngay trong reducer nên nó **có** kéo được người chơi
từ hạnh phúc 44 lên 50 và qua ải. Đây là chủ ý, không phải sơ suất: đó là chiếc phao
đắt đỏ dùng đúng một lần cả ván, giá bằng 60–120% chi phí sinh hoạt của trọn một năm,
và người chơi phải sẵn ngần ấy tiền mặt vào đúng lúc túng quẫn nhất. Hành vi này được
cố định bằng một ca kiểm thử để về sau không ai vô tình sửa mất.

---

## C. Cân bằng

**Liệu trình tâm lý** cho tổng `+24` điểm với giá bằng 25% chi phí sinh hoạt một năm.
So với ước nguyện xe máy — 80 triệu đổi lấy `+5` mỗi năm đến hết đời — trị liệu lỗ
nặng nếu tính đường dài. Đó là chủ ý: nó là **cấp cứu, không phải kênh đầu tư hạnh
phúc**. Ai mua nó thay cho ước nguyện sẽ nghèo cả tiền lẫn điểm.

Trường hợp xấu nhất — người chơi giàu mua liệu trình nối tiếp trọn đời — quy về
`+3` điểm mỗi năm với chi phí đều đặn 8,3% chi phí sinh hoạt hàng năm. Vẫn thua xa
một chiếc xe máy, nên không phá vỡ điều kiện thua.

**Gói hoạch định tài chính** hoàn vốn trong quãng **11–13 năm**. Phép chia `1,2 ÷ 0,08`
ra 15 năm chỉ đúng nếu khoản tiết kiệm đứng yên, mà nó không đứng yên: `chiPhiHangNam`
leo theo lạm phát 3–9% mỗi năm và leo tiếp khi cưới và sinh con.

Và 8% ấy không chỉ cắt vào dòng chi phí sinh hoạt. `chiPhiHangNam` còn là gốc tính của
sáu khoản khác trong engine, tất cả đều giảm theo — đây là **chủ ý**:

| Khoản | Nơi tính | Tỉ lệ trên `chiPhiHangNam` |
|---|---|---|
| Sàn phí bảo hiểm y tế | `phiBaoHiem` | 0,5 |
| Nghĩa vụ hàng năm | `nghiaVuHangNam` | 1,0 |
| Chi phí đám cưới | cột mốc cưới | 1,0 |
| Học phí đại học mỗi con | cột mốc con vào đại học | 0,8 |
| Viện phí khi ốm đau | sự kiện ốm đau | 0,3 |
| Sự cố đời sống | sự kiện sự cố | 0,15 |

Vì `nghiaVuHangNam` nằm trong danh sách, giảm 8% chi phí cũng hạ mức cần đạt để tự do
tài chính chừng ấy — một khoản đầu tư dài hơi thật sự, hợp với thông điệp của game.

Cột mốc tài sản **không** đổi theo: `mocTaiSanCuaNghe` tính trên `nghe.chiPhi` gốc chứ
không đọc trạng thái ván, nên bảng huy hiệu vẫn giữ nguyên thước đo.

### Số liệu mô phỏng

Đo bằng `moPhongNhieuVan`, **200 ván mỗi ô**, seed cố định `1000 + i × 7919` nên hai
cột cạnh nhau là cùng một bộ ván, chỉ khác mỗi quyết định thuê. Mỗi ô ghi ba con số:
tỉ lệ thắng · số năm trung bình khi thắng · tỉ lệ ván thua vì hạnh phúc.

Trong mọi ô đo được, **tỉ lệ thắng cộng tỉ lệ thua vì hạnh phúc luôn bằng đúng 100%** —
không ván nào hết lượt mô phỏng, và hạnh phúc vẫn là đường thua duy nhất.

**Bot cân bằng mặc định** (`CHIEN_LUOC_CAN_BANG`):

| Nghề | Cả hai gói | Tắt tâm lý | Tắt tài chính | Tắt cả hai |
|---|---|---|---|---|
| Giáo viên | 95,0% · 17,95n · 5,0% | 94,5% · 17,93n · 5,5% | 95,0% · 18,20n · 5,0% | 94,5% · 18,20n · 5,5% |
| Bác sĩ | 94,5% · 13,58n · 5,5% | 95,0% · 13,42n · 5,0% | 93,5% · 13,73n · 6,5% | 93,5% · 13,70n · 6,5% |
| Kỹ sư phần mềm | 94,0% · 12,11n · 6,0% | 94,0% · 11,89n · 6,0% | 94,5% · 12,30n · 5,5% | 95,0% · 12,21n · 5,0% |

**Bot khó tính** — giáo viên, `nguongMoiDiem` hạ xuống 800.000 nên bot gần như không
mua điểm hạnh phúc bằng thẻ tiêu dùng nữa:

| Cả hai gói | Tắt tâm lý | Tắt tài chính | Tắt cả hai |
|---|---|---|---|
| 60,0% · 16,58n · 40,0% | 57,5% · 16,93n · 42,5% | 59,0% · 16,92n · 41,0% | 53,0% · 17,15n · 47,0% |

Đọc bảng:

**1. Với bot cân bằng, hai gói gần như không đổi được gì.** Chênh lệch tỉ lệ thắng chỉ
0,5–1,0 điểm phần trăm, tức **một tới hai ván trên 200** — nằm trong nhiễu. Lý do nằm ở
chính con bot: `nguongMoiDiem` mặc định 1.500.000 cộng nhánh nới rộng gấp bốn khi hạnh
phúc xuống dưới 65 khiến nó mua thẻ tiêu dùng rất rộng tay, nên hạnh phúc hiếm khi rơi
xuống ngưỡng cảnh báo và gói tâm lý gần như không bao giờ được gọi tới.

**2. Dấu chênh lệch tỉ lệ thắng đổi theo nghề.** Ở bác sĩ, tắt gói tâm lý lại thắng
**cao hơn** ô bật cả hai (95,0% so với 94,5%); ở kỹ sư phần mềm, tắt cả hai cho 95,0%
so với 94,0% khi bật cả hai. Một tới hai ván trên 200 — vẫn là nhiễu, nhưng là nhiễu có
hướng giải thích được: mấy nghề giàu về đích nhanh, phí liệu trình rút mất một khoản
tiền mặt lẽ ra đã thành tài sản sinh dòng tiền, mà điểm hồi thì chẳng cứu được ván nào
vốn đã không nguy hiểm. **Vì vậy `balance.test.ts` không chốt chênh lệch tỉ lệ thắng
trên bot cân bằng** — chốt ở đó là chốt vào nhiễu và test sẽ đỏ oan mỗi lần đụng tới
bất kỳ con số nào khác trong `config.ts`. Ca đo gói tài chính vì thế chỉ giữ đúng một
khẳng định: dấu âm của phép ghép cặp, quét đủ cả ba nghề.

**3. Tác dụng thật chỉ lộ ra khi hạnh phúc đúng là ràng buộc.** Ở bot khó tính, gần một
nửa số ván thua vì hạnh phúc, và ở đó hai gói cộng lại kéo tỉ lệ thắng từ 53,0% lên
60,0% — bảy điểm phần trăm, mười bốn ván. Tách riêng thì gói tâm lý đóng góp 6,0 điểm
(53,0 → 59,0) và gói tài chính 4,5 điểm (53,0 → 57,5); ghép lại được 7,0 điểm, tức gần
như cộng dồn chứ không giẫm chân nhau. Đây đúng là cảnh ngộ mà hai gói sinh ra để cứu,
nên đây mới là nơi `balance.test.ts` đặt khẳng định.

**4. Không gói nào mua đứt điều kiện thua.** Ngay cả khi bật cả hai, bot khó tính vẫn
thua 40% số ván vì hạnh phúc, và bot cân bằng vẫn không ván nào chạm 100%.

**5. Gói tài chính rút ngắn đường về đích, nhưng ít.** So trung bình thô thì bật gói
tài chính lại **dài hơn** ở giáo viên (17,95 so với 17,93 năm khi tắt tâm lý) — ảo giác
do gói này kéo thêm mấy ván sát nút về phía thắng, mà ván sát nút bao giờ cũng dài, nên
chúng đội trung bình lên và che mất khoản tiết kiệm thật. Ghép cặp từng ván rồi mới lấy
hiệu — chỉ tính những ván thắng ở **cả hai** phía — thì mức rút ngắn hiện ra, và hiện ra
ở cả ba nghề lẫn cả hai lối chơi bot:

| Ô đo | Số ván ghép được | Rút ngắn |
|---|---|---|
| Giáo viên, bot cân bằng | 190 | 0,247 năm |
| Bác sĩ, bot cân bằng | 187 | 0,150 năm |
| Kỹ sư phần mềm, bot cân bằng | 186 | 0,194 năm |
| Giáo viên, bot khó tính | 116 | 0,284 năm |

Dấu âm ở **cả bốn ô**, kể cả những ô mà tỉ lệ thắng thô mang dấu ngược. Đó là bằng
chứng chắc nhất trong cả bảng: khoản 8% chi phí tiết kiệm được luôn đưa người chơi về
đích sớm hơn, chỉ là sớm ít. `balance.test.ts` đo theo lối ghép cặp vì lẽ đó, và quét
đủ ba nghề chứ không bỏ nghề nào — bỏ một nghề ra khỏi vòng lặp là để một ô không được
canh, mà ô bị bỏ lại đúng là ô hay mang dấu ngược.

**6. Trả lời gọn cho câu hỏi cân bằng: hai gói đổi *nhịp độ* là chính, đổi *tỉ lệ thắng*
chỉ khi hạnh phúc thật sự là ràng buộc.** Ở bot cân bằng — lối chơi mà thẻ tiêu dùng đã
giữ hạnh phúc an toàn — bốn cột tỉ lệ thắng chụm trong khoảng 1,0 điểm phần trăm ở cả ba
nghề, tức không đổi gì ngoài nhiễu, trong khi phép ghép cặp vẫn cho thấy đường về đích
ngắn lại đều đặn. Ở bot khó tính — lối chơi mà gần nửa số ván chết vì hạnh phúc — tỉ lệ
thắng nhảy 7,0 điểm phần trăm. Kết luận cho người chơi: **hai gói chuyên gia không phải
đòn bẩy thắng thua cho ván đang thuận, chúng là phao cho ván đang ngạt.** Đây cũng đúng
tinh thần mục A — đừng đợi kiệt sức mới đi gặp chuyên gia, nhưng đi rồi thì cũng đừng
trông nó biến một ván xoàng thành ván hay.

---

## D. Thay đổi kỹ thuật

### `config.ts` — khối `chuyenGia`

Ngưỡng cảnh báo đứng ở **cấp cao nhất**, ngay dưới ngưỡng thua — hai con số là anh em
của cùng một khái niệm, và cả `Hud.tsx` lẫn thẻ hành động cuối năm đều phải đọc nó:

```ts
/** thua nếu hạnh phúc thấp hơn mức này lúc bấm Kết thúc năm */
hanhPhucNguongThua: 50,
/** dưới mức này thì kể chuyện kiệt sức và mở chương trình hỗ trợ của chuyên gia */
hanhPhucNguongCanhBao: 60,
```

```ts
chuyenGia: {
  /** phí cả hai gói còn lại tỉ lệ này khi cờ kiệt sức đang bật */
  heSoGiamPhiKhiKietSuc: 0.5,

  tamLy: {
    /** phí = tỉ lệ này × chi phí sinh hoạt của năm mua */
    tyLePhiTheoChiPhi: 0.25,
    soNamLieuTrinh: 3,
    hanhPhucMoiNam: 8,
    /** mỗi liệu trình TRƯỚC ĐÓ làm lần sau nhạt đi ngần này điểm */
    giamHieuQuaMoiLan: 2,
    hanhPhucToiThieu: 3,
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
trong `luu.ts`. Cơ chế bỏ ván cũ nằm ở **thứ tự**, không nằm ở phép kiểm tra trường:
`taiVan` xoá sạch mọi khoá cũ trước khi đọc khoá mới, nên ván v1.4 bị dọn và `taiVan`
dừng ngay ở `if (!raw) return null`. Chuỗi kiểm tra trường không bao giờ chạm tới nó.

Vẫn thêm một dòng lưới an toàn cho trường hợp dữ liệu lạ nằm đúng khoá mới:

```ts
if (typeof s.heSoToiUuChiPhi !== 'number') return null
```

### `types.ts`

Thêm vào `GameState`:

```ts
/** năm cuối cùng liệu trình tâm lý còn hiệu lực; -1 nghĩa là chưa từng trị liệu */
triLieuDenNam: number
/** số liệu trình đã mua, dùng để làm nhạt dần hiệu quả các lần sau */
soLanTriLieu: number
/** đã kể chuyện kiệt sức cho lần rơi này chưa */
daCanhBaoKietSuc: boolean
/** đã thuê chuyên gia hoạch định tài chính chưa — cả ván chỉ một lần */
daThueChuyenGiaTaiChinh: boolean
/** hệ số chi phí sau khi tối ưu chi tiêu cùng chuyên gia, khởi điểm 1 */
heSoToiUuChiPhi: number
```

`daThueChuyenGiaTaiChinh` phải là **cờ riêng**, không được suy ra từ
`heSoToiUuChiPhi < 1`. Suy ngược từ hệ số thì cái chốt "cả ván một lần" chỉ còn hiệu
lực khi `giamChiPhi` nằm hẳn trong khoảng (0, 1), mà đặt `giamChiPhi: 0` để tắt gói khi
đo lại cân bằng là việc hoàn toàn hợp lệ với `config.ts` — làm thế thì reducer chỉ còn
chặn bằng tiền mặt và mỗi lần bấm lại cộng thêm `hanhPhucNgay` điểm. Đây cũng là khuôn
chung của mọi món mua một lần khác: `baoHiemDenNam`, `uocNguyenDaMua`, `triLieuDenNam`.

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
hoiPhucTriLieu(soLan: number): number           // soLan đếm từ 1 → 8 / 6 / 4 / 3 / 3…
daToiUuChiPhi(s: GameState): boolean            // s.daThueChuyenGiaTaiChinh
dangDuocHoTro(s: GameState): boolean            // s.daCanhBaoKietSuc
chiPhiChuaToiUu(s: GameState): Tien             // tích của bước 10, bỏ heSoToiUuChiPhi
toiUuDaVaoSo(s: GameState): boolean             // s.chiPhiHangNam < chiPhiChuaToiUu(s)
phiChuyenGiaTamLy(s: GameState): Tien
phiChuyenGiaTaiChinh(s: GameState): Tien
```

`chiPhiChuaToiUu` và `toiUuDaVaoSo` nằm ở engine chứ không ở giao diện, vì **cả Trang
chủ lẫn Sổ sách đều cần đúng phép so ấy**. Cờ tối ưu bật lên ngay giây bấm thuê, còn
`chiPhiHangNam` thì mỗi ván chỉ được dựng lại trong `chuyenNam`, nên suốt phần còn lại
của năm thuê con số bày trên màn hình vẫn là chi phí CHƯA giảm. Màn nào tự nhân lại
công thức của bước 10 là màn ấy sẽ có ngày lệch với màn kia.

Ba quy tắc bắt buộc cho hai hàm phí:

1. **Nhân trực tiếp với `s.chiPhiHangNam`**, thứ đã gồm chỉ số giá — không bọc thêm
   `giaThucTe`, đúng như `phiBaoHiemXe` đang làm.
2. **Trả về số tiền THỰC bị trừ**, tức đã gồm mức giảm nửa phí khi `dangDuocHoTro(s)`.
   Giao diện muốn khoe giá gốc thì tự nhân ngược lên, chứ engine chỉ có một con số.
3. Giao diện **phải gọi chung hàm này**, nếu không nút sẽ hiện một giá còn reducer trừ
   một giá khác.

`hoiPhucTriLieu` nhận **số lần đã mua, đếm từ 1 và đã tính cả liệu trình đang chạy**:

```ts
max(hanhPhucToiThieu, hanhPhucMoiNam - (soLan - 1) * giamHieuQuaMoiLan)
```

Vì reducer tăng `soLanTriLieu` ngay lúc thuê, `chuyenNam` truyền thẳng `s.soLanTriLieu`
vào là đúng — liệu trình đầu tiên ra 8 điểm.

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

   Mốc thời gian của liệu trình, kiểm lại cho chắc: mua ở năm `N` đặt
   `triLieuDenNam = N + 2`. Trong `chuyenNam`, `s.nam` vẫn là năm cũ, nên điều kiện
   `s.nam <= s.triLieuDenNam` đúng ở các năm `N`, `N+1`, `N+2` — vừa đủ ba lần hồi —
   rồi tắt. Năm thứ mấy của liệu trình = `soNamLieuTrinh - soNamTriLieuConLai(s) + 1`.

4. **Sau bước 12**, tức sau vòng lặp cột mốc tài sản và ngay trước khi dựng
   `sauChuyen`, mới xét cảnh báo kiệt sức và cập nhật cờ:

   ```
   nếu hanhPhuc < hanhPhucNguongCanhBao và chưa daCanhBaoKietSuc:
       đẩy sự kiện 'kietSuc', bật cờ
   nếu hanhPhuc >= hanhPhucNguongCanhBao:
       tắt cờ
   ```

   **Đặt ở cuối bước 9 là sai** — đây là cái bẫy chính của bản này. Sau bước 9, biến
   `hanhPhuc` còn bị sửa hai lần nữa: bước 11 trừ 10 điểm khi túng thiếu phải bán tài
   sản, bước 12 cộng 5 điểm cho mỗi cột mốc tài sản vừa chạm. Xét sớm thì một năm đóng
   lại ở 63 điểm vẫn bị kể chuyện kiệt sức và cờ kẹt ở trạng thái bật, còn một năm
   tụt xuống 48 vì túng thiếu lại không được kể một chữ nào.

   Vì cờ này cũng là điều kiện giảm nửa phí, đặt sai chỗ biến một lỗi kể chuyện thành
   một lỗi tiền bạc. Sự kiện `kietSuc` đứng **cuối** mảng `suKien`, sau cả lạm phát —
   nó là lời khép lại của năm.

   Cờ này **phải được gán tường minh** vào đối tượng `sauChuyen`
   ([`engine.ts:1140`](../src/game/engine.ts#L1140)). Ba trường còn lại đi theo phép
   trải `...s` là đủ, vì chúng chỉ đổi trong reducer.

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
tâm lý khi `hanhPhuc < hanhPhucNguongCanhBao` và không đang trong liệu trình, thuê
chuyên gia tài chính khi tiền mặt còn dư gấp ba lần phí — cùng khuôn thận trọng mà bot
đang dùng cho bảo hiểm y tế.

**Lỗi tồn đọng phải sửa cùng bản này.** `sim.ts:118` và
`TabTrangChu.tsx:296` đang bọc `giaThucTe(...)` quanh `phiBaoHiem(s)`, trong khi
`phiBaoHiem` vốn đã tính trên `s.luong` và `s.chiPhiHangNam` của năm hiện tại — hai
con số đã leo theo lạm phát rồi. Lạm phát bị nhân hai lần, nên tới cuối ván nút bảo
hiểm y tế hiện giá gấp nhiều lần giá thật và `disabled` chặn người chơi mua đúng vào
lúc tuổi già rủi ro cao nhất. Bot cũng lệch theo, nghĩa là số cân bằng đang có trong
`balance.test.ts` chưa chuẩn. Đây là lỗi của bản trước, không phải của bản này, nhưng
phải sửa trước khi đo lại cân bằng — nếu không thì không biết con số dịch vì gói
chuyên gia hay vì lỗi cũ.

**Lỗi tồn đọng thứ hai, cũng sửa cùng bản này.** Nhánh "hoảng" của bot bỏ mất hệ số
`s.chiSoGia`: `s.hanhPhuc < 65 ? cl.nguongMoiDiem * 4 : cl.nguongMoiDiem * s.chiSoGia`.
Vế đầu là hằng số còn vế sau leo theo lạm phát, nên khi `chiSoGia` vượt 4 thì nhánh lẽ
ra "nới rộng tay" hoá ra **chặt hơn** nhánh thường — ngược hẳn chú thích ngay trên nó.
Bộ số cũ chưa chạm vào ca đó (chiSoGia cao nhất quan sát được là 5,03 ở giáo viên,
nhưng chưa lượt nào vừa có `chiSoGia > 4` vừa có hạnh phúc dưới 65), nhưng nới biên lạm
phát hay kéo dài ván chơi là nó bật lên. Sửa thành
`(s.hanhPhuc < 65 ? cl.nguongMoiDiem * 4 : cl.nguongMoiDiem) * s.chiSoGia`. Số 65 giữ
nguyên: đó là vùng đệm **cố ý** nằm trên `hanhPhucNguongCanhBao` để bot phản ứng sớm
hơn một nhịp, còn nhánh thuê chuyên gia tâm lý thì vẫn đọc đúng cấu hình. Sửa xong phải
**đo lại toàn bộ bảng §C** — bảng ở trên đã là số sau khi sửa.

### Giao diện

Nguyên tắc chung: **không thêm lớp CSS mới**. Toàn bộ `styles.css` hiện không có
`text-decoration` nào, nên bỏ hẳn ý định gạch ngang giá gốc — thay bằng một dòng
`muc-mua-phu` nói rõ đang được hỗ trợ.

- **`KhuChuyenGia.tsx` — file riêng**: mục **🧑‍⚕️ Chuyên gia đồng hành** đặt ngay sau
  bảo hiểm xe, trước giáo dục. Tách khỏi `TabTrangChu.tsx` vì tệp ấy đã chứa bốn thành
  phần trong gần sáu trăm dòng. Hai thẻ dùng khuôn `muc-mua` sẵn có.
  - Thẻ tâm lý 🧘: nút hiện phí thật; dòng phụ ghi mức hồi mỗi năm của lần mua kế tiếp
    và thời lượng liệu trình. Khi đang trong liệu trình thì chuyển sang khuôn
    `the-da-mua` + `nhan-da-mua` như mục Ước nguyện, nhãn "Đang trị liệu · còn N năm".
  - Lý do trong truyện của chuỗi nhạt dần phải nằm **trên màn hình**, không chỉ trong
    comment: dòng phụ nói "đã qua N liệu trình mà hoàn cảnh gây kiệt sức chưa đổi, nên
    lần này đỡ được ít hơn lần trước", tuyệt đối không nói "đã trị liệu N lần nên hiệu
    quả nhạt dần" — quy nguyên nhân cho số lần đi trị liệu là đúng cách diễn đạt mà cả
    ba khối chú thích của bản này đều dặn phải tránh.
  - Thẻ tài chính 🧭: nút hiện phí thật; dòng phụ ghi mức giảm chi phí quy ra tiền mỗi
    năm. Sau khi thuê dùng nhãn **"Đã có"** — đúng quy ước của mọi món đã sở hữu trong
    game, không đặt nhãn riêng — và đưa mức đang tiết kiệm xuống dòng `muc-mua-phu`.
    Dòng ấy phải hỏi `toiUuDaVaoSo(state)` trước: chưa vào sổ thì nói "sẽ áp dụng từ
    năm sau" y hệt Sổ sách, vào sổ rồi mới được nói "Đang tiết kiệm". Khoản tiết kiệm
    lấy bằng **hiệu** `chiPhiChuaToiUu(state) − state.chiPhiHangNam`, không chia ngược
    cho `heSoToiUuChiPhi`: phép chia ấy chỉ đúng khi `chiPhiHangNam` đã giảm, nên trong
    năm thuê nó thổi con số lên 8,7% thay vì 8%, và chia cho 0 nếu ai đó đặt
    `giamChiPhi: 1`.
  - Khi `dangDuocHoTro(state)`: cả hai thẻ thêm dòng phụ **🤝 Đang được hỗ trợ một nửa
    phí**. Giá trên nút vẫn là giá thật phải trả. Đoạn dài ở đầu mục **không** được nói
    "Tổng kết năm ngoái ghi nhận": chuyện kiệt sức chỉ kể một lần cho mỗi lần rơi, còn
    cờ thì sống suốt quãng đáy — tới năm thứ ba của một quãng đáy thì bảng Tổng kết năm
    ngoái không hề có dòng kiệt sức nào.
  - Đoạn mô tả đầu mục nói rõ vì sao nên đi gặp chuyên gia **sớm**.
- **Thẻ hành động cuối năm**: khối cảnh báo hiện có tách thành ba mức.
  - Trong khoảng cảnh báo **và chưa trị liệu** thì gợi ý đi gặp chuyên gia tâm lý ngay
    khi còn kịp. Phải hỏi thêm `dangTriLieu(state)`: reducer chặn thẳng việc chồng hai
    liệu trình, và thẻ 🧘 lúc ấy đã chuyển sang khuôn `the-da-mua` không còn nút nào.
  - Trong khoảng cảnh báo **mà đang trị liệu** thì đổi sang lời trấn an: liệu trình
    đang chạy, Tổng kết cuối năm sẽ cộng thêm `hoiPhucTriLieu(soLanTriLieu)` điểm.
  - Dưới ngưỡng thua thì giữ cảnh báo đỏ và nói thẳng rằng buổi trị liệu diễn ra sau
    khi kết thúc năm nên không kịp cứu năm nay. **Tuyệt đối không nhắc thẻ tiêu dùng**:
    khối này chỉ hiện ở phase `'tuDo'`, mà pha ấy chỉ tới khi chuỗi thẻ đã rỗng. Đường
    cứu duy nhất còn lại là gói 🧭 — trỏ vào nó khi `!daToiUuChiPhi(state) &&
    state.tienMat >= phiChuyenGiaTaiChinh(state)`, còn lại thì nói thẳng là năm nay
    không còn cách nào gỡ. Câu đếm điểm cũng phải khớp luật `hanhPhuc < 50`: "còn N
    điểm nữa là **rơi xuống dưới** ngưỡng thua", chứ "chạm ngưỡng" thì ở đúng mốc 50 sẽ
    thành "còn 1 điểm nữa là chạm ngưỡng thua 50" — tự mâu thuẫn trong một câu.
- **`Hud.tsx`**: `matCuoi` **trả biểu tượng liệu trình thay cho mặt cười** khi đang trị
  liệu **và hạnh phúc còn từ ngưỡng thua trở lên**, không gắn thêm emoji thứ hai — lưới
  HUD có bốn cột, trên máy hẹp mỗi ô chỉ còn khoảng 80px nên hai emoji sẽ xuống dòng.
  Dưới ngưỡng thua thì nhường lại cho 😟: 🧘 đọc ra là "đang an ổn" nên dựng nó cạnh
  con số đang tô đỏ là hai tín hiệu chọi nhau đúng lúc nguy hiểm nhất. Màu số hiện chỉ
  có hai mức, thêm mức vàng
  (`var(--vang-dam)`) cho khoảng cảnh báo, để người chơi thấy mình bước vào vùng nguy
  hiểm trước một nhịp thay vì tới lúc đỏ mới biết.
- **`TongKetModal.tsx`**: bảng `BIEU_TUONG_SU_KIEN` là `Record<SuKienLoai, string>` nên
  trình biên dịch sẽ tự đòi hai mục mới — 😔 cho kiệt sức, 🧘 cho buổi trị liệu.
- **`TabSoSach.tsx`**: có **hai** dòng chi phí sinh hoạt, phải sửa cả hai. Ghi chú mức
  đã tối ưu lấy số từ `CONFIG.chuyenGia.taiChinh.giamChiPhi`, không viết cứng "8%". Lưu
  ý `chiPhiHangNam` chỉ được tính lại trong `chuyenNam`, nên ngay trong năm thuê con số
  hiển thị vẫn là chi phí chưa giảm — năm đó ghi "sẽ áp dụng từ năm sau". Phép so ấy
  gọi `toiUuDaVaoSo` của engine chứ không dựng lại công thức bước 10 tại chỗ. Thêm một
  dòng tình trạng liệu trình vào bảng nghĩa vụ và bảo vệ.

---

## E. Kiểm thử

`engine.test.ts`:

- Thuê chuyên gia tâm lý trừ đúng phí và đặt hạn liệu trình ba năm.
- Liệu trình hồi đúng ba năm rồi dừng hẳn, và **kể đúng thứ tự ba nhịp**: ba tiêu đề
  phải khác nhau và trùng khớp `CHUYEN_TRI_LIEU`. Chỉ khẳng định `tieuDe.length > 0`
  thì thay cả công thức chọn nhịp bằng `CHUYEN_TRI_LIEU[0]` bộ test vẫn xanh — đã kiểm
  bằng đột biến.
- `CHUYEN_TRI_LIEU.length` phải bằng `soNamLieuTrinh`: cái kẹp `Math.min(Math.max(…))`
  nuốt im lặng mọi sai lệch, nâng số năm lên 4 mà quên viết nhịp thứ tư thì người chơi
  nghe "Buổi trị liệu cuối cùng" hai năm liền.
- Không mua chồng liệu trình khi liệu trình cũ còn hạn.
- Liệu trình lần hai hồi 6 điểm, lần ba hồi 4, từ lần tư trở đi đứng ở sàn 3.
- Điểm hồi bị trần mềm cắt thì sự kiện phải ghi số **thực** nhận, không phải số danh
  nghĩa — cùng bất biến mà các sự kiện khác đang giữ.
- Cờ kiệt sức đang bật thì phí cả hai gói còn đúng một nửa; cờ tắt thì trả giá đủ.
- Tiền mặt bị trừ **đúng bằng** giá trị hai hàm phí trả về, ở cả hai trạng thái cờ.
- Thuê chuyên gia tài chính giảm chi phí sinh hoạt năm sau đúng 8% và giữ nguyên các
  năm tiếp theo, kể cả sau lạm phát và sau khi sinh con.
- Chỉ thuê được chuyên gia tài chính một lần.
- Chặn thuê cả hai gói khi thiếu tiền hoặc khi đang ngoài giai đoạn tự do.
- `nghiaVuHangNam` và `mucTieuTuDo` giảm theo, còn `mocTaiSanCuaNghe` đứng yên. Mốc
  phải được neo vào con số dựng lại từ `nghe.chiPhi` và `CONFIG.mocTaiSan`, tuyệt đối
  **không** so hai lời gọi `mocTaiSanCuaNghe` với nhau: hàm chỉ nhận
  `(ngheId, chiSoGia)` mà hai nhánh vốn cùng cả hai đối số, nên đó là f(a,b) với chính
  f(a,b) — không đột biến nào làm nó đỏ được.
- Sự kiện kiệt sức kể một lần cho mỗi lần rơi, không kể lại khi vẫn đang ở dưới ngưỡng.
- **Biên của ngưỡng cảnh báo**: năm khép lại đúng `hanhPhucNguongCanhBao` thì **không**
  kể kiệt sức và cờ phải tắt; thấp hơn đúng một điểm thì **phải** kể và cờ bật. Thiếu
  hai ca này thì đổi `>=` thành `>` cả bộ test vẫn xanh, mà cờ ấy lại là điều kiện giảm
  nửa phí cả hai gói — một lỗi kể chuyện hoá thành một lỗi tiền bạc.
- **Vị trí xét kiệt sức** (hai ca chốt cái bẫy ở mục D điểm 4):
  - Năm phải bán tài sản trang trải, hạnh phúc từ trên ngưỡng tụt xuống dưới vì khoản
    trừ của bước 11 → **phải** kể chuyện kiệt sức.
  - Năm bắt đầu ở 58 rồi leo lên 63 nhờ điểm cột mốc tài sản của bước 12 → **không**
    kể, và cờ phải tắt.
- Liệu trình mua lúc hạnh phúc dưới ngưỡng thua **không** cứu được năm đó — vẫn thua.
- Ngược lại, thuê chuyên gia tài chính ở hạnh phúc 44 **có** cứu được năm đó. Đây là
  hành vi chủ ý, cố định bằng test để về sau không ai sửa mất.

`balance.test.ts`:

- Bot mua liệu trình mỗi khi hạnh phúc xuống dưới ngưỡng cảnh báo: tỉ lệ thắng nhích
  lên nhưng **không** chạm 100% ở nghề giáo viên — thua vì hạnh phúc vẫn còn là rủi ro
  thật. Đây là ca **duy nhất** được chốt tỉ lệ thắng, vì nó chạy trên bot khó tính nơi
  hiệu ứng là vài điểm phần trăm thật.
- Bot mua chuyên gia tài chính sớm rút ngắn được số năm tới tự do tài chính, đo bằng
  **phép ghép cặp** trên cả ba nghề. Ca này cố ý **không** chốt tỉ lệ thắng: xem mục C
  điểm 2 — dấu của nó đổi theo nghề và biên an toàn có ô bằng đúng không.

Không nới lỏng ngưỡng test để làm xanh. Nếu số đo thực không đạt kỳ vọng, ghi lại con
số thật và chỉnh `config.ts` — đó mới là chỗ để cân bằng.

`src/ui/giao-dien.test.ts` — **file mới**. Bản này đụng vào bốn màn cùng lúc, mà cả ba
file test hiện có đều chỉ soi engine. Một phép chia cho `heSoToiUuChiPhi` bằng 0 hay
một trường thiếu trong `state` sẽ lọt qua sạch bách rồi hiện ra dưới dạng chữ "NaN"
giữa bảng số — và người chơi là người đầu tiên nhìn thấy.

File này kết xuất tĩnh `Hud`, `TabTrangChu`, `TabSoSach` và `TongKetModal` bằng
`react-dom/server`, quét ba nghề × chín trạng thái đáng ngờ (mặc định, đang được hỗ trợ,
đang trong liệu trình, đã tối ưu chi phí từ năm trước, vừa thuê chuyên gia tài chính
trong năm nay, sắp thua, sắp thua mà đã hết sạch tiền, trong vùng cảnh báo, trong vùng
cảnh báo mà đang trị liệu), và bắt lỗi nếu chuỗi kết xuất chứa `NaN`, `undefined` hay
`Infinity`.

Ba ca nội dung đi kèm, vì kết xuất được không có nghĩa là nói đúng:

- **Lời cảnh báo sắp thua chỉ đúng vào đường cứu còn dùng được.** Ca này chốt luôn tiền
  đề: khối cảnh báo chỉ hiện ở phase `'tuDo'`, mà reducer chỉ chuyển sang pha ấy đúng
  lúc `theConLai` đã rỗng — nên chỉ người chơi đi tìm "thẻ tiêu dùng" là chỉ vào thứ
  chắc chắn không còn. Còn tiền và chưa thuê thì màn hình phải trỏ vào gói 🧭; hết tiền
  thì phải nói thẳng là năm nay không còn cách nào.
- **Đang trị liệu thì không giục đi gặp chuyên gia tâm lý nữa** — reducer chặn mua
  chồng liệu trình và thẻ 🧘 lúc ấy không còn nút nào để bấm.
- **Bảng Tổng kết kết xuất được cả 😔 kiệt sức lẫn 🧘 buổi trị liệu trong cùng một
  năm.** Phải đánh dấu sẵn `mocTaiSanDaQua` rồi neo hạnh phúc dưới ngưỡng cảnh báo:
  túi mười tỷ vượt sạch bốn mốc ngay năm đầu, mỗi mốc cộng 5 điểm sau khi cờ kiệt sức
  đã xét xong, nên để nguyên thì năm khép lại ở 85 và nhánh 😔 của `BIEU_TUONG_SU_KIEN`
  chưa từng chạy qua bộ kết xuất một lần nào.

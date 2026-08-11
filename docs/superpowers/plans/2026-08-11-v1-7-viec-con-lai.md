# Bản v1.7 — Bốn việc còn lại (kế hoạch chính thức)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thực hiện bốn quyết định đã chốt sau vòng hiệu chỉnh v1.7 nhưng chưa cài đặt — trả đường lương giáo viên về đúng thực tế, chặn bán tháo vô hạn ở nấc 1 để phá sản thật sự xảy ra được, kéo kỳ hạn vay lên hai mươi năm, và bỏ mục tiêu chênh lệch ≤ 15 điểm khỏi mục J — rồi đo lại toàn bộ và ghi số thật vào tài liệu thiết kế.

**Architecture:** Ba trong bốn việc chỉ là đổi số ở `config.ts`/`content.ts` và chữ ở tài liệu; việc thứ hai là thay đổi engine thật sự, đặt trong nấc 1 của khối ba nấc vỡ nợ tại `chuyenNam`. Vì mọi thay đổi đều dời số cân bằng, task cuối cùng đo lại năm chỉ tiêu và viết lại mục L thay vì để mỗi task tự vặn ngưỡng test.

**Tech Stack:** TypeScript 5.7 · React 19 · Vite 6 · Vitest 3 · không có backend, trạng thái lưu ở localStorage.

---

## Tình trạng đã xác minh trên mã nguồn (2026-08-11)

Bốn việc dưới đây **đều chưa làm**, xác minh trực tiếp chứ không suy từ trí nhớ:

| # | Việc | Bằng chứng | Tình trạng |
|---|---|---|---|
| 1 | Trả đường lương giáo viên về 3,5%/năm | `content.ts:78-83` đang là `0.06 / 0.052 / 0.044 / 0.02` | ❌ chưa làm |
| 2 | Chặn bán tháo vô hạn ở nấc 1 | `engine.ts:2029-2038` vòng lặp bán tới khi hết âm, không trần | ❌ chưa làm |
| 3 | Kỳ hạn vay 10 → 20 năm | `config.ts:201` `kyHanVayToiDa: 10` | ❌ chưa làm |
| 4 | Bỏ mục tiêu chênh lệch ≤ 15 điểm | `docs/07-thiet-ke-v1-7.md:507-508` hai dòng vẫn đòi "giữ ≤ 15 điểm" | ❌ chưa làm |

Ngoài bốn việc trên, ba khoản dọn dẹp còn treo (Task 6):

- `docs/superpowers/plans/2026-08-11-v1-7-du-kho-de-phai-chon.md` có 7 dòng sửa **chưa commit** (đổi `718_000_000` thành `718 * TRIEU` trong ba đoạn mã mẫu).
- Kế hoạch cũ còn **121 ô `- [ ]` chưa tích** dù toàn bộ 15 task đã cài xong và commit.
- Nhánh `v1-7-du-kho-de-phai-chon` đi trước `main` **60 commit**, chưa gộp.

Nền tại thời điểm bắt đầu: `npm test` **294/294 xanh**, `./node_modules/.bin/tsc -b --noEmit` không lỗi.

---

## Global Constraints

- **Ngôn ngữ:** Mọi chuỗi hiển thị cho người chơi phải là **tiếng Việt có dấu, không viết tắt**. Mỗi mục giao diện phải có icon emoji sinh động.
- **Lệnh chạy test:** `npm test -- <đường dẫn>`. **KHÔNG dùng `npx`** — cài đặt npm trên máy này hỏng (`Cannot find module './npm-cli.js'`). Chạy toàn bộ: `npm test`. Biên dịch: `./node_modules/.bin/tsc -b --noEmit`.
- **Đơn vị tiền:** dùng hằng `TRIEU` và `TY` đã có trong `config.ts`. Không viết số 0 trần trụi.
- **Mọi số cân bằng nằm trong `config.ts`**, không rải rác trong `engine.ts`.
- **Chú thích tiếng Việt giải thích VÌ SAO**, theo đúng phong cách dày đặc sẵn có. Số nào có lý do thì phải ghi lý do.
- **`CONFIG` khai báo `as const`** — khi thêm khoá mới phải giữ nguyên kiểu này.
- **Commit sau mỗi task**, thông điệp commit **không dấu**, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Nhánh làm việc:** `v1-7-du-kho-de-phai-chon` (đang dùng, đi trước `main` 60 commit).
- **Không vặn ngưỡng test cho xanh trong Task 1–4.** Test cân bằng đỏ vì số vừa đổi là **kết quả cần ghi nhận**, không phải lỗi cần che. Mỗi task có mục "Test đã đỏ" để chép tên bài đỏ vào; Task 5 là task **duy nhất** được chốt lại ngưỡng.
- **Tài liệu gốc:** `docs/07-thiet-ke-v1-7.md` — mục J là bảng mục tiêu, mục L là bảng số đo thật.

---

## Thứ tự thực hiện và vì sao

`4 → 3 → 2 → 1 → 5`, tức **ngược** với thứ tự người dùng liệt kê. Lý do:

1. **Việc 4 trước** vì nó chỉ đụng tài liệu và tên bài test, không dời một con số nào — làm sớm thì các task sau không phải chạy lại vòng đo vì một thay đổi thuần chữ nghĩa.
2. **Việc 3 (kỳ hạn vay) trước việc 2 (engine)** vì kỳ hạn dài làm khoản trả nợ mỗi năm nhẹ đi, tức thay đổi hẳn phân bố thiếu hụt tiền mặt mà nấc 1 phải xử lý. Cài trần bán tháo trên phân bố cũ rồi mới đổi kỳ hạn thì phải hiệu chỉnh trần hai lần.
3. **Việc 1 (đường lương giáo viên) gần cuối** vì đây là thay đổi phá vỡ nhiều chỉ tiêu nhất: mục L đo được giáo viên trên đường cong thật chỉ thắng **11%**, nên hai chỉ tiêu đang xanh (tỉ lệ thắng 45–55% và chênh lệch ba nghề ≤ 10 điểm) sẽ **đỏ**. Đặt nó sau cùng để lần đo lại cuối cùng của Task 5 là lần đo trên đúng bộ số cuối cùng.
4. **Task 5 gom mọi việc đo lại**, viết lại mục L, chốt ngưỡng `balance.test.ts`.

Thứ tự trên là thứ tự **logic**. Thứ tự **chạy thật** ở phần ngay dưới: ba đợt, hai đợt đầu tung sub-agent song song.

---

## Phân công sub-agent chạy song song

REQUIRED SUB-SKILL khi tung: superpowers:dispatching-parallel-agents. Vòng kiểm giữa các đợt theo superpowers:subagent-driven-development.

### Nguyên tắc chia việc

**Chia theo FILE, không chia theo bước.** Hai agent chạy cùng lúc **không được phép chạm cùng một file** — đó là ràng buộc duy nhất quyết định đợt nào gồm task nào. Cùng một file dù khác vùng vẫn có thể làm agent kia hỏng lượt sửa vì tệp đã đổi sau khi nó đọc.

Việc gộp Task 2 và Task 3 vào cùng một đợt là **không** làm được: cả hai đều sửa `config.ts`. Việc gộp Task 2 và Task 4 cũng không: cả hai đều sửa `engine.test.ts`.

### Ba đợt

| Đợt | Agent | Task | File độc quyền của agent đó |
|---|---|---|---|
| **1** | `A1-go-chi-tieu` | Task 1 | `docs/07-thiet-ke-v1-7.md`, `src/game/balance.test.ts` |
| **1** | `A2-tran-ban-thao` | Task 3 | `src/game/config.ts`, `src/game/engine.ts`, `src/game/engine.test.ts` |
| **1** | `A3-don-dep` | Task 6 Step 1–2 | `docs/superpowers/plans/2026-08-11-v1-7-du-kho-de-phai-chon.md` |
| **2** | `B1-ky-han-vay` | Task 2 | `src/game/config.ts`, `src/game/engine.test.ts`, `src/game/balance.test.ts` |
| **2** | `B2-duong-luong-giao-vien` | Task 4 | `src/game/content.ts` |
| **3** | *(chạy thẳng, không tung agent)* | Task 5 + Task 6 Step 3 | tất cả |

### Ma trận file × agent — kiểm chứng không đụng nhau

| File | A1 | A2 | A3 | B1 | B2 |
|---|---|---|---|---|---|
| `docs/07-thiet-ke-v1-7.md` | ✏️ | | | | |
| `docs/…/2026-08-11-v1-7-du-kho-de-phai-chon.md` | | | ✏️ | | |
| `src/game/config.ts` | | ✏️ | | ✏️ | |
| `src/game/engine.ts` | | ✏️ | | | |
| `src/game/content.ts` | | | | | ✏️ |
| `src/game/engine.test.ts` | | ✏️ | | ✏️ | ⚠️ |
| `src/game/balance.test.ts` | ✏️ | | | ✏️ | |

Trong mỗi đợt, không cột nào chồng lên cột nào. `config.ts` và `engine.test.ts` xuất hiện hai lần nhưng ở **hai đợt khác nhau**, nên là tuần tự.

⚠️ **Ngoại lệ duy nhất, phải xử lý bằng phân công chứ không bằng may rủi:** Task 4 Step 2 cần sửa một hằng số trong `engine.test.ts` (bài `'lương tuổi 40 của ba nghề phân kỳ đúng như thiết kế'`), mà `engine.test.ts` ở đợt 2 thuộc quyền B1. **Giao bước đó cho B1 làm luôn**, không để B2 chạm vào. B2 chỉ sửa `content.ts` rồi báo lại con số lương tuổi 40 mới cho người điều phối chuyển sang B1 — hoặc đơn giản hơn: B1 tự tính lại từ bộ số `0.035 / 0.03 / 0.025` đã ghi sẵn trong Task 4 Step 3, không cần chờ B2.

### Quy tắc bắt buộc cho mọi sub-agent

1. **KHÔNG chạy `git add`, `git commit`, `git checkout` hay bất kỳ lệnh git nào thay đổi trạng thái.** Người điều phối commit sau khi duyệt. Hai agent commit cùng lúc vào một repo là hỏng chỉ mục.
2. **Chỉ sửa những file được liệt kê trong ô "File độc quyền" của mình.** Thấy cần sửa file ngoài danh sách thì **dừng và báo lại**, không tự sửa.
3. **Chỉ chạy test có lọc phạm vi** (`npm test -- <file> -t "<tên>"`), không chạy `npm test` trần — ba tiến trình vitest cùng lúc làm chậm nhau và làm nhiễu số đo.
4. **KHÔNG dùng `npx`** (cài đặt npm trên máy này hỏng). Biên dịch: `./node_modules/.bin/tsc -b --noEmit`.
5. **KHÔNG nới ngưỡng test cân bằng.** Bài nào đỏ thì chép tên vào báo cáo, để Task 5 xử lý. Đây là quy tắc quan trọng nhất của cả kế hoạch.
6. **Báo cáo trả về phải có đủ:** danh sách file đã sửa, lệnh test đã chạy và kết quả nguyên văn, mọi bài đỏ kèm tên, mọi chỗ đi lệch khỏi kế hoạch kèm lý do, và mọi dòng `console.log` số đo mà bước của mình yêu cầu chép lại.

### Prompt mẫu để tung agent

Cùng một khuôn cho cả năm, đổi ba chỗ in đậm:

> Bạn thực hiện **Task N** của kế hoạch `docs/superpowers/plans/2026-08-11-v1-7-viec-con-lai.md` trong repo `e:\thont\99_Khac\CashFlow` (nhánh `v1-7-du-kho-de-phai-chon`).
>
> Đọc trọn kế hoạch trước, đặc biệt là mục **Global Constraints** và mục **Quy tắc bắt buộc cho mọi sub-agent** — mọi quy tắc ở đó áp dụng cho bạn không trừ điều nào.
>
> Bạn **chỉ được sửa** các file sau: **`<danh sách file độc quyền>`**. Cần sửa file khác thì dừng lại và báo.
>
> Làm đúng từng Step của Task N theo thứ tự, kể cả các bước chạy test để xác nhận đỏ trước khi cài đặt — đây là kế hoạch viết theo lối phát triển hướng kiểm thử, bỏ bước xác nhận đỏ là bỏ mất giá trị của nó.
>
> **KHÔNG chạy bất kỳ lệnh git nào.** Bỏ qua Step commit cuối cùng của task; người điều phối sẽ commit sau khi duyệt.
>
> Trả về báo cáo theo đúng sáu mục ở "Quy tắc bắt buộc" điều 6.

### Cổng kiểm giữa các đợt — người điều phối làm, không giao agent

Sau **đợt 1**:

1. Đọc ba báo cáo, đối chiếu với `git diff` xem có agent nào chạm ra ngoài phần được giao không.
2. Chạy `npm test` và `./node_modules/.bin/tsc -b --noEmit` một lần cho cả ba.
3. **Tung một agent duyệt mã cho riêng Task 3** (`feature-dev:code-reviewer`) — nó là thay đổi engine duy nhất của cả kế hoạch, và nó đụng vào nhánh vỡ nợ, chỗ khó thử tay nhất. Việc duyệt cần nhìn kỹ: trần tính trên danh mục **trước** khi bán chứ không tính lại sau mỗi lần bán, `conDuocBan` trừ đúng, và nhánh `Math.floor(conDuocBan / gia) === 0` không làm vòng lặp bỏ sót tài sản rẻ hơn ở sau.
4. Commit **ba commit riêng**, đúng thông điệp ghi trong Task 1, Task 3, Task 6 Step 1–2, mỗi commit `git add` đúng file của task đó.

Sau **đợt 2**: lặp lại bước 1, 2, 4 (không cần duyệt mã — hai task này chỉ đổi số và chữ). Chấp nhận `balance.test.ts` đỏ ở cổng này: Task 4 cố ý làm đỏ, và Task 5 nối ngay sau.

**Đợt 3 không tung agent.** Task 5 là công việc đo — vặn — đo lại có vòng lặp và cần đọc số bằng mắt giữa các vòng, giao cho agent thì nó rất dễ nới ngưỡng cho xanh, đúng cái điều mà cả kế hoạch này cấm.

---

## Ba quyết định còn treo — cần người chốt trước Task 4

Kế hoạch **không tự quyết** ba điểm này; mỗi điểm có phương án mặc định để không chặn việc, ghi rõ ở đây để người quyết thấy hết hệ quả.

**Q1 — Đường cong bác sĩ có trả về số thiết kế gốc không?**
Bác sĩ cũng bị vặn ×1,2 ở vòng hiệu chỉnh (`0.05/0.09/0.05` → `0.06/0.108/0.06`, `content.ts:101-106`) vì đúng cùng một lý do với giáo viên: kéo tỉ lệ thắng vào dải. Nếu chỉ trả giáo viên về số thật mà giữ bác sĩ vặn thì tài liệu sẽ khó giải thích. *Mặc định của kế hoạch: giữ nguyên bác sĩ, chỉ trả giáo viên* — vì việc người dùng chốt chỉ nói tới giáo viên. Đổi ý thì sửa Task 4 Step 3.

**Q2 — Chỉ tiêu 1 trở thành gì sau khi giáo viên về 11%?**
Hai lựa chọn, loại trừ nhau:
- **(a) Chấp nhận ba nghề khác nhau thật.** `balance.test.ts` chuyển từ một dải chung sang dải riêng từng nghề, và thông điệp của game thành "nghề bạn chọn quyết định phần lớn cuộc chơi" — thành thật, khắc nghiệt, đúng đời.
- **(b) Giữ dải chung 45–55% bằng cách vặn chỗ khác.** Đòn bẩy khả dụng là `tuDoTaiChinh.heSoToiThieu/heSoPhuThem` (`config.ts:47-48`), nhưng mục L đã đo: hạ hệ số an toàn đẩy tỉ lệ thắng lên **và** làm chênh lệch rộng ra, nên nó gần như chắc chắn không cứu được giáo viên mà không thổi bay hai nghề kia.
*Mặc định của kế hoạch: (a).*

**Q3 — `heSoToiThieu`/`heSoPhuThem` có hiệu chỉnh lại không?**
Cặp `2.2 / 2.4` hiện tại được dò trên đường cong giáo viên đã vặn. Sau Task 4 nó không còn là điểm tối ưu. *Mặc định: giữ nguyên, chỉ đo và ghi lại ở Task 5* — vặn tiếp là mở một vòng hiệu chỉnh mới, phải do người mở.

---

## Cấu trúc file

| File | Trách nhiệm | Task chạm tới |
|---|---|---|
| `docs/07-thiet-ke-v1-7.md` | Mục J (mục tiêu), mục L (số đo thật) | 1, 2, 3, 4, 5 |
| `src/game/config.ts` | `kyHanVayToiDa`, trần bán tháo mới | 2, 3 |
| `src/game/content.ts` | Đường cong sự nghiệp giáo viên | 4 |
| `src/game/engine.ts` | Nấc 1 của ba nấc vỡ nợ | 3 |
| `src/game/engine.test.ts` | Test cơ chế | 2, 3 |
| `src/game/balance.test.ts` | Lưới an toàn cân bằng | 1, 2, 5 |
| `src/ui/TabTrangChu.tsx` | Bảng giải thích khoản vay | 2 |

---

## Task 1: Bỏ mục tiêu chênh lệch ≤ 15 điểm

*(Việc số 4 trong danh sách người dùng.)*

Mục J của tài liệu thiết kế vẫn đòi giữ chênh lệch giữa bốn xuất thân và giữa năm bậc lương ở mức ≤ 15 điểm. Mục L đã chứng minh **chỉ tiêu này loại trừ nhau với chỉ tiêu tỉ lệ thắng 45–55%**: trần 15 điểm của v1.6 chỉ đo được vì bot thắng 91–94% nên mọi xuất thân đều đụng trần. Task này gỡ mục tiêu đã biết là mâu thuẫn ra khỏi tài liệu, để bảng mục tiêu không còn tự mâu thuẫn với chính nó.

Đây là task **thuần tài liệu và chữ nghĩa** — không đổi một con số nào trong `src/`, và `npm test` phải xanh y nguyên trước sau.

**Files:**
- Modify: `docs/07-thiet-ke-v1-7.md:499-522` (bảng mục J và ghi chú dưới bảng)
- Modify: `src/game/balance.test.ts:347-400` (chú thích khối và tên hai bài test)

**Interfaces:**
- Consumes: không có
- Produces: không có (không đổi mã chạy được)

- [ ] **Step 1: Chạy test để ghi mốc trước khi sửa**

Chạy: `npm test -- src/game/balance.test.ts`
Kỳ vọng: 12/12 xanh. Chép hai dòng `console.log` của bài xuất thân và bài bậc lương để đối chiếu ở Step 5.

- [ ] **Step 2: Sửa bảng mục J trong tài liệu thiết kế**

Trong `docs/07-thiet-ke-v1-7.md`, xoá hai dòng:

```markdown
| Chênh lệch giữa bốn xuất thân | ≤ 15 điểm | giữ **≤ 15 điểm** |
| Chênh lệch giữa năm bậc lương | ≤ 15 điểm | giữ **≤ 15 điểm** |
```

và thay bằng:

```markdown
| Chênh lệch giữa bốn xuất thân | ≤ 15 điểm | **không đặt mục tiêu** — xem ghi chú |
| Chênh lệch giữa năm bậc lương | ≤ 15 điểm | **không đặt mục tiêu** — xem ghi chú |
```

- [ ] **Step 3: Thay ghi chú dưới bảng mục J**

Đoạn trích dẫn hiện có bắt đầu bằng `> **Đã đo xong — xem mục L.**` nay phải nói rõ hai dòng kia đã bị gỡ chứ không phải trượt chỉ tiêu. Thay trọn khối trích dẫn đó bằng:

```markdown
> **Đã đo xong — xem mục L.** Bảng trên là mục tiêu đặt ra trước khi cài đặt. Ba chỉ tiêu
> đạt (tỉ lệ thắng, chênh lệch ba nghề, tuổi thắng), bốn không đạt, và hai dòng chênh
> lệch xuất thân/bậc lương đã được **gỡ khỏi danh sách chỉ tiêu** — không phải vì trượt
> mà vì chúng **loại trừ nhau** với dòng đầu bảng.
>
> Lý do đầy đủ ở mục L: trần 15 điểm của v1.6 là một **hiệu ứng trần**, không phải một
> tính chất công bằng của game. Khi bot thắng 91–94% thì nhà thuần nông thắng 85% và nhà
> khá giả thắng 97%, chênh nhau vỏn vẹn 12 điểm chỉ vì cả hai đều bị ép sát 100%. Kéo tỉ
> lệ thắng về 45–55% theo đúng chỉ tiêu đầu bảng thì trần biến mất và khoảng cách THẬT
> lộ ra: 24 điểm và 33 điểm. Quét `heSoAnToanTheoTuoi` qua bốn mức cho thấy đẩy tỉ lệ
> thắng LÊN làm chênh lệch RỘNG ra chứ không hẹp lại — không có điểm nào thoả cả hai.
>
> Thay cho một trần cứng, `balance.test.ts` chốt bất biến còn đúng và còn đáng chốt:
> **không xuất thân nào và không bậc lương nào được thành nước đi hiển nhiên đúng hay
> hiển nhiên sai** (mọi tỉ lệ thắng nằm trong khoảng 10–90%), kèm trần lỏng 40 điểm bám
> theo khoảng thật quan sát được để vẫn bắt được hồi quy.
```

- [ ] **Step 4: Sửa tên hai bài test và chú thích khối trong `balance.test.ts`**

Tên bài hiện tại nhắc tới "trần 15 điểm của v1.6 không còn giữ được" — nay chỉ tiêu đã gỡ hẳn nên tên phải nói bất biến đang được chốt, không nói cái đã bỏ. Đổi:

```ts
  it('bốn xuất thân chênh nhau 24 điểm — không xuất thân nào là nước đi hiển nhiên', () => {
```

```ts
  it('năm bậc lương chênh nhau 33 điểm — không bậc nào là nước đi hiển nhiên', () => {
```

Trong chú thích khối phía trên hai bài (bắt đầu bằng `---------- Trần 15 điểm KHÔNG còn giữ được`), đổi đúng dòng tiêu đề và câu mở:

```ts
  /**
   * ---------- Vì sao ở đây không có trần chênh lệch cứng ----------
   * Mục J bản đầu muốn giữ chênh lệch giữa bốn xuất thân và giữa năm bậc lương ở
   * mức ≤ 15 điểm như v1.6. Chỉ tiêu đó đã được GỠ khỏi mục J, vì nó loại trừ
   * nhau với chỉ tiêu tỉ lệ thắng 45–55% ở đầu bảng. Đo thật: 24 điểm và 33 điểm.
```

Giữ nguyên toàn bộ phần còn lại của chú thích (giải thích hiệu ứng trần, bảng quét `heSoAnToanTheoTuoi`, lý do chọn ngưỡng 40 điểm) — nó vẫn đúng từng chữ.

- [ ] **Step 5: Chạy test để xác nhận không có gì đổi**

Chạy: `npm test -- src/game/balance.test.ts`
Kỳ vọng: 12/12 xanh, và hai dòng `console.log` in ra **đúng cùng con số** với Step 1 (24 điểm và 33 điểm). Số lệch nghĩa là đã lỡ tay đụng vào mã chạy được — quay lại sửa.

- [ ] **Step 6: Commit**

```bash
git add docs/07-thiet-ke-v1-7.md src/game/balance.test.ts
git commit -m "v1.7 go chi tieu chenh lech 15 diem khoi muc J

Tran 15 diem cua v1.6 la mot HIEU UNG TRAN chu khong phai tinh chat cong
bang cua game: khi bot thang 91-94 phan tram thi moi xuat than deu bi ep
sat 100 nen khoang cach that bi nen lai. Keo ti le thang ve 45-55 thi tran
bien mat va khoang cach lo ra nguyen ven — 24 diem va 33 diem.

Quet heSoAnToanTheoTuoi qua bon muc cho thay day ti le thang LEN lam chenh
lech RONG ra chu khong hep lai: hai chi tieu nay loai tru nhau, va viec muc
J doi ca hai la mot mau thuan chua ai nhin ra luc viet.

Thay cho tran cung, balance.test.ts chot bat bien con dung: khong xuat than
nao va khong bac luong nao duoc thanh nuoc di hien nhien dung hay hien
nhien sai. Khong doi mot con so nao trong src, test xanh y nguyen.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Test đã đỏ:** _(không có — task này không được phép làm đỏ bài nào)_

---

## Task 2: Kỳ hạn vay 10 → 20 năm

*(Việc số 3 trong danh sách người dùng.)*

Đòn bẩy hiện là **nước đi lỗ chắc chắn**: trả góp đều gốc cộng lãi đơn nên mỗi năm phải trả `(1 + 0,08 × 10) ÷ 10 = 18%` gốc, trong khi dải sinh lời doanh nghiệp sau thuế chỉ còn 9,6–14,4%. Lỗ 3,6 tới 8,4 điểm mỗi năm ở **mọi** cơ hội trong bộ bài, nên một bot biết tính sẽ không bao giờ vay — đo thật bot đòn bẩy thắng 25,5% so với 49,0% của bot cân bằng.

Kéo kỳ hạn lên hai mươi năm đưa chi phí vay về `(1 + 0,08 × 20) ÷ 20 = 13%`/năm, nằm **gọn giữa** dải 9,6–14,4%: cơ hội tốt thì có lãi mỏng, cơ hội thường thì lỗ. Đó đúng là cái cân não mà mục D muốn. Giữ nguyên `laiSuatVay` 8% vì hạ lãi suất xuống 2% để đạt cùng kết quả sẽ đặt lãi suất ngân hàng Việt Nam ở mức phi thực tế, trong khi vay hai mươi năm đúng là chuyện thường của một khoản thế chấp.

**Files:**
- Modify: `src/game/config.ts:196-201` (khối khoản vay)
- Modify: `src/game/balance.test.ts:195-230` (bài "bot đòn bẩy nay thua thiệt…")
- Test: `src/game/engine.test.ts`
- Đọc để xác nhận không phải sửa: `src/ui/TabTrangChu.tsx:211-212`, `src/game/sim.ts:347`, `src/game/engine.ts:849-851`

**Interfaces:**
- Consumes: `CONFIG.laiSuatVay`, `CONFIG.thue.thueDoanhNghiep` (đã có)
- Produces: `CONFIG.kyHanVayToiDa = 20`

- [ ] **Step 1: Viết test thất bại cho chi phí vay mới**

Thêm vào cuối `src/game/engine.test.ts`:

```ts
describe('v1.7 đợt 2 — kỳ hạn vay hai mươi năm', () => {
  it('chi phí vay mỗi năm rơi vào GIỮA dải sinh lời doanh nghiệp sau thuế', () => {
    // Đây là toàn bộ lý do của thay đổi này. Kỳ hạn 10 năm cho chi phí 18%/năm,
    // nằm TRÊN cả trần 14,4% của dải sinh lời sau thuế, nên vay là lỗ chắc chắn
    // ở mọi cơ hội trong bộ bài — đòn bẩy hết là canh bạc, thành cái bẫy thuần
    // tuý. Kỳ hạn 20 năm cho 13%/năm, nằm giữa 9,6% và 14,4%: cơ hội tốt thì có
    // lãi mỏng, cơ hội thường thì lỗ. Đó mới là một quyết định.
    const chiPhiVayMoiNam =
      (1 + CONFIG.laiSuatVay * CONFIG.kyHanVayToiDa) / CONFIG.kyHanVayToiDa
    const sauThue = 1 - CONFIG.thue.thueDoanhNghiep
    expect(chiPhiVayMoiNam).toBeGreaterThan(0.12 * sauThue)
    expect(chiPhiVayMoiNam).toBeLessThan(0.18 * sauThue)
  })

  it('khoản vay mới lập đúng hai mươi kỳ và trả nhẹ hơn hẳn kỳ hạn cũ', () => {
    const goc = 1 * TY
    const traMoiNamMoi = thanhToanMoiNamCuaKhoanVay(goc, CONFIG.kyHanVayToiDa)
    const traMoiNamCu = thanhToanMoiNamCuaKhoanVay(goc, 10)
    expect(CONFIG.kyHanVayToiDa).toBe(20)
    expect(traMoiNamMoi).toBeLessThan(traMoiNamCu)
    // 1 tỷ × (1 + 0,08 × 20) ÷ 20 = 130 triệu mỗi năm
    expect(traMoiNamMoi).toBe(130 * TRIEU)
  })
})
```

`thanhToanMoiNamCuaKhoanVay` đã được `engine.ts:559` xuất ra và `engine.test.ts` đã import sẵn — kiểm tra dòng import ở đầu file, thiếu thì bổ sung.

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "kỳ hạn vay hai mươi năm"`
Kỳ vọng: FAIL — `expected 0.18 to be less than 0.144` và `expected 10 to be 20`.

- [ ] **Step 3: Đổi `kyHanVayToiDa` và viết lại chú thích khối**

Trong `src/game/config.ts`, đổi `kyHanVayToiDa: 10,` thành `kyHanVayToiDa: 20,` và thêm ngay trên dòng đó:

```ts
  /**
   * Kỳ hạn kéo từ 10 lên 20 năm ở v1.7 đợt 2, giữ nguyên lãi suất 8%.
   *
   * Trả góp đều gốc cộng lãi đơn nên chi phí vay mỗi năm là
   * `(1 + laiSuat × kyHan) ÷ kyHan`: kỳ hạn 10 năm ra 18%, kỳ hạn 20 năm ra 13%.
   *
   * Vì sao phải đổi: v1.7 hạ dải sinh lời doanh nghiệp về 12–18% rồi thuế thu
   * nhập doanh nghiệp 20% cắn tiếp, còn thực nhận 9,6–14,4%. Vay 18% để kiếm
   * 9,6–14,4% là lỗ chắc chắn 3,6 tới 8,4 điểm mỗi năm ở MỌI cơ hội trong bộ
   * bài — đòn bẩy thôi là canh bạc và thành cái bẫy thuần tuý, đo thật bot đòn
   * bẩy thắng 25,5% so với 49,0% của bot cân bằng. 13% nằm gọn GIỮA dải thực
   * nhận: cơ hội tốt thì có lãi mỏng, cơ hội thường thì lỗ. Đó mới là quyết định.
   *
   * Vì sao không hạ lãi suất thay vì kéo kỳ hạn: hạ `laiSuatVay` xuống 2% để kỳ
   * hạn 10 năm ra 12%/năm cho kết quả tương đương, nhưng đặt lãi suất ngân hàng
   * Việt Nam ở mức phi thực tế. Vay hai mươi năm thì đúng là chuyện thường của
   * một khoản thế chấp.
   */
```

- [ ] **Step 4: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "kỳ hạn vay hai mươi năm"`
Kỳ vọng: PASS, cả hai bài.

- [ ] **Step 5: Sửa bài "bot đòn bẩy" trong `balance.test.ts`**

Bài này đang chốt `expect(chiPhiVayMoiNam).toBeGreaterThan(sinhLoiToiDaSauThue)` — khẳng định "vay là lỗ chắc chắn", nay **cố ý không còn đúng** nên nó sẽ đỏ. Thay ba dòng khẳng định số học:

```ts
    const chiPhiVayMoiNam =
      (1 + CONFIG.laiSuatVay * CONFIG.kyHanVayToiDa) / CONFIG.kyHanVayToiDa
    const sinhLoiToiDaSauThue = 0.18 * (1 - CONFIG.thue.thueDoanhNghiep)
    expect(chiPhiVayMoiNam).toBeGreaterThan(sinhLoiToiDaSauThue)
```

bằng:

```ts
    // Chi phí vay mỗi năm tính thẳng từ CONFIG, không viết cứng. Từ v1.7 đợt 2
    // nó phải nằm GIỮA sàn và trần của dải sinh lời sau thuế: dưới trần thì
    // cơ hội tốt còn cửa có lãi, trên sàn thì cơ hội thường vẫn lỗ.
    const chiPhiVayMoiNam =
      (1 + CONFIG.laiSuatVay * CONFIG.kyHanVayToiDa) / CONFIG.kyHanVayToiDa
    const sauThue = 1 - CONFIG.thue.thueDoanhNghiep
    expect(chiPhiVayMoiNam).toBeGreaterThan(0.12 * sauThue)
    expect(chiPhiVayMoiNam).toBeLessThan(0.18 * sauThue)
```

Đổi tên bài và câu mở của chú thích khối cho khớp:

```ts
  it('bot đòn bẩy vẫn thua thiệt nhưng vay không còn lỗ chắc chắn', () => {
```

**Hai dòng cuối bài — `donBay.tyLeThang < canBang.tyLeThang` và `donBay.soNamTrungBinhKhiThang > canBang.soNamTrungBinhKhiThang` — GIỮ NGUYÊN và không được nới ở task này.** Nếu chúng đỏ nghĩa là kỳ hạn dài đã lật đòn bẩy thành nước đi có lãi, một kết quả cân bằng đáng giá phải đo và ghi chứ không phải xoá: chép vào mục "Test đã đỏ" bên dưới và để Task 5 xử lý.

- [ ] **Step 6: Chạy toàn bộ và ghi nhận bài đỏ**

Chạy: `npm test`
Kỳ vọng: `engine.test.ts` phải xanh hết — các bài ở `engine.test.ts:268`, `:2160-2163` đọc `CONFIG.kyHanVayToiDa` nên tự bám theo; đỏ ở đó là lỗi thật, phải sửa ngay trong task này. `balance.test.ts` có thể đỏ ở vài bài vì tỉ lệ thắng của bot đòn bẩy vừa dời — **chép tên vào mục "Test đã đỏ", không nới ngưỡng.**

- [ ] **Step 7: Xác nhận giao diện tự bám theo, không sửa tay**

Đọc `src/ui/TabTrangChu.tsx:211-212`. Câu chữ ở đó đọc thẳng `CONFIG.kyHanVayToiDa` nên tự in ra "kỳ hạn tối đa 20 năm". **Không sửa gì**, chỉ xác nhận bằng mắt rằng câu vẫn đọc trôi với số mới.

- [ ] **Step 8: Biên dịch**

Chạy: `./node_modules/.bin/tsc -b --noEmit`
Kỳ vọng: không lỗi.

- [ ] **Step 9: Commit**

```bash
git add src/game/config.ts src/game/engine.test.ts src/game/balance.test.ts
git commit -m "v1.7 ky han vay 10 len 20 nam, don bay thanh quyet dinh that

Tra gop deu goc cong lai don nen chi phi vay moi nam la (1 + lai x ky han)
chia ky han: ky han 10 nam ra 18 phan tram. Dai sinh loi doanh nghiep sau
thue chi con 9,6-14,4 phan tram, nen vay la lo CHAC CHAN o moi co hoi
trong bo bai — do that bot don bay thang 25,5 so voi 49,0 phan tram.

Ky han 20 nam ha chi phi vay ve 13 phan tram, nam gon giua dai thuc nhan:
co hoi tot thi co lai mong, co hoi thuong thi lo. Do moi la mot quyet dinh.

Giu nguyen lai suat 8 phan tram: ha lai suat xuong 2 de dat cung ket qua
se dat lai suat ngan hang Viet Nam o muc phi thuc te, trong khi vay hai
muoi nam dung la chuyen thuong cua mot khoan the chap.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Test đã đỏ:** _(điền tên bài đỏ ở Step 5 và Step 6)_

---

## Task 3: Chặn bán tháo vô hạn ở nấc 1

*(Việc số 2 trong danh sách người dùng — task nặng nhất của kế hoạch.)*

Phá sản đo ra **0% ở cả hai chiến lược** dù ván nay chạy trọn 79 năm. Mục L đã đếm trực tiếp và khoanh đúng thủ phạm: nấc 1 bán tài sản đầu tư **không giới hạn**, bán tới khi tiền mặt hết âm. Nấc 3 lại đòi khoản thiếu hụt còn vượt trọn một năm chi phí *sau khi* đã bán sạch tài sản và thanh lý hết doanh nghiệp. Người chơi đem tiền đi đầu tư thì luôn có cái để bán, nên trạng thái "nghèo tài sản mà nặng nợ" — trạng thái **duy nhất** dẫn tới nấc 3 — không bao giờ xuất hiện. Bot đòn bẩy vay 15–27 tỷ mỗi ván ở 149/150 ván mà nấc 3 chỉ nổ đúng **1 lần**.

Đây là giới hạn **cấu trúc** của engine, không phải con số chưa vặn tới: quét `xacSuatPhaSanCoBan` từ 0,02 tới 0,15 cho ra 0 ván phá sản ở mọi mức.

Cách sửa: mỗi năm nấc 1 chỉ được bán một **phần** giá trị danh mục. Bán tháo trong hoảng loạn không bao giờ thanh khoản tức thì ngoài đời — ai từng phải bán gấp một mảnh đất đều biết. Phần thiếu hụt còn sót lại khi đó đủ sức đẩy xuống nấc 2 rồi nấc 3.

**Files:**
- Modify: `src/game/config.ts` (khối `phaSan`, thêm `tyLeBanToiDaMoiNam` ngay sau `nguongTheoChiPhi`)
- Modify: `src/game/engine.ts:2026-2049` (nấc 1 và câu chữ của hai sự kiện)
- Test: `src/game/engine.test.ts`

**Interfaces:**
- Consumes: `CONFIG.phaSan.nguongTheoChiPhi`, `CONFIG.phaSan.tyLeThanhLyDoanhNghiep` (đã có)
- Produces: `CONFIG.phaSan.tyLeBanToiDaMoiNam: number` — tỉ lệ giá trị danh mục đầu năm được phép bán trong một năm

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `src/game/engine.test.ts`. Bộ này dùng lại đúng khuôn `vanVoNo` và hàm trợ giúp `diTronMotNam` của `describe('v1.6 — ba nấc vỡ nợ')` — đọc khối đó trước (khoảng dòng 2839) rồi khai báo lại `vanVoNo` cục bộ y hệt trong describe mới:

```ts
describe('v1.7 đợt 2 — nấc 1 không còn bán tháo vô hạn', () => {
  /** Ván âm tiền nặng: không tiền mặt, nợ lớn phải trả ngay năm nay. */
  const vanVoNo = (them: Partial<GameState> = {}): GameState => ({
    ...moiVan(),
    nam: 12,
    tienMat: 0,
    lichBienCo: [],
    khoanVay: [
      { id: 'v1', goc: 3 * TY, kyHan: 20, thanhToanMoiNam: 900 * TRIEU, namConLai: 8 },
    ],
    ...them,
  })

  it('một năm chỉ bán được tối đa phần danh mục mà config cho phép', () => {
    // 1000 phần trái phiếu × 1 triệu = 1 tỷ danh mục, thiếu hụt ~900 triệu.
    // Trước thay đổi này: bán 900 phần, hết âm, không hề hấn gì. Nay trần 40%
    // chỉ cho bán 400 phần, nên ít nhất 599 phần phải còn lại trong tay.
    const s = vanVoNo({ soHuu: { ...moiVan().soHuu, traiPhieu: 1000 } })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.soHuu.traiPhieu).toBeGreaterThanOrEqual(599)
  })

  it('còn tài sản đầy trong tay mà vẫn phá sản được — điều v1.7 chưa làm nổi', () => {
    // Đây là toàn bộ lý do của task này. Trạng thái "nghèo thanh khoản mà nặng
    // nợ" là trạng thái DUY NHẤT dẫn tới nấc 3, và trước thay đổi này nó không
    // bao giờ xuất hiện vì người có tài sản thì luôn bán được sạch.
    const s = vanVoNo({ soHuu: { ...moiVan().soHuu, traiPhieu: 1000 } })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.soLanPhaSan).toBe(1)
    expect(sau.soHuu.traiPhieu).toBeGreaterThan(0)
  })

  it('thiếu hụt nhỏ hơn trần thì vẫn bán đủ như cũ, không phá sản', () => {
    // Trần không được phép biến mọi cú hụt tiền thành thảm hoạ: 5 tỷ danh mục
    // cho phép bán tới 2 tỷ trong năm, thừa sức bù 900 triệu.
    const s = vanVoNo({ soHuu: { ...moiVan().soHuu, traiPhieu: 5000 } })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    expect(sau.soLanPhaSan).toBe(0)
    expect(sau.soHuu.traiPhieu).toBeGreaterThan(4000)
  })

  it('bán tháo bị chặn nay đẩy thiếu hụt xuống tận nấc 2', () => {
    const s = vanVoNo({
      soHuu: { ...moiVan().soHuu, traiPhieu: 1000 },
      doanhNghiep: [
        {
          coHoiId: 'quanCaPhe',
          ten: 'Mở quán cà phê nhỏ',
          thuNhapNen: 1,
          chiSoGiaLucMua: 1,
          vonGoc: 400 * TRIEU,
          namGop: 12,
        },
      ],
    })
    const sau = reducer(diTronMotNam(s, 0), { type: 'dongTongKet' })
    // Trước thay đổi này: 1 tỷ trái phiếu thừa sức bù 900 triệu nên doanh
    // nghiệp không bị đụng tới. Nay nấc 1 dừng ở 400 triệu và nấc 2 vào cuộc.
    expect(sau.doanhNghiep).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận đỏ**

Chạy: `npm test -- src/game/engine.test.ts -t "nấc 1 không còn bán tháo"`
Kỳ vọng: FAIL ở ba bài (`expected 100 to be greater than or equal to 599`, `expected 0 to be 1`, `expected [ … ] to have length 0`). Bài thứ ba ("thiếu hụt nhỏ hơn trần") phải **xanh sẵn** — nó chốt hành vi cũ còn nguyên.

- [ ] **Step 3: Thêm `tyLeBanToiDaMoiNam` vào khối `phaSan` của `config.ts`**

Chèn ngay sau dòng `nguongTheoChiPhi: 1,`:

```ts
    /**
     * Nấc 1 mỗi năm chỉ được bán ngần này phần GIÁ TRỊ DANH MỤC đầu năm.
     *
     * ---------- Vì sao con số này tồn tại ----------
     * Trước v1.7 đợt 2, nấc 1 bán không giới hạn, bán tới khi tiền mặt hết âm.
     * Mà nấc 3 lại đòi khoản thiếu hụt còn vượt trọn một năm chi phí SAU KHI đã
     * bán sạch tài sản và thanh lý hết doanh nghiệp. Hệ quả: ai đem tiền đi đầu
     * tư thì luôn có cái để bán, nên trạng thái "nghèo thanh khoản mà nặng nợ" —
     * trạng thái DUY NHẤT dẫn tới nấc 3 — không bao giờ xuất hiện. Đo thật trên
     * 450 ván mỗi chiến lược: bot đòn bẩy vay 15–27 tỷ mỗi ván mà nấc 3 chỉ nổ
     * đúng một lần, bot cân bằng không lần nào. Phá sản 0% suốt hai bản liền.
     *
     * Quét `xacSuatPhaSanCoBan` từ 0,02 tới 0,15 không tạo nổi một ván phá sản
     * nào — đây là giới hạn CẤU TRÚC, không phải con số chưa vặn tới.
     *
     * ---------- Vì sao 0,4 ----------
     * Bán tháo trong hoảng loạn không bao giờ thanh khoản tức thì ngoài đời: một
     * mảnh đất cần vài tháng tới vài năm mới ra hàng, cổ phiếu nhỏ bán gấp thì
     * tự dìm giá của chính mình. 0,4 nghĩa là trong một năm bết bát nhất người
     * chơi vẫn xoay được gần nửa danh mục — rộng rãi so với đời thật, nhưng đủ
     * hẹp để một cú hụt tiền nặng đi tới được nấc 2 và nấc 3.
     *
     * Đây là đòn bẩy chính để hiệu chỉnh tỉ lệ phá sản: hạ xuống thì phá sản
     * nhiều hơn, nâng lên thì hiếm đi. Mục tiêu mục J là 8–18% cho bot cân bằng
     * và trên 30% cho bot đòn bẩy.
     */
    tyLeBanToiDaMoiNam: 0.4,
```

- [ ] **Step 4: Áp trần vào nấc 1 trong `engine.ts`**

Trong khối `/* --- Nấc 1: bán tài sản đầu tư --- */`, thay trọn vòng lặp hiện có:

```ts
    soHuu = { ...s.soHuu }
    let tienBanDuoc = 0
    const thuTuBan: AssetId[] = ['traiPhieu', 'vang', 'coPhieu', 'crypto', 'batDongSan']
    for (const id of thuTuBan) {
      if (tienMat >= 0) break
      const gia = giaMoi[id]
      const canBan = Math.min(Math.ceil(-tienMat / gia), soHuu[id])
      if (canBan <= 0) continue
      soHuu[id] -= canBan
      tienMat += canBan * gia
      tienBanDuoc += canBan * gia
    }
```

bằng:

```ts
    soHuu = { ...s.soHuu }
    let tienBanDuoc = 0
    // Trần bán tháo mỗi năm (v1.7 đợt 2): tính trên giá trị danh mục ĐẦU khi
    // vào nấc, không tính lại sau mỗi lần bán — nếu tính lại thì trần tự co
    // theo phần đã bán và người chơi vẫn bán được gần sạch qua đủ nhiều bước.
    const giaTriDanhMuc = TAI_SAN.reduce(
      (tong, ts) => tong + soHuu[ts.id] * giaMoi[ts.id],
      0,
    )
    let conDuocBan = Math.round(giaTriDanhMuc * CONFIG.phaSan.tyLeBanToiDaMoiNam)
    const thuTuBan: AssetId[] = ['traiPhieu', 'vang', 'coPhieu', 'crypto', 'batDongSan']
    for (const id of thuTuBan) {
      if (tienMat >= 0 || conDuocBan <= 0) break
      const gia = giaMoi[id]
      const canBan = Math.min(
        Math.ceil(-tienMat / gia),
        soHuu[id],
        Math.floor(conDuocBan / gia),
      )
      if (canBan <= 0) continue
      soHuu[id] -= canBan
      tienMat += canBan * gia
      tienBanDuoc += canBan * gia
      conDuocBan -= canBan * gia
    }
```

`TAI_SAN` đã được `engine.ts` import sẵn (dùng ở `dongTienThuDong`) — không thêm import mới.

- [ ] **Step 5: Sửa câu chữ hai sự kiện cho người chơi hiểu vì sao bán không hết**

Người chơi phải hiểu tại sao mình còn tài sản đầy trong tay mà vẫn túng, nếu không thì đây là một cú "engine ăn gian" chứ không phải một bài học. Trong sự kiện `'Bán tài sản trang trải'`, đổi `moTa` thành:

```ts
        moTa:
          'Chi tiêu trong năm vượt số tiền mặt đang có, đành bán bớt tài sản để cân đối. ' +
          `Bán gấp thì mỗi năm cũng chỉ ra hàng được chừng ${soPhanTram(CONFIG.phaSan.tyLeBanToiDaMoiNam)}% danh mục — ` +
          'không ai mua cả gia tài trong một tuần.',
```

Và trong sự kiện `'Túng thiếu'`:

```ts
      moTa:
        'Bán được tới mức thị trường nuốt nổi trong một năm mà vẫn chưa đủ bù chi tiêu, ' +
        'phải giật gấu vá vai qua ngày. Tài sản còn đó, chỉ là không kịp hoá thành tiền.',
```

`soPhanTram` đã có sẵn trong `engine.ts` (dùng ở sự kiện thanh lý doanh nghiệp).

- [ ] **Step 6: Chạy test để xác nhận xanh**

Chạy: `npm test -- src/game/engine.test.ts -t "nấc 1 không còn bán tháo"`
Kỳ vọng: PASS, cả bốn bài.

- [ ] **Step 7: Chạy toàn bộ `engine.test.ts` và sửa bài lệch vì trần mới**

Chạy: `npm test -- src/game/engine.test.ts`

Ba chỗ đã biết là có rủi ro, phải xem từng chỗ nếu đỏ — đây là test **cơ chế**, đỏ ở đây phải sửa ngay trong task này chứ không được hoãn sang Task 5:
- `engine.test.ts:1246` và `:1969-1971` — hai bài kiểm sự kiện `banTaiSan`. Nếu danh mục của tình huống thử nhỏ, trần 40% có thể đẩy chúng sang nhánh phá sản. Cách sửa đúng là **nâng số tài sản của tình huống thử** cho tới khi thiếu hụt lại nằm dưới trần, kèm chú thích giải thích, chứ không phải nới `nguongTheoChiPhi`.
- `engine.test.ts:2851` "thiếu tiền thì bán tài sản đầu tư trước khi đụng tới doanh nghiệp" — 5000 phần trái phiếu cho trần 2 tỷ, thừa sức bù, dự kiến vẫn xanh.

Bài nào phải sửa thì chép tên và lý do vào mục "Test đã đỏ".

- [ ] **Step 8: Đo nhanh tác động lên phá sản**

Chạy: `npm test -- src/game/balance.test.ts -t "CHỈ TIÊU 5"`
Kỳ vọng: dòng `console.log` in ra tỉ lệ phá sản **khác 0** ở ít nhất bot đòn bẩy. Chép nguyên dòng đó vào mục "Số đo" bên dưới — đây là số liệu Task 5 cần. Bài vẫn có thể đỏ vì ngưỡng cũ; **không nới**.

- [ ] **Step 9: Biên dịch**

Chạy: `./node_modules/.bin/tsc -b --noEmit`
Kỳ vọng: không lỗi.

- [ ] **Step 10: Commit**

```bash
git add src/game/config.ts src/game/engine.ts src/game/engine.test.ts
git commit -m "v1.7 chan ban thao vo han o nac 1 de pha san xay ra duoc

Muc L do that: pha san 0 phan tram o ca hai chien luoc du van nay chay tron
79 nam. Dem truc tiep tren 450 van moi chien luoc, nac 3 chi no dung mot lan
o bot don bay — bot vay 15-27 ty moi van ma khong do.

Thu pham la nac 1: no ban tai san KHONG GIOI HAN toi khi tien mat het am,
trong khi nac 3 doi khoan thieu hut con vuot tron mot nam chi phi SAU KHI da
ban sach. Ai dem tien di dau tu thi luon co cai de ban, nen trang thai ngheo
thanh khoan ma nang no — trang thai DUY NHAT dan toi nac 3 — khong bao gio
xuat hien. Quet xacSuatPhaSanCoBan tu 0,02 toi 0,15 khong tao noi mot van
pha san nao: day la gioi han cau truc, khong phai con so chua van toi.

Nay moi nam chi ban duoc 40 phan tram gia tri danh muc dau nam. Ban thao
trong hoang loan khong bao gio thanh khoan tuc thi ngoai doi. Cau chu cua
hai su kien cung noi ro dieu do, de nguoi choi hieu vi sao con tai san day
trong tay ma van tung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Test đã đỏ:** _(điền ở Step 7 và Step 8)_
**Số đo:** _(chép dòng console.log của Step 8)_

---

## Task 4: Trả đường lương giáo viên về 3,5%/năm

*(Việc số 1 trong danh sách người dùng.)*

**Đọc "Ba quyết định còn treo" ở đầu tài liệu này trước khi bắt đầu.** Task này cố ý làm đỏ hai chỉ tiêu đang xanh.

Vòng hiệu chỉnh v1.7 nhân đường cong giáo viên lên ×1,75 (`0.035/0.03/0.025` → `0.06/0.052/0.044`) để xoá 44,5 điểm chênh lệch giữa ba nghề. Mục L đã ghi thẳng rằng đây là nhượng bộ: 6%/năm tăng thực cao hơn hẳn thang lương viên chức Việt Nam, nơi lên bậc ba năm một lần chỉ cho khoảng 3,2%/năm. Quyết định đã chốt là **trả về số thật và chấp nhận hệ quả** — thà kể đúng chuyện đồng lương giáo viên còn hơn giữ một con số đẹp trong bảng cân bằng.

Hệ quả đã đo trước (mục L, thí nghiệm đối chứng): giáo viên trên đường cong của chính mình thắng **11%**. Vậy `CHỈ TIÊU 1` (45–55% và chênh ≤ 10 điểm) và có thể cả `CHỈ TIÊU 2` (tuổi thắng 52–62) sẽ đỏ. **Đó là kết quả, không phải lỗi.** Task 5 chốt lại ngưỡng.

**Files:**
- Modify: `src/game/content.ts:78-83` (đường cong giáo viên)
- Test: `src/game/engine.test.ts` (bài "lương tuổi 40 của ba nghề phân kỳ đúng như thiết kế")

**Interfaces:**
- Consumes: `tangLuongThucTheoTuoi(nghe, tuoi)` (đã có)
- Produces: không có hàm mới

- [ ] **Step 1: Đo mốc trước khi sửa**

Chạy: `npm test -- src/game/balance.test.ts -t "CHỈ TIÊU 1"`
Chép nguyên ba dòng `console.log` vào mục "Số đo" — đây là mốc "trước" để Task 5 so sánh.

- [ ] **Step 2: Sửa bài test lương tuổi 40 cho khớp số mới**

> **Khi chạy song song:** bước này **do agent B1 làm**, không phải B2 — `engine.test.ts` ở đợt 2 thuộc quyền B1. Xem mục "Phân công sub-agent chạy song song". B1 tự tính được con số mới từ bộ số ở Step 3 mà không cần chờ B2.

Bài `'lương tuổi 40 của ba nghề phân kỳ đúng như thiết kế'` trong `engine.test.ts` chốt lương giáo viên tuổi 40. Với đường cong đã vặn, con số hiện tại lớn hơn hẳn thiết kế gốc. Tính lại bằng chính công thức của bài — nhân dồn `1 + tangLuongThucTheoTuoi` từ tuổi 22 tới 40 trên bộ số mới `0.035 / 0.03 / 0.025` — rồi thay hằng số kỳ vọng của riêng giáo viên bằng kết quả đó, làm tròn tới hàng chục triệu như `toBeCloseTo(…, -1)` đang dùng. Giữ nguyên hai hằng số của bác sĩ và kỹ sư phần mềm.

Thêm chú thích ngay trên `expect` của giáo viên:

```ts
    // Số này là lương giáo viên trên đường cong THẬT (3,5% → 3% → 2,5%), sau khi
    // v1.7 đợt 2 trả nó về đúng thang lương viên chức. Con số cũ ứng với đường
    // cong đã bị vòng hiệu chỉnh nhân lên 1,75 lần.
```

- [ ] **Step 3: Trả đường cong giáo viên về số thiết kế gốc**

Trong `src/game/content.ts`, đổi khối `duongCongSuNghiep` của `giaoVien` thành:

```ts
    duongCongSuNghiep: [
      { denTuoi: 30, tangThuc: 0.035 },
      { denTuoi: 40, tangThuc: 0.03 },
      { denTuoi: 50, tangThuc: 0.025 },
      { denTuoi: 200, tangThuc: 0.02 },
    ],
```

Thay chú thích phía trên khối bằng:

```ts
    // giaoVien — lên bậc ba năm một lần, hệ số 2,34 → 4,98 sau hai mươi bốn năm,
    // tức khoảng 3,2%/năm tăng thực. Chậm, đều, không bao giờ bứt phá, cũng không
    // bao giờ sụp.
    //
    // ---------- Vì sao con số này trả về mức thật ở v1.7 đợt 2 ----------
    // Vòng hiệu chỉnh v1.7 từng nhân ba bậc đầu lên 1,75 lần (0,060 / 0,052 /
    // 0,044) để xoá 44,5 điểm chênh lệch tỉ lệ thắng giữa ba nghề. Nó đạt chỉ
    // tiêu, nhưng phải trả bằng cách cho giáo viên một thang lương không tồn tại.
    //
    // Quyết định đã chốt: trả về số thật và chấp nhận rằng giáo viên trên đồng
    // lương giáo viên thì rất khó đạt tự do tài chính. Đó là điều thật nhất mà
    // game này kể được, và đổi nó lấy một ô xanh trong bảng cân bằng là không
    // đáng. Chênh lệch giữa ba nghề vì vậy KHÔNG còn là chỉ tiêu phải đạt — nó
    // là thông điệp: nghề bạn chọn quyết định phần lớn cuộc chơi.
```

- [ ] **Step 4: Chạy test cơ chế**

Chạy: `npm test -- src/game/engine.test.ts -t "v1.7 — đường cong"`
Kỳ vọng: PASS cả năm bài. Bài `'giáo viên tăng chậm nhưng không bao giờ âm'` chốt `≤ 0.035` — nay lại đúng khít, trong khi trước đó nó xanh nhờ giới hạn nới hay nhờ số nào khác thì phải xem lại: nếu bài này từng được nới lên `0.06`, trả nó về `0.035` và ghi vào mục "Test đã đỏ".

- [ ] **Step 5: Đo lại và ghi nhận, KHÔNG nới ngưỡng**

Chạy: `npm test -- src/game/balance.test.ts`
Kỳ vọng: `CHỈ TIÊU 1` **đỏ** (giáo viên rơi khỏi dải 45–55%, chênh lệch ba nghề vượt 10 điểm), có thể kéo theo `CHỈ TIÊU 2`. Chép mọi dòng `console.log` vào mục "Số đo". **Không sửa một ngưỡng nào ở task này** — Task 5 làm việc đó với đầy đủ số liệu.

- [ ] **Step 6: Biên dịch**

Chạy: `./node_modules/.bin/tsc -b --noEmit`
Kỳ vọng: không lỗi.

- [ ] **Step 7: Commit** *(commit với `balance.test.ts` đang đỏ là CỐ Ý — Task 5 nối ngay sau)*

```bash
git add src/game/content.ts src/game/engine.test.ts
git commit -m "v1.7 tra duong luong giao vien ve 3,5 phan tram dung thuc te

Vong hieu chinh tung nhan ba bac dau len 1,75 lan (0,060 / 0,052 / 0,044)
de xoa 44,5 diem chenh lech ti le thang giua ba nghe. No dat chi tieu nhung
phai tra bang cach cho giao vien mot thang luong khong ton tai: thang luong
vien chuc that len bac ba nam mot lan, khoang 3,2 phan tram moi nam.

Quyet dinh da chot: tra ve so that va chap nhan rang giao vien tren dong
luong giao vien thi rat kho dat tu do tai chinh. Do la dieu that nhat ma
game nay ke duoc, doi no lay mot o xanh trong bang can bang la khong dang.

Chenh lech giua ba nghe vi vay khong con la chi tieu phai dat — no la thong
diep. balance.test.ts do o task nay la CO Y, task sau chot lai nguong bang
so do that.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Test đã đỏ:** _(điền ở Step 4 và Step 5)_
**Số đo:** _(chép console.log của Step 1 và Step 5 — trước và sau)_

---

## Task 5: Đo lại toàn bộ, chốt ngưỡng và viết lại mục L

Task **duy nhất** được phép chốt lại ngưỡng cân bằng. Ba thay đổi số của Task 2–4 đều dời nhiều chỉ tiêu cùng lúc, nên đo từng task một là lãng phí và dễ kết luận sai; task này đo một lần trên bộ số cuối cùng.

**Files:**
- Modify: `src/game/balance.test.ts` (chốt ngưỡng theo số đo thật)
- Modify: `docs/07-thiet-ke-v1-7.md` (mục L — bảng số đo, tham số đã vặn, các mục con đã lỗi thời)

**Interfaces:**
- Consumes: mọi thay đổi của Task 1–4
- Produces: không có

- [ ] **Step 1: Đo trọn bộ và lưu số**

Chạy: `npm test -- src/game/balance.test.ts 2>&1 | tee "C:/Users/thont/AppData/Local/Temp/claude/e--thont-99-Khac-CashFlow/do-lai-v1-7-dot-2.txt"`

Ghi lại đủ sáu con số cho **từng nghề**: tỉ lệ thắng · tuổi thắng trung bình · sống trọn đời · thua vì hạnh phúc · phá sản · hết đời chưa tự do; cộng hai con số phá sản của cặp cân bằng/đòn bẩy, và hai con số chênh lệch xuất thân/bậc lương.

- [ ] **Step 2: Chốt lại `CHỈ TIÊU 1` theo dải riêng từng nghề**

Đây là hệ quả trực tiếp của quyết định Q2 phương án (a). Thay bài `CHỈ TIÊU 1` bằng:

```ts
  /**
   * ---------- Vì sao chỉ tiêu này chuyển sang dải RIÊNG từng nghề ----------
   * Mục J bản đầu muốn cả ba nghề cùng thắng 45–55% và chênh nhau ≤ 10 điểm. Đạt
   * được điều đó đòi hỏi cho giáo viên một thang lương không tồn tại ngoài đời
   * (6%/năm tăng thực, so với 3,2% thật). v1.7 đợt 2 trả đường cong về số thật và
   * chấp nhận hệ quả: ba nghề KHÁC NHAU, và đó là thông điệp chứ không phải lỗi
   * cân bằng.
   *
   * Ngưỡng dưới đây bám theo số đo thật, nới đúng một biên an toàn quanh nó, và
   * vẫn đủ chặt để bắt hồi quy: một con số rơi ra ngoài nghĩa là vừa có thay đổi
   * thật sự dời cân bằng, phải đọc lại chứ không phải nới tiếp.
   */
  it('CHỈ TIÊU 1 — mỗi nghề nằm trong dải riêng đã đo, không nghề nào bất khả thi', () => {
    // TODO khi thực thi: điền [sàn, trần] theo số đo Step 1, biên ±8 điểm.
    const dai: Record<string, [number, number]> = { … }
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const [san, tran] = dai[nghe.id]!
      // eslint-disable-next-line no-console
      console.log(/* giữ nguyên khối log sáu con số của bài cũ */)
      expect(r.tyLeThang).toBeGreaterThanOrEqual(san)
      expect(r.tyLeThang).toBeLessThanOrEqual(tran)
    }
  })
```

Dải phải thoả hai ràng buộc, kiểm bằng mắt trước khi ghi vào: **không nghề nào có sàn dưới 8%** (dưới mức đó thì nghề ấy là bất khả thi chứ không phải khó, và đó là lỗi thiết kế cần báo lại chứ không phải số cần chép), và **không nghề nào có trần trên 60%**.

- [ ] **Step 3: Chốt lại `CHỈ TIÊU 2` (tuổi thắng) theo số đo**

Giữ nguyên khuôn bài, thay dải `52–62` bằng dải bao trọn ba con số đo được cộng biên ±3 tuổi. Nếu giáo viên nay hầu như không thắng thì `soNamTrungBinhKhiThang` của nghề đó tính trên mẫu rất nhỏ và sẽ nhiễu nặng — khi ấy **bỏ giáo viên khỏi bài này** kèm chú thích giải thích rằng trung bình trên dưới mười ván không nói được gì, chứ không nới dải cho vừa.

- [ ] **Step 4: Chốt lại `CHỈ TIÊU 5 và 6` (phá sản) theo số đo sau khi có trần bán tháo**

Nếu tỉ lệ phá sản của bot cân bằng rơi vào 8–18% và của bot đòn bẩy vượt 30% thì **trả lại đúng ngưỡng mục J** và đổi tên bài thành khẳng định dương (`'CHỈ TIÊU 5 và 6 — phá sản hiếm ở bot cân bằng, thường xuyên ở bot đòn bẩy'`).

Nếu chưa đạt, `CONFIG.phaSan.tyLeBanToiDaMoiNam` là đòn bẩy đúng để vặn: hạ dần theo bước 0,05 và chạy lại. **Tối đa bốn vòng.** Sau bốn vòng chưa đạt thì dừng, chốt ngưỡng theo số thật và ghi lý do vào mục L — đúng tinh thần "nới ngưỡng cho xanh mà không hiểu vì sao là tự lừa mình".

- [ ] **Step 5: Xem lại `CHỈ TIÊU 3` và `CHỈ TIÊU 4`**

Hai chỉ tiêu này (thua vì hạnh phúc, sống trọn đời) không phải mục tiêu của đợt này nhưng số của chúng sẽ dời — phá sản nay lấy đi một phần số ván thua nên **thị phần chết vì hạnh phúc phải giảm**. Cập nhật ngưỡng và **cả tên bài** cho khớp số mới; nếu thị phần đã xuống dưới 40% thì chỉ tiêu 3 đạt và tên bài phải nói thế.

- [ ] **Step 6: Viết lại mục L của tài liệu thiết kế**

Trong `docs/07-thiet-ke-v1-7.md`, mục L cần:

1. **Bảng kết quả:** thêm cột `Đợt 2` bên cạnh cột `Đo thật`, giữ nguyên cột cũ để thấy được thay đổi nào dời cái gì. Sửa dòng tiêu đề `### Bảng kết quả — ba chỉ tiêu đạt, sáu không` cho khớp số mới.
2. **Bảng "Tham số đã vặn":** đổi dòng `giaoVien.duongCongSuNghiep` thành "đã trả về 0,035 / 0,030 / 0,025 ở đợt 2"; thêm ba dòng mới cho `kyHanVayToiDa` 10 → 20, `phaSan.tyLeBanToiDaMoiNam` mới, và (nếu Step 4 phải vặn) giá trị cuối cùng của nó.
3. **Mục con "Vì sao phá sản vẫn là 0%"** nay đã lỗi thời một phần: giữ nguyên toàn bộ phần chẩn đoán (nó vẫn đúng và là công sức đắt nhất của bản này), thêm một đoạn kết `**Đã sửa ở đợt 2.**` nói rõ trần bán tháo là cách sửa, kèm số phá sản đo được sau khi sửa.
4. **Mục con "Đòn bẩy nay là nước đi lỗ — một quyết định đang chờ người"**: đổi tiêu đề thành `### Đòn bẩy: từ cái bẫy thuần tuý trở lại thành canh bạc`, thay câu `**Chưa áp dụng.**` bằng ghi nhận đã áp dụng kỳ hạn 20 năm và số đo mới của cặp cân bằng/đòn bẩy.
5. **Mục con "Chênh lệch ba nghề"**: thêm đoạn kết ghi rằng đợt 2 đã chọn hướng ngược lại với vòng hiệu chỉnh — trả đường cong về số thật, bỏ chỉ tiêu chênh lệch — và số đo mới.
6. **Mục con "Trần 15 điểm…"**: cập nhật cho khớp việc chỉ tiêu đã được gỡ khỏi mục J ở Task 1.

- [ ] **Step 7: Chạy toàn bộ, biên dịch, dựng bản**

Chạy: `npm test` rồi `./node_modules/.bin/tsc -b --noEmit` rồi `npm run build`
Kỳ vọng: **tất cả xanh**, biên dịch sạch, dựng bản thành công. Đây là cổng chốt của cả kế hoạch — còn một bài đỏ thì chưa xong.

- [ ] **Step 8: Commit**

```bash
git add src/game/balance.test.ts docs/07-thiet-ke-v1-7.md
git commit -m "v1.7 dot 2 do lai toan bo va chot nguong theo so that

Ba thay doi so cua dot 2 (ky han vay 20 nam, tran ban thao 40 phan tram,
duong luong giao vien tra ve 3,5 phan tram) doi nhieu chi tieu cung luc,
nen do mot lan tren bo so cuoi cung thay vi do sau tung task.

CHI TIEU 1 chuyen tu mot dai chung sang dai RIENG tung nghe: giu dai chung
doi hoi cho giao vien mot thang luong khong ton tai. Ba nghe khac nhau la
thong diep chu khong phai loi can bang.

Muc L cap nhat: them cot do dot 2, ghi nhan tran ban thao da sua duoc gioi
han cau truc ma v1.7 chi chan doan chu chua chua, va ghi nhan don bay tu
cai bay thuan tuy tro lai thanh canh bac.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Dọn dẹp ba khoản treo và kết nhánh

- [ ] **Step 1: Commit sửa đổi đang treo của kế hoạch cũ**

`docs/superpowers/plans/2026-08-11-v1-7-du-kho-de-phai-chon.md` có 7 dòng đổi `718_000_000` thành `718 * TRIEU`. Xem lại rồi commit:

```bash
git add docs/superpowers/plans/2026-08-11-v1-7-du-kho-de-phai-chon.md
git commit -m "v1.7 ke hoach cu: dung hang TRIEU trong doan ma mau

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 2: Tích 121 ô checkbox của kế hoạch cũ**

Toàn bộ 15 task của `2026-08-11-v1-7-du-kho-de-phai-chon.md` đã cài xong và commit, nhưng không ô nào được tích nên đọc vào tưởng chưa làm gì. Đổi mọi `- [ ]` thành `- [x]` trong file đó, và thêm ngay dưới dòng `**Goal:**` một dòng:

```markdown
> **Trạng thái: đã thực hiện xong toàn bộ 15 task.** Số đo thật ở mục L của `docs/07-thiet-ke-v1-7.md`. Bốn việc còn lại sau vòng hiệu chỉnh nằm ở `2026-08-11-v1-7-viec-con-lai.md`.
```

Commit:

```bash
git add docs/superpowers/plans/2026-08-11-v1-7-du-kho-de-phai-chon.md
git commit -m "v1.7 danh dau ke hoach cu da thuc hien xong

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: Chốt hướng kết nhánh**

Nhánh `v1-7-du-kho-de-phai-chon` đi trước `main` hơn 60 commit. **Dừng lại hỏi người** trước khi gộp — dùng superpowers:finishing-a-development-branch để chọn giữa gộp thẳng, mở pull request, hay giữ nhánh chờ chơi thử. Không tự quyết.

---

## Tự soát kế hoạch

**Phủ yêu cầu:** Việc 1 → Task 4 · Việc 2 → Task 3 · Việc 3 → Task 2 · Việc 4 → Task 1 · đo lại sau khi đổi số → Task 5 · ba khoản treo → Task 6. Không việc nào của người dùng thiếu task.

**Số và tên đã đối chiếu với mã nguồn thật:** `content.ts:78-83` (đường cong giáo viên hiện tại), `config.ts:201` (`kyHanVayToiDa: 10`), `config.ts:724-741` (khối `phaSan`, nơi chèn khoá mới), `engine.ts:2026-2049` (nấc 1), `engine.ts:559` (`thanhToanMoiNamCuaKhoanVay`), `balance.test.ts:221-224` (khẳng định chi phí vay sẽ đỏ ở Task 2), `docs/07-thiet-ke-v1-7.md:507-508` (hai dòng chỉ tiêu cần gỡ). `TAI_SAN`, `soPhanTram`, `diTronMotNam`, `moiVan`, `reducer` đều đã tồn tại sẵn ở đúng file mà task dùng tới.

**Nhất quán kiểu:** khoá mới duy nhất là `CONFIG.phaSan.tyLeBanToiDaMoiNam: number`, chỉ đọc ở `engine.ts` nấc 1 và ở câu chữ sự kiện; không task nào tạo hàm mới nên không có chữ ký nào phải khớp chéo.

**Chỗ cố ý để đỏ:** Task 2 Step 5 (hai dòng so bot đòn bẩy), Task 4 Step 5 (`CHỈ TIÊU 1` và có thể `CHỈ TIÊU 2`). Cả hai đều được Task 5 xử lý bằng số đo, không bằng cách nới cho khuất mắt. Đây là chỗ duy nhất trong kế hoạch mà một task commit khi `balance.test.ts` chưa xanh, và điều đó được nói rõ ngay tại bước commit.

**Chia việc song song:** ma trận file × agent ở mục "Phân công sub-agent" đã kiểm từng ô — trong mỗi đợt không hai agent nào chạm chung một file. Hai chỗ trùng file (`config.ts` giữa Task 2 và Task 3, `engine.test.ts` giữa Task 2 và Task 4) đều đã bị tách sang hai đợt khác nhau chứ không phó mặc cho may rủi hợp nhất. Ngoại lệ duy nhất — Task 4 Step 2 — được giao thẳng cho agent B1 thay vì B2, và ghi rõ ngay tại bước đó.

**Chỗ còn `…` cần điền khi thực thi:** đúng một chỗ — bảng `dai` ở Task 5 Step 2, vì con số của nó **phải** đến từ phép đo ở Step 1 chứ không thể viết trước. Ràng buộc kiểm tra tính hợp lệ của nó (sàn ≥ 8%, trần ≤ 60%) đã ghi ngay tại bước đó.

import { describe, expect, it } from 'vitest'
import { CONFIG } from './config'
import { NGHE, XUAT_THAN } from './content'
import {
  CHIEN_LUOC_CAN_BANG,
  CHIEN_LUOC_DON_BAY,
  SO_NAM_TRON_DOI,
  moPhongNhieuVan,
} from './sim'

/**
 * Kiểm tra cân bằng bằng mô phỏng. Đây là lưới an toàn khi chỉnh số trong
 * config: nếu đổi số làm game hoá bất khả thi hoặc quá dễ, test sẽ đỏ.
 *
 * ---------- Mọi con số ở đây là TẤT ĐỊNH ----------
 * `moPhongNhieuVan` sinh seed theo công thức cố định `1000 + i × 7919`, nên cùng
 * một bộ tham số luôn cho đúng cùng một dãy kết quả. Không có ván nào "đỏ oan vì
 * xui" — test đỏ nghĩa là một con số cân bằng vừa đổi thật. Đổi lại, mẫu phải đủ
 * lớn để con số đo được nói về game chứ không về đúng ba mươi seed đầu tiên.
 *
 * ---------- Viết lại ở v1.7 (Task 15) ----------
 * Bộ test cũ đo một game mà nửa sau cuộc đời chưa ai từng chơi tới: suốt v1.6
 * KHÔNG ván mô phỏng nào sống quá năm thứ 35. Bộ này đo sáu chỉ tiêu của mục J
 * tài liệu thiết kế. Hai đạt, bốn không — và bốn cái không đạt được ghi lại đúng
 * như đo được, kèm lý do, ở mục L của docs/07-thiet-ke-v1-7.md. Nới ngưỡng cho
 * xanh mà không hiểu vì sao là tự lừa mình.
 */
const SO_VAN = 30

/** mẫu cho các phép đo chỉ tiêu — đủ lớn để sai số chuẩn xuống quanh 3,5 điểm */
const SO_VAN_CHI_TIEU = 200

/**
 * Mẫu lớn hơn dành riêng cho hai phép đo chuyên gia đồng hành. Chúng đo chênh
 * lệch giữa hai chiến lược chứ không đo một ngưỡng cứng, mà chênh lệch ở đây chỉ
 * cỡ vài phần trăm tỉ lệ thắng và vài phần mười năm — 30 ván thì một hai ván
 * lệch đã đủ đảo dấu kết quả và làm test đỏ oan.
 */
const SO_VAN_DO_CHENH = 500

const tuoiThang = (soNamTrungBinh: number) =>
  CONFIG.cotTruyen.tuoiBatDau - 1 + soNamTrungBinh

describe('cân bằng game', () => {
  /* ================================================================
   *  Sáu chỉ tiêu của mục J
   * ================================================================ */

  /**
   * ---------- Vì sao chỉ tiêu này chuyển sang dải RIÊNG từng nghề ----------
   * Mục J bản đầu muốn cả ba nghề cùng thắng 45–55% và chênh nhau ≤ 10 điểm. Giữ
   * được dải chung ấy đòi hỏi cho giáo viên một thang lương không tồn tại ngoài
   * đời: 6,0% tăng thực mỗi năm ở bậc đầu, so với 3,5% thật. v1.7 đợt 2 trả
   * đường cong về số thật (`content.ts`, `duongCongSuNghiep` của giáo viên) và
   * chấp nhận hệ quả — ba nghề KHÁC NHAU, và đó là thông điệp chứ không phải lỗi
   * cân bằng.
   *
   * ---------- Sàn 8% của kế hoạch đã bị phá, đây là chỗ ghi lại ----------
   * Kế hoạch đặt một chốt chặn: không nghề nào được có sàn dưới 8%, vì dưới mức
   * đó thì nghề ấy là BẤT KHẢ THI chứ không phải khó, và đó là lỗi thiết kế cần
   * báo lại chứ không phải số cần chép. Giáo viên đo được 6,0% — thủng chốt.
   *
   * Đã báo lại và đã dò trước khi chép. Đòn bẩy duy nhất còn lại là
   * `tuDoTaiChinh.heSoToiThieu/heSoPhuThem`; quét nó qua bảy mức, n=200 mỗi ô,
   * từ 0,8+0,9 tới 2,6+2,8 — tức đòi hệ số an toàn ở tuổi 21 từ 1,70 tới 5,40:
   *
   *   mức       giáo viên       bác sĩ          kỹ sư PM        chênh nghề
   *   0,8+0,9   19,0% · 60,9t   52,5% · 48,8t   62,5% · 45,3t   43,5 điểm
   *   1,2+1,3   11,5% · 62,9t   52,5% · 50,9t   56,0% · 48,5t   44,5 điểm
   *   1,6+1,8   10,0% · 69,1t   50,5% · 52,9t   53,0% · 51,2t   43,0 điểm
   *   1,8+2,0    9,0% · 72,5t   49,0% · 53,5t   52,0% · 51,8t   43,0 điểm
   *   1,9+2,1    7,5% · 74,1t   49,0% · 53,9t   51,5% · 52,5t   44,0 điểm
   *   2,2+2,4    6,0% · 74,8t   49,0% · 55,3t   50,5% · 53,5t   44,5 điểm ← đang cài
   *   2,6+2,8    4,0% · 73,1t   47,5% · 56,5t   47,5% · 55,7t   43,5 điểm
   *
   * Chênh lệch giữa nghề mạnh nhất và nghề yếu nhất đứng yên ở 43–44,5 điểm suốt
   * cả dải. Vặn hệ số gấp hơn ba lần không bóp được khoảng cách ấy lấy một điểm —
   * nó chỉ trượt cả ba nghề xuống cùng lúc. Nghĩa là 6% của giáo viên KHÔNG do hệ
   * số an toàn gây ra, và không mức nào của hệ số ấy chữa được: mức duy nhất đưa
   * giáo viên lên 19% cũng đẩy kỹ sư lên 62,5% và dìm tuổi thắng cả ba nghề xuống
   * 45–49, thủng đáy dải của chỉ tiêu 2.
   *
   * Người chốt đã quyết sau khi đọc bảng trên: nhận 6% là sự thật của nghề, sửa
   * thước đo. Sàn của giáo viên dưới đây vì vậy là 2% chứ không phải 8% — cố ý
   * phá chốt chặn, sau khi đã đo và đã báo, chứ không phải lặng lẽ chép số cho
   * xanh. Việc chữa 6% nếu muốn chữa nằm ở kinh tế của nghề giáo viên (chi phí
   * sinh hoạt riêng, hoặc một cơ chế bù như đổi nghề hay dạy thêm) — một vòng
   * thiết kế mới, không phải một con số trong bảng này.
   *
   * ---------- Dải dưới đây đọc thế nào ----------
   * Bám theo số đo thật, nới đúng biên ±8 điểm quanh nó, và vẫn đủ chặt để bắt
   * hồi quy: một con số rơi ra ngoài nghĩa là vừa có thay đổi thật sự dời cân
   * bằng, phải đọc lại chứ không phải nới tiếp.
   *
   * ---------- Đo lại ở v1.8, sau khi căn giữa chu kỳ kinh tế ----------
   * Giáo viên 6,0% → 16,0%; bác sĩ 49% → 48,5%; kỹ sư 51% → 53,0%. Chỉ giáo viên
   * dời dải, và dời theo chiều tốt lên, nên dải của nghề này đo lại thành 8–24%
   * còn hai nghề kia giữ nguyên.
   *
   * Vì sao riêng nghề yếu nhất hưởng lợi: `doLechGia` cũ có kỳ vọng −0,1361 chứ
   * không phải 0, tức mọi kênh có `nhayChuKy` dương chịu lực cản vĩnh viễn — đo
   * được trái phiếu −7,23% và bất động sản −7,89% lãi THỰC mỗi năm. Người thu
   * nhập thấp sống nhờ tích luỹ chậm và đều nên bị lực cản ấy bào nặng nhất;
   * người thu nhập cao về đích chủ yếu bằng lương và doanh nghiệp. Căn kỳ vọng
   * về 0 đưa trái phiếu lên −1,89% và bất động sản lên −0,26%, và phần lợi dồn
   * gần hết vào giáo viên.
   *
   * Chú thích dài phía trên kết luận rằng 6% là "sự thật của nghề" mà hệ số an
   * toàn không chữa nổi. Kết luận ấy đúng trong phạm vi nó đã thử — vặn hệ số an
   * toàn — nhưng chỗ hỏng thật nằm ở chu kỳ kinh tế, không ai ngờ tới lúc đó.
   *
   * ---------- Đo lại lần hai ở v1.8, sau khi thay hẳn mô hình giá ----------
   * Giáo viên 16,0% → 27,7%; bác sĩ 48,5% → 50,9%; kỹ sư 53,0% → 52,3% (n=1000).
   * Lại đúng một mình giáo viên dời dải, lại theo chiều tốt lên, nên dải nghề này
   * đo lại thành 20–36% còn hai nghề kia giữ nguyên.
   *
   * Cùng một cơ chế với lần trước, chỉ mạnh hơn: mô hình cũ bốc giá ngẫu nhiên
   * độc lập từng năm nên hao hụt do dao động ăn hết lợi nhuận, cả năm kênh đều ÂM
   * lãi thực. Mô hình mới neo giá vào giá trị thật nên lãi thực dài hạn đúng bằng
   * `tangTruongThuc` đặt trong `content.ts`: cổ phiếu +4%, bất động sản +1,5%.
   * Người thu nhập thấp về đích bằng tích luỹ đều nên hưởng gần trọn phần chênh
   * ấy; người thu nhập cao vốn về đích bằng lương và doanh nghiệp.
   *
   * Đáng ghi lại: khoảng cách nghề mạnh nhất – yếu nhất từ 45 điểm ở v1.7 xuống
   * 37 rồi nay 24,6 điểm. Chú thích dài phía trên từng kết luận khoảng cách ấy
   * "đứng yên ở 43–44,5 điểm suốt cả dải" và không đòn bẩy nào bóp nổi. Đúng —
   * trong phạm vi đã thử. Nó không phải khoảng cách giữa hai NGHỀ, nó là khoảng
   * cách giữa người sống nhờ tích luỹ và người sống nhờ thu nhập, và chỉ co lại
   * khi kênh tích luỹ thôi âm lãi thực.
   */
  it('CHỈ TIÊU 1 — mỗi nghề nằm trong dải riêng đã đo, không nghề nào bất khả thi', () => {
    const dai: Record<string, [number, number]> = {
      giaoVien: [0.2, 0.36],
      bacSi: [0.41, 0.57],
      kySuPhanMem: [0.43, 0.59],
    }
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const [san, tran] = dai[nghe.id]!
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thắng ${(r.tyLeThang * 100).toFixed(1)}%` +
          ` · tuổi thắng TB ${tuoiThang(r.soNamTrungBinhKhiThang).toFixed(1)}` +
          ` · sống trọn đời ${(r.tyLeSongTronDoi * 100).toFixed(1)}%` +
          ` · thua vì hạnh phúc ${(r.tyLeThuaVi.hanhPhuc * 100).toFixed(1)}%` +
          ` · phá sản ${(r.tyLeThuaVi.phaSan * 100).toFixed(1)}%` +
          ` · hết đời chưa tự do ${(r.tyLeThuaVi.hetDoi * 100).toFixed(1)}%`,
      )
      expect(r.tyLeThang).toBeGreaterThanOrEqual(san)
      expect(r.tyLeThang).toBeLessThanOrEqual(tran)
    }
    // Chốt chặn trên chính BẢNG DẢI, không phải trên số đo: trần 60% của kế
    // hoạch vẫn giữ nguyên hiệu lực, vì trên mức đó thì nghề ấy hoá thành nước
    // đi hiển nhiên đúng và ván chơi hết chỗ để quyết định. Đây là dây bẫy chống
    // việc nới dải về sau — sàn 8% thì đã cố ý bỏ, có ghi lý do ở chú thích trên.
    for (const [, tran] of Object.values(dai)) {
      expect(tran).toBeLessThanOrEqual(0.6)
    }
  })

  /**
   * ---------- Vì sao giáo viên KHÔNG có mặt trong bài này ----------
   * `soNamTrungBinhKhiThang` chỉ có nghĩa khi tập ván thắng đủ lớn. Giáo viên nay
   * thắng 6,0% trên 200 ván — trung bình tuổi thắng 74,8 của nghề này được tính
   * trên đúng 12 ván. Quét hệ số an toàn cho thấy con số ấy còn quay đầu: 74,1 ở
   * mức 1,9+2,1 (15 ván) rồi 74,8 (12 ván) rồi 73,1 ở mức 2,6+2,8 (8 ván) — dao
   * động của mẫu nhỏ, không phải xu hướng.
   *
   * Tệ hơn, con số ấy còn bị THIÊN LỆCH SỐNG SÓT: hệ số an toàn càng cao thì chỉ
   * những ván lì nhất mới thắng nổi, nên trung bình bị kéo lên chứ không phải vì
   * người chơi giáo viên thật sự về đích muộn hơn. Nới dải 52–62 lên tới 75 cho
   * vừa giáo viên là chép một con số vô nghĩa vào chỗ của một chỉ tiêu.
   *
   * Nên bài này đo hai nghề có tập ván thắng đủ lớn (98 và 101 ván), và dải bám
   * theo số đo thật: 53,5 của kỹ sư và 55,3 của bác sĩ, nới ±3 tuổi rồi làm tròn
   * ra ngoài. Tuổi thắng của giáo viên vẫn được IN RA ở chỉ tiêu 1 để không ai
   * mất dấu nó — chỉ là không bị chốt bằng một phép so mà mẫu không đỡ nổi.
   *
   * ---------- Đo lại ở v1.8: dải TRƯỢT XUỐNG DƯỚI mục tiêu của mục J ----------
   * Kỹ sư 53,5 → 48,1 tuổi; bác sĩ 55,3 → 51,5 tuổi (n=1000). Mô hình giá mới đưa
   * lãi thực của cổ phiếu và bất động sản từ âm về dương, nên ai về đích thì về
   * sớm hơn khoảng ba tới năm năm. Dải đo lại theo đúng lệ cũ — ±3 tuổi quanh số
   * đo rồi làm tròn ra ngoài — thành 45–55.
   *
   * ĐÂY LÀ MỘT CHỈ TIÊU BỊ TRƯỢT, không phải một dải được cập nhật cho gọn. Mục J
   * muốn tự do tài chính tới ở tuổi trung niên 50–59; nay kỹ sư chạm đích ở 48,1,
   * tức dưới sàn hai tuổi. Không chữa bằng cách hạ `tangTruongThuc` của các kênh:
   * +4% lãi thực cho cổ phiếu và +1,5% cho bất động sản đã là con số khiêm tốn so
   * với ngoài đời, hạ nữa là bẻ cong thực tế cho vừa một cái bảng. Đòn bẩy đúng
   * chỗ là `tuDoTaiChinh.heSoToiThieu/heSoPhuThem` — bảng quét ở chỉ tiêu 1 cho
   * thấy vặn nó lên đẩy tuổi thắng lên và tỉ lệ thắng xuống ở cả ba nghề cùng lúc.
   * Đó là một vòng cân bằng riêng, phải quét lại cả sáu chỉ tiêu, không phải một
   * con số nhét vào đây.
   */
  it('CHỈ TIÊU 2 — tuổi thắng trung bình 45–55, đã trượt xuống dưới mục tiêu 50–59', () => {
    for (const nghe of NGHE) {
      if (nghe.id === 'giaoVien') continue
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const tuoi = tuoiThang(r.soNamTrungBinhKhiThang)
      // Mẫu phải đủ lớn thì phép so mới có nghĩa — nếu một nghề nào đó tụt xuống
      // dưới ngần này ván thắng thì bài phải được đọc lại chứ không phải chạy tiếp.
      expect(r.tyLeThang * SO_VAN_CHI_TIEU).toBeGreaterThanOrEqual(50)
      expect(tuoi).toBeGreaterThanOrEqual(45)
      expect(tuoi).toBeLessThanOrEqual(55)
    }
  })

  /**
   * ---------- CHỈ TIÊU 3 KHÔNG ĐẠT ----------
   * Mục J muốn chết non vì hạnh phúc chỉ còn ≤ 40% số ván thua. Đo thật ở v1.7
   * đợt 2: 87% / 100% / 95%. Đây là ngưỡng bám theo khoảng THẬT quan sát được,
   * không phải khoảng mong muốn ban đầu — cùng khuôn với mục F của v1.6.
   *
   * Đợt 2 có một dự đoán ở đây và nó SAI: cơ chế phá sản vừa sửa lẽ ra phải lấy
   * bớt một phần số ván thua và kéo thị phần này xuống. Phá sản đo được cao nhất
   * chỉ 0,5% ở đúng một ô, nên nó không lấy đi được gì đáng kể — con số duy nhất
   * nhúc nhích là giáo viên, 88% → 87%, và đó là do đường lương trả về số thật
   * chứ không phải do phá sản.
   *
   * Vì sao không đạt, đã dò tới tận cơ chế: điểm hạnh phúc NHẬN được bị chặn bởi
   * trần mềm 100 và trần cứng 130, nhưng điểm MẤT khi từ chối thẻ thì không bị
   * chặn gì cả. Thanh hạnh phúc vì vậy là một bước ngẫu nhiên có trần trên nhưng
   * có vách hấp thụ ở dưới (`hanhPhucNguongThua`), mà ván chơi lại dài 79 năm với
   * chừng 355 lượt rút thẻ — chạm vách gần như là chuyện sớm muộn. Trung vị năm
   * chết là năm thứ 8–15, đúng quãng thanh hạnh phúc mới chỉ có 20 điểm đệm.
   *
   * Đã quét và loại trừ từng nghi phạm một:
   *   · ngưỡng nhận thẻ của bot   0,8tr → 1000tr/điểm: thị phần đứng yên 91–100%
   *   · `hanhPhucBanDau`          70 → 100:            đứng yên 90–100%
   *   · tỉ lệ chi phí/lương       0,89 → 0,78:         chỉ xuống 100% → 82%
   *   · `heSoAnToanTheoTuoi`      1,2+1,3 → 4+4:       chỉ xuống 98% → 86%
   * Cần chi phí/lương xuống 0,62–0,65 (tỉ lệ tiết kiệm 35–38%) mới ép được con số
   * này xuống ngưỡng, mà như thế thì phá vỡ quyết định trung tâm của mục A: cả ba
   * nghề tiết kiệm 15% vì ngoài đời con số đó gần bằng 0.
   */
  it('CHỈ TIÊU 3 — chết non vì hạnh phúc VẪN chiếm gần trọn số ván thua', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const soVanThua = 1 - r.tyLeThang
      expect(soVanThua).toBeGreaterThan(0.05)
      const thiPhan = r.tyLeThuaVi.hanhPhuc / soVanThua
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thị phần chết vì hạnh phúc trong số ván thua ` +
          `${(thiPhan * 100).toFixed(0)}% (mục J muốn ≤ 40%)`,
      )
      expect(thiPhan).toBeGreaterThan(0.8)
      expect(thiPhan).toBeLessThanOrEqual(1)
    }
  })

  /**
   * ---------- CHỈ TIÊU 4 KHÔNG ĐẠT, nhưng đã đi được một quãng thật ----------
   * Mục J muốn > 30% số ván sống trọn tới tuổi 100. Đo thật ở v1.7 đợt 2:
   * 13,5% / 0,0% / 2,5%.
   *
   * Dù vậy đây KHÔNG phải chỗ đứng yên so với v1.6. Suốt bản đó, dò vết 1000 ván
   * mỗi tổ hợp cho thấy KHÔNG ván nào sống quá năm thứ 35 — nửa sau cuộc đời chưa
   * từng được chơi lấy một lần. Nay ván dài nhất chạm trọn 80 năm và tuổi thắng
   * trung bình đã lùi từ 33–42 lên 53,5–74,8, tức phần đời sau tuổi 50 đã thật sự
   * được mô phỏng đi qua. Test dưới đây chốt đúng điều đó: chốt cái đã đạt được,
   * và ghi lại cái chưa.
   *
   * Con số 13,5% của giáo viên là số CAO NHẤT dự án từng đo, và nó cao vì lý do
   * buồn: nghề này nay hiếm khi thắng, nên ván của nó hay đi hết đời mà chưa tự
   * do. "Sống trọn đời" ở đây đếm cả hai nghĩa — sống trọn vì đã thong dong, và
   * sống trọn vì không bao giờ tới đích.
   *
   * Nguyên nhân không đạt là hệ quả số học của chỉ tiêu 3: muốn > 30% ván sống
   * trọn đời trong khi ngần ấy ván kết thúc bằng chiến thắng, thì cửa thua hạnh
   * phúc chỉ được phép lấy đi một phần nhỏ tổng số ván. Đo thật con số đó là
   * 47–81,5%.
   */
  it('CHỈ TIÊU 4 — nửa sau cuộc đời cuối cùng cũng được chơi, dù chưa tới mức 30%', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const namDaiNhat = Math.max(...r.ketQua.map((k) => k.soNam))
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} sống trọn đời ${(r.tyLeSongTronDoi * 100).toFixed(1)}%` +
          ` (mục J muốn > 30%) · ván dài nhất ${namDaiNhat} năm`,
      )
      // v1.6 tắc ở năm thứ 35 với MỌI nghề và mọi chiến lược; nay phải vượt hẳn
      // qua đó mới coi là nửa sau cuộc đời có được chơi.
      expect(namDaiNhat).toBeGreaterThan(35)
      expect(r.tyLeSongTronDoi).toBeLessThanOrEqual(0.3)
    }
    // Và ít nhất một nghề phải có ván đi trọn quãng đời — nếu không thì đoạn
    // cuối đời vẫn chỉ là suy đoán. Cố ý KHÔNG đòi cả ba nghề: bác sĩ đo ra 0%
    // sống trọn đời (ván dài nhất 78 năm) vì tỉ lệ thắng của nghề này rơi vào
    // đúng quãng khiến gần như mọi ván đều kết thúc trước tuổi 100 — hoặc thắng,
    // hoặc chết vì hạnh phúc.
    const daiNhatMoiNghe = NGHE.map((nghe) =>
      Math.max(
        ...moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU).ketQua.map((k) => k.soNam),
      ),
    )
    expect(Math.max(...daiNhatMoiNghe)).toBeGreaterThanOrEqual(SO_NAM_TRON_DOI)
  })

  /**
   * ---------- CHỈ TIÊU 5 VÀ 6 VẪN KHÔNG ĐẠT — nhưng bức tường đã nứt ----------
   * Mục J muốn bot cân bằng phá sản 8–18% và bot đòn bẩy > 30%. Đo thật ở v1.7
   * đợt 2: cao nhất là 0,5% (giáo viên, bot đòn bẩy), năm ô còn lại là 0,0%.
   *
   * ---------- Phần chẩn đoán cũ, vẫn đúng và vẫn là công sức đắt nhất -------
   * Bản v1.6 đo ra 0% và giải thích là "mô phỏng không bao giờ sống quá năm thứ
   * 35 nên không chạm tới quãng đời trả giá". Lời giải thích ấy đã bị bác bỏ: ván
   * chạy trọn 79 năm mà phá sản VẪN không xảy ra. Nguyên nhân thật nằm ở nấc 1
   * của cơ chế ba nấc vỡ nợ. Đếm trực tiếp số lần mỗi nấc nổ (n = 450 ván mỗi
   * chiến lược, cả ba nghề):
   *   · bot cân bằng: nấc 1 nổ 1 lần, nấc 2 nổ 0 lần, nấc 3 nổ 0 lần
   *   · bot đòn bẩy:  nấc 1 nổ 46 lần, nấc 2 nổ 9 lần, nấc 3 nổ 1 lần
   * Lý do: nấc 1 bán tài sản đầu tư KHÔNG có giới hạn mỗi năm — nó bán tới khi
   * tiền mặt hết âm. Mà nấc 3 lại đòi khoản thiếu hụt còn vượt trọn một năm chi
   * phí SAU KHI đã bán sạch tài sản và thanh lý hết doanh nghiệp. Người chơi đem
   * tiền đi đầu tư thì luôn có cái để bán, nên trạng thái "nghèo thanh khoản mà
   * nặng nợ" — trạng thái duy nhất dẫn tới nấc 3 — không bao giờ xuất hiện.
   *
   * ---------- Đợt 2 đã sửa đúng chỗ đó, và nó có tác dụng ----------
   * `phaSan.tyLeBanToiDaMoiNam` (0,4) áp trần bán tháo mỗi năm cho nấc 1. Sau đó
   * phá sản lần đầu tiên KHÁC 0 trong lịch sử dự án: giáo viên chơi đòn bẩy đổ
   * 0,5%. Con số bé, nhưng nó là hiệu số giữa "bất khả thi về cấu trúc" và "hiếm".
   *
   * ---------- Vì sao dừng ở đây thay vì vặn tiếp ----------
   * Kế hoạch cho tối đa bốn vòng vặn hai con số. Đã quét, và cả hai đều TRƠ:
   *   · `tyLeBanToiDaMoiNam` 0,4 → 0,15: mười sáu ô đo giống nhau tới từng chữ
   *     số thập phân, kể cả tỉ lệ thắng. Trần này không còn cắn, vì kỳ hạn vay 20
   *     năm của đợt 2 làm khoản trả nợ nhẹ đi tới mức khoản hụt tiền mỗi năm nhỏ
   *     hơn hẳn phần danh mục được phép bán — `Math.ceil(-tienMat / gia)` mới là
   *     vế thắng trong `Math.min`, không phải cái trần.
   *   · `nguongTheoChiPhi` 1,0 → 0,8 → 0,6 → 0,5 → 0,2 → 0,05 → 0,01 → 0: cao
   *     nhất chạm 4,5% (giáo viên, bot cân bằng) ở mức 0 — tức coi BẤT KỲ đồng
   *     tiền mặt âm nào còn sót sau hai nấc đầu cũng là phá sản. Vẫn dưới sàn 8%
   *     của mục J, mà đã phải phá nát định nghĩa "thế nào là vỡ nợ" để tới đó.
   *
   * Ràng buộc đang cắn nay nằm ở NẤC 2: thanh lý doanh nghiệp cũng không có trần
   * mỗi năm, và 45% vốn góp của một người vay lớn thì thừa sức bù. Sửa chỗ đó là
   * đổi ENGINE, đúng cùng một khiếm khuyết "thanh lý không giới hạn" mà đợt 2 vừa
   * sửa ở nấc 1 — và nó phải là một task riêng có test riêng, không phải một con
   * số nhét vào vòng hiệu chỉnh. Xem mục L của tài liệu thiết kế.
   *
   * Bài này vì vậy chốt đúng cái đo được, và cố ý đo CẢ BA NGHỀ: bản cũ chỉ đo
   * bác sĩ — nghề dư dả nhất — nên nó bỏ sót đúng cái ô duy nhất khác 0.
   *
   * ---------- Đo lại ở v1.8: phải NÂNG MẪU chứ không được nới ngưỡng ----------
   * Mô hình giá mới đưa lãi thực của các kênh từ âm về dương, nên người chơi dư
   * dả hơn và cái ô duy nhất khác 0 kia mỏng đi: giáo viên cân bằng từ 0,5% (1
   * trên 200 ván) xuống 0,10% (1 trên 1000). Ở mẫu 200 thì đo ra tròn 0 và phép
   * so `> 0` đỏ.
   *
   * Cách chữa ĐÚNG là nâng mẫu, không phải hạ phép so xuống `>= 0`. Vỡ nợ vẫn
   * xảy ra được — chỉ hiếm hơn — và một phép so `>= 0` thì không canh được gì cả:
   * nó xanh kể cả khi cơ chế vỡ nợ bị gỡ hẳn khỏi engine. Đổi lại, bài này chạy
   * 6000 ván nên chậm hơn hẳn phần còn lại của tệp; đó là cái giá của việc giữ
   * một cái bẫy còn hiệu lực.
   *
   * Cần nói rõ: con số 0,10% này KHÔNG phải thành tựu, nó vẫn cách sàn 8% của mục
   * J rất xa và nay còn xa hơn trước. Ràng buộc cắn ở NẤC 2 nói phía trên vẫn y
   * nguyên, chưa ai đụng tới, và mô hình giá mới không liên quan gì tới nó ngoài
   * việc làm người chơi giàu hơn nên ít chạm đáy hơn.
   */
  it('CHỈ TIÊU 5 và 6 — phá sản đã khác 0 nhưng còn xa mục tiêu', () => {
    // Mẫu riêng, lớn gấp năm: ở mẫu 200 thì sự kiện 1-trên-1000 đo ra tròn 0.
    const SO_VAN_PHA_SAN = 1_000
    const tyLe: number[] = []
    for (const nghe of NGHE) {
      const canBang = moPhongNhieuVan(nghe.id, SO_VAN_PHA_SAN)
      const donBay = moPhongNhieuVan(nghe.id, SO_VAN_PHA_SAN, CHIEN_LUOC_DON_BAY)
      tyLe.push(canBang.tyLePhaSan, donBay.tyLePhaSan)
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} phá sản — cân bằng ${(canBang.tyLePhaSan * 100).toFixed(1)}%` +
          ` (mục J muốn 8–18%) · đòn bẩy ${(donBay.tyLePhaSan * 100).toFixed(1)}%` +
          ` (mục J muốn > 30%)`,
      )
    }
    // Trần 2%: còn cách sàn 8% của mục J một quãng xa, và đó là điều bài này ghi
    // lại. Nếu ô nào vượt 2% thì cơ chế vỡ nợ vừa đổi thật — đọc lại, đừng nới.
    expect(Math.max(...tyLe)).toBeLessThanOrEqual(0.02)
    // Nhưng KHÔNG được quay về 0 tuyệt đối: trần bán tháo của đợt 2 là thứ duy
    // nhất từng đưa phá sản ra khỏi con số 0, và bài này canh đúng thành quả đó.
    expect(Math.max(...tyLe)).toBeGreaterThan(0)
    // 6000 ván không chạy kịp trong hạn mặc định 5 giây của vitest.
  }, 60_000)

  /**
   * ---------- Đòn bẩy vẫn thua thiệt, nhưng vay không còn LỖ CHẮC CHẮN ----------
   * Test cũ khẳng định "bot đòn bẩy khi thắng thì về đích sớm hơn bot cân bằng —
   * canh bạc có lãi kỳ vọng". Khẳng định đó đã lật hẳn ở v1.7 và test này ghi lại
   * chiều mới, đúng như đo được.
   *
   * Số học của nó rõ ràng, không cần mô phỏng mới thấy: trả góp đều gốc cộng lãi
   * đơn nên mỗi năm phải trả `(1 + laiSuat × kyHan) ÷ kyHan` gốc. Với kỳ hạn 10
   * năm con số đó là 18%, trong khi dải sinh lời doanh nghiệp hạ xuống 12–18% ở
   * v1.7 rồi còn bị thuế thu nhập doanh nghiệp 20% cắn tiếp, thực nhận chỉ còn
   * 9,6–14,4%. Vay 18% để kiếm 9,6–14,4% là lỗ chắc chắn từ 3,6 tới 8,4 điểm mỗi
   * năm, ở MỌI cơ hội trong bộ bài — đòn bẩy khi ấy hết là canh bạc, nó là cái
   * bẫy thuần tuý.
   *
   * v1.7 đợt 2 đã xử lý bằng cách kéo kỳ hạn lên 20 năm: chi phí vay về 13%/năm,
   * nằm GIỮA 9,6% và 14,4%. Vì vậy bài này không còn chốt "vay là lỗ chắc chắn"
   * — khẳng định đó CỐ Ý không còn đúng — mà chốt "chi phí vay nằm giữa dải".
   *
   * Hai khẳng định còn lại GIỮ NGUYÊN, không nới: bot đòn bẩy vay bừa vẫn phải
   * thua bot cân bằng cả tỉ lệ thắng lẫn tốc độ, vì nó rót vốn vào cả những cơ
   * hội nằm dưới 13% chứ không chỉ những cơ hội trên mức đó. Nếu chúng đỏ thì
   * kỳ hạn dài đã lật đòn bẩy thành nước đi có lãi — một kết quả cân bằng đáng
   * đo và đáng ghi, không phải một ngưỡng cần nới.
   */
  it('bot đòn bẩy vẫn thua thiệt nhưng vay không còn lỗ chắc chắn', () => {
    const canBang = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU)
    const donBay = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU, CHIEN_LUOC_DON_BAY)
    // eslint-disable-next-line no-console
    console.log(
      `bác sĩ — cân bằng thắng ${(canBang.tyLeThang * 100).toFixed(1)}%` +
        ` về đích tuổi ${tuoiThang(canBang.soNamTrungBinhKhiThang).toFixed(1)}` +
        ` · đòn bẩy thắng ${(donBay.tyLeThang * 100).toFixed(1)}%` +
        ` về đích tuổi ${tuoiThang(donBay.soNamTrungBinhKhiThang).toFixed(1)}`,
    )
    // Chi phí vay mỗi năm tính thẳng từ CONFIG, không viết cứng. Từ v1.7 đợt 2
    // nó phải nằm GIỮA sàn và trần của dải sinh lời sau thuế: dưới trần thì
    // cơ hội tốt còn cửa có lãi, trên sàn thì cơ hội thường vẫn lỗ.
    const chiPhiVayMoiNam =
      (1 + CONFIG.laiSuatVay * CONFIG.kyHanVayToiDa) / CONFIG.kyHanVayToiDa
    const sauThue = 1 - CONFIG.thue.thueDoanhNghiep
    expect(chiPhiVayMoiNam).toBeGreaterThan(0.12 * sauThue)
    expect(chiPhiVayMoiNam).toBeLessThan(0.18 * sauThue)
    expect(donBay.tyLeThang).toBeLessThan(canBang.tyLeThang)
    expect(donBay.soNamTrungBinhKhiThang).toBeGreaterThan(
      canBang.soNamTrungBinhKhiThang,
    )
  })

  /* ================================================================
   *  Bất biến — đo quan hệ chứ không đo ngưỡng
   * ================================================================ */

  it('liệu trình tâm lý cứu được ván bí bách nhưng không mua đứt điều kiện thua', () => {
    // Chỉ bật tắt riêng gói tâm lý, gói hoạch định tài chính giữ nguyên ở cả hai
    // bên — có vậy chênh lệch đo được mới là công của liệu trình chứ không phải
    // của khoản chi phí đã tối ưu.
    const macDinh = moPhongNhieuVan(
      'giaoVien',
      SO_VAN_DO_CHENH,
      CHIEN_LUOC_CAN_BANG,
    )

    // Bot khó tính hơn với thẻ tiêu dùng: ít mua điểm hạnh phúc bằng tiền nên
    // hạnh phúc mới thật sự là ràng buộc — đúng cảnh ngộ mà liệu trình sinh ra
    // để cứu.
    const khoTinh = { ...CHIEN_LUOC_CAN_BANG, nguongMoiDiem: 800_000 }
    const coTriLieu = moPhongNhieuVan('giaoVien', SO_VAN_DO_CHENH, khoTinh)
    const khongTriLieu = moPhongNhieuVan('giaoVien', SO_VAN_DO_CHENH, {
      ...khoTinh,
      thueChuyenGiaTamLy: false,
    })

    // Ghép cặp từng ván: `moPhongNhieuVan` sinh seed theo công thức cố định nên
    // `ketQua[i]` của hai bên là CÙNG một ván, chỉ khác đúng quyết định thuê. So
    // kiểu này mạnh hơn hẳn so hai tỉ lệ thắng thô, vì nó loại sạch phương sai
    // giữa các ván.
    const cap = coTriLieu.ketQua.map((k, i) => [k, khongTriLieu.ketQua[i]!] as const)
    const triLieuCuu = cap.filter(([co, khong]) => co.thang && !khong.thang).length
    const triLieuHai = cap.filter(([co, khong]) => !co.thang && khong.thang).length
    // eslint-disable-next-line no-console
    console.log(
      `giáo viên bot khó tính — có trị liệu ${(coTriLieu.tyLeThang * 100).toFixed(1)}%` +
        ` · không ${(khongTriLieu.tyLeThang * 100).toFixed(1)}%` +
        ` · ghép cặp: trị liệu lật thắng ${triLieuCuu} ván, lật thua ${triLieuHai} ván`,
    )

    /**
     * ---------- Vì sao KHÔNG còn chốt "có trị liệu thắng nhiều hơn" ----------
     * Ở v1.6 khẳng định ấy đo được thật. Sau vòng hiệu chỉnh v1.7 nó rơi xuống
     * mức NHIỄU và đổi dấu: 12,0% so với 13,4% trên 500 ván, tức lệch 1,4 điểm
     * trong khi sai số chuẩn của hiệu hai tỉ lệ đã là 2,1 điểm. Ghép cặp cho
     * thấy đúng bản chất — liệu trình lật được một nhúm ván sang thắng và cũng
     * làm mất chừng ấy ván, vì tiền trả cho nó (25% chi phí sinh hoạt một năm)
     * nay là khoản đáng kể so với thặng dư đã mỏng đi.
     *
     * Đợt 2 kéo cả hai con số xuống thấp hơn nữa — 1,2% so với 1,6% — vì bài này
     * đứng trên giáo viên với bot khó tính, tức nghề khó nhất chơi theo lối ngặt
     * nhất, sau khi đường lương đã trả về số thật. Ghép cặp vẫn cho đúng bức
     * tranh cũ: lật thắng 5 ván, lật thua 7 ván. Đây CỐ Ý là cảnh ngặt nghèo nhất
     * dựng được — nếu một gói dịch vụ nhỏ mua đứt được điều kiện thua thì nó phải
     * lộ ra ở đây trước tiên.
     *
     * Chốt vào một hiệu ứng cỡ nhiễu là chốt vào nhiễu — đúng cái bẫy mà chú
     * thích đầu `CHIEN_LUOC_CAN_BANG` trong sim.ts đã ghi lại một lần rồi. Phần
     * CÒN VỮNG của bất biến là phần dưới đây, và nó mới là phần quan trọng: một
     * gói dịch vụ nhỏ không được phép mua đứt điều kiện thua duy nhất của game.
     */
    expect(triLieuCuu).toBeGreaterThan(0)
    // Không chạm 100% ở cả hai lối chơi: hạnh phúc phải còn là rủi ro thật, nếu
    // không thì điều kiện thua duy nhất của game bị một khoản chi nhỏ mua đứt.
    expect(coTriLieu.tyLeThang).toBeLessThan(1)
    expect(macDinh.tyLeThang).toBeLessThan(1)
  })

  it('chỉ ôm vàng thì giàu mấy cũng không bao giờ tự do tài chính', () => {
    const r = moPhongNhieuVan('kySuPhanMem', SO_VAN, {
      ...CHIEN_LUOC_CAN_BANG,
      uuTienTaiSan: ['vang'],
      nhanCoHoiKinhDoanh: false,
      nhanToChucSuKien: false,
    })
    // eslint-disable-next-line no-console
    console.log(
      `ôm vàng     thắng ${(r.tyLeThang * 100).toFixed(0)}%` +
        ` · tài sản trung bình khi thua ${(r.taiSanTrungBinhKhiThua / 1e9).toFixed(1)} tỷ`,
    )
    expect(r.tyLeThang).toBe(0)
  })

  it('chơi ẩu — từ chối mọi thẻ tiêu dùng — thì thua vì hạnh phúc', () => {
    const r = moPhongNhieuVan('giaoVien', 10, {
      ...CHIEN_LUOC_CAN_BANG,
      nguongMoiDiem: 0, // không bao giờ nhận thẻ
    })
    expect(r.tyLeThang).toBe(0)
    // Và phải thua vì ĐÚNG cửa hạnh phúc, không phải vì hết đời hay phá sản —
    // đây là chỗ phân loại `lyDoThua` của v1.7 kiếm được cơm ăn.
    expect(r.tyLeThuaVi.hanhPhuc).toBe(1)
  })

  /**
   * ---------- Viết lại phép đo ở v1.7, KHÔNG phải nới ngưỡng ----------
   * Bản cũ chốt "tiêu hoang thì SỐ NĂM về đích lớn hơn". Ở mức thắng 85–95% của
   * v1.6 phép so ấy sạch, vì gần như ván nào cũng thắng nên hai trung bình nói về
   * cùng một tập ván. Ở mức thắng 45–55% của v1.7 nó hỏng vì THIÊN LỆCH SỐNG SÓT:
   * bot hoang phí chỉ thắng 27% so với 47%, và đám ván còn thắng được của nó là
   * đám may nhất — mà may thì đồng nghĩa với nhanh. Nên `soNamTrungBinhKhiThang`
   * của bot hoang phí hoá ra NHỎ hơn (40,6 so với 43,3) dù nó chơi tệ hơn hẳn.
   *
   * Cùng một ý định — tiêu hoang thì bị phạt — nay đo bằng TỈ LỆ THẮNG, thước đo
   * không bị thiên lệch sống sót vì nó tính trên toàn bộ số ván.
   */
  it('tiêu hoang thì thắng ít hơn tiêu có chọn lọc', () => {
    for (const ngheId of ['giaoVien', 'bacSi']) {
      const canThan = moPhongNhieuVan(ngheId, SO_VAN_CHI_TIEU)
      const hoangPhi = moPhongNhieuVan(ngheId, SO_VAN_CHI_TIEU, {
        ...CHIEN_LUOC_CAN_BANG,
        nguongMoiDiem: Number.MAX_SAFE_INTEGER,
      })
      // eslint-disable-next-line no-console
      console.log(
        `${ngheId.padEnd(10)} chọn lọc ${(canThan.tyLeThang * 100).toFixed(0)}%/` +
          `${canThan.soNamTrungBinhKhiThang.toFixed(1)}n` +
          `  ·  hoang phí ${(hoangPhi.tyLeThang * 100).toFixed(0)}%/` +
          `${hoangPhi.soNamTrungBinhKhiThang.toFixed(1)}n`,
      )
      expect(hoangPhi.tyLeThang).toBeLessThan(canThan.tyLeThang)
    }
  })

  /**
   * ---------- Vì sao ở đây không có trần chênh lệch cứng ----------
   * Mục J bản đầu muốn giữ chênh lệch giữa bốn xuất thân và giữa năm bậc lương ở
   * mức ≤ 15 điểm như v1.6. Chỉ tiêu đó đã được GỠ khỏi mục J, vì nó loại trừ
   * nhau với chỉ tiêu tỉ lệ thắng 45–55% ở đầu bảng. Đo thật ở v1.7 đợt 2, cả hai
   * bài nay cùng đứng trên bác sĩ: 19,2 điểm và 33 điểm.
   *
   * Đây KHÔNG phải chuyện game hoá bất công hơn — nó là HIỆU ỨNG TRẦN biến mất.
   * Ở v1.6 bot cân bằng thắng 91–94%, tức mọi xuất thân đều đụng trần: nhà thuần
   * nông thắng 85% còn nhà khá giả thắng 97% thì chênh lệch đo được chỉ có 12
   * điểm, vì cả hai đều bị ép sát vào 100%. Kéo tỉ lệ thắng về 45–55% theo đúng
   * chỉ tiêu 1 thì trần biến mất và khoảng cách THẬT lộ ra nguyên vẹn.
   *
   * Đã kiểm chứng bằng cách quét `heSoAnToanTheoTuoi` (n=200 mỗi điểm, hồi đó cả
   * hai bài còn đứng trên giáo viên với đường lương đã vặn): chênh lệch xuất thân
   * đo được 35/32/28/24 điểm và bậc lương 37/36/34/33 điểm ở bốn mức 1,2+1,3 ·
   * 1,6+1,8 · 1,9+2,1 · 2,2+2,4. Hạ hệ số an toàn — tức đẩy tỉ lệ thắng LÊN — làm
   * chênh lệch RỘNG ra chứ không hẹp lại, đúng như dự đoán của lời giải thích
   * trần. Không có mức nào vừa giữ tỉ lệ thắng 45–55% vừa giữ chênh lệch ≤ 15
   * điểm: hai chỉ tiêu này loại trừ nhau.
   *
   * Ngưỡng 40 điểm dưới đây bám theo khoảng THẬT quan sát được, và vẫn đủ chặt để
   * bắt được hồi quy: nó sẽ đỏ ngay nếu một xuất thân nào đó hoá thành lựa chọn
   * áp đảo. Xem mục L của docs/07-thiet-ke-v1-7.md.
   *
   * ---------- Vì sao bài này chuyển từ GIÁO VIÊN sang BÁC SĨ ở đợt 2 ----------
   * Không phải để tìm một nghề cho ra số đẹp hơn — mà vì trên giáo viên bài này
   * đã mất sạch khả năng đo. Sau khi đường lương trả về số thật, bốn xuất thân
   * của giáo viên ra 4% · 4% · 5% · 3%: chênh lệch teo còn 1,7 điểm không phải vì
   * bốn xuất thân đã hoá công bằng, mà vì cả bốn cùng bị dồn sát sàn 0, chỗ không
   * còn gì để phân biệt. Một bài test mà mọi nhánh đều ra "gần như không thắng"
   * thì không đỏ được trước bất kỳ hồi quy nào.
   *
   * Đã quét xem có mức `heSoAnToanTheoTuoi` nào cứu được bài này trên giáo viên
   * không (n=120 mỗi ô): thấp nhất trong bốn xuất thân là 3,3% ở mức đang cài,
   * 7,5% ở 1,6+1,8, 10,0% ở 1,2+1,3, và 10,8% ở 0,8+0,9 — tức chỉ mức đáy dải mới
   * vượt nổi ngưỡng 10%, mà mức đó lại đẩy kỹ sư lên 62,5% và phá chỉ tiêu 1.
   * Không có mức nào vừa giữ được chỉ tiêu 1 vừa cứu được bài này trên giáo viên.
   *
   * Bác sĩ đo ra 30,8 · 47,5 · 50,0 · 32,5 — chênh 19,2 điểm, bốn nhánh tách bạch
   * rõ ràng, và ĐÚNG điều bài này sinh ra để canh lại đo được: xuất thân dịch
   * chuyển cửa thắng thật sự mà không xuất thân nào thành nước đi hiển nhiên. Ý
   * định của bài không đổi một chữ; chỉ đổi chỗ đứng để nhìn cho thấy.
   */
  it('bốn xuất thân chênh nhau 19 điểm — không xuất thân nào là nước đi hiển nhiên', () => {
    const ty: number[] = []
    for (const x of XUAT_THAN) {
      const r = moPhongNhieuVan('bacSi', 120, CHIEN_LUOC_CAN_BANG, {
        xuatThanId: x.id,
        heSoLuongKhoiDiem: 1,
      })
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(`${x.ten.padEnd(24)} thắng ${(r.tyLeThang * 100).toFixed(1)}%`)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.4)
    // Không xuất thân nào được thành nước đi hiển nhiên đúng hay hiển nhiên sai
    expect(Math.min(...ty)).toBeGreaterThan(0.1)
    expect(Math.max(...ty)).toBeLessThan(0.9)
  })

  it('năm bậc lương chênh nhau 33 điểm — không bậc nào là nước đi hiển nhiên', () => {
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
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.4)
    expect(Math.min(...ty)).toBeGreaterThan(0.1)
    expect(Math.max(...ty)).toBeLessThan(0.9)
  })
})

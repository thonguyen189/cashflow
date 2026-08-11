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

  it('CHỈ TIÊU 1 — bot cân bằng thắng 45–55%, đều cả ba nghề', () => {
    const ty: number[] = []
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thắng ${(r.tyLeThang * 100).toFixed(1)}%` +
          ` · tuổi thắng TB ${tuoiThang(r.soNamTrungBinhKhiThang).toFixed(1)}` +
          ` · sống trọn đời ${(r.tyLeSongTronDoi * 100).toFixed(1)}%` +
          ` · thua vì hạnh phúc ${(r.tyLeThuaVi.hanhPhuc * 100).toFixed(1)}%` +
          ` · phá sản ${(r.tyLeThuaVi.phaSan * 100).toFixed(1)}%` +
          ` · hết đời chưa tự do ${(r.tyLeThuaVi.hetDoi * 100).toFixed(1)}%`,
      )
      expect(r.tyLeThang).toBeGreaterThanOrEqual(0.45)
      expect(r.tyLeThang).toBeLessThanOrEqual(0.55)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.1)
  })

  it('CHỈ TIÊU 2 — tuổi thắng trung bình rơi vào 52–62', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN_CHI_TIEU)
      const tuoi = tuoiThang(r.soNamTrungBinhKhiThang)
      expect(tuoi).toBeGreaterThanOrEqual(52)
      expect(tuoi).toBeLessThanOrEqual(62)
    }
  })

  /**
   * ---------- CHỈ TIÊU 3 KHÔNG ĐẠT ----------
   * Mục J muốn chết non vì hạnh phúc chỉ còn ≤ 40% số ván thua. Đo thật: 88% /
   * 100% / 95%. Đây là ngưỡng bám theo khoảng THẬT quan sát được, không phải
   * khoảng mong muốn ban đầu — cùng khuôn với mục F của v1.6.
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
   * Mục J muốn > 30% số ván sống trọn tới tuổi 100. Đo thật: 8% / 0% / 2,5%.
   *
   * Dù vậy đây KHÔNG phải chỗ đứng yên so với v1.6. Suốt bản đó, dò vết 1000 ván
   * mỗi tổ hợp cho thấy KHÔNG ván nào sống quá năm thứ 35 — nửa sau cuộc đời chưa
   * từng được chơi lấy một lần. Nay ván dài nhất chạm trọn 79 năm và tuổi thắng
   * trung bình đã lùi từ 33–42 lên 53–61, tức phần đời sau tuổi 50 đã thật sự
   * được mô phỏng đi qua. Test dưới đây chốt đúng điều đó: chốt cái đã đạt được,
   * và ghi lại cái chưa.
   *
   * Nguyên nhân không đạt là hệ quả số học của chỉ tiêu 3: muốn > 30% ván sống
   * trọn đời trong khi 45–55% ván kết thúc bằng chiến thắng, thì cửa thua hạnh
   * phúc chỉ được phép lấy đi ≤ 20% tổng số ván. Đo thật con số đó là 45–51%.
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
   * ---------- CHỈ TIÊU 5 VÀ 6 KHÔNG ĐẠT — và lý do là CẤU TRÚC ----------
   * Mục J muốn bot cân bằng phá sản 8–18% và bot đòn bẩy > 30%. Đo thật: 0% và
   * 0%. Bản v1.6 cũng đo ra 0%, nhưng khi đó lời giải thích là "mô phỏng không
   * bao giờ sống quá năm thứ 35 nên không chạm tới quãng đời trả giá". Lời giải
   * thích ấy nay đã bị bác bỏ: ván chạy trọn 79 năm mà phá sản VẪN không xảy ra.
   *
   * Nguyên nhân thật nằm ở nấc 1 của cơ chế ba nấc vỡ nợ. Đếm trực tiếp số lần
   * mỗi nấc nổ (n = 450 ván mỗi chiến lược, cả ba nghề):
   *   · bot cân bằng: nấc 1 nổ 1 lần, nấc 2 nổ 0 lần, nấc 3 nổ 0 lần
   *   · bot đòn bẩy:  nấc 1 nổ 46 lần, nấc 2 nổ 9 lần, nấc 3 nổ 1 lần
   * Bot đòn bẩy vay tổng 15–27 tỷ mỗi ván ở 149/150 ván, vậy mà vẫn không đổ.
   * Lý do: nấc 1 bán tài sản đầu tư KHÔNG có giới hạn mỗi năm — nó bán tới khi
   * tiền mặt hết âm. Mà nấc 3 lại đòi khoản thiếu hụt còn vượt trọn một năm chi
   * phí SAU KHI đã bán sạch tài sản và thanh lý hết doanh nghiệp. Người chơi đem
   * tiền đi đầu tư thì luôn có cái để bán, nên trạng thái "nghèo tài sản mà nặng
   * nợ" — trạng thái duy nhất dẫn tới nấc 3 — không bao giờ xuất hiện.
   *
   * Nâng `xacSuatPhaSanCoBan` 0,02 → 0,15 KHÔNG sinh ra ván phá sản nào: nó chỉ
   * dìm tỉ lệ thắng của bot đòn bẩy từ 23% xuống 1%. Nó tạo ra sự nghèo đi, không
   * tạo ra sự sụp đổ. Muốn có phá sản thật thì phải sửa ENGINE — chẳng hạn chặn
   * mỗi năm chỉ được bán một phần danh mục — chứ không phải vặn thêm một con số
   * cân bằng nào. Xem mục L của tài liệu thiết kế.
   */
  it('CHỈ TIÊU 5 và 6 — phá sản vẫn KHÔNG xảy ra ở cả hai chiến lược', () => {
    const canBang = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU)
    const donBay = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU, CHIEN_LUOC_DON_BAY)
    // eslint-disable-next-line no-console
    console.log(
      `phá sản — cân bằng ${(canBang.tyLePhaSan * 100).toFixed(1)}%` +
        ` (mục J muốn 8–18%) · đòn bẩy ${(donBay.tyLePhaSan * 100).toFixed(1)}%` +
        ` (mục J muốn > 30%)`,
    )
    expect(canBang.tyLePhaSan).toBeLessThanOrEqual(0.02)
    expect(donBay.tyLePhaSan).toBeLessThanOrEqual(0.02)
  })

  /**
   * ---------- Đòn bẩy nay là nước đi LỖ, không còn là canh bạc ----------
   * Test cũ khẳng định "bot đòn bẩy khi thắng thì về đích sớm hơn bot cân bằng —
   * canh bạc có lãi kỳ vọng". Khẳng định đó đã lật hẳn ở v1.7 và test này ghi lại
   * chiều mới, đúng như đo được.
   *
   * Số học của nó rõ ràng, không cần mô phỏng mới thấy: trả góp đều gốc cộng lãi
   * đơn nên mỗi năm phải trả `(1 + 0,08 × 10) ÷ 10 = 18%` gốc. Dải sinh lời doanh
   * nghiệp hạ xuống 12–18% ở v1.7, rồi còn bị thuế thu nhập doanh nghiệp 20% cắn
   * tiếp, nên thực nhận chỉ còn 9,6–14,4%. Vay 18% để kiếm 9,6–14,4% là lỗ chắc
   * chắn từ 3,6 tới 8,4 điểm mỗi năm, ở MỌI cơ hội trong bộ bài — không còn cơ
   * hội nào để đòn bẩy thắng cả.
   *
   * Đây là quyết định thiết kế đang chờ người thật: xem khuyến nghị ở mục L.
   */
  it('bot đòn bẩy nay thua thiệt cả tỉ lệ thắng lẫn tốc độ — vay không còn có lãi', () => {
    const canBang = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU)
    const donBay = moPhongNhieuVan('bacSi', SO_VAN_CHI_TIEU, CHIEN_LUOC_DON_BAY)
    // eslint-disable-next-line no-console
    console.log(
      `bác sĩ — cân bằng thắng ${(canBang.tyLeThang * 100).toFixed(1)}%` +
        ` về đích tuổi ${tuoiThang(canBang.soNamTrungBinhKhiThang).toFixed(1)}` +
        ` · đòn bẩy thắng ${(donBay.tyLeThang * 100).toFixed(1)}%` +
        ` về đích tuổi ${tuoiThang(donBay.soNamTrungBinhKhiThang).toFixed(1)}`,
    )
    // Chi phí vay mỗi năm tính thẳng từ CONFIG, không viết cứng: nó phải nằm TRÊN
    // trần dải sinh lời sau thuế thì kết luận "vay là lỗ" mới đứng vững.
    const chiPhiVayMoiNam =
      (1 + CONFIG.laiSuatVay * CONFIG.kyHanVayToiDa) / CONFIG.kyHanVayToiDa
    const sinhLoiToiDaSauThue = 0.18 * (1 - CONFIG.thue.thueDoanhNghiep)
    expect(chiPhiVayMoiNam).toBeGreaterThan(sinhLoiToiDaSauThue)
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
   * nhau với chỉ tiêu tỉ lệ thắng 45–55% ở đầu bảng. Đo thật: 24 điểm và 33 điểm.
   *
   * Đây KHÔNG phải chuyện game hoá bất công hơn — nó là HIỆU ỨNG TRẦN biến mất.
   * Ở v1.6 bot cân bằng thắng 91–94%, tức mọi xuất thân đều đụng trần: nhà thuần
   * nông thắng 85% còn nhà khá giả thắng 97% thì chênh lệch đo được chỉ có 12
   * điểm, vì cả hai đều bị ép sát vào 100%. Kéo tỉ lệ thắng về 45–55% theo đúng
   * chỉ tiêu 1 thì trần biến mất và khoảng cách THẬT lộ ra nguyên vẹn.
   *
   * Đã kiểm chứng bằng cách quét `heSoAnToanTheoTuoi` (n=200 mỗi điểm): chênh lệch
   * xuất thân đo được 35/32/28/24 điểm và bậc lương 37/36/34/33 điểm ở bốn mức
   * 1,2+1,3 · 1,6+1,8 · 1,9+2,1 · 2,2+2,4. Hạ hệ số an toàn — tức đẩy tỉ lệ thắng
   * LÊN — làm chênh lệch RỘNG ra chứ không hẹp lại, đúng như dự đoán của lời giải
   * thích trần. Không có mức nào vừa giữ tỉ lệ thắng 45–55% vừa giữ chênh lệch
   * ≤ 15 điểm: hai chỉ tiêu này loại trừ nhau.
   *
   * Ngưỡng 40 điểm dưới đây bám theo khoảng THẬT quan sát được, và vẫn đủ chặt để
   * bắt được hồi quy: nó sẽ đỏ ngay nếu một xuất thân nào đó hoá thành lựa chọn
   * áp đảo. Xem mục L của docs/07-thiet-ke-v1-7.md.
   */
  it('bốn xuất thân chênh nhau 24 điểm — không xuất thân nào là nước đi hiển nhiên', () => {
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

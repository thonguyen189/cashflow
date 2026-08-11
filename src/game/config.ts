/**
 * ============================================================
 *  BẢNG CÂN BẰNG GAME — chỉnh mọi con số ở đây
 * ============================================================
 * Đây là file duy nhất dev cần sửa để tinh chỉnh độ khó.
 * Sau khi sửa, chạy `npm test` để kiểm tra các bất biến vẫn đúng.
 */

import type { TrangThaiThiTruong } from './types'

export const TRIEU = 1_000_000
export const TY = 1_000_000_000

export const CONFIG = {
  /** ---------- Điều kiện thắng / thua ----------
   * Thắng khi ĐẠT TỰ DO TÀI CHÍNH: dòng tiền thụ động phủ được trọn nghĩa vụ
   * hàng năm. Thua khi hạnh phúc rơi dưới ngưỡng. Sống trọn hành trình tới
   * tuổi 100 là kết thúc "viên mãn" riêng.
   *
   * Vì chi phí sinh hoạt của mỗi nghề mỗi khác và leo theo lạm phát lẫn cột
   * mốc gia đình, mục tiêu tự khắc riêng theo nghề và tự chống lạm phát —
   * không cần một con số cứng nào cả.
   */
  tuDoTaiChinh: {
    /** ---------- Hệ số an toàn theo tuổi (v1.7) ----------
     * heSoAnToan(tuổi) = heSoToiThieu + heSoPhuThem × (tuổi viên mãn − tuổi) / quãng đời
     *
     * Tuổi 21 đòi 2,50 · tuổi 40 đòi 2,19 · tuổi 65 đòi 1,78 · tuổi 100 đòi 1,20.
     *
     * Đây chính là quy tắc 4% ngoài đời: nghỉ hưu càng sớm thì tỉ lệ rút an toàn
     * phải càng thấp, vì tiền phải nuôi bạn càng lâu và càng nhiều lần đi qua
     * khủng hoảng. Nó giết thẳng kiểu thắng ở tuổi 31 mà không cần cấm đoán gì —
     * chỉ cần nói đúng sự thật.
     *
     * Con số cũ là 1,5 cố định. Đo thực nghiệm cho thấy hệ số này chỉ dời TUỔI
     * thắng chứ không hạ TỈ LỆ thắng (nâng lên 4,0 vẫn ra 91–94%), nên nó ở đây
     * với tư cách công cụ NHỊP ĐỘ, không phải công cụ độ khó.
     */
    heSoToiThieu: 1.2,
    heSoPhuThem: 1.3,
  },

  /** ---------- Cột mốc tài sản ----------
   * Không còn là điều kiện thắng, chỉ là huy hiệu ghi nhận đường đi. Mốc cao
   * nhất = `mocCaoNhatTheoChiPhi` × chi phí sinh hoạt gốc của nghề — mặt kia
   * của quy tắc rút 4% — nên nghề sống đắt đỏ phải leo cột cao hơn. Toàn bộ
   * nhân với chỉ số giá để lạm phát không bào mòn ý nghĩa của cột mốc.
   */
  mocTaiSan: {
    mocCaoNhatTheoChiPhi: 25,
    tyLeCacMoc: [0.1, 0.25, 0.5, 1],
    /** làm tròn mốc tới bội số này cho dễ đọc */
    lamTronToi: 100 * TRIEU,
    hanhPhuc: 5,
  },

  /** ---------- Cốt truyện trăm năm ----------
   * Năm 1 = tuổi 21. Các cột mốc đời người được hẹn lịch ngay khi tạo ván
   * (tất định theo seed): cưới → con thứ nhất → con thứ hai → các con vào
   * đại học rồi tự lập → nghỉ hưu → mừng thọ → tròn 100 tuổi.
   */
  cotTruyen: {
    tuoiBatDau: 21,
    tuoiVienMan: 100,

    cuoiTuoiSomNhat: 26,
    cuoiTuoiMuonNhat: 32,
    /** chi phí đám cưới = tỉ lệ này × chi phí sinh hoạt năm đó */
    cuoiChiPhiTheoChiPhiNam: 1.0,
    cuoiHanhPhuc: 25,
    /** bạn đời đóng góp thêm tỉ lệ này × lương người chơi mỗi năm */
    cuoiThuNhapBanDoi: 0.25,
    cuoiTangChiPhi: 0.2,

    conSauCuoiMin: 1,
    conSauCuoiMax: 3,
    con2SauCon1Min: 2,
    con2SauCon1Max: 4,
    sinhConHanhPhuc: 30,
    /** mỗi con đang nuôi (0–21 tuổi) cộng thêm tỉ lệ này vào chi phí cố định */
    conTangChiPhi: 0.25,
    conTuoiDaiHoc: 18,
    /** học phí đại học một lần = tỉ lệ này × chi phí sinh hoạt năm đó */
    conDaiHocChiPhiTheoChiPhiNam: 0.8,
    conDaiHocHanhPhuc: 10,
    conTuoiTuLap: 22,
    conTuLapHanhPhuc: 15,
    /** thẻ "con nhỏ" chỉ rút khi còn con dưới tuổi này */
    conTuoiToiDaTheConNho: 13,

    tuoiNghiHuu: 60,
    /** lương hưu = tỉ lệ này × lương cuối; sau đó chỉ tăng theo lạm phát */
    tyLeLuongHuu: 0.45,
    /** xác suất ốm đau cộng thêm mỗi năm sau tuổi nghỉ hưu */
    omDauTangMoiNamSauHuu: 0.012,
    omDauXacSuatToiDa: 0.45,

    mungThoTuoi: [70, 80, 90],
    mungThoHanhPhuc: 10,

    /** con tròn tuổi này thì bạn lên chức ông/bà */
    conTuoiSinhChau: 30,
    lenChucOngBaHanhPhuc: 15,

    /** ---------- Bảo hiểm tuổi già ----------
     * Phí bảo hiểm leo theo tuổi và sau tuổi đồng trả người chơi phải tự
     * gánh một phần viện phí — nếu không, bảo hiểm giá rẻ sẽ vô hiệu hoá
     * toàn bộ áp lực sức khoẻ mà tuổi già đáng ra phải tạo ra.
     */
    baoHiemTangPhiMoiNamSauHuu: 0.06,
    /** phí tối thiểu = tỉ lệ này × chi phí sinh hoạt, dùng khi lương hưu quá thấp */
    baoHiemToiThieuTheoChiPhi: 0.5,
    baoHiemDongTraTuoi: 70,
    baoHiemTyLeDongTra: 0.3,

    /** chuyện tuổi già: xác suất mỗi năm sau tuổi này */
    tuoiGiaSuKienTuTuoi: 70,
    tuoiGiaSuKienXacSuat: 0.3,

    /** ---------- Chăm sóc tuổi già (v1.7) ----------
     * Thuê người chăm, thuốc men hàng ngày, viện dưỡng lão. Bản v1.6 hoàn toàn
     * không có khoản này, mà ngoài đời nó chính là cái làm người đã về hưu vỡ
     * trận: thu nhập đứng yên trong khi chi phí leo không ngừng.
     *
     * Vì `nghiaVuHangNam` lấy `chiPhiHangNam` làm thành phần chính, cái ĐÍCH tự
     * do tài chính tự lùi ra khi bạn già đi — giữ được tự do ở tuổi 60 không có
     * nghĩa là giữ được ở tuổi 85. Đây là mảnh ghép làm cho chế độ chơi tiếp sau
     * khi thắng có ý nghĩa thật.
     */
    chamSocTuTuoi: 75,
    chamSocTangMoiNam: 0.03,
    chamSocToiDa: 0.6,
  },

  /** ---------- Hạnh phúc ---------- */
  hanhPhucBanDau: 70,
  /** thua nếu hạnh phúc thấp hơn mức này lúc bấm Kết thúc năm */
  hanhPhucNguongThua: 50,
  /**
   * Dưới mức này thì kể chuyện kiệt sức và mở chương trình hỗ trợ của chuyên gia.
   *
   * Đứng ở cấp cao nhất ngay cạnh ngưỡng thua vì hai con số là anh em của cùng một
   * khái niệm — vùng nguy hiểm của thanh hạnh phúc — và cả HUD lẫn thẻ hành động
   * cuối năm đều phải đọc cả hai để tô màu và nhắc nhở cho khớp nhau.
   */
  hanhPhucNguongCanhBao: 60,
  /**
   * Lợi ích giảm dần: điểm nhận được vượt quá `tranMem` chỉ còn `heSoVuotTran`,
   * và không bao giờ vượt `tranCung`. Bản gốc để hạnh phúc lên 208 vô nghĩa.
   */
  hanhPhucTranMem: 100,
  hanhPhucHeSoVuotTran: 0.4,
  hanhPhucTranCung: 130,

  /** ---------- Thẻ tiêu dùng mỗi năm ---------- */
  soTheMoiNamMin: 4,
  soTheMoiNamMax: 5,

  /** ---------- Lạm phát ---------- */
  lamPhatMin: 0.03,
  lamPhatMax: 0.09,

  /** ---------- Lương ----------
   * Lương tăng theo lạm phát CỘNG phần tăng thực. Nếu bỏ phần bám lạm phát, chi
   * phí sẽ leo nhanh hơn thu nhập và nghề lương thấp thành bất khả thi — đã
   * kiểm chứng bằng balance.test.ts.
   *
   * Phần tăng thực chuyển sang `Nghe.duongCongSuNghiep` ở v1.7 (xem content.ts):
   * mỗi nghề một hình dạng riêng, và kỹ sư phần mềm có đoạn ÂM sau tuổi 50. Đây
   * cũng là lần đầu tiên game có một nguồn thu BIẾT SỤP trong lúc còn đi làm —
   * mục F của docs/06-thiet-ke-v1-6.md kết luận rằng chính việc thiếu điều đó là
   * lý do phá sản không bao giờ xảy ra được.
   */
  luongBamLamPhat: true,

  /** ---------- Ngân hàng ----------
   * v1.2 hạ lãi và kéo dài kỳ hạn để "vay mua doanh nghiệp" thành quyết
   * định cân não thật: trả 10 năm lãi 8% ≈ 18%/năm gốc.
   *
   * ---------- v1.7: dải sinh lời hạ, quan hệ với lãi vay đã đổi ----------
   * Lúc đặt số này (v1.2), 18%/năm nằm sát ngay dưới dải sinh lời doanh
   * nghiệp cũ 18,75–22,5%/năm, nên vay để rót vốn vẫn có lời chút ít — cân
   * não thật vì biên lời mỏng chứ không phải vì lỗ. v1.7 hạ dải sinh lời
   * xuống 12–18% (xem chú thích đầu mảng `CO_HOI` trong content.ts) mà
   * KHÔNG đổi lãi vay: giờ chi phí vay 18%/năm chạm trần hoặc vượt hẳn cả
   * dải, nên đòn bẩy hoà vốn ở kịch bản tốt nhất và lỗ ròng ở phần lớn cơ
   * hội còn lại. Đây là hệ quả ĐÃ BIẾT của việc hạ dải sinh lời, CỐ Ý chưa
   * vá ở đây — để dành cho vòng hiệu chỉnh cân bằng cân nhắc cùng lúc với
   * những đòn bẩy độ khó khác (mục J, tài liệu thiết kế v1.7), không phải
   * lỗi cần sửa ngay khi đọc thấy dòng này.
   */
  laiSuatVay: 0.08,
  kyHanVayToiDa: 10,
  /**
   * Tổng thanh toán nợ hàng năm không vượt quá tỉ lệ này của lương. Ngân hàng
   * Việt Nam cho vay thế chấp thực tế duyệt tới khoảng 65% thu nhập — 0,5 (mức
   * cũ) thận trọng hơn thực tế nhiều, khiến đòn bẩy không bao giờ nguy hiểm
   * thật (trả nợ luôn kịp vì lương là nguồn thu không sập, kể cả trong khủng
   * hoảng), mà đòn bẩy không nguy hiểm thì bài học về phá sản không tồn tại
   * (v1.6 Phase 5, vấn đề "phá sản không bao giờ xảy ra").
   */
  tyLeThanhToanToiDa: 0.65,

  /** ---------- Thuế ----------
   * Theo Luật Thuế thu nhập cá nhân sửa đổi, hiệu lực 1/7/2026: giảm trừ bản
   * thân 15,5tr/tháng (186tr/năm), mỗi người phụ thuộc 6,2tr/tháng (74,4tr/năm),
   * biểu thuế rút gọn từ bảy bậc xuống NĂM bậc.
   *
   * ---------- Vì sao thuế TNCN KHÔNG phải đòn bẩy hạ tỉ lệ thắng ----------
   * Với thang lương của v1.7 (90/120/144tr) và mức giảm trừ 186tr, cả ba nghề
   * KHÔNG nộp một đồng nào trong khoảng mười lăm năm đầu. Thuế chỉ cắn khi đã
   * thành công: kỹ sư phần mềm tuổi 40 nộp 3,9% lương, bác sĩ tuổi 60 nộp 10,9%.
   * Nó là phanh hãm giai đoạn giàu và là một chi tiết đời thật đáng có, không
   * hơn. Sức nặng cân bằng thật nằm ở thang tiền, đường cong sự nghiệp và thuế
   * thu nhập doanh nghiệp.
   *
   * ---------- Vì sao mọi ngưỡng phải nhân chỉ số giá ----------
   * Ngưỡng đứng yên trong khi lương bám lạm phát thì sau vài chục năm ai cũng
   * nộp bậc cao nhất dù thu nhập THỰC không đổi — thuế hoá thành khoản phạt vì
   * sống lâu, và nó sẽ bóp méo toàn bộ nửa sau ván chơi. Ngoài đời mức giảm trừ
   * cũng được điều chỉnh định kỳ, đúng như vậy.
   *
   * Thu nhập của bạn đời (25% lương người chơi) KHÔNG bị đánh thuế ở đây: họ có
   * suất giảm trừ bản thân riêng, mà 0,25 × lương chỉ vượt 186tr khi lương người
   * chơi trên 744tr — tới lúc đó khoản thuế của họ cũng chỉ vài phần nghìn tổng
   * thu nhập hộ gia đình. Bỏ qua là đơn giản hoá có ý thức.
   */
  thue: {
    /** giảm trừ bản thân mỗi năm, tại mặt bằng giá gốc */
    giamTruBanThan: 186 * TRIEU,
    /** giảm trừ mỗi người phụ thuộc (con đang nuôi) mỗi năm */
    giamTruPhuThuoc: 74.4 * TRIEU,
    /** biểu luỹ tiến từng phần: `den` là trần thu nhập TÍNH THUẾ của bậc */
    bacThue: [
      { den: 120 * TRIEU, thueSuat: 0.05 },
      { den: 360 * TRIEU, thueSuat: 0.1 },
      { den: 720 * TRIEU, thueSuat: 0.2 },
      { den: 1200 * TRIEU, thueSuat: 0.3 },
      { den: Number.POSITIVE_INFINITY, thueSuat: 0.35 },
    ],
    /** thuế thu nhập doanh nghiệp trên lợi nhuận được chia */
    thueDoanhNghiep: 0.2,
  },

  /** ---------- Bảo hiểm y tế ---------- */
  /** phí bảo hiểm mỗi năm = tỉ lệ này × lương hiện tại */
  baoHiemTyLeLuong: 0.02,

  /** ---------- Bảo hiểm xe ----------
   * Chỉ có hiệu lực khi người chơi đã mua ước nguyện xe máy hoặc ô tô. Mọi tỉ lệ
   * dưới đây đều tính trên GIÁ TRỊ XE của năm nay (giá gốc × chỉ số giá), nên phí
   * lẫn mức đền bù đều leo theo lạm phát.
   *
   * Trách nhiệm dân sự rẻ như cho, đúng như ngoài đời — nó không phải bài toán
   * cân não mà là bài học "bắt buộc thì phải mua". Quyết định thật nằm ở bảo hiểm
   * vật chất xe: phí đắt gấp bốn lần, đổi lại chặn được cú mất trộm vốn xoá luôn
   * món ước nguyện và khoản hạnh phúc nó mang lại mỗi năm.
   *
   * ---------- Cân đối phí và kỳ vọng đền bù ----------
   * Bộ số đầu tiên đặt xác suất quá cao: cả ba loại đều đền gấp nhiều lần phí,
   * nên mua bảo hiểm là hiển nhiên đúng và chẳng còn gì để cân nhắc. Bộ số dưới
   * đây hạ tần suất xuống cho sát đời thật, và đặt kỳ vọng như sau (tính trên
   * giá trị xe mỗi năm):
   *
   *   Trách nhiệm dân sự  phí 0,4%  · đền 0,05 × 0,30       = 1,5%   → lãi ~3,7 lần
   *   Vật chất xe         phí 1,8%  · đền 0,06 × 0,14
   *                                   + 0,008 × 1,00        = 1,64%  → lỗ nhẹ
   *   Tai nạn người ngồi  phí 0,5%  · đền 0,05 × 0,4 × 0,15 = 0,3%   → lỗ nhẹ
   *
   * Loại bắt buộc CỐ Ý lãi đậm — bỏ nó là dại, và game nên nói thẳng điều đó.
   * Hai loại tự nguyện thì lỗ nhẹ về tiền, đúng như mọi hợp đồng bảo hiểm ngoài
   * đời: cái bạn mua không phải lợi nhuận mà là chặn đuôi rủi ro. Vật chất xe
   * chặn cú mất trắng chiếc xe (nay phải mua lại theo giá hiện hành, xem
   * `giaUocNguyen`), tai nạn người ngồi chặn 5 điểm hạnh phúc.
   */
  baoHiemXe: {
    tyLePhiTrachNhiemDanSu: 0.004,
    tyLePhiVatChatXe: 0.018,
    tyLePhiTaiNanNguoiTrenXe: 0.005,

    /** va chạm giao thông: bồi thường cho người bị nạn */
    vaChamXacSuat: 0.05,
    vaChamDenBuMin: 0.15,
    vaChamDenBuMax: 0.45,
    vaChamMatHanhPhucCoBaoHiem: 2,
    vaChamMatHanhPhucKhongBaoHiem: 8,
    /** kèm khả năng có người ngồi trên xe bị thương */
    vaChamXacSuatCoThuongTich: 0.4,
    thuongTichVienPhiTyLe: 0.15,
    thuongTichMatHanhPhuc: 5,

    /** xe hỏng nặng phải sửa lớn */
    xeHongXacSuat: 0.06,
    xeHongChiPhiMin: 0.1,
    xeHongChiPhiMax: 0.18,

    /** mất trộm: không có bảo hiểm vật chất thì mất luôn món ước nguyện.
     * Hiếm nhưng là cú đau nhất trong cả nhóm, nên nó gánh gần nửa kỳ vọng
     * đền bù của bảo hiểm vật chất xe. */
    matTromXacSuat: 0.008,
    matTromMatHanhPhuc: 12,

    /** bị phạt khi thiếu bảo hiểm trách nhiệm dân sự bắt buộc */
    phatXacSuat: 0.2,
    phatTyLe: 0.01,
    phatMatHanhPhuc: 3,
  },

  /** ---------- Chu kỳ kinh tế ----------
   * Trước v1.6 mỗi kênh rút biến động độc lập, nên danh mục dàn đều luôn êm ru
   * và "đa dạng hoá" chỉ là khẩu hiệu chứ không phải quyết định. Khủng hoảng
   * thật thì cổ phiếu, bất động sản và tiền mã hoá cùng rơi một lượt, doanh
   * nghiệp hụt thu, lạm phát vọt lên — và chỉ vàng với trái phiếu còn đứng vững.
   *
   * ---------- Ma trận này cho ra nhịp nào (siết lại ở v1.7) ----------
   * Bản v1.6 cho khủng hoảng chiếm 9,9% số năm, một đợt mỗi 13,6 năm. Đo thực
   * nghiệm cho thấy đó là mức mà một danh mục dàn đều vẫn đi qua êm ru. Ma trận
   * v1.7 đẩy lên khoảng 17% số năm và làm sâu hơn hẳn: giá sập 45% thay vì 30%,
   * lợi tức còn một phần tư thay vì một nửa, lạm phát vọt thêm 7 điểm.
   *
   * Đo riêng đòn này ở thực nghiệm vòng hai, tỉ lệ thắng của giáo viên rơi từ
   * 72% xuống 51% — đòn bẩy mạnh thứ hai của cả bản, sau thang tiền.
   *
   * Hai tính chất của v1.6 giữ nguyên: khủng hoảng không bao giờ nhảy thẳng về
   * thịnh vượng (kinh tế hồi phục dần chứ không bật dậy), và suy thoái là cửa
   * ngõ chính vào khủng hoảng.
   */
  thiTruong: {
    banDau: 'binhThuong' as TrangThaiThiTruong,
    maTranChuyen: {
      thinhVuong: { thinhVuong: 0.42, binhThuong: 0.34, suyThoai: 0.16, khungHoang: 0.08 },
      binhThuong: { thinhVuong: 0.2, binhThuong: 0.46, suyThoai: 0.24, khungHoang: 0.1 },
      suyThoai: { thinhVuong: 0.04, binhThuong: 0.3, suyThoai: 0.36, khungHoang: 0.3 },
      khungHoang: { thinhVuong: 0, binhThuong: 0.22, suyThoai: 0.43, khungHoang: 0.35 },
    },
    /**
     * `doLechGia` cộng vào biến động giá sau khi nhân `nhayChuKy` của từng kênh.
     * `heSoLoiTuc` nhân vào cổ tức, tiền thuê, thu nhập doanh nghiệp, xác suất
     * thăng chức và thưởng Tết. `lechLamPhat` cộng thẳng vào lạm phát của năm —
     * khủng hoảng đẩy lạm phát từ 6% lên 11%, đúng cảnh đình lạm năm 2008.
     */
    tacDong: {
      thinhVuong: { doLechGia: 0.1, heSoLoiTuc: 1.15, lechLamPhat: 0, heSoTangLuong: 1.3 },
      binhThuong: { doLechGia: 0, heSoLoiTuc: 1, lechLamPhat: 0, heSoTangLuong: 1 },
      suyThoai: { doLechGia: -0.18, heSoLoiTuc: 0.65, lechLamPhat: 0.02, heSoTangLuong: 0.2 },
      khungHoang: { doLechGia: -0.45, heSoLoiTuc: 0.25, lechLamPhat: 0.07, heSoTangLuong: 0 },
    },
    /** giá có thể sập chín phần mười nhưng không về không */
    sanBienDong: -0.9,
    ten: {
      thinhVuong: 'Thịnh vượng',
      binhThuong: 'Bình thường',
      suyThoai: 'Suy thoái',
      khungHoang: 'Khủng hoảng',
    },
    icon: {
      thinhVuong: '📈',
      binhThuong: '😐',
      suyThoai: '📉',
      khungHoang: '💥',
    },
  },

  /** ---------- Xuất thân và bậc lương khởi điểm ----------
   * Ngoài đời hai người cùng nghề có thể chênh nhau cả một gia tài ở vạch xuất
   * phát. Xuất thân lo phần vốn, bậc lương lo phần năng lực.
   *
   * ---------- Vì sao bậc lương phải trừ hạnh phúc ----------
   * Nếu chỉ có tiền thì lương cao LUÔN thắng: lương lớn hơn chi phí nên nhân
   * cùng một tỉ lệ vẫn ra thặng dư lớn hơn. Khoản trừ hạnh phúc mới là vế giữ
   * cân bằng — bậc cao nhất mất 5 điểm mỗi năm, đúng bằng khoản phạt khát vọng,
   * mà hạnh phúc lại là điều kiện thua duy nhất. Người chọn lương cao đang đổi
   * tiền lấy tuổi thọ của ván chơi.
   */
  xuatThan: {
    /** các bậc nhân với lương gốc của nghề */
    bacLuong: [0.75, 0.875, 1, 1.125, 1.25],
    /** lệch 1 phần lương thì chi phí sinh hoạt lệch ngần này phần */
    loiSongTheoLuong: 0.6,
    /** áp lực công việc: hạnh phúc trừ mỗi năm = (hệ số lương − 1) × số này */
    apLucTheoLuong: 20,
  },

  /** ---------- Chuyên gia đồng hành ----------
   * Hai gói dịch vụ để người chơi CHỦ ĐỘNG can thiệp khi hạnh phúc tụt dốc. Trước
   * bản này mọi đường hồi phục đều thụ động: thẻ tiêu dùng do máy rút, ước nguyện
   * thì đắt và chỉ có ba món — hết là hết đường, chỉ còn ngồi nhìn thanh hạnh phúc
   * trôi về ngưỡng thua.
   *
   * ---------- Vì sao trị liệu KHÔNG phá vỡ điều kiện thua ----------
   * Liệu trình cho tổng 24 điểm với giá bằng 25% chi phí sinh hoạt một năm. So với
   * ước nguyện xe máy — 80 triệu đổi lấy 5 điểm mỗi năm tới hết đời — trị liệu lỗ
   * nặng nếu tính đường dài. Đó là chủ ý: nó là CẤP CỨU, không phải kênh đầu tư
   * hạnh phúc. Ai mua nó thay cho ước nguyện sẽ nghèo cả tiền lẫn điểm.
   *
   * Trường hợp xấu nhất — người chơi giàu mua liệu trình nối tiếp trọn đời — quy về
   * `hanhPhucToiThieu` điểm mỗi năm với chi phí đều đặn 8,3% chi phí sinh hoạt hàng
   * năm, vẫn thua xa một chiếc xe máy. Chuỗi nhạt dần do `giamHieuQuaMoiLan` sinh ra
   * chính là thứ chặn chiến thuật "cứ có tiền thì mua hạnh phúc mãi mãi"; chuỗi cụ
   * thể và lý do trong truyện của nó nằm ở đúng một chỗ — chú thích của
   * `hoiPhucTriLieu` trong engine.ts — nên chỉnh ba con số dưới đây là phải đọc lại
   * chú thích ấy chứ không phải đi sửa một đoạn văn chép lại ở đây.
   *
   * ---------- Vì sao giảm nửa phí khi kiệt sức không phải lỗ hổng ----------
   * Điều kiện giảm giá là CỜ `daCanhBaoKietSuc`, không phải mức hạnh phúc hiện tại.
   * Cờ được chốt một lần ở Tổng kết năm TRƯỚC rồi đứng yên suốt năm nay, nên người
   * chơi không tự tạo được điều kiện giảm giá ngay giữa pha thẻ bài bằng cách từ
   * chối vài tấm thẻ cho hạnh phúc rơi xuống, và thứ tự bấm nút cũng không đổi được
   * tổng tiền phải trả. Đọc cờ còn đúng với câu chuyện hơn: chương trình hỗ trợ xét
   * trên một năm đã qua chứ không theo tâm trạng lúc bấm nút.
   *
   * Vế còn lại của rào chắn là mốc thời gian: liệu trình trả về theo TỪNG NĂM chứ
   * không hồi tức thì, mà buổi trị liệu lại diễn ra sau cửa ải thua trong
   * `chuyenNam`. Nên hạnh phúc 50–59 là cửa sổ hành động thật (mua lúc này thì năm
   * sau đã có điểm hồi), còn dưới 50 thì liệu trình đã quá muộn.
   *
   * CHÚ Ý: gói hoạch định tài chính thì CÓ cứu được năm đang thua, vì điểm hạnh phúc
   * của nó cộng ngay trong reducer nên kéo nổi người chơi từ 44 lên 50 để qua ải.
   * Đây là chủ ý chứ không phải sơ suất — chiếc phao đắt đỏ dùng đúng một lần cả ván,
   * giá bằng 60–120% chi phí sinh hoạt trọn một năm, và phải sẵn ngần ấy tiền mặt vào
   * đúng lúc túng quẫn nhất. Bài học vẫn nguyên: đừng đợi kiệt sức mới đi gặp chuyên
   * gia.
   *
   * ---------- Gói hoạch định tài chính ----------
   * Hoàn vốn quãng 11–13 năm. CHÚ Ý: phép chia 1,2 ÷ 0,08 ra 15 năm chỉ đúng nếu
   * khoản tiết kiệm đứng yên, mà nó không đứng yên — `chiPhiHangNam` leo theo lạm
   * phát 3–9% mỗi năm rồi leo tiếp khi cưới và sinh con.
   *
   * Ngoài ra 8% ấy còn cắt vào SÁU khoản khác đều neo vào `chiPhiHangNam`: sàn phí
   * bảo hiểm y tế (0,5), nghĩa vụ hàng năm (1,0), chi phí đám cưới (1,0), học phí đại
   * học mỗi con (0,8), viện phí khi ốm đau (0,3) và sự cố đời sống (0,15). Vì
   * `nghiaVuHangNam` nằm trong danh sách, giảm 8% chi phí cũng hạ mức cần đạt để tự
   * do tài chính chừng ấy — một khoản đầu tư dài hơi thật sự. Cột mốc tài sản CỐ Ý
   * không đổi theo, vì `mocTaiSanCuaNghe` tính trên chi phí gốc của nghề để bảng huy
   * hiệu giữ nguyên thước đo giữa các ván.
   */
  chuyenGia: {
    /** phí cả hai gói còn lại tỉ lệ này khi cờ kiệt sức đang bật */
    heSoGiamPhiKhiKietSuc: 0.5,

    tamLy: {
      /** phí = tỉ lệ này × chi phí sinh hoạt của năm mua */
      tyLePhiTheoChiPhi: 0.25,
      soNamLieuTrinh: 3,
      hanhPhucMoiNam: 8,
      /** mỗi liệu trình đã qua làm lần sau nhạt đi ngần này điểm */
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

  /** ---------- Khát vọng ---------- */
  /** hạnh phúc bị trừ mỗi năm khi chưa đạt được khát vọng của nghề */
  phatKhatVongMoiNam: 5,

  /** ---------- Sự kiện ngẫu nhiên mỗi năm ----------
   * (sinh con chuyển sang cốt truyện hẹn lịch, không còn ngẫu nhiên)
   */
  suKien: {
    /** ốm đau: mất tiền + hạnh phúc nếu không có bảo hiểm.
     * Viện phí lấy mức lớn hơn giữa (tỉ lệ × lương) và (tỉ lệ × chi phí năm) —
     * nếu chỉ neo vào lương thì về hưu lương thấp, ốm đau hoá vô hại.
     */
    omDauXacSuat: 0.18,
    omDauChiPhiTyLeLuong: 0.35,
    omDauChiPhiTyLeChiPhi: 0.3,
    omDauMatHanhPhuc: 10,

    /** thưởng Tết: tiền thưởng cuối năm, chỉ khi còn đi làm */
    thuongTetXacSuat: 0.25,
    thuongTetTyLeLuong: 0.15,

    /** thăng chức: tăng lương thực, chỉ khi còn đi làm */
    thangChucXacSuat: 0.1,
    thangChucTangLuongMin: 0.05,
    thangChucTangLuongMax: 0.08,

    /** sự cố đời sống: hỏng xe, sửa nhà... mất tiền + chút hạnh phúc */
    suCoXacSuat: 0.12,
    suCoChiPhiTyLeChiPhi: 0.15,
    suCoMatHanhPhuc: 3,
  },

  /** ---------- Cơ hội kinh doanh ----------
   * Mỗi năm rút hai suất: một suất ưu tiên lấy từ bộ cơ hội riêng của nghề đang
   * chơi, một suất lấy từ bộ chung. Hết cơ hội hợp lệ của nghề thì cả hai suất
   * lấy từ bộ chung.
   */
  soCoHoiMoiNam: 2,

  /** ---------- Quy mô góp vốn ----------
   * Trước v1.6 giá cơ hội chỉ nhân chỉ số giá, cơ hội đắt nhất là 2 tỷ. Khi tài
   * sản đã lên vài chục tỷ, mọi lời mời góp vốn đều thành tiền lẻ — người chơi
   * bấm nhận mà không phải nghĩ, và nửa sau ván chơi mất hết sức nặng.
   *
   * ---------- Vì sao rót to không phải lựa chọn hiển nhiên ----------
   * Cơ hội kinh doanh sinh lời 12–18% mỗi năm, cao hơn mọi kênh đầu tư. Ba
   * đối trọng giữ cho việc rót tối đa không phải nước đi đương nhiên đúng:
   *   1. Biến cố "doanh nghiệp đóng cửa" nhắm vào CÁI LỚN NHẤT, chỉ trả lại 20%.
   *   2. Khủng hoảng cắt một nửa thu nhập doanh nghiệp, mà nợ vay không giảm theo.
   *   3. Thanh lý gấp chỉ thu về 45% — tiền nằm trong doanh nghiệp không phải
   *      tiền lỏng.
   *
   * Canh bạc giữ nguyên một suất. Không phải vì cân bằng mà vì lời kể: canh bạc
   * là suất người ta mời bạn, không phải hàng bày bán để mua thêm.
   */
  quyMoGopVon: {
    bac: [1, 2, 3, 5, 8, 12],
    /** một cơ hội không được chiếm quá tỉ lệ này của tài sản ròng */
    tyLeToiDaTheoTaiSan: 0.6,
    /** vượt tỉ lệ này thì giao diện đổi màu cảnh báo tập trung vốn */
    nguongCanhBaoTapTrung: 0.4,
  },

  /** ---------- Doanh nghiệp: bão hoà và rủi ro nền ----------
   * Ở v1.6 một quán cà phê trả 20% vốn mỗi năm, mãi mãi, không già đi. Đó là cỗ
   * máy lãi kép không rủi ro, và là lý do sâu xa khiến mọi nghề đều tự do tài
   * chính trước tuổi 40.
   *
   * ---------- Bão hoà ----------
   * Thu nhập nền giảm THỰC 3% mỗi năm kể từ năm góp vốn — tức không bám đủ lạm
   * phát. Sau 5 năm còn 86%, 10 năm còn 74%, 15 năm còn 63%, 25 năm còn 47%.
   * Cạnh tranh mọc lên, thiết bị cũ đi, mặt bằng tăng giá, khách quen chuyển đi.
   * Người chơi buộc phải liên tục gây dựng cái mới thay vì mua một lần rồi ngồi
   * thu tiền tới già — và đây cũng là thứ khiến người ĐÃ tự do tài chính có thể
   * rớt lại nếu ngủ quên, điều kiện để chế độ chơi tiếp có ý nghĩa.
   */
  doanhNghiep: {
    /** thu nhập nền giảm thực ngần này mỗi năm kể từ năm góp vốn */
    baoHoaMoiNam: 0.03,

    /** ---------- Rủi ro nền ----------
     * Khác biến cố 🏚️ "doanh nghiệp đóng cửa" của v1.6: cái đó hẹn lịch, một
     * lần một ván, nhắm đúng cái lớn nhất, có lá chắn là không tập trung vốn.
     * Cái này là RỦI RO NỀN — thường xuyên, mù quáng, không có lá chắn nào.
     *
     * Giữ ba doanh nghiệp suốt mười năm thì xác suất mất ít nhất một cái là
     * khoảng 50%. Đây là đường mất vốn quan trọng nhất của v1.7, vì nó đánh
     * thẳng vào nguồn thu nhập thụ động — tức đánh thẳng vào điều kiện thắng.
     * Không có nó thì phá sản mãi mãi đo ra 0% như suốt bản v1.6.
     *
     * Thu hồi 10% — thanh lý vội vàng trong hoảng loạn còn tệ hơn cả thanh lý
     * có trật tự khi vỡ nợ (45%, xem khối `phaSan`).
     */
    xacSuatPhaSanCoBan: 0.02,
    /** mỗi năm sở hữu cộng thêm ngần này vào hệ số xác suất */
    tangRuiRoMoiNam: 0.04,
    heSoRuiRoThiTruong: {
      thinhVuong: 0.5,
      binhThuong: 1,
      suyThoai: 1.6,
      khungHoang: 2.5,
    },
    /** thu hồi được ngần này vốn góp khi doanh nghiệp đổ */
    hoanLaiKhiPhaSan: 0.1,
    matHanhPhuc: 6,
  },

  /** ---------- Biến cố lớn ----------
   * Sự kiện ngẫu nhiên sẵn có — ốm đau, sự cố, va chạm — đều ở mức vài chục phần
   * trăm chi phí một năm. Chúng là gợn sóng. Đời người thì có sóng lớn, và những
   * cú đó mới là thứ phân loại người có chuẩn bị và người không.
   *
   * ---------- Vì sao hẹn lịch chứ không tung xúc xắc mỗi năm ----------
   * Cùng khuôn với lịch cưới hỏi và sinh con của cốt truyện trăm năm. Hai lẽ:
   * mọi ván đều chắc chắn có biến cố nên không ván nào trôi qua nhạt nhoà, và số
   * lượng nằm trong tầm kiểm soát để cân bằng được.
   *
   * ---------- Lá chắn ----------
   * Mỗi biến cố có MỘT thứ người chơi phải chuẩn bị từ trước mới chặn được. Mọi
   * khoản tiền tính theo bội số chi phí sinh hoạt của năm xảy ra, nên biến cố lớn
   * lên cùng người chơi thay vì hoá vô hại về sau. Riêng bão lũ CỐ Ý không có lá
   * chắn: một trò chơi về tài chính mà giả vờ rằng chuẩn bị đủ kỹ thì miễn nhiễm
   * với mọi thứ là một trò chơi nói dối. Bù lại nó là cú nhẹ nhất trong sáu cái.
   */
  bienCo: {
    soBienCoMin: 3,
    soBienCoMax: 6,
    tuoiSomNhat: 28,
    tuoiMuonNhat: 85,
    cachNhauToiThieu: 8,

    /** 🏥 bệnh hiểm nghèo — lá chắn: bảo hiểm y tế */
    benhHiemNgheo: {
      tuoiToiThieu: 40,
      vienPhiTheoChiPhi: 2.5,
      /** thuốc ngoài danh mục thì bảo hiểm nào cũng không gánh */
      tuTraToiThieu: 0.12,
      matHanhPhucCoBaoHiem: 8,
      matHanhPhucKhongBaoHiem: 20,
      /** ốm nặng thì phải nghỉ — bảo hiểm chặn viện phí chứ không chặn việc này */
      heSoLuongNamDo: 0.5,
    },

    /** 🏭 mất việc — lá chắn: quỹ dự phòng tiền mặt */
    matViec: {
      /** tiền mặt phải đạt ngần này lần chi phí sinh hoạt mới coi là có dự phòng */
      duPhongTheoChiPhi: 1,
      heSoLuongCoDuPhong: 0.5,
      heSoLuongKhongDuPhong: 0,
      matHanhPhucCoDuPhong: 6,
      matHanhPhucKhongDuPhong: 15,
      diChungLuong: 0.85,
      /** mất việc giữa lúc cả thị trường đang sa thải thì đi xin lại thấp hơn nhiều */
      diChungLuongKhiKhungHoang: 0.75,
    },

    /** 👴 bố mẹ ngã bệnh — lá chắn: xuất thân có bố mẹ tích luỹ */
    boMeNgaBenh: {
      tuoiToiThieu: 35,
      tuoiToiDa: 70,
      chiPhiCoTichLuy: 0.5,
      chiPhiKhongTichLuy: 1.8,
      matHanhPhucCoTichLuy: 6,
      matHanhPhucKhongTichLuy: 12,
    },

    /** 💸 vỡ hụi, bị lừa đảo — lá chắn: chuyên gia hoạch định tài chính */
    voHui: {
      tuoiToiThieu: 30,
      tyLeTienMatCoChuyenGia: 0.08,
      tyLeTienMatKhongChuyenGia: 0.3,
      matHanhPhucCoChuyenGia: 5,
      matHanhPhucKhongChuyenGia: 15,
    },

    /** 🏚️ doanh nghiệp đóng cửa — lá chắn: không dồn quá nhiều vào một chỗ */
    doanhNghiepDongCua: {
      nguongTapTrung: 0.4,
      /** thanh lý máy móc, hàng tồn, tiền cọc mặt bằng */
      hoanLaiVon: 0.2,
      matHanhPhucDuoiNguong: 8,
      matHanhPhucTrenNguong: 18,
    },

    /** 🌊 bão lũ tàn phá — không có lá chắn */
    baoLu: {
      chiPhiCoNha: 1.8,
      chiPhiKhongNha: 1.2,
      matHanhPhucCoNha: 12,
      matHanhPhucKhongNha: 10,
    },
  },

  /** ---------- Phá sản ----------
   * Lần đầu không phải dấu chấm hết. Ngoài đời phá sản là mất tài sản, bị bán
   * giải chấp và làm lại với uy tín sứt mẻ — luật phá sản chừa lại nhà ở nhưng
   * KHÔNG chừa xe (v1.7): ước nguyện xe máy/ô tô đã mua bị bán giải chấp ngay ở
   * lần phá sản đầu tiên, còn căn hộ thì giữ.
   *
   * ---------- Vì sao vẫn là mối đe doạ thật ----------
   * Quãng đường từ mức khởi điểm 70 xuống ngưỡng thua 50 dài đúng 20 điểm. 15
   * điểm hạnh phúc là 75% quãng đường đó — đau thật, nhưng người chơi đang giữ
   * hạnh phúc ở mức khởi điểm vẫn còn 55 điểm, TRÊN ngưỡng thua, nên còn đường
   * gượng lại chứ không bị đẩy thẳng xuống thua ngay năm đó (25 điểm — con số
   * cũ — làm phép trừ ra 45, dưới ngưỡng 50, tức phá sản gần như luôn kéo theo
   * thua ngay lập tức, mâu thuẫn với câu "lần đầu không phải dấu chấm hết" ngay
   * bên trên). Cộng thêm mất sạch dòng tiền thụ động, mất khả năng vay để gây
   * dựng lại, và khoản phạt khát vọng vẫn tiếp tục chảy máu nếu chưa mua được
   * món của nghề — phá sản vẫn rất dễ kéo theo một cái thua vì hạnh phúc chỉ vài
   * năm sau nếu không gượng lại kịp, nên đây vẫn là biến cố đáng sợ nhất game.
   *
   * ---------- Con đường dẫn tới đây ----------
   * Vay tối đa để góp vốn quy mô lớn → khủng hoảng ập tới, thu nhập doanh nghiệp
   * còn một nửa, giá tài sản sập → nợ vẫn phải trả đủ, chi phí lại leo vì lạm
   * phát 11% → bán tài sản ở giá đáy vẫn không đủ → thanh lý doanh nghiệp với 45%
   * vốn → vẫn không đủ. Đó chính xác là cách người ta phá sản ngoài đời: không
   * phải vì một quyết định ngu ngốc, mà vì đòn bẩy gặp đúng chu kỳ xấu.
   *
   * ---------- Lần hai là hết (v1.7) ----------
   * Ngã một lần ở tuổi bốn mươi còn đứng dậy được; ngã lần nữa sau khi đã mất
   * năm năm cấm vay và ba năm cấm cơ hội thì không. Đây là cửa thua TÀI CHÍNH
   * đầu tiên của game — suốt v1.6, 100% ván thua là do hạnh phúc.
   */
  phaSan: {
    /** doanh nghiệp kém thanh khoản: bán gấp chỉ thu lại được ngần này vốn góp */
    tyLeThanhLyDoanhNghiep: 0.45,
    /** thiếu hụt vượt tỉ lệ này × chi phí sinh hoạt thì tuyên phá sản */
    nguongTheoChiPhi: 1,
    hanhPhuc: 15,
    soNamCamVay: 5,
    /** uy tín cần thời gian dựng lại */
    soNamCamCoHoi: 3,
    /** phá sản lần thứ mấy thì thua hẳn */
    soLanToiDa: 2,
    /**
     * Ước nguyện bị bán giải chấp khi phá sản. Luật phá sản ngoài đời chừa lại
     * nhà ở nhưng KHÔNG chừa xe — và về mặt lối chơi, khoản hạnh phúc hàng năm
     * từ căn hộ chính là thứ giúp người chơi gượng dậy.
     */
    uocNguyenBiMat: ['xeMay', 'oTo'] as string[],
  },

  /** ---------- Bảo lãnh cho người thân (v1.7) ----------
   * Em trai vay ngân hàng mua nhà, nhờ bạn đứng tên bảo lãnh.
   *
   * ---------- Vì sao đây là mảnh ghép then chốt ----------
   * Ba nấc vỡ nợ chỉ khởi động khi tiền mặt âm, mà tiền mặt chỉ âm khi có nợ
   * phải trả. Người chơi cẩn thận không vay thì KHÔNG THỂ phá sản, bất kể khủng
   * hoảng nặng tới đâu — đó là lý do v1.6 đo phá sản ra 0% ở mọi kịch bản. Đây
   * là đường vào nợ mà cả người chơi cẩn thận nhất cũng dính, và ngoài đời đúng
   * là cách rất nhiều gia đình Việt Nam mất sạch.
   *
   * Khoản nợ khi vỡ KHÔNG xét `vayToiDa`: người chơi không chọn vay, ngân hàng
   * chỉ đơn giản đến đòi. Đó chính là điểm mấu chốt — nếu kẹp nó vào hạn mức thì
   * nó lại thành một khoản vay bình thường và mất sạch ý nghĩa.
   *
   * Lá chắn duy nhất là từ chối và chịu mất hạnh phúc cùng tiếng xấu trong họ.
   * Một quyết định thật, không có đáp án đúng.
   */
  baoLanh: {
    tuoiToiThieu: 30,
    /** xác suất được mời trong một năm hợp lệ */
    xacSuatMoi: 0.06,
    hanhPhucKhiNhan: 8,
    hanhPhucKhiTuChoi: 10,
    /** xác suất người thân vỡ nợ sau khi đã nhận bảo lãnh */
    xacSuatVo: 0.35,
    voSauItNhat: 3,
    voSauNhieuNhat: 8,
    /** gốc khoản nợ phải gánh = tỉ lệ này × chi phí sinh hoạt của năm vỡ */
    gocTheoChiPhi: 2.5,
    kyHan: 10,
    hanhPhucKhiVo: 12,
  },

  /** ---------- Biểu đồ giá ----------
   * Số điểm giá "quá khứ" sinh sẵn khi tạo ván, để biểu đồ đầu tư
   * có đường giá sống động ngay từ năm đầu tiên.
   */
  soDiemGiaQuaKhu: 9,

  /** ---------- Lưu ván ---------- */
  luuKey: 'dong-tien-luu-v1-7',
} as const

export type Config = typeof CONFIG

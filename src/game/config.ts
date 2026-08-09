/**
 * ============================================================
 *  BẢNG CÂN BẰNG GAME — chỉnh mọi con số ở đây
 * ============================================================
 * Đây là file duy nhất dev cần sửa để tinh chỉnh độ khó.
 * Sau khi sửa, chạy `npm test` để kiểm tra các bất biến vẫn đúng.
 */

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
    /**
     * Dòng tiền thụ động phải đạt tỉ lệ này so với nghĩa vụ hàng năm.
     *
     * Vì dòng tiền được tính theo mức KỲ VỌNG mà thực nhận thì dao động mạnh
     * (quán cà phê có năm âm 35%, cổ tức có năm bằng 0), đòi đúng 100% kỳ vọng
     * nghĩa là cứ hai năm lại hụt một năm. Đệm 50% vừa đủ để năm xấu nhất của
     * một doanh nghiệp vẫn không làm bạn phải đi làm lại.
     *
     * Hệ số này điều chỉnh NHỊP ĐỘ ván chơi, không phải tỉ lệ thắng: mô phỏng
     * cho thấy nâng từ 1,0 lên 2,0 kéo ván dài thêm khoảng năm năm mà tỉ lệ
     * thắng đứng yên, vì thua chỉ đến từ hạnh phúc.
     */
    heSoAnToan: 1.5,
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
   * Lương tăng theo lạm phát CỘNG một phần tăng thực. Nếu bỏ phần bám
   * lạm phát, chi phí sẽ leo nhanh hơn thu nhập và nghề lương thấp
   * thành bất khả thi — đã kiểm chứng bằng balance.test.ts.
   */
  luongBamLamPhat: true,
  tangLuongThucMin: 0.0,
  tangLuongThucMax: 0.025,

  /** ---------- Ngân hàng ----------
   * v1.2 hạ lãi và kéo dài kỳ hạn để "vay mua doanh nghiệp" thành quyết
   * định cân não thật: trả 10 năm lãi 8% ≈ 18%/năm gốc, sát mức sinh lời
   * 18,75–22,5%/năm của các cơ hội kinh doanh.
   */
  laiSuatVay: 0.08,
  kyHanVayToiDa: 10,
  /** tổng thanh toán nợ hàng năm không vượt quá tỉ lệ này của lương */
  tyLeThanhToanToiDa: 0.5,

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

  /** ---------- Biểu đồ giá ----------
   * Số điểm giá "quá khứ" sinh sẵn khi tạo ván, để biểu đồ đầu tư
   * có đường giá sống động ngay từ năm đầu tiên.
   */
  soDiemGiaQuaKhu: 9,

  /** ---------- Lưu ván ---------- */
  luuKey: 'dong-tien-luu-v1-5',
} as const

export type Config = typeof CONFIG

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
   * Thắng khi đạt mục tiêu tài sản, thua khi hạnh phúc rơi dưới ngưỡng.
   * Sống trọn hành trình tới tuổi 100 là kết thúc "viên mãn" riêng.
   */
  mucTieuTaiSan: 10 * TY,

  /** ---------- Mốc tài sản trung gian ----------
   * Chạm mỗi mốc lần đầu được ghi nhận + thưởng hạnh phúc, để ván chơi
   * dài có cảm giác tiến bộ thay vì chỉ nhìn đích 10 tỷ xa vời.
   */
  mocTaiSan: [1 * TY, 2.5 * TY, 5 * TY],
  mocTaiSanHanhPhuc: 5,

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

  /** ---------- Cơ hội kinh doanh ---------- */
  soCoHoiMoiNam: 1,

  /** ---------- Biểu đồ giá ----------
   * Số điểm giá "quá khứ" sinh sẵn khi tạo ván, để biểu đồ đầu tư
   * có đường giá sống động ngay từ năm đầu tiên.
   */
  soDiemGiaQuaKhu: 9,

  /** ---------- Lưu ván ---------- */
  luuKey: 'dong-tien-luu-v1-2',
} as const

export type Config = typeof CONFIG

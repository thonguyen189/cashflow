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
   * Không giới hạn số năm: chỉ thắng khi đạt mục tiêu tài sản,
   * chỉ thua khi hạnh phúc rơi xuống dưới ngưỡng.
   */
  mucTieuTaiSan: 10 * TY,

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

  /** ---------- Ngân hàng ---------- */
  laiSuatVay: 0.12,
  kyHanVayToiDa: 5,
  /** tổng thanh toán nợ hàng năm không vượt quá tỉ lệ này của lương */
  tyLeThanhToanToiDa: 0.5,

  /** ---------- Bảo hiểm y tế ---------- */
  /** phí bảo hiểm mỗi năm = tỉ lệ này × lương hiện tại */
  baoHiemTyLeLuong: 0.02,

  /** ---------- Khát vọng ---------- */
  /** hạnh phúc bị trừ mỗi năm khi chưa đạt được khát vọng của nghề */
  phatKhatVongMoiNam: 5,

  /** ---------- Sự kiện ngẫu nhiên mỗi năm ---------- */
  suKien: {
    /** ốm đau: mất tiền + hạnh phúc nếu không có bảo hiểm */
    omDauXacSuat: 0.18,
    omDauChiPhiTyLeLuong: 0.35,
    omDauMatHanhPhuc: 10,

    /** sinh con: +hạnh phúc một lần, +% chi phí cố định vĩnh viễn */
    sinhConXacSuat: 0.08,
    sinhConNamSomNhat: 2,
    sinhConToiDa: 2,
    sinhConHanhPhuc: 30,
    sinhConTangChiPhi: 0.25,

    /** thưởng Tết: tiền thưởng cuối năm */
    thuongTetXacSuat: 0.25,
    thuongTetTyLeLuong: 0.15,
  },

  /** ---------- Cơ hội kinh doanh ---------- */
  soCoHoiMoiNam: 1,

  /** ---------- Biểu đồ giá ----------
   * Số điểm giá "quá khứ" sinh sẵn khi tạo ván, để biểu đồ đầu tư
   * có đường giá sống động ngay từ năm đầu tiên.
   */
  soDiemGiaQuaKhu: 9,

  /** ---------- Lưu ván ---------- */
  luuKey: 'dong-tien-luu-v1-1',
} as const

export type Config = typeof CONFIG

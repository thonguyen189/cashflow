/** Toàn bộ số tiền trong game tính bằng ĐỒNG (VNĐ), lưu dạng number nguyên. */
export type Tien = number

export type AssetId = 'traiPhieu' | 'coPhieu' | 'vang' | 'crypto' | 'batDongSan'

export type Phase =
  | 'chonNghe' // chọn nghề, chưa vào game
  | 'chiPhi' // phải thanh toán chi phí hàng năm
  | 'theBai' // đang duyệt chuỗi thẻ tiêu dùng
  | 'tuDo' // đã xong thẻ, tự do hành động tới khi kết thúc năm
  | 'tongKet' // màn tổng kết cuối năm
  | 'ketThuc' // thắng hoặc thua

export interface Nghe {
  id: string
  ten: string
  moTa: string
  emoji: string
  luong: Tien
  chiPhi: Tien
  /** id của món ước nguyện gắn với nghề này */
  khatVongId: string
}

export type XuatThanId = 'thuanNong' | 'vienChuc' | 'buonBan' | 'khaGia'

/**
 * Hoàn cảnh gia đình lúc vào đời. Quyết định VỐN ban đầu và một GÁNH NẶNG đi
 * theo suốt ván. Đánh đổi cố ý chạy đều một chiều: vốn càng nhiều thì chi phí
 * sống càng cao, mà `nghiaVuHangNam` lấy chi phí sinh hoạt làm thành phần chính
 * nên cái đích tự do tài chính cũng lùi xa theo.
 */
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

/** Thiết lập nhân vật chọn ở màn mở đầu, ngoài nghề nghiệp. */
export interface ThietLapNhanVat {
  xuatThanId: XuatThanId
  /** hệ số nhân với lương gốc của nghề */
  heSoLuongKhoiDiem: number
}

/** Thẻ chỉ xuất hiện ở giai đoạn đời tương ứng; không có = mọi giai đoạn. */
export type GiaiDoanThe = 'giaDinh' | 'conCai' | 'tuoiGia'

export interface TheTieuDung {
  id: string
  ten: string
  emoji: string
  /** giá gốc năm 1; giá thực tế = gia * priceIndex */
  gia: Tien
  /** nhận thì +diem hạnh phúc, từ chối thì -diem */
  diem: number
  giaiDoan?: GiaiDoanThe
  /** thẻ chỉ còn hợp lý tới tuổi này (ví dụ chạy marathon, đổi điện thoại) */
  tuoiToiDa?: number
}

export interface KhoaHoc {
  id: string
  ten: string
  gia: Tien
  tangLuongMin: number // 0.06 = 6%
  tangLuongMax: number
}

export interface MonUocNguyen {
  id: string
  ten: string
  emoji: string
  gia: Tien
  /** hạnh phúc cộng thêm mỗi năm sau khi mua */
  hanhPhucMoiNam: number
}

export interface TaiSan {
  id: AssetId
  ten: string
  emoji: string
  moTa: string
  /** giá một đơn vị ở năm 1 */
  giaDonVi: Tien
  donViTen: string
  /** biên độ biến động giá mỗi năm */
  bienDongMin: number
  bienDongMax: number
  /** tỉ suất cổ tức / tiền thuê / lãi hàng năm */
  loiTucMin: number
  loiTucMax: number
  /** true nếu giá bám theo lạm phát (vàng, bất động sản) */
  bamLamPhat: boolean
}

export type CoHoiLoai = 'kinhDoanh' | 'canhBac' | 'toChucSuKien'

/** Ba loại bảo hiểm xe, đúng như ngoài đời. */
export type LoaiBaoHiemXe = 'trachNhiemDanSu' | 'vatChatXe' | 'taiNanNguoiTrenXe'

export interface CoHoi {
  id: string
  ten: string
  moTa: string
  emoji: string
  loai: CoHoiLoai
  gia: Tien
  /** chỉ nghề này mới gặp; bỏ trống nghĩa là mọi nghề đều gặp */
  ngheId?: string
  /** chỉ xuất hiện từ năm này trở đi — thể hiện yêu cầu thâm niên */
  namToiThieu?: number
  /** cả ván chỉ tham gia được một lần */
  chiMotLan?: boolean

  /** kinhDoanh: thu nhập nền mỗi năm, trước khi áp biến động */
  thuNhapMoiNam?: Tien
  /** kinhDoanh: biên độ dao động thu nhập mỗi năm, không xuống dưới −100% */
  bienDongThuNhapMin?: number
  bienDongThuNhapMax?: number

  /** canhBac: xác suất thắng và hệ số nhân khi thắng */
  xacSuatThang?: number
  heSoNhan?: number

  /** toChucSuKien: biên lợi nhuận trên vốn, mở kết quả cuối năm rồi kết thúc */
  loiNhuanMin?: number
  loiNhuanMax?: number
}

export interface KhoanVay {
  id: string
  goc: Tien
  kyHan: number
  thanhToanMoiNam: Tien
  namConLai: number
}

export interface DoanhNghiep {
  coHoiId: string
  ten: string
  /** thu nhập nền tại thời điểm góp vốn, đã tính lạm phát của năm đó */
  thuNhapNen: Tien
  /** chỉ số giá của năm góp vốn, để thu nhập bám theo lạm phát về sau */
  chiSoGiaLucMua: number
}

export type SuKienLoai =
  | 'lamPhat'
  | 'omDau'
  | 'sinhCon'
  | 'thuongTet'
  | 'canhBacKetQua'
  | 'ketHon'
  | 'conVaoDaiHoc'
  | 'conTuLap'
  | 'lenChucOngBa'
  | 'tuoiGia'
  | 'nghiHuu'
  | 'mungTho'
  | 'thangChuc'
  | 'suCo'
  | 'banTaiSan'
  | 'mocTaiSan'
  | 'vaChamGiaoThong'
  | 'xeHongNang'
  | 'matTromXe'
  | 'phatThieuBaoHiemXe'
  | 'kietSuc'
  | 'triLieu'
  | 'suKienKetQua'

export interface SuKien {
  loai: SuKienLoai
  tieuDe: string
  moTa: string
  tienThayDoi: Tien
  hanhPhucThayDoi: number
}

export interface DongLichSu {
  nam: number
  luong: Tien
  chiPhi: Tien
  tienMat: Tien
  giaTriDauTu: Tien
  tongTaiSan: Tien
  hanhPhuc: number
  lamPhat: number
}

export interface TongKetNam {
  nam: number
  luong: Tien
  tangLuong: number
  thuNhapThuDong: Tien
  /** đóng góp của bạn đời trong năm (0 nếu chưa lập gia đình) */
  thuNhapBanDoi: Tien
  /** biến động của cả năm kênh; cờ dangNamGiu tách "danh mục của bạn" khỏi "tin thị trường" */
  bienDongTaiSan: {
    id: AssetId
    ten: string
    bienDong: number
    loiTuc: Tien
    dangNamGiu: boolean
  }[]
  /** thu nhập thực nhận từ từng doanh nghiệp trong năm */
  thuNhapDoanhNghiep: {
    coHoiId: string
    ten: string
    soTien: Tien
    bienDong: number
  }[]
  phatKhatVong: number
  hanhPhucTuUocNguyen: number
  /** hạnh phúc cộng trừ mỗi năm do bậc lương đã chọn (âm khi lương cao) */
  apLucCongViec: number
  suKien: SuKien[]
  lamPhat: number
  tongTaiSan: Tien
}

export interface GameState {
  seed: number
  rngCursor: number
  nam: number
  phase: Phase
  ngheId: string
  khatVongId: string

  /** ---------- Thiết lập nhân vật (v1.6) ---------- */
  xuatThanId: XuatThanId
  /** hệ số nhân với lương gốc của nghề, chọn ở màn mở đầu */
  heSoLuongKhoiDiem: number

  tienMat: Tien
  hanhPhuc: number
  luong: Tien
  chiPhiHangNam: Tien
  /** hệ số giá tích luỹ do lạm phát, khởi điểm 1 */
  chiSoGia: number
  /** hệ số chi phí cố định do sự kiện đời sống (sinh con), khởi điểm 1 */
  heSoChiPhi: number
  daTraChiPhiNamNay: boolean

  soHuu: Record<AssetId, number>
  giaTaiSan: Record<AssetId, Tien>
  lichSuGia: Record<AssetId, Tien[]>

  khoaHocDaMua: string[]
  uocNguyenDaMua: string[]
  /**
   * id các món ước nguyện đã từng MẤT (xe bị trộm khi không có bảo hiểm vật chất).
   * Giá đóng băng thời trẻ chỉ áp cho lần mua đầu tiên; muốn có lại món đã mất thì
   * phải trả bằng tiền của hôm nay.
   */
  uocNguyenDaMat: string[]
  /** năm cuối cùng bảo hiểm còn hiệu lực; -1 nghĩa là chưa từng mua */
  baoHiemDenNam: number
  /** năm cuối cùng từng loại bảo hiểm xe còn hiệu lực; -1 nghĩa là chưa từng mua */
  baoHiemXe: Record<LoaiBaoHiemXe, number>

  /** ---------- Chuyên gia đồng hành ---------- */
  /** năm cuối cùng liệu trình tâm lý còn hiệu lực; -1 nghĩa là chưa từng trị liệu */
  triLieuDenNam: number
  /** số liệu trình đã mua, dùng để làm nhạt dần hiệu quả các lần sau */
  soLanTriLieu: number
  /** đã kể chuyện kiệt sức cho lần rơi này chưa */
  daCanhBaoKietSuc: boolean
  /**
   * Đã thuê chuyên gia hoạch định tài chính chưa — cả ván chỉ được một lần.
   *
   * Phải là cờ riêng chứ không suy ra từ `heSoToiUuChiPhi < 1`: suy ngược như vậy
   * thì giới hạn "một lần" chỉ còn hiệu lực khi `giamChiPhi` nằm hẳn trong khoảng
   * (0, 1), mà đặt `giamChiPhi: 0` để tắt gói khi đo cân bằng là việc hoàn toàn
   * hợp lệ với `config.ts`. Đây cũng là khuôn chung của mọi món mua một lần khác:
   * `baoHiemDenNam`, `uocNguyenDaMua`, `triLieuDenNam`.
   */
  daThueChuyenGiaTaiChinh: boolean
  /** hệ số chi phí sau khi tối ưu chi tiêu cùng chuyên gia, khởi điểm 1 */
  heSoToiUuChiPhi: number

  khoanVay: KhoanVay[]
  doanhNghiep: DoanhNghiep[]
  /** id các cơ hội "chỉ một lần" đã tham gia, để không mời lại */
  coHoiDaLam: string[]
  /** các khoản chờ mở kết quả cuối năm — canh bạc và tổ chức sự kiện */
  khoanDangCho: { coHoiId: string; gia: Tien; loai: CoHoiLoai }[]

  /** ---------- Cốt truyện trăm năm ---------- */
  /** lịch cột mốc đời người, hẹn sẵn khi tạo ván (tất định theo seed) */
  cotTruyen: { namCuoi: number; namSinhCon: number[] }
  daKetHon: boolean
  /** năm sinh (theo năm trong game) của từng người con */
  conCai: number[]
  daNghiHuu: boolean
  /** đã từng đạt tự do tài chính — dùng cho chế độ chơi tiếp sau khi thắng */
  daTuDo: boolean
  /**
   * Chỉ số (0, 1, 2…) của các cột mốc tài sản đã ghi nhận. Lưu chỉ số chứ
   * không lưu số tiền, vì giá trị mỗi mốc leo theo chỉ số giá từng năm.
   */
  mocTaiSanDaQua: number[]
  /** id các thẻ đã rút năm nay — năm sau không rút lại để tránh lặp */
  theNamTruoc: string[]

  theConLai: TheTieuDung[]
  coHoiNamNay: CoHoi[]

  tongKet: TongKetNam | null
  lichSu: DongLichSu[]

  trangThai: 'dangChoi' | 'thang' | 'thua' | 'vienMan'
  lyDoKetThuc?: string
}

export type Action =
  | {
      type: 'chonNghe'
      ngheId: string
      seed?: number
      /** thiếu thì dùng THIET_LAP_MAC_DINH — giữ nguyên ý nghĩa mọi lời gọi cũ */
      thietLap?: ThietLapNhanVat
    }
  | { type: 'traChiPhi' }
  | { type: 'quyetDinhThe'; nhan: boolean }
  | { type: 'muaKhoaHoc'; khoaHocId: string }
  | { type: 'muaBaoHiem' }
  | { type: 'muaBaoHiemXe'; loai: LoaiBaoHiemXe }
  | { type: 'thueChuyenGiaTamLy' }
  | { type: 'thueChuyenGiaTaiChinh' }
  | { type: 'muaUocNguyen'; uocNguyenId: string }
  | { type: 'dauTu'; assetId: AssetId; soDonVi: number }
  | { type: 'ban'; assetId: AssetId; soDonVi: number }
  | { type: 'vay'; goc: Tien; kyHan: number }
  | { type: 'quyetDinhCoHoi'; coHoiId: string; nhan: boolean }
  | { type: 'ketThucNam' }
  | { type: 'dongTongKet' }
  /** thắng rồi vẫn tiếp tục sống trọn hành trình tới tuổi 100 */
  | { type: 'choiTiepSauThang' }
  | { type: 'choiLai' }

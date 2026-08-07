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

export type CoHoiLoai = 'kinhDoanh' | 'canhBac'

export interface CoHoi {
  id: string
  ten: string
  moTa: string
  emoji: string
  loai: CoHoiLoai
  gia: Tien
  /** kinhDoanh: thu nhập thụ động mỗi năm */
  thuNhapMoiNam?: Tien
  /** canhBac: xác suất thắng và hệ số nhân khi thắng */
  xacSuatThang?: number
  heSoNhan?: number
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
  thuNhapMoiNam: Tien
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
  loiTucTaiSan: { id: AssetId; ten: string; bienDong: number; loiTuc: Tien }[]
  phatKhatVong: number
  hanhPhucTuUocNguyen: number
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
  /** năm cuối cùng bảo hiểm còn hiệu lực; -1 nghĩa là chưa từng mua */
  baoHiemDenNam: number

  khoanVay: KhoanVay[]
  doanhNghiep: DoanhNghiep[]
  /** các ván cược đã đặt, sẽ mở kết quả ở cuối năm */
  canhBacDangCho: { coHoiId: string; gia: Tien }[]

  /** ---------- Cốt truyện trăm năm ---------- */
  /** lịch cột mốc đời người, hẹn sẵn khi tạo ván (tất định theo seed) */
  cotTruyen: { namCuoi: number; namSinhCon: number[] }
  daKetHon: boolean
  /** năm sinh (theo năm trong game) của từng người con */
  conCai: number[]
  daNghiHuu: boolean
  /** đã từng chạm mục tiêu tài sản — dùng cho chế độ chơi tiếp sau khi thắng */
  daDatMucTieu: boolean
  /** các mốc tài sản trung gian đã ghi nhận */
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
  | { type: 'chonNghe'; ngheId: string; seed?: number }
  | { type: 'traChiPhi' }
  | { type: 'quyetDinhThe'; nhan: boolean }
  | { type: 'muaKhoaHoc'; khoaHocId: string }
  | { type: 'muaBaoHiem' }
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

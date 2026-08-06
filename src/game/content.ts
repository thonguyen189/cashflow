import { TRIEU, TY } from './config'
import type { CoHoi, KhoaHoc, MonUocNguyen, Nghe, TaiSan, TheTieuDung } from './types'

/**
 * Nội dung game — bối cảnh Việt Nam, đơn vị VNĐ.
 * Toàn bộ văn bản và số liệu ở đây là nguyên bản, không lấy từ app nào khác.
 */

/** ---------------- Nghề nghiệp ----------------
 * Đánh đổi cố ý: lương càng cao thì thặng dư tuyệt đối càng lớn
 * nhưng TỈ LỆ giữ lại càng thấp, và khát vọng cũng đắt hơn.
 */
export const NGHE: Nghe[] = [
  {
    id: 'giaoVien',
    ten: 'Giáo viên',
    moTa: 'Thu nhập khiêm tốn nhưng chi tiêu gọn. Giữ lại được 40% lương mỗi năm.',
    emoji: '📚',
    luong: 180 * TRIEU,
    chiPhi: 108 * TRIEU,
    khatVongId: 'xeMay',
  },
  {
    id: 'bacSi',
    ten: 'Bác sĩ',
    moTa: 'Lương gấp đôi giáo viên, nhưng chi phí sinh hoạt cũng leo theo. Giữ lại 33%.',
    emoji: '🩺',
    luong: 360 * TRIEU,
    chiPhi: 240 * TRIEU,
    khatVongId: 'oTo',
  },
  {
    id: 'kySuPhanMem',
    ten: 'Kỹ sư phần mềm',
    moTa: 'Lương cao nhất, nhưng lối sống đắt đỏ nhất. Chỉ giữ lại 27% lương.',
    emoji: '💻',
    luong: 600 * TRIEU,
    chiPhi: 435 * TRIEU,
    khatVongId: 'canHo',
  },
]

/** ---------------- Món ước nguyện ----------------
 * Mua rồi thì mỗi năm được cộng hạnh phúc. Món gắn với nghề
 * còn gỡ luôn khoản phạt khát vọng.
 */
export const UOC_NGUYEN: MonUocNguyen[] = [
  { id: 'xeMay', ten: 'Xe máy tay ga', emoji: '🛵', gia: 80 * TRIEU, hanhPhucMoiNam: 5 },
  { id: 'oTo', ten: 'Ô tô riêng', emoji: '🚗', gia: 800 * TRIEU, hanhPhucMoiNam: 10 },
  { id: 'canHo', ten: 'Căn hộ riêng', emoji: '🏠', gia: 2.5 * TY, hanhPhucMoiNam: 15 },
]

/** ---------------- Giáo dục ---------------- */
export const KHOA_HOC: KhoaHoc[] = [
  {
    id: 'online',
    ten: 'Khoá học online',
    gia: 15 * TRIEU,
    tangLuongMin: 0.06,
    tangLuongMax: 0.12,
  },
  {
    id: 'chungChi',
    ten: 'Chứng chỉ chuyên môn quốc tế',
    gia: 45 * TRIEU,
    tangLuongMin: 0.13,
    tangLuongMax: 0.18,
  },
  {
    id: 'thacSi',
    ten: 'Bằng thạc sĩ',
    gia: 130 * TRIEU,
    tangLuongMin: 0.19,
    tangLuongMax: 0.27,
  },
  {
    id: 'tuNghiep',
    ten: 'Tu nghiệp nước ngoài',
    gia: 320 * TRIEU,
    tangLuongMin: 0.25,
    tangLuongMax: 0.33,
  },
  {
    id: 'mba',
    ten: 'MBA',
    gia: 700 * TRIEU,
    tangLuongMin: 0.3,
    tangLuongMax: 0.45,
  },
]

/** ---------------- Tài sản đầu tư ----------------
 * Giá một đơn vị chênh nhau rất lớn → các hạng tự mở khoá dần
 * theo độ giàu, không cần hệ thống level riêng.
 */
export const TAI_SAN: TaiSan[] = [
  {
    id: 'traiPhieu',
    ten: 'Trái phiếu & tiền gửi',
    emoji: '🏦',
    moTa: 'An toàn nhất. Lãi đều đặn, giá gần như không đổi. Nơi giữ tiền chờ cơ hội.',
    giaDonVi: 1 * TRIEU,
    donViTen: 'phần',
    bienDongMin: -0.01,
    bienDongMax: 0.01,
    loiTucMin: 0.05,
    loiTucMax: 0.07,
    bamLamPhat: false,
  },
  {
    id: 'coPhieu',
    ten: 'Cổ phiếu',
    emoji: '📈',
    moTa: 'Biến động mạnh cả hai chiều, có cổ tức. Vào được ngay từ năm đầu.',
    giaDonVi: 50_000,
    donViTen: 'cổ phiếu',
    bienDongMin: -0.25,
    bienDongMax: 0.35,
    loiTucMin: 0,
    loiTucMax: 0.06,
    bamLamPhat: false,
  },
  {
    id: 'vang',
    ten: 'Vàng',
    emoji: '🪙',
    moTa: 'Giữ giá theo lạm phát, không sinh lãi. Chỗ trú ẩn khi thị trường xấu.',
    giaDonVi: 8.5 * TRIEU,
    donViTen: 'chỉ',
    bienDongMin: -0.12,
    bienDongMax: 0.2,
    loiTucMin: 0,
    loiTucMax: 0,
    bamLamPhat: true,
  },
  {
    id: 'crypto',
    ten: 'Tiền mã hoá',
    emoji: '⚡',
    moTa: 'Có thể nhân nhiều lần hoặc bốc hơi. Chỉ nên chơi bằng tiền nhàn rỗi.',
    giaDonVi: 250 * TRIEU,
    donViTen: 'đơn vị',
    bienDongMin: -0.6,
    bienDongMax: 1.5,
    loiTucMin: 0,
    loiTucMax: 0,
    bamLamPhat: false,
  },
  {
    id: 'batDongSan',
    ten: 'Bất động sản',
    emoji: '🏢',
    moTa: 'Vốn lớn, tăng giá đều và có tiền thuê hàng năm. Mở khoá khi đã đủ giàu.',
    giaDonVi: 2 * TY,
    donViTen: 'căn',
    bienDongMin: -0.05,
    bienDongMax: 0.15,
    loiTucMin: 0.04,
    loiTucMax: 0.07,
    bamLamPhat: true,
  },
]

/** ---------------- Thẻ tiêu dùng ----------------
 * Nhận thì +điểm hạnh phúc và mất tiền; TỪ CHỐI thì -điểm.
 * Tỉ lệ đồng/điểm chênh nhau tới 45 lần → mỗi thẻ là một quyết định thật.
 */
export const THE_TIEU_DUNG: TheTieuDung[] = [
  { id: 't01', ten: 'Cà phê cuối tuần với bạn cũ', gia: 500_000, diem: 3 },
  { id: 't02', ten: 'Về quê thăm bố mẹ', gia: 1.5 * TRIEU, diem: 8 },
  { id: 't03', ten: 'Chạy giải marathon thành phố', gia: 800_000, diem: 4 },
  { id: 't04', ten: 'Vé xem bóng đá V-League', gia: 600_000, diem: 2 },
  { id: 't05', ten: 'Lớp học nhảy buổi tối', gia: 3 * TRIEU, diem: 6 },
  { id: 't06', ten: 'Đi Đà Lạt ba ngày hai đêm', gia: 6 * TRIEU, diem: 12 },
  { id: 't07', ten: 'Thẻ tập gym cả năm', gia: 9 * TRIEU, diem: 15 },
  { id: 't08', ten: 'Bữa hải sản với gia đình', gia: 2 * TRIEU, diem: 3 },
  { id: 't09', ten: 'Tai nghe chống ồn', gia: 5 * TRIEU, diem: 6 },
  { id: 't10', ten: 'Nghỉ dưỡng Phú Quốc năm ngày', gia: 18 * TRIEU, diem: 20 },
  { id: 't11', ten: 'Khoá học guitar', gia: 4 * TRIEU, diem: 4 },
  { id: 't12', ten: 'Máy ảnh cũ chụp đường phố', gia: 12 * TRIEU, diem: 10 },
  { id: 't13', ten: 'Đổi điện thoại đời mới', gia: 20 * TRIEU, diem: 12 },
  { id: 't14', ten: 'Tiệc sinh nhật ở nhà hàng', gia: 15 * TRIEU, diem: 8 },
  { id: 't15', ten: 'Xe đạp thể thao', gia: 25 * TRIEU, diem: 12 },
  { id: 't16', ten: 'Ngắm hoa anh đào ở Nhật', gia: 60 * TRIEU, diem: 25 },
  { id: 't17', ten: 'Thuê thợ chụp ảnh gia đình', gia: 8 * TRIEU, diem: 3 },
  { id: 't18', ten: 'Đồng hồ hàng hiệu', gia: 45 * TRIEU, diem: 10 },
  { id: 't19', ten: 'Dàn karaoke tại nhà', gia: 35 * TRIEU, diem: 6 },
  { id: 't20', ten: 'Drone quay phim', gia: 30 * TRIEU, diem: 4 },
]

/** ---------------- Cơ hội kinh doanh ---------------- */
export const CO_HOI: CoHoi[] = [
  {
    id: 'choThueXe',
    ten: 'Đội xe máy cho thuê',
    moTa: 'Mua vài chiếc xe cho khách du lịch thuê. Thu nhập đều, ít rủi ro.',
    emoji: '🛵',
    loai: 'kinhDoanh',
    gia: 200 * TRIEU,
    thuNhapMoiNam: 40 * TRIEU,
  },
  {
    id: 'quanCaPhe',
    ten: 'Mở quán cà phê nhỏ',
    moTa: 'Một mặt bằng trong hẻm, tự vận hành. Lời khá nếu chịu khó.',
    emoji: '☕',
    loai: 'kinhDoanh',
    gia: 400 * TRIEU,
    thuNhapMoiNam: 90 * TRIEU,
  },
  {
    id: 'gopVonCuaHang',
    ten: 'Góp vốn cửa hàng của bạn',
    moTa: 'Bạn thân mở chuỗi cửa hàng, mời góp vốn ăn chia theo năm.',
    emoji: '🏪',
    loai: 'kinhDoanh',
    gia: 800 * TRIEU,
    thuNhapMoiNam: 150 * TRIEU,
  },
  {
    id: 'xuongMay',
    ten: 'Góp vốn xưởng may gia công',
    moTa: 'Vốn lớn, đơn hàng xuất khẩu ổn định. Dành cho giai đoạn đã có tích luỹ.',
    emoji: '🧵',
    loai: 'kinhDoanh',
    gia: 1.5 * TY,
    thuNhapMoiNam: 300 * TRIEU,
  },
  {
    id: 'boSuuTapNft',
    ten: 'Bộ sưu tập NFT',
    moTa: 'Có thể nhân năm lần, cũng có thể thành giấy vụn ngay trong năm nay.',
    emoji: '🖼️',
    loai: 'canhBac',
    gia: 150 * TRIEU,
    xacSuatThang: 0.25,
    heSoNhan: 5,
  },
  {
    id: 'coinMoi',
    ten: 'Đầu cơ coin mới lên sàn',
    moTa: 'Xác suất thắng thấp nhưng nếu trúng thì nhân tám lần vốn.',
    emoji: '🎲',
    loai: 'canhBac',
    gia: 100 * TRIEU,
    xacSuatThang: 0.2,
    heSoNhan: 8,
  },
]

export const timNghe = (id: string) => NGHE.find((n) => n.id === id)
export const timUocNguyen = (id: string) => UOC_NGUYEN.find((u) => u.id === id)
export const timKhoaHoc = (id: string) => KHOA_HOC.find((k) => k.id === id)
export const timTaiSan = (id: string) => TAI_SAN.find((t) => t.id === id)
export const timCoHoi = (id: string) => CO_HOI.find((c) => c.id === id)

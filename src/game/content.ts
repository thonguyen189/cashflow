import { TRIEU, TY } from './config'
import type {
  BienCoId,
  CoHoi,
  KhoaHoc,
  MonUocNguyen,
  Nghe,
  TaiSan,
  TheTieuDung,
  XuatThan,
} from './types'

/**
 * Nội dung game — bối cảnh Việt Nam, đơn vị VNĐ.
 * Toàn bộ văn bản và số liệu ở đây là nguyên bản, không lấy từ app nào khác.
 */

/** ---------- Thang tiền, đặt lại ở v1.7 ----------
 * Bản v1.6 cho giáo viên 15tr/tháng, bác sĩ 30tr, kỹ sư phần mềm 50tr — cao gấp
 * 2,1 tới 4,3 lần thực tế người mới ra trường năm 2026 (giáo viên hạng III bậc 1
 * hệ số 2,34 × lương cơ sở 2,34tr cộng phụ cấp ưu đãi ≈ 7,1–7,4tr; bác sĩ xếp
 * bậc 2 từ 1/1/2026 thực nhận 8–15tr; lập trình viên fresher 8–15tr).
 *
 * Quan trọng hơn con số tuyệt đối là TỈ LỆ TIẾT KIỆM: v1.6 phát cho người 21
 * tuổi 27–40% thặng dư ngay năm đầu, trong khi ngoài đời con số đó gần bằng 0.
 * Đó là nguyên nhân sâu xa nhất của việc mọi nghề đều tự do tài chính trước 40.
 *
 * Cả ba nghề nay tiết kiệm 15% như nhau — CỐ Ý. Điểm phân biệt ba nghề chuyển
 * từ mức lương khởi điểm sang HÌNH DẠNG ĐƯỜNG SỰ NGHIỆP (`duongCongSuNghiep`,
 * Task 3 của v1.7). Ngoài đời cũng vậy: sinh viên mới ra trường của ba ngành
 * này sống na ná nhau, cái khác nhau là mười lăm năm sau.
 *
 * 15% không phải con số thực tế (thực tế gần 0%) mà là mức tối thiểu để ván
 * chơi tồn tại: 0% thặng dư nghĩa là không bao giờ tích luỹ được gì và game
 * không có nước đi nào. Đây là nhượng bộ có ý thức của mô phỏng trước hiện
 * thực, ghi lại ở đây để bản sau không ai tưởng là sơ suất.
 *
 * Giá cơ hội, giá tài sản và giá ước nguyện GIỮ NGUYÊN số tuyệt đối. Lương
 * giảm 2–4 lần trong khi giá đứng yên chính là đòn bẩy độ khó mạnh nhất của cả
 * bản v1.7 — và nó miễn phí, vì chỉ là sửa cho đúng đời thật.
 */
export const NGHE: Nghe[] = [
  {
    id: 'giaoVien',
    ten: 'Giáo viên',
    moTa: 'Thu nhập khiêm tốn, chi tiêu cũng gọn theo. Giữ lại được 15,6% lương mỗi năm.',
    emoji: '📚',
    luong: 90 * TRIEU,
    chiPhi: 76 * TRIEU,
    khatVongId: 'xeMay',
    // giaoVien — lên bậc ba năm một lần, hệ số 2,34 → 4,98 sau hai mươi bốn năm.
    // Chậm, đều, không bao giờ bứt phá, nhưng cũng không bao giờ sụp.
    duongCongSuNghiep: [
      { denTuoi: 30, tangThuc: 0.035 },
      { denTuoi: 40, tangThuc: 0.03 },
      { denTuoi: 50, tangThuc: 0.025 },
      { denTuoi: 200, tangThuc: 0.02 },
    ],
  },
  {
    id: 'bacSi',
    ten: 'Bác sĩ',
    moTa: 'Lương cao hơn giáo viên 1,33 lần, nhưng chi phí sinh hoạt cũng leo theo. Giữ lại 15,0% lương mỗi năm.',
    emoji: '🩺',
    luong: 120 * TRIEU,
    chiPhi: 102 * TRIEU,
    khatVongId: 'oTo',
    // bacSi — ì ạch mười năm đầu (sáu năm trường y, mười tám tháng thực hành, bậc
    // thấp ở bệnh viện công), rồi bứt tốc mạnh nhất từ tuổi 35 khi có danh tiếng và
    // phòng khám riêng. Nghề thưởng cho sự kiên nhẫn.
    duongCongSuNghiep: [
      { denTuoi: 30, tangThuc: 0.05 },
      { denTuoi: 40, tangThuc: 0.09 },
      { denTuoi: 50, tangThuc: 0.05 },
      { denTuoi: 200, tangThuc: 0.02 },
    ],
  },
  {
    id: 'kySuPhanMem',
    ten: 'Kỹ sư phần mềm',
    moTa: 'Lương cao nhất trong ba nghề, nhưng lối sống cũng đắt đỏ nhất. Giữ lại 15,3% lương mỗi năm.',
    emoji: '💻',
    luong: 144 * TRIEU,
    chiPhi: 122 * TRIEU,
    khatVongId: 'canHo',
    // kySuPhanMem — tăng gấp gần ba lần trong chín năm đầu, đạt đỉnh quanh tuổi 50
    // rồi ĐI XUỐNG. Đào thải tuổi trong ngành công nghệ là chuyện thật, và nó biến
    // "chọn nghề lương cao" thành canh bạc về thời điểm: bạn có mười lăm năm vàng
    // để chuyển thu nhập thành tài sản, sau đó cửa hẹp dần.
    duongCongSuNghiep: [
      { denTuoi: 30, tangThuc: 0.12 },
      { denTuoi: 40, tangThuc: 0.05 },
      { denTuoi: 50, tangThuc: 0.01 },
      { denTuoi: 200, tangThuc: -0.01 },
    ],
  },
]

/** ---------- Vì sao vốn ban đầu nâng ở v1.7 ----------
 * Tỉ lệ chi phí/lương mới là ~0,85 (v1.6: 0,725 ở nghề khắt khe nhất). Với nhà
 * thuần nông, chi phí năm đầu ≈ 0,85 × 0,92 × 1,08 = 0,845 × lương, cộng khoản
 * trả nợ học phí ~0,06 × lương, cộng đệm cho sự kiện phát sinh sớm — nên sàn
 * thật là ~0,91 và 1,05 là mức có đệm.
 *
 * Tương phản giữa bốn xuất thân giữ gần nguyên vẹn (1 : 1,19 : 2,29 : 4,00 so
 * với 1 : 1,18 : 2,35 : 4,12 của v1.6) — vốn là thứ người chơi cảm nhận rõ nhất
 * nên phải giữ.
 */
export const XUAT_THAN: XuatThan[] = [
  {
    id: 'thuanNong',
    ten: 'Nhà thuần nông',
    emoji: '🌾',
    moTa: 'Bố mẹ làm ruộng, bán cả lứa lợn và vay mượn thêm họ hàng mới dồn được cho bạn một khoản nhỏ phòng thân. Đổi lại là khoản nợ học phí phải trả dần và trách nhiệm gửi tiền về quê đỡ đần bố mẹ mỗi tháng, nhưng thói quen tằn tiện thì bạn mang theo suốt đời.',
    tyLeVonBanDau: 1.05,
    tyLeNoBanDau: 0.4,
    heSoChiPhiSong: 0.92,
    hanhPhucBanDau: 5,
    tyLePhungDuong: 0.08,
    phungDuongDenTuoi: 55,
    boMeCoTichLuy: false,
  },
  {
    id: 'vienChuc',
    ten: 'Viên chức tỉnh lẻ',
    emoji: '🏘️',
    moTa: 'Bố mẹ là công chức nhà nước, đủ ăn đủ mặc. Cho bạn 1,25 lần lương năm đầu làm vốn rồi để bạn tự lo phần còn lại.',
    tyLeVonBanDau: 1.25,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: false,
  },
  {
    id: 'buonBan',
    ten: 'Buôn bán ngoài phố',
    emoji: '🏪',
    moTa: 'Nhà mặt phố có cửa hàng, bố mẹ dúi cho một khoản kha khá làm vốn. Đổi lại, bạn lớn lên với mức sống mà giờ khó lòng hạ xuống.',
    tyLeVonBanDau: 2.4,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1.1,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: true,
  },
  {
    id: 'khaGia',
    ten: 'Nhà có của ăn của để',
    emoji: '🏛️',
    moTa: 'Xuất phát trước người ta cả một quãng dài. Nhưng nếp sống sang trọng đi theo bạn suốt đời, và cái đích tự do vì thế cũng lùi xa hơn.',
    tyLeVonBanDau: 4.2,
    tyLeNoBanDau: 0,
    heSoChiPhiSong: 1.25,
    hanhPhucBanDau: 0,
    tyLePhungDuong: 0,
    phungDuongDenTuoi: 0,
    boMeCoTichLuy: true,
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

/**
 * Những món ước nguyện được coi là phương tiện — mua rồi thì mới có xe để bảo hiểm,
 * và mới gặp nhóm sự kiện giao thông. Xếp theo giá trị giảm dần: có cả hai thì mọi
 * tính toán bám theo chiếc đắt nhất, một hồ sơ bảo hiểm duy nhất.
 */
export const XE_UOC_NGUYEN_IDS = ['oTo', 'xeMay'] as const

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
    /** miễn nhiễm — đây là lý do tồn tại của nó */
    nhayChuKy: 0,
    /** lãi tiền gửi tiết kiệm cá nhân KHÔNG chịu thuế thu nhập cá nhân */
    thueLoiTuc: 0,
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
    /** nhạy hơn nền kinh tế, đúng như chỉ số chứng khoán */
    nhayChuKy: 1.4,
    /** cổ tức chịu thuế thu nhập cá nhân 5% */
    thueLoiTuc: 0.05,
  },
  {
    id: 'vang',
    ten: 'Vàng',
    emoji: '🥇',
    moTa: 'Giữ giá theo lạm phát, không sinh lãi. Chỗ trú ẩn khi thị trường xấu.',
    giaDonVi: 8.5 * TRIEU,
    donViTen: 'chỉ',
    bienDongMin: -0.12,
    bienDongMax: 0.2,
    loiTucMin: 0,
    loiTucMax: 0,
    bamLamPhat: true,
    /** NGHỊCH chu kỳ — càng hoảng loạn càng đắt */
    nhayChuKy: -0.5,
    // không sinh lợi tức nên con số này không bao giờ được dùng tới
    thueLoiTuc: 0,
  },
  {
    id: 'crypto',
    ten: 'Tiền mã hoá',
    emoji: '⚡',
    moTa: 'Có thể nhân nhiều lần hoặc bốc hơi. Chỉ nên chơi bằng tiền nhàn rỗi.',
    giaDonVi: 250 * TRIEU,
    donViTen: 'đơn vị',
    // Cân bằng v1.2: hạ biên độ 1.5 → 1.1 và −0.6 → −0.65 để trung bình nhân
    // của giá còn ≈ +10%/năm — vẫn là kênh sinh lời cao nhất nhưng không còn
    // trội tuyệt đối so với cổ phiếu hay bất động sản.
    bienDongMin: -0.65,
    bienDongMax: 1.1,
    loiTucMin: 0,
    loiTucMax: 0,
    bamLamPhat: false,
    /** khuếch đại mạnh nhất theo cả hai chiều */
    nhayChuKy: 2.0,
    // không sinh lợi tức nên con số này không bao giờ được dùng tới
    thueLoiTuc: 0,
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
    /** đi cùng nền kinh tế, thêm quán tính từ lạm phát */
    nhayChuKy: 1.0,
    /** cho thuê nhà chịu 10% (5% giá trị gia tăng + 5% thu nhập cá nhân) */
    thueLoiTuc: 0.1,
  },
]

/** ---------------- Thẻ tiêu dùng ----------------
 * Nhận thì +điểm hạnh phúc và mất tiền; TỪ CHỐI thì -điểm.
 * Tỉ lệ đồng/điểm chênh nhau tới 45 lần → mỗi thẻ là một quyết định thật.
 */
export const THE_TIEU_DUNG: TheTieuDung[] = [
  { id: 't01', ten: 'Cà phê cuối tuần với bạn cũ', emoji: '☕', gia: 500_000, diem: 3 },
  { id: 't02', ten: 'Về quê thăm bố mẹ', emoji: '🏡', gia: 1.5 * TRIEU, diem: 8, tuoiToiDa: 75 },
  {
    id: 't03',
    ten: 'Chạy giải marathon thành phố',
    emoji: '🏃',
    gia: 800_000,
    diem: 4,
    tuoiToiDa: 65,
  },
  { id: 't04', ten: 'Vé xem bóng đá V-League', emoji: '⚽', gia: 600_000, diem: 2 },
  { id: 't05', ten: 'Lớp học nhảy buổi tối', emoji: '💃', gia: 3 * TRIEU, diem: 6, tuoiToiDa: 70 },
  { id: 't06', ten: 'Đi Đà Lạt ba ngày hai đêm', emoji: '⛰️', gia: 6 * TRIEU, diem: 12 },
  { id: 't07', ten: 'Thẻ tập gym cả năm', emoji: '🏋️', gia: 9 * TRIEU, diem: 15 },
  { id: 't08', ten: 'Bữa hải sản với gia đình', emoji: '🦐', gia: 2 * TRIEU, diem: 3 },
  { id: 't09', ten: 'Tai nghe chống ồn', emoji: '🎧', gia: 5 * TRIEU, diem: 6 },
  { id: 't10', ten: 'Nghỉ dưỡng Phú Quốc năm ngày', emoji: '🏝️', gia: 18 * TRIEU, diem: 20 },
  { id: 't11', ten: 'Khoá học guitar', emoji: '🎸', gia: 4 * TRIEU, diem: 4 },
  { id: 't12', ten: 'Máy ảnh cũ chụp đường phố', emoji: '📷', gia: 12 * TRIEU, diem: 10 },
  { id: 't13', ten: 'Đổi điện thoại đời mới', emoji: '📱', gia: 20 * TRIEU, diem: 12 },
  { id: 't14', ten: 'Tiệc sinh nhật ở nhà hàng', emoji: '🎂', gia: 15 * TRIEU, diem: 8 },
  { id: 't15', ten: 'Xe đạp thể thao', emoji: '🚴', gia: 25 * TRIEU, diem: 12, tuoiToiDa: 70 },
  { id: 't16', ten: 'Ngắm hoa anh đào ở Nhật', emoji: '🌸', gia: 60 * TRIEU, diem: 25 },
  { id: 't17', ten: 'Thuê thợ chụp ảnh gia đình', emoji: '📸', gia: 8 * TRIEU, diem: 3 },
  { id: 't18', ten: 'Đồng hồ hàng hiệu', emoji: '⌚', gia: 45 * TRIEU, diem: 10 },
  { id: 't19', ten: 'Dàn karaoke tại nhà', emoji: '🎤', gia: 35 * TRIEU, diem: 6 },
  { id: 't20', ten: 'Drone quay phim', emoji: '🚁', gia: 30 * TRIEU, diem: 4, tuoiToiDa: 75 },

  /* --- Giai đoạn gia đình: chỉ xuất hiện khi đã kết hôn --- */
  { id: 't21', ten: 'Kỷ niệm ngày cưới ở nhà hàng', emoji: '💐', gia: 4 * TRIEU, diem: 8, giaiDoan: 'giaDinh' },
  { id: 't22', ten: 'Du lịch Nha Trang cùng bạn đời', emoji: '🏖️', gia: 12 * TRIEU, diem: 15, giaiDoan: 'giaDinh' },
  { id: 't23', ten: 'Sửa sang lại tổ ấm', emoji: '🔨', gia: 40 * TRIEU, diem: 14, giaiDoan: 'giaDinh' },
  { id: 't24', ten: 'Tặng bạn đời chiếc nhẫn vàng', emoji: '💍', gia: 25 * TRIEU, diem: 9, giaiDoan: 'giaDinh' },
  { id: 't25', ten: 'Bữa tối dưới ánh nến hâm nóng tình cảm', emoji: '🕯️', gia: 1.5 * TRIEU, diem: 4, giaiDoan: 'giaDinh' },
  { id: 't26', ten: 'Cả nhà về quê ngoại ăn Tết', emoji: '🏮', gia: 5 * TRIEU, diem: 10, giaiDoan: 'giaDinh' },

  /* --- Giai đoạn con cái: chỉ xuất hiện khi đang nuôi con nhỏ --- */
  { id: 't27', ten: 'Mua bộ đồ chơi xếp hình cho con', emoji: '🧸', gia: 1 * TRIEU, diem: 5, giaiDoan: 'conCai' },
  { id: 't28', ten: 'Lớp học thêm tiếng Anh cho con', emoji: '📖', gia: 8 * TRIEU, diem: 10, giaiDoan: 'conCai' },
  { id: 't29', ten: 'Tiệc sinh nhật cho con ở nhà', emoji: '🎈', gia: 3 * TRIEU, diem: 8, giaiDoan: 'conCai' },
  { id: 't30', ten: 'Đưa con đi công viên nước cả ngày', emoji: '🎢', gia: 2.5 * TRIEU, diem: 6, giaiDoan: 'conCai' },
  { id: 't31', ten: 'Chiếc xe đạp đầu tiên cho con', emoji: '🚲', gia: 4 * TRIEU, diem: 7, giaiDoan: 'conCai' },
  { id: 't32', ten: 'Du lịch Đà Nẵng cùng các con', emoji: '✈️', gia: 20 * TRIEU, diem: 18, giaiDoan: 'conCai' },
  { id: 't33', ten: 'Sắm góc học tập mới cho con', emoji: '📚', gia: 15 * TRIEU, diem: 6, giaiDoan: 'conCai' },

  /* --- Giai đoạn tuổi già: chỉ xuất hiện từ tuổi 60 --- */
  { id: 't34', ten: 'Khám sức khoẻ tổng quát đầu năm', emoji: '🏥', gia: 10 * TRIEU, diem: 12, giaiDoan: 'tuoiGia' },
  { id: 't35', ten: 'Câu lạc bộ dưỡng sinh buổi sáng', emoji: '🌳', gia: 2 * TRIEU, diem: 8, giaiDoan: 'tuoiGia' },
  { id: 't36', ten: 'Chuyến du lịch chậm miền Tây sông nước', emoji: '⛵', gia: 15 * TRIEU, diem: 14, giaiDoan: 'tuoiGia' },
  { id: 't37', ten: 'Làm vườn trồng rau sau nhà', emoji: '🌱', gia: 3 * TRIEU, diem: 9, giaiDoan: 'tuoiGia' },
  { id: 't38', ten: 'Họp lớp bạn cũ sau mấy chục năm', emoji: '🍵', gia: 1.2 * TRIEU, diem: 7, giaiDoan: 'tuoiGia' },
  { id: 't39', ten: 'Ghế massage cho tấm lưng đã mỏi', emoji: '💆', gia: 30 * TRIEU, diem: 10, giaiDoan: 'tuoiGia' },
]

/** ---------------- Cơ hội ----------------
 * Ba loại:
 *  - kinhDoanh: góp vốn một lần, thu nhập mỗi năm về sau. Thu nhập KHÔNG cố định:
 *    mỗi năm dao động trong biên độ riêng của ngành, và bám theo lạm phát kể từ
 *    năm góp vốn nên vài chục năm sau vẫn còn giá trị thật.
 *  - canhBac: mất trắng hoặc nhân nhiều lần, mở kết quả cuối năm. Kỳ vọng âm nhẹ.
 *  - toChucSuKien: bỏ vốn ra, cuối năm nhận lại vốn cộng lợi nhuận đúng một lần
 *    rồi kết thúc. Là công sức chứ không phải may rủi nên kỳ vọng dương khoảng
 *    +20%, và năm tệ nhất cũng chỉ lỗ một phần vốn chứ không mất trắng.
 *
 * `ngheId` để trống nghĩa là mọi nghề đều gặp. Các cơ hội gắn nghề đều có
 * `namToiThieu` vì chúng đòi thâm niên mới mở được.
 *
 * ---------- Dải sinh lời, hạ ở v1.7 ----------
 * Dải 18,75–22,5% của v1.6 xa thực tế: "dãy nhà trọ cho công nhân" 1 tỷ thu
 * 195tr mỗi năm là 19,5%, trong khi nhà trọ ngoài đời tính cả tiền đất chỉ sinh
 * lời 6–9%. Quán cà phê nhỏ thì đa số hoà vốn hoặc lỗ.
 *
 * Dải mới là 12–18%, và CỐ Ý PHÂN TÁN THEO RỦI RO thay vì gom vào một dải hẹp:
 * nhà trọ 12% nhưng biến động chỉ ±10%, quán cà phê 18% nhưng có năm mất 35%.
 * Có vậy người chơi mới có quyết định thật giữa chắc chắn và béo bở — v1.6 gom
 * hết vào một dải nên chọn cơ hội nào cũng như nhau.
 *
 * Sau thuế thu nhập doanh nghiệp 20% (v1.7), dải thực nhận còn 9,6–14,4%. So
 * với bất động sản 4,95% sau thuế, doanh nghiệp vẫn là con đường nhanh nhất
 * tới tự do tài chính — nhưng hệ số không còn 3,6 lần mà xuống ~2,6 lần.
 *
 * Ba bậc nhỏ nhất — bán hàng online, một chiếc xe máy, góp vốn quán ăn — được
 * thêm ở v1.7 vì cơ hội rẻ nhất trước đó là 200tr: giáo viên tiết kiệm 14tr một
 * năm sẽ mất mười bốn năm mới với tới suất đầu tiên, quá lâu để có quyết định
 * nào trong những năm đầu ván chơi.
 */
export const CO_HOI: CoHoi[] = [
  /* ---------- Chung: kinh doanh ---------- */
  {
    id: 'banHangOnline',
    ten: 'Bán hàng online tại nhà',
    moTa: 'Nhập ít hàng về bán trên mạng, tự đóng gói tự gửi. Vốn nhỏ, lời mỏng, nhưng là bước đầu tiên.',
    emoji: '📦',
    loai: 'kinhDoanh',
    gia: 25 * TRIEU,
    thuNhapMoiNam: 4.5 * TRIEU,
    bienDongThuNhapMin: -0.4,
    bienDongThuNhapMax: 0.45,
  },
  {
    id: 'motXeMayChoThue',
    ten: 'Một chiếc xe máy cho thuê',
    moTa: 'Mua một chiếc xe cũ cho khách du lịch thuê theo ngày. Nhỏ thôi, nhưng tiền về đều.',
    emoji: '🛵',
    loai: 'kinhDoanh',
    gia: 60 * TRIEU,
    thuNhapMoiNam: 9 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'gopVonQuanAn',
    ten: 'Góp vốn quán ăn với bạn',
    moTa: 'Bạn cũ mở quán cơm bình dân gần khu trọ, rủ góp một phần vốn ăn chia.',
    emoji: '🍜',
    loai: 'kinhDoanh',
    gia: 120 * TRIEU,
    thuNhapMoiNam: 20.4 * TRIEU,
    bienDongThuNhapMin: -0.35,
    bienDongThuNhapMax: 0.38,
  },
  {
    id: 'choThueXe',
    ten: 'Đội xe máy cho thuê',
    moTa: 'Mua vài chiếc xe cho khách du lịch thuê. Thu nhập đều, phụ thuộc mùa du lịch.',
    emoji: '🛵',
    loai: 'kinhDoanh',
    gia: 200 * TRIEU,
    thuNhapMoiNam: 30 * TRIEU,
    bienDongThuNhapMin: -0.15,
    bienDongThuNhapMax: 0.18,
  },
  {
    id: 'quanCaPhe',
    ten: 'Mở quán cà phê nhỏ',
    moTa: 'Một mặt bằng trong hẻm, tự vận hành. Ăn uống bấp bênh, năm được năm mất.',
    emoji: '☕',
    loai: 'kinhDoanh',
    gia: 400 * TRIEU,
    thuNhapMoiNam: 72 * TRIEU,
    bienDongThuNhapMin: -0.35,
    bienDongThuNhapMax: 0.4,
  },
  {
    id: 'gopVonCuaHang',
    ten: 'Góp vốn cửa hàng của bạn',
    moTa: 'Bạn thân mở chuỗi cửa hàng, mời góp vốn ăn chia theo năm.',
    emoji: '🏪',
    loai: 'kinhDoanh',
    gia: 800 * TRIEU,
    thuNhapMoiNam: 120 * TRIEU,
    bienDongThuNhapMin: -0.25,
    bienDongThuNhapMax: 0.28,
  },
  {
    id: 'xuongMay',
    ten: 'Góp vốn xưởng may gia công',
    moTa: 'Vốn lớn, sống nhờ đơn hàng xuất khẩu. Dành cho giai đoạn đã có tích luỹ.',
    emoji: '🧵',
    loai: 'kinhDoanh',
    gia: 1.5 * TY,
    thuNhapMoiNam: 240 * TRIEU,
    bienDongThuNhapMin: -0.22,
    bienDongThuNhapMax: 0.25,
  },
  {
    id: 'xeTaiChoHang',
    ten: 'Xe tải chở hàng cho thuê',
    moTa: 'Một chiếc xe tải và một tài xế quen. Có hàng thì chạy, ế thì nằm bãi.',
    emoji: '🚚',
    loai: 'kinhDoanh',
    gia: 600 * TRIEU,
    thuNhapMoiNam: 96 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.24,
  },
  {
    id: 'nhaTroCongNhan',
    ten: 'Dãy nhà trọ cho công nhân thuê',
    moTa: 'Mười phòng cạnh khu công nghiệp. Người thuê ổn định, tiền về đều đặn nhất.',
    emoji: '🏘️',
    loai: 'kinhDoanh',
    gia: 1 * TY,
    thuNhapMoiNam: 120 * TRIEU,
    bienDongThuNhapMin: -0.08,
    bienDongThuNhapMax: 0.12,
  },
  {
    id: 'vuonSauRieng',
    ten: 'Vườn sầu riêng ở Tây Nguyên',
    moTa: 'Mất mùa hay trúng giá cách nhau một trời. Năm được thì bằng cả chục năm dành dụm.',
    emoji: '🌳',
    loai: 'kinhDoanh',
    gia: 700 * TRIEU,
    thuNhapMoiNam: 126 * TRIEU,
    bienDongThuNhapMin: -0.85,
    bienDongThuNhapMax: 0.95,
  },

  /* ---------- Chung: canh bạc ---------- */
  {
    id: 'boSuuTapNft',
    ten: 'Bộ sưu tập tranh số hoá',
    // Cân bằng v1.2: heSoNhan 5 → 3.6 để kỳ vọng = 0.25 × 3.6 = 0,9 (âm nhẹ).
    moTa: 'Nếu trúng thì nhân 3,6 lần vốn, còn không thì thành giấy vụn ngay trong năm nay.',
    emoji: '🖼️',
    loai: 'canhBac',
    gia: 150 * TRIEU,
    xacSuatThang: 0.25,
    heSoNhan: 3.6,
  },
  {
    id: 'coinMoi',
    ten: 'Đầu cơ đồng tiền mã hoá mới lên sàn',
    // Cân bằng v1.2: heSoNhan 8 → 4.5 để kỳ vọng = 0.2 × 4.5 = 0,9 (âm nhẹ).
    moTa: 'Xác suất thắng thấp, nếu trúng thì nhân 4,5 lần vốn.',
    emoji: '🎲',
    loai: 'canhBac',
    gia: 100 * TRIEU,
    xacSuatThang: 0.2,
    heSoNhan: 4.5,
  },
  {
    id: 'quanAnNguoiQuen',
    ten: 'Góp vốn quán ăn của người quen',
    // Kỳ vọng = 0.45 × 2 = 0,9 (âm nhẹ), cùng mức với hai canh bạc còn lại.
    moTa: 'Người quen mở quán, rủ góp vốn ăn chia. Trụ được thì nhân đôi, đóng cửa thì mất sạch.',
    emoji: '🍜',
    loai: 'canhBac',
    gia: 250 * TRIEU,
    xacSuatThang: 0.45,
    heSoNhan: 2,
  },

  /* ---------- Chung: tổ chức sự kiện ---------- */
  {
    id: 'hoiChoTet',
    ten: 'Tổ chức hội chợ Tết',
    moTa: 'Thuê mặt bằng, gom gian hàng, bán vé. Một mùa Tết ăn nhau ở thời tiết và truyền thông.',
    emoji: '🎪',
    loai: 'toChucSuKien',
    gia: 200 * TRIEU,
    loiNhuanMin: -0.25,
    loiNhuanMax: 0.7,
    chiMotLan: true,
  },
  {
    id: 'giaiChayThanhPho',
    ten: 'Giải chạy phong trào thành phố',
    moTa: 'Bán vé và gọi tài trợ. Vất vả mấy tháng nhưng gọn gàng, thu xong là xong.',
    emoji: '🏃',
    loai: 'toChucSuKien',
    gia: 150 * TRIEU,
    loiNhuanMin: -0.2,
    loiNhuanMax: 0.55,
    chiMotLan: true,
  },
  {
    id: 'thauTiecCuoi',
    ten: 'Nhận thầu tiệc cưới trọn gói',
    moTa: 'Lo từ sảnh tới hoa và ban nhạc cho cả mùa cưới. Vốn nặng, lời cũng nặng.',
    emoji: '💒',
    loai: 'toChucSuKien',
    gia: 500 * TRIEU,
    loiNhuanMin: -0.2,
    loiNhuanMax: 0.6,
    chiMotLan: true,
  },

  /* ---------- Giáo viên, bác sĩ, kỹ sư phần mềm: cơ hội riêng nghề ----------
   * Cũng nằm trong dải 12–18% hạ ở v1.7 (xem chú thích đầu mảng) — trước bản
   * này chúng ngồi ở 19–22,2%, tức vẫn còn trong cái dải 18,75–22,5% cũ dù
   * không được liệt trong bảng bảy cơ hội chung. "Mọi cơ hội kinh doanh" ở
   * chú thích đầu mảng có nghĩa là mọi cơ hội, không chỉ nhóm dùng chung.
   */

  /* ---------- Giáo viên ---------- */
  {
    id: 'lopDayThem',
    ten: 'Lớp dạy thêm buổi tối',
    moTa: 'Kê bàn ghế ngay tại nhà, dạy vài lớp sau giờ hành chính. Vốn nhẹ, bắt đầu được sớm.',
    emoji: '📝',
    loai: 'kinhDoanh',
    ngheId: 'giaoVien',
    namToiThieu: 2,
    gia: 60 * TRIEU,
    thuNhapMoiNam: 9 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.25,
  },
  {
    id: 'soanSachThamKhao',
    ten: 'Biên soạn sách tham khảo',
    moTa: 'Viết bộ sách ôn luyện rồi ăn tiền bản quyền theo số bản in mỗi năm.',
    emoji: '📖',
    loai: 'kinhDoanh',
    ngheId: 'giaoVien',
    namToiThieu: 4,
    gia: 150 * TRIEU,
    thuNhapMoiNam: 25.5 * TRIEU,
    bienDongThuNhapMin: -0.3,
    bienDongThuNhapMax: 0.35,
  },
  {
    id: 'trungTamGiaSu',
    ten: 'Trung tâm gia sư',
    moTa: 'Thuê mặt bằng, gom đội ngũ giáo viên trẻ, bạn đứng quản lý và giữ uy tín.',
    emoji: '🏫',
    loai: 'kinhDoanh',
    ngheId: 'giaoVien',
    namToiThieu: 6,
    gia: 400 * TRIEU,
    thuNhapMoiNam: 64 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.25,
  },
  {
    id: 'mamNonTuThuc',
    ten: 'Trường mầm non tư thục',
    moTa: 'Cả một cơ ngơi mang tên bạn. Cần thâm niên, quan hệ và một khoản vốn lớn.',
    emoji: '🧸',
    loai: 'kinhDoanh',
    ngheId: 'giaoVien',
    namToiThieu: 12,
    chiMotLan: true,
    gia: 1.2 * TY,
    thuNhapMoiNam: 168 * TRIEU,
    bienDongThuNhapMin: -0.15,
    bienDongThuNhapMax: 0.2,
  },
  {
    id: 'traiHeHocSinh',
    ten: 'Trại hè cho học sinh',
    moTa: 'Một mùa hè trọn gói: xe cộ, chỗ ăn ở, hoạt động. Phụ huynh tin bạn nên dễ tuyển.',
    emoji: '🎒',
    loai: 'toChucSuKien',
    ngheId: 'giaoVien',
    namToiThieu: 3,
    chiMotLan: true,
    gia: 120 * TRIEU,
    loiNhuanMin: -0.2,
    loiNhuanMax: 0.6,
  },

  /* ---------- Bác sĩ ---------- */
  {
    id: 'trucPhongKhamTu',
    ten: 'Nhận trực thêm ở phòng khám tư',
    moTa: 'Vài buổi tối mỗi tuần ngoài giờ bệnh viện. Đổi sức khoẻ lấy thu nhập.',
    emoji: '🩹',
    loai: 'kinhDoanh',
    ngheId: 'bacSi',
    namToiThieu: 2,
    gia: 90 * TRIEU,
    thuNhapMoiNam: 13.5 * TRIEU,
    bienDongThuNhapMin: -0.15,
    bienDongThuNhapMax: 0.2,
  },
  {
    id: 'nhaThuoc',
    ten: 'Nhà thuốc trước cổng bệnh viện',
    moTa: 'Vị trí đắc địa và một dược sĩ đứng quầy. Bạn góp vốn cùng chuyên môn.',
    emoji: '💊',
    loai: 'kinhDoanh',
    ngheId: 'bacSi',
    namToiThieu: 5,
    gia: 450 * TRIEU,
    thuNhapMoiNam: 72 * TRIEU,
    bienDongThuNhapMin: -0.18,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'phongXetNghiem',
    ten: 'Góp vốn phòng xét nghiệm',
    moTa: 'Máy móc đắt tiền, chạy hết công suất thì lời lớn. Cần vốn và mối quan hệ chuyên môn.',
    emoji: '🔬',
    loai: 'kinhDoanh',
    ngheId: 'bacSi',
    namToiThieu: 8,
    gia: 900 * TRIEU,
    thuNhapMoiNam: 153 * TRIEU,
    bienDongThuNhapMin: -0.2,
    bienDongThuNhapMax: 0.24,
  },
  {
    id: 'phongKhamRieng',
    ten: 'Phòng khám riêng',
    moTa: 'Biển hiệu mang tên bạn. Đỉnh cao của một đời làm nghề, và cũng là khoản đầu tư lớn nhất.',
    emoji: '🏥',
    loai: 'kinhDoanh',
    ngheId: 'bacSi',
    namToiThieu: 10,
    chiMotLan: true,
    gia: 1.8 * TY,
    thuNhapMoiNam: 252 * TRIEU,
    bienDongThuNhapMin: -0.15,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'hoiThaoChuyenDe',
    ten: 'Hội thảo chuyên đề',
    moTa: 'Mời chuyên gia, bán vé cho đồng nghiệp và gọi tài trợ từ hãng dược.',
    emoji: '📣',
    loai: 'toChucSuKien',
    ngheId: 'bacSi',
    namToiThieu: 3,
    chiMotLan: true,
    gia: 250 * TRIEU,
    loiNhuanMin: -0.15,
    loiNhuanMax: 0.65,
  },

  /* ---------- Kỹ sư phần mềm ---------- */
  {
    id: 'duAnNgoaiGio',
    ten: 'Nhận dự án ngoài giờ',
    moTa: 'Vài khách hàng nhỏ và những đêm thức khuya. Không cần vốn lớn để bắt đầu.',
    emoji: '⌨️',
    loai: 'kinhDoanh',
    ngheId: 'kySuPhanMem',
    namToiThieu: 2,
    gia: 100 * TRIEU,
    thuNhapMoiNam: 18 * TRIEU,
    bienDongThuNhapMin: -0.3,
    bienDongThuNhapMax: 0.35,
  },
  {
    id: 'ungDungDiDong',
    ten: 'Ứng dụng di động của riêng bạn',
    moTa: 'Có năm bùng nổ lượt tải, có năm không ai nhắc tới. Bấp bênh nhất trong các cơ hội.',
    emoji: '📱',
    loai: 'kinhDoanh',
    ngheId: 'kySuPhanMem',
    namToiThieu: 4,
    gia: 350 * TRIEU,
    thuNhapMoiNam: 63 * TRIEU,
    bienDongThuNhapMin: -0.7,
    bienDongThuNhapMax: 0.9,
  },
  {
    id: 'khoiNghiepCongNghe',
    ten: 'Khởi nghiệp công nghệ',
    // Kỳ vọng = 0.22 × 4 = 0,88 (âm nhẹ), cùng mức với các canh bạc khác.
    moTa: 'Gọi được vốn vòng sau thì nhân 4 lần, còn không thì đóng cửa và mất trắng.',
    emoji: '🚀',
    loai: 'canhBac',
    ngheId: 'kySuPhanMem',
    namToiThieu: 6,
    gia: 500 * TRIEU,
    xacSuatThang: 0.22,
    heSoNhan: 4,
  },
  {
    id: 'congTyGiaCong',
    ten: 'Công ty phần mềm gia công',
    moTa: 'Ba chục kỹ sư và những hợp đồng dài hạn từ nước ngoài. Cả một sự nghiệp thứ hai.',
    emoji: '🏢',
    loai: 'kinhDoanh',
    ngheId: 'kySuPhanMem',
    namToiThieu: 12,
    chiMotLan: true,
    gia: 2 * TY,
    thuNhapMoiNam: 300 * TRIEU,
    bienDongThuNhapMin: -0.25,
    bienDongThuNhapMax: 0.3,
  },
  {
    id: 'hoiNghiCongNghe',
    ten: 'Hội nghị công nghệ',
    moTa: 'Thuê hội trường lớn, mời diễn giả quốc tế, bán vé sớm. Được tài trợ thì lời đậm.',
    emoji: '💡',
    loai: 'toChucSuKien',
    ngheId: 'kySuPhanMem',
    namToiThieu: 3,
    chiMotLan: true,
    gia: 400 * TRIEU,
    loiNhuanMin: -0.25,
    loiNhuanMax: 0.75,
  },

  /* ---------- Tầm lớn: chỉ mở khi tài sản ròng đã đủ ----------
   * Thanh trượt quy mô đã lo phần "cơ hội nhỏ vẫn dùng được khi giàu", nhưng
   * nửa sau ván chơi vẫn cần nội dung MỚI để còn cảm giác thăng tiến. Cả ba nằm
   * trong dải sinh lời 12–18% mà game vẫn giữ (hạ ở v1.7), nên không kênh nào
   * trội hẳn.
   */
  {
    id: 'khuNhaXuong',
    ten: 'Khu nhà xưởng cho thuê',
    moTa: 'Vài héc ta đất công nghiệp và những dãy nhà xưởng xây sẵn. Hợp đồng thuê dài hạn, tiền về đều như nước chảy.',
    emoji: '🏭',
    loai: 'kinhDoanh',
    taiSanToiThieu: 20 * TY,
    gia: 12 * TY,
    thuNhapMoiNam: 1.92 * TY,
    bienDongThuNhapMin: -0.18,
    bienDongThuNhapMax: 0.22,
  },
  {
    id: 'khachSanVenBien',
    ten: 'Khách sạn ven biển',
    moTa: 'Bốn chục phòng nhìn ra biển. Mùa cao điểm thì kín chỗ, nhưng kinh tế xấu là ngành lưu trú gãy đầu tiên.',
    emoji: '🏨',
    loai: 'kinhDoanh',
    taiSanToiThieu: 35 * TY,
    gia: 20 * TY,
    thuNhapMoiNam: 3.6 * TY,
    bienDongThuNhapMin: -0.45,
    bienDongThuNhapMax: 0.5,
  },
  {
    id: 'duAnKhuDoThi',
    ten: 'Góp vốn dự án khu đô thị',
    moTa: 'Đứng tên một phần trong dự án cả trăm héc ta. Tới tầm này thì bạn không còn đi làm ăn nữa — bạn là người bỏ vốn.',
    emoji: '🏗️',
    loai: 'kinhDoanh',
    taiSanToiThieu: 70 * TY,
    gia: 40 * TY,
    thuNhapMoiNam: 6 * TY,
    bienDongThuNhapMin: -0.35,
    bienDongThuNhapMax: 0.4,
  },
]

/** ---------------- Lời kể sáu biến cố lớn ----------------
 * Mỗi biến cố có hai bản: khi lá chắn đỡ được và khi không. Cùng một chuyện,
 * nhưng người có chuẩn bị kể lại nó theo một cách khác hẳn.
 */
export const LOI_KE_BIEN_CO: Record<
  BienCoId,
  { emoji: string; tieuDe: string; coLaChan: string; khongLaChan: string }
> = {
  benhHiemNgheo: {
    emoji: '🏥',
    tieuDe: 'Bệnh hiểm nghèo',
    coLaChan:
      'Kết quả sinh thiết về, bác sĩ nói phải điều trị dài ngày. May là tấm thẻ bảo hiểm gánh gần hết viện phí, bạn chỉ phải lo phần thuốc ngoài danh mục và những tháng nghỉ việc.',
    khongLaChan:
      'Kết quả sinh thiết về, bác sĩ nói phải điều trị dài ngày. Không có bảo hiểm, mỗi lần đóng viện phí là một lần rút ruột. Vừa chống chọi với bệnh vừa nhìn tiền tiết kiệm bốc hơi.',
  },
  matViec: {
    emoji: '🏭',
    tieuDe: 'Mất việc',
    coLaChan:
      'Công ty cắt giảm và tên bạn nằm trong danh sách. Nhờ khoản dự phòng đã để dành, bạn có thời gian tìm chỗ mới tử tế thay vì vơ vội việc gì cũng làm.',
    khongLaChan:
      'Công ty cắt giảm và tên bạn nằm trong danh sách. Trong túi không có đồng dự phòng nào, bạn phải nhận đại một chỗ lương thấp hơn hẳn chỉ để có việc.',
  },
  boMeNgaBenh: {
    emoji: '👴',
    tieuDe: 'Bố mẹ ngã bệnh',
    coLaChan:
      'Bố mẹ trở bệnh nặng phải nằm viện dài ngày. Ông bà có khoản dành dụm riêng nên bạn chỉ phải lo phần thêm và những chuyến đi về.',
    khongLaChan:
      'Bố mẹ trở bệnh nặng phải nằm viện dài ngày. Cả đời làm lụng không để lại được gì, mọi khoản viện phí đổ hết lên vai bạn.',
  },
  voHui: {
    emoji: '💸',
    tieuDe: 'Vỡ hụi',
    coLaChan:
      'Dây hụi trong xóm vỡ, chủ hụi ôm tiền bỏ đi. Người soát sổ sách cùng bạn đã thấy dấu hiệu bất thường từ trước nên bạn rút gần hết, chỉ mất phần nhỏ.',
    khongLaChan:
      'Dây hụi trong xóm vỡ, chủ hụi ôm tiền bỏ đi. Bao nhiêu tiền mặt gom góp mấy năm nay theo đó mà đi, chỉ còn lại tờ giấy viết tay không ai công nhận.',
  },
  doanhNghiepDongCua: {
    emoji: '🏚️',
    tieuDe: 'Doanh nghiệp đóng cửa',
    coLaChan:
      'Việc làm ăn không trụ nổi, đành đóng cửa và thanh lý. Cũng đau, nhưng bạn còn nhiều chỗ khác nên đây chỉ là một mảnh gãy chứ không phải cả gia tài.',
    khongLaChan:
      'Việc làm ăn không trụ nổi, đành đóng cửa và thanh lý. Bao nhiêu vốn liếng bạn dồn hết vào đây, giờ chỉ vớt lại được chút tiền bán máy móc và hàng tồn.',
  },
  baoLu: {
    emoji: '🌊',
    tieuDe: 'Bão lũ tàn phá',
    coLaChan: '',
    khongLaChan:
      'Cơn bão lớn nhất mấy chục năm quét qua. Nước rút để lại một đống ngổn ngang, sửa sang lại tốn kém hơn mọi dự tính.',
  },
}

export const timNghe = (id: string) => NGHE.find((n) => n.id === id)
export const timUocNguyen = (id: string) => UOC_NGUYEN.find((u) => u.id === id)
export const timKhoaHoc = (id: string) => KHOA_HOC.find((k) => k.id === id)
export const timTaiSan = (id: string) => TAI_SAN.find((t) => t.id === id)
export const timCoHoi = (id: string) => CO_HOI.find((c) => c.id === id)
export const timXuatThan = (id: string) => XUAT_THAN.find((x) => x.id === id)

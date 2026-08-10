import { TRIEU, TY } from './config'
import type { CoHoi, KhoaHoc, MonUocNguyen, Nghe, TaiSan, TheTieuDung, XuatThan } from './types'

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

/** ---------------- Xuất thân ----------------
 * Vốn tính theo TỈ LỆ với lương khởi điểm chứ không phải số tiền tuyệt đối, để
 * cả ba nghề đều cân nhau.
 *
 * Nhà thuần nông là trường hợp đáng chú ý nhất: trong những năm còn phụng dưỡng,
 * hai hệ số triệt tiêu nhau gần hết (0,92 × 1,08 ≈ 0,99) — gánh nặng rơi đúng
 * vào quãng đời cần vốn nhất rồi biến mất sau tuổi 55, để lại lợi thế chi phí
 * thấp cho phần đời còn lại. Ngoài đời cũng thế: người xuất thân khó khăn bị níu
 * ở đoạn đầu, nhưng thói quen tằn tiện là tài sản của đoạn sau.
 *
 * ---------- Cân bằng phase 1, fix round 1 ----------
 * Bản đầu của Task 5 đặt `vienChuc.tyLeVonBanDau = 0,4` (chỉ 40% một năm lương)
 * trong khi v1.5 khởi đầu bằng nguyên một năm lương (1,0×) — cắt 60% vốn của
 * chính ván MẶC ĐỊNH. Đó là lỗi đặc tả, không phải lỗi cân bằng thật: nó vừa làm
 * hai test cân bằng cũ (`balance.test.ts`) đỏ vì bot cân bằng vỡ nợ ngay năm
 * đầu, vừa buộc phải vặn `heSoChiPhiSong` lên rất cao (buônBán 1,8, khaGia 2,6)
 * để ép chênh lệch tỉ lệ thắng giữa bốn xuất thân về dưới ngưỡng — phá cả câu
 * chuyện thiết kế (chi phí sống ×2,6 không còn giống "chỉ đắt hơn một chút")
 * lẫn mục tiêu tỉ lệ thắng chung của game.
 *
 * Sửa đúng gốc: đưa `vienChuc.tyLeVonBanDau` về lại 1,0 (khôi phục đúng số vốn
 * khởi đầu của v1.5 cho ván mặc định), rồi giãn ba xuất thân còn lại theo cùng
 * tỉ lệ tương đối quanh mốc đó (thuần nông tạm đặt 0,25, buônBán 2, khaGia 3,5).
 * `heSoChiPhiSong` trả lại nguyên bản đặc tả ban đầu (0,92 / 1 / 1,1 / 1,25).
 *
 * ---------- Cân bằng phase 1, fix round 2 ----------
 * Vòng round 1 để lộ ra thuần nông vẫn thua gần như tuyệt đối (5% thắng, chênh
 * 92,5 điểm phần trăm so với ba xuất thân kia) dù `heSoChiPhiSong` đã hạ hết cỡ
 * xuống sàn cho phép 0,85. Lý do là RÀNG BUỘC CỦA CỖ MÁY chứ không phải một khởi
 * đầu khó khăn thông thường: chi phí sinh hoạt bị trừ ở ĐẦU năm từ tiền mặt
 * đang có, còn lương chỉ về túi ở CUỐI năm (xem `chuyenNam` trong `engine.ts`).
 * Vì vậy `tyLeVonBanDau` phải vượt quá tỉ lệ chi phí/lương của nghề khắt khe
 * nhất, nếu không nhân vật thua ngay năm 1 trước khi kịp làm bất cứ điều gì —
 * không phải một bất lợi có thể bù bằng lối chơi khôn ngoan.
 *
 * Ngưỡng hoà vốn năm 1 theo từng nghề (đã nhân `heSoChiPhiSong` 0,92 của thuần
 * nông): giáo viên 108/180 × 0,92 = 0,552; bác sĩ 240/360 × 0,92 = 0,613; kỹ sư
 * phần mềm 435/600 × 0,92 = 0,667 — khắt khe nhất. `tyLeVonBanDau` sửa thành
 * 0,85 để vượt xa mốc 0,667 đó, chừa đệm cho khoản trả nợ học phí năm đầu và
 * các sự kiện phát sinh sớm. Đo lại: thuần nông 92%, viên chức 94%, buôn bán
 * 97%, khá giả 98% — chênh 6 điểm phần trăm, trong ngưỡng 15. Không đụng tới
 * `tyLeVonBanDau`/`heSoChiPhiSong` của ba xuất thân còn lại. Xem `balance.test.ts`
 * và báo cáo `task-2-4-5-fix-report.md` (mục fix round 2) cho số đo đầy đủ.
 */
export const XUAT_THAN: XuatThan[] = [
  {
    id: 'thuanNong',
    ten: 'Nhà thuần nông',
    emoji: '🌾',
    moTa: 'Bố mẹ làm ruộng, bán cả lứa lợn và vay mượn thêm họ hàng mới dồn được cho bạn một khoản nhỏ phòng thân. Đổi lại là khoản nợ học phí phải trả dần và trách nhiệm gửi tiền về quê đỡ đần bố mẹ mỗi tháng, nhưng thói quen tằn tiện thì bạn mang theo suốt đời.',
    tyLeVonBanDau: 0.85,
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
    moTa: 'Bố mẹ là công chức nhà nước, đủ ăn đủ mặc. Cho bạn một khoản nhỏ làm vốn rồi để bạn tự lo phần còn lại.',
    tyLeVonBanDau: 1,
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
    emoji: '🏢',
    moTa: 'Nhà mặt phố có cửa hàng, bố mẹ dúi cho một khoản kha khá làm vốn. Đổi lại, bạn lớn lên với mức sống mà giờ khó lòng hạ xuống.',
    tyLeVonBanDau: 2,
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
    tyLeVonBanDau: 3.5,
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
 * Mọi cơ hội kinh doanh đều nằm trong dải sinh lời 19–22% mỗi năm trên vốn, nên
 * không kênh nào trội hẳn so với phần còn lại.
 */
export const CO_HOI: CoHoi[] = [
  /* ---------- Chung: kinh doanh ---------- */
  {
    id: 'choThueXe',
    ten: 'Đội xe máy cho thuê',
    moTa: 'Mua vài chiếc xe cho khách du lịch thuê. Thu nhập đều, phụ thuộc mùa du lịch.',
    emoji: '🛵',
    loai: 'kinhDoanh',
    gia: 200 * TRIEU,
    thuNhapMoiNam: 40 * TRIEU,
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
    thuNhapMoiNam: 90 * TRIEU,
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
    thuNhapMoiNam: 150 * TRIEU,
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
    thuNhapMoiNam: 300 * TRIEU,
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
    thuNhapMoiNam: 126 * TRIEU,
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
    thuNhapMoiNam: 195 * TRIEU,
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
    thuNhapMoiNam: 154 * TRIEU,
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
    thuNhapMoiNam: 13 * TRIEU,
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
    thuNhapMoiNam: 30 * TRIEU,
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
    thuNhapMoiNam: 84 * TRIEU,
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
    thuNhapMoiNam: 228 * TRIEU,
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
    thuNhapMoiNam: 20 * TRIEU,
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
    thuNhapMoiNam: 94 * TRIEU,
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
    thuNhapMoiNam: 171 * TRIEU,
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
    thuNhapMoiNam: 342 * TRIEU,
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
    thuNhapMoiNam: 22 * TRIEU,
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
    thuNhapMoiNam: 73 * TRIEU,
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
    thuNhapMoiNam: 380 * TRIEU,
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
]

export const timNghe = (id: string) => NGHE.find((n) => n.id === id)
export const timUocNguyen = (id: string) => UOC_NGUYEN.find((u) => u.id === id)
export const timKhoaHoc = (id: string) => KHOA_HOC.find((k) => k.id === id)
export const timTaiSan = (id: string) => TAI_SAN.find((t) => t.id === id)
export const timCoHoi = (id: string) => CO_HOI.find((c) => c.id === id)
export const timXuatThan = (id: string) => XUAT_THAN.find((x) => x.id === id)

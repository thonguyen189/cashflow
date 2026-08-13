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
    // giaoVien — lên bậc ba năm một lần, hệ số 2,34 → 4,98 sau hai mươi bốn năm,
    // tức khoảng 3,2%/năm tăng thực. Chậm, đều, không bao giờ bứt phá, cũng không
    // bao giờ sụp.
    //
    // ---------- Vì sao con số này trả về mức thật ở v1.7 đợt 2 ----------
    // Vòng hiệu chỉnh v1.7 từng nhân ba bậc đầu lên 1,75 lần (0,060 / 0,052 /
    // 0,044) để xoá 44,5 điểm chênh lệch tỉ lệ thắng giữa ba nghề. Nó đạt chỉ
    // tiêu, nhưng phải trả bằng cách cho giáo viên một thang lương không tồn tại.
    //
    // Quyết định đã chốt: trả về số thật và chấp nhận rằng giáo viên trên đồng
    // lương giáo viên thì rất khó đạt tự do tài chính. Đó là điều thật nhất mà
    // game này kể được, và đổi nó lấy một ô xanh trong bảng cân bằng là không
    // đáng. Chênh lệch giữa ba nghề vì vậy KHÔNG còn là chỉ tiêu phải đạt — nó
    // là thông điệp: nghề bạn chọn quyết định phần lớn cuộc chơi.
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
    //
    // Nhân 1,2 lần ba bậc đầu ở vòng hiệu chỉnh v1.7 (Task 15): sau khi nâng đường
    // cong giáo viên, bác sĩ tụt xuống 40% — dưới sàn 45% của mục J — trong khi hai
    // nghề kia đã ở 48% và 50,5%. Đây là phép chỉnh nhỏ để kéo cả ba vào chung dải
    // chứ không đổi hình dạng: đoạn 31–40 vẫn là đoạn dốc nhất của cả ba nghề.
    duongCongSuNghiep: [
      { denTuoi: 30, tangThuc: 0.06 },
      { denTuoi: 40, tangThuc: 0.108 },
      { denTuoi: 50, tangThuc: 0.06 },
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
    // ---------- Hạ từ 1,25 xuống 1,15 ở v1.9 ----------
    // Không phải vì nhà khá giả quá khó — một mình nó vẫn cân đúng — mà vì nó NHÂN
    // CHỒNG với `loiSongTheoLuong`, và bản này vừa nâng hệ số ấy lên 0,85. Hai con số
    // gặp nhau ở góc trên bên phải của bảng: kỹ sư phần mềm nhà khá giả chọn bậc lương
    // cao nhất chịu hệ số 1,25 × 1,2125 = 1,52, tức chi phí 185 triệu trên đồng lương
    // 180 triệu. Đo được ô ấy thắng 0,8% trên 250 ván — tức là vừa chữa xong một góc
    // bất khả thi thì mở ra một góc bất khả thi khác, đúng cái lỗi đang phải chữa.
    //
    // Quét 1,25 → 1,15 (n=250): ô ấy lên 6,4%, bác sĩ nhà khá giả bậc cao nhất lên từ
    // 5,6% tới 20,8%, giáo viên nhà khá giả bậc cao nhất lên từ 16,8% tới 52,8%, mà ba
    // nghề ở thiết lập mặc định KHÔNG đổi một phần mười điểm nào — chúng đo ở viên chức
    // tỉnh lẻ nên hệ số này không chạm tới.
    //
    // Ô yếu nhất của cả lưới ba nghề nhân bốn xuất thân nhân năm bậc lương vì thế dời
    // chỗ: từ 0,8% ở kỹ sư phần mềm nhà khá giả bậc 1,25, sang 3,2% ở kỹ sư phần mềm
    // buôn bán ngoài phố bậc 1,25. Vẫn rất khó, nhưng thôi là bất khả thi — và đó là
    // một góc người chơi CHỌN khi tạo nhân vật, khác hẳn góc nghèo vốn không ai chọn.
    //
    // Cần gạt kia đã thử và đã loại: hạ `apLucTheoLuong` từ 20 xuống 14 cũng nâng được
    // ô yếu nhất, nhưng nó dìm chính góc mà người chơi báo lỗi (giáo viên nhà thuần
    // nông bậc thấp nhất, 5,2% xuống 4,4%) vì bậc lương thấp mất phần thưởng hạnh phúc.
    heSoChiPhiSong: 1.15,
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
 *
 * ---------- Cách đọc năm con số của mô hình giá (v1.8) ----------
 * `tangTruongThuc` là LÃI THỰC DÀI HẠN của kênh, đo ra đúng bằng số đặt vào.
 * Bốn con số còn lại chỉ quyết định đường đi gập ghềnh tới đó, không đụng tới
 * đích: `chuKyNam` là khoảng cách trung bình giữa hai đỉnh, `damChuKy` là độ dai
 * của sóng, `nhieuGia` là độ rung mỗi năm, `nhayChuKy` là mức ăn theo chu kỳ
 * kinh tế chung. Muốn một kênh dữ dội hơn thì nâng `nhieuGia` — nó KHÔNG làm
 * kênh ấy nghèo đi, khác hẳn mô hình cũ.
 *
 * Độ dài chu kỳ lấy theo ngoài đời: tiền mã hoá bốn năm một nhịp quanh kỳ giảm
 * phát thưởng khối, cổ phiếu bảy tới mười năm một chu kỳ kinh doanh, vàng đi
 * nhịp dài hơn cổ phiếu một chút, còn nhà đất nổi tiếng với chu kỳ mười tám năm
 * — rút xuống mười bốn để một ván bốn mươi năm còn kịp thấy hai lần lên đỉnh.
 */
export const TAI_SAN: TaiSan[] = [
  {
    id: 'traiPhieu',
    ten: 'Trái phiếu & tiền gửi',
    emoji: '🏦',
    moTa: 'An toàn nhất. Lãi đều đặn, giá gần như không đổi. Nơi giữ tiền chờ cơ hội.',
    giaDonVi: 1 * TRIEU,
    donViTen: 'phần',
    loiTucMin: 0.05,
    loiTucMax: 0.07,
    // `theoLamPhat: false` cộng `tangTruongThuc: 0` nghĩa là gốc ĐỨNG YÊN theo giá
    // danh nghĩa — một triệu gửi hôm nay vẫn là một triệu, còn giá cả thì không.
    // Đo được −7,4% lãi thực mỗi năm và đó chính là bài học về gửi tiết kiệm:
    // an toàn danh nghĩa không phải an toàn thật. Lợi tức 5–7% miễn thuế mới là
    // thứ bù lại, và nó chỉ vừa đủ hoà.
    tangTruongThuc: 0,
    theoLamPhat: false,
    /** không có chu kỳ: giá bám sát giá trị thật, chỉ rung nhẹ */
    chuKyNam: 0,
    damChuKy: 0,
    nhieuGia: 0.006,
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
    loiTucMin: 0,
    loiTucMax: 0.06,
    // +4% lãi thực mỗi năm, cộng cổ tức 0–6%: khớp với lợi suất thật của thị
    // trường chứng khoán trong một thế kỷ. Nhưng đường đi tới đó rất xóc — đo
    // được 35% số năm là năm giảm và có ván sụt 88% từ đỉnh. Ai mua đúng lúc
    // đỉnh rồi bán lúc hoảng vẫn mất sạch, đúng như đời thật.
    tangTruongThuc: 0.04,
    theoLamPhat: true,
    /** chu kỳ kinh doanh bảy tới mười năm */
    chuKyNam: 8,
    damChuKy: 0.78,
    nhieuGia: 0.13,
    /** nhạy hơn nền kinh tế, đúng như chỉ số chứng khoán */
    nhayChuKy: 0.7,
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
    loiTucMin: 0,
    loiTucMax: 0,
    // +0,8% lãi thực: vàng giữ sức mua qua nhiều thế kỷ chứ gần như không sinh
    // lời, đúng như câu mô tả ngay trên. Đây là chỗ mô hình mới trả lời dứt điểm
    // lỗi của v1.7 — hồi đó vàng ăn +8,63% lãi thực và không có nổi một năm giảm
    // trong suy thoái lẫn khủng hoảng, tức mua vàng là không thể thua. Nay con
    // số ấy là một tham số đọc thẳng ra được, không còn là kết quả phụ của biên
    // độ nhân độ nhạy chu kỳ mà phải mô phỏng cả trăm năm mới biết.
    tangTruongThuc: 0.008,
    theoLamPhat: true,
    /** đi nhịp dài hơn cổ phiếu một chút */
    chuKyNam: 9,
    damChuKy: 0.8,
    nhieuGia: 0.13,
    /**
     * NGHỊCH chu kỳ — càng hoảng loạn càng đắt. Vẫn là chỗ trú ẩn, chỉ thôi là
     * chỗ trú ẩn KHÔNG rủi ro.
     *
     * Hạ từ −0,5 xuống −0,3 vì `biendong-dau-tu.test.ts` bắt được vàng chỉ giảm
     * 52/1217 năm khủng hoảng, tức 4,3% — vẫn là cược gần như chắc thắng, đúng
     * cái lỗi đang phải chữa, chỉ nhẹ hơn. Gốc là cú hích nghịch chu kỳ trong
     * khủng hoảng (0,45 × 0,5 = +0,225) lớn gấp đôi độ rung 0,11 của vàng, nên
     * gần như không cú rung nào đủ sức kéo giá xuống. Nay cú hích còn +0,135 so
     * với độ rung 0,13 — vàng vẫn thường lên khi kinh tế sập, chỉ thôi là luôn
     * lên. Vàng sập trong khủng hoảng là chuyện có thật: năm 2008 nó mất ba mươi
     * phần trăm trong đợt tháo chạy tìm tiền mặt trước khi tăng trở lại.
     */
    nhayChuKy: -0.3,
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
    loiTucMin: 0,
    loiTucMax: 0,
    // Vẫn là kênh sinh lời cao nhất (+6% lãi thực) và vẫn dữ dội nhất — `nhieuGia`
    // 0,34 gấp gần ba lần cổ phiếu, đo được có ván sụt 99% từ đỉnh. Điểm khác v1.7:
    // độ dữ dội KHÔNG còn phải trả giá bằng lãi. Mô hình cũ bốc ngẫu nhiên độc lập
    // nên biên càng rộng thì hao hụt dao động càng lớn, và tiền mã hoá kết cục là
    // kênh thua chắc −10,85% lãi thực. Nay muốn dữ dội tới đâu cũng được mà không
    // đụng tới đích, vì độ lệch luôn bị kéo về giá trị thật.
    tangTruongThuc: 0.06,
    theoLamPhat: true,
    /** bốn năm một nhịp quanh kỳ giảm phát thưởng khối — đúng như quan sát ngoài đời */
    chuKyNam: 5,
    damChuKy: 0.84,
    nhieuGia: 0.34,
    /** khuếch đại mạnh nhất theo cả hai chiều */
    nhayChuKy: 1.1,
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
    loiTucMin: 0.04,
    loiTucMax: 0.07,
    // +1,5% lãi thực cộng tiền thuê 4–7%: nhà đất giàu lên chủ yếu nhờ dòng tiền
    // cho thuê chứ không nhờ giá đất, đúng như ngoài đời. Kênh êm nhất trong bốn
    // kênh có rủi ro — chỉ 27% số năm là năm giảm — nhưng chu kỳ dài mười bốn năm
    // nghĩa là lỡ mua đúng đỉnh thì phải ôm gần một thập kỷ mới về bờ.
    tangTruongThuc: 0.015,
    theoLamPhat: true,
    /** chu kỳ nhà đất ngoài đời khoảng mười tám năm, rút lại cho vừa một ván */
    chuKyNam: 14,
    damChuKy: 0.82,
    nhieuGia: 0.07,
    /**
     * Đi cùng nền kinh tế nhưng chậm chạp hơn cổ phiếu.
     *
     * Hạ từ 0,35 xuống 0,2 và nâng `nhieuGia` từ 0,05 lên 0,07 vì phép thử đột
     * biến bắt được nhà đất chỉ giảm 6,8% số năm THỊNH VƯỢNG — cùng một lỗi với
     * vàng trong khủng hoảng, chỉ nhẹ hơn và ở đầu kia của chu kỳ. Gốc y hệt: cú
     * hích chu kỳ trong năm thịnh vượng (0,26 × 0,35 = +0,091) lớn gần gấp đôi độ
     * rung 0,05, nên hầu như không cú rung nào kéo nổi giá xuống. Nay cú hích còn
     * +0,052 so với độ rung 0,07. Nhà đất vẫn là kênh êm nhất trong bốn kênh có
     * rủi ro, chỉ thôi là kênh không thể lỗ trong năm kinh tế đẹp.
     */
    nhayChuKy: 0.2,
    /** cho thuê nhà chịu 10% (5% giá trị gia tăng + 5% thu nhập cá nhân) */
    thueLoiTuc: 0.1,
  },
]

/** ---------------- Thẻ tiêu dùng ----------------
 * Nhận thì +điểm hạnh phúc và mất tiền; TỪ CHỐI thì -điểm.
 *
 * ---------- Trần giá trị: 3 triệu đồng mỗi điểm hạnh phúc (v1.9) ----------
 * Bản trước để dải đồng trên điểm trải từ 0,17 tới 7,50 triệu — chênh bốn mươi lăm
 * lần — và coi đó là ưu điểm: chênh càng rộng thì mỗi thẻ càng là một quyết định
 * thật. Điều đó chỉ đúng với người chơi VỚI TỚI được cả hai đầu. Ba tấm tệ nhất
 * (drone 7,50 · karaoke 5,83 · đồng hồ 4,50) với nhân vật thu nhập thấp không phải
 * quyết định mà là khoản phạt: không đủ tiền để nhận, nên năm nào rút trúng là năm
 * ấy mất trắng đúng số điểm ghi trên thẻ.
 *
 * Nay trần là 3,00 và dải còn 0,17 tới 3,00 — vẫn chênh mười tám lần, vẫn thừa để
 * mỗi thẻ là một quyết định. Sửa bằng cách HẠ GIÁ chứ không phải nâng điểm: nâng
 * điểm làm khoản phạt từ chối nặng thêm, tức là đổ dầu vào đúng chỗ đang cháy.
 *
 * Ý nghĩa của tỉ lệ là bài học chính của cả cơ chế này: quan hệ, sức khoẻ và trải
 * nghiệm nằm ở đầu rẻ (0,2 tới 0,8 triệu mỗi điểm), còn đồ vật và sĩ diện nằm ở đầu
 * đắt (2 tới 3 triệu). Mua vui bằng đồ đạc là cách đắt nhất để vui.
 *
 * ---------- Sáu chặng đời ----------
 * Không ghi `giaiDoan` nghĩa là mọi lúc. `docThan` và `ongBa` thêm ở v1.9 — xem
 * `GiaiDoanThe` trong types.ts. Bộ bài đi từ 39 lên 122 thẻ ở bản này, và đó là hệ
 * quả bắt buộc chứ không phải trang trí: bộ lọc theo khả năng chi tiêu (xem
 * `CONFIG.theTieuDung`) cắt bớt số thẻ hợp lệ mỗi năm, mà bộ bài mỏng cộng bộ lọc
 * chặt thì người nghèo năm nào cũng gặp lại đúng mấy tấm cũ.
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
  // Ba tấm dưới đây là ba tấm bị hạ giá ở v1.9 — xem chú thích đầu mảng.
  { id: 't18', ten: 'Đồng hồ hàng hiệu', emoji: '⌚', gia: 30 * TRIEU, diem: 10 },
  { id: 't19', ten: 'Dàn karaoke tại nhà', emoji: '🎤', gia: 18 * TRIEU, diem: 6 },
  { id: 't20', ten: 'Drone quay phim', emoji: '🚁', gia: 12 * TRIEU, diem: 4, tuoiToiDa: 75 },
  { id: 't40', ten: 'Mừng cưới con đồng nghiệp', emoji: '💒', gia: 1 * TRIEU, diem: 4 },
  { id: 't41', ten: 'Rủ hàng xóm ăn bún chả', emoji: '🥢', gia: 400_000, diem: 2 },
  { id: 't42', ten: 'Đi chùa đầu năm cầu an', emoji: '🙏', gia: 600_000, diem: 3 },
  { id: 't43', ten: 'Ủng hộ đồng bào vùng lũ', emoji: '🤝', gia: 1.5 * TRIEU, diem: 6 },
  { id: 't44', ten: 'Sân cầu lông tối thứ Bảy', emoji: '🏸', gia: 900_000, diem: 4 },
  { id: 't45', ten: 'Đi lấy cao răng định kỳ', emoji: '🪥', gia: 800_000, diem: 3 },
  { id: 't46', ten: 'Vé xem phim rạp cuối tuần', emoji: '🎬', gia: 500_000, diem: 2 },
  { id: 't47', ten: 'Phúng viếng đám tang trong họ', emoji: '🕊️', gia: 3 * TRIEU, diem: 8 },
  { id: 't48', ten: 'Lớp học bơi ba tháng', emoji: '🏊', gia: 4 * TRIEU, diem: 10 },
  { id: 't49', ten: 'Nuôi một chú mèo trong nhà', emoji: '🐈', gia: 5 * TRIEU, diem: 12 },
  { id: 't50', ten: 'Khoá học nấu ăn cuối tuần', emoji: '🍳', gia: 3.5 * TRIEU, diem: 7 },
  { id: 't51', ten: 'Vé đêm nhạc ca sĩ yêu thích', emoji: '🎫', gia: 2.5 * TRIEU, diem: 5 },
  { id: 't52', ten: 'Bộ quần áo mặc đi tiệc', emoji: '👗', gia: 6 * TRIEU, diem: 3 },
  { id: 't53', ten: 'Thay bộ nồi chảo trong bếp', emoji: '🥘', gia: 4.5 * TRIEU, diem: 2 },
  { id: 't54', ten: 'Chai nước hoa hàng hiệu', emoji: '🧴', gia: 7 * TRIEU, diem: 3 },
  { id: 't55', ten: 'Mổ mắt cận thị', emoji: '👓', gia: 18 * TRIEU, diem: 20, tuoiToiDa: 60 },
  { id: 't56', ten: 'Đi Hà Giang mùa hoa tam giác mạch', emoji: '🌾', gia: 9 * TRIEU, diem: 16 },
  { id: 't57', ten: 'Lắp điều hoà cho phòng ngủ', emoji: '❄️', gia: 12 * TRIEU, diem: 5 },
  { id: 't58', ten: 'Bộ gậy chơi gôn cuối tuần', emoji: '⛳', gia: 18 * TRIEU, diem: 7 },
  { id: 't59', ten: 'Đổi máy tính xách tay đời mới', emoji: '💻', gia: 19 * TRIEU, diem: 8, tuoiToiDa: 70 },
  { id: 't60', ten: 'Máy lọc nước và lọc không khí', emoji: '💧', gia: 45 * TRIEU, diem: 18 },
  { id: 't61', ten: 'Bộ ghế da cho phòng khách', emoji: '🛋️', gia: 35 * TRIEU, diem: 12 },
  { id: 't62', ten: 'Học lấy bằng lái ô tô', emoji: '🛣️', gia: 25 * TRIEU, diem: 18 },
  { id: 't63', ten: 'Đi Hàn Quốc ngắm mùa lá đỏ', emoji: '🍁', gia: 55 * TRIEU, diem: 22 },
  { id: 't64', ten: 'Cải tạo lại gian bếp', emoji: '🍽️', gia: 60 * TRIEU, diem: 22 },

  /* --- Giai đoạn độc thân: chỉ xuất hiện khi CHƯA kết hôn (v1.9) --- */
  { id: 't65', ten: 'Nhậu lẩu với hội bạn thân', emoji: '🍻', gia: 800_000, diem: 4, giaiDoan: 'docThan' },
  { id: 't66', ten: 'Buổi hẹn đầu tiên xem phim', emoji: '💘', gia: 700_000, diem: 3, giaiDoan: 'docThan' },
  { id: 't67', ten: 'Chơi bi-a cùng nhóm bạn', emoji: '🎱', gia: 400_000, diem: 2, giaiDoan: 'docThan' },
  { id: 't68', ten: 'Cắt tóc tạo kiểu ở tiệm quen', emoji: '💇', gia: 1.2 * TRIEU, diem: 3, giaiDoan: 'docThan' },
  { id: 't69', ten: 'Phượt xe máy vòng Tây Bắc', emoji: '🏍️', gia: 6 * TRIEU, diem: 15, giaiDoan: 'docThan' },
  { id: 't70', ten: 'Dọn ra ở trọ riêng một mình', emoji: '🔑', gia: 7 * TRIEU, diem: 12, giaiDoan: 'docThan' },
  { id: 't71', ten: 'Sắm bộ đồ đi làm chỉn chu', emoji: '👔', gia: 4 * TRIEU, diem: 2, giaiDoan: 'docThan' },
  { id: 't72', ten: 'Máy chơi trò chơi cầm tay', emoji: '🎮', gia: 7.5 * TRIEU, diem: 3, giaiDoan: 'docThan' },
  { id: 't73', ten: 'Học lặn biển ở Nha Trang', emoji: '🤿', gia: 12 * TRIEU, diem: 20, giaiDoan: 'docThan' },
  { id: 't74', ten: 'Ráp dàn máy tính cấu hình mạnh', emoji: '🕹️', gia: 18 * TRIEU, diem: 7, giaiDoan: 'docThan' },
  { id: 't75', ten: 'Bộ sưu tập giày thể thao', emoji: '👟', gia: 45 * TRIEU, diem: 16, giaiDoan: 'docThan' },
  { id: 't76', ten: 'Đi bụi châu Âu một tháng', emoji: '🧭', gia: 80 * TRIEU, diem: 28, giaiDoan: 'docThan' },

  /* --- Giai đoạn gia đình: chỉ xuất hiện khi đã kết hôn --- */
  { id: 't21', ten: 'Kỷ niệm ngày cưới ở nhà hàng', emoji: '💐', gia: 4 * TRIEU, diem: 8, giaiDoan: 'giaDinh' },
  { id: 't22', ten: 'Du lịch Nha Trang cùng bạn đời', emoji: '🏖️', gia: 12 * TRIEU, diem: 15, giaiDoan: 'giaDinh' },
  { id: 't23', ten: 'Sửa sang lại tổ ấm', emoji: '🔨', gia: 40 * TRIEU, diem: 14, giaiDoan: 'giaDinh' },
  { id: 't24', ten: 'Tặng bạn đời chiếc nhẫn vàng', emoji: '💍', gia: 25 * TRIEU, diem: 9, giaiDoan: 'giaDinh' },
  { id: 't25', ten: 'Bữa tối dưới ánh nến hâm nóng tình cảm', emoji: '🕯️', gia: 1.5 * TRIEU, diem: 4, giaiDoan: 'giaDinh' },
  { id: 't26', ten: 'Cả nhà về quê ngoại ăn Tết', emoji: '🏮', gia: 5 * TRIEU, diem: 10, giaiDoan: 'giaDinh' },
  { id: 't77', ten: 'Đi ăn cưới bên nhà nội', emoji: '🎊', gia: 1 * TRIEU, diem: 4, giaiDoan: 'giaDinh' },
  { id: 't78', ten: 'Nấu mâm cơm giỗ ông bà', emoji: '🍚', gia: 1.5 * TRIEU, diem: 7, giaiDoan: 'giaDinh' },
  { id: 't79', ten: 'Hai vợ chồng đi ăn hàng làm lành', emoji: '🍜', gia: 800_000, diem: 4, giaiDoan: 'giaDinh' },
  { id: 't80', ten: 'Quà Tết biếu bố mẹ hai bên', emoji: '🎁', gia: 6 * TRIEU, diem: 12, giaiDoan: 'giaDinh' },
  { id: 't81', ten: 'Góp tiền họp họ đầu năm', emoji: '🏵️', gia: 3 * TRIEU, diem: 2, giaiDoan: 'giaDinh' },
  { id: 't82', ten: 'Đưa bạn đời đi khám sức khoẻ', emoji: '🩺', gia: 5 * TRIEU, diem: 14, giaiDoan: 'giaDinh' },
  { id: 't83', ten: 'Chụp bộ ảnh cưới lại sau mười năm', emoji: '🖼️', gia: 7 * TRIEU, diem: 9, giaiDoan: 'giaDinh' },
  { id: 't84', ten: 'Sắm máy giặt sấy cho cả nhà', emoji: '🧺', gia: 15 * TRIEU, diem: 6, giaiDoan: 'giaDinh' },
  { id: 't85', ten: 'Làm tiệc tân gia mời họ hàng', emoji: '🍾', gia: 12 * TRIEU, diem: 5, giaiDoan: 'giaDinh' },
  { id: 't86', ten: 'Dọn phòng đón bố mẹ lên ở cùng', emoji: '🛏️', gia: 10 * TRIEU, diem: 18, giaiDoan: 'giaDinh', tuoiToiDa: 70 },
  { id: 't87', ten: 'Thay bộ bàn ghế gỗ tiếp khách', emoji: '🪑', gia: 42 * TRIEU, diem: 15, giaiDoan: 'giaDinh' },
  { id: 't88', ten: 'Thuê xe chuyển nhà sang chỗ mới', emoji: '📦', gia: 22 * TRIEU, diem: 12, giaiDoan: 'giaDinh' },
  { id: 't89', ten: 'Đưa cả nhà đi Singapore mười ngày', emoji: '🌏', gia: 80 * TRIEU, diem: 28, giaiDoan: 'giaDinh' },
  { id: 't90', ten: 'Xây lại cổng nhà cho nở mày nở mặt', emoji: '🚪', gia: 60 * TRIEU, diem: 22, giaiDoan: 'giaDinh' },

  /* --- Giai đoạn con cái: chỉ xuất hiện khi đang nuôi con nhỏ --- */
  { id: 't27', ten: 'Mua bộ đồ chơi xếp hình cho con', emoji: '🧸', gia: 1 * TRIEU, diem: 5, giaiDoan: 'conCai' },
  { id: 't28', ten: 'Lớp học thêm tiếng Anh cho con', emoji: '📖', gia: 8 * TRIEU, diem: 10, giaiDoan: 'conCai' },
  { id: 't29', ten: 'Tiệc sinh nhật cho con ở nhà', emoji: '🎈', gia: 3 * TRIEU, diem: 8, giaiDoan: 'conCai' },
  { id: 't30', ten: 'Đưa con đi công viên nước cả ngày', emoji: '🎢', gia: 2.5 * TRIEU, diem: 6, giaiDoan: 'conCai' },
  { id: 't31', ten: 'Chiếc xe đạp đầu tiên cho con', emoji: '🚲', gia: 4 * TRIEU, diem: 7, giaiDoan: 'conCai' },
  { id: 't32', ten: 'Du lịch Đà Nẵng cùng các con', emoji: '✈️', gia: 20 * TRIEU, diem: 18, giaiDoan: 'conCai' },
  { id: 't33', ten: 'Sắm góc học tập mới cho con', emoji: '📚', gia: 15 * TRIEU, diem: 6, giaiDoan: 'conCai' },
  { id: 't91', ten: 'Đưa con đi tiêm phòng nhắc lại', emoji: '💉', gia: 1.8 * TRIEU, diem: 6, giaiDoan: 'conCai' },
  { id: 't92', ten: 'Sáng chủ nhật thả diều với con', emoji: '🪁', gia: 400_000, diem: 2, giaiDoan: 'conCai' },
  { id: 't93', ten: 'Mua sữa và bữa phụ cho con', emoji: '🥛', gia: 1.5 * TRIEU, diem: 5, giaiDoan: 'conCai' },
  { id: 't94', ten: 'Đưa đón con đi học mỗi ngày', emoji: '🛵', gia: 1.2 * TRIEU, diem: 4, giaiDoan: 'conCai' },
  { id: 't95', ten: 'Cho con học bơi ở bể gần nhà', emoji: '🤽', gia: 3 * TRIEU, diem: 10, giaiDoan: 'conCai' },
  { id: 't96', ten: 'Nuôi một chú chó nhỏ cho con', emoji: '🐶', gia: 5 * TRIEU, diem: 14, giaiDoan: 'conCai' },
  { id: 't97', ten: 'Chữa răng sâu cho con', emoji: '🦷', gia: 6 * TRIEU, diem: 8, giaiDoan: 'conCai' },
  { id: 't98', ten: 'Sắm đồng phục và cặp sách đầu năm', emoji: '🎒', gia: 2.5 * TRIEU, diem: 4, giaiDoan: 'conCai' },
  { id: 't99', ten: 'Cho con học võ suốt cả năm', emoji: '🥋', gia: 9 * TRIEU, diem: 15, giaiDoan: 'conCai' },
  { id: 't100', ten: 'Đưa con về quê chơi cả mùa hè', emoji: '🎏', gia: 10 * TRIEU, diem: 18, giaiDoan: 'conCai' },
  { id: 't101', ten: 'Mua máy tính bảng cho con', emoji: '📲', gia: 14 * TRIEU, diem: 5, giaiDoan: 'conCai' },
  { id: 't102', ten: 'Thuê người trông con ban ngày', emoji: '🤱', gia: 24 * TRIEU, diem: 10, giaiDoan: 'conCai' },
  { id: 't103', ten: 'Chạy đua cho con vào trường điểm', emoji: '🏫', gia: 40 * TRIEU, diem: 14, giaiDoan: 'conCai' },

  /* --- Giai đoạn tuổi già: chỉ xuất hiện từ tuổi 60 --- */
  { id: 't34', ten: 'Khám sức khoẻ tổng quát đầu năm', emoji: '🏥', gia: 10 * TRIEU, diem: 12, giaiDoan: 'tuoiGia' },
  { id: 't35', ten: 'Câu lạc bộ dưỡng sinh buổi sáng', emoji: '🌳', gia: 2 * TRIEU, diem: 8, giaiDoan: 'tuoiGia' },
  { id: 't36', ten: 'Chuyến du lịch chậm miền Tây sông nước', emoji: '⛵', gia: 15 * TRIEU, diem: 14, giaiDoan: 'tuoiGia' },
  { id: 't37', ten: 'Làm vườn trồng rau sau nhà', emoji: '🌱', gia: 3 * TRIEU, diem: 9, giaiDoan: 'tuoiGia' },
  { id: 't38', ten: 'Họp lớp bạn cũ sau mấy chục năm', emoji: '🍵', gia: 1.2 * TRIEU, diem: 7, giaiDoan: 'tuoiGia' },
  { id: 't39', ten: 'Ghế massage cho tấm lưng đã mỏi', emoji: '💆', gia: 30 * TRIEU, diem: 10, giaiDoan: 'tuoiGia' },
  { id: 't104', ten: 'Ngồi thiền ở thiền viện cuối tuần', emoji: '🛕', gia: 900_000, diem: 4, giaiDoan: 'tuoiGia' },
  { id: 't105', ten: 'Nuôi đôi chim hót trước hiên', emoji: '🐦', gia: 1.6 * TRIEU, diem: 6, giaiDoan: 'tuoiGia' },
  { id: 't106', ten: 'Viết lại chuyện đời cho con cháu', emoji: '📜', gia: 3 * TRIEU, diem: 12, giaiDoan: 'tuoiGia' },
  { id: 't107', ten: 'Vật lý trị liệu chữa khớp gối', emoji: '🦴', gia: 6 * TRIEU, diem: 15, giaiDoan: 'tuoiGia' },
  { id: 't108', ten: 'Gặp lại đồng đội một thời', emoji: '🎖️', gia: 4 * TRIEU, diem: 9, giaiDoan: 'tuoiGia' },
  { id: 't109', ten: 'Máy trợ thính nghe rõ tiếng cháu', emoji: '👂', gia: 12 * TRIEU, diem: 16, giaiDoan: 'tuoiGia' },
  { id: 't110', ten: 'Làm lại hàm răng để ăn ngon', emoji: '🍎', gia: 18 * TRIEU, diem: 14, giaiDoan: 'tuoiGia' },
  { id: 't111', ten: 'Cây cảnh dáng thế trước sân', emoji: '🪴', gia: 35 * TRIEU, diem: 13, giaiDoan: 'tuoiGia' },
  { id: 't112', ten: 'Chuyến tàu xuyên Việt khi còn đủ sức', emoji: '🚂', gia: 45 * TRIEU, diem: 18, giaiDoan: 'tuoiGia' },

  /* --- Giai đoạn ông bà: chỉ xuất hiện khi đã có cháu (v1.9) ---
   * Khác chặng tuổi già ở chỗ nó không nói về thân thể mình đang yếu đi, mà nói về
   * quan hệ với thế hệ thứ ba: niềm vui có cháu, và cả chuyện bị con cháu nhờ vả.
   * Chồng lên chặng gia đình và chặng tuổi già chứ không thay thế cái nào.
   */
  { id: 't113', ten: 'Dạy cháu học bài mỗi tối', emoji: '✏️', gia: 800_000, diem: 4, giaiDoan: 'ongBa' },
  { id: 't114', ten: 'Lì xì cháu ngày mùng một Tết', emoji: '🧧', gia: 1.8 * TRIEU, diem: 8, giaiDoan: 'ongBa' },
  { id: 't115', ten: 'Đưa cháu đi khu vui chơi cuối tuần', emoji: '🎠', gia: 2.5 * TRIEU, diem: 9, giaiDoan: 'ongBa' },
  { id: 't116', ten: 'Đặt tiệc thôi nôi cho cháu ở nhà hàng', emoji: '🍼', gia: 6 * TRIEU, diem: 3, giaiDoan: 'ongBa' },
  { id: 't117', ten: 'Trông cháu giúp con suốt mùa hè', emoji: '👶', gia: 12 * TRIEU, diem: 25, giaiDoan: 'ongBa' },
  { id: 't118', ten: 'Góp tiền làm giỗ tổ dòng họ', emoji: '🏺', gia: 15 * TRIEU, diem: 6, giaiDoan: 'ongBa' },
  { id: 't119', ten: 'Mua vàng để dành cho cháu', emoji: '🪙', gia: 24 * TRIEU, diem: 10, giaiDoan: 'ongBa' },
  { id: 't120', ten: 'Cả đại gia đình đi du lịch Hạ Long', emoji: '🚌', gia: 30 * TRIEU, diem: 22, giaiDoan: 'ongBa' },
  { id: 't121', ten: 'Dựng lại nhà thờ họ ở quê', emoji: '🧱', gia: 55 * TRIEU, diem: 20, giaiDoan: 'ongBa' },
  { id: 't122', ten: 'Góp tiền cho con mua nhà', emoji: '🏘️', gia: 80 * TRIEU, diem: 30, giaiDoan: 'ongBa' },
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

  /* ---------- Chung: bảo lãnh ---------- */
  {
    id: 'baoLanhNguoiThan',
    ten: 'Em trai nhờ đứng tên bảo lãnh',
    moTa:
      'Em trai vay ngân hàng mua nhà, thiếu người bảo lãnh. Nhận thì cả họ nể,' +
      ' từ chối thì mang tiếng. Nếu em ấy trả không nổi, ngân hàng sẽ tìm tới bạn.',
    emoji: '🤝',
    loai: 'baoLanh',
    gia: 0,
    namToiThieu: 10,
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

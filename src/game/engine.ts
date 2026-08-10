import { CONFIG } from './config'
import {
  CO_HOI,
  KHOA_HOC,
  NGHE,
  TAI_SAN,
  THE_TIEU_DUNG,
  UOC_NGUYEN,
  XE_UOC_NGUYEN_IDS,
  XUAT_THAN,
  timCoHoi,
  timKhoaHoc,
  timNghe,
  timTaiSan,
  timUocNguyen,
  timXuatThan,
} from './content'
import { dinhDangTien } from './format'
import type {
  Action,
  AssetId,
  CoHoi,
  DoanhNghiep,
  GameState,
  LoaiBaoHiemXe,
  Nghe,
  SuKien,
  TaiSan,
  TheTieuDung,
  Tien,
  TongKetNam,
  XuatThan,
} from './types'

/* ============================================================
 *  RNG tất định — trạng thái chỉ gồm (seed, cursor) nên
 *  serialize/khôi phục ván chơi không làm lệch kết quả.
 * ============================================================ */
export function taoRng(seed: number, cursor: number) {
  let c = cursor
  const next = () => {
    c++
    let t = (seed + c * 0x6d2b79f5) >>> 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    khoang: (min: number, max: number) => min + next() * (max - min),
    nguyen: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    chon<T>(arr: readonly T[]): T {
      return arr[Math.floor(next() * arr.length)]!
    },
    get cursor() {
      return c
    },
  }
}
type Rng = ReturnType<typeof taoRng>

/* ============================================================
 *  Hàm dẫn xuất — đọc trạng thái, không sửa
 * ============================================================ */

/** Giá hiện tại của một đơn vị tài sản. */
export const giaDonVi = (s: GameState, id: AssetId): Tien => s.giaTaiSan[id]

/** Tổng giá trị danh mục đầu tư. */
export function giaTriDauTu(s: GameState): Tien {
  return TAI_SAN.reduce((tong, ts) => tong + s.soHuu[ts.id] * s.giaTaiSan[ts.id], 0)
}

/** Tổng tài sản = tiền mặt + danh mục. Đây là con số dùng để xét thắng. */
export function tongTaiSan(s: GameState): Tien {
  return s.tienMat + giaTriDauTu(s)
}

/**
 * Mức thu nhập NỀN của một doanh nghiệp trong năm nay.
 * Thu nhập bám theo lạm phát kể từ năm góp vốn, nếu không thì sau vài chục năm
 * một doanh nghiệp từng đáng giá sẽ teo lại thành tiền lẻ.
 */
export function thuNhapNenNamNay(s: GameState, d: DoanhNghiep): Tien {
  return Math.round(d.thuNhapNen * (s.chiSoGia / d.chiSoGiaLucMua))
}

/** Tổng thu nhập thụ động nền năm nay, chưa áp biến động của từng ngành. */
export function thuNhapThuDong(s: GameState): Tien {
  return s.doanhNghiep.reduce((t, d) => t + thuNhapNenNamNay(s, d), 0)
}

/** Khoảng thu nhập thụ động có thể nhận năm nay, sau khi áp biên độ biến động. */
export function bienDoThuNhapThuDong(s: GameState): { thap: Tien; cao: Tien } {
  let thap = 0
  let cao = 0
  for (const d of s.doanhNghiep) {
    const nen = thuNhapNenNamNay(s, d)
    const coHoi = timCoHoi(d.coHoiId)
    thap += Math.max(0, Math.round(nen * (1 + (coHoi?.bienDongThuNhapMin ?? 0))))
    cao += Math.round(nen * (1 + (coHoi?.bienDongThuNhapMax ?? 0)))
  }
  return { thap, cao }
}

/** Tổng số tiền phải trả nợ mỗi năm. */
export function traNoMoiNam(s: GameState): Tien {
  return s.khoanVay.reduce((t, v) => t + v.thanhToanMoiNam, 0)
}

/**
 * Phí bảo hiểm y tế năm nay. Neo vào mức lớn hơn giữa lương và một phần chi phí
 * sinh hoạt (để lương hưu thấp không làm phí rẻ như cho), và leo theo tuổi già.
 */
export function phiBaoHiem(s: GameState): Tien {
  const ct = CONFIG.cotTruyen
  const tuoi = ct.tuoiBatDau + s.nam - 1
  const heSoTuoi =
    1 + Math.max(0, tuoi - ct.tuoiNghiHuu) * ct.baoHiemTangPhiMoiNamSauHuu
  const canCu = Math.max(s.luong, s.chiPhiHangNam * ct.baoHiemToiThieuTheoChiPhi)
  return Math.round(canCu * CONFIG.baoHiemTyLeLuong * heSoTuoi)
}

/** Tỉ lệ viện phí người chơi tự gánh dù đang có bảo hiểm (đồng trả tuổi già). */
export function tyLeDongTra(tuoi: number): number {
  const ct = CONFIG.cotTruyen
  return tuoi >= ct.baoHiemDongTraTuoi ? ct.baoHiemTyLeDongTra : 0
}

export const dangCoBaoHiem = (s: GameState): boolean => s.baoHiemDenNam >= s.nam

/* ---------- Tự do tài chính ----------
 * Đây là điều kiện thắng của game, thay cho con số tài sản cứng của các bản
 * trước. Vì cả hai vế đều tính theo mặt bằng giá của năm hiện tại, mục tiêu
 * tự chống lạm phát và tự khác nhau theo nghề mà không cần bảng tra nào.
 */

/** Lợi tức kỳ vọng mỗi năm của một kênh đầu tư — trung bình của biên độ. */
export const loiTucKyVong = (ts: TaiSan): number => (ts.loiTucMin + ts.loiTucMax) / 2

/**
 * Dòng tiền thụ động một năm: thu nhập nền của các doanh nghiệp cộng lợi tức
 * kỳ vọng của danh mục đầu tư.
 *
 * Dùng mức KỲ VỌNG chứ không phải số thực nhận của năm đó, để con số đứng yên
 * cho người chơi lên kế hoạch — thắng hay chưa không được phép nhảy qua lại
 * theo may rủi cổ tức. Hệ quả cố ý: vàng và tiền mã hoá lợi tức bằng 0 nên
 * không mua nổi tự do, dù chúng vẫn là kênh làm giàu và trú ẩn tốt.
 */
export function dongTienThuDong(s: GameState): Tien {
  const tuDanhMuc = TAI_SAN.reduce(
    (tong, ts) => tong + s.soHuu[ts.id] * s.giaTaiSan[ts.id] * loiTucKyVong(ts),
    0,
  )
  return Math.round(thuNhapThuDong(s) + tuDanhMuc)
}

/**
 * Nghĩa vụ tài chính một năm: sinh hoạt + bảo hiểm y tế + trả nợ.
 *
 * Phí bảo hiểm tính cả trong năm chưa mua — tự do tài chính mà bỏ bảo hiểm y
 * tế thì là tự do giả, và nếu miễn khoản này thì "nhịn bảo hiểm" sẽ thành mẹo
 * thắng sớm. Trả nợ cũng vào vế này, nếu không thì vay kịch trần mua doanh
 * nghiệp là con đường tắt tới chiến thắng.
 */
export function nghiaVuHangNam(s: GameState): Tien {
  return s.chiPhiHangNam + phiBaoHiem(s) + traNoMoiNam(s)
}

/** Mức dòng tiền thụ động cần đạt để được coi là tự do tài chính. */
export function mucTieuTuDo(s: GameState): Tien {
  return Math.round(nghiaVuHangNam(s) * CONFIG.tuDoTaiChinh.heSoAnToan)
}

/** Đã tự do tài chính hay chưa, xét tại thời điểm hiện tại. */
export const daTuDoTaiChinh = (s: GameState): boolean =>
  dongTienThuDong(s) >= mucTieuTuDo(s)

/** Tỉ lệ hoàn thành hành trình tự do tài chính, chặn trên ở 1. */
export function tienDoTuDo(s: GameState): number {
  const can = mucTieuTuDo(s)
  return can <= 0 ? 1 : Math.min(1, dongTienThuDong(s) / can)
}

/**
 * Nghĩa vụ của năm đầu tiên, tính thẳng từ định nghĩa nghề.
 * Màn chọn nghề cần con số này trước khi có ván nào tồn tại.
 */
export function nghiaVuNamDau(nghe: Nghe): Tien {
  const canCu = Math.max(
    nghe.luong,
    nghe.chiPhi * CONFIG.cotTruyen.baoHiemToiThieuTheoChiPhi,
  )
  return nghe.chiPhi + Math.round(canCu * CONFIG.baoHiemTyLeLuong)
}

/* ---------- Cột mốc tài sản ---------- */

/**
 * Bốn cột mốc tài sản của một nghề tại mặt bằng giá `chiSoGia`.
 * Mốc cao nhất là 25 lần chi phí sinh hoạt gốc — mặt kia của quy tắc rút 4% —
 * nên nghề sống đắt đỏ phải leo cột cao hơn hẳn nghề sống gọn.
 */
export function mocTaiSanCuaNghe(ngheId: string, chiSoGia = 1): Tien[] {
  const nghe = timNghe(ngheId)
  if (!nghe) return []
  const cm = CONFIG.mocTaiSan
  const caoNhat = nghe.chiPhi * cm.mocCaoNhatTheoChiPhi * chiSoGia
  return cm.tyLeCacMoc.map((tyLe) =>
    Math.max(
      cm.lamTronToi,
      Math.round((caoNhat * tyLe) / cm.lamTronToi) * cm.lamTronToi,
    ),
  )
}

/* ---------- Bảo hiểm xe ---------- */

const TY_LE_PHI_BAO_HIEM_XE: Record<LoaiBaoHiemXe, number> = {
  trachNhiemDanSu: CONFIG.baoHiemXe.tyLePhiTrachNhiemDanSu,
  vatChatXe: CONFIG.baoHiemXe.tyLePhiVatChatXe,
  taiNanNguoiTrenXe: CONFIG.baoHiemXe.tyLePhiTaiNanNguoiTrenXe,
}

/**
 * Chiếc xe giá trị nhất đang sở hữu, hoặc null nếu chưa có xe nào.
 * Có cả xe máy lẫn ô tô thì mọi tính toán bám theo chiếc đắt nhất — một hồ sơ
 * bảo hiểm duy nhất, không nhân đôi giao diện lẫn rủi ro.
 */
export function xeDangCo(
  s: GameState,
): { uocNguyenId: string; ten: string; emoji: string; giaTri: Tien } | null {
  for (const id of XE_UOC_NGUYEN_IDS) {
    if (!s.uocNguyenDaMua.includes(id)) continue
    const un = timUocNguyen(id)
    if (!un) continue
    return {
      uocNguyenId: id,
      ten: un.ten,
      emoji: un.emoji,
      // Giá ước nguyện khoá tại thời trẻ, nhưng giá trị xe để tính phí và mức
      // đền bù thì phải theo mặt bằng giá hiện hành.
      giaTri: giaThucTe(s, un.gia),
    }
  }
  return null
}

/** Phí một loại bảo hiểm xe cho năm nay. Đã gồm lạm phát, không nhân thêm lần nữa. */
export function phiBaoHiemXe(s: GameState, loai: LoaiBaoHiemXe): Tien {
  const xe = xeDangCo(s)
  if (!xe) return 0
  return Math.round(xe.giaTri * TY_LE_PHI_BAO_HIEM_XE[loai])
}

export const dangCoBaoHiemXe = (s: GameState, loai: LoaiBaoHiemXe): boolean =>
  s.baoHiemXe[loai] >= s.nam

/** Giá thực tế của một khoản chi sau khi tính lạm phát tích luỹ. */
export const giaThucTe = (s: GameState, giaGoc: Tien): Tien =>
  Math.round(giaGoc * s.chiSoGia)

/* ---------- Chuyên gia đồng hành ---------- */

/** Liệu trình tâm lý còn hiệu lực trong năm nay hay không. */
export const dangTriLieu = (s: GameState): boolean => s.triLieuDenNam >= s.nam

/** Số năm liệu trình còn lại, tính cả năm nay; hết hạn thì bằng 0. */
export const soNamTriLieuConLai = (s: GameState): number =>
  Math.max(0, s.triLieuDenNam - s.nam + 1)

/**
 * Điểm hạnh phúc mỗi năm của liệu trình thứ `soLan`, nhạt dần: 8 → 6 → 4 → 3 → 3…
 *
 * `soLan` đếm CẢ liệu trình đang chạy (lần đầu là 1) nên lần đầu chưa bị trừ điểm
 * nào — reducer đã tăng `soLanTriLieu` ngay lúc thuê. Chuỗi nhạt dần mô phỏng việc
 * DÙNG TRỊ LIỆU ĐỂ THAY CHO THAY ĐỔI NẾP SỐNG: mua thêm một liệu trình mà hoàn cảnh
 * gây kiệt sức vẫn nguyên vẹn thì lần sau nhạt hơn lần trước. Đây là luật chơi, không
 * phải nhận định về hiệu quả trị liệu ngoài đời. Về mặt cân bằng, cái sàn ở cuối
 * chuỗi chặn chiến thuật "cứ có tiền thì mua hạnh phúc mãi mãi".
 */
export function hoiPhucTriLieu(soLan: number): number {
  const tl = CONFIG.chuyenGia.tamLy
  const daQua = Math.max(0, soLan - 1)
  return Math.max(
    tl.hanhPhucToiThieu,
    tl.hanhPhucMoiNam - daQua * tl.giamHieuQuaMoiLan,
  )
}

/**
 * Đã thuê chuyên gia hoạch định tài chính chưa — cả ván chỉ được một lần.
 *
 * Đọc CỜ chứ không suy ra từ `heSoToiUuChiPhi < 1`. Suy ngược từ hệ số thì cái
 * chốt "một lần" phụ thuộc vào việc `giamChiPhi` có nằm trong khoảng (0, 1) hay
 * không: đặt `giamChiPhi: 0` để tắt gói khi đo lại cân bằng là việc hợp lệ với
 * `config.ts`, mà làm thế thì hàm này trả `false` vĩnh viễn và người chơi bấm
 * thuê được bao nhiêu lần tuỳ tiền, mỗi lần cộng thêm hạnh phúc ngay.
 */
export const daToiUuChiPhi = (s: GameState): boolean => s.daThueChuyenGiaTaiChinh

/**
 * Chi phí sinh hoạt của năm nay NẾU chưa từng thuê chuyên gia hoạch định tài chính.
 *
 * Dựng đúng tích mà bước 10 của `chuyenNam` đang dùng, chỉ bỏ đi `heSoToiUuChiPhi`.
 * Có hàm dùng chung ở đây thì hai màn Trang chủ và Sổ sách không còn tự nhân lại
 * mỗi nơi một kiểu — thêm một hệ số vào chi phí sinh hoạt ở bản sau là sửa đúng
 * hai chỗ (bước 10 và hàm này) chứ không phải đi tìm khắp lớp giao diện.
 */
export function chiPhiChuaToiUu(s: GameState): Tien {
  return Math.round((timNghe(s.ngheId)?.chiPhi ?? 0) * s.chiSoGia * s.heSoChiPhi)
}

/**
 * Phần giảm chi phí đã thật sự vào sổ của năm nay hay chưa.
 *
 * Cờ tối ưu bật lên ngay giây bấm thuê, còn `chiPhiHangNam` thì cả ván chỉ được
 * tính lại trong `chuyenNam`. Suốt phần còn lại của năm thuê, con số người chơi
 * đang nhìn vẫn là chi phí CHƯA giảm — nên mọi câu chữ khoe "đang tiết kiệm" đều
 * phải hỏi hàm này trước, nếu không hai màn hình sẽ nói ngược nhau về đúng món
 * đắt nhất của bản này.
 */
export const toiUuDaVaoSo = (s: GameState): boolean =>
  s.chiPhiHangNam < chiPhiChuaToiUu(s)

/**
 * Đang thuộc diện chương trình hỗ trợ (giảm nửa phí cả hai gói) hay không.
 *
 * Điều kiện là CỜ kiệt sức chứ KHÔNG phải mức hạnh phúc hiện tại. Cờ được chốt một
 * lần ở Tổng kết năm TRƯỚC rồi đứng yên suốt năm nay, nên người chơi không tự tạo
 * được điều kiện giảm giá ngay trong lượt của mình — nếu đọc `s.hanhPhuc` sống thì
 * chỉ cần từ chối vài tấm thẻ cho hạnh phúc rơi xuống dưới ngưỡng là mua được giá
 * rẻ, và thứ tự bấm nút cũng đổi được tổng tiền phải trả (gói tài chính cộng hạnh
 * phúc ngay lúc thuê nên mua nó trước có thể đẩy hạnh phúc lên trên ngưỡng, làm gói
 * tâm lý mất phần giảm giá). Đọc cờ còn đúng với câu chuyện hơn: chương trình hỗ trợ
 * của cơ quan và cộng đồng xét trên một năm đã qua, không theo tâm trạng lúc bấm nút.
 *
 * ĐÁNH ĐỔI ĐÃ BIẾT, cố ý giữ nguyên: cờ chỉ được xét lại trong `chuyenNam` nên nó
 * đứng yên suốt năm sau bất kể hạnh phúc leo lên tới đâu. Người chơi hiểu luật vẫn
 * mở khoá được giá nửa bằng cách khép MỘT năm dưới ngưỡng cảnh báo rồi cả năm kế
 * tiếp mua gì cũng rẻ một nửa — hạnh phúc trên 60 không có công dụng nào khác ngoài
 * làm vùng đệm, nên vứt vài điểm gần như không mất gì. Thêm vế `s.hanhPhuc <
 * hanhPhucNguongCanhBao` sẽ bịt đường ấy nhưng mở lại đúng hai cửa mà đoạn trên vừa
 * đóng: thứ tự bấm nút đổi được tổng tiền phải trả, và giữ hạnh phúc thấp giữa pha
 * thẻ bài lại thành có lợi. Đổi một lỗ hổng lấy hai lỗ hổng thì không đáng, nên luật
 * giữ nguyên và khoảng trống này được ghi thẳng vào đặc tả (docs/05 mục B) để bản
 * sau cân lại giá gói tài chính theo mức nửa phí chứ không theo mức đầy.
 */
export const dangDuocHoTro = (s: GameState): boolean => s.daCanhBaoKietSuc

/** Hệ số phí dùng chung cho cả hai gói: đang được hỗ trợ thì còn một nửa. */
const heSoPhiChuyenGia = (s: GameState): number =>
  dangDuocHoTro(s) ? CONFIG.chuyenGia.heSoGiamPhiKhiKietSuc : 1

/**
 * Phí trọn gói liệu trình tâm lý, trả một lần lúc thuê.
 *
 * Nhân THẲNG với `chiPhiHangNam` — con số này đã gồm chỉ số giá — nên tuyệt đối
 * không bọc thêm `giaThucTe`, y như `phiBaoHiemXe` đang làm; bọc thêm là lạm phát
 * bị tính hai lần. Giao diện phải gọi đúng hàm này, nếu không nút sẽ hiện một giá
 * mà engine lại trừ một giá khác.
 */
export function phiChuyenGiaTamLy(s: GameState): Tien {
  return Math.round(
    s.chiPhiHangNam *
      CONFIG.chuyenGia.tamLy.tyLePhiTheoChiPhi *
      heSoPhiChuyenGia(s),
  )
}

/** Phí gói hoạch định tài chính, cũng tính thẳng trên chi phí sinh hoạt năm nay. */
export function phiChuyenGiaTaiChinh(s: GameState): Tien {
  return Math.round(
    s.chiPhiHangNam *
      CONFIG.chuyenGia.taiChinh.tyLePhiTheoChiPhi *
      heSoPhiChuyenGia(s),
  )
}

/**
 * Trần khoản vay: tổng thanh toán hàng năm không vượt quá
 * `tyLeThanhToanToiDa` × lương. Trả góp đều gốc + lãi đơn theo kỳ hạn.
 */
export function thanhToanMoiNamCuaKhoanVay(goc: Tien, kyHan: number): Tien {
  return Math.round((goc * (1 + CONFIG.laiSuatVay * kyHan)) / kyHan)
}

export function vayToiDa(s: GameState, kyHan: number): Tien {
  const tranThanhToan = s.luong * CONFIG.tyLeThanhToanToiDa - traNoMoiNam(s)
  if (tranThanhToan <= 0) return 0
  const goc = (tranThanhToan * kyHan) / (1 + CONFIG.laiSuatVay * kyHan)
  return Math.max(0, Math.floor(goc))
}

/** Số đơn vị tối đa mua được của một tài sản với số tiền mặt hiện có. */
export function muaToiDa(s: GameState, id: AssetId): number {
  return Math.floor(s.tienMat / s.giaTaiSan[id])
}

/**
 * Cộng hạnh phúc có lợi ích giảm dần.
 * Phần vượt `tranMem` chỉ ăn `heSoVuotTran`, và không bao giờ vượt `tranCung`.
 * Điểm trừ thì áp dụng nguyên vẹn.
 */
export function themHanhPhuc(hienTai: number, delta: number): number {
  if (delta <= 0) return Math.max(0, hienTai + delta)
  const { hanhPhucTranMem, hanhPhucHeSoVuotTran, hanhPhucTranCung } = CONFIG
  let conLai = delta
  let kq = hienTai
  if (kq < hanhPhucTranMem) {
    const phanDuoi = Math.min(conLai, hanhPhucTranMem - kq)
    kq += phanDuoi
    conLai -= phanDuoi
  }
  if (conLai > 0) kq += conLai * hanhPhucHeSoVuotTran
  return Math.min(hanhPhucTranCung, Math.round(kq))
}

/** Hạnh phúc cộng thêm mỗi năm từ các món ước nguyện đã mua. */
export function hanhPhucTuUocNguyen(s: GameState): number {
  return s.uocNguyenDaMua.reduce(
    (t, id) => t + (timUocNguyen(id)?.hanhPhucMoiNam ?? 0),
    0,
  )
}

export const daDatKhatVong = (s: GameState): boolean =>
  s.uocNguyenDaMua.includes(s.khatVongId)

/**
 * Giá phải trả cho một món ước nguyện năm nay.
 *
 * Giá đóng băng thời trẻ chỉ áp cho lần mua ĐẦU TIÊN — đó là giấc mơ, và giấc mơ
 * không nên chạy nhanh hơn khả năng tích luỹ. Nhưng chiếc xe đã bị trộm mà muốn
 * có lại thì phải mua bằng tiền của hôm nay; nếu không, bỏ bảo hiểm vật chất xe
 * rồi mua lại xe với giá thời trẻ sẽ luôn rẻ hơn đóng phí, và cả bài học về bảo
 * hiểm bị lật ngược.
 */
export function giaUocNguyen(s: GameState, uocNguyenId: string): Tien {
  const un = timUocNguyen(uocNguyenId)
  if (!un) return 0
  return s.uocNguyenDaMat.includes(uocNguyenId) ? giaThucTe(s, un.gia) : un.gia
}

/* ---------- Cốt truyện trăm năm ---------- */

/** Tuổi của nhân vật ở năm thứ `nam` (năm 1 = tuổi bắt đầu). */
export const tuoiTaiNam = (nam: number): number =>
  CONFIG.cotTruyen.tuoiBatDau + nam - 1

export const tuoiHienTai = (s: GameState): number => tuoiTaiNam(s.nam)

/** Số con còn đang nuôi (chưa tới tuổi tự lập) tính tại năm `nam`. */
export function soConDangNuoi(conCai: readonly number[], nam: number): number {
  return conCai.filter((namSinh) => nam - namSinh < CONFIG.cotTruyen.conTuoiTuLap)
    .length
}

/**
 * Hệ số chi phí cố định ở năm `nam`. Gom TẤT CẢ hệ số nhân vào chi phí sinh hoạt
 * về một chỗ: hoàn cảnh gia đình, xuất thân, phụng dưỡng bố mẹ và lối sống theo
 * bậc lương. Rải chúng ra nhiều nơi thì không ai tra được vì sao chi phí của mình
 * khác con số gốc của nghề.
 *
 * Hai tham số cuối để tuỳ chọn: mọi lời gọi ba tham số có từ trước v1.6 vẫn đúng
 * vì viên chức tỉnh lẻ và bậc lương 1 đều trung tính.
 */
export function tinhHeSoChiPhi(
  daKetHon: boolean,
  conCai: readonly number[],
  nam: number,
  xuatThan: XuatThan = XUAT_THAN[1]!,
  heSoLuongKhoiDiem = 1,
): number {
  const ct = CONFIG.cotTruyen
  const conPhungDuong =
    xuatThan.tyLePhungDuong > 0 && tuoiTaiNam(nam) <= xuatThan.phungDuongDenTuoi
  return (
    (1 + (daKetHon ? ct.cuoiTangChiPhi : 0)) *
    Math.pow(1 + ct.conTangChiPhi, soConDangNuoi(conCai, nam)) *
    xuatThan.heSoChiPhiSong *
    (conPhungDuong ? 1 + xuatThan.tyLePhungDuong : 1) *
    (1 + (heSoLuongKhoiDiem - 1) * CONFIG.xuatThan.loiSongTheoLuong)
  )
}

/**
 * Xuất thân đang áp dụng cho ván chơi hiện tại.
 *
 * TẠM THỜI: `GameState` chưa có trường `xuatThanId` (việc của Task 2), nên đọc
 * phòng thủ qua ép kiểu cục bộ. Khi Task 2 thêm trường thật vào `GameState`,
 * chữ ký hàm này giữ nguyên và phần ép kiểu phòng thủ có thể bỏ đi.
 */
export const xuatThanHienTai = (s: GameState): XuatThan =>
  timXuatThan((s as { xuatThanId?: string }).xuatThanId ?? '') ?? XUAT_THAN[1]!

/**
 * Điểm hạnh phúc mỗi năm do bậc lương — âm khi chọn lương cao, dương khi chọn
 * lương thấp. Tắt hẳn sau khi nghỉ hưu: không còn đi làm thì không còn áp lực.
 *
 * TẠM THỜI: `GameState` chưa có trường `heSoLuongKhoiDiem` (việc của Task 2),
 * nên đọc phòng thủ qua ép kiểu cục bộ giống `xuatThanHienTai`.
 */
export function apLucCongViec(s: GameState): number {
  if (s.daNghiHuu) return 0
  const heSoLuongKhoiDiem = (s as { heSoLuongKhoiDiem?: number }).heSoLuongKhoiDiem ?? 1
  return Math.round((1 - heSoLuongKhoiDiem) * CONFIG.xuatThan.apLucTheoLuong)
}

/* ============================================================
 *  Khởi tạo ván mới
 * ============================================================ */

interface BoiCanhRutThe {
  daKetHon: boolean
  conCai: readonly number[]
  nam: number
  /** id các thẻ đã rút năm trước — loại khỏi bộ rút để tránh lặp */
  loaiTru: readonly string[]
}

function rutThe(rng: Rng, soLuong: number, boiCanh: BoiCanhRutThe): TheTieuDung[] {
  const tuoi = tuoiTaiNam(boiCanh.nam)
  // Thẻ con nhỏ chỉ hợp khi còn con dưới tuổi thiếu niên; con 18-20 tuổi mà
  // rút "chiếc xe đạp đầu tiên cho con" thì hỏng mạch truyện.
  const coConNho = boiCanh.conCai.some(
    (namSinh) => boiCanh.nam - namSinh < CONFIG.cotTruyen.conTuoiToiDaTheConNho,
  )
  const con = THE_TIEU_DUNG.filter((t) => {
    if (boiCanh.loaiTru.includes(t.id)) return false
    if (t.tuoiToiDa !== undefined && tuoi > t.tuoiToiDa) return false
    if (t.giaiDoan === 'giaDinh') return boiCanh.daKetHon
    if (t.giaiDoan === 'conCai') return coConNho
    if (t.giaiDoan === 'tuoiGia') return tuoi >= CONFIG.cotTruyen.tuoiNghiHuu
    return true
  })
  const kq: TheTieuDung[] = []
  for (let i = 0; i < soLuong && con.length > 0; i++) {
    const idx = Math.floor(rng.next() * con.length)
    kq.push(con.splice(idx, 1)[0]!)
  }
  return kq
}

interface BoiCanhCoHoi {
  ngheId: string
  nam: number
  coHoiDaLam: readonly string[]
}

function hopLe(c: CoHoi, bc: BoiCanhCoHoi): boolean {
  if (c.ngheId !== undefined && c.ngheId !== bc.ngheId) return false
  if (c.namToiThieu !== undefined && bc.nam < c.namToiThieu) return false
  if (c.chiMotLan && bc.coHoiDaLam.includes(c.id)) return false
  return true
}

/** Cơ hội có hợp lệ với nghề, thâm niên và lịch sử tham gia của ván này không. */
export const coHoiHopLe = (c: CoHoi, s: GameState): boolean =>
  hopLe(c, { ngheId: s.ngheId, nam: s.nam, coHoiDaLam: s.coHoiDaLam })

/**
 * Rút cơ hội của năm. Suất đầu tiên ưu tiên lấy từ bộ cơ hội riêng của nghề đang
 * chơi, để mỗi nghề có một mạch sự nghiệp riêng thay vì ai cũng gặp cùng một
 * danh sách; các suất còn lại lấy từ bộ chung. Bên nào cạn thì bên kia lấp chỗ.
 */
function rutCoHoi(rng: Rng, soLuong: number, bc: BoiCanhCoHoi): CoHoi[] {
  const duocPhep = CO_HOI.filter((c) => hopLe(c, bc))
  const rieng = duocPhep.filter((c) => c.ngheId !== undefined)
  const chung = duocPhep.filter((c) => c.ngheId === undefined)
  const kq: CoHoi[] = []

  const rutTu = (bo: CoHoi[]) => {
    const idx = Math.floor(rng.next() * bo.length)
    kq.push(bo.splice(idx, 1)[0]!)
  }

  if (soLuong > 0 && rieng.length > 0) rutTu(rieng)
  while (kq.length < soLuong && chung.length > 0) rutTu(chung)
  while (kq.length < soLuong && rieng.length > 0) rutTu(rieng)
  return kq
}

export function taoGameMoi(ngheId: string, seed = Math.floor(Math.random() * 1e9)): GameState {
  const nghe = timNghe(ngheId) ?? NGHE[0]!
  const rng = taoRng(seed, 0)
  const ct = CONFIG.cotTruyen

  // Hẹn lịch cột mốc đời người ngay từ đầu ván — tất định theo seed.
  const namCuoi = rng.nguyen(ct.cuoiTuoiSomNhat, ct.cuoiTuoiMuonNhat) - ct.tuoiBatDau + 1
  const namCon1 = namCuoi + rng.nguyen(ct.conSauCuoiMin, ct.conSauCuoiMax)
  const namCon2 = namCon1 + rng.nguyen(ct.con2SauCon1Min, ct.con2SauCon1Max)

  const giaTaiSan = {} as Record<AssetId, Tien>
  const soHuu = {} as Record<AssetId, number>
  const lichSuGia = {} as Record<AssetId, Tien[]>
  for (const ts of TAI_SAN) {
    giaTaiSan[ts.id] = ts.giaDonVi
    soHuu[ts.id] = 0
    // Dựng chuỗi giá "quá khứ" bằng cách đi lùi từ giá năm 1, biên độ mỗi
    // bước tỉ lệ theo độ biến động thật của tài sản nhưng chặn ở ±15% để
    // chỉ số thay đổi hiển thị năm đầu không bị thổi phồng phi lý.
    const bienDoQuaKhu = Math.min(0.15, (ts.bienDongMax - ts.bienDongMin) / 4)
    const quaKhu: Tien[] = [ts.giaDonVi]
    for (let i = 0; i < CONFIG.soDiemGiaQuaKhu; i++) {
      const bienDong = rng.khoang(-bienDoQuaKhu, bienDoQuaKhu)
      const giaTruoc = Math.max(1, Math.round(quaKhu[0]! / (1 + bienDong)))
      quaKhu.unshift(giaTruoc)
    }
    lichSuGia[ts.id] = quaKhu
  }

  const theConLai = rutThe(rng, rng.nguyen(CONFIG.soTheMoiNamMin, CONFIG.soTheMoiNamMax), {
    daKetHon: false,
    conCai: [],
    nam: 1,
    loaiTru: [],
  })
  const coHoiNamNay = rutCoHoi(rng, CONFIG.soCoHoiMoiNam, {
    ngheId: nghe.id,
    nam: 1,
    coHoiDaLam: [],
  })

  return {
    seed,
    rngCursor: rng.cursor,
    nam: 1,
    phase: 'chiPhi',
    ngheId: nghe.id,
    khatVongId: nghe.khatVongId,

    tienMat: nghe.luong,
    hanhPhuc: CONFIG.hanhPhucBanDau,
    luong: nghe.luong,
    chiPhiHangNam: nghe.chiPhi,
    chiSoGia: 1,
    heSoChiPhi: 1,
    daTraChiPhiNamNay: false,

    soHuu,
    giaTaiSan,
    lichSuGia,

    khoaHocDaMua: [],
    uocNguyenDaMua: [],
    uocNguyenDaMat: [],
    baoHiemDenNam: -1,
    baoHiemXe: { trachNhiemDanSu: -1, vatChatXe: -1, taiNanNguoiTrenXe: -1 },

    triLieuDenNam: -1,
    soLanTriLieu: 0,
    daCanhBaoKietSuc: false,
    daThueChuyenGiaTaiChinh: false,
    heSoToiUuChiPhi: 1,

    khoanVay: [],
    doanhNghiep: [],
    coHoiDaLam: [],
    khoanDangCho: [],

    cotTruyen: { namCuoi, namSinhCon: [namCon1, namCon2] },
    daKetHon: false,
    conCai: [],
    daNghiHuu: false,
    daTuDo: false,
    mocTaiSanDaQua: [],
    theNamTruoc: theConLai.map((t) => t.id),

    theConLai,
    coHoiNamNay,

    tongKet: null,
    lichSu: [],

    trangThai: 'dangChoi',
  }
}

/* ============================================================
 *  Chuyển năm — nơi tập trung toàn bộ toán kinh tế
 * ============================================================ */

/** Phần trăm kiểu Việt Nam dùng trong lời kể sự kiện: 4,3 chứ không phải 4.3 */
const soPhanTram = (v: number): string => (v * 100).toFixed(1).replace('.', ',')

/** Chuyện đời thường của tuổi già — buồn vui đan xen, không dính tới tiền bạc. */
const CHUYEN_TUOI_GIA = [
  {
    tieuDe: 'Người bạn cũ ra đi',
    moTa: 'Một người bạn thân thời đi làm qua đời. Bạn ngồi lặng rất lâu sau đám tang.',
    hanhPhuc: -8,
  },
  {
    tieuDe: 'Cháu về chơi cả mùa hè',
    moTa: 'Nhà bỗng rộn tiếng trẻ con. Bạn dạy cháu tưới cây và kể chuyện ngày xưa.',
    hanhPhuc: 12,
  },
  {
    tieuDe: 'Viết lại chuyện đời mình',
    moTa: 'Bạn ngồi ghi lại hành trình mấy chục năm qua cho con cháu đọc.',
    hanhPhuc: 8,
  },
  {
    tieuDe: 'Đầu gối trở trời',
    moTa: 'Xương khớp không còn nghe lời như trước, đi lại chậm hẳn đi.',
    hanhPhuc: -5,
  },
  {
    tieuDe: 'Họp lớp sau nửa thế kỷ',
    moTa: 'Những mái đầu bạc gặp lại nhau, nhắc tên nhau vẫn đúng như thuở đôi mươi.',
    hanhPhuc: 10,
  },
] as const

/**
 * Ba nhịp của một liệu trình tâm lý, kể theo đúng thứ tự năm thứ nhất → thứ ba.
 * Đây là mảng có THỨ TỰ chứ không phải bộ rút ngẫu nhiên như `CHUYEN_TUOI_GIA`:
 * người chơi phải thấy được liệu trình tiến triển thì mới tin nó đáng tiền.
 *
 * Xuất ra ngoài để bài kiểm thử canh được hai thứ mà cái kẹp `Math.min(Math.max(…))`
 * ở dưới sẽ nuốt im lặng: đúng thứ tự ba năm, và độ dài mảng phải khớp với
 * `soNamLieuTrinh` — lệch nhau thì năm cuối kể lại chuyện của năm trước.
 *
 * Độ dài mỗi đoạn giữ quanh mức 20–25 chữ cho bằng nếp của các đoạn kể sẵn có:
 * chúng nằm chung một danh sách trên bảng Tổng kết, đoạn nào dài gấp đôi là lộ ngay.
 */
export const CHUYEN_TRI_LIEU = [
  {
    tieuDe: 'Buổi trị liệu đầu tiên',
    moTa: 'Bạn ngồi im gần hết giờ đầu, không biết bắt đầu từ đâu. Rồi thứ vẫn đè lên ngực mỗi sáng cũng được gọi đúng tên: bạn không lười, bạn đang kiệt sức.',
  },
  {
    tieuDe: 'Dựng lại nếp sinh hoạt',
    moTa: 'Chuyên gia không bàn chuyện lớn lao, chỉ cùng bạn sắp lại từng việc nhỏ: ngủ trước mười một giờ, sáng đi bộ hai mươi phút, và bớt ôm việc vào người.',
  },
  {
    tieuDe: 'Buổi trị liệu cuối cùng',
    moTa: 'Chuyên gia nói bạn đã đủ vững để tự đi tiếp, và dặn cứ quay lại bất cứ lúc nào thấy cần. Bạn ra về nhẹ tênh, mang theo những cách tự chăm mình cho những năm sau.',
  },
] as const

/**
 * Dấu hiệu kiệt sức đời thường, rút ngẫu nhiên khi hạnh phúc rơi dưới ngưỡng
 * cảnh báo. Sự kiện này chỉ KỂ — không đổi tiền cũng không đổi hạnh phúc — vì
 * nhiệm vụ của nó là gõ cửa nhắc người chơi trước khi quá muộn.
 *
 * Khác `rutThe` và `CHUYEN_TUOI_GIA`, bộ này rút bằng `rng.chon` KHÔNG kèm bộ lọc
 * hoàn cảnh nào — ván chơi kéo từ tuổi 21 tới 100 nên bất kỳ đoạn nào cũng có thể
 * rơi vào người độc thân năm thứ ba, hoặc cụ ông bảy mươi lăm đã lên chức ông bà.
 * Vì vậy mọi chi tiết ở đây phải trung tính: không nhắc con cái, không xưng hô theo
 * vai vế, không giả định nhân vật còn đi làm.
 */
const CHUYEN_KIET_SUC = [
  {
    tieuDe: 'Sáng nào cũng thấy nặng nề',
    moTa: 'Chuông báo thức reo, bạn nằm thêm hai mươi phút chỉ vì chưa muốn bắt đầu một ngày nữa. Bạn bè bảo hay là đi gặp một chuyên gia tâm lý thử xem.',
  },
  {
    tieuDe: 'Người thân nhận ra bạn ít cười hẳn',
    moTa: 'Bữa cơm tối nhà bạn dạo này lặng lẽ lạ. Có người trong nhà nói thẳng ra: dạo này thấy bạn ít cười hẳn. Có lẽ đã đến lúc tìm người nghe mình nói.',
  },
  {
    tieuDe: 'Đêm nằm mãi không ngủ được',
    moTa: 'Cứ tắt đèn là đầu lại quay về mấy con số: khoản phải trả tháng tới, chỗ tiền còn thiếu, những thứ chưa biết xoay đâu ra. Ba giờ sáng bạn vẫn mở mắt nhìn trần nhà.',
  },
  {
    tieuDe: 'Việc gì cũng thấy quá sức',
    moTa: 'Những việc trước đây làm trong một buổi thì nay bạn dời hết ngày này sang ngày khác.',
  },
] as const

function chuyenNam(s: GameState): GameState {
  const rng = taoRng(s.seed, s.rngCursor)
  const suKien: SuKien[] = []
  let tienMat = s.tienMat
  let hanhPhuc = s.hanhPhuc

  /**
   * Cộng hạnh phúc và trả về số điểm THỰC nhận sau khi áp trần mềm/trần cứng/sàn 0.
   * Sự kiện phải kể đúng số điểm thật, không kể con số danh nghĩa.
   */
  const apHanhPhuc = (delta: number): number => {
    const truoc = hanhPhuc
    hanhPhuc = themHanhPhuc(hanhPhuc, delta)
    return hanhPhuc - truoc
  }

  /* --- 1. Lạm phát của năm --- */
  const lamPhat = rng.khoang(CONFIG.lamPhatMin, CONFIG.lamPhatMax)

  /* --- 2. Lợi tức tài sản, tính trên giá TRƯỚC khi biến động --- */
  const giaMoi = { ...s.giaTaiSan }
  const lichSuGia = { ...s.lichSuGia }
  const bienDongTaiSan: TongKetNam['bienDongTaiSan'] = []

  for (const ts of TAI_SAN) {
    const giaCu = s.giaTaiSan[ts.id]
    const soLuong = s.soHuu[ts.id]

    const tyLeLoiTuc = rng.khoang(ts.loiTucMin, ts.loiTucMax)
    const loiTuc = Math.round(soLuong * giaCu * tyLeLoiTuc)
    tienMat += loiTuc

    let bienDong = rng.khoang(ts.bienDongMin, ts.bienDongMax)
    if (ts.bamLamPhat) bienDong += lamPhat
    giaMoi[ts.id] = Math.max(1, Math.round(giaCu * (1 + bienDong)))
    lichSuGia[ts.id] = [...(s.lichSuGia[ts.id] ?? []), giaMoi[ts.id]].slice(-15)

    // Ghi lại CẢ NĂM kênh kèm cờ đang nắm giữ. Bảng tổng kết dựa vào cờ này để
    // tách "danh mục của bạn" khỏi "tin thị trường" — trước đây cổ phiếu bị nhét
    // thẳng vào danh mục kể cả khi người chơi không sở hữu cổ phiếu nào.
    bienDongTaiSan.push({
      id: ts.id,
      ten: ts.ten,
      bienDong,
      loiTuc,
      dangNamGiu: soLuong > 0,
    })
  }

  /* --- 3. Thu nhập thụ động từ doanh nghiệp + đóng góp của bạn đời ---
   * Thu nhập mỗi doanh nghiệp = mức nền (đã bám lạm phát từ năm góp vốn)
   * nhân với biến động của năm, lấy trong biên độ riêng của ngành. Năm tệ nhất
   * là không thu được đồng nào chứ doanh nghiệp không gây lỗ.
   */
  const thuNhapDoanhNghiep: TongKetNam['thuNhapDoanhNghiep'] = []
  let thuDong = 0
  for (const d of s.doanhNghiep) {
    const coHoi = timCoHoi(d.coHoiId)
    const nen = thuNhapNenNamNay(s, d)
    const bienDong = rng.khoang(
      coHoi?.bienDongThuNhapMin ?? 0,
      coHoi?.bienDongThuNhapMax ?? 0,
    )
    const soTien = Math.max(0, Math.round(nen * (1 + bienDong)))
    thuDong += soTien
    thuNhapDoanhNghiep.push({ coHoiId: d.coHoiId, ten: d.ten, soTien, bienDong })
  }
  tienMat += thuDong
  const thuNhapBanDoi = s.daKetHon
    ? Math.round(s.luong * CONFIG.cotTruyen.cuoiThuNhapBanDoi)
    : 0
  tienMat += thuNhapBanDoi

  /* --- 4. Trả nợ --- */
  let khoanVay = s.khoanVay
    .map((v) => ({ ...v, namConLai: v.namConLai - 1 }))
    .filter((v) => v.namConLai >= 0)
  const phaiTra = s.khoanVay.reduce((t, v) => t + v.thanhToanMoiNam, 0)
  tienMat -= phaiTra
  khoanVay = khoanVay.filter((v) => v.namConLai > 0)

  /* --- 5. Mở kết quả các khoản đang chờ: canh bạc và tổ chức sự kiện --- */
  for (const cuoc of s.khoanDangCho) {
    const coHoi = timCoHoi(cuoc.coHoiId)
    if (!coHoi) continue

    // Tổ chức sự kiện là công sức chứ không phải may rủi: luôn thu lại vốn
    // cộng trừ một biên lợi nhuận, không bao giờ mất trắng.
    if (cuoc.loai === 'toChucSuKien') {
      const tyLe = rng.khoang(coHoi.loiNhuanMin ?? 0, coHoi.loiNhuanMax ?? 0)
      const tienVe = Math.round(cuoc.gia * (1 + tyLe))
      tienMat += tienVe
      suKien.push({
        loai: 'suKienKetQua',
        tieuDe: tyLe >= 0 ? `${coHoi.ten} có lãi` : `${coHoi.ten} lỗ vốn`,
        moTa:
          tyLe >= 0
            ? `Mọi thứ diễn ra trót lọt, lãi ${soPhanTram(tyLe)}% trên vốn bỏ ra. Khoản này kết thúc tại đây, không có thu nhập các năm sau.`
            : `Không đông khách như tính toán, lỗ ${soPhanTram(-tyLe)}% vốn bỏ ra. Khoản này kết thúc tại đây.`,
        tienThayDoi: tienVe - cuoc.gia,
        hanhPhucThayDoi: 0,
      })
      continue
    }

    const thang = rng.next() < (coHoi.xacSuatThang ?? 0)
    const tienVe = thang ? Math.round(cuoc.gia * (coHoi.heSoNhan ?? 0)) : 0
    tienMat += tienVe
    suKien.push({
      loai: 'canhBacKetQua',
      tieuDe: thang ? `${coHoi.ten} thắng lớn` : `${coHoi.ten} mất trắng`,
      moTa: thang
        ? `Khoản đặt cược nhân ${coHoi.heSoNhan} lần.`
        : 'Khoản đặt cược bốc hơi hoàn toàn.',
      tienThayDoi: tienVe - cuoc.gia,
      hanhPhucThayDoi: 0,
    })
  }

  /* --- 6. Cột mốc cuộc đời theo kịch bản --- */
  const ct = CONFIG.cotTruyen
  const tuoiNamNay = tuoiTaiNam(s.nam)
  let daKetHon = s.daKetHon
  let conCai = s.conCai
  let daNghiHuu = s.daNghiHuu
  let nghiHuuNamNay = false

  // Lễ cưới
  if (!daKetHon && s.nam >= s.cotTruyen.namCuoi) {
    daKetHon = true
    const chiPhiCuoi = Math.round(s.chiPhiHangNam * ct.cuoiChiPhiTheoChiPhiNam)
    tienMat -= chiPhiCuoi
    const hpCuoi = apHanhPhuc(ct.cuoiHanhPhuc)
    suKien.push({
      loai: 'ketHon',
      tieuDe: `Lễ cưới ở tuổi ${tuoiNamNay}`,
      moTa: `Bạn lập gia đình. Từ nay bạn đời góp thêm ${Math.round(
        ct.cuoiThuNhapBanDoi * 100,
      )}% lương của bạn mỗi năm, đổi lại chi phí gia đình tăng ${Math.round(
        ct.cuoiTangChiPhi * 100,
      )}%.`,
      tienThayDoi: -chiPhiCuoi,
      hanhPhucThayDoi: hpCuoi,
    })
  }

  // Sinh con theo lịch đã hẹn
  if (daKetHon) {
    for (const namSinh of s.cotTruyen.namSinhCon) {
      if (s.nam === namSinh) {
        conCai = [...conCai, s.nam]
        const hpSinhCon = apHanhPhuc(ct.sinhConHanhPhuc)
        suKien.push({
          loai: 'sinhCon',
          tieuDe:
            conCai.length === 1
              ? 'Chào đón con đầu lòng'
              : 'Chào đón con thứ hai',
          moTa: `Niềm vui lớn của cả nhà. Chi phí cố định tăng ${Math.round(
            ct.conTangChiPhi * 100,
          )}% cho tới khi con tự lập ở tuổi ${ct.conTuoiTuLap}.`,
          tienThayDoi: 0,
          hanhPhucThayDoi: hpSinhCon,
        })
      }
    }
  }

  // Các con lớn lên: vào đại học, rồi tự lập
  for (const namSinh of s.conCai) {
    const tuoiCon = s.nam - namSinh
    if (tuoiCon === ct.conTuoiDaiHoc) {
      const hocPhi = Math.round(s.chiPhiHangNam * ct.conDaiHocChiPhiTheoChiPhiNam)
      tienMat -= hocPhi
      const hpDaiHoc = apHanhPhuc(ct.conDaiHocHanhPhuc)
      suKien.push({
        loai: 'conVaoDaiHoc',
        tieuDe: 'Con đỗ đại học',
        moTa: 'Cả nhà tự hào. Bạn đóng trọn gói học phí bốn năm cho con.',
        tienThayDoi: -hocPhi,
        hanhPhucThayDoi: hpDaiHoc,
      })
    }
    if (tuoiCon === ct.conTuoiSinhChau) {
      const hpOngBa = apHanhPhuc(ct.lenChucOngBaHanhPhuc)
      suKien.push({
        loai: 'lenChucOngBa',
        tieuDe: 'Lên chức ông bà',
        moTa: 'Con bạn có con đầu lòng. Trong nhà lại có tiếng trẻ con.',
        tienThayDoi: 0,
        hanhPhucThayDoi: hpOngBa,
      })
    }
    if (tuoiCon === ct.conTuoiTuLap) {
      const hpTuLap = apHanhPhuc(ct.conTuLapHanhPhuc)
      suKien.push({
        loai: 'conTuLap',
        tieuDe: 'Con trưởng thành, tự lập',
        moTa: 'Con ra ở riêng và tự nuôi sống mình — chi phí gia đình nhẹ hẳn đi.',
        tienThayDoi: 0,
        hanhPhucThayDoi: hpTuLap,
      })
    }
  }

  // Nghỉ hưu
  if (!daNghiHuu && tuoiNamNay >= ct.tuoiNghiHuu) {
    daNghiHuu = true
    nghiHuuNamNay = true
    suKien.push({
      loai: 'nghiHuu',
      tieuDe: `Nghỉ hưu ở tuổi ${ct.tuoiNghiHuu}`,
      moTa: `Từ năm sau, lương hưu bằng ${Math.round(
        ct.tyLeLuongHuu * 100,
      )}% lương cuối và chỉ tăng theo lạm phát. Thu nhập thụ động giờ là chỗ dựa chính.`,
      tienThayDoi: 0,
      hanhPhucThayDoi: 0,
    })
  }

  // Mừng thọ
  if ((ct.mungThoTuoi as readonly number[]).includes(tuoiNamNay)) {
    const hpMungTho = apHanhPhuc(ct.mungThoHanhPhuc)
    suKien.push({
      loai: 'mungTho',
      tieuDe: `Mừng thọ ${tuoiNamNay} tuổi`,
      moTa: 'Con cháu, bạn bè quây quần chúc thọ. Một cột mốc của đời người.',
      tienThayDoi: 0,
      hanhPhucThayDoi: hpMungTho,
    })
  }

  /* --- 7. Sự kiện ngẫu nhiên --- */
  const sk = CONFIG.suKien

  // Ốm đau — tuổi càng cao sau nghỉ hưu càng dễ bệnh
  const xacSuatOmDau = Math.min(
    ct.omDauXacSuatToiDa,
    sk.omDauXacSuat +
      (daNghiHuu ? Math.max(0, tuoiNamNay - ct.tuoiNghiHuu) * ct.omDauTangMoiNamSauHuu : 0),
  )
  if (rng.next() < xacSuatOmDau) {
    // Viện phí neo vào cả lương lẫn chi phí sinh hoạt: về hưu lương thấp
    // nhưng chi phí vẫn cao, ốm đau phải còn sức nặng.
    const vienPhi = Math.round(
      Math.max(
        s.luong * sk.omDauChiPhiTyLeLuong,
        s.chiPhiHangNam * sk.omDauChiPhiTyLeChiPhi,
      ),
    )
    const tieuDeOm = rng.chon(
      tuoiNamNay >= ct.baoHiemDongTraTuoi
        ? ([
            'Một đợt điều trị dài ngày',
            'Nhập viện vì huyết áp',
            'Ca mổ ở tuổi xế chiều',
          ] as const)
        : (['Nằm viện một đợt', 'Một trận ốm nặng'] as const),
    )
    if (dangCoBaoHiem(s)) {
      const tyLeTuTra = tyLeDongTra(tuoiNamNay)
      const tuTra = Math.round(vienPhi * tyLeTuTra)
      tienMat -= tuTra
      suKien.push({
        loai: 'omDau',
        tieuDe: tieuDeOm,
        moTa:
          tuTra > 0
            ? `Tuổi này bảo hiểm chỉ còn chi trả ${Math.round(
                (1 - tyLeTuTra) * 100,
              )}% viện phí, phần còn lại bạn tự gánh.`
            : 'May là bảo hiểm y tế còn hiệu lực, toàn bộ viện phí được chi trả.',
        tienThayDoi: -tuTra,
        hanhPhucThayDoi: 0,
      })
    } else {
      tienMat -= vienPhi
      const hpOm = apHanhPhuc(-sk.omDauMatHanhPhuc)
      suKien.push({
        loai: 'omDau',
        tieuDe: tieuDeOm,
        moTa: 'Bạn không có bảo hiểm y tế nên phải tự trả toàn bộ viện phí.',
        tienThayDoi: -vienPhi,
        hanhPhucThayDoi: hpOm,
      })
    }
  }

  /* Nhóm sự kiện giao thông — chỉ xảy ra khi đang có xe.
   * Đây là đối trọng của ba loại bảo hiểm xe: mua thì mất phí đều đặn, không mua
   * thì thỉnh thoảng lãnh trọn một cú. Riêng mất trộm mà thiếu bảo hiểm vật chất
   * thì mất luôn món ước nguyện cùng khoản hạnh phúc nó mang lại mỗi năm.
   */
  const bhx = CONFIG.baoHiemXe
  let uocNguyenDaMua = s.uocNguyenDaMua
  let uocNguyenDaMat = s.uocNguyenDaMat
  const xe = xeDangCo(s)
  if (xe) {
    const coTrachNhiem = dangCoBaoHiemXe(s, 'trachNhiemDanSu')
    const coVatChat = dangCoBaoHiemXe(s, 'vatChatXe')
    const coTaiNan = dangCoBaoHiemXe(s, 'taiNanNguoiTrenXe')

    // Va chạm giao thông: bồi thường cho người bị nạn, có thể kèm thương tích
    if (rng.next() < bhx.vaChamXacSuat) {
      const denBu = Math.round(
        xe.giaTri * rng.khoang(bhx.vaChamDenBuMin, bhx.vaChamDenBuMax),
      )
      let tuTra = coTrachNhiem ? 0 : denBu
      let matHanhPhuc = coTrachNhiem
        ? bhx.vaChamMatHanhPhucCoBaoHiem
        : bhx.vaChamMatHanhPhucKhongBaoHiem
      const loiKe: string[] = [
        coTrachNhiem
          ? 'May là bảo hiểm trách nhiệm dân sự đứng ra bồi thường trọn phần cho người bị nạn.'
          : 'Không có bảo hiểm trách nhiệm dân sự nên bạn phải tự bồi thường cho người bị nạn.',
      ]

      if (rng.next() < bhx.vaChamXacSuatCoThuongTich) {
        const vienPhi = Math.round(xe.giaTri * bhx.thuongTichVienPhiTyLe)
        if (coTaiNan) {
          loiKe.push(
            'Người ngồi cùng xe bị thương, bảo hiểm tai nạn người ngồi trên xe lo trọn viện phí.',
          )
        } else {
          tuTra += vienPhi
          matHanhPhuc += bhx.thuongTichMatHanhPhuc
          loiKe.push(
            'Người ngồi cùng xe bị thương và bạn tự gánh toàn bộ viện phí cho họ.',
          )
        }
      }

      tienMat -= tuTra
      const hpVaCham = apHanhPhuc(-matHanhPhuc)
      suKien.push({
        loai: 'vaChamGiaoThong',
        tieuDe: 'Va chạm giao thông',
        moTa: `Một cú va chạm ngoài ý muốn trên đường. ${loiKe.join(' ')}`,
        tienThayDoi: -tuTra,
        hanhPhucThayDoi: hpVaCham,
      })
    }

    // Xe hỏng nặng phải sửa lớn
    if (rng.next() < bhx.xeHongXacSuat) {
      const chiPhiSua = Math.round(
        xe.giaTri * rng.khoang(bhx.xeHongChiPhiMin, bhx.xeHongChiPhiMax),
      )
      const tuTra = coVatChat ? 0 : chiPhiSua
      tienMat -= tuTra
      suKien.push({
        loai: 'xeHongNang',
        tieuDe: `${xe.ten} hỏng nặng`,
        moTa: coVatChat
          ? 'Xe nằm xưởng cả tuần. May là bảo hiểm vật chất xe thanh toán trọn tiền sửa.'
          : 'Xe nằm xưởng cả tuần và bạn tự trả trọn tiền sửa.',
        tienThayDoi: -tuTra,
        hanhPhucThayDoi: 0,
      })
    }

    // Mất trộm xe
    if (rng.next() < bhx.matTromXacSuat) {
      if (coVatChat) {
        suKien.push({
          loai: 'matTromXe',
          tieuDe: `${xe.ten} bị mất trộm`,
          moTa: 'Sáng ra chỗ để xe trống trơn. Bảo hiểm vật chất xe đền đúng giá trị, bạn tậu lại chiếc khác ngay trong năm.',
          tienThayDoi: 0,
          hanhPhucThayDoi: 0,
        })
      } else {
        uocNguyenDaMua = uocNguyenDaMua.filter((id) => id !== xe.uocNguyenId)
        if (!uocNguyenDaMat.includes(xe.uocNguyenId)) {
          uocNguyenDaMat = [...uocNguyenDaMat, xe.uocNguyenId]
        }
        const hpMatXe = apHanhPhuc(-bhx.matTromMatHanhPhuc)
        suKien.push({
          loai: 'matTromXe',
          tieuDe: `${xe.ten} bị mất trộm`,
          moTa: 'Sáng ra chỗ để xe trống trơn. Không có bảo hiểm vật chất xe nên mất trắng, và mất luôn khoản hạnh phúc chiếc xe mang lại mỗi năm. Muốn có lại thì phải mua bằng giá của hôm nay.',
          tienThayDoi: 0,
          hanhPhucThayDoi: hpMatXe,
        })
      }
    }

    // Bị phạt vì thiếu bảo hiểm bắt buộc
    if (!coTrachNhiem && rng.next() < bhx.phatXacSuat) {
      const tienPhat = Math.round(xe.giaTri * bhx.phatTyLe)
      tienMat -= tienPhat
      const hpPhat = apHanhPhuc(-bhx.phatMatHanhPhuc)
      suKien.push({
        loai: 'phatThieuBaoHiemXe',
        tieuDe: 'Bị phạt vì thiếu bảo hiểm bắt buộc',
        moTa: 'Cảnh sát giao thông kiểm tra giấy tờ. Bảo hiểm trách nhiệm dân sự là loại bắt buộc, thiếu là bị phạt.',
        tienThayDoi: -tienPhat,
        hanhPhucThayDoi: hpPhat,
      })
    }
  }

  // Chuyện tuổi già — để ba thập kỷ cuối không trôi qua trong im lặng
  if (
    tuoiNamNay >= ct.tuoiGiaSuKienTuTuoi &&
    rng.next() < ct.tuoiGiaSuKienXacSuat
  ) {
    const chuyen = rng.chon(CHUYEN_TUOI_GIA)
    const hpTuoiGia = apHanhPhuc(chuyen.hanhPhuc)
    suKien.push({
      loai: 'tuoiGia',
      tieuDe: chuyen.tieuDe,
      moTa: chuyen.moTa,
      tienThayDoi: 0,
      hanhPhucThayDoi: hpTuoiGia,
    })
  }

  // Thăng chức — chỉ khi còn đi làm
  let thangChucTang = 0
  if (!daNghiHuu && rng.next() < sk.thangChucXacSuat) {
    thangChucTang = rng.khoang(sk.thangChucTangLuongMin, sk.thangChucTangLuongMax)
    suKien.push({
      loai: 'thangChuc',
      tieuDe: 'Được thăng chức',
      moTa: `Nỗ lực cả năm được ghi nhận. Lương năm tới tăng thêm ${soPhanTram(
        thangChucTang,
      )}% ngoài mức thường lệ.`,
      tienThayDoi: 0,
      hanhPhucThayDoi: 0,
    })
  }

  // Sự cố đời sống
  if (rng.next() < sk.suCoXacSuat) {
    const chiPhiSuCo = Math.round(s.chiPhiHangNam * sk.suCoChiPhiTyLeChiPhi)
    // Chuyện hỏng xe đã có nhóm sự kiện giao thông lo, ở đây chỉ giữ việc nhà.
    const moTaSuCo = rng.chon([
      'Mái nhà thấm dột sau mùa mưa, phải gọi thợ sửa gấp.',
      'Tủ lạnh và máy giặt rủ nhau hỏng cùng một tháng.',
      'Đường ống nước ngầm rò rỉ, phải đục tường tìm chỗ vỡ.',
    ] as const)
    tienMat -= chiPhiSuCo
    const hpSuCo = apHanhPhuc(-sk.suCoMatHanhPhuc)
    suKien.push({
      loai: 'suCo',
      tieuDe: 'Sự cố đời sống',
      moTa: moTaSuCo,
      tienThayDoi: -chiPhiSuCo,
      hanhPhucThayDoi: hpSuCo,
    })
  }

  // Thưởng Tết — chỉ khi còn đi làm
  if (!daNghiHuu && rng.next() < sk.thuongTetXacSuat) {
    const thuong = Math.round(s.luong * sk.thuongTetTyLeLuong)
    tienMat += thuong
    suKien.push({
      loai: 'thuongTet',
      tieuDe: 'Thưởng Tết',
      moTa: 'Cơ quan chi thưởng cuối năm.',
      tienThayDoi: thuong,
      hanhPhucThayDoi: 0,
    })
  }

  // Lạm phát (luôn có, để cuối cho dễ đọc)
  suKien.push({
    loai: 'lamPhat',
    tieuDe: 'Lạm phát',
    moTa: `Mọi chi phí, học phí, bảo hiểm và giá cơ hội tăng ${soPhanTram(lamPhat)}%.`,
    tienThayDoi: 0,
    hanhPhucThayDoi: 0,
  })

  /* --- 8. Lương: đi làm thì bám lạm phát + tăng thực + thăng chức;
   *        năm nghỉ hưu chuyển sang lương hưu; đã hưu thì chỉ bám lạm phát --- */
  let luongMoi: Tien
  if (nghiHuuNamNay) {
    luongMoi = Math.round(s.luong * ct.tyLeLuongHuu)
  } else if (daNghiHuu) {
    luongMoi = Math.round(s.luong * (1 + lamPhat))
  } else {
    const tangThuc = rng.khoang(CONFIG.tangLuongThucMin, CONFIG.tangLuongThucMax)
    luongMoi = Math.round(
      s.luong * (1 + (CONFIG.luongBamLamPhat ? lamPhat : 0) + tangThuc + thangChucTang),
    )
  }
  const tangLuong = s.luong > 0 ? luongMoi / s.luong - 1 : 0
  tienMat += luongMoi

  /* --- 9. Hạnh phúc: buổi trị liệu, phạt khát vọng và thưởng ước nguyện --- */

  // Buổi trị liệu đứng TRƯỚC phạt khát vọng để điểm hồi được tính vào bức tranh
  // hạnh phúc của cả năm. Điểm hồi đi thẳng vào sự kiện chứ không thành một dòng
  // riêng của bảng tổng kết: khoản nào có chuyện để kể thì mang luôn số điểm,
  // giống hệt cột mốc tài sản; hai dòng riêng chỉ dành cho khoản đều đặn không
  // có gì để kể.
  if (dangTriLieu(s)) {
    // Mua ở năm N thì `triLieuDenNam` = N+2, và trong `chuyenNam` thì `s.nam`
    // vẫn là năm cũ — nên công thức này cho đúng 1, 2, 3 rồi liệu trình tắt.
    const namThu = CONFIG.chuyenGia.tamLy.soNamLieuTrinh - soNamTriLieuConLai(s) + 1
    const chuyen =
      CHUYEN_TRI_LIEU[Math.min(Math.max(namThu, 1), CHUYEN_TRI_LIEU.length) - 1]!
    const hpTriLieu = apHanhPhuc(hoiPhucTriLieu(s.soLanTriLieu))
    suKien.push({
      loai: 'triLieu',
      tieuDe: chuyen.tieuDe,
      moTa: chuyen.moTa,
      tienThayDoi: 0,
      hanhPhucThayDoi: hpTriLieu,
    })
  }

  // Áp lực công việc của bậc lương đã chọn. Đứng cùng chỗ với phạt khát vọng vì
  // cả hai đều là khoản đều đặn hàng năm, và nó phải nằm TRƯỚC khi chốt hạnh phúc
  // cuối năm để cửa ải thua đọc đúng con số.
  const apLuc = apLucCongViec(s)
  const apLucThucNhan = apLuc !== 0 ? apHanhPhuc(apLuc) : 0

  // Ghi lại số điểm THỰC bị trừ / thực nhận, không phải con số danh nghĩa —
  // để bảng tổng kết cộng lại đúng bằng mức hạnh phúc thay đổi trong năm.
  // Dùng danh sách ước nguyện SAU nhóm sự kiện giao thông: xe vừa mất trộm thì
  // năm nay không còn được cộng hạnh phúc, và nếu đó là khát vọng của nghề thì
  // khoản phạt hàng năm quay lại ngay.
  const phatDanhNghia = uocNguyenDaMua.includes(s.khatVongId)
    ? 0
    : CONFIG.phatKhatVongMoiNam
  const phat = phatDanhNghia > 0 ? -apHanhPhuc(-phatDanhNghia) : 0
  const thuongDanhNghia = uocNguyenDaMua.reduce(
    (t, id) => t + (timUocNguyen(id)?.hanhPhucMoiNam ?? 0),
    0,
  )
  const thuongUocNguyen = thuongDanhNghia > 0 ? apHanhPhuc(thuongDanhNghia) : 0

  /* --- 10. Áp lạm phát + hoàn cảnh gia đình lên mặt bằng giá --- */
  const namMoi = s.nam + 1
  const chiSoGia = s.chiSoGia * (1 + lamPhat)
  // TẠM THỜI: `GameState` chưa có trường `heSoLuongKhoiDiem` (việc của Task 2) nên
  // đọc phòng thủ qua ép kiểu cục bộ, giống `xuatThanHienTai` và `apLucCongViec`.
  const heSoChiPhi = tinhHeSoChiPhi(
    daKetHon,
    conCai,
    namMoi,
    xuatThanHienTai(s),
    (s as { heSoLuongKhoiDiem?: number }).heSoLuongKhoiDiem ?? 1,
  )
  const nghe = timNghe(s.ngheId)!
  // Hệ số tối ưu chi tiêu nằm ở đây chứ không trừ một lần khi thuê: chi phí năm
  // nào cũng được dựng lại từ chi phí gốc của nghề, nên phần giảm phải nhân vào
  // mỗi năm thì mới thật sự vĩnh viễn.
  const chiPhiHangNam = Math.round(
    nghe.chiPhi * chiSoGia * heSoChiPhi * s.heSoToiUuChiPhi,
  )

  /* --- 11. Thiếu tiền mặt thì buộc phải bán tài sản trang trải --- */
  let soHuu = s.soHuu
  if (tienMat < 0) {
    soHuu = { ...s.soHuu }
    let tienBanDuoc = 0
    const thuTuBan: AssetId[] = ['traiPhieu', 'vang', 'coPhieu', 'crypto', 'batDongSan']
    for (const id of thuTuBan) {
      if (tienMat >= 0) break
      const gia = giaMoi[id]
      const canBan = Math.min(Math.ceil(-tienMat / gia), soHuu[id])
      if (canBan <= 0) continue
      soHuu[id] -= canBan
      tienMat += canBan * gia
      tienBanDuoc += canBan * gia
    }
    if (tienBanDuoc > 0) {
      suKien.push({
        loai: 'banTaiSan',
        tieuDe: 'Bán tài sản trang trải',
        moTa: 'Chi tiêu trong năm vượt số tiền mặt đang có, đành bán bớt tài sản để cân đối.',
        tienThayDoi: tienBanDuoc,
        hanhPhucThayDoi: 0,
      })
    }
    if (tienMat < 0) {
      const hpTung = apHanhPhuc(-10)
      suKien.push({
        loai: 'banTaiSan',
        tieuDe: 'Túng thiếu',
        moTa: 'Bán hết tài sản vẫn chưa đủ bù chi tiêu, phải giật gấu vá vai qua ngày.',
        tienThayDoi: 0,
        hanhPhucThayDoi: hpTung,
      })
    }
  }

  /* --- 12. Cột mốc tài sản ---
   * Ghi nhận theo CHỈ SỐ mốc chứ không theo số tiền: giá trị mỗi mốc leo theo
   * chỉ số giá từng năm, nên lưu số tiền sẽ khiến mốc cũ được trao lại.
   */
  const tongSauNam =
    tienMat + TAI_SAN.reduce((t, ts) => t + soHuu[ts.id] * giaMoi[ts.id], 0)
  const mocNamNay = mocTaiSanCuaNghe(s.ngheId, chiSoGia)
  let mocTaiSanDaQua = s.mocTaiSanDaQua
  for (let i = 0; i < mocNamNay.length; i++) {
    const moc = mocNamNay[i]!
    if (tongSauNam < moc || mocTaiSanDaQua.includes(i)) continue
    mocTaiSanDaQua = [...mocTaiSanDaQua, i]
    const hpMoc = apHanhPhuc(CONFIG.mocTaiSan.hanhPhuc)
    const mocCuoi = i === mocNamNay.length - 1
    suKien.push({
      loai: 'mocTaiSan',
      tieuDe: `Cột mốc tài sản ${dinhDangTien(moc)}`,
      moTa: mocCuoi
        ? 'Cột mốc cao nhất của nghề này — hai mươi lăm năm chi phí sinh hoạt nằm gọn trong tay.'
        : 'Thành quả tích luỹ đáng tự hào trên hành trình tự do tài chính.',
      tienThayDoi: 0,
      hanhPhucThayDoi: hpMoc,
    })
  }

  /* --- 13. Cảnh báo kiệt sức: chốt sổ tinh thần của cả năm ---
   * Khối này BẮT BUỘC đứng ở đây, sau bước 12, chứ không phải ở cuối bước 9 —
   * đây là cái bẫy chính của bản v1.5. Sau bước 9 biến `hanhPhuc` còn bị sửa hai
   * lần nữa: bước 11 trừ 10 điểm khi túng thiếu phải bán tài sản, bước 12 cộng 5
   * điểm cho mỗi cột mốc tài sản vừa chạm. Xét sớm thì một năm đóng lại ở 63 điểm
   * vẫn bị kể chuyện kiệt sức và cờ kẹt ở trạng thái bật, còn một năm tụt xuống 48
   * vì túng thiếu lại không được kể một chữ nào.
   *
   * Vì cờ này cũng là điều kiện giảm nửa phí chuyên gia (xem `dangDuocHoTro`), đặt
   * sai chỗ sẽ biến một lỗi kể chuyện thành một lỗi tiền bạc. Sự kiện `kietSuc` vì
   * vậy đứng CUỐI mảng `suKien`, sau cả lạm phát — nó là lời khép lại của năm.
   *
   * Cờ tắt trở lại ngay khi hạnh phúc leo lên bằng hoặc trên ngưỡng, nhờ vậy câu
   * chuyện chỉ kể lại khi người chơi thật sự rơi xuống lần nữa chứ không lải nhải
   * mỗi năm suốt quãng nằm dưới đáy.
   */
  let daCanhBaoKietSuc = s.daCanhBaoKietSuc
  if (hanhPhuc >= CONFIG.hanhPhucNguongCanhBao) {
    daCanhBaoKietSuc = false
  } else if (!daCanhBaoKietSuc) {
    const chuyen = rng.chon(CHUYEN_KIET_SUC)
    suKien.push({
      loai: 'kietSuc',
      tieuDe: chuyen.tieuDe,
      moTa: chuyen.moTa,
      tienThayDoi: 0,
      hanhPhucThayDoi: 0,
    })
    daCanhBaoKietSuc = true
  }

  /* --- 14. Rút bài cho năm mới, theo giai đoạn đời và không lặp năm trước --- */
  const theConLai = rutThe(rng, rng.nguyen(CONFIG.soTheMoiNamMin, CONFIG.soTheMoiNamMax), {
    daKetHon,
    conCai,
    nam: namMoi,
    loaiTru: s.theNamTruoc,
  })
  const coHoiNamNay = rutCoHoi(rng, CONFIG.soCoHoiMoiNam, {
    ngheId: s.ngheId,
    nam: namMoi,
    coHoiDaLam: s.coHoiDaLam,
  })

  const sauChuyen: GameState = {
    ...s,
    rngCursor: rng.cursor,
    nam: namMoi,
    phase: 'tongKet',
    tienMat,
    hanhPhuc,
    luong: luongMoi,
    chiPhiHangNam,
    chiSoGia,
    heSoChiPhi,
    daTraChiPhiNamNay: false,
    soHuu,
    giaTaiSan: giaMoi,
    lichSuGia,
    uocNguyenDaMua,
    uocNguyenDaMat,
    // Ba trường chuyên gia còn lại chỉ đổi trong reducer nên đi theo phép trải
    // `...s` là đủ; riêng cờ này do chính `chuyenNam` bật tắt, phải gán tường minh.
    daCanhBaoKietSuc,
    khoanVay,
    khoanDangCho: [],
    daKetHon,
    conCai,
    daNghiHuu,
    mocTaiSanDaQua,
    theNamTruoc: theConLai.map((t) => t.id),
    theConLai,
    coHoiNamNay,
  }

  const tong = tongTaiSan(sauChuyen)

  const tongKet: TongKetNam = {
    nam: s.nam,
    luong: luongMoi,
    tangLuong,
    thuNhapThuDong: thuDong,
    thuNhapBanDoi,
    bienDongTaiSan,
    thuNhapDoanhNghiep,
    phatKhatVong: phat,
    hanhPhucTuUocNguyen: thuongUocNguyen,
    apLucCongViec: apLucThucNhan,
    suKien,
    lamPhat,
    tongTaiSan: tong,
  }

  const dongLichSu = {
    nam: s.nam,
    luong: s.luong,
    chiPhi: s.chiPhiHangNam,
    tienMat,
    giaTriDauTu: giaTriDauTu(sauChuyen),
    tongTaiSan: tong,
    hanhPhuc,
    lamPhat,
  }

  return {
    ...sauChuyen,
    tongKet,
    lichSu: [...s.lichSu, dongLichSu],
  }
}

/* ============================================================
 *  Reducer
 * ============================================================ */

const choPhepHanhDongTuDo = (s: GameState) =>
  s.trangThai === 'dangChoi' && (s.phase === 'chiPhi' || s.phase === 'theBai' || s.phase === 'tuDo')

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'chonNghe':
      return taoGameMoi(a.ngheId, a.seed)

    case 'choiLai':
      return taoGameMoi(s.ngheId, Math.floor(Math.random() * 1e9))

    case 'traChiPhi': {
      if (s.phase !== 'chiPhi' || s.daTraChiPhiNamNay) return s
      return {
        ...s,
        tienMat: s.tienMat - s.chiPhiHangNam,
        daTraChiPhiNamNay: true,
        phase: s.theConLai.length > 0 ? 'theBai' : 'tuDo',
      }
    }

    case 'quyetDinhThe': {
      if (s.phase !== 'theBai') return s
      const [the, ...con] = s.theConLai
      if (!the) return { ...s, phase: 'tuDo' }
      const gia = giaThucTe(s, the.gia)
      // Không đủ tiền thì coi như buộc phải từ chối
      const nhan = a.nhan && s.tienMat >= gia
      return {
        ...s,
        tienMat: nhan ? s.tienMat - gia : s.tienMat,
        hanhPhuc: themHanhPhuc(s.hanhPhuc, nhan ? the.diem : -the.diem),
        theConLai: con,
        phase: con.length > 0 ? 'theBai' : 'tuDo',
      }
    }

    case 'muaKhoaHoc': {
      if (!choPhepHanhDongTuDo(s)) return s
      // Đã nghỉ hưu thì học thêm không còn tăng được lương
      if (s.daNghiHuu) return s
      const kh = timKhoaHoc(a.khoaHocId)
      if (!kh || s.khoaHocDaMua.includes(kh.id)) return s
      const gia = giaThucTe(s, kh.gia)
      if (s.tienMat < gia) return s
      const rng = taoRng(s.seed, s.rngCursor)
      const tang = rng.khoang(kh.tangLuongMin, kh.tangLuongMax)
      return {
        ...s,
        rngCursor: rng.cursor,
        tienMat: s.tienMat - gia,
        luong: Math.round(s.luong * (1 + tang)),
        khoaHocDaMua: [...s.khoaHocDaMua, kh.id],
      }
    }

    case 'muaBaoHiem': {
      if (!choPhepHanhDongTuDo(s) || dangCoBaoHiem(s)) return s
      const phi = phiBaoHiem(s)
      if (s.tienMat < phi) return s
      return { ...s, tienMat: s.tienMat - phi, baoHiemDenNam: s.nam }
    }

    case 'muaBaoHiemXe': {
      if (!choPhepHanhDongTuDo(s)) return s
      // Không có xe thì không có gì để bảo hiểm
      if (!xeDangCo(s) || dangCoBaoHiemXe(s, a.loai)) return s
      const phi = phiBaoHiemXe(s, a.loai)
      if (phi <= 0 || s.tienMat < phi) return s
      return {
        ...s,
        tienMat: s.tienMat - phi,
        baoHiemXe: { ...s.baoHiemXe, [a.loai]: s.nam },
      }
    }

    case 'thueChuyenGiaTamLy': {
      // Chỉ được mua liệu trình mới khi liệu trình cũ đã hết hạn — trị liệu là
      // một quá trình nhiều năm, chồng hai liệu trình lên nhau không có nghĩa gì.
      if (!choPhepHanhDongTuDo(s) || dangTriLieu(s)) return s
      const phi = phiChuyenGiaTamLy(s)
      if (s.tienMat < phi) return s
      return {
        ...s,
        tienMat: s.tienMat - phi,
        // Liệu trình tính CẢ năm mua nên hạn cuối lùi lại một năm so với số năm.
        triLieuDenNam: s.nam + CONFIG.chuyenGia.tamLy.soNamLieuTrinh - 1,
        soLanTriLieu: s.soLanTriLieu + 1,
      }
    }

    case 'thueChuyenGiaTaiChinh': {
      if (!choPhepHanhDongTuDo(s) || daToiUuChiPhi(s)) return s
      const phi = phiChuyenGiaTaiChinh(s)
      if (s.tienMat < phi) return s
      return {
        ...s,
        tienMat: s.tienMat - phi,
        daThueChuyenGiaTaiChinh: true,
        heSoToiUuChiPhi: 1 - CONFIG.chuyenGia.taiChinh.giamChiPhi,
        // Đi qua `themHanhPhuc` để trần mềm vẫn có hiệu lực, giống mọi khoản
        // cộng hạnh phúc khác trong game.
        hanhPhuc: themHanhPhuc(s.hanhPhuc, CONFIG.chuyenGia.taiChinh.hanhPhucNgay),
      }
    }

    case 'muaUocNguyen': {
      if (!choPhepHanhDongTuDo(s)) return s
      const un = timUocNguyen(a.uocNguyenId)
      if (!un || s.uocNguyenDaMua.includes(un.id)) return s
      // Giá khoá tại thời trẻ cho lần mua đầu tiên; món đã từng mất thì tính
      // theo giá hiện hành (xem giaUocNguyen).
      const gia = giaUocNguyen(s, un.id)
      if (s.tienMat < gia) return s
      return {
        ...s,
        tienMat: s.tienMat - gia,
        uocNguyenDaMua: [...s.uocNguyenDaMua, un.id],
      }
    }

    case 'dauTu': {
      if (!choPhepHanhDongTuDo(s)) return s
      const ts = timTaiSan(a.assetId)
      if (!ts || a.soDonVi <= 0) return s
      const chiPhi = a.soDonVi * s.giaTaiSan[a.assetId]
      if (chiPhi > s.tienMat) return s
      return {
        ...s,
        tienMat: s.tienMat - chiPhi,
        soHuu: { ...s.soHuu, [a.assetId]: s.soHuu[a.assetId] + a.soDonVi },
      }
    }

    case 'ban': {
      if (!choPhepHanhDongTuDo(s)) return s
      const dangCo = s.soHuu[a.assetId]
      const ban = Math.min(a.soDonVi, dangCo)
      if (ban <= 0) return s
      return {
        ...s,
        tienMat: s.tienMat + ban * s.giaTaiSan[a.assetId],
        soHuu: { ...s.soHuu, [a.assetId]: dangCo - ban },
      }
    }

    case 'vay': {
      if (!choPhepHanhDongTuDo(s)) return s
      const kyHan = Math.max(1, Math.min(CONFIG.kyHanVayToiDa, Math.round(a.kyHan)))
      const tran = vayToiDa(s, kyHan)
      const goc = Math.min(a.goc, tran)
      if (goc <= 0) return s
      return {
        ...s,
        tienMat: s.tienMat + goc,
        khoanVay: [
          ...s.khoanVay,
          {
            id: `vay-${s.nam}-${s.khoanVay.length}`,
            goc,
            kyHan,
            thanhToanMoiNam: thanhToanMoiNamCuaKhoanVay(goc, kyHan),
            namConLai: kyHan,
          },
        ],
      }
    }

    case 'quyetDinhCoHoi': {
      if (!choPhepHanhDongTuDo(s)) return s
      const coHoi = timCoHoi(a.coHoiId)
      if (!coHoi) return s
      const conLai = s.coHoiNamNay.filter((c) => c.id !== a.coHoiId)
      if (!a.nhan) return { ...s, coHoiNamNay: conLai }

      const gia = giaThucTe(s, coHoi.gia)
      if (s.tienMat < gia) return s

      const coHoiDaLam = coHoi.chiMotLan
        ? [...s.coHoiDaLam, coHoi.id]
        : s.coHoiDaLam

      if (coHoi.loai === 'kinhDoanh') {
        return {
          ...s,
          tienMat: s.tienMat - gia,
          coHoiNamNay: conLai,
          coHoiDaLam,
          doanhNghiep: [
            ...s.doanhNghiep,
            {
              coHoiId: coHoi.id,
              ten: coHoi.ten,
              thuNhapNen: giaThucTe(s, coHoi.thuNhapMoiNam ?? 0),
              chiSoGiaLucMua: s.chiSoGia,
            },
          ],
        }
      }

      // Canh bạc và tổ chức sự kiện đều chờ mở kết quả vào cuối năm
      return {
        ...s,
        tienMat: s.tienMat - gia,
        coHoiNamNay: conLai,
        coHoiDaLam,
        khoanDangCho: [
          ...s.khoanDangCho,
          { coHoiId: coHoi.id, gia, loai: coHoi.loai },
        ],
      }
    }

    case 'ketThucNam': {
      if (s.trangThai !== 'dangChoi') return s
      if (!s.daTraChiPhiNamNay) return s

      // Điều kiện thua kiểm tra đúng lúc bấm Kết thúc năm
      if (s.hanhPhuc < CONFIG.hanhPhucNguongThua) {
        return {
          ...s,
          phase: 'ketThuc',
          trangThai: 'thua',
          lyDoKetThuc: `Hạnh phúc tụt xuống ${s.hanhPhuc}, dưới ngưỡng ${CONFIG.hanhPhucNguongThua}.`,
        }
      }

      const sau = chuyenNam(s)

      if (!sau.daTuDo && daTuDoTaiChinh(sau)) {
        return {
          ...sau,
          daTuDo: true,
          trangThai: 'thang',
          lyDoKetThuc:
            `Dòng tiền thụ động ${dinhDangTien(dongTienThuDong(sau))} mỗi năm đã phủ` +
            ` trọn nghĩa vụ ${dinhDangTien(nghiaVuHangNam(sau))} — tự do tài chính sau` +
            ` ${s.nam} năm, ở tuổi ${tuoiTaiNam(s.nam)}.`,
        }
      }
      if (tuoiTaiNam(sau.nam) > CONFIG.cotTruyen.tuoiVienMan) {
        return {
          ...sau,
          trangThai: 'vienMan',
          lyDoKetThuc: sau.daTuDo
            ? 'Bạn đã đi trọn hành trình một trăm năm — và tự do tài chính đã chinh phục trên đường đi.'
            : 'Bạn đã đi trọn hành trình một trăm năm cuộc đời.',
        }
      }
      return sau
    }

    case 'dongTongKet': {
      if (s.phase !== 'tongKet') return s
      if (s.trangThai !== 'dangChoi') return { ...s, phase: 'ketThuc' }
      return { ...s, phase: 'chiPhi', tongKet: null }
    }

    case 'choiTiepSauThang': {
      // Đã thắng nhưng muốn sống tiếp trọn hành trình trăm năm
      if (s.trangThai !== 'thang') return s
      return { ...s, trangThai: 'dangChoi', phase: 'chiPhi', tongKet: null }
    }

    default:
      return s
  }
}

/** Danh sách khoá học chưa mua, theo thứ tự bậc thang. */
export const khoaHocConLai = (s: GameState) =>
  KHOA_HOC.filter((k) => !s.khoaHocDaMua.includes(k.id))

/** Danh sách món ước nguyện chưa mua. */
export const uocNguyenConLai = (s: GameState) =>
  UOC_NGUYEN.filter((u) => !s.uocNguyenDaMua.includes(u.id))

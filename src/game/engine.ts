import { CONFIG, TY } from './config'
import {
  CO_HOI,
  KHOA_HOC,
  NGHE,
  TAI_SAN,
  THE_TIEU_DUNG,
  UOC_NGUYEN,
  timCoHoi,
  timKhoaHoc,
  timNghe,
  timTaiSan,
  timUocNguyen,
} from './content'
import type {
  Action,
  AssetId,
  GameState,
  SuKien,
  TheTieuDung,
  Tien,
  TongKetNam,
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

/** Thu nhập thụ động hàng năm từ các doanh nghiệp đã góp vốn. */
export function thuNhapThuDong(s: GameState): Tien {
  return s.doanhNghiep.reduce((t, d) => t + d.thuNhapMoiNam, 0)
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

/** Giá thực tế của một khoản chi sau khi tính lạm phát tích luỹ. */
export const giaThucTe = (s: GameState, giaGoc: Tien): Tien =>
  Math.round(giaGoc * s.chiSoGia)

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

/** Hệ số chi phí cố định theo hoàn cảnh gia đình ở năm `nam`. */
export function tinhHeSoChiPhi(
  daKetHon: boolean,
  conCai: readonly number[],
  nam: number,
): number {
  const ct = CONFIG.cotTruyen
  return (
    (1 + (daKetHon ? ct.cuoiTangChiPhi : 0)) *
    Math.pow(1 + ct.conTangChiPhi, soConDangNuoi(conCai, nam))
  )
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

function rutCoHoi(rng: Rng, soLuong: number) {
  const con = [...CO_HOI]
  const kq = []
  for (let i = 0; i < soLuong && con.length > 0; i++) {
    const idx = Math.floor(rng.next() * con.length)
    kq.push(con.splice(idx, 1)[0]!)
  }
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
  const coHoiNamNay = rutCoHoi(rng, CONFIG.soCoHoiMoiNam)

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
    baoHiemDenNam: -1,

    khoanVay: [],
    doanhNghiep: [],
    canhBacDangCho: [],

    cotTruyen: { namCuoi, namSinhCon: [namCon1, namCon2] },
    daKetHon: false,
    conCai: [],
    daNghiHuu: false,
    daDatMucTieu: false,
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
  const loiTucTaiSan: TongKetNam['loiTucTaiSan'] = []

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

    if (soLuong > 0 || ts.id === 'coPhieu') {
      loiTucTaiSan.push({ id: ts.id, ten: ts.ten, bienDong, loiTuc })
    }
  }

  /* --- 3. Thu nhập thụ động từ doanh nghiệp + đóng góp của bạn đời --- */
  const thuDong = thuNhapThuDong(s)
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

  /* --- 5. Kết quả các ván cược --- */
  for (const cuoc of s.canhBacDangCho) {
    const coHoi = timCoHoi(cuoc.coHoiId)
    if (!coHoi) continue
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
    const moTaSuCo = rng.chon([
      'Chiếc xe máy dở chứng giữa đường, phải thay phụ tùng.',
      'Mái nhà thấm dột sau mùa mưa, phải gọi thợ sửa gấp.',
      'Tủ lạnh và máy giặt rủ nhau hỏng cùng một tháng.',
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

  /* --- 9. Hạnh phúc: phạt khát vọng và thưởng ước nguyện --- */
  // Ghi lại số điểm THỰC bị trừ / thực nhận, không phải con số danh nghĩa —
  // để bảng tổng kết cộng lại đúng bằng mức hạnh phúc thay đổi trong năm.
  const phatDanhNghia = daDatKhatVong(s) ? 0 : CONFIG.phatKhatVongMoiNam
  const phat = phatDanhNghia > 0 ? -apHanhPhuc(-phatDanhNghia) : 0
  const thuongDanhNghia = hanhPhucTuUocNguyen(s)
  const thuongUocNguyen = thuongDanhNghia > 0 ? apHanhPhuc(thuongDanhNghia) : 0

  /* --- 10. Áp lạm phát + hoàn cảnh gia đình lên mặt bằng giá --- */
  const namMoi = s.nam + 1
  const chiSoGia = s.chiSoGia * (1 + lamPhat)
  const heSoChiPhi = tinhHeSoChiPhi(daKetHon, conCai, namMoi)
  const nghe = timNghe(s.ngheId)!
  const chiPhiHangNam = Math.round(nghe.chiPhi * chiSoGia * heSoChiPhi)

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

  /* --- 12. Mốc tài sản trung gian --- */
  const tongSauNam =
    tienMat + TAI_SAN.reduce((t, ts) => t + soHuu[ts.id] * giaMoi[ts.id], 0)
  let mocTaiSanDaQua = s.mocTaiSanDaQua
  for (const moc of CONFIG.mocTaiSan) {
    if (tongSauNam >= moc && !mocTaiSanDaQua.includes(moc)) {
      mocTaiSanDaQua = [...mocTaiSanDaQua, moc]
      const hpMoc = apHanhPhuc(CONFIG.mocTaiSanHanhPhuc)
      suKien.push({
        loai: 'mocTaiSan',
        tieuDe: `Cột mốc tài sản ${(moc / TY).toString().replace('.', ',')} tỷ`,
        moTa: 'Thành quả tích luỹ đáng tự hào trên hành trình tới mục tiêu.',
        tienThayDoi: 0,
        hanhPhucThayDoi: hpMoc,
      })
    }
  }

  /* --- 13. Rút bài cho năm mới, theo giai đoạn đời và không lặp năm trước --- */
  const theConLai = rutThe(rng, rng.nguyen(CONFIG.soTheMoiNamMin, CONFIG.soTheMoiNamMax), {
    daKetHon,
    conCai,
    nam: namMoi,
    loaiTru: s.theNamTruoc,
  })
  const coHoiNamNay = rutCoHoi(rng, CONFIG.soCoHoiMoiNam)

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
    khoanVay,
    canhBacDangCho: [],
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
    loiTucTaiSan,
    phatKhatVong: phat,
    hanhPhucTuUocNguyen: thuongUocNguyen,
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

    case 'muaUocNguyen': {
      if (!choPhepHanhDongTuDo(s)) return s
      const un = timUocNguyen(a.uocNguyenId)
      if (!un || s.uocNguyenDaMua.includes(un.id)) return s
      // Giá ước nguyện khoá tại thời trẻ, không leo theo lạm phát —
      // để giấc mơ không chạy nhanh hơn khả năng tích luỹ của người chơi.
      const gia = un.gia
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

      if (coHoi.loai === 'kinhDoanh') {
        return {
          ...s,
          tienMat: s.tienMat - gia,
          coHoiNamNay: conLai,
          doanhNghiep: [
            ...s.doanhNghiep,
            {
              coHoiId: coHoi.id,
              ten: coHoi.ten,
              thuNhapMoiNam: giaThucTe(s, coHoi.thuNhapMoiNam ?? 0),
            },
          ],
        }
      }
      return {
        ...s,
        tienMat: s.tienMat - gia,
        coHoiNamNay: conLai,
        canhBacDangCho: [...s.canhBacDangCho, { coHoiId: coHoi.id, gia }],
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

      if (!sau.daDatMucTieu && tongTaiSan(sau) >= CONFIG.mucTieuTaiSan) {
        return {
          ...sau,
          daDatMucTieu: true,
          trangThai: 'thang',
          lyDoKetThuc: `Đạt mục tiêu tài sản sau ${s.nam} năm, ở tuổi ${tuoiTaiNam(s.nam)}.`,
        }
      }
      if (tuoiTaiNam(sau.nam) > CONFIG.cotTruyen.tuoiVienMan) {
        return {
          ...sau,
          trangThai: 'vienMan',
          lyDoKetThuc: sau.daDatMucTieu
            ? 'Bạn đã đi trọn hành trình một trăm năm — và mục tiêu tài sản đã chinh phục trên đường đi.'
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

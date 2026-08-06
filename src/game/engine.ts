import { CONFIG } from './config'
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

/** Phí bảo hiểm y tế năm nay. */
export function phiBaoHiem(s: GameState): Tien {
  return Math.round(s.luong * CONFIG.baoHiemTyLeLuong)
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

/* ============================================================
 *  Khởi tạo ván mới
 * ============================================================ */

function rutThe(rng: Rng, soLuong: number): TheTieuDung[] {
  const con = [...THE_TIEU_DUNG]
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

  const theConLai = rutThe(rng, rng.nguyen(CONFIG.soTheMoiNamMin, CONFIG.soTheMoiNamMax))
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
    soConDaSinh: 0,

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

function chuyenNam(s: GameState): GameState {
  const rng = taoRng(s.seed, s.rngCursor)
  const suKien: SuKien[] = []
  let tienMat = s.tienMat
  let hanhPhuc = s.hanhPhuc

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

  /* --- 3. Thu nhập thụ động từ doanh nghiệp --- */
  const thuDong = thuNhapThuDong(s)
  tienMat += thuDong

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

  /* --- 6. Sự kiện ngẫu nhiên --- */
  const sk = CONFIG.suKien

  // Ốm đau
  if (rng.next() < sk.omDauXacSuat) {
    if (dangCoBaoHiem(s)) {
      suKien.push({
        loai: 'omDau',
        tieuDe: 'Nằm viện một đợt',
        moTa: 'May là bảo hiểm y tế còn hiệu lực, toàn bộ viện phí được chi trả.',
        tienThayDoi: 0,
        hanhPhucThayDoi: 0,
      })
    } else {
      const chiPhi = Math.round(s.luong * sk.omDauChiPhiTyLeLuong)
      tienMat -= chiPhi
      hanhPhuc = themHanhPhuc(hanhPhuc, -sk.omDauMatHanhPhuc)
      suKien.push({
        loai: 'omDau',
        tieuDe: 'Nằm viện một đợt',
        moTa: 'Bạn không có bảo hiểm y tế nên phải tự trả toàn bộ viện phí.',
        tienThayDoi: -chiPhi,
        hanhPhucThayDoi: -sk.omDauMatHanhPhuc,
      })
    }
  }

  // Sinh con
  let heSoChiPhi = s.heSoChiPhi
  let soConDaSinh = s.soConDaSinh
  if (
    s.nam >= sk.sinhConNamSomNhat &&
    soConDaSinh < sk.sinhConToiDa &&
    rng.next() < sk.sinhConXacSuat
  ) {
    soConDaSinh += 1
    heSoChiPhi *= 1 + sk.sinhConTangChiPhi
    hanhPhuc = themHanhPhuc(hanhPhuc, sk.sinhConHanhPhuc)
    suKien.push({
      loai: 'sinhCon',
      tieuDe: 'Gia đình có thêm thành viên',
      moTa: `Hạnh phúc tăng mạnh, nhưng chi phí cố định tăng ${Math.round(
        sk.sinhConTangChiPhi * 100,
      )}% vĩnh viễn.`,
      tienThayDoi: 0,
      hanhPhucThayDoi: sk.sinhConHanhPhuc,
    })
  }

  // Thưởng Tết
  if (rng.next() < sk.thuongTetXacSuat) {
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
    moTa: `Mọi chi phí, học phí, bảo hiểm và giá món ước nguyện tăng ${(
      lamPhat * 100
    ).toFixed(1)}%.`,
    tienThayDoi: 0,
    hanhPhucThayDoi: 0,
  })

  /* --- 7. Lương tăng: bám lạm phát + phần tăng thực --- */
  const tangThuc = rng.khoang(CONFIG.tangLuongThucMin, CONFIG.tangLuongThucMax)
  const tangLuong = (CONFIG.luongBamLamPhat ? lamPhat : 0) + tangThuc
  const luongMoi = Math.round(s.luong * (1 + tangLuong))
  tienMat += luongMoi

  /* --- 8. Hạnh phúc: phạt khát vọng và thưởng ước nguyện --- */
  const phat = daDatKhatVong(s) ? 0 : CONFIG.phatKhatVongMoiNam
  if (phat > 0) hanhPhuc = themHanhPhuc(hanhPhuc, -phat)
  const thuongUocNguyen = hanhPhucTuUocNguyen(s)
  if (thuongUocNguyen > 0) hanhPhuc = themHanhPhuc(hanhPhuc, thuongUocNguyen)

  /* --- 9. Áp lạm phát lên mặt bằng giá --- */
  const chiSoGia = s.chiSoGia * (1 + lamPhat)
  const nghe = timNghe(s.ngheId)!
  const chiPhiHangNam = Math.round(nghe.chiPhi * chiSoGia * heSoChiPhi)

  /* --- 10. Rút bài cho năm mới --- */
  const theConLai = rutThe(rng, rng.nguyen(CONFIG.soTheMoiNamMin, CONFIG.soTheMoiNamMax))
  const coHoiNamNay = rutCoHoi(rng, CONFIG.soCoHoiMoiNam)

  const namMoi = s.nam + 1
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
    soConDaSinh,
    daTraChiPhiNamNay: false,
    giaTaiSan: giaMoi,
    lichSuGia,
    khoanVay,
    canhBacDangCho: [],
    theConLai,
    coHoiNamNay,
  }

  const tong = tongTaiSan(sauChuyen)

  const tongKet: TongKetNam = {
    nam: s.nam,
    luong: luongMoi,
    tangLuong,
    thuNhapThuDong: thuDong,
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
      const gia = giaThucTe(s, un.gia)
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

      if (tongTaiSan(sau) >= CONFIG.mucTieuTaiSan) {
        return {
          ...sau,
          trangThai: 'thang',
          lyDoKetThuc: `Đạt mục tiêu tài sản sau ${s.nam} năm.`,
        }
      }
      return sau
    }

    case 'dongTongKet': {
      if (s.phase !== 'tongKet') return s
      if (s.trangThai === 'thang') return { ...s, phase: 'ketThuc' }
      return { ...s, phase: 'chiPhi', tongKet: null }
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

import { describe, expect, it } from 'vitest'
import { CONFIG, TRIEU, TY } from './config'
import {
  CO_HOI,
  NGHE,
  TAI_SAN,
  THE_TIEU_DUNG,
  UOC_NGUYEN,
  XUAT_THAN,
  timCoHoi,
  timNghe,
  timUocNguyen,
  timXuatThan,
} from './content'
import {
  CHUYEN_TRI_LIEU,
  apLucCongViec,
  bienDoThuNhapThuDong,
  coHoiHopLe,
  daDatKhatVong,
  daToiUuChiPhi,
  dangCoBaoHiemXe,
  dangDuocHoTro,
  dangTriLieu,
  dongTienThuDong,
  giaThucTe,
  giaUocNguyen,
  hanhPhucTuUocNguyen,
  hoiPhucTriLieu,
  mocTaiSanCuaNghe,
  muaToiDa,
  mucTieuTuDo,
  nghiaVuHangNam,
  nghiaVuNamDau,
  phiBaoHiem,
  phiBaoHiemXe,
  phiChuyenGiaTaiChinh,
  phiChuyenGiaTamLy,
  quyMoToiDa,
  reducer,
  soNamTriLieuConLai,
  taiSanRong,
  taoGameMoi,
  thanhToanMoiNamCuaKhoanVay,
  themHanhPhuc,
  thuNhapThuDong,
  tinhHeSoChiPhi,
  tongTaiSan,
  traNoMoiNam,
  tuoiTaiNam,
  tyLeDongTra,
  vayToiDa,
  xeDangCo,
} from './engine'
import type { AssetId, CoHoi, GameState, TongKetNam, TrangThaiThiTruong } from './types'

const SEED = 12345
const moiVan = (ngheId = 'giaoVien') => taoGameMoi(ngheId, SEED)

/** Chạy hết chuỗi thẻ tiêu dùng, trả lời giống nhau cho mọi thẻ. */
function duyetHetThe(s: GameState, nhan: boolean): GameState {
  let cur = s
  let baoVe = 0
  while (cur.phase === 'theBai' && baoVe++ < 20) {
    cur = reducer(cur, { type: 'quyetDinhThe', nhan })
  }
  return cur
}

/**
 * Đi trọn một năm để kiểm cốt truyện: cấp đủ tiền mặt, trả chi phí,
 * từ chối hết thẻ, kéo hạnh phúc lên để không thua oan, rồi kết thúc năm.
 * Trả về trạng thái đang ở phase 'tongKet' (chưa đóng tổng kết).
 */
function diTronMotNam(s: GameState, tienMat = 800 * TRIEU): GameState {
  let cur: GameState = { ...s, tienMat }
  cur = reducer(cur, { type: 'traChiPhi' })
  cur = duyetHetThe(cur, false)
  cur = { ...cur, hanhPhuc: 85 }
  return reducer(cur, { type: 'ketThucNam' })
}

/**
 * Dựng sẵn một trạng thái tự do, dư tiền, và chỉ được mời đúng cơ hội cần kiểm —
 * để bài kiểm thử không phụ thuộc vào việc bốc trúng cơ hội nào.
 */
function moiDungMotCoHoi(
  coHoiId: string,
  ngheId = 'kySuPhanMem',
  tienMat = 5 * TY,
): { s: GameState; coHoi: CoHoi } {
  const coHoi = timCoHoi(coHoiId)!
  const s0 = reducer(moiVan(ngheId), { type: 'traChiPhi' })
  return { s: { ...s0, tienMat, coHoiNamNay: [coHoi] }, coHoi }
}

describe('khởi tạo', () => {
  it('tiền mặt ban đầu bằng đúng vốn của xuất thân mặc định (viên chức)', () => {
    const vienChuc = timXuatThan('vienChuc')!
    for (const nghe of NGHE) {
      const s = taoGameMoi(nghe.id, SEED)
      expect(s.tienMat).toBe(Math.round(nghe.luong * vienChuc.tyLeVonBanDau))
      expect(s.luong).toBe(nghe.luong)
      expect(s.chiPhiHangNam).toBe(nghe.chiPhi)
    }
  })

  it('bắt đầu ở năm 1, chưa trả chi phí, hạnh phúc theo config', () => {
    const s = moiVan()
    expect(s.nam).toBe(1)
    expect(s.phase).toBe('chiPhi')
    expect(s.daTraChiPhiNamNay).toBe(false)
    expect(s.hanhPhuc).toBe(CONFIG.hanhPhucBanDau)
  })

  it('cùng seed cho ra ván giống hệt nhau', () => {
    expect(taoGameMoi('bacSi', 777)).toEqual(taoGameMoi('bacSi', 777))
  })

  it('rút đúng số thẻ trong khoảng cấu hình', () => {
    const s = moiVan()
    expect(s.theConLai.length).toBeGreaterThanOrEqual(CONFIG.soTheMoiNamMin)
    expect(s.theConLai.length).toBeLessThanOrEqual(CONFIG.soTheMoiNamMax)
  })

  it('biểu đồ có sẵn lịch sử giá ngay từ năm 1, chốt tại giá hiện hành', () => {
    const s = moiVan()
    for (const [id, lichSu] of Object.entries(s.lichSuGia)) {
      expect(lichSu.length).toBe(CONFIG.soDiemGiaQuaKhu + 1)
      expect(lichSu[lichSu.length - 1]).toBe(s.giaTaiSan[id as keyof typeof s.giaTaiSan])
      for (const gia of lichSu) expect(gia).toBeGreaterThan(0)
    }
  })

  it('mọi thẻ tiêu dùng đều có biểu tượng minh hoạ', () => {
    for (const the of THE_TIEU_DUNG) expect(the.emoji.length).toBeGreaterThan(0)
  })
})

describe('chi phí hàng năm', () => {
  it('trừ đúng số tiền và mở sang giai đoạn thẻ', () => {
    const s = moiVan()
    const sau = reducer(s, { type: 'traChiPhi' })
    expect(sau.tienMat).toBe(s.tienMat - s.chiPhiHangNam)
    expect(sau.daTraChiPhiNamNay).toBe(true)
    expect(sau.phase).toBe('theBai')
  })

  it('không cho trả hai lần', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    expect(reducer(s, { type: 'traChiPhi' })).toBe(s)
  })

  it('chưa trả chi phí thì không kết thúc năm được', () => {
    const s = moiVan()
    expect(reducer(s, { type: 'ketThucNam' })).toBe(s)
  })
})

describe('thẻ tiêu dùng — cơ chế hai chiều', () => {
  it('nhận thì mất tiền và được điểm', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const the = s.theConLai[0]!
    const sau = reducer(s, { type: 'quyetDinhThe', nhan: true })
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, the.gia))
    expect(sau.hanhPhuc).toBe(s.hanhPhuc + the.diem)
  })

  it('từ chối thì giữ tiền nhưng MẤT đúng số điểm đó', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const the = s.theConLai[0]!
    const sau = reducer(s, { type: 'quyetDinhThe', nhan: false })
    expect(sau.tienMat).toBe(s.tienMat)
    expect(sau.hanhPhuc).toBe(s.hanhPhuc - the.diem)
  })

  it('biên độ giữa nhận và từ chối đúng bằng 2N', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const the = s.theConLai[0]!
    const nhan = reducer(s, { type: 'quyetDinhThe', nhan: true })
    const tuChoi = reducer(s, { type: 'quyetDinhThe', nhan: false })
    expect(nhan.hanhPhuc - tuChoi.hanhPhuc).toBe(2 * the.diem)
  })

  it('không đủ tiền thì bị coi như từ chối', () => {
    const s0 = reducer(moiVan(), { type: 'traChiPhi' })
    const ngheo: GameState = { ...s0, tienMat: 0 }
    const the = ngheo.theConLai[0]!
    const sau = reducer(ngheo, { type: 'quyetDinhThe', nhan: true })
    expect(sau.tienMat).toBe(0)
    expect(sau.hanhPhuc).toBe(ngheo.hanhPhuc - the.diem)
  })

  it('duyệt hết thẻ thì chuyển sang giai đoạn tự do', () => {
    const s = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), false)
    expect(s.phase).toBe('tuDo')
    expect(s.theConLai).toHaveLength(0)
  })
})

describe('hạnh phúc — lợi ích giảm dần', () => {
  it('dưới trần mềm thì cộng nguyên vẹn', () => {
    expect(themHanhPhuc(70, 10)).toBe(80)
  })

  it('phần vượt trần mềm bị chiết khấu', () => {
    const { hanhPhucTranMem: mem, hanhPhucHeSoVuotTran: he } = CONFIG
    expect(themHanhPhuc(mem, 10)).toBe(Math.round(mem + 10 * he))
  })

  it('không bao giờ vượt trần cứng', () => {
    expect(themHanhPhuc(100, 1000)).toBe(CONFIG.hanhPhucTranCung)
  })

  it('điểm trừ áp dụng nguyên vẹn và không xuống dưới 0', () => {
    expect(themHanhPhuc(60, -15)).toBe(45)
    expect(themHanhPhuc(5, -50)).toBe(0)
  })
})

describe('ngân hàng', () => {
  it('trần vay khiến tổng trả nợ không vượt 50% lương', () => {
    const s = moiVan()
    for (let kyHan = 1; kyHan <= CONFIG.kyHanVayToiDa; kyHan++) {
      const tran = vayToiDa(s, kyHan)
      const traMoiNam = thanhToanMoiNamCuaKhoanVay(tran, kyHan)
      expect(traMoiNam).toBeLessThanOrEqual(s.luong * CONFIG.tyLeThanhToanToiDa + 1)
    }
  })

  it('vay xong thì tiền mặt tăng và phát sinh nghĩa vụ trả nợ', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const goc = 50 * TRIEU
    const sau = reducer(s, { type: 'vay', goc, kyHan: 3 })
    expect(sau.tienMat).toBe(s.tienMat + goc)
    expect(sau.khoanVay).toHaveLength(1)
    expect(traNoMoiNam(sau)).toBeGreaterThan(0)
  })

  it('không cho vay quá trần', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const sau = reducer(s, { type: 'vay', goc: 999 * TRIEU, kyHan: 1 })
    expect(sau.khoanVay[0]!.goc).toBe(vayToiDa(s, 1))
  })
})

describe('đầu tư', () => {
  it('mua rồi bán ngay trong năm thì hoà vốn', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const mua = reducer(s, { type: 'dauTu', assetId: 'coPhieu', soDonVi: 100 })
    expect(mua.soHuu.coPhieu).toBe(100)
    const ban = reducer(mua, { type: 'ban', assetId: 'coPhieu', soDonVi: 100 })
    expect(ban.tienMat).toBe(s.tienMat)
    expect(ban.soHuu.coPhieu).toBe(0)
  })

  it('không mua được khi tiền mặt không đủ một đơn vị', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    expect(muaToiDa(s, 'batDongSan')).toBe(0)
    expect(reducer(s, { type: 'dauTu', assetId: 'batDongSan', soDonVi: 1 })).toBe(s)
  })

  it('tổng tài sản gồm cả tiền mặt lẫn danh mục', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const mua = reducer(s, { type: 'dauTu', assetId: 'coPhieu', soDonVi: 200 })
    expect(tongTaiSan(mua)).toBe(tongTaiSan(s))
  })
})

describe('chuyển năm', () => {
  const sangNamSau = (ngheId = 'giaoVien') => {
    let s = duyetHetThe(reducer(moiVan(ngheId), { type: 'traChiPhi' }), true)
    s = reducer(s, { type: 'ketThucNam' })
    return s
  }

  it('sang năm 2 và sinh ra bản tổng kết', () => {
    const s = sangNamSau()
    expect(s.nam).toBe(2)
    expect(s.phase).toBe('tongKet')
    expect(s.tongKet).not.toBeNull()
    expect(s.lichSu).toHaveLength(1)
  })

  it('lạm phát đẩy chi phí năm sau lên đúng hệ số', () => {
    const s = sangNamSau()
    const nghe = timNghe('giaoVien')!
    expect(s.chiPhiHangNam).toBe(
      Math.round(nghe.chiPhi * s.chiSoGia * s.heSoChiPhi),
    )
    expect(s.chiSoGia).toBeGreaterThan(1)
  })

  it('lạm phát nằm trong khoảng cấu hình', () => {
    const s = sangNamSau()
    expect(s.tongKet!.lamPhat).toBeGreaterThanOrEqual(CONFIG.lamPhatMin)
    expect(s.tongKet!.lamPhat).toBeLessThanOrEqual(CONFIG.lamPhatMax)
  })

  it('phạt khát vọng áp dụng khi chưa mua món của nghề', () => {
    const s = sangNamSau()
    expect(s.tongKet!.phatKhatVong).toBe(CONFIG.phatKhatVongMoiNam)
  })

  it('giá thẻ tiêu dùng cũng leo theo lạm phát', () => {
    const s = sangNamSau()
    const the = THE_TIEU_DUNG[0]!
    expect(giaThucTe(s, the.gia)).toBeGreaterThan(the.gia)
  })

  it('đóng tổng kết thì quay lại giai đoạn trả chi phí', () => {
    const s = reducer(sangNamSau(), { type: 'dongTongKet' })
    expect(s.phase).toBe('chiPhi')
    expect(s.daTraChiPhiNamNay).toBe(false)
    expect(s.tongKet).toBeNull()
  })
})

describe('bảng tổng kết — danh mục của bạn tách khỏi tin thị trường', () => {
  /** Đi trọn một năm với danh mục đặt sẵn, trả về bản tổng kết của năm đó. */
  const tongKetVoiDanhMuc = (mua: { assetId: 'coPhieu' | 'vang'; soDonVi: number }[]) => {
    let s = reducer(moiVan('kySuPhanMem'), { type: 'traChiPhi' })
    s = { ...s, tienMat: 5 * TY }
    for (const m of mua) s = reducer(s, { type: 'dauTu', ...m })
    s = duyetHetThe(s, false)
    s = { ...s, hanhPhuc: 90 }
    return reducer(s, { type: 'ketThucNam' }).tongKet!
  }

  it('không sở hữu cổ phiếu thì cổ phiếu KHÔNG bị tính là đang nắm giữ', () => {
    const tk = tongKetVoiDanhMuc([])
    const coPhieu = tk.bienDongTaiSan.find((t) => t.id === 'coPhieu')
    // Vẫn có mặt để kể tin thị trường, nhưng không được coi là danh mục của người chơi
    expect(coPhieu).toBeTruthy()
    expect(coPhieu!.dangNamGiu).toBe(false)
    expect(coPhieu!.loiTuc).toBe(0)
  })

  it('không sở hữu gì cả thì không kênh nào được đánh dấu đang nắm giữ', () => {
    const tk = tongKetVoiDanhMuc([])
    expect(tk.bienDongTaiSan.filter((t) => t.dangNamGiu)).toHaveLength(0)
  })

  it('mua cổ phiếu rồi thì cổ phiếu mới được đánh dấu đang nắm giữ', () => {
    const tk = tongKetVoiDanhMuc([{ assetId: 'coPhieu', soDonVi: 100 }])
    const coPhieu = tk.bienDongTaiSan.find((t) => t.id === 'coPhieu')!
    expect(coPhieu.dangNamGiu).toBe(true)
  })

  it('số kênh đánh dấu đang nắm giữ đúng bằng số kênh thật sự có trong tay', () => {
    const tk = tongKetVoiDanhMuc([
      { assetId: 'coPhieu', soDonVi: 100 },
      { assetId: 'vang', soDonVi: 10 },
    ])
    const dangGiu = tk.bienDongTaiSan.filter((t) => t.dangNamGiu)
    expect(dangGiu).toHaveLength(2)
    expect(dangGiu.map((t) => t.id).sort()).toEqual(['coPhieu', 'vang'])
  })

  it('luôn liệt kê đủ cả năm kênh để mục tin thị trường không bị khuyết', () => {
    for (const tk of [
      tongKetVoiDanhMuc([]),
      tongKetVoiDanhMuc([{ assetId: 'vang', soDonVi: 5 }]),
    ]) {
      expect(tk.bienDongTaiSan.map((t) => t.id)).toEqual(TAI_SAN.map((t) => t.id))
    }
  })
})

describe('điều kiện kết thúc', () => {
  it('thua khi hạnh phúc dưới ngưỡng lúc bấm kết thúc năm', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), false)
    const buon: GameState = { ...s0, hanhPhuc: CONFIG.hanhPhucNguongThua - 1 }
    const sau = reducer(buon, { type: 'ketThucNam' })
    expect(sau.trangThai).toBe('thua')
    expect(sau.phase).toBe('ketThuc')
  })

  it('hạnh phúc đúng bằng ngưỡng thì vẫn qua được', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), false)
    const vuaDu: GameState = { ...s0, hanhPhuc: CONFIG.hanhPhucNguongThua }
    expect(reducer(vuaDu, { type: 'ketThucNam' }).trangThai).toBe('dangChoi')
  })

  /**
   * 5 tỷ trái phiếu, lợi tức kỳ vọng 6% = 300 triệu mỗi năm — thừa sức phủ
   * nghĩa vụ năm đầu của giáo viên (108 triệu sinh hoạt + phí bảo hiểm y tế,
   * nhân hệ số an toàn) kể cả sau khi lạm phát đẩy chi phí lên.
   */
  const dungTrangThaiTuDo = (): GameState => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), true)
    return {
      ...s0,
      tienMat: 200 * TRIEU,
      soHuu: { ...s0.soHuu, traiPhieu: 5000 },
    }
  }

  it('tiền mặt chất đống nhưng không đẻ ra dòng tiền thì vẫn chưa thắng', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), true)
    const giau: GameState = { ...s0, tienMat: 50 * TY }
    expect(reducer(giau, { type: 'ketThucNam' }).trangThai).toBe('dangChoi')
  })

  it('vàng không sinh lợi tức nên không mua nổi tự do tài chính', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), true)
    // 50 tỷ vàng — giàu nứt đố đổ vách mà dòng tiền thụ động vẫn bằng 0
    const omVang: GameState = { ...s0, soHuu: { ...s0.soHuu, vang: 6000 } }
    expect(dongTienThuDong(omVang)).toBe(0)
    expect(reducer(omVang, { type: 'ketThucNam' }).trangThai).toBe('dangChoi')
  })

  it('thắng khi dòng tiền thụ động phủ được nghĩa vụ hàng năm', () => {
    const sau = reducer(dungTrangThaiTuDo(), { type: 'ketThucNam' })
    expect(sau.trangThai).toBe('thang')
    expect(dongTienThuDong(sau)).toBeGreaterThanOrEqual(mucTieuTuDo(sau))
  })

  it('trả nợ tính vào nghĩa vụ nên vay kịch trần không phải đường tắt', () => {
    const s0 = dungTrangThaiTuDo()
    const coNo: GameState = {
      ...s0,
      khoanVay: [
        { id: 'thu', goc: 1 * TY, kyHan: 10, thanhToanMoiNam: 180 * TRIEU, namConLai: 10 },
      ],
    }
    expect(nghiaVuHangNam(coNo)).toBe(nghiaVuHangNam(s0) + 180 * TRIEU)
    expect(reducer(coNo, { type: 'ketThucNam' }).trangThai).toBe('dangChoi')
  })

  it('thắng rồi vẫn chơi tiếp được tới viên mãn, không thắng lặp lại', () => {
    const thang = reducer(dungTrangThaiTuDo(), { type: 'ketThucNam' })
    expect(thang.trangThai).toBe('thang')
    expect(thang.daTuDo).toBe(true)

    const tiep = reducer(thang, { type: 'choiTiepSauThang' })
    expect(tiep.trangThai).toBe('dangChoi')
    expect(tiep.phase).toBe('chiPhi')

    // Vẫn tự do tài chính nhưng không kích hoạt thắng lần hai
    const nam2 = diTronMotNam(tiep, tiep.tienMat)
    expect(nam2.trangThai).toBe('dangChoi')

    // Và tới hết năm 80 thì khép lại viên mãn, ghi nhận đã tự do trên đường đi
    const cuoiDoi = diTronMotNam({ ...tiep, nam: 80 }, tiep.tienMat)
    expect(cuoiDoi.trangThai).toBe('vienMan')
    expect(cuoiDoi.lyDoKetThuc).toContain('chinh phục')
  })

  it('hết năm 80 — qua tuổi 100 — thì khép lại hành trình viên mãn', () => {
    const s = diTronMotNam({ ...moiVan(), nam: 80 }, 500 * TRIEU)
    expect(tuoiTaiNam(80)).toBe(CONFIG.cotTruyen.tuoiVienMan)
    expect(s.trangThai).toBe('vienMan')
    expect(s.lyDoKetThuc).toBeTruthy()
  })

  it('hết năm 79 chưa tự do tài chính thì vẫn đang chơi', () => {
    const s = diTronMotNam({ ...moiVan(), nam: 79 }, 500 * TRIEU)
    expect(s.trangThai).toBe('dangChoi')
    expect(s.nam).toBe(80)
  })
})

describe('mua sắm và học hành', () => {
  it('khoá học làm lương tăng trong khoảng công bố', () => {
    const s = reducer(moiVan('kySuPhanMem'), { type: 'traChiPhi' })
    const kh = { id: 'online', min: 0.06, max: 0.12 }
    const sau = reducer(s, { type: 'muaKhoaHoc', khoaHocId: kh.id })
    const tyLe = sau.luong / s.luong - 1
    expect(tyLe).toBeGreaterThanOrEqual(kh.min - 1e-9)
    expect(tyLe).toBeLessThanOrEqual(kh.max + 1e-9)
    expect(sau.khoaHocDaMua).toContain('online')
  })

  it('không mua lại khoá đã học', () => {
    const s = reducer(moiVan('kySuPhanMem'), { type: 'traChiPhi' })
    const mot = reducer(s, { type: 'muaKhoaHoc', khoaHocId: 'online' })
    expect(reducer(mot, { type: 'muaKhoaHoc', khoaHocId: 'online' })).toBe(mot)
  })

  it('không mua được món ước nguyện khi thiếu tiền', () => {
    // Giáo viên trả chi phí xong chỉ còn 72tr, trong khi xe máy giá 80tr
    const s = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    expect(s.tienMat).toBeLessThan(80 * TRIEU)
    expect(reducer(s, { type: 'muaUocNguyen', uocNguyenId: 'xeMay' })).toBe(s)
  })

  it('giá ước nguyện khoá tại đầu ván, không leo theo lạm phát', () => {
    const s0 = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    const s: GameState = { ...s0, chiSoGia: 1.5, tienMat: 200 * TRIEU }
    const sau = reducer(s, { type: 'muaUocNguyen', uocNguyenId: 'xeMay' })
    expect(sau.uocNguyenDaMua).toContain('xeMay')
    // Xe máy giá gốc 80 triệu — dù chỉ số giá đã 1,5 vẫn chỉ trừ đúng 80 triệu
    expect(sau.tienMat).toBe(200 * TRIEU - 80 * TRIEU)
  })

  it('mua món khát vọng thì hết bị phạt hạnh phúc và được thưởng mỗi năm', () => {
    const s0 = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    let s: GameState = { ...s0, tienMat: 200 * TRIEU }
    s = reducer(s, { type: 'muaUocNguyen', uocNguyenId: 'xeMay' })
    expect(s.uocNguyenDaMua).toContain('xeMay')
    s = duyetHetThe(s, true)
    // Neo dưới trần mềm để nhận trọn vẹn phần thưởng danh nghĩa
    s = { ...s, hanhPhuc: 70 }
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.tongKet!.phatKhatVong).toBe(0)
    expect(s.tongKet!.hanhPhucTuUocNguyen).toBe(5)
  })

  it('phần thưởng ước nguyện ghi số điểm THỰC nhận khi đã sát trần hạnh phúc', () => {
    const s0 = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    let s: GameState = { ...s0, tienMat: 200 * TRIEU }
    s = reducer(s, { type: 'muaUocNguyen', uocNguyenId: 'xeMay' })
    s = duyetHetThe(s, false)
    s = { ...s, hanhPhuc: CONFIG.hanhPhucTranCung }
    s = reducer(s, { type: 'ketThucNam' })
    // Danh nghĩa +5 nhưng đang ở sát trần nên phần thực nhận bị chiết khấu
    expect(s.tongKet!.hanhPhucTuUocNguyen).toBeLessThan(5)
    expect(s.tongKet!.hanhPhucTuUocNguyen).toBeGreaterThanOrEqual(0)
  })

  it('bảo hiểm chỉ có hiệu lực trong năm mua', () => {
    let s = reducer(moiVan('bacSi'), { type: 'traChiPhi' })
    s = reducer(s, { type: 'muaBaoHiem' })
    expect(s.baoHiemDenNam).toBe(1)
    s = duyetHetThe(s, true)
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.baoHiemDenNam).toBeLessThan(s.nam)
  })
})

describe('bảo hiểm xe', () => {
  /** Trạng thái tự do, rủng rỉnh tiền và đã có sẵn (các) chiếc xe cần kiểm. */
  const coXe = (xeIds: string[], tienMat = 5 * TY): GameState => {
    const s = reducer(moiVan('bacSi'), { type: 'traChiPhi' })
    return { ...s, tienMat, uocNguyenDaMua: xeIds }
  }

  it('chưa mua ước nguyện xe nào thì không có xe và không mua được bảo hiểm xe', () => {
    const s = coXe([])
    expect(xeDangCo(s)).toBeNull()
    for (const loai of ['trachNhiemDanSu', 'vatChatXe', 'taiNanNguoiTrenXe'] as const) {
      expect(reducer(s, { type: 'muaBaoHiemXe', loai })).toBe(s)
    }
  })

  it('có cả xe máy lẫn ô tô thì hồ sơ bám theo chiếc giá trị cao nhất', () => {
    const s = coXe(['xeMay', 'oTo'])
    const xe = xeDangCo(s)!
    expect(xe.uocNguyenId).toBe('oTo')
    expect(xe.giaTri).toBe(giaThucTe(s, timUocNguyen('oTo')!.gia))
    expect(xe.emoji.length).toBeGreaterThan(0)
  })

  it('phí ba loại đúng bằng tỉ lệ cấu hình nhân giá trị xe của năm nay', () => {
    const s = coXe(['xeMay'])
    const giaTri = xeDangCo(s)!.giaTri
    expect(giaTri).toBe(80 * TRIEU) // năm 1, chỉ số giá còn bằng 1
    const bh = CONFIG.baoHiemXe
    expect(phiBaoHiemXe(s, 'trachNhiemDanSu')).toBe(
      Math.round(giaTri * bh.tyLePhiTrachNhiemDanSu),
    )
    expect(phiBaoHiemXe(s, 'vatChatXe')).toBe(Math.round(giaTri * bh.tyLePhiVatChatXe))
    expect(phiBaoHiemXe(s, 'taiNanNguoiTrenXe')).toBe(
      Math.round(giaTri * bh.tyLePhiTaiNanNguoiTrenXe),
    )
    // Trách nhiệm dân sự là loại rẻ nhất, vật chất xe là loại đắt nhất
    expect(phiBaoHiemXe(s, 'trachNhiemDanSu')).toBeLessThan(
      phiBaoHiemXe(s, 'taiNanNguoiTrenXe'),
    )
    expect(phiBaoHiemXe(s, 'vatChatXe')).toBeGreaterThan(
      phiBaoHiemXe(s, 'taiNanNguoiTrenXe'),
    )
  })

  it('phí leo theo lạm phát qua các năm', () => {
    const s = coXe(['oTo'])
    const phiNam1 = phiBaoHiemXe(s, 'vatChatXe')
    const veSau: GameState = { ...s, nam: 21, chiSoGia: 2.5 }
    expect(phiBaoHiemXe(veSau, 'vatChatXe')).toBe(Math.round(phiNam1 * 2.5))
  })

  it('bảo hiểm xe chỉ có hiệu lực trong năm mua, giống bảo hiểm y tế', () => {
    let s = coXe(['oTo'])
    expect(dangCoBaoHiemXe(s, 'trachNhiemDanSu')).toBe(false)
    s = reducer(s, { type: 'muaBaoHiemXe', loai: 'trachNhiemDanSu' })
    expect(dangCoBaoHiemXe(s, 'trachNhiemDanSu')).toBe(true)
    expect(s.baoHiemXe.trachNhiemDanSu).toBe(1)
    // Mua một loại không kéo theo hai loại còn lại
    expect(dangCoBaoHiemXe(s, 'vatChatXe')).toBe(false)
    expect(dangCoBaoHiemXe(s, 'taiNanNguoiTrenXe')).toBe(false)

    s = duyetHetThe(s, false)
    s = { ...s, hanhPhuc: 90 }
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.nam).toBe(2)
    expect(s.baoHiemXe.trachNhiemDanSu).toBeLessThan(s.nam)
    expect(dangCoBaoHiemXe(s, 'trachNhiemDanSu')).toBe(false)
  })

  it('mua thì trừ đúng phí, còn thiếu tiền thì không mua được', () => {
    const s = coXe(['oTo'])
    const phi = phiBaoHiemXe(s, 'vatChatXe')
    expect(phi).toBeGreaterThan(0)
    const sau = reducer(s, { type: 'muaBaoHiemXe', loai: 'vatChatXe' })
    expect(sau.tienMat).toBe(s.tienMat - phi)

    const ngheo: GameState = { ...s, tienMat: phi - 1 }
    expect(reducer(ngheo, { type: 'muaBaoHiemXe', loai: 'vatChatXe' })).toBe(ngheo)
  })

  it('không mua hai lần cùng một loại trong cùng một năm', () => {
    const s = coXe(['oTo'])
    const mot = reducer(s, { type: 'muaBaoHiemXe', loai: 'taiNanNguoiTrenXe' })
    expect(mot).not.toBe(s)
    expect(reducer(mot, { type: 'muaBaoHiemXe', loai: 'taiNanNguoiTrenXe' })).toBe(mot)
  })
})

describe('mua lại món ước nguyện đã mất', () => {
  const O_TO = timUocNguyen('oTo')!
  /** Dư dả tiền mặt để bán tài sản hay túng thiếu không làm nhiễu phép đo. */
  const TIEN_DU = 20 * TY

  /** Ván của bác sĩ — khát vọng đúng là ô tô — đã có sẵn xe và rủng rỉnh tiền. */
  const vanCoOTo = (seed: number): GameState => ({
    ...taoGameMoi('bacSi', seed),
    tienMat: TIEN_DU,
    uocNguyenDaMua: ['oTo'],
  })

  /**
   * Quét seed cho tới khi gặp một ván có sự kiện mất trộm xe, trả về trạng thái
   * ngay TRƯỚC năm xảy ra (đang ở giai đoạn trả chi phí) và trạng thái SAU năm đó.
   *
   * Xác suất mất trộm nằm trong CONFIG và có thể được hạ rất thấp mỗi lần cân
   * bằng lại game, nên bài kiểm thử không đoán trước seed nào mà quét cả một
   * khoảng rộng. Vẫn tất định, vì mọi ván đều suy ra từ seed.
   *
   * Hai nhánh có / không có bảo hiểm vật chất tiêu thụ cùng một số bước ngẫu
   * nhiên cho tới lúc bốc mất trộm, nên cùng một `truoc` chạy lại với
   * `baoHiemXe.vatChatXe` khác nhau vẫn gặp đúng cú mất trộm đó.
   */
  function timVanCoMatTromXe(
    tuyBien: (s: GameState) => GameState = (s) => s,
    soSeed = 3000,
    soNamMoiSeed = 8,
  ): { truoc: GameState; sau: GameState } {
    let kq: { truoc: GameState; sau: GameState } | null = null
    for (let seed = 1; seed <= soSeed && !kq; seed++) {
      let cur = tuyBien(vanCoOTo(seed))
      for (let i = 0; i < soNamMoiSeed && !kq && cur.trangThai === 'dangChoi'; i++) {
        const sau = diTronMotNam(cur, TIEN_DU)
        if (sau.tongKet!.suKien.some((k) => k.loai === 'matTromXe')) {
          kq = { truoc: cur, sau }
        } else {
          cur = reducer(sau, { type: 'dongTongKet' })
        }
      }
    }
    expect(
      kq,
      `Quét ${soSeed} seed × ${soNamMoiSeed} năm mà không gặp lần mất trộm xe nào` +
        ` (xác suất đang là ${CONFIG.baoHiemXe.matTromXacSuat}) — hãy nới rộng khoảng quét.`,
    ).not.toBeNull()
    return kq!
  }

  it('ván mới chưa mất món nào và giá mọi món đúng bằng giá đóng băng', () => {
    const s = moiVan()
    expect(s.uocNguyenDaMat).toEqual([])
    for (const un of UOC_NGUYEN) expect(giaUocNguyen(s, un.id)).toBe(un.gia)
  })

  it('chưa từng mất gì thì giá ước nguyện đứng yên qua mấy chục năm lạm phát', () => {
    let s = moiVan()
    for (let i = 0; i < 20 && s.trangThai === 'dangChoi'; i++) {
      s = reducer(diTronMotNam(s), { type: 'dongTongKet' })
    }
    expect(s.uocNguyenDaMat).toEqual([])
    expect(s.chiSoGia).toBeGreaterThan(1.5)
    for (const un of UOC_NGUYEN) {
      expect(giaUocNguyen(s, un.id)).toBe(un.gia)
      // Lạm phát là có thật — chỉ riêng giấc mơ được đóng băng giá
      expect(giaThucTe(s, un.gia)).toBeGreaterThan(un.gia)
    }
  })

  it('mất trộm khi KHÔNG có bảo hiểm vật chất thì mất xe và giá nhảy theo lạm phát', () => {
    const { truoc, sau } = timVanCoMatTromXe()
    expect(truoc.uocNguyenDaMua).toContain('oTo')
    expect(truoc.uocNguyenDaMat).toEqual([])
    expect(dangCoBaoHiemXe(truoc, 'vatChatXe')).toBe(false)

    const matTrom = sau.tongKet!.suKien.find((k) => k.loai === 'matTromXe')!
    expect(matTrom.hanhPhucThayDoi).toBeLessThan(0)
    expect(sau.uocNguyenDaMua).not.toContain('oTo')
    expect(sau.uocNguyenDaMat).toEqual(['oTo'])
    expect(xeDangCo(sau)).toBeNull()

    // Từ đây muốn có lại chiếc xe thì phải trả bằng tiền của hôm nay
    expect(sau.chiSoGia).toBeGreaterThan(1)
    expect(giaUocNguyen(sau, 'oTo')).toBe(giaThucTe(sau, O_TO.gia))
    expect(giaUocNguyen(sau, 'oTo')).toBeGreaterThan(O_TO.gia)
    // Món chưa từng mất vẫn giữ nguyên giá đóng băng
    expect(giaUocNguyen(sau, 'canHo')).toBe(timUocNguyen('canHo')!.gia)
  })

  it('mất trộm khi CÓ bảo hiểm vật chất thì xe vẫn còn và giá không đổi', () => {
    const { truoc } = timVanCoMatTromXe()
    const coBaoHiem = diTronMotNam(
      { ...truoc, baoHiemXe: { ...truoc.baoHiemXe, vatChatXe: truoc.nam } },
      TIEN_DU,
    )
    const matTrom = coBaoHiem.tongKet!.suKien.find((k) => k.loai === 'matTromXe')
    expect(matTrom).toBeTruthy()
    // Bảo hiểm đền đúng giá trị, không mất hạnh phúc và không mất chiếc xe
    expect(matTrom!.hanhPhucThayDoi).toBe(0)
    expect(coBaoHiem.uocNguyenDaMua).toContain('oTo')
    expect(coBaoHiem.uocNguyenDaMat).toEqual([])
    expect(giaUocNguyen(coBaoHiem, 'oTo')).toBe(O_TO.gia)
  })

  it('mua lại xe đã mất phải trả giá hiện hành, chỉ đủ giá gốc là không mua nổi', () => {
    const { sau } = timVanCoMatTromXe()
    const s = reducer(sau, { type: 'dongTongKet' })
    const giaHienHanh = giaUocNguyen(s, 'oTo')
    expect(giaHienHanh).toBe(giaThucTe(s, O_TO.gia))
    expect(giaHienHanh).toBeGreaterThan(O_TO.gia)

    // Cầm đúng số tiền của thời trẻ thì không còn mua nổi chiếc xe của hôm nay
    const chiDuGiaGoc: GameState = { ...s, tienMat: O_TO.gia }
    expect(reducer(chiDuGiaGoc, { type: 'muaUocNguyen', uocNguyenId: 'oTo' })).toBe(
      chiDuGiaGoc,
    )

    const duTien: GameState = { ...s, tienMat: giaHienHanh }
    const muaLai = reducer(duTien, { type: 'muaUocNguyen', uocNguyenId: 'oTo' })
    expect(muaLai.uocNguyenDaMua).toContain('oTo')
    expect(muaLai.tienMat).toBe(0)
    // Vẫn ghi nhận là món đã từng mất, nên lần sau cũng tính theo giá hiện hành
    expect(muaLai.uocNguyenDaMat).toEqual(['oTo'])
  })

  it('mua lại xong thì hạnh phúc mỗi năm quay lại và hết bị phạt khát vọng', () => {
    const { sau } = timVanCoMatTromXe()
    const daMat = reducer(sau, { type: 'dongTongKet' })
    expect(daMat.khatVongId).toBe('oTo')
    expect(daDatKhatVong(daMat)).toBe(false)
    expect(hanhPhucTuUocNguyen(daMat)).toBe(0)

    // Năm sống trong cảnh mất xe: phạt khát vọng quay lại, hết hạnh phúc ước nguyện
    const namMatXe = diTronMotNam(daMat, TIEN_DU)
    expect(namMatXe.tongKet!.phatKhatVong).toBeGreaterThan(0)
    expect(namMatXe.tongKet!.hanhPhucTuUocNguyen).toBe(0)

    const muaLai = reducer(
      { ...daMat, tienMat: TIEN_DU },
      { type: 'muaUocNguyen', uocNguyenId: 'oTo' },
    )
    expect(daDatKhatVong(muaLai)).toBe(true)
    expect(hanhPhucTuUocNguyen(muaLai)).toBe(O_TO.hanhPhucMoiNam)

    // Mua sẵn bảo hiểm vật chất để một cú mất trộm nữa không xoá mất phép đo
    const namCoXe = diTronMotNam(
      { ...muaLai, baoHiemXe: { ...muaLai.baoHiemXe, vatChatXe: muaLai.nam } },
      TIEN_DU,
    )
    expect(namCoXe.tongKet!.phatKhatVong).toBe(0)
    expect(namCoXe.tongKet!.hanhPhucTuUocNguyen).toBeGreaterThan(0)
    expect(namCoXe.tongKet!.hanhPhucTuUocNguyen).toBeLessThanOrEqual(
      O_TO.hanhPhucMoiNam,
    )
  })

  it('mất rồi mua lại rồi lại mất thì món đó chỉ được ghi một lần', () => {
    // Dựng đúng cảnh "đã từng mất chiếc xe này rồi tậu lại": xe đang có trong tay
    // mà tên nó đã nằm sẵn trong danh sách đã mất.
    const { truoc, sau } = timVanCoMatTromXe((s) => ({
      ...s,
      uocNguyenDaMat: ['oTo'],
    }))
    expect(truoc.uocNguyenDaMat).toEqual(['oTo'])
    expect(sau.tongKet!.suKien.some((k) => k.loai === 'matTromXe')).toBe(true)
    expect(sau.uocNguyenDaMua).not.toContain('oTo')
    expect(sau.uocNguyenDaMat).toEqual(['oTo'])
    expect(sau.uocNguyenDaMat.filter((id) => id === 'oTo')).toHaveLength(1)
  })
})

describe('cơ hội kinh doanh', () => {
  it('góp vốn tạo ra thu nhập thụ động hàng năm', () => {
    const { s, coHoi } = moiDungMotCoHoi('quanCaPhe')
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    expect(sau.doanhNghiep).toHaveLength(1)
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, coHoi.gia))
    expect(sau.coHoiNamNay).toHaveLength(0)
    // Doanh nghiệp ghi lại mức nền và mặt bằng giá lúc góp vốn để còn bám lạm phát
    const dn = sau.doanhNghiep[0]!
    expect(dn.coHoiId).toBe(coHoi.id)
    expect(dn.thuNhapNen).toBe(giaThucTe(s, coHoi.thuNhapMoiNam!))
    expect(dn.chiSoGiaLucMua).toBe(s.chiSoGia)
    expect(thuNhapThuDong(sau)).toBe(dn.thuNhapNen)
  })

  it('từ chối thì chỉ bỏ đúng cơ hội đó, không mất tiền', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const bo = s.coHoiNamNay[0]!
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: bo.id, nhan: false })
    expect(sau.tienMat).toBe(s.tienMat)
    // Mỗi năm mời nhiều cơ hội, bỏ một cái thì những cái còn lại vẫn nằm đó
    expect(sau.coHoiNamNay).toHaveLength(s.coHoiNamNay.length - 1)
    expect(sau.coHoiNamNay.some((c) => c.id === bo.id)).toBe(false)
  })
})

describe('cơ hội gắn với nghề nghiệp và thâm niên', () => {
  /** Chạy nhiều năm liên tiếp, ghi lại bộ cơ hội được mời của từng năm. */
  const coHoiQuaCacNam = (ngheId: string, soNam: number) => {
    let cur = moiVan(ngheId)
    const nhatKy: { nam: number; coHoi: CoHoi[] }[] = [
      { nam: cur.nam, coHoi: cur.coHoiNamNay },
    ]
    for (let i = 0; i < soNam && cur.trangThai === 'dangChoi'; i++) {
      cur = reducer(diTronMotNam(cur, 5 * TY), { type: 'dongTongKet' })
      nhatKy.push({ nam: cur.nam, coHoi: cur.coHoiNamNay })
    }
    return nhatKy
  }

  it('cơ hội gắn nghề chỉ đến với đúng nghề đó', () => {
    for (const nghe of NGHE) {
      const nhatKy = coHoiQuaCacNam(nghe.id, 25)
      for (const { coHoi } of nhatKy) {
        for (const c of coHoi) {
          if (c.ngheId !== undefined) expect(c.ngheId).toBe(nghe.id)
        }
      }
      // Và nghề nào cũng phải thật sự được mời mạch cơ hội riêng của mình
      expect(nhatKy.some(({ coHoi }) => coHoi.some((c) => c.ngheId === nghe.id))).toBe(
        true,
      )
    }
  })

  it('cơ hội đòi thâm niên không xuất hiện trước năm tối thiểu', () => {
    for (const nghe of NGHE) {
      for (const { nam, coHoi } of coHoiQuaCacNam(nghe.id, 25)) {
        for (const c of coHoi) {
          if (c.namToiThieu !== undefined) {
            expect(nam).toBeGreaterThanOrEqual(c.namToiThieu)
          }
        }
      }
    }
  })

  it('cơ hội chỉ một lần thì tham gia xong không bao giờ được mời lại', () => {
    const coHoi = timCoHoi('traiHeHocSinh')!
    expect(coHoi.chiMotLan).toBe(true)

    const s0 = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    // Đặt ở năm 5 để vượt yêu cầu thâm niên của cơ hội này
    let s: GameState = { ...s0, nam: 5, tienMat: 5 * TY, coHoiNamNay: [coHoi] }
    expect(coHoiHopLe(coHoi, s)).toBe(true)

    s = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    expect(s.coHoiDaLam).toContain(coHoi.id)
    expect(coHoiHopLe(coHoi, s)).toBe(false)

    for (let i = 0; i < 20 && s.trangThai === 'dangChoi'; i++) {
      s = reducer(diTronMotNam(s, 5 * TY), { type: 'dongTongKet' })
      expect(s.coHoiNamNay.some((c) => c.id === coHoi.id)).toBe(false)
      expect(s.coHoiDaLam).toContain(coHoi.id)
    }
  })

  it('mỗi năm mời đúng số cơ hội cấu hình và không trùng id trong cùng một năm', () => {
    for (const nghe of NGHE) {
      for (const { coHoi } of coHoiQuaCacNam(nghe.id, 20)) {
        expect(coHoi.length).toBe(CONFIG.soCoHoiMoiNam)
        expect(new Set(coHoi.map((c) => c.id)).size).toBe(coHoi.length)
      }
    }
  })
})

describe('thu nhập doanh nghiệp biến động từng năm', () => {
  /** Góp vốn vào một cơ hội kinh doanh rồi trả về trạng thái ngay sau khi góp. */
  const gopVon = (coHoiId: string, tienMat = 8 * TY): GameState => {
    const { s, coHoi } = moiDungMotCoHoi(coHoiId, 'kySuPhanMem', tienMat)
    return reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
  }

  /** Đóng năm ngay tại chỗ, không đụng tới tiền mặt đang có. */
  const dongNam = (s: GameState): GameState => {
    let cur = duyetHetThe(s, false)
    cur = { ...cur, hanhPhuc: 90 }
    return reducer(cur, { type: 'ketThucNam' })
  }

  it('thu nhập mỗi năm nằm trong biên độ riêng của ngành', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = gopVon(coHoi.id)
    const nen = thuNhapThuDong(s)
    expect(nen).toBeGreaterThan(0)

    const tk = dongNam(s).tongKet!
    expect(tk.thuNhapDoanhNghiep).toHaveLength(1)
    const dong = tk.thuNhapDoanhNghiep[0]!
    expect(dong.coHoiId).toBe(coHoi.id)
    expect(dong.ten).toBe(coHoi.ten)
    expect(dong.soTien).toBeGreaterThanOrEqual(
      Math.floor(nen * (1 + coHoi.bienDongThuNhapMin!)),
    )
    expect(dong.soTien).toBeLessThanOrEqual(
      Math.ceil(nen * (1 + coHoi.bienDongThuNhapMax!)),
    )
  })

  it('tổng các dòng doanh nghiệp đúng bằng thu nhập thụ động của năm', () => {
    let s = gopVon('quanCaPhe')
    s = { ...s, coHoiNamNay: [timCoHoi('nhaTroCongNhan')!] }
    s = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: 'nhaTroCongNhan', nhan: true })
    expect(s.doanhNghiep).toHaveLength(2)

    const tk = dongNam(s).tongKet!
    expect(tk.thuNhapDoanhNghiep).toHaveLength(2)
    const tong = tk.thuNhapDoanhNghiep.reduce((t, d) => t + d.soTien, 0)
    expect(tong).toBe(tk.thuNhapThuDong)
  })

  it('số tiền thực nhận nằm trong biên độ do bienDoThuNhapThuDong công bố', () => {
    const s = gopVon('vuonSauRieng')
    const bienDo = bienDoThuNhapThuDong(s)
    expect(bienDo.cao).toBeGreaterThan(bienDo.thap)
    const tk = dongNam(s).tongKet!
    expect(tk.thuNhapThuDong).toBeGreaterThanOrEqual(bienDo.thap - 1)
    expect(tk.thuNhapThuDong).toBeLessThanOrEqual(bienDo.cao + 1)
  })

  it('KHÔNG cố định: chạy nhiều năm cho ra những con số khác nhau', () => {
    let s = gopVon('quanCaPhe')
    const soTien: number[] = []
    const bienDong: number[] = []
    for (let i = 0; i < 8 && s.trangThai === 'dangChoi'; i++) {
      const sau = diTronMotNam(s, 5 * TY)
      const dong = sau.tongKet!.thuNhapDoanhNghiep[0]!
      soTien.push(dong.soTien)
      bienDong.push(dong.bienDong)
      s = reducer(sau, { type: 'dongTongKet' })
    }
    expect(soTien).toHaveLength(8)
    expect(new Set(soTien).size).toBeGreaterThan(1)
    // Biên độ dao động thật, chứ không phải chỉ nhích lên theo lạm phát
    expect(Math.max(...bienDong) - Math.min(...bienDong)).toBeGreaterThan(0.1)
  })

  it('mức nền bám lạm phát nên vài chục năm sau vẫn còn giá trị thật', () => {
    let s = gopVon('nhaTroCongNhan')
    const nenLucGopVon = thuNhapThuDong(s)
    for (let i = 0; i < 20 && s.trangThai === 'dangChoi'; i++) {
      s = reducer(diTronMotNam(s, 5 * TY), { type: 'dongTongKet' })
    }
    expect(s.chiSoGia).toBeGreaterThan(1.5)
    expect(thuNhapThuDong(s)).toBeGreaterThan(nenLucGopVon * 1.5)
  })
})

describe('cơ hội tổ chức sự kiện', () => {
  it('tham gia thì trừ tiền ngay và khoản nằm chờ mở kết quả cuối năm', () => {
    const { s, coHoi } = moiDungMotCoHoi('hoiChoTet', 'giaoVien', 2 * TY)
    expect(coHoi.loai).toBe('toChucSuKien')
    const gia = giaThucTe(s, coHoi.gia)
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    expect(sau.tienMat).toBe(s.tienMat - gia)
    expect(sau.khoanDangCho).toEqual([
      { coHoiId: coHoi.id, gia, loai: 'toChucSuKien' },
    ])
    // Bỏ vốn ra tổ chức một mùa sự kiện thì không sinh ra doanh nghiệp nào
    expect(sau.doanhNghiep).toHaveLength(0)
  })

  it('cuối năm mở kết quả đúng một lần, tiền về trong biên lợi nhuận công bố', () => {
    const { s: s0, coHoi } = moiDungMotCoHoi('thauTiecCuoi', 'giaoVien', 2 * TY)
    const gia = giaThucTe(s0, coHoi.gia)
    let s = reducer(s0, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    s = duyetHetThe(s, false)
    s = { ...s, hanhPhuc: 90 }
    s = reducer(s, { type: 'ketThucNam' })

    const ketQua = s.tongKet!.suKien.filter((k) => k.loai === 'suKienKetQua')
    expect(ketQua).toHaveLength(1)
    // Sự kiện kể mức lãi/lỗ ròng, nên tiền về = vốn + phần chênh
    const tienVe = ketQua[0]!.tienThayDoi + gia
    expect(tienVe).toBeGreaterThanOrEqual(
      Math.floor(gia * (1 + coHoi.loiNhuanMin!)),
    )
    expect(tienVe).toBeLessThanOrEqual(Math.ceil(gia * (1 + coHoi.loiNhuanMax!)))
    // Năm tệ nhất cũng chỉ lỗ một phần vốn chứ không mất trắng như canh bạc
    expect(tienVe).toBeGreaterThan(0)
    expect(s.khoanDangCho).toHaveLength(0)
  })

  it('không sinh ra doanh nghiệp và các năm sau không còn dòng tiền nào từ nó', () => {
    const { s: s0, coHoi } = moiDungMotCoHoi('giaiChayThanhPho', 'giaoVien', 2 * TY)
    let s = reducer(s0, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    s = duyetHetThe(s, false)
    s = { ...s, hanhPhuc: 90 }
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.tongKet!.suKien.some((k) => k.loai === 'suKienKetQua')).toBe(true)
    expect(s.doanhNghiep).toHaveLength(0)
    expect(s.tongKet!.thuNhapDoanhNghiep).toHaveLength(0)
    expect(s.tongKet!.thuNhapThuDong).toBe(0)

    s = reducer(s, { type: 'dongTongKet' })
    for (let i = 0; i < 5 && s.trangThai === 'dangChoi'; i++) {
      const sau = diTronMotNam(s, 2 * TY)
      expect(sau.doanhNghiep).toHaveLength(0)
      expect(sau.tongKet!.thuNhapDoanhNghiep).toHaveLength(0)
      expect(sau.tongKet!.thuNhapThuDong).toBe(0)
      expect(sau.tongKet!.suKien.some((k) => k.loai === 'suKienKetQua')).toBe(false)
      s = reducer(sau, { type: 'dongTongKet' })
    }
  })
})

describe('cốt truyện trăm năm', () => {
  it('tuổi tính từ 21: năm 1 = 21 tuổi, năm 40 = 60 tuổi', () => {
    expect(tuoiTaiNam(1)).toBe(CONFIG.cotTruyen.tuoiBatDau)
    expect(tuoiTaiNam(40)).toBe(CONFIG.cotTruyen.tuoiNghiHuu)
  })

  it('cưới đúng năm đã hẹn, rồi sinh đúng hai con đúng năm trong cotTruyen', () => {
    let s = moiVan()
    const { namCuoi, namSinhCon } = s.cotTruyen
    expect(namSinhCon).toHaveLength(2)
    expect(namCuoi).toBeGreaterThanOrEqual(
      CONFIG.cotTruyen.cuoiTuoiSomNhat - CONFIG.cotTruyen.tuoiBatDau + 1,
    )

    const suKienTheoNam = new Map<number, GameState['tongKet']>()
    while (s.nam <= namSinhCon[1]! && s.trangThai === 'dangChoi') {
      const namDang = s.nam
      s = diTronMotNam(s)
      suKienTheoNam.set(namDang, s.tongKet)

      if (namDang === namCuoi) {
        expect(s.tongKet!.suKien.some((k) => k.loai === 'ketHon')).toBe(true)
        expect(s.daKetHon).toBe(true)
        // Năm sau đã có gia đình → hệ số chi phí ít nhất 1,2
        expect(s.heSoChiPhi).toBeGreaterThanOrEqual(1.2)
      }
      if (namDang === namCuoi + 1) {
        // Bạn đời bắt đầu góp thu nhập từ năm sau đám cưới
        expect(s.tongKet!.thuNhapBanDoi).toBeGreaterThan(0)
      }
      s = reducer(s, { type: 'dongTongKet' })
    }
    expect(s.trangThai).toBe('dangChoi')

    const namCoSuKien = (loai: string) =>
      [...suKienTheoNam]
        .filter(([, tk]) => tk!.suKien.some((k) => k.loai === loai))
        .map(([nam]) => nam)
    expect(namCoSuKien('ketHon')).toEqual([namCuoi])
    expect(namCoSuKien('sinhCon')).toEqual(namSinhCon)
    expect(s.conCai).toEqual(namSinhCon)
  })

  it('nghỉ hưu ở năm 40 (tuổi 60): có sự kiện, lương hưu bằng 45% lương cũ', () => {
    const goc = moiVan('giaoVien')
    const luongTruoc = goc.luong
    const s = diTronMotNam({ ...goc, nam: 40 })
    expect(s.tongKet!.suKien.some((k) => k.loai === 'nghiHuu')).toBe(true)
    expect(s.daNghiHuu).toBe(true)
    const luongHuu = Math.round(luongTruoc * CONFIG.cotTruyen.tyLeLuongHuu)
    expect(Math.abs(s.luong - luongHuu)).toBeLessThanOrEqual(1)
  })

  it('đã nghỉ hưu thì mua khoá học bị chặn', () => {
    const s0 = reducer(moiVan('kySuPhanMem'), { type: 'traChiPhi' })
    const huu: GameState = { ...s0, daNghiHuu: true, tienMat: 900 * TRIEU }
    expect(reducer(huu, { type: 'muaKhoaHoc', khoaHocId: 'online' })).toBe(huu)
  })
})

describe('bán tài sản khi tiền mặt âm', () => {
  const ketThucVoiTienAm = (tienMat: number, traiPhieu: number): GameState => {
    let s = duyetHetThe(reducer(moiVan('giaoVien'), { type: 'traChiPhi' }), false)
    s = { ...s, tienMat, soHuu: { ...s.soHuu, traiPhieu }, hanhPhuc: 90 }
    return reducer(s, { type: 'ketThucNam' })
  }

  it('đủ tài sản: tự bán trái phiếu bù âm, tiền mặt về không âm', () => {
    const s = ketThucVoiTienAm(-800 * TRIEU, 1200)
    expect(s.tongKet!.suKien.some((k) => k.loai === 'banTaiSan')).toBe(true)
    expect(s.tienMat).toBeGreaterThanOrEqual(0)
    expect(s.soHuu.traiPhieu).toBeLessThan(1200)
  })

  it('bán sạch vẫn không đủ: thêm sự kiện Túng thiếu, mất 10 hạnh phúc', () => {
    const s = ketThucVoiTienAm(-5 * TY, 10)
    const cacSuKienBan = s.tongKet!.suKien.filter((k) => k.loai === 'banTaiSan')
    expect(cacSuKienBan.some((k) => k.tieuDe === 'Túng thiếu')).toBe(true)
    expect(s.soHuu.traiPhieu).toBe(0)
    expect(s.tienMat).toBeLessThan(0)
  })
})

describe('thẻ tiêu dùng không lặp lại năm liền trước', () => {
  it('giao của thẻ năm mới với thẻ năm trước là rỗng', () => {
    const goc = moiVan()
    const idsNamTruoc = goc.theNamTruoc
    expect(idsNamTruoc.length).toBeGreaterThan(0)
    const s = diTronMotNam(goc)
    expect(s.theConLai.length).toBeGreaterThan(0)
    expect(s.theConLai.filter((t) => idsNamTruoc.includes(t.id))).toHaveLength(0)
    // theNamTruoc luôn bám theo bộ thẻ vừa rút
    expect(s.theNamTruoc).toEqual(s.theConLai.map((t) => t.id))
  })
})

describe('cột mốc tài sản', () => {
  it('mốc suy ra từ chi phí sinh hoạt nên khác nhau theo nghề', () => {
    // 25 lần chi phí sinh hoạt là mốc cao nhất, ba mốc dưới là 10% · 25% · 50%
    expect(mocTaiSanCuaNghe('giaoVien')).toEqual([
      300 * TRIEU,
      700 * TRIEU,
      1_400 * TRIEU,
      2_700 * TRIEU,
    ])
    expect(mocTaiSanCuaNghe('bacSi').at(-1)).toBe(6_000 * TRIEU)
    expect(mocTaiSanCuaNghe('kySuPhanMem').at(-1)).toBe(10_900 * TRIEU)
  })

  it('mốc leo theo mặt bằng giá để lạm phát không làm rẻ cột mốc', () => {
    expect(mocTaiSanCuaNghe('giaoVien', 2).at(-1)).toBe(5_400 * TRIEU)
    expect(mocTaiSanCuaNghe('giaoVien', 2)[0]).toBe(500 * TRIEU)
  })

  it('chạm mốc đầu lần đầu có sự kiện mocTaiSan, năm sau không lặp lại', () => {
    let s = duyetHetThe(reducer(moiVan('giaoVien'), { type: 'traChiPhi' }), false)
    // 320 triệu vượt mốc 1 (300 triệu) nhưng chưa tới mốc 2 (700 triệu), kể cả sau
    // khi cộng dồn lương hai năm liên tiếp. v1.6 Task 12: rutLichBienCo rút thêm
    // ngẫu nhiên lúc tạo ván nên toàn bộ chuỗi rng dịch pha so với trước — mốc
    // 400 triệu cũ đôi khi cộng lương/thưởng hai năm liền vượt luôn mốc 2, hạ
    // xuống 320 triệu để chừa biên độ an toàn hơn.
    s = { ...s, tienMat: 320 * TRIEU, hanhPhuc: 90 }
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.tongKet!.suKien.filter((k) => k.loai === 'mocTaiSan')).toHaveLength(1)
    expect(s.mocTaiSanDaQua).toEqual([0])

    // Năm thứ hai: vẫn trên mốc 1 nhưng đã ghi nhận rồi → không lặp
    s = reducer(s, { type: 'dongTongKet' })
    s = duyetHetThe(reducer(s, { type: 'traChiPhi' }), false)
    s = { ...s, hanhPhuc: 90 }
    s = reducer(s, { type: 'ketThucNam' })
    expect(tongTaiSan(s)).toBeLessThan(700 * TRIEU)
    expect(s.tongKet!.suKien.filter((k) => k.loai === 'mocTaiSan')).toHaveLength(0)
    expect(s.mocTaiSanDaQua).toEqual([0])
  })
})

describe('tính tất định', () => {
  it('cùng seed và cùng chuỗi hành động cho ra trạng thái giống hệt', () => {
    const chay = () => {
      let s = taoGameMoi('bacSi', 999)
      for (let i = 0; i < 5; i++) {
        s = reducer(s, { type: 'traChiPhi' })
        s = duyetHetThe(s, i % 2 === 0)
        s = reducer(s, { type: 'ketThucNam' })
        s = reducer(s, { type: 'dongTongKet' })
      }
      return s
    }
    expect(chay()).toEqual(chay())
  })
})

describe('hạnh phúc trong sự kiện — kể đúng số điểm THỰC nhận', () => {
  it('sự kiện cưới ghi điểm đã áp trần, không phải điểm danh nghĩa', () => {
    const s0 = moiVan()
    // Đặt ngay trước năm cưới, hạnh phúc sát trần cứng
    const truocCuoi: GameState = {
      ...s0,
      nam: s0.cotTruyen.namCuoi,
      hanhPhuc: CONFIG.hanhPhucTranCung - 2,
    }
    const sau = diTronMotNam(truocCuoi, 5 * TY)
    const cuoi = sau.tongKet!.suKien.find((sk) => sk.loai === 'ketHon')
    expect(cuoi).toBeTruthy()
    // Danh nghĩa +25, nhưng đã sát trần nên thực nhận phải nhỏ hơn hẳn
    expect(cuoi!.hanhPhucThayDoi).toBeLessThan(CONFIG.cotTruyen.cuoiHanhPhuc)
    expect(cuoi!.hanhPhucThayDoi).toBeGreaterThanOrEqual(0)
  })

  it('tổng điểm hạnh phúc của các sự kiện khớp mức thay đổi thật trong năm', () => {
    const s0 = moiVan()
    const truoc: GameState = {
      ...s0,
      nam: s0.cotTruyen.namCuoi,
      hanhPhuc: 96,
      uocNguyenDaMua: [s0.khatVongId],
    }
    let cur: GameState = { ...truoc, tienMat: 5 * TY }
    cur = reducer(cur, { type: 'traChiPhi' })
    cur = duyetHetThe(cur, false)
    // Neo lại hạnh phúc sát trần mềm sau khi duyệt thẻ, để phép đối chiếu
    // dưới đây chỉ còn phụ thuộc phần cộng/trừ của chuyển năm
    cur = { ...cur, hanhPhuc: 96 }
    const hanhPhucTruocKhiChuyenNam = cur.hanhPhuc
    const sau = reducer(cur, { type: 'ketThucNam' })
    const tk = sau.tongKet!
    const tongTuSuKien = tk.suKien.reduce((t, sk) => t + sk.hanhPhucThayDoi, 0)
    const tongKhac = tongTuSuKien + tk.hanhPhucTuUocNguyen - tk.phatKhatVong
    expect(sau.hanhPhuc).toBe(hanhPhucTruocKhiChuyenNam + tongKhac)
  })
})

describe('bảo hiểm và ốm đau tuổi già', () => {
  it('phí bảo hiểm leo theo tuổi sau khi nghỉ hưu', () => {
    const s0 = moiVan()
    const treTuoi: GameState = { ...s0, nam: 10 }
    const veGia: GameState = { ...s0, nam: 70 } // tuổi 90
    expect(phiBaoHiem(veGia)).toBeGreaterThan(phiBaoHiem(treTuoi))
  })

  it('sau tuổi đồng trả, có bảo hiểm vẫn phải tự gánh một phần viện phí', () => {
    expect(tyLeDongTra(CONFIG.cotTruyen.baoHiemDongTraTuoi - 1)).toBe(0)
    expect(tyLeDongTra(CONFIG.cotTruyen.baoHiemDongTraTuoi)).toBe(
      CONFIG.cotTruyen.baoHiemTyLeDongTra,
    )
  })

  it('viện phí neo theo chi phí sinh hoạt nên về hưu vẫn còn sức nặng', () => {
    const s0 = moiVan()
    // Tuổi 95, lương hưu thấp nhưng chi phí sinh hoạt đã leo cao
    let veGia: GameState = {
      ...s0,
      nam: 75,
      daNghiHuu: true,
      luong: 50 * TRIEU,
      chiPhiHangNam: 900 * TRIEU,
      baoHiemDenNam: -1,
      hanhPhuc: 90,
    }
    // Chạy nhiều năm để chắc chắn gặp ít nhất một lần ốm đau.
    // v1.6 Task 7: chuyenNam giờ rút thêm một số ngẫu nhiên mỗi năm cho chu kỳ
    // kinh tế (bước 0), nên toàn bộ chuỗi rng dịch pha so với trước — 5 năm cũ
    // không còn chắc trúng ốm đau với seed cố định này nữa, nới lên 10 năm.
    // v1.6 Task 12: rutLichBienCo rút thêm ngẫu nhiên lúc TẠO VÁN nên chuỗi rng
    // lại dịch pha lần nữa. Đồng thời chiPhiHangNam giả lập chỉ có hiệu lực đúng
    // năm đầu — từ năm sau chuyenNam tính lại theo chi phí thật của nghề, thấp
    // hơn hẳn 900 triệu — nên phải áp lại override mỗi năm để mỗi năm đều có cơ
    // hội trúng ốm đau với chi phí đã leo cao, thay vì chỉ trông cậy vào năm đầu.
    let vienPhiLonNhat = 0
    for (let i = 0; i < 10 && veGia.trangThai === 'dangChoi'; i++) {
      veGia = { ...veGia, luong: 50 * TRIEU, chiPhiHangNam: 900 * TRIEU, baoHiemDenNam: -1 }
      const sau = diTronMotNam(veGia, 5 * TY)
      const om = sau.tongKet!.suKien.find((sk) => sk.loai === 'omDau')
      if (om) vienPhiLonNhat = Math.max(vienPhiLonNhat, -om.tienThayDoi)
      veGia = { ...reducer(sau, { type: 'dongTongKet' }), hanhPhuc: 90 }
    }
    // Nếu chỉ neo vào lương thì viện phí chỉ 17,5 triệu; neo theo chi phí thì lớn hơn nhiều
    expect(vienPhiLonNhat).toBeGreaterThan(50 * TRIEU)
  })
})

describe('thẻ hợp với tuổi và hoàn cảnh', () => {
  it('thẻ có trần tuổi không xuất hiện khi đã quá tuổi đó', () => {
    const coTranTuoi = THE_TIEU_DUNG.filter((t) => t.tuoiToiDa !== undefined)
    expect(coTranTuoi.length).toBeGreaterThan(0)

    const s0 = moiVan()
    // theConLai của s0 được rút cho bối cảnh năm 1 (tuổi 21); nhảy cóc sang năm
    // 75 mà giữ nguyên bộ thẻ đó thì đang kiểm tra một bối cảnh không có thật
    // trong luật chơi — theConLai và nam luôn tiến cùng nhau qua chuyenNam, chưa
    // bao giờ tách rời như phép gán tay này. Xoá trắng để vòng lặp chỉ xét
    // những bộ thẻ được rút THẬT SỰ cho tuổi già, đúng như game vận hành.
    let cur: GameState = { ...s0, nam: 75, daNghiHuu: true, hanhPhuc: 100, theConLai: [] }
    for (let i = 0; i < 5; i++) {
      const tuoi = tuoiTaiNam(cur.nam)
      for (const the of cur.theConLai) {
        if (the.tuoiToiDa !== undefined) expect(tuoi).toBeLessThanOrEqual(the.tuoiToiDa)
      }
      const sau = diTronMotNam(cur, 5 * TY)
      cur = { ...reducer(sau, { type: 'dongTongKet' }), hanhPhuc: 100 }
    }
  })

  it('thẻ con nhỏ chỉ xuất hiện khi thật sự còn con nhỏ', () => {
    const s0 = moiVan()
    // Con đã 18 và 20 tuổi — không còn là "con nhỏ"
    const conLon: GameState = {
      ...s0,
      nam: 40,
      daKetHon: true,
      conCai: [22, 20],
      hanhPhuc: 100,
    }
    const sau = diTronMotNam(conLon, 5 * TY)
    const moi = reducer(sau, { type: 'dongTongKet' })
    for (const the of moi.theConLai) expect(the.giaiDoan).not.toBe('conCai')
  })
})

describe('chuyện tuổi già', () => {
  it('con tròn tuổi sinh cháu thì lên chức ông bà', () => {
    const s0 = moiVan()
    const namSinhCon = 10
    const namLenChuc = namSinhCon + CONFIG.cotTruyen.conTuoiSinhChau
    const truoc: GameState = {
      ...s0,
      nam: namLenChuc,
      daKetHon: true,
      conCai: [namSinhCon],
      hanhPhuc: 70,
    }
    const sau = diTronMotNam(truoc, 5 * TY)
    expect(sau.tongKet!.suKien.some((sk) => sk.loai === 'lenChucOngBa')).toBe(true)
  })

  it('sau tuổi 70 có xuất hiện chuyện đời thường của tuổi già', () => {
    const s0 = moiVan()
    let cur: GameState = { ...s0, nam: 60, daNghiHuu: true, hanhPhuc: 100 }
    let daGap = false
    for (let i = 0; i < 15 && !daGap; i++) {
      const sau = diTronMotNam(cur, 5 * TY)
      if (sau.tongKet!.suKien.some((sk) => sk.loai === 'tuoiGia')) daGap = true
      cur = { ...reducer(sau, { type: 'dongTongKet' }), hanhPhuc: 100 }
    }
    expect(daGap).toBe(true)
  })
})

describe('chuyên gia đồng hành', () => {
  const CG = CONFIG.chuyenGia
  /** Rủng rỉnh tới mức tiền nong không bao giờ là biến số làm nhiễu phép đo. */
  const TIEN_DU = 5 * TY

  /**
   * Ván đã trả chi phí, dư tiền, hạnh phúc neo sẵn theo ý muốn.
   *
   * Neo hạnh phúc là bắt buộc ở nhóm này: chuyện kiệt sức đọc mức hạnh phúc cuối
   * năm, nên để nó trôi theo thẻ bài là phép đo mất tất định. Phí hai gói thì
   * KHÔNG đọc `hanhPhuc` mà đọc cờ `daCanhBaoKietSuc` — muốn dựng cảnh được hỗ
   * trợ nửa phí thì phải bật cờ, chứ hạ hạnh phúc là vô nghĩa.
   */
  const vanDuTien = (hanhPhuc: number, ngheId = 'giaoVien'): GameState => {
    const s = reducer(moiVan(ngheId), { type: 'traChiPhi' })
    return { ...s, tienMat: TIEN_DU, hanhPhuc }
  }

  /** Giá gốc chưa giảm của hai gói, tính thẳng trên chi phí sinh hoạt năm nay. */
  const giaDuTamLy = (s: GameState) =>
    Math.round(s.chiPhiHangNam * CG.tamLy.tyLePhiTheoChiPhi)
  const giaDuTaiChinh = (s: GameState) =>
    Math.round(s.chiPhiHangNam * CG.taiChinh.tyLePhiTheoChiPhi)

  /** Đóng năm tại chỗ: từ chối hết thẻ, neo lại hạnh phúc rồi bấm kết thúc năm. */
  const dongNam = (s: GameState, hanhPhuc: number): GameState => {
    const cur = duyetHetThe(s, false)
    return reducer({ ...cur, hanhPhuc }, { type: 'ketThucNam' })
  }

  /** Đóng bảng tổng kết, cấp lại tiền mặt rồi trả chi phí của năm mới. */
  const sangNamMoi = (sau: GameState): GameState => {
    const moi = { ...reducer(sau, { type: 'dongTongKet' }), tienMat: TIEN_DU }
    return reducer(moi, { type: 'traChiPhi' })
  }

  /**
   * Neo hạnh phúc ở 60 cho các phép đo điểm trị liệu: vừa đúng ngưỡng cảnh báo
   * nên năm nào cũng đóng lại phía trên đáy, lại còn thừa chỗ dưới trần mềm 100
   * để một cú cộng bất ngờ giữa năm (đám cưới chẳng hạn) cũng không làm điểm hồi
   * bị chiết khấu — phép đo mới đọc được đúng con số danh nghĩa.
   */
  const NEO_DO_DIEM = 60

  it('thuê chuyên gia tâm lý trừ đúng phí và đặt hạn liệu trình ba năm', () => {
    const s = vanDuTien(70)
    expect(dangTriLieu(s)).toBe(false)
    expect(soNamTriLieuConLai(s)).toBe(0)

    const phi = phiChuyenGiaTamLy(s)
    expect(phi).toBe(Math.round(s.chiPhiHangNam * CG.tamLy.tyLePhiTheoChiPhi))

    const sau = reducer(s, { type: 'thueChuyenGiaTamLy' })
    expect(sau.tienMat).toBe(s.tienMat - phi)
    expect(sau.soLanTriLieu).toBe(1)
    // Liệu trình tính cả năm mua nên hạn cuối chỉ lùi hai năm
    expect(sau.triLieuDenNam).toBe(s.nam + CG.tamLy.soNamLieuTrinh - 1)
    expect(dangTriLieu(sau)).toBe(true)
    expect(soNamTriLieuConLai(sau)).toBe(CG.tamLy.soNamLieuTrinh)

    const ngheo: GameState = { ...s, tienMat: phi - 1 }
    expect(reducer(ngheo, { type: 'thueChuyenGiaTamLy' })).toBe(ngheo)
  })

  it('liệu trình hồi đúng ba năm liên tiếp rồi dừng hẳn, kể đúng thứ tự ba nhịp', () => {
    let s = reducer(vanDuTien(NEO_DO_DIEM), { type: 'thueChuyenGiaTamLy' })
    const namMua = s.nam
    const namCoTriLieu: number[] = []
    const tieuDeTheoNam: string[] = []

    for (let i = 0; i < 5 && s.trangThai === 'dangChoi'; i++) {
      const namDang = s.nam
      const sau = dongNam(s, NEO_DO_DIEM)
      const triLieu = sau.tongKet!.suKien.filter((k) => k.loai === 'triLieu')
      // Mỗi năm nhiều nhất một buổi trị liệu, không có chuyện kể chồng lên nhau
      expect(triLieu.length).toBeLessThanOrEqual(1)
      if (triLieu.length === 1) {
        namCoTriLieu.push(namDang)
        tieuDeTheoNam.push(triLieu[0]!.tieuDe)
        expect(triLieu[0]!.tienThayDoi).toBe(0)
        expect(triLieu[0]!.hanhPhucThayDoi).toBe(CG.tamLy.hanhPhucMoiNam)
        expect(triLieu[0]!.moTa.length).toBeGreaterThan(0)
      }
      s = sangNamMoi(sau)
    }

    expect(namCoTriLieu).toEqual([namMua, namMua + 1, namMua + 2])
    expect(dangTriLieu(s)).toBe(false)

    // Ba nhịp phải khác nhau VÀ đúng thứ tự. Chỉ khẳng định `tieuDe.length > 0` thì
    // thay cả công thức chọn nhịp bằng `CHUYEN_TRI_LIEU[0]` bộ test vẫn xanh, mà
    // người chơi thì nghe "Buổi trị liệu đầu tiên" ba năm liền.
    expect(new Set(tieuDeTheoNam).size).toBe(3)
    expect(tieuDeTheoNam).toEqual(CHUYEN_TRI_LIEU.map((c) => c.tieuDe))
  })

  it('số nhịp kể của liệu trình khớp đúng số năm liệu trình', () => {
    // Cái kẹp Math.min/Math.max trong `chuyenNam` nuốt im lặng mọi sai lệch: nâng
    // `soNamLieuTrinh` lên 4 mà quên viết nhịp thứ tư thì năm cuối kể lại nhịp ba,
    // người chơi nghe "Buổi trị liệu cuối cùng" hai năm liên tiếp mà test vẫn xanh.
    expect(CHUYEN_TRI_LIEU.length).toBe(CG.tamLy.soNamLieuTrinh)
  })

  it('không mua chồng liệu trình khi liệu trình cũ còn hạn', () => {
    const s = reducer(vanDuTien(70), { type: 'thueChuyenGiaTamLy' })
    expect(dangTriLieu(s)).toBe(true)
    expect(reducer(s, { type: 'thueChuyenGiaTamLy' })).toBe(s)

    // Ngay cả năm cuối cùng của liệu trình vẫn còn hiệu lực nên vẫn bị chặn
    const namCuoi: GameState = { ...s, nam: s.triLieuDenNam }
    expect(reducer(namCuoi, { type: 'thueChuyenGiaTamLy' })).toBe(namCuoi)

    // Hết hạn thì mở lại, và lần này đếm sang liệu trình thứ hai
    const hetHan: GameState = { ...s, nam: s.triLieuDenNam + 1 }
    expect(dangTriLieu(hetHan)).toBe(false)
    const lanHai = reducer(hetHan, { type: 'thueChuyenGiaTamLy' })
    expect(lanHai.soLanTriLieu).toBe(2)
    expect(lanHai.triLieuDenNam).toBe(hetHan.nam + CG.tamLy.soNamLieuTrinh - 1)
  })

  it('liệu trình lần hai hồi 6 điểm, lần ba hồi 4, từ lần tư trở đi đứng ở sàn 3', () => {
    expect(hoiPhucTriLieu(1)).toBe(CG.tamLy.hanhPhucMoiNam)
    expect(hoiPhucTriLieu(2)).toBe(6)
    expect(hoiPhucTriLieu(3)).toBe(4)
    expect(hoiPhucTriLieu(4)).toBe(CG.tamLy.hanhPhucToiThieu)
    expect(hoiPhucTriLieu(9)).toBe(CG.tamLy.hanhPhucToiThieu)

    // Và chuỗi nhạt dần đó phải thật sự chạy vào sự kiện của năm mua
    const bangSoLan: [number, number][] = [
      [0, 8],
      [1, 6],
      [2, 4],
      [3, 3],
      [7, 3],
    ]
    for (const [soLanTruoc, diem] of bangSoLan) {
      const s0 = vanDuTien(NEO_DO_DIEM)
      // Dựng cảnh "đã trị liệu ngần này lần, liệu trình gần nhất vừa hết hạn"
      const daTung: GameState = {
        ...s0,
        soLanTriLieu: soLanTruoc,
        triLieuDenNam: s0.nam - 1,
      }
      const s = reducer(daTung, { type: 'thueChuyenGiaTamLy' })
      expect(s.soLanTriLieu).toBe(soLanTruoc + 1)
      const triLieu = dongNam(s, NEO_DO_DIEM).tongKet!.suKien.find(
        (k) => k.loai === 'triLieu',
      )!
      expect(triLieu.hanhPhucThayDoi).toBe(diem)
    }
  })

  it('điểm hồi trị liệu bị trần mềm cắt thì sự kiện ghi số THỰC nhận', () => {
    // Neo trên trần mềm 100 nhưng còn cách trần cứng 130 một quãng: dù trong năm
    // có sụt vài điểm thì lúc tới lượt trị liệu vẫn nằm trên trần mềm, nên phần
    // cộng chắc chắn bị chiết khấu — mà vẫn chưa chạm trần cứng để về đúng 0.
    const NEO_TREN_TRAN = CONFIG.hanhPhucTranMem + 20
    const s = reducer(vanDuTien(NEO_TREN_TRAN), { type: 'thueChuyenGiaTamLy' })
    const sau = dongNam(s, NEO_TREN_TRAN)
    const triLieu = sau.tongKet!.suKien.find((k) => k.loai === 'triLieu')!

    // Danh nghĩa 8 điểm, nhưng đang ở trên trần mềm nên thực nhận phải nhỏ hơn
    expect(triLieu.hanhPhucThayDoi).toBeLessThan(CG.tamLy.hanhPhucMoiNam)
    expect(triLieu.hanhPhucThayDoi).toBeGreaterThan(0)
    expect(triLieu.hanhPhucThayDoi).toBe(
      themHanhPhuc(NEO_TREN_TRAN, CG.tamLy.hanhPhucMoiNam) - NEO_TREN_TRAN,
    )

    // Bất biến chung của bảng tổng kết: cộng lại các khoản phải ra đúng mức
    // hạnh phúc thật sự thay đổi trong năm
    const tk = sau.tongKet!
    const tongTuSuKien = tk.suKien.reduce((t, k) => t + k.hanhPhucThayDoi, 0)
    expect(sau.hanhPhuc).toBe(
      NEO_TREN_TRAN + tongTuSuKien + tk.hanhPhucTuUocNguyen - tk.phatKhatVong,
    )
  })

  it('cờ kiệt sức đang bật thì phí cả hai gói còn một nửa, cờ tắt thì trả giá đủ', () => {
    const binhThuong = vanDuTien(70)
    expect(dangDuocHoTro(binhThuong)).toBe(false)
    const duocHoTro: GameState = { ...binhThuong, daCanhBaoKietSuc: true }
    expect(dangDuocHoTro(duocHoTro)).toBe(true)

    expect(phiChuyenGiaTamLy(binhThuong)).toBe(giaDuTamLy(binhThuong))
    expect(phiChuyenGiaTaiChinh(binhThuong)).toBe(giaDuTaiChinh(binhThuong))

    expect(phiChuyenGiaTamLy(duocHoTro)).toBe(
      Math.round(giaDuTamLy(duocHoTro) * CG.heSoGiamPhiKhiKietSuc),
    )
    expect(phiChuyenGiaTaiChinh(duocHoTro)).toBe(
      Math.round(giaDuTaiChinh(duocHoTro) * CG.heSoGiamPhiKhiKietSuc),
    )
    // Nhân đôi lại phải về đúng giá gốc, chỉ lệch trong phạm vi làm tròn
    expect(
      Math.abs(phiChuyenGiaTamLy(duocHoTro) * 2 - phiChuyenGiaTamLy(binhThuong)),
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(phiChuyenGiaTaiChinh(duocHoTro) * 2 - phiChuyenGiaTaiChinh(binhThuong)),
    ).toBeLessThanOrEqual(1)
  })

  it('phí bám theo CỜ chứ không theo hạnh phúc sống, nên không tự tạo được giá rẻ', () => {
    const goc = vanDuTien(70)

    // Từ chối vài tấm thẻ cho hạnh phúc rơi tận đáy giữa lượt của mình vẫn KHÔNG
    // mở được chương trình hỗ trợ: cờ mới chốt ở Tổng kết năm trước và đang tắt.
    const buonMaCoTat: GameState = { ...goc, hanhPhuc: 10 }
    expect(dangDuocHoTro(buonMaCoTat)).toBe(false)
    expect(phiChuyenGiaTamLy(buonMaCoTat)).toBe(giaDuTamLy(buonMaCoTat))
    expect(phiChuyenGiaTaiChinh(buonMaCoTat)).toBe(giaDuTaiChinh(buonMaCoTat))

    // Ngược lại, năm trước đã chốt là kiệt sức thì năm nay dù hạnh phúc đã leo
    // cao ngất vẫn được hỗ trợ — chương trình xét trên một năm đã qua.
    const vuiMaCoBat: GameState = {
      ...goc,
      hanhPhuc: CONFIG.hanhPhucTranMem,
      daCanhBaoKietSuc: true,
    }
    expect(phiChuyenGiaTamLy(vuiMaCoBat)).toBe(
      Math.round(giaDuTamLy(vuiMaCoBat) * CG.heSoGiamPhiKhiKietSuc),
    )
    expect(phiChuyenGiaTaiChinh(vuiMaCoBat)).toBe(
      Math.round(giaDuTaiChinh(vuiMaCoBat) * CG.heSoGiamPhiKhiKietSuc),
    )

    // Thứ tự bấm nút cũng không đổi được tổng tiền: gói tài chính cộng 6 điểm
    // ngay lúc thuê, mà phí gói tâm lý sau đó vẫn y nguyên.
    const sauTaiChinh = reducer(vuiMaCoBat, { type: 'thueChuyenGiaTaiChinh' })
    expect(sauTaiChinh.hanhPhuc).toBeGreaterThan(vuiMaCoBat.hanhPhuc)
    expect(phiChuyenGiaTamLy(sauTaiChinh)).toBe(phiChuyenGiaTamLy(vuiMaCoBat))
  })

  it('tiền mặt bị trừ ĐÚNG BẰNG giá trị hai hàm phí trả về, ở cả hai trạng thái cờ', () => {
    for (const coBat of [false, true]) {
      const s: GameState = { ...vanDuTien(70), daCanhBaoKietSuc: coBat }

      const phiTamLy = phiChuyenGiaTamLy(s)
      expect(reducer(s, { type: 'thueChuyenGiaTamLy' }).tienMat).toBe(
        s.tienMat - phiTamLy,
      )

      const phiTaiChinh = phiChuyenGiaTaiChinh(s)
      expect(reducer(s, { type: 'thueChuyenGiaTaiChinh' }).tienMat).toBe(
        s.tienMat - phiTaiChinh,
      )

      // Đúng bằng nghĩa là cả hai chiều: giá gốc chỉ bị trừ khi cờ đang tắt
      expect(phiTamLy).toBe(
        coBat ? Math.round(giaDuTamLy(s) * CG.heSoGiamPhiKhiKietSuc) : giaDuTamLy(s),
      )
      expect(phiTaiChinh).toBe(
        coBat
          ? Math.round(giaDuTaiChinh(s) * CG.heSoGiamPhiKhiKietSuc)
          : giaDuTaiChinh(s),
      )
    }
  })

  it('chặn thuê cả hai gói khi thiếu tiền hoặc khi ngoài giai đoạn tự do', () => {
    for (const coBat of [false, true]) {
      const s: GameState = { ...vanDuTien(70), daCanhBaoKietSuc: coBat }

      // Thiếu đúng một đồng so với phí THỰC phải trả là đã không mua nổi
      const thieuTamLy: GameState = { ...s, tienMat: phiChuyenGiaTamLy(s) - 1 }
      expect(reducer(thieuTamLy, { type: 'thueChuyenGiaTamLy' })).toBe(thieuTamLy)
      const thieuTaiChinh: GameState = { ...s, tienMat: phiChuyenGiaTaiChinh(s) - 1 }
      expect(reducer(thieuTaiChinh, { type: 'thueChuyenGiaTaiChinh' })).toBe(
        thieuTaiChinh,
      )

      // Vừa đủ đồng cuối cùng thì mua được, tiền mặt về sạch không
      const vuaDuTamLy: GameState = { ...s, tienMat: phiChuyenGiaTamLy(s) }
      expect(reducer(vuaDuTamLy, { type: 'thueChuyenGiaTamLy' }).tienMat).toBe(0)
      const vuaDuTaiChinh: GameState = { ...s, tienMat: phiChuyenGiaTaiChinh(s) }
      expect(reducer(vuaDuTaiChinh, { type: 'thueChuyenGiaTaiChinh' }).tienMat).toBe(0)
    }

    // Đang xem bảng Tổng kết năm thì mọi hành động tự do đều đóng lại
    const tongKet = dongNam(vanDuTien(70), 70)
    expect(tongKet.phase).toBe('tongKet')
    expect(tongKet.tienMat).toBeGreaterThan(phiChuyenGiaTaiChinh(tongKet))
    expect(reducer(tongKet, { type: 'thueChuyenGiaTamLy' })).toBe(tongKet)
    expect(reducer(tongKet, { type: 'thueChuyenGiaTaiChinh' })).toBe(tongKet)

    // Ván đã khép lại cũng vậy, dù túi vẫn còn đầy tiền
    const daThua: GameState = {
      ...vanDuTien(70),
      trangThai: 'thua',
      phase: 'ketThuc',
    }
    expect(reducer(daThua, { type: 'thueChuyenGiaTamLy' })).toBe(daThua)
    expect(reducer(daThua, { type: 'thueChuyenGiaTaiChinh' })).toBe(daThua)
  })

  it('chuyên gia tài chính giảm chi phí sinh hoạt 8% từ năm sau và giữ mãi về sau', () => {
    const nghe = timNghe('giaoVien')!
    const heSo = 1 - CG.taiChinh.giamChiPhi
    const s0 = vanDuTien(70)
    const phi = phiChuyenGiaTaiChinh(s0)
    expect(phi).toBe(Math.round(s0.chiPhiHangNam * CG.taiChinh.tyLePhiTheoChiPhi))

    const s1 = reducer(s0, { type: 'thueChuyenGiaTaiChinh' })
    expect(s1.tienMat).toBe(s0.tienMat - phi)
    expect(daToiUuChiPhi(s1)).toBe(true)
    expect(s1.heSoToiUuChiPhi).toBe(heSo)
    expect(s1.hanhPhuc).toBe(themHanhPhuc(s0.hanhPhuc, CG.taiChinh.hanhPhucNgay))
    // Năm mua vẫn trả chi phí cũ — phần giảm chỉ có hiệu lực từ năm sau
    expect(s1.chiPhiHangNam).toBe(s0.chiPhiHangNam)

    let s = s1
    for (let i = 0; i < 6 && s.trangThai === 'dangChoi'; i++) {
      s = sangNamMoi(dongNam(s, 70))
      // Làm tròn đúng một lần trên cả tích, y hệt engine — chia hai bước rồi
      // làm tròn từng bước là lệch một đồng ở những con số hàng trăm triệu
      expect(s.chiPhiHangNam).toBe(
        Math.round(nghe.chiPhi * s.chiSoGia * s.heSoChiPhi * heSo),
      )
      const chuaToiUu = Math.round(nghe.chiPhi * s.chiSoGia * s.heSoChiPhi)
      expect(s.chiPhiHangNam).toBeLessThan(chuaToiUu)
      expect(s.chiPhiHangNam / chuaToiUu).toBeCloseTo(heSo, 6)
    }
    // Lạm phát vẫn đẩy chi phí lên, phần giảm 8% chỉ đi kèm chứ không bị bào mòn
    expect(s.chiSoGia).toBeGreaterThan(1)
    expect(s.heSoToiUuChiPhi).toBe(heSo)

    // Cưới xin và con cái đẩy hệ số chi phí lên hẳn, mà 8% vẫn cắt đúng chừng ấy
    const coGiaDinh = sangNamMoi(
      dongNam({ ...s, daKetHon: true, conCai: [s.nam - 1, s.nam - 3] }, 70),
    )
    expect(coGiaDinh.heSoChiPhi).toBeGreaterThan(1.2)
    expect(coGiaDinh.chiPhiHangNam).toBe(
      Math.round(nghe.chiPhi * coGiaDinh.chiSoGia * coGiaDinh.heSoChiPhi * heSo),
    )
    expect(coGiaDinh.chiPhiHangNam).toBeLessThan(
      Math.round(nghe.chiPhi * coGiaDinh.chiSoGia * coGiaDinh.heSoChiPhi),
    )
    expect(coGiaDinh.heSoToiUuChiPhi).toBe(heSo)
  })

  it('cả ván chỉ thuê được chuyên gia tài chính một lần', () => {
    const s0 = vanDuTien(70)
    const s1 = reducer(s0, { type: 'thueChuyenGiaTaiChinh' })
    expect(s1).not.toBe(s0)
    expect(reducer(s1, { type: 'thueChuyenGiaTaiChinh' })).toBe(s1)

    // Sang năm sau, tiền đầy túi mà vẫn bị chặn, và chi phí không giảm thêm lần nữa
    const namSau = sangNamMoi(dongNam(s1, 70))
    expect(daToiUuChiPhi(namSau)).toBe(true)
    expect(reducer(namSau, { type: 'thueChuyenGiaTaiChinh' })).toBe(namSau)
    expect(namSau.heSoToiUuChiPhi).toBe(1 - CG.taiChinh.giamChiPhi)
  })

  it('gói tài chính hạ nghĩa vụ và mục tiêu tự do, còn cột mốc tài sản đứng yên', () => {
    const goc = vanDuTien(70)
    const daThue = reducer(goc, { type: 'thueChuyenGiaTaiChinh' })

    // Hai nhánh chạy cùng seed và cùng chuỗi hành động, chỉ khác đúng gói dịch vụ
    const khong = sangNamMoi(dongNam(goc, 70))
    const co = sangNamMoi(dongNam(daThue, 70))
    expect(co.chiSoGia).toBe(khong.chiSoGia)
    expect(co.heSoChiPhi).toBe(khong.heSoChiPhi)
    expect(co.luong).toBe(khong.luong)

    const chenhChiPhi = khong.chiPhiHangNam - co.chiPhiHangNam
    expect(chenhChiPhi).toBeGreaterThan(0)
    expect(nghiaVuHangNam(co)).toBeLessThan(nghiaVuHangNam(khong))
    expect(nghiaVuHangNam(khong) - nghiaVuHangNam(co)).toBeGreaterThanOrEqual(
      chenhChiPhi,
    )
    expect(mucTieuTuDo(co)).toBeLessThan(mucTieuTuDo(khong))

    // Bảng huy hiệu giữ nguyên thước đo: mốc dựng trên chi phí GỐC của nghề, không
    // đi theo chi phí sinh hoạt đã giảm.
    //
    // Cố ý KHÔNG so hai lời gọi `mocTaiSanCuaNghe` với nhau: hàm chỉ nhận
    // `(ngheId, chiSoGia)`, mà mấy dòng trên vừa chốt hai nhánh cùng `ngheId` và
    // cùng `chiSoGia` — so như vậy là f(a,b) với chính f(a,b), không đột biến nào
    // làm nó đỏ được. Phải neo vào con số dựng lại từ `content.ts` và `CONFIG`.
    const cm = CONFIG.mocTaiSan
    const chiPhiGocCuaNghe = timNghe(co.ngheId)!.chiPhi
    const mocDungLai = cm.tyLeCacMoc.map((tyLe) =>
      Math.max(
        cm.lamTronToi,
        Math.round(
          (chiPhiGocCuaNghe * cm.mocCaoNhatTheoChiPhi * co.chiSoGia * tyLe) /
            cm.lamTronToi,
        ) * cm.lamTronToi,
      ),
    )
    expect(mocTaiSanCuaNghe(co.ngheId, co.chiSoGia)).toEqual(mocDungLai)

    // Và mốc KHÔNG tỉ lệ theo `chiPhiHangNam` đã giảm: cùng một mốc tiền chia cho
    // chi phí sinh hoạt của nhánh đã tối ưu phải ra nhiều năm chi phí hơn — đó
    // chính là điều đột biến "nhân thêm heSoToiUuChiPhi vào mốc" sẽ phá vỡ.
    expect(
      mocTaiSanCuaNghe(co.ngheId, co.chiSoGia)[0]! / co.chiPhiHangNam,
    ).toBeGreaterThan(
      mocTaiSanCuaNghe(khong.ngheId, khong.chiSoGia)[0]! / khong.chiPhiHangNam,
    )
  })

  it('chuyện kiệt sức kể một lần cho mỗi lần rơi, không lải nhải mỗi năm', () => {
    const demKietSuc = (s: GameState) =>
      s.tongKet!.suKien.filter((k) => k.loai === 'kietSuc').length
    // Vừa đúng ngưỡng thua nên qua được cửa ải, nhưng chắc chắn nằm dưới ngưỡng cảnh báo
    const DAY = CONFIG.hanhPhucNguongThua
    // Đánh dấu mọi cột mốc tài sản là đã qua: túi 5 tỷ vượt sạch bốn mốc ngay
    // năm đầu, mỗi mốc lại cộng hạnh phúc ở bước 12 — sau khi cờ kiệt sức đã
    // xét xong — nên để nguyên thì hạnh phúc cuối năm không còn phản ánh
    // đúng cái đáy mà bài kiểm thử này muốn dựng.
    const goc = vanDuTien(70)
    let s: GameState = {
      ...goc,
      mocTaiSanDaQua: mocTaiSanCuaNghe(goc.ngheId).map((_, i) => i),
    }
    expect(s.daCanhBaoKietSuc).toBe(false)

    // Năm 1 — rơi xuống dưới ngưỡng cảnh báo lần đầu, được kể
    let sau = dongNam(s, DAY)
    expect(sau.hanhPhuc).toBeLessThan(CONFIG.hanhPhucNguongCanhBao)
    expect(demKietSuc(sau)).toBe(1)
    expect(sau.daCanhBaoKietSuc).toBe(true)
    const chuyen = sau.tongKet!.suKien.find((k) => k.loai === 'kietSuc')!
    // Sự kiện này chỉ kể chuyện, không đụng vào tiền cũng không đụng vào điểm
    expect(chuyen.tienThayDoi).toBe(0)
    expect(chuyen.hanhPhucThayDoi).toBe(0)
    expect(chuyen.moTa.length).toBeGreaterThan(0)

    // Năm 2 — vẫn nằm dưới đáy, không kể lại
    s = sangNamMoi(sau)
    sau = dongNam(s, DAY)
    expect(sau.hanhPhuc).toBeLessThan(CONFIG.hanhPhucNguongCanhBao)
    expect(demKietSuc(sau)).toBe(0)
    expect(sau.daCanhBaoKietSuc).toBe(true)

    // Năm 3 — gượng dậy trên ngưỡng, cờ tắt và cũng không có gì để kể
    s = sangNamMoi(sau)
    sau = dongNam(s, CONFIG.hanhPhucTranMem)
    expect(sau.hanhPhuc).toBeGreaterThanOrEqual(CONFIG.hanhPhucNguongCanhBao)
    expect(demKietSuc(sau)).toBe(0)
    expect(sau.daCanhBaoKietSuc).toBe(false)

    // Năm 4 — rơi lần nữa thì câu chuyện quay lại
    s = sangNamMoi(sau)
    sau = dongNam(s, DAY)
    expect(demKietSuc(sau)).toBe(1)
    expect(sau.daCanhBaoKietSuc).toBe(true)
  })

  it('kiệt sức xét SAU bước bán tài sản: tụt xuống dưới ngưỡng vì túng thiếu thì phải kể', () => {
    const goc = vanDuTien(70)
    // Tiền mặt âm sâu mà trong tay chỉ còn dúm trái phiếu: bán sạch vẫn không đủ,
    // nên năm này vừa có "Bán tài sản trang trải" vừa lãnh 10 điểm trừ "Túng thiếu".
    const tungThieu: GameState = {
      ...duyetHetThe(goc, false),
      tienMat: -5 * TY,
      soHuu: { ...goc.soHuu, traiPhieu: 10 },
      hanhPhuc: 70,
    }
    const sau = reducer(tungThieu, { type: 'ketThucNam' })
    const suKien = sau.tongKet!.suKien

    const banTaiSan = suKien.filter((k) => k.loai === 'banTaiSan')
    expect(banTaiSan.some((k) => k.tieuDe === 'Bán tài sản trang trải')).toBe(true)
    expect(banTaiSan.find((k) => k.tieuDe === 'Túng thiếu')!.hanhPhucThayDoi).toBe(-10)

    // Dựng lại mức hạnh phúc ngay TRƯỚC bước 11 bằng cách gỡ ngược mọi khoản của
    // bước 11 và bước 12 — đó chính là con số mà cách xét sai (đặt ở cuối bước 9)
    // sẽ đọc nhầm, và nó đang nằm TRÊN ngưỡng cảnh báo.
    const buoc11Va12 = suKien
      .filter((k) => k.loai === 'banTaiSan' || k.loai === 'mocTaiSan')
      .reduce((t, k) => t + k.hanhPhucThayDoi, 0)
    expect(sau.hanhPhuc - buoc11Va12).toBeGreaterThanOrEqual(
      CONFIG.hanhPhucNguongCanhBao,
    )
    expect(sau.hanhPhuc).toBeLessThan(CONFIG.hanhPhucNguongCanhBao)

    expect(suKien.filter((k) => k.loai === 'kietSuc')).toHaveLength(1)
    expect(sau.daCanhBaoKietSuc).toBe(true)
    // Lời khép lại của năm nên nó đứng cuối mảng sự kiện, sau cả lạm phát
    expect(suKien.at(-1)!.loai).toBe('kietSuc')
  })

  it('kiệt sức xét SAU cột mốc tài sản: leo lên trên ngưỡng nhờ mốc thì không kể', () => {
    // 400 triệu vượt đúng mốc đầu của giáo viên (300 triệu) mà chưa tới mốc hai
    // (700 triệu), nên năm này chạm đúng một cột mốc và được cộng 5 điểm ở bước 12.
    for (const coBanDau of [false, true]) {
      const goc = vanDuTien(63)
      const leoLai: GameState = {
        ...duyetHetThe(goc, false),
        tienMat: 400 * TRIEU,
        hanhPhuc: 63,
        daCanhBaoKietSuc: coBanDau,
      }
      const sau = reducer(leoLai, { type: 'ketThucNam' })

      const moc = sau.tongKet!.suKien.filter((k) => k.loai === 'mocTaiSan')
      expect(moc).toHaveLength(1)
      expect(moc[0]!.hanhPhucThayDoi).toBe(CONFIG.mocTaiSan.hanhPhuc)

      // Năm mở ra ở 58 — dưới ngưỡng cảnh báo — rồi khép lại ở 63 nhờ cột mốc
      expect(sau.hanhPhuc - moc[0]!.hanhPhucThayDoi).toBe(58)
      expect(sau.hanhPhuc).toBe(63)
      expect(sau.hanhPhuc).toBeGreaterThanOrEqual(CONFIG.hanhPhucNguongCanhBao)

      expect(sau.tongKet!.suKien.some((k) => k.loai === 'kietSuc')).toBe(false)
      expect(sau.daCanhBaoKietSuc).toBe(false)
    }
  })

  it('năm khép lại ĐÚNG ngưỡng cảnh báo thì không kể kiệt sức, thấp hơn một điểm thì kể', () => {
    // Biên `hanhPhuc >= hanhPhucNguongCanhBao` ở bước 13 vốn không có ca nào phủ:
    // các ca sẵn có đóng năm ở 55, 63, 100 và 50, không ca nào khép lại đúng 60.
    // Đổi dấu `>=` thành `>` mà cả bộ test vẫn xanh nghĩa là một năm kết ở đúng 60
    // sẽ bị kể kiệt sức oan VÀ bật cờ giảm nửa phí — lỗi kể chuyện hoá lỗi tiền bạc.
    const goc = vanDuTien(70)
    // Đánh dấu sẵn mọi cột mốc tài sản: mỗi mốc cộng 5 điểm ở bước 12, tức là sau
    // khi cờ kiệt sức đã xét xong, nên để nguyên thì không neo được con số cuối năm.
    const nen: GameState = {
      ...goc,
      mocTaiSanDaQua: mocTaiSanCuaNghe(goc.ngheId).map((_, i) => i),
    }

    // Các khoản hạnh phúc của `chuyenNam` (phạt khát vọng, sự kiện ngẫu nhiên) cộng
    // vào một hằng số không phụ thuộc mức neo — trần mềm ở 100 nên quanh vùng 60
    // không có chiết khấu nào, và ba lần chạy đều xuất phát từ cùng `nen` nên con
    // trỏ ngẫu nhiên giống hệt. Đo hằng số ấy một lần rồi neo ngược cho trúng biên.
    const NEO_THU = 70
    const lech = dongNam(nen, NEO_THU).hanhPhuc - NEO_THU

    const dungNguong = dongNam(nen, CONFIG.hanhPhucNguongCanhBao - lech)
    expect(dungNguong.hanhPhuc).toBe(CONFIG.hanhPhucNguongCanhBao)
    expect(dungNguong.tongKet!.suKien.some((k) => k.loai === 'kietSuc')).toBe(false)
    expect(dungNguong.daCanhBaoKietSuc).toBe(false)

    const duoiMotDiem = dongNam(nen, CONFIG.hanhPhucNguongCanhBao - 1 - lech)
    expect(duoiMotDiem.hanhPhuc).toBe(CONFIG.hanhPhucNguongCanhBao - 1)
    expect(duoiMotDiem.tongKet!.suKien.some((k) => k.loai === 'kietSuc')).toBe(true)
    expect(duoiMotDiem.daCanhBaoKietSuc).toBe(true)
  })

  it('thuê chuyên gia tài chính ở hạnh phúc 44 CÓ cứu được năm đang thua', () => {
    // 44 + 6 = 50, vừa đúng ngưỡng nên qua được ải. Đây là hành vi CHỦ Ý — chiếc
    // phao đắt đỏ dùng đúng một lần cả ván — nên cố định lại bằng bài kiểm thử.
    const DUOI_NGUONG = CONFIG.hanhPhucNguongThua - CG.taiChinh.hanhPhucNgay
    const goc = vanDuTien(DUOI_NGUONG)
    const benBoVuc: GameState = { ...duyetHetThe(goc, false), hanhPhuc: DUOI_NGUONG }
    expect(benBoVuc.hanhPhuc).toBeLessThan(CONFIG.hanhPhucNguongThua)

    // Không làm gì thì năm này khép lại bằng một ván thua
    expect(reducer(benBoVuc, { type: 'ketThucNam' }).trangThai).toBe('thua')

    const daThue = reducer(benBoVuc, { type: 'thueChuyenGiaTaiChinh' })
    expect(daThue.hanhPhuc).toBe(CONFIG.hanhPhucNguongThua)
    const sau = reducer(daThue, { type: 'ketThucNam' })
    expect(sau.trangThai).toBe('dangChoi')
    expect(sau.nam).toBe(benBoVuc.nam + 1)
    expect(daToiUuChiPhi(sau)).toBe(true)
  })

  it('mua liệu trình lúc đã dưới ngưỡng thua thì không cứu nổi năm đó', () => {
    const s0 = vanDuTien(CONFIG.hanhPhucNguongThua - 1)
    const quaMuon: GameState = {
      ...duyetHetThe(s0, false),
      hanhPhuc: CONFIG.hanhPhucNguongThua - 1,
      // Năm trước đã chốt là kiệt sức nên đang được hỗ trợ nửa phí — nhưng phí rẻ
      // không đổi được kết cục, vì buổi trị liệu diễn ra sau cửa ải thua
      daCanhBaoKietSuc: true,
    }
    expect(phiChuyenGiaTamLy(quaMuon)).toBeLessThan(giaDuTamLy(quaMuon))

    const daThue = reducer(quaMuon, { type: 'thueChuyenGiaTamLy' })
    expect(dangTriLieu(daThue)).toBe(true)
    expect(daThue.hanhPhuc).toBe(quaMuon.hanhPhuc)

    // Buổi trị liệu chỉ diễn ra trong chuyenNam, tức là SAU cửa ải thua
    const sau = reducer(daThue, { type: 'ketThucNam' })
    expect(sau.trangThai).toBe('thua')
    expect(sau.phase).toBe('ketThuc')
    expect(sau.nam).toBe(daThue.nam)
    expect(sau.tongKet?.suKien.some((k) => k.loai === 'triLieu') ?? false).toBe(false)
  })

  describe('v1.6 — xuất thân', () => {
    it('có đủ bốn xuất thân, id không trùng nhau', () => {
      expect(XUAT_THAN).toHaveLength(4)
      const ids = XUAT_THAN.map((x) => x.id)
      expect(new Set(ids).size).toBe(4)
      expect(ids).toContain('vienChuc')
    })

    it('vốn nhiều thì chi phí sống cao — đánh đổi chạy đều một chiều', () => {
      const theoVon = [...XUAT_THAN].sort((a, b) => a.tyLeVonBanDau - b.tyLeVonBanDau)
      for (let i = 1; i < theoVon.length; i++) {
        expect(theoVon[i]!.heSoChiPhiSong).toBeGreaterThan(theoVon[i - 1]!.heSoChiPhiSong)
      }
    })

    it('viên chức tỉnh lẻ trung tính ở mọi hệ số — nó là mặc định của ván cũ', () => {
      const x = timXuatThan('vienChuc')!
      expect(x.heSoChiPhiSong).toBe(1)
      expect(x.tyLeNoBanDau).toBe(0)
      expect(x.tyLePhungDuong).toBe(0)
      expect(x.hanhPhucBanDau).toBe(0)
    })

    it('chỉ nhà thuần nông có nợ học phí và phải phụng dưỡng', () => {
      const coNo = XUAT_THAN.filter((x) => x.tyLeNoBanDau > 0)
      expect(coNo.map((x) => x.id)).toEqual(['thuanNong'])
      const coPhungDuong = XUAT_THAN.filter((x) => x.tyLePhungDuong > 0)
      expect(coPhungDuong.map((x) => x.id)).toEqual(['thuanNong'])
    })

    it('năm bậc lương đối xứng quanh 1', () => {
      const bac = CONFIG.xuatThan.bacLuong
      expect(bac).toHaveLength(5)
      expect(bac[2]).toBe(1)
      expect(bac[0]! + bac[4]!).toBeCloseTo(2, 10)
    })

    it('mặc định vẫn là viên chức tỉnh lẻ, lương đúng bằng lương gốc của nghề', () => {
      const s = taoGameMoi('giaoVien', SEED)
      expect(s.xuatThanId).toBe('vienChuc')
      expect(s.heSoLuongKhoiDiem).toBe(1)
      expect(s.luong).toBe(timNghe('giaoVien')!.luong)
      expect(s.tienMat).toBe(
        Math.round(s.luong * timXuatThan('vienChuc')!.tyLeVonBanDau),
      )
      expect(s.khoanVay).toHaveLength(0)
    })

    it('mỗi xuất thân cho đúng số vốn ban đầu', () => {
      for (const x of XUAT_THAN) {
        const s = taoGameMoi('giaoVien', SEED, {
          xuatThanId: x.id,
          heSoLuongKhoiDiem: 1,
        })
        expect(s.tienMat).toBe(Math.round(s.luong * x.tyLeVonBanDau))
        expect(s.hanhPhuc).toBe(CONFIG.hanhPhucBanDau + x.hanhPhucBanDau)
      }
    })

    it('nhà thuần nông vào đời với khoản nợ học phí trả trong mười năm', () => {
      const s = taoGameMoi('giaoVien', SEED, {
        xuatThanId: 'thuanNong',
        heSoLuongKhoiDiem: 1,
      })
      expect(s.khoanVay).toHaveLength(1)
      const no = s.khoanVay[0]!
      expect(no.goc).toBe(Math.round(s.luong * 0.4))
      expect(no.kyHan).toBe(CONFIG.kyHanVayToiDa)
      expect(no.namConLai).toBe(CONFIG.kyHanVayToiDa)
      expect(no.thanhToanMoiNam).toBe(
        thanhToanMoiNamCuaKhoanVay(no.goc, CONFIG.kyHanVayToiDa),
      )
    })

    it('bậc lương nhân đúng vào lương khởi điểm', () => {
      for (const bac of CONFIG.xuatThan.bacLuong) {
        const s = taoGameMoi('bacSi', SEED, {
          xuatThanId: 'vienChuc',
          heSoLuongKhoiDiem: bac,
        })
        expect(s.luong).toBe(Math.round(timNghe('bacSi')!.luong * bac))
      }
    })

    it('action chonNghe truyền được thiết lập nhân vật', () => {
      const s = reducer({} as GameState, {
        type: 'chonNghe',
        ngheId: 'kySuPhanMem',
        seed: SEED,
        thietLap: { xuatThanId: 'khaGia', heSoLuongKhoiDiem: 1.25 },
      })
      expect(s.xuatThanId).toBe('khaGia')
      expect(s.heSoLuongKhoiDiem).toBe(1.25)
    })
  })
})

describe('v1.6 — chi phí sống và áp lực công việc', () => {
  it('chi phí sinh hoạt nhân hệ số lối sống của xuất thân', () => {
    const goc = timNghe('giaoVien')!.chiPhi
    for (const x of XUAT_THAN) {
      // tuổi 21 ở năm 1 nên nhà thuần nông vẫn đang phụng dưỡng
      const heSo = tinhHeSoChiPhi(false, [], 1, x, 1)
      const mongDoi = x.heSoChiPhiSong * (1 + x.tyLePhungDuong)
      expect(heSo).toBeCloseTo(mongDoi, 10)
      expect(Math.round(goc * heSo)).toBeGreaterThan(0)
    }
  })

  it('phụng dưỡng tắt hẳn sau tuổi 55', () => {
    const x = timXuatThan('thuanNong')!
    const namTuoi55 = 55 - CONFIG.cotTruyen.tuoiBatDau + 1
    expect(tinhHeSoChiPhi(false, [], namTuoi55, x, 1)).toBeCloseTo(
      x.heSoChiPhiSong * (1 + x.tyLePhungDuong),
      10,
    )
    expect(tinhHeSoChiPhi(false, [], namTuoi55 + 1, x, 1)).toBeCloseTo(
      x.heSoChiPhiSong,
      10,
    )
  })

  it('bậc lương kéo chi phí sinh hoạt theo đúng 0,6 lần mức lệch', () => {
    const x = timXuatThan('vienChuc')!
    expect(tinhHeSoChiPhi(false, [], 1, x, 1.25)).toBeCloseTo(1.15, 10)
    expect(tinhHeSoChiPhi(false, [], 1, x, 0.75)).toBeCloseTo(0.85, 10)
  })

  it('bậc lương cao nhất trừ đúng 5 điểm hạnh phúc mỗi năm', () => {
    const s = taoGameMoi('giaoVien', SEED, { xuatThanId: 'vienChuc', heSoLuongKhoiDiem: 1.25 })
    expect(apLucCongViec(s)).toBe(-5)
    expect(apLucCongViec({ ...s, heSoLuongKhoiDiem: 0.75 })).toBe(5)
    expect(apLucCongViec({ ...s, heSoLuongKhoiDiem: 1 })).toBe(0)
  })

  it('áp lực công việc tắt hẳn sau khi nghỉ hưu', () => {
    const s = taoGameMoi('giaoVien', SEED, { xuatThanId: 'vienChuc', heSoLuongKhoiDiem: 1.25 })
    expect(apLucCongViec({ ...s, daNghiHuu: true })).toBe(0)
  })

  it('mocTaiSanCuaNghe không đổi theo xuất thân hay bậc lương', () => {
    const moc = mocTaiSanCuaNghe('giaoVien')
    const s = taoGameMoi('giaoVien', SEED, { xuatThanId: 'vienChuc', heSoLuongKhoiDiem: 1.25 })
    expect(mocTaiSanCuaNghe(s.ngheId)).toEqual(moc)
  })
})

describe('v1.6 — mục tiêu tự do đổi theo thiết lập', () => {
  it('nhà khá giả có đích tự do cao hơn nhà thuần nông cùng nghề', () => {
    const nghe = timNghe('giaoVien')!
    const thap = nghiaVuNamDau(nghe, timXuatThan('thuanNong')!, 1)
    const cao = nghiaVuNamDau(nghe, timXuatThan('khaGia')!, 1)
    expect(cao).toBeGreaterThan(thap)
  })

  it('bậc lương cao đẩy đích tự do lên theo', () => {
    const nghe = timNghe('bacSi')!
    const x = timXuatThan('vienChuc')!
    expect(nghiaVuNamDau(nghe, x, 1.25)).toBeGreaterThan(nghiaVuNamDau(nghe, x, 1))
  })

  it('không tham số thì giữ nguyên kết quả cũ', () => {
    const nghe = timNghe('kySuPhanMem')!
    expect(nghiaVuNamDau(nghe)).toBe(nghiaVuNamDau(nghe, timXuatThan('vienChuc')!, 1))
  })

  it('mucTieuTuDo của ván khá giả cao hơn ván thuần nông', () => {
    const a = taoGameMoi('giaoVien', SEED, { xuatThanId: 'thuanNong', heSoLuongKhoiDiem: 1 })
    const b = taoGameMoi('giaoVien', SEED, { xuatThanId: 'khaGia', heSoLuongKhoiDiem: 1 })
    expect(mucTieuTuDo(b)).toBeGreaterThan(mucTieuTuDo(a))
  })
})

describe('v1.6 — cấu hình chu kỳ kinh tế', () => {
  const TRANG_THAI = ['thinhVuong', 'binhThuong', 'suyThoai', 'khungHoang'] as const

  it('mỗi hàng của ma trận chuyển cộng lại đúng bằng 1', () => {
    for (const tu of TRANG_THAI) {
      const hang = CONFIG.thiTruong.maTranChuyen[tu]
      const tong = TRANG_THAI.reduce((t, sang) => t + hang[sang], 0)
      expect(tong).toBeCloseTo(1, 10)
    }
  })

  it('khủng hoảng không bao giờ nhảy thẳng lên thịnh vượng', () => {
    expect(CONFIG.thiTruong.maTranChuyen.khungHoang.thinhVuong).toBe(0)
  })

  it('độ lệch giá giảm dần từ thịnh vượng xuống khủng hoảng', () => {
    const lech = TRANG_THAI.map((t) => CONFIG.thiTruong.tacDong[t].doLechGia)
    for (let i = 1; i < lech.length; i++) {
      expect(lech[i]!).toBeLessThan(lech[i - 1]!)
    }
  })

  it('chỉ vàng nghịch chu kỳ, chỉ trái phiếu miễn nhiễm', () => {
    const am = TAI_SAN.filter((t) => t.nhayChuKy < 0).map((t) => t.id)
    expect(am).toEqual(['vang'])
    const khong = TAI_SAN.filter((t) => t.nhayChuKy === 0).map((t) => t.id)
    expect(khong).toEqual(['traiPhieu'])
  })

  it('ván mới bắt đầu ở trạng thái bình thường', () => {
    expect(taoGameMoi('giaoVien', SEED).thiTruong).toBe('binhThuong')
  })
})

describe('v1.6 — chu kỳ kinh tế tác động lên nền kinh tế', () => {
  /** Ép trạng thái thị trường rồi đi trọn một năm, trả về bảng tổng kết. */
  const namVoiThiTruong = (t: TrangThaiThiTruong) => {
    const s = { ...moiVan(), thiTruong: t }
    return diTronMotNam(s).tongKet!
  }

  const bienDongCua = (tk: TongKetNam, id: AssetId) =>
    tk.bienDongTaiSan.find((b) => b.id === id)!.bienDong

  it('khủng hoảng kéo cổ phiếu và tiền mã hoá xuống, đẩy vàng lên', () => {
    const kh = namVoiThiTruong('khungHoang')
    const bt = namVoiThiTruong('binhThuong')
    expect(bienDongCua(kh, 'coPhieu')).toBeLessThan(bienDongCua(bt, 'coPhieu'))
    expect(bienDongCua(kh, 'crypto')).toBeLessThan(bienDongCua(bt, 'crypto'))
    expect(bienDongCua(kh, 'vang')).toBeGreaterThan(bienDongCua(bt, 'vang'))
  })

  it('trái phiếu miễn nhiễm với chu kỳ', () => {
    const kh = namVoiThiTruong('khungHoang')
    const tv = namVoiThiTruong('thinhVuong')
    expect(bienDongCua(kh, 'traiPhieu')).toBeCloseTo(bienDongCua(tv, 'traiPhieu'), 10)
  })

  it('biến động giá không bao giờ xuống dưới sàn', () => {
    for (let seed = 0; seed < 60; seed++) {
      const s = { ...taoGameMoi('giaoVien', seed), thiTruong: 'khungHoang' as const }
      const tk = diTronMotNam(s).tongKet!
      for (const b of tk.bienDongTaiSan) {
        expect(b.bienDong).toBeGreaterThanOrEqual(CONFIG.thiTruong.sanBienDong)
      }
    }
  })

  it('lạm phát năm khủng hoảng cao hơn năm bình thường đúng 5 điểm phần trăm', () => {
    const kh = namVoiThiTruong('khungHoang')
    const bt = namVoiThiTruong('binhThuong')
    expect(kh.lamPhat - bt.lamPhat).toBeCloseTo(0.05, 10)
  })

  it('thu nhập doanh nghiệp trong khủng hoảng bằng một nửa mức bình thường', () => {
    const nen = {
      ...moiVan(),
      doanhNghiep: [
        {
          coHoiId: 'nhaTroCongNhan',
          ten: 'Dãy nhà trọ cho công nhân thuê',
          thuNhapNen: 195 * TRIEU,
          chiSoGiaLucMua: 1,
          vonGoc: timCoHoi('nhaTroCongNhan')!.gia,
        },
      ],
    }
    const bt = diTronMotNam({ ...nen, thiTruong: 'binhThuong' }).tongKet!
    const kh = diTronMotNam({ ...nen, thiTruong: 'khungHoang' }).tongKet!
    const tienBT = bt.thuNhapDoanhNghiep[0]!.soTien
    const tienKH = kh.thuNhapDoanhNghiep[0]!.soTien
    expect(tienKH / tienBT).toBeCloseTo(0.5, 2)
  })

  it('lương không tăng thực trong khủng hoảng', () => {
    const kh = namVoiThiTruong('khungHoang')
    expect(kh.tangLuong).toBeCloseTo(kh.lamPhat, 3)
  })

  it('trạng thái chỉ chuyển tới nơi ma trận cho phép', () => {
    let s = moiVan()
    for (let i = 0; i < 60 && s.trangThai === 'dangChoi'; i++) {
      const truoc = s.thiTruong
      s = reducer(diTronMotNam(s, 5 * TY), { type: 'dongTongKet' })
      expect(CONFIG.thiTruong.maTranChuyen[truoc][s.thiTruong]).toBeGreaterThan(0)
    }
  })

  it('chu kỳ thị trường thật sự đổi qua nhiều năm, không đứng yên mãi một trạng thái', () => {
    // Bẫy của test phía trên: mọi hàng ma trận đều có xác suất tự lặp dương trên
    // đường chéo (binhThuong → binhThuong = 0,54), nên nếu `chuyenNam` quên gán
    // `thiTruong: thiTruongSau` ở cuối thì trạng thái đứng yên VĨNH VIỄN ở giá trị
    // khởi tạo mà test trên vẫn xanh — mọi "chuyển" quan sát được vẫn hợp lệ theo
    // ma trận. Đóng lưới bằng cách chạy đủ nhiều năm (40, seed cố định để tất
    // định) rồi khẳng định TẬP các trạng thái quan sát được có nhiều hơn một
    // phần tử — nếu đứng yên thì tập chỉ có đúng một phần tử và test này đỏ.
    const trangThaiQuanSat = new Set<TrangThaiThiTruong>()
    let s = moiVan()
    trangThaiQuanSat.add(s.thiTruong)
    for (let i = 0; i < 40 && s.trangThai === 'dangChoi'; i++) {
      s = reducer(diTronMotNam(s, 5 * TY), { type: 'dongTongKet' })
      trangThaiQuanSat.add(s.thiTruong)
    }
    expect(trangThaiQuanSat.size).toBeGreaterThan(1)
  })
})

describe('v1.6 — tài sản ròng và trần quy mô góp vốn', () => {
  it('tài sản ròng trừ đi tổng số tiền còn phải trả của mọi khoản vay', () => {
    const s: GameState = {
      ...moiVan(),
      tienMat: 1 * TY,
      khoanVay: [
        { id: 'a', goc: 500 * TRIEU, kyHan: 10, thanhToanMoiNam: 70 * TRIEU, namConLai: 4 },
      ],
    }
    expect(taiSanRong(s)).toBe(tongTaiSan(s) - 280 * TRIEU)
  })

  it('không nợ thì tài sản ròng bằng tổng tài sản', () => {
    const s = { ...moiVan(), tienMat: 2 * TY, khoanVay: [] }
    expect(taiSanRong(s)).toBe(tongTaiSan(s))
  })

  it('trần quy mô không cho một cơ hội vượt 60% tài sản ròng', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 100 * TY, khoanVay: [] }
    const bac = quyMoToiDa(s, coHoi)
    expect(giaThucTe(s, coHoi.gia) * bac).toBeLessThanOrEqual(
      taiSanRong(s) * CONFIG.quyMoGopVon.tyLeToiDaTheoTaiSan,
    )
    expect(bac).toBe(Math.max(...CONFIG.quyMoGopVon.bac))
  })

  it('trần quy mô không cho vượt tiền mặt đang có', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const base = moiVan()
    // Cần một danh mục đầu tư đứng ngoài tiền mặt để trần 60% tài sản ròng
    // không phải là rào cản chặt hơn: với tiền mặt là TOÀN BỘ tài sản ròng (như
    // vốn dĩ một ván mới không có khoản đầu tư nào), 60% của chính nó luôn nhỏ
    // hơn 100% của nó, nên trần tài sản ròng sẽ luôn bó chặt hơn trần tiền mặt
    // và test này không bao giờ cô lập được đúng cái nó muốn đo. Thêm 700 phần
    // trái phiếu (700 triệu) đẩy tài sản ròng lên 1,6 tỷ — 60% của nó là 960
    // triệu, lớn hơn 900 triệu tiền mặt — nên tiền mặt mới thật sự là rào cản.
    const s = {
      ...base,
      tienMat: 900 * TRIEU,
      khoanVay: [],
      soHuu: { ...base.soHuu, traiPhieu: 700 },
    }
    const bac = quyMoToiDa(s, coHoi)
    expect(giaThucTe(s, coHoi.gia) * bac).toBeLessThanOrEqual(s.tienMat)
    expect(bac).toBe(2)
  })

  it('không đủ tiền cho một suất thì trần bằng 0', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 10 * TRIEU, khoanVay: [] }
    expect(quyMoToiDa(s, coHoi)).toBe(0)
  })

  it('một cơ hội ngốn phần lớn tài sản ròng vẫn nhận được đúng một suất khi đủ tiền mặt', () => {
    // quanCaPhe giá 400 triệu. Tài sản ròng ở đây đúng bằng tiền mặt (không đầu
    // tư, không nợ) nên trần 60% tài sản ròng chỉ còn 300 triệu — thấp hơn giá
    // một suất. Suất gốc 1x KHÔNG được phép bị chặn bởi trần này, chỉ phụ thuộc
    // tiền mặt: có 500 triệu, đủ trả 400 triệu, nên phải nhận được đúng 1 suất.
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...moiVan(), tienMat: 500 * TRIEU, khoanVay: [] }
    expect(quyMoToiDa(s, coHoi)).toBe(1)
  })

  it('các bậc quy mô tăng dần và bắt đầu từ 1', () => {
    const bac = CONFIG.quyMoGopVon.bac
    expect(bac[0]).toBe(1)
    for (let i = 1; i < bac.length; i++) expect(bac[i]!).toBeGreaterThan(bac[i - 1]!)
  })
})

describe('v1.6 — góp vốn theo quy mô', () => {
  const vanGiau = (): GameState => ({ ...moiVan(), tienMat: 50 * TY, khoanVay: [] })

  it('góp 5 suất thì trả gấp 5 lần và thu nhập nền gấp 5 lần', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const gia = giaThucTe(s, coHoi.gia)
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 5,
    })
    expect(sau.tienMat).toBe(s.tienMat - gia * 5)
    const dn = sau.doanhNghiep.at(-1)!
    expect(dn.vonGoc).toBe(gia * 5)
    expect(dn.thuNhapNen).toBe(giaThucTe(s, coHoi.thuNhapMoiNam!) * 5)
  })

  it('thiếu heSoQuyMo thì hiểu là một suất — lời gọi cũ giữ nguyên ý nghĩa', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: true })
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, coHoi.gia))
    expect(sau.doanhNghiep.at(-1)!.vonGoc).toBe(giaThucTe(s, coHoi.gia))
  })

  it('quy mô bị kẹp về trần, không cho vượt tài sản ròng', () => {
    const coHoi = timCoHoi('quanCaPhe')!
    const base = moiVan()
    // Cùng lý do với test tương tự ở Task 9: không có khoản đầu tư nào khác
    // ngoài tiền mặt thì tài sản ròng đúng bằng tiền mặt, và 60% của chính nó
    // luôn nhỏ hơn 100% của nó — trần tài sản ròng sẽ luôn bó chặt hơn trần
    // tiền mặt, khiến "yêu cầu 12 suất bị kẹp về 2" không bao giờ xảy ra. Thêm
    // 700 phần trái phiếu (700 triệu) để trần tài sản ròng (1,6 tỷ × 60% = 960
    // triệu) rộng hơn trần tiền mặt (900 triệu), đúng như test này muốn đo.
    const s = {
      ...base,
      tienMat: 900 * TRIEU,
      khoanVay: [],
      phase: 'tuDo' as const,
      coHoiNamNay: [coHoi],
      soHuu: { ...base.soHuu, traiPhieu: 700 },
    }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 12,
    })
    expect(sau.doanhNghiep.at(-1)!.vonGoc).toBe(giaThucTe(s, coHoi.gia) * 2)
  })

  it('canh bạc bỏ qua quy mô — luôn đúng một suất', () => {
    const coHoi = timCoHoi('coinMoi')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 8,
    })
    expect(sau.tienMat).toBe(s.tienMat - giaThucTe(s, coHoi.gia))
    expect(sau.khoanDangCho.at(-1)!.gia).toBe(giaThucTe(s, coHoi.gia))
  })

  it('tổ chức sự kiện trả lãi trên số vốn thật đã bỏ ra', () => {
    const coHoi = timCoHoi('hoiChoTet')!
    const s = { ...vanGiau(), phase: 'tuDo' as const, coHoiNamNay: [coHoi] }
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: coHoi.id,
      nhan: true,
      heSoQuyMo: 3,
    })
    expect(sau.khoanDangCho.at(-1)!.gia).toBe(giaThucTe(s, coHoi.gia) * 3)
  })

  it('cơ hội tầm lớn không xuất hiện khi chưa đủ giàu', () => {
    const lon = CO_HOI.filter((c) => c.taiSanToiThieu !== undefined)
    expect(lon.length).toBeGreaterThanOrEqual(3)
    const ngheo = { ...moiVan(), tienMat: 100 * TRIEU, khoanVay: [] }
    for (const c of lon) expect(coHoiHopLe(c, ngheo)).toBe(false)
    const giau = { ...moiVan(), tienMat: 200 * TY, khoanVay: [], nam: 40 }
    expect(lon.some((c) => coHoiHopLe(c, giau))).toBe(true)
  })

  it('cơ hội tầm lớn vẫn nằm trong dải sinh lời 19–22% mỗi năm', () => {
    for (const c of CO_HOI.filter((x) => x.taiSanToiThieu !== undefined)) {
      const tyLe = (c.thuNhapMoiNam ?? 0) / c.gia
      expect(tyLe).toBeGreaterThanOrEqual(0.19)
      expect(tyLe).toBeLessThanOrEqual(0.22)
    }
  })
})

describe('v1.6 — lịch biến cố lớn', () => {
  it('mỗi ván có từ 2 tới 4 biến cố, tất định theo seed', () => {
    for (let seed = 0; seed < 40; seed++) {
      const a = taoGameMoi('giaoVien', seed)
      const b = taoGameMoi('giaoVien', seed)
      expect(a.lichBienCo).toEqual(b.lichBienCo)
      expect(a.lichBienCo.length).toBeGreaterThanOrEqual(CONFIG.bienCo.soBienCoMin)
      expect(a.lichBienCo.length).toBeLessThanOrEqual(CONFIG.bienCo.soBienCoMax)
    }
  })

  it('các mốc nằm trong khoảng tuổi cho phép và cách nhau tối thiểu 8 năm', () => {
    for (let seed = 0; seed < 40; seed++) {
      const lich = taoGameMoi('giaoVien', seed).lichBienCo
      for (const nam of lich) {
        expect(tuoiTaiNam(nam)).toBeGreaterThanOrEqual(CONFIG.bienCo.tuoiSomNhat)
        expect(tuoiTaiNam(nam)).toBeLessThanOrEqual(CONFIG.bienCo.tuoiMuonNhat)
      }
      const sapXep = [...lich].sort((x, y) => x - y)
      expect(sapXep).toEqual(lich)
      for (let i = 1; i < lich.length; i++) {
        expect(lich[i]! - lich[i - 1]!).toBeGreaterThanOrEqual(
          CONFIG.bienCo.cachNhauToiThieu,
        )
      }
    }
  })

  it('ván mới chưa gặp biến cố nào và chưa có di chứng lương', () => {
    const s = taoGameMoi('giaoVien', SEED)
    expect(s.bienCoDaQua).toEqual([])
    expect(s.heSoLuongDiChung).toBe(1)
  })
})

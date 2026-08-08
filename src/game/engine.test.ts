import { describe, expect, it } from 'vitest'
import { CONFIG, TRIEU, TY } from './config'
import { NGHE, TAI_SAN, THE_TIEU_DUNG, timCoHoi, timNghe, timUocNguyen } from './content'
import {
  bienDoThuNhapThuDong,
  coHoiHopLe,
  dangCoBaoHiemXe,
  dongTienThuDong,
  giaThucTe,
  mocTaiSanCuaNghe,
  muaToiDa,
  mucTieuTuDo,
  nghiaVuHangNam,
  phiBaoHiem,
  phiBaoHiemXe,
  reducer,
  taoGameMoi,
  thanhToanMoiNamCuaKhoanVay,
  themHanhPhuc,
  thuNhapThuDong,
  tongTaiSan,
  traNoMoiNam,
  tuoiTaiNam,
  tyLeDongTra,
  vayToiDa,
  xeDangCo,
} from './engine'
import type { CoHoi, GameState } from './types'

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
  it('tiền mặt ban đầu bằng đúng một năm lương', () => {
    for (const nghe of NGHE) {
      const s = taoGameMoi(nghe.id, SEED)
      expect(s.tienMat).toBe(nghe.luong)
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
    // 400 triệu vượt mốc 1 (300 triệu) nhưng chưa tới mốc 2 (700 triệu)
    s = { ...s, tienMat: 400 * TRIEU, hanhPhuc: 90 }
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
    // Chạy nhiều năm để chắc chắn gặp ít nhất một lần ốm đau
    let vienPhiLonNhat = 0
    for (let i = 0; i < 5 && veGia.trangThai === 'dangChoi'; i++) {
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
    let cur: GameState = { ...s0, nam: 75, daNghiHuu: true, hanhPhuc: 100 }
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

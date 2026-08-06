import { describe, expect, it } from 'vitest'
import { CONFIG, TRIEU } from './config'
import { NGHE, THE_TIEU_DUNG, timNghe } from './content'
import {
  giaThucTe,
  muaToiDa,
  reducer,
  taoGameMoi,
  thanhToanMoiNamCuaKhoanVay,
  themHanhPhuc,
  tongTaiSan,
  traNoMoiNam,
  vayToiDa,
} from './engine'
import type { GameState } from './types'

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

  it('thắng khi tổng tài sản chạm mục tiêu', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), true)
    const giau: GameState = { ...s0, tienMat: CONFIG.mucTieuTaiSan * 2 }
    expect(reducer(giau, { type: 'ketThucNam' }).trangThai).toBe('thang')
  })

  it('thua khi hết số năm tối đa mà chưa đạt mục tiêu', () => {
    const s0 = duyetHetThe(reducer(moiVan(), { type: 'traChiPhi' }), true)
    const cuoiDoi: GameState = { ...s0, nam: CONFIG.soNamToiDa }
    const sau = reducer(cuoiDoi, { type: 'ketThucNam' })
    expect(sau.trangThai).toBe('thua')
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

  it('mua món khát vọng thì hết bị phạt hạnh phúc và được thưởng mỗi năm', () => {
    const s0 = reducer(moiVan('giaoVien'), { type: 'traChiPhi' })
    let s: GameState = { ...s0, tienMat: 200 * TRIEU }
    s = reducer(s, { type: 'muaUocNguyen', uocNguyenId: 'xeMay' })
    expect(s.uocNguyenDaMua).toContain('xeMay')
    s = duyetHetThe(s, true)
    s = reducer(s, { type: 'ketThucNam' })
    expect(s.tongKet!.phatKhatVong).toBe(0)
    expect(s.tongKet!.hanhPhucTuUocNguyen).toBe(5)
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

describe('cơ hội kinh doanh', () => {
  it('góp vốn tạo ra thu nhập thụ động hàng năm', () => {
    const s0 = reducer(moiVan('kySuPhanMem'), { type: 'traChiPhi' })
    const s: GameState = {
      ...s0,
      tienMat: 5_000 * TRIEU,
      coHoiNamNay: [
        {
          id: 'quanCaPhe',
          ten: 'Mở quán cà phê nhỏ',
          moTa: '',
          emoji: '',
          loai: 'kinhDoanh',
          gia: 400 * TRIEU,
          thuNhapMoiNam: 90 * TRIEU,
        },
      ],
    }
    const sau = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: 'quanCaPhe', nhan: true })
    expect(sau.doanhNghiep).toHaveLength(1)
    expect(sau.tienMat).toBe(s.tienMat - 400 * TRIEU)
    expect(sau.coHoiNamNay).toHaveLength(0)
  })

  it('từ chối thì chỉ bỏ thẻ, không mất tiền', () => {
    const s = reducer(moiVan(), { type: 'traChiPhi' })
    const sau = reducer(s, {
      type: 'quyetDinhCoHoi',
      coHoiId: s.coHoiNamNay[0]!.id,
      nhan: false,
    })
    expect(sau.tienMat).toBe(s.tienMat)
    expect(sau.coHoiNamNay).toHaveLength(0)
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

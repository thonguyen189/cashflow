/**
 * Lưới an toàn cho giao diện: kết xuất tĩnh từng màn ở đủ các trạng thái đáng ngờ
 * và bắt lỗi số học rò rỉ ra màn hình.
 *
 * Test engine không thấy được lớp này: một phép chia cho `heSoToiUuChiPhi` bằng 0
 * hay một trường thiếu trong `state` chỉ hiện ra dưới dạng chữ "NaN" hoặc
 * "undefined" giữa bảng số, và người chơi là người đầu tiên nhìn thấy nó.
 */
import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TabTrangChu from './TabTrangChu'
import TabSoSach from './TabSoSach'
import Hud from './Hud'
import TongKetModal from './TongKetModal'
import { CONFIG } from '../game/config'
import { mocTaiSanCuaNghe, reducer, taoGameMoi } from '../game/engine'
import type { GameState } from '../game/types'

function chayToiTuDo(ngheId: string): GameState {
  let s = taoGameMoi(ngheId, 4242)
  s = reducer(s, { type: 'traChiPhi' })
  let bv = 0
  while (s.phase === 'theBai' && bv++ < 20) {
    s = reducer(s, { type: 'quyetDinhThe', nhan: false })
  }
  return s
}

const canhCanKiemTra: [string, (s: GameState) => GameState][] = [
  ['mặc định', (s) => s],
  ['đang được hỗ trợ', (s) => ({ ...s, daCanhBaoKietSuc: true })],
  [
    'đang trong liệu trình',
    (s) => ({ ...s, triLieuDenNam: s.nam + 2, soLanTriLieu: 1 }),
  ],
  // Phần giảm ĐÃ vào sổ: cờ bật, hệ số giảm, và `chiPhiHangNam` đã được `chuyenNam`
  // dựng lại theo hệ số ấy — đây mới là cảnh câu "Đang tiết kiệm" được phép hiện.
  [
    'đã tối ưu chi phí từ năm trước',
    (s) => ({
      ...s,
      daThueChuyenGiaTaiChinh: true,
      heSoToiUuChiPhi: 0.92,
      chiPhiHangNam: Math.round(s.chiPhiHangNam * 0.92),
    }),
  ],
  [
    'vừa thuê chuyên gia tài chính trong năm nay',
    (s) => reducer({ ...s, tienMat: 10_000_000_000 }, { type: 'thueChuyenGiaTaiChinh' }),
  ],
  ['sắp thua', (s) => ({ ...s, hanhPhuc: 45 })],
  ['sắp thua mà đã hết sạch tiền', (s) => ({ ...s, hanhPhuc: 45, tienMat: 0 })],
  ['trong vùng cảnh báo', (s) => ({ ...s, hanhPhuc: 55, daCanhBaoKietSuc: true })],
  [
    'trong vùng cảnh báo mà đang trị liệu',
    (s) => ({ ...s, hanhPhuc: 55, triLieuDenNam: s.nam + 2, soLanTriLieu: 1 }),
  ],
]

describe('giao diện kết xuất được', () => {
  for (const ngheId of ['giaoVien', 'bacSi', 'kySuPhanMem']) {
    for (const [ten, doi] of canhCanKiemTra) {
      it(`${ngheId} · ${ten}`, () => {
        const s = doi(chayToiTuDo(ngheId))
        const noop = () => {}
        const html =
          renderToStaticMarkup(createElement(Hud, { state: s })) +
          renderToStaticMarkup(
            createElement(TabTrangChu, { state: s, dispatch: noop }),
          ) +
          renderToStaticMarkup(createElement(TabSoSach, { state: s }))
        expect(html).toContain('Chuyên gia đồng hành')
        expect(html).not.toContain('NaN')
        expect(html).not.toContain('undefined')
        expect(html).not.toContain('Infinity')
      })
    }
  }

  it('lời cảnh báo sắp thua chỉ đúng vào đường cứu còn dùng được', () => {
    const goc = chayToiTuDo('giaoVien')
    // Khối cảnh báo chỉ kết xuất ở phase 'tuDo', mà reducer chỉ chuyển sang pha này
    // đúng lúc chuỗi thẻ đã rỗng — nên chỉ người chơi đi tìm "thẻ tiêu dùng" là chỉ
    // vào thứ chắc chắn không còn. Chốt luôn tiền đề ấy ở đây.
    expect(goc.phase).toBe('tuDo')
    expect(goc.theConLai.length).toBe(0)

    const ketXuat = (s: GameState) =>
      renderToStaticMarkup(createElement(TabTrangChu, { state: s, dispatch: () => {} }))

    const conTien = ketXuat({ ...goc, hanhPhuc: 45, tienMat: 10_000_000_000 })
    expect(conTien).toContain('Còn đúng một đường gỡ')
    expect(conTien).toContain('hoạch định tài chính')
    expect(conTien).not.toContain('thẻ tiêu dùng')

    // Hết tiền, hoặc đã thuê rồi, thì nói thẳng là năm nay không còn cách nào
    const hetTien = ketXuat({ ...goc, hanhPhuc: 45, tienMat: 0 })
    expect(hetTien).toContain('không còn cách nào gỡ lại')
    expect(hetTien).not.toContain('Còn đúng một đường gỡ')
  })

  it('đang trị liệu thì không giục đi gặp chuyên gia tâm lý nữa', () => {
    const goc = chayToiTuDo('giaoVien')
    const dangTri: GameState = {
      ...goc,
      hanhPhuc: 55,
      triLieuDenNam: goc.nam + 2,
      soLanTriLieu: 1,
    }
    const html = renderToStaticMarkup(
      createElement(TabTrangChu, { state: dangTri, dispatch: () => {} }),
    )
    // Thẻ 🧘 lúc này không còn nút, nên câu giục đi gặp chuyên gia chỉ khiến người
    // chơi cuộn xuống tìm một nút không tồn tại
    expect(html).toContain('Đang trị liệu')
    expect(html).not.toContain('Đây đúng là lúc nên gặp chuyên gia tâm lý')
    expect(html).toContain('bạn đang trong liệu trình')
  })

  it('tổng kết năm kết xuất được cả sự kiện kiệt sức lẫn buổi trị liệu', () => {
    let s = taoGameMoi('giaoVien', 777)
    s = reducer(s, { type: 'traChiPhi' })
    let bv = 0
    while (s.phase === 'theBai' && bv++ < 20) {
      s = reducer(s, { type: 'quyetDinhThe', nhan: false })
    }
    s = reducer({ ...s, tienMat: 10_000_000_000 }, { type: 'thueChuyenGiaTamLy' })
    // Đánh dấu sẵn mọi cột mốc tài sản rồi neo hạnh phúc dưới ngưỡng cảnh báo: túi
    // mười tỷ vượt sạch bốn mốc ngay năm đầu, mỗi mốc cộng 5 điểm SAU khi cờ kiệt
    // sức đã xét, nên để nguyên thì năm này khép lại ở 85 và nhánh 😔 của
    // `BIEU_TUONG_SU_KIEN` chưa từng chạy qua bộ kết xuất một lần nào.
    s = {
      ...s,
      hanhPhuc: 52,
      mocTaiSanDaQua: mocTaiSanCuaNghe(s.ngheId).map((_, i) => i),
    }
    s = reducer(s, { type: 'ketThucNam' })
    const loai = s.tongKet!.suKien.map((k) => k.loai)
    expect(loai).toContain('triLieu')
    expect(loai).toContain('kietSuc')
    expect(s.hanhPhuc).toBeLessThan(CONFIG.hanhPhucNguongCanhBao)
    const html = renderToStaticMarkup(
      createElement(TongKetModal, { state: s, dispatch: () => {} }),
    )
    expect(html).toContain('😔')
    expect(html).toContain('🧘')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('undefined')
  })
})

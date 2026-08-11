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
import TabKinhDoanh from './TabKinhDoanh'
import ChonNghe from './ChonNghe'
import Hud from './Hud'
import TongKetModal from './TongKetModal'
import { CONFIG, TRIEU } from '../game/config'
import { NGHE } from '../game/content'
import {
  giaThucTe,
  heSoBaoHoa,
  heSoMatBangSong,
  mocTaiSanCuaNghe,
  reducer,
  tangLuongThucTheoTuoi,
  taoGameMoi,
  thuNhapNenNamNay,
} from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { DoanhNghiep, GameState, Nghe } from '../game/types'

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

describe('v1.7 — giao diện phản ánh cơ chế mới', () => {
  it('màn chọn nghề hiện đường cong sự nghiệp của từng nghề', () => {
    for (const nghe of NGHE) {
      expect(nghe.duongCongSuNghiep.length).toBeGreaterThan(0)
    }
    // Lương tuổi 40 phải khác nhau rõ rệt giữa ba nghề — đó là thứ màn chọn nghề
    // cần nói ra, vì lương khởi điểm nay gần như nhau.
    const luongTuoi40 = NGHE.map((nghe) => {
      let luong = nghe.luong
      for (let tuoi = 22; tuoi <= 40; tuoi++) {
        luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
      }
      return luong
    })
    // Vòng hiệu chỉnh v1.7 (Task 15) kéo ba nghề lại gần nhau để chênh lệch tỉ lệ
    // thắng về dưới 10 điểm, nên tỉ lệ phân kỳ tụt từ hơn 3,9 lần xuống 2,58 lần.
    // Vẫn là chênh lệch màn chọn nghề PHẢI nói ra: lương tuổi 40 của kỹ sư phần
    // mềm gấp hai lần rưỡi giáo viên trong khi lương khởi điểm chỉ hơn 1,6 lần.
    expect(Math.max(...luongTuoi40) / Math.min(...luongTuoi40)).toBeGreaterThan(2.5)
  })

  it('giá thẻ hiển thị bằng đúng giá engine trừ tiền', () => {
    const s = taoGameMoi('kySuPhanMem', 81)
    const the = s.theConLai[0]!
    const giaHienThi = Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))
    const sau = reducer({ ...s, daTraChiPhiNamNay: true, phase: 'theBai' }, {
      type: 'quyetDinhThe',
      nhan: true,
    })
    expect(s.tienMat - sau.tienMat).toBe(giaHienThi)
  })
})

describe('v1.7 fix round 1 — kết xuất khớp đúng hàm engine (không phải chỉ khớp nhau giữa hai công thức)', () => {
  /**
   * Cố ý LẶP LẠI công thức cục bộ của `ChonNghe.tsx` (hàm `luongTaiTuoi` không
   * export) thay vì trích nó ra thành helper dùng chung — đây là khoản nợ nhỏ
   * đã ghi nhận, để dành cho việc khác, không phải phạm vi của test này. Điều
   * quan trọng là công thức GỌI THẲNG `tangLuongThucTheoTuoi` của engine, không
   * bịa số, nên nếu màn hình lệch khỏi engine thì test này phải đỏ.
   */
  function luongTaiTuoi(nghe: Nghe, denTuoi: number): number {
    let luong = nghe.luong
    for (let tuoi = CONFIG.cotTruyen.tuoiBatDau + 1; tuoi <= denTuoi; tuoi++) {
      luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
    }
    return Math.round(luong)
  }

  it('màn chọn nghề hiện đúng số lương mà đường cong sự nghiệp của engine tính ra', () => {
    const html = renderToStaticMarkup(createElement(ChonNghe, { onChon: () => {} }))
    for (const nghe of NGHE) {
      for (const denTuoi of [30, 40, 60]) {
        // dinhDangTien(...) chứ không phải con số nguyên — đúng thứ người chơi
        // nhìn thấy trên màn hình, làm tròn y hệt cách component làm tròn.
        expect(html).toContain(dinhDangTien(luongTaiTuoi(nghe, denTuoi)))
      }
    }
  })

  it('bảng kinh doanh hiện đúng thu nhập và mức bão hoà mà engine tính cho đúng doanh nghiệp đó', () => {
    const goc = taoGameMoi('kySuPhanMem', 4242)
    // Cấy trực tiếp một doanh nghiệp 10 năm tuổi (namGop = năm 1, đang ở năm 11)
    // để hệ số bão hoà lệch hẳn khỏi 100% — nếu bằng 1 thì test không phân biệt
    // được bản có nhân heSoBaoHoa với bản bỏ sót nó.
    const doanhNghiep: DoanhNghiep = {
      coHoiId: 'quanCaPhe',
      ten: 'Mở quán cà phê nhỏ',
      thuNhapNen: 72 * TRIEU,
      chiSoGiaLucMua: goc.chiSoGia,
      vonGoc: 400 * TRIEU,
      namGop: goc.nam,
    }
    const s: GameState = { ...goc, nam: goc.nam + 10, doanhNghiep: [doanhNghiep] }
    const d = s.doanhNghiep[0]!

    // Giá trị kỳ vọng lấy THẲNG từ hàm engine — không hard-code số nào, để test
    // bắt được đúng lớp lỗi mà Task 14 dựng ra để ngăn: màn hình suy diễn lại
    // công thức thay vì gọi hàm, nên lệch khỏi số engine thực trả.
    const thuNhapKyVong = thuNhapNenNamNay(s, d)
    const baoHoaKyVong = heSoBaoHoa(s, d)
    expect(baoHoaKyVong).toBeLessThan(1)

    const html = renderToStaticMarkup(
      createElement(TabKinhDoanh, { state: s, dispatch: () => {} }),
    )
    // Ghim đúng vào cụm chữ của DÒNG DOANH NGHIỆP cụ thể (không phải dòng tổng
    // "Thu nhập thụ động năm nay" ở trên bảng) — nếu chỉ tìm số trần trụi thì
    // dòng tổng đúng (gọi thẳng `thuNhapThuDong` → cũng dùng `thuNhapNenNamNay`)
    // sẽ khiến test XANH GIẢ dù dòng doanh nghiệp phía dưới bị lỗi. Test này đã
    // thực sự bị bắt quả tang xanh giả kiểu đó khi soạn — xem báo cáo Fix round 1.
    expect(html).toContain(`${dinhDangTien(thuNhapKyVong)} mỗi năm`)
    expect(html).toContain(`Thu nhập còn ${Math.round(baoHoaKyVong * 100)}% so với ngày đầu`)
  })
})

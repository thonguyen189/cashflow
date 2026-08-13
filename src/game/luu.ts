import { CONFIG } from './config'
import { TAI_SAN } from './content'
import type { GameState } from './types'

/** Khoá lưu của các phiên bản cũ, dọn sạch khi nạp game. */
const KHOA_LUU_CU = [
  'dong-tien-save-v1',
  'dong-tien-luu-v1-1',
  'dong-tien-luu-v1-2',
  'dong-tien-luu-v1-3',
  'dong-tien-luu-v1-4',
  'dong-tien-luu-v1-5',
  'dong-tien-luu-v1-6',
]

/** Tự động lưu ván đang chơi vào localStorage. */
export function luuVan(s: GameState): void {
  try {
    localStorage.setItem(CONFIG.luuKey, JSON.stringify(s))
  } catch {
    // hết dung lượng hoặc trình duyệt chặn — bỏ qua, không làm hỏng ván đang chơi
  }
}

export function taiVan(): GameState | null {
  try {
    for (const khoa of KHOA_LUU_CU) localStorage.removeItem(khoa)
    const raw = localStorage.getItem(CONFIG.luuKey)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState
    // kiểm tra tối thiểu để không nạp phải dữ liệu của phiên bản cũ
    if (typeof s.nam !== 'number' || !s.soHuu || !s.giaTaiSan) return null
    // các trường của bản v1.3 và v1.4: ván cũ thiếu chúng sẽ làm game vỡ ngay
    // khi chạy, nên thà bỏ ván cũ còn hơn nạp vào rồi lỗi giữa chừng
    if (!s.baoHiemXe || !s.khoanDangCho || !s.coHoiDaLam) return null
    if (!s.uocNguyenDaMat) return null
    if (typeof s.daTuDo !== 'boolean') return null
    // trường của bản v1.5: ván v1.4 không có `heSoToiUuChiPhi` nên mọi phép nhân
    // chi phí sẽ ra NaN ngay năm đầu tiên — thà bỏ ván cũ còn hơn nạp vào rồi vỡ
    if (typeof s.heSoToiUuChiPhi !== 'number') return null
    // Thiếu cờ này thì `daToiUuChiPhi` trả `undefined`, giới hạn "cả ván một lần"
    // của gói hoạch định tài chính biến mất mà không có dấu hiệu gì trên màn hình
    if (typeof s.daThueChuyenGiaTaiChinh !== 'boolean') return null
    // trường của bản v1.6: ván v1.5 không có `heSoLuongKhoiDiem` nên mọi phép
    // nhân chi phí và áp lực hạnh phúc sẽ ra NaN ngay năm đầu tiên
    if (typeof s.heSoLuongKhoiDiem !== 'number') return null
    if (!s.xuatThanId) return null
    // trường của bản v1.6: ván cũ thiếu chúng thì chu kỳ thị trường, lịch biến cố
    // và bộ đếm phá sản đều là undefined — game vỡ ngay năm đầu tiên
    if (!s.thiTruong || !Array.isArray(s.lichBienCo)) return null
    // Thiếu trường này thì `bienCoDaQua.includes(id)` ở bước 7b ném lỗi ngay khi
    // tới năm đã hẹn biến cố lớn — vỡ giữa chừng chứ không phải ngay lúc nạp.
    if (!Array.isArray(s.bienCoDaQua)) return null
    if (typeof s.soLanPhaSan !== 'number') return null
    if (typeof s.heSoLuongDiChung !== 'number') return null
    // trường của bản v1.7: ván v1.6 thiếu `namGop` nên `heSoBaoHoa` trả NaN,
    // kéo theo mọi thu nhập doanh nghiệp thành NaN ngay năm đầu tiên
    if (s.doanhNghiep?.some((d) => typeof d.namGop !== 'number')) return null
    // trường của bản v1.7: thiếu nó thì khoản bảo lãnh không bao giờ vỡ và
    // `namVoBaoLanh > 0` so sánh với undefined ra false một cách âm thầm
    if (typeof s.namVoBaoLanh !== 'number') return null
    // Thiếu `lichSuGia` thì thẻ đầu tư ném lỗi ngay khi mở tab: `s.lichSuGia[id]`
    // là truy cập vào `undefined`, mà toán tử `??` phía sau không đỡ được — nó chỉ
    // đỡ khi bản thân object tồn tại nhưng khuyết khoá.
    if (!s.lichSuGia) return null
    // Trường của bản v1.8: mô hình giá mới cần giá trị thật và độ lệch của từng
    // kênh. Ván v1.7 chỉ có giá thị trường, nhưng đây là trường hợp DI TRÚ được
    // chứ không phải bỏ ván: coi giá đang cầm đúng bằng giá trị thật, độ lệch về
    // không. Người chơi mất pha chu kỳ đang dở — coi như thị trường vừa về đúng
    // giá trị — nhưng giữ nguyên danh mục, tiền mặt và giá đang nắm.
    if (!s.giaTriTaiSan || !s.lechGia || !s.lechGiaTruoc) {
      s.giaTriTaiSan = {} as GameState['giaTriTaiSan']
      s.lechGia = {} as GameState['lechGia']
      s.lechGiaTruoc = {} as GameState['lechGiaTruoc']
      for (const ts of TAI_SAN) {
        s.giaTriTaiSan[ts.id] = s.giaTaiSan[ts.id]
        s.lechGia[ts.id] = 0
        s.lechGiaTruoc[ts.id] = 0
      }
    }
    return s
  } catch {
    return null
  }
}

export function xoaVan(): void {
  try {
    localStorage.removeItem(CONFIG.luuKey)
  } catch {
    // bỏ qua
  }
}

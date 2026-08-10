import { CONFIG } from './config'
import type { GameState } from './types'

/** Khoá lưu của các phiên bản cũ, dọn sạch khi nạp game. */
const KHOA_LUU_CU = [
  'dong-tien-save-v1',
  'dong-tien-luu-v1-1',
  'dong-tien-luu-v1-2',
  'dong-tien-luu-v1-3',
  'dong-tien-luu-v1-4',
  'dong-tien-luu-v1-5',
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

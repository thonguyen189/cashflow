import { CONFIG } from './config'
import type { GameState } from './types'

/** Khoá lưu của các phiên bản cũ, dọn sạch khi nạp game. */
const KHOA_LUU_CU = ['dong-tien-save-v1', 'dong-tien-luu-v1-1']

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

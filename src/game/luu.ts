import { CONFIG } from './config'
import type { GameState } from './types'

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

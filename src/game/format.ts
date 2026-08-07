import { TRIEU, TY } from './config'

function so(x: number): string {
  const lamTron = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10
  // toLocaleString lo cả dấu phẩy thập phân lẫn dấu chấm phân cách nghìn:
  // 12,5 · 350 · 79.004 — ván trăm năm có thể chạm tới hàng chục nghìn tỷ.
  return lamTron.toLocaleString('vi-VN')
}

/** Định dạng tiền kiểu Việt Nam, không viết tắt: 12,5 tỷ · 350 triệu · 500 nghìn · 900 đồng.
 * Ngưỡng chọn bậc đặt tại 999,5 của bậc dưới để giá trị làm tròn lên tròn bậc
 * (999.500 đồng) ra "1 triệu" chứ không thành "1000 nghìn". */
export function dinhDangTien(v: number): string {
  const am = v < 0
  const x = Math.abs(v)
  let s: string
  if (x >= 999_500_000) s = `${so(x / TY)} tỷ`
  else if (x >= 999_500) s = `${so(x / TRIEU)} triệu`
  else if (x >= 999.5) s = `${so(x / 1000)} nghìn`
  else s = `${Math.round(x)} đồng`
  return (am ? '−' : '') + s
}

/** Dạng đầy đủ có dấu chấm phân cách, dùng cho tooltip. */
export function dinhDangDayDu(v: number): string {
  return `${Math.round(v).toLocaleString('vi-VN')} đồng`
}

export function dinhDangPhanTram(v: number, chuSo = 1): string {
  const dau = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${dau}${(Math.abs(v) * 100).toFixed(chuSo).replace('.', ',')}%`
}

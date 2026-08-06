import { TRIEU, TY } from './config'

function so(x: number): string {
  const lamTron = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10
  return lamTron.toString().replace('.', ',')
}

/** Định dạng tiền kiểu Việt Nam: 12,5 tỷ · 350 tr · 500 ng · 900 đ */
export function dinhDangTien(v: number): string {
  const am = v < 0
  const x = Math.abs(v)
  let s: string
  if (x >= TY) s = `${so(x / TY)} tỷ`
  else if (x >= TRIEU) s = `${so(x / TRIEU)} tr`
  else if (x >= 1000) s = `${so(x / 1000)} ng`
  else s = `${Math.round(x)} đ`
  return (am ? '−' : '') + s
}

/** Dạng đầy đủ có dấu chấm phân cách, dùng cho tooltip. */
export function dinhDangDayDu(v: number): string {
  return `${Math.round(v).toLocaleString('vi-VN')} đ`
}

export function dinhDangPhanTram(v: number, chuSo = 1): string {
  const dau = v > 0 ? '+' : ''
  return `${dau}${(v * 100).toFixed(chuSo).replace('.', ',')}%`
}

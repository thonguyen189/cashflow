import { TRIEU, TY } from './config'

function so(x: number): string {
  const lamTron = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10
  // toLocaleString lo cả dấu phẩy thập phân lẫn dấu chấm phân cách nghìn:
  // 12,5 · 350 · 79.004 — ván trăm năm có thể chạm tới hàng chục nghìn tỷ.
  return lamTron.toLocaleString('vi-VN')
}

/** Định dạng tiền kiểu Việt Nam, không viết tắt: 9,8 nghìn tỷ · 12,5 tỷ · 350 triệu
 * · 500 nghìn · 900 đồng.
 * Ngưỡng chọn bậc đặt tại 999,5 của bậc dưới để giá trị làm tròn lên tròn bậc
 * (999.500 đồng) ra "1 triệu" chứ không thành "1000 nghìn".
 *
 * Bậc "nghìn tỷ" thêm ở v1.8. Trước đó "tỷ" là bậc cao nhất, nên một ván tám mươi
 * năm — lạm phát khoảng 8% mỗi năm dồn lại gấp bốn trăm lần — in ra những chuỗi
 * như "11.090 tỷ" hay "830.000 tỷ": vẫn đúng, nhưng dài và khó đọc, mà cái sai
 * nặng hơn là dấu chấm phân cách nghìn đứng cạnh dấu phẩy thập phân của "12,5 tỷ"
 * ngay trên cùng màn hình. Đây KHÔNG phải trường hợp hiếm: giá trung vị một căn
 * nhà ở năm 79 đo được 2.792 tỷ. */
export function dinhDangTien(v: number): string {
  const am = v < 0
  const x = Math.abs(v)
  let s: string
  if (x >= 999_500_000_000) s = `${so(x / (1000 * TY))} nghìn tỷ`
  else if (x >= 999_500_000) s = `${so(x / TY)} tỷ`
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

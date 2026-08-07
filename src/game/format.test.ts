import { describe, expect, it } from 'vitest'
import { TRIEU, TY } from './config'
import { dinhDangDayDu, dinhDangPhanTram, dinhDangTien } from './format'

describe('định dạng tiền — không dùng từ viết tắt', () => {
  it('viết đầy đủ "tỷ", "triệu", "nghìn", "đồng"', () => {
    expect(dinhDangTien(12.5 * TY)).toBe('12,5 tỷ')
    expect(dinhDangTien(350 * TRIEU)).toBe('350 triệu')
    expect(dinhDangTien(500_000)).toBe('500 nghìn')
    expect(dinhDangTien(900)).toBe('900 đồng')
  })

  it('số âm mang dấu trừ nhưng vẫn viết đầy đủ', () => {
    expect(dinhDangTien(-2 * TRIEU)).toBe('−2 triệu')
  })

  it('không còn hậu tố viết tắt "tr", "ng", "đ" đứng một mình', () => {
    const mau = [999, 5_000, 72 * TRIEU, 1.2 * TY, -800_000]
    for (const v of mau) {
      const s = dinhDangTien(v)
      expect(s).not.toMatch(/\d ?(tr|ng|đ)$/)
    }
  })

  it('ngưỡng đổi bậc: giá trị làm tròn lên tròn bậc thì nhảy bậc trên', () => {
    expect(dinhDangTien(999_500)).toBe('1 triệu')
    expect(dinhDangTien(999_600_000)).toBe('1 tỷ')
    expect(dinhDangTien(999.6)).toBe('1 nghìn')
  })

  it('dưới ngưỡng đổi bậc thì giữ bậc dưới (phần số ≥ 100 làm tròn nguyên cho gọn)', () => {
    expect(dinhDangTien(999_400)).toBe('999 nghìn')
    expect(dinhDangTien(99_940)).toBe('99,9 nghìn')
  })

  it('số rất lớn của ván trăm năm có dấu chấm phân cách nghìn', () => {
    expect(dinhDangTien(79_004 * TY)).toBe('79.004 tỷ')
    expect(dinhDangTien(1_250 * TY)).toBe('1.250 tỷ')
  })

  it('dạng đầy đủ dùng chữ "đồng"', () => {
    expect(dinhDangDayDu(1_234_567)).toMatch(/đồng$/)
  })

  it('phần trăm dùng dấu trừ chuẩn (U+2212) như phần hiển thị tiền', () => {
    expect(dinhDangPhanTram(0.125)).toBe('+12,5%')
    expect(dinhDangPhanTram(-0.05)).toBe('−5,0%')
    expect(dinhDangPhanTram(0)).toBe('0,0%')
  })
})

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

  it('dạng đầy đủ dùng chữ "đồng"', () => {
    expect(dinhDangDayDu(1_234_567)).toMatch(/đồng$/)
  })

  it('phần trăm giữ nguyên hành vi cũ', () => {
    expect(dinhDangPhanTram(0.125)).toBe('+12,5%')
    expect(dinhDangPhanTram(-0.05)).toBe('-5,0%')
  })
})

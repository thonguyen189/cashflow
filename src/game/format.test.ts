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
    expect(dinhDangTien(999_600_000_000)).toBe('1 nghìn tỷ')
  })

  /**
   * Bậc "nghìn tỷ" thêm ở v1.8. Trước đó "tỷ" là bậc cao nhất, nên một ván tám
   * mươi năm in ra "11.090 tỷ" — vẫn đúng nhưng dài, và dấu chấm phân cách nghìn
   * đứng cạnh dấu phẩy thập phân của "12,5 tỷ" ngay trên cùng màn hình. Không
   * phải trường hợp hiếm: giá trung vị một căn nhà ở năm 79 đo được 2.792 tỷ.
   */
  it('tiền hàng nghìn tỷ có bậc riêng, không dồn hết vào "tỷ"', () => {
    expect(dinhDangTien(2_792 * TY)).toBe('2,8 nghìn tỷ')
    expect(dinhDangTien(11_090 * TY)).toBe('11,1 nghìn tỷ')
    expect(dinhDangTien(120_205 * TY)).toBe('120 nghìn tỷ')
    expect(dinhDangTien(-9_787 * TY)).toBe('−9,8 nghìn tỷ')
    // Sát dưới ngưỡng thì vẫn là "tỷ", không nhảy sớm.
    expect(dinhDangTien(999 * TY)).toBe('999 tỷ')
  })

  it('cụm chữ số của mọi mức tiền trong một ván trọn đời đều vừa ô thanh chỉ số', () => {
    // Ô thanh chỉ số rộng khoảng 47px chỗ chữ trên màn 360px. Chữ tự xuống dòng ở
    // dấu cách nên chiều dài CẢ CHUỖI không phải vấn đề; thứ tràn ra ngoài viền là
    // một cụm không có chỗ ngắt. Trước v1.8, "tỷ" là bậc cao nhất nên cuối ván in
    // "830.000 tỷ" và riêng cụm "830.000" đã rộng hơn ô. Bậc "nghìn tỷ" rút mọi
    // cụm chữ số về tối đa năm ký tự, tức khoảng 42px — vừa chỗ.
    const mucTienTrongVan = [
      900, 500_000, 350 * TRIEU, 12.5 * TY, 999 * TY, 2_792 * TY, 11_090 * TY,
      120_205 * TY, 830_000 * TY, 2_800_000 * TY,
    ]
    for (const v of mucTienTrongVan) {
      const cumDaiNhat = Math.max(...dinhDangTien(v).split(' ').map((c) => c.length))
      expect(cumDaiNhat).toBeLessThanOrEqual(5)
    }
  })

  it('dưới ngưỡng đổi bậc thì giữ bậc dưới (phần số ≥ 100 làm tròn nguyên cho gọn)', () => {
    expect(dinhDangTien(999_400)).toBe('999 nghìn')
    expect(dinhDangTien(99_940)).toBe('99,9 nghìn')
  })

  it('số rất lớn của ván trăm năm có dấu chấm phân cách nghìn', () => {
    // Hai ca cũ ("79.004 tỷ" và "1.250 tỷ") nay rơi vào bậc "nghìn tỷ" thêm ở
    // v1.8, nên chúng chuyển sang bài trên. Dấu chấm phân cách vẫn phải còn, chỉ
    // là phải leo lên tận bậc mới mới thấy — đó là toàn bộ ý nghĩa của bậc mới.
    expect(dinhDangTien(79_004 * TY)).toBe('79 nghìn tỷ')
    expect(dinhDangTien(1_250 * TY)).toBe('1,3 nghìn tỷ')
    expect(dinhDangTien(79_004_000 * TY)).toBe('79.004 nghìn tỷ')
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

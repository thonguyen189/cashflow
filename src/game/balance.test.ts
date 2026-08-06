import { describe, expect, it } from 'vitest'
import { NGHE } from './content'
import { CHIEN_LUOC_CAN_BANG, moPhongNhieuVan } from './sim'

/**
 * Kiểm tra cân bằng bằng mô phỏng. Đây là lưới an toàn khi chỉnh số
 * trong config: nếu đổi số làm game hoá bất khả thi hoặc quá dễ, test sẽ đỏ.
 */
const SO_VAN = 30

describe('cân bằng game', () => {
  for (const nghe of NGHE) {
    it(`${nghe.ten}: người chơi giỏi phải thắng được`, () => {
      const r = moPhongNhieuVan(nghe.id, SO_VAN)
      // eslint-disable-next-line no-console
      console.log(
        `${nghe.ten.padEnd(18)} thắng ${(r.tyLeThang * 100).toFixed(0)}%` +
          (r.tyLeThang > 0
            ? ` · trung bình ${r.soNamTrungBinhKhiThang.toFixed(1)} năm` +
              ` (nhanh nhất ${r.soNamNhanhNhat}, chậm nhất ${r.soNamChamNhat})`
            : ` · tài sản trung bình khi thua ${(
                r.taiSanTrungBinhKhiThua / 1e9
              ).toFixed(2)} tỷ`),
      )
      expect(r.tyLeThang).toBeGreaterThan(0)
    })
  }

  it('không thắng ngay trong vài năm đầu — phải có thử thách', () => {
    for (const nghe of NGHE) {
      const r = moPhongNhieuVan(nghe.id, SO_VAN)
      if (r.tyLeThang > 0) {
        expect(r.soNamNhanhNhat).toBeGreaterThan(5)
      }
    }
  })

  it('chơi ẩu — từ chối mọi thẻ tiêu dùng — thì thua vì hạnh phúc', () => {
    const r = moPhongNhieuVan('giaoVien', 10, {
      ...CHIEN_LUOC_CAN_BANG,
      nguongMoiDiem: 0, // không bao giờ nhận thẻ
    })
    expect(r.tyLeThang).toBe(0)
  })

  it('tiêu hoang thì về đích chậm hơn tiêu có chọn lọc', () => {
    for (const ngheId of ['giaoVien', 'bacSi']) {
      const canThan = moPhongNhieuVan(ngheId, SO_VAN)
      const hoangPhi = moPhongNhieuVan(ngheId, SO_VAN, {
        ...CHIEN_LUOC_CAN_BANG,
        nguongMoiDiem: Number.MAX_SAFE_INTEGER,
      })
      // eslint-disable-next-line no-console
      console.log(
        `${ngheId.padEnd(10)} chọn lọc ${(canThan.tyLeThang * 100).toFixed(0)}%/` +
          `${canThan.soNamTrungBinhKhiThang.toFixed(1)}n` +
          `  ·  hoang phí ${(hoangPhi.tyLeThang * 100).toFixed(0)}%/` +
          `${hoangPhi.soNamTrungBinhKhiThang.toFixed(1)}n`,
      )
      expect(hoangPhi.soNamTrungBinhKhiThang).toBeGreaterThan(
        canThan.soNamTrungBinhKhiThang,
      )
    }
  })
})

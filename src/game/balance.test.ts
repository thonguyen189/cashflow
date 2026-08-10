import { describe, expect, it } from 'vitest'
import { CONFIG } from './config'
import { NGHE, XUAT_THAN } from './content'
import { CHIEN_LUOC_CAN_BANG, moPhongNhieuVan } from './sim'

/**
 * Kiểm tra cân bằng bằng mô phỏng. Đây là lưới an toàn khi chỉnh số
 * trong config: nếu đổi số làm game hoá bất khả thi hoặc quá dễ, test sẽ đỏ.
 */
const SO_VAN = 30

/**
 * Mẫu lớn hơn dành riêng cho hai phép đo chuyên gia đồng hành. Chúng đo chênh
 * lệch giữa hai chiến lược chứ không đo một ngưỡng cứng, mà chênh lệch ở đây chỉ
 * cỡ vài phần trăm tỉ lệ thắng và vài phần mười năm — 30 ván thì một hai ván
 * lệch đã đủ đảo dấu kết quả và làm test đỏ oan.
 */
const SO_VAN_DO_CHENH = 200

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

  it('chỉ ôm vàng thì giàu mấy cũng không bao giờ tự do tài chính', () => {
    const r = moPhongNhieuVan('kySuPhanMem', SO_VAN, {
      ...CHIEN_LUOC_CAN_BANG,
      uuTienTaiSan: ['vang'],
      nhanCoHoiKinhDoanh: false,
      nhanToChucSuKien: false,
    })
    // eslint-disable-next-line no-console
    console.log(
      `ôm vàng     thắng ${(r.tyLeThang * 100).toFixed(0)}%` +
        ` · tài sản trung bình khi thua ${(r.taiSanTrungBinhKhiThua / 1e9).toFixed(1)} tỷ`,
    )
    expect(r.tyLeThang).toBe(0)
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

  it('liệu trình tâm lý cứu được ván bí bách nhưng không mua đứt điều kiện thua', () => {
    // Chỉ bật tắt riêng gói tâm lý, gói hoạch định tài chính giữ nguyên ở cả hai
    // bên — có vậy chênh lệch đo được mới là công của liệu trình chứ không phải
    // của khoản chi phí đã tối ưu.
    const macDinh = moPhongNhieuVan(
      'giaoVien',
      SO_VAN_DO_CHENH,
      CHIEN_LUOC_CAN_BANG,
    )
    const macDinhKhongTriLieu = moPhongNhieuVan('giaoVien', SO_VAN_DO_CHENH, {
      ...CHIEN_LUOC_CAN_BANG,
      thueChuyenGiaTamLy: false,
    })

    // Bot khó tính hơn với thẻ tiêu dùng: ít mua điểm hạnh phúc bằng tiền nên
    // hạnh phúc mới thật sự là ràng buộc — đúng cảnh ngộ mà liệu trình sinh ra
    // để cứu. Với bot cân bằng mặc định thì nó nhận thẻ quá rộng tay, hạnh phúc
    // hiếm khi rơi xuống ngưỡng cảnh báo, nên liệu trình gần như không đổi gì.
    const khoTinh = { ...CHIEN_LUOC_CAN_BANG, nguongMoiDiem: 800_000 }
    const coTriLieu = moPhongNhieuVan('giaoVien', SO_VAN_DO_CHENH, khoTinh)
    const khongTriLieu = moPhongNhieuVan('giaoVien', SO_VAN_DO_CHENH, {
      ...khoTinh,
      thueChuyenGiaTamLy: false,
    })

    // eslint-disable-next-line no-console
    console.log(
      `giáo viên  bot cân bằng: có trị liệu ${(macDinh.tyLeThang * 100).toFixed(1)}%` +
        ` · không ${(macDinhKhongTriLieu.tyLeThang * 100).toFixed(1)}%` +
        `  ·  bot khó tính: có trị liệu ${(coTriLieu.tyLeThang * 100).toFixed(1)}%` +
        ` · không ${(khongTriLieu.tyLeThang * 100).toFixed(1)}%`,
    )

    expect(coTriLieu.tyLeThang).toBeGreaterThan(khongTriLieu.tyLeThang)
    // Không chạm 100% ở cả hai lối chơi: hạnh phúc phải còn là rủi ro thật, nếu
    // không thì điều kiện thua duy nhất của game bị một khoản chi nhỏ mua đứt.
    expect(coTriLieu.tyLeThang).toBeLessThan(1)
    expect(macDinh.tyLeThang).toBeLessThan(1)
  })

  it('thuê chuyên gia hoạch định tài chính rút ngắn đường tới tự do tài chính', () => {
    for (const ngheId of ['giaoVien', 'bacSi', 'kySuPhanMem']) {
      const coToiUu = moPhongNhieuVan(
        ngheId,
        SO_VAN_DO_CHENH,
        CHIEN_LUOC_CAN_BANG,
      )
      const khongToiUu = moPhongNhieuVan(ngheId, SO_VAN_DO_CHENH, {
        ...CHIEN_LUOC_CAN_BANG,
        thueChuyenGiaTaiChinh: false,
      })
      // Ghép cặp từng ván rồi mới lấy chênh lệch: moPhongNhieuVan sinh seed theo
      // công thức cố định nên ketQua[i] của hai bên là cùng một ván, chỉ khác
      // mỗi quyết định thuê. Phải so kiểu này vì gói tối ưu chi phí còn kéo thêm
      // vài ván sát nút về phía thắng, mà ván sát nút thì bao giờ cũng dài —
      // lấy trung bình thô thì đám ván thắng thêm đó đội con số lên và che mất
      // tác dụng thật của việc rẻ đi 8% chi phí.
      const cap = coToiUu.ketQua
        .map((k, i) => [k, khongToiUu.ketQua[i]!] as const)
        .filter(([co, khong]) => co.thang && khong.thang)
      const chenhLech =
        cap.reduce((t, [co, khong]) => t + (co.soNam - khong.soNam), 0) /
        cap.length
      // eslint-disable-next-line no-console
      console.log(
        `${ngheId.padEnd(10)} có tối ưu chi phí ${(coToiUu.tyLeThang * 100).toFixed(1)}%/` +
          `${coToiUu.soNamTrungBinhKhiThang.toFixed(2)}n  ·  không ` +
          `${(khongToiUu.tyLeThang * 100).toFixed(1)}%/` +
          `${khongToiUu.soNamTrungBinhKhiThang.toFixed(2)}n  ·  ghép cặp ` +
          `${cap.length} ván lệch ${chenhLech.toFixed(3)} năm`,
      )
      // CHỈ chốt phép ghép cặp. Tỉ lệ thắng của bot cân bằng cố ý KHÔNG bị chốt ở
      // đây: hạnh phúc hiếm khi là ràng buộc với bot này nên chênh lệch tỉ lệ thắng
      // chỉ cỡ một hai ván trên 200 — chốt vào đó là chốt vào nhiễu. Đo thật cho
      // thấy dấu của nó còn đổi theo nghề (kỹ sư phần mềm âm trong khi hai nghề kia
      // dương), nên khẳng định ấy sẽ đỏ oan mỗi lần đụng tới bất kỳ con số nào khác
      // trong config.ts. Muốn canh tỉ lệ thắng thì canh trên bot khó tính ở ca trên,
      // nơi hiệu ứng là vài điểm phần trăm thật.
      expect(chenhLech).toBeLessThan(0)
    }
  })

  it('bốn xuất thân không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng', () => {
    const ty: number[] = []
    for (const x of XUAT_THAN) {
      const r = moPhongNhieuVan('giaoVien', 120, CHIEN_LUOC_CAN_BANG, {
        xuatThanId: x.id,
        heSoLuongKhoiDiem: 1,
      })
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(`${x.ten.padEnd(24)} thắng ${(r.tyLeThang * 100).toFixed(0)}%`)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.15)
  })

  it('năm bậc lương không chênh nhau quá 15 điểm phần trăm tỉ lệ thắng', () => {
    const ty: number[] = []
    for (const bac of CONFIG.xuatThan.bacLuong) {
      const r = moPhongNhieuVan('bacSi', 120, CHIEN_LUOC_CAN_BANG, {
        xuatThanId: 'vienChuc',
        heSoLuongKhoiDiem: bac,
      })
      ty.push(r.tyLeThang)
      // eslint-disable-next-line no-console
      console.log(`bậc lương ${bac}  thắng ${(r.tyLeThang * 100).toFixed(0)}%`)
    }
    expect(Math.max(...ty) - Math.min(...ty)).toBeLessThanOrEqual(0.15)
  })
})

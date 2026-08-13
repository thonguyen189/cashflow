import { describe, expect, it } from 'vitest'
import { CONFIG } from './config'
import { TAI_SAN } from './content'
import {
  type BuocGia,
  buocGia,
  chuyenTrangThaiThiTruong,
  giaThucTe,
  heSoMatBangSong,
  reducer,
  taoGameMoi,
  taoRng,
} from './engine'
import type { GameState, TaiSan, TrangThaiThiTruong } from './types'

/**
 * Mô hình giá đầu tư: giá dao động quanh GIÁ TRỊ THẬT.
 *
 * ---------- Bộ test này khoá lại điều gì ----------
 * Tới v1.7 giá mỗi năm được bốc ngẫu nhiên ĐỘC LẬP trong một biên độ cố định.
 * Ba hậu quả, cả ba đều đo được và không cái nào nhìn bảng số mà thấy:
 *
 *  (1) Lãi thực dài hạn chỉ là sản phẩm phụ của biên độ trừ hao hụt dao động.
 *      Cả năm kênh đều ÂM lãi thực — cổ phiếu −10,57%, tiền mã hoá −6,50% —
 *      nghĩa là đầu tư dài hạn vào bất cứ đâu cũng thua, mà không ai hay.
 *  (2) Kênh nào có `nhayChuKy` âm thì độ lệch kỳ vọng của chu kỳ kinh tế biến
 *      thành trợ lực VĨNH VIỄN. Vàng ăn +8,63% lãi thực và không có nổi một năm
 *      giảm trong suy thoái lẫn khủng hoảng: mua vàng là không thể thua.
 *  (3) Giá vừa sập không hàm ý gì về tương lai, nên MUA LÚC RẺ bị phạt — đo được
 *      lãi ba năm sau khi sập +23% so với +37% khi mua bừa.
 *
 * Mô hình v1.8 neo giá vào một giá trị thật đi lên đều đặn. Vì độ lệch bị kéo về
 * chứ không trôi được, cả ba hậu quả trên đều biến mất theo cấu trúc chứ không
 * phải nhờ chỉnh số cho vừa. Sáu bất biến dưới đây khoá lại đúng điều đó.
 *
 * ---------- Vì sao chạy thẳng mô hình giá thay vì chơi cả ván ----------
 * Bot mô phỏng chỉ sống trung bình tám năm, mà tám năm đầu luôn khởi hành từ
 * `binhThuong` nên mẫu lệch hẳn khỏi phân bố dừng — đo trên đó cho kết quả lạc
 * quan giả, và tuyệt nhiên không đủ dài để thấy một chu kỳ mười bốn năm của bất
 * động sản. Năm test đầu vì thế gọi thẳng `buocGia`, đúng cái hàm mà engine
 * dùng, nên không có chuyện công thức trong test lệch khỏi công thức thật. Test
 * cuối chơi ván thật để bắt lỗi ĐẤU NỐI: engine có thể gọi đúng hàm mà truyền
 * sai trạng thái vào.
 */

const TRANG_THAI: TrangThaiThiTruong[] = [
  'thinhVuong',
  'binhThuong',
  'suyThoai',
  'khungHoang',
]

/** Phân bố dừng của chuỗi Markov chu kỳ kinh tế, tìm bằng phép lặp luỹ thừa. */
function phanBoDung(): Record<TrangThaiThiTruong, number> {
  const P = CONFIG.thiTruong.maTranChuyen
  let pi = Object.fromEntries(TRANG_THAI.map((t) => [t, 0.25])) as Record<
    TrangThaiThiTruong,
    number
  >
  for (let i = 0; i < 5000; i++) {
    const moi = Object.fromEntries(TRANG_THAI.map((t) => [t, 0])) as Record<
      TrangThaiThiTruong,
      number
    >
    for (const tu of TRANG_THAI) {
      for (const sang of TRANG_THAI) moi[sang] += pi[tu] * P[tu][sang]
    }
    pi = moi
  }
  return pi
}

interface KetQuaChay {
  gia: number[]
  lech: number[]
  trangThai: TrangThaiThiTruong[]
  chiSoGia: number
}

/**
 * Chạy riêng mô hình giá của một tài sản qua nhiều năm, kèm chu kỳ kinh tế và
 * lạm phát thật, nhưng không dựng cả ván chơi.
 *
 * `epDoLechGia` ép độ lệch chu kỳ về một giá trị cố định thay vì lấy theo trạng
 * thái kinh tế — dùng để chứng minh mô hình miễn nhiễm với chính cái lỗi đã sinh
 * ra bộ test này.
 */
function chayGia(ts: TaiSan, seed: number, soNam: number, epDoLechGia?: number): KetQuaChay {
  const rng = taoRng(seed, 0)
  let tt: TrangThaiThiTruong = CONFIG.thiTruong.banDau
  let buoc: BuocGia = { gia: ts.giaDonVi, giaTri: ts.giaDonVi, lech: 0, lechTruoc: 0 }
  const gia = [ts.giaDonVi]
  const lech: number[] = []
  const trangThai: TrangThaiThiTruong[] = []
  let chiSoGia = 1
  for (let i = 0; i < soNam; i++) {
    const td = CONFIG.thiTruong.tacDong[tt]
    const lamPhat = rng.khoang(CONFIG.lamPhatMin, CONFIG.lamPhatMax) + td.lechLamPhat
    trangThai.push(tt)
    buoc = buocGia(ts, buoc, lamPhat, epDoLechGia ?? td.doLechGia, rng)
    gia.push(buoc.gia)
    lech.push(buoc.lech)
    chiSoGia *= 1 + lamPhat
    tt = chuyenTrangThaiThiTruong(rng, tt)
  }
  return { gia, lech, trangThai, chiSoGia }
}

/** Lãi THỰC trung bình mỗi năm, gộp theo trung bình nhân qua nhiều ván. */
function laiThucMoiNam(ts: TaiSan, soVan: number, soNam: number, epDoLechGia?: number): number {
  let tongLog = 0
  for (let v = 0; v < soVan; v++) {
    const kq = chayGia(ts, 4_242 + v * 7_919, soNam, epDoLechGia)
    tongLog += Math.log(kq.gia[kq.gia.length - 1]! / kq.gia[0]!) - Math.log(kq.chiSoGia)
  }
  return Math.exp(tongLog / (soVan * soNam)) - 1
}

const CO_CHU_KY = TAI_SAN.filter((ts) => ts.chuKyNam > 0)

/**
 * Ý ĐỒ THIẾT KẾ về lãi thực dài hạn, chép cứng ở đây CHỨ KHÔNG đọc từ
 * `content.ts`.
 *
 * Vì sao phải chép lại thay vì đọc thẳng: bài "lãi thực đúng bằng con số đặt"
 * nếu lấy kỳ vọng từ chính `ts.tangTruongThuc` thì nó tự quy chiếu — đổi hằng số
 * trong `content.ts` thì kỳ vọng đổi theo và test vẫn xanh. Phép thử đột biến bắt
 * đúng lỗ này: nâng lãi cổ phiếu từ 4% lên 9% mà cả tệp không một bài nào đỏ.
 *
 * Bảng dưới là chỗ ghi Ý ĐỊNH, còn `content.ts` là chỗ ghi CÀI ĐẶT. Đổi số ở
 * `content.ts` thì phải đổi cả ở đây, và phải viết lý do — đó chính là điểm.
 *
 * Con số của trái phiếu là hệ quả chứ không phải lựa chọn: gốc đứng yên theo giá
 * danh nghĩa nên lãi thực bằng đúng âm lạm phát trung bình. Lạm phát kỳ vọng theo
 * phân bố dừng là 6% cộng 2,09% phần đội thêm của suy thoái và khủng hoảng.
 */
const LAI_THUC_THIET_KE: Record<string, number> = {
  traiPhieu: -0.074,
  coPhieu: 0.04,
  vang: 0.008,
  crypto: 0.06,
  batDongSan: 0.015,
}

/**
 * Trần và sàn của độ lệch chuẩn dừng của `lech` — tức BIÊN ĐỘ dao động của mỗi
 * kênh quanh giá trị thật.
 *
 * `damChuKy < 1` chỉ chặn được chuyện giá phát tán vô hạn, không chặn được biên
 * độ. Phép thử đột biến chứng minh: đẩy `damChuKy` của tiền mã hoá từ 0,84 lên
 * 0,99 làm độ lệch chuẩn nhảy từ 0,67 lên 1,29 — dải giá rộng gấp mười ba lần —
 * mà lãi thực không đổi nên không bài nào lên tiếng.
 */
const BIEN_DO_LECH: Record<string, [number, number]> = {
  traiPhieu: [0, 0.05],
  coPhieu: [0.25, 0.6],
  vang: [0.18, 0.45],
  crypto: [0.4, 0.85],
  batDongSan: [0.15, 0.45],
}

describe('mô hình giá: giá dao động quanh giá trị thật', () => {
  it('giá trị thật NHÂN lạm phát chứ không CỘNG — sai phép là sai lãi thực', () => {
    // Khẳng định đại số thuần, không mô phỏng: tắt nhiễu bằng cách truyền một bản
    // sao tài sản có `nhieuGia` và `chuKyNam` bằng 0, khi ấy độ lệch luôn bằng 0
    // và `giaTri` là đại lượng tất định duy nhất còn lại.
    //
    // Vì sao cần bài riêng: chú thích trong `buocGia` hứa rằng cộng thay vì nhân
    // sẽ làm `tangTruongThuc` bị lạm phát pha loãng. Đúng, nhưng sai lệch chỉ cỡ
    // 0,44 điểm phần trăm ở kênh nặng nhất — mô phỏng trăm năm không tách nổi khỏi
    // nhiễu, còn phép so ở đây thì tách được ngay.
    const rng = taoRng(7, 0)
    const GOC = 1_000_000_000
    const lamPhat = 0.08
    for (const ts of TAI_SAN) {
      const im: TaiSan = { ...ts, nhieuGia: 0, chuKyNam: 0 }
      const b = buocGia(im, { gia: GOC, giaTri: GOC, lech: 0, lechTruoc: 0 }, lamPhat, -0.45, rng)
      const mong = GOC * (ts.theoLamPhat ? 1 + lamPhat : 1) * (1 + ts.tangTruongThuc)
      expect(b.giaTri).toBeCloseTo(mong, 3)
      // `toBeCloseTo` chứ không `toBe`: `rng.chuan() * 0` cho ra âm không, mà
      // `Object.is(-0, 0)` là sai. Âm không vô hại — `Math.exp(-0)` vẫn bằng 1.
      expect(b.lech).toBeCloseTo(0, 10)
    }
  })

  it('lãi thực dài hạn của mỗi kênh ĐÚNG BẰNG ý đồ thiết kế', () => {
    // Đây là tính chất khiến mô hình này đáng đổi sang. Ở mô hình cũ, muốn biết
    // một kênh lời hay lỗ phải mô phỏng cả trăm năm mới ra; giờ đọc thẳng
    // `tangTruongThuc` là biết. Ai chỉnh `nhieuGia` hay `damChuKy` cho kênh dữ
    // dội hơn mà thấy bài này đỏ, nghĩa là đã vô tình đụng vào lãi dài hạn.
    //
    // Dung sai 0,2 điểm phần trăm: sai số đo thật ở mẫu 60 ván × 150 năm chỉ cỡ
    // 0,01–0,07 điểm, nên còn ba lần dư địa. Dung sai 1 điểm của bản đầu quá rộng,
    // lọt cả lỗi nhân-thành-cộng.
    const lech: string[] = []
    for (const ts of TAI_SAN) {
      const do_ = laiThucMoiNam(ts, 60, 150)
      const mong = LAI_THUC_THIET_KE[ts.id]!
      // Cài đặt phải khớp ý đồ trước đã, rồi mới tới chuyện engine có trung thành.
      if (ts.theoLamPhat) expect(ts.tangTruongThuc).toBeCloseTo(mong, 6)
      if (Math.abs(do_ - mong) > 0.002) {
        lech.push(`${ts.ten}: đo ${(do_ * 100).toFixed(2)}% ≠ đặt ${(mong * 100).toFixed(2)}%`)
      }
    }
    expect(lech).toEqual([])
  })

  it('biên độ dao động của mỗi kênh nằm trong dải đã thiết kế và đúng thứ tự', () => {
    const sd: Record<string, number> = {}
    for (const ts of TAI_SAN) {
      let tongBinh = 0
      let n = 0
      for (let v = 0; v < 30; v++) {
        const l = chayGia(ts, 61_000 + v * 7_919, 250).lech
        // Bỏ hai mươi năm đầu: độ lệch khởi hành từ 0 nên chưa vào phân bố dừng.
        for (let i = 20; i < l.length; i++) {
          tongBinh += l[i]! * l[i]!
          n++
        }
      }
      sd[ts.id] = Math.sqrt(tongBinh / n)
    }
    const ngoai: string[] = []
    for (const ts of TAI_SAN) {
      const [san, tran] = BIEN_DO_LECH[ts.id]!
      if (sd[ts.id]! < san || sd[ts.id]! > tran) {
        ngoai.push(`${ts.ten}: độ lệch chuẩn ${sd[ts.id]!.toFixed(3)}, dải ${san}–${tran}`)
      }
    }
    expect(ngoai).toEqual([])
    // Thứ tự rủi ro phải giữ nguyên: đây là điều người chơi học được từ trò chơi.
    expect(sd.crypto!).toBeGreaterThan(sd.coPhieu!)
    expect(sd.coPhieu!).toBeGreaterThan(sd.vang!)
    expect(sd.vang!).toBeGreaterThan(sd.batDongSan!)
    expect(sd.batDongSan!).toBeGreaterThan(sd.traiPhieu!)
  })

  it('chu kỳ kinh tế lệch tâm KHÔNG còn biến thành trợ lực hay lực cản vĩnh viễn', () => {
    // Đây chính là lỗi đã giết vàng ở v1.7, nay khoá lại theo CẤU TRÚC. Ép độ
    // lệch chu kỳ bằng đúng con số lệch của bản cũ (−0,1361) suốt cả trăm năm:
    // ở mô hình cũ vàng (nhayChuKy âm) sẽ được trợ lực +6,8%/năm cộng dồn, còn
    // cổ phiếu chịu lực cản −16%/năm. Ở mô hình mới, cú đẩy lệch tâm chỉ dịch độ
    // lệch trung bình sang một chỗ đứng yên mới rồi thôi — lãi dài hạn không suy
    // suyển, vì độ lệch bị kéo về chứ không tích luỹ.
    const lech: string[] = []
    for (const ts of CO_CHU_KY) {
      const binhThuong = laiThucMoiNam(ts, 40, 150)
      const lechTam = laiThucMoiNam(ts, 40, 150, -0.1361)
      if (Math.abs(lechTam - binhThuong) > 0.01) {
        lech.push(
          `${ts.ten}: ${(binhThuong * 100).toFixed(2)}% → ${(lechTam * 100).toFixed(2)}%`,
        )
      }
    }
    expect(lech).toEqual([])
  })

  it('không kênh nào có trạng thái kinh tế mà giá chắc chắn tăng', () => {
    // Bất biến gốc, giữ nguyên từ bản v1.8 đầu: một kênh không có nổi năm giảm ở
    // trạng thái nào đó là kênh thắng chắc trong trạng thái ấy. Vàng ở suy thoái
    // từng là 0/168 và ở khủng hoảng 0/117.
    const dem: Record<string, Record<string, { giam: number; tong: number }>> = {}
    for (const ts of TAI_SAN) dem[ts.id] = {}
    for (const ts of TAI_SAN) {
      for (let v = 0; v < 30; v++) {
        const kq = chayGia(ts, 91_000 + v * 7_919, 200)
        for (let i = 0; i < kq.trangThai.length; i++) {
          const m = (dem[ts.id]![kq.trangThai[i]!] ??= { giam: 0, tong: 0 })
          m.tong++
          if (kq.gia[i + 1]! < kq.gia[i]!) m.giam++
        }
      }
    }
    const thangChac: string[] = []
    for (const ts of TAI_SAN) {
      for (const [tt, m] of Object.entries(dem[ts.id]!)) {
        // Ngưỡng 8%: dưới mức đó thì trên thực tế vẫn là thắng chắc, dù con số
        // không tròn 0. Nâng từ 5% lên 8% sau phép thử đột biến — ở mức 5%, đưa
        // `nhayChuKy` của vàng về lại −0,5 (đúng mức đã gây lỗi ở v1.7) chỉ cho
        // 6,4% và bẫy KHÔNG sập; bẫy chỉ sập ở khoảng −0,7, tức xa hơn mức gây
        // lỗi thật hơn hai lần. Ô mỏng nhất hiện nay là vàng trong khủng hoảng
        // 10,5%, còn 2,5 điểm dư địa — khoảng ba lần sai số của mẫu này.
        if (m.tong >= 100 && m.giam / m.tong < 0.08) {
          thangChac.push(
            `${ts.ten} @ ${tt}: ${m.giam}/${m.tong} năm giảm = ${((m.giam / m.tong) * 100).toFixed(1)}%`,
          )
        }
      }
    }
    expect(thangChac).toEqual([])
  })

  it('mua lúc rẻ phải được thưởng, không phải bị phạt', () => {
    // Cả trò chơi tồn tại để dạy điều này. Mô hình cũ dạy ngược: giá vừa sập chỉ
    // tố cáo người chơi đang kẹt trong một giai đoạn kinh tế xấu còn kéo dài, nên
    // bắt đáy lỗ hơn mua bừa ở CẢ NĂM kênh.
    const kem: string[] = []
    for (const ts of CO_CHU_KY) {
      const batDay: number[] = []
      const batKy: number[] = []
      for (let v = 0; v < 30; v++) {
        const g = chayGia(ts, 55_000 + v * 7_919, 200).gia
        for (let i = 5; i + 3 < g.length; i++) {
          const trungBinh = (g[i - 5]! + g[i - 4]! + g[i - 3]! + g[i - 2]! + g[i - 1]!) / 5
          const loi = g[i + 3]! / g[i]! - 1
          batKy.push(loi)
          if (g[i]! < 0.75 * trungBinh) batDay.push(loi)
        }
      }
      const tb = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length
      // Đòi hỏi khiêm tốn: chỉ cần bắt đáy KHÔNG thua mua bừa. Đo thực tế cách
      // ngưỡng này rất xa (cổ phiếu +231% so với +77%), nên test không mong manh.
      if (batDay.length < 50 || tb(batDay) <= tb(batKy)) {
        kem.push(
          `${ts.ten}: bắt đáy ${(tb(batDay) * 100).toFixed(0)}% so với mua bừa ${(tb(batKy) * 100).toFixed(0)}% (mẫu ${batDay.length})`,
        )
      }
    }
    expect(kem).toEqual([])
  })

  it('chu kỳ đo được đúng độ dài đã đặt và đúng thứ tự giữa các kênh', () => {
    const doDuoc: Record<string, number> = {}
    for (const ts of CO_CHU_KY) {
      const khoangCach: number[] = []
      for (let v = 0; v < 30; v++) {
        const l = chayGia(ts, 77_000 + v * 7_919, 300).lech
        // Đỉnh thật phải trội hơn cả hai năm trước và hai năm sau, nếu không thì
        // mỗi cú rung lẻ cũng bị đếm là một lần lập đỉnh.
        const dinh: number[] = []
        for (let i = 2; i < l.length - 2; i++) {
          if (l[i]! > l[i - 1]! && l[i]! > l[i - 2]! && l[i]! >= l[i + 1]! && l[i]! >= l[i + 2]!) {
            dinh.push(i)
          }
        }
        for (let i = 1; i < dinh.length; i++) khoangCach.push(dinh[i]! - dinh[i - 1]!)
      }
      doDuoc[ts.id] = khoangCach.reduce((s, x) => s + x, 0) / khoangCach.length
    }

    // Nhiễu vẫn chen thêm đỉnh phụ nên khoảng cách đo được luôn ngắn hơn con số
    // đặt; điều phải giữ là mỗi kênh nằm trong tầm của mình và THỨ TỰ không đảo.
    const sai: string[] = []
    for (const ts of CO_CHU_KY) {
      const d = doDuoc[ts.id]!
      if (d < ts.chuKyNam * 0.5 || d > ts.chuKyNam * 1.2) {
        sai.push(`${ts.ten}: đo ${d.toFixed(1)} năm, đặt ${ts.chuKyNam} năm`)
      }
    }
    expect(sai).toEqual([])
    expect(doDuoc.crypto!).toBeLessThan(doDuoc.coPhieu!)
    expect(doDuoc.coPhieu!).toBeLessThan(doDuoc.vang!)
    expect(doDuoc.vang!).toBeLessThan(doDuoc.batDongSan!)
  })

  it('mọi kênh phải có độ dai dưới 1, nếu không giá phát tán vô hạn', () => {
    // `damChuKy` từ 1 trở lên là con lắc tự bơm năng lượng: độ lệch lớn dần mãi,
    // giá chạy tới vô cực hoặc về 1 đồng và không bao giờ quay lại. Kiểm tra rẻ
    // tiền này chặn một lỗi rất đắt.
    for (const ts of TAI_SAN) {
      expect(ts.damChuKy).toBeGreaterThanOrEqual(0)
      expect(ts.damChuKy).toBeLessThan(1)
    }
  })

  it('chơi ván thật: giá vẫn chạy đúng mô hình và vẫn có năm giảm', () => {
    // Bắt lỗi ĐẤU NỐI — engine gọi đúng `buocGia` nhưng có thể truyền sai trạng
    // thái, quên cập nhật `lechGiaTruoc`, hoặc để giá trị thật đứng yên.
    const dem: Record<string, { giam: number; tong: number }> = {}
    for (const ts of TAI_SAN) dem[ts.id] = { giam: 0, tong: 0 }
    let soNamDaChoi = 0

    for (let v = 0; v < 60; v++) {
      let s: GameState = taoGameMoi('kySu', 1_000 + v * 7_919)
      let baoVe = 0
      while (s.trangThai === 'dangChoi' && baoVe++ < 4_000) {
        if (s.phase === 'tongKet') {
          for (const bd of s.tongKet?.bienDongTaiSan ?? []) {
            dem[bd.id]!.tong++
            if (bd.bienDong < 0) dem[bd.id]!.giam++
          }
          soNamDaChoi++
          s = reducer(s, { type: 'dongTongKet' })
          continue
        }
        if (s.phase === 'chiPhi') {
          s = reducer(s, { type: 'traChiPhi' })
          continue
        }
        if (s.phase === 'theBai') {
          const the = s.theConLai[0]!
          const gia = Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))
          s = reducer(s, {
            type: 'quyetDinhThe',
            nhan: s.tienMat >= gia * 2 && gia / the.diem <= 2_000_000 * s.chiSoGia,
          })
          continue
        }
        s = reducer(s, { type: 'ketThucNam' })
      }
      // Trạng thái mô hình phải luôn nhất quán: giá ≈ giá trị thật × e^(độ lệch).
      for (const ts of TAI_SAN) {
        const suyRa = s.giaTriTaiSan[ts.id] * Math.exp(s.lechGia[ts.id])
        expect(Math.abs(suyRa / s.giaTaiSan[ts.id] - 1)).toBeLessThan(0.01)
      }
    }

    expect(soNamDaChoi).toBeGreaterThan(200)
    const khongGiam: string[] = []
    for (const ts of TAI_SAN) {
      const m = dem[ts.id]!
      if (m.giam / m.tong < 0.1) khongGiam.push(`${ts.ten}: ${m.giam}/${m.tong} năm giảm`)
    }
    expect(khongGiam).toEqual([])
  })

  it('độ lệch chu kỳ kinh tế vẫn nên căn giữa quanh phân bố dừng', () => {
    // Không còn là chuyện sống chết như v1.7 — mô hình mới nuốt được cả độ lệch
    // tâm, đúng như test thứ hai chứng minh. Nhưng lệch tâm mạnh vẫn đẩy mọi kênh
    // sang đứng yên ở một mức thừa hoặc thiếu giá kéo dài, nên vẫn nên giữ.
    const pi = phanBoDung()
    const kyVong = TRANG_THAI.reduce(
      (t, tt) => t + pi[tt] * CONFIG.thiTruong.tacDong[tt].doLechGia,
      0,
    )
    expect(Math.abs(kyVong)).toBeLessThanOrEqual(0.02)
  })
})

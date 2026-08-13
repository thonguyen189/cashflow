import { describe, expect, it } from 'vitest'
import { CONFIG, TRIEU } from './config'
import { THE_TIEU_DUNG } from './content'
import {
  giaThucTe,
  heSoMatBangSong,
  khaNangChiTieu,
  reducer,
  taoGameMoi,
  tranGiaTheGoc,
} from './engine'
import type { GameState, GiaiDoanThe, TheTieuDung } from './types'

/**
 * ============================================================
 *  Bất biến của bộ thẻ tiêu dùng (viết lại ở v1.9)
 * ============================================================
 * Thẻ tiêu dùng là cơ chế HAI CHIỀU duy nhất của game: nhận thì mất tiền được điểm,
 * từ chối thì mất đúng ngần ấy điểm. Vì hạnh phúc lại là cửa thua duy nhất, mọi sai
 * sót trong bảng nội dung này đều đi thẳng ra tỉ lệ thắng chứ không dừng ở thẩm mỹ.
 * Cả file khoá hai nhóm bất biến: hình dạng của BẢNG NỘI DUNG (giá, điểm, định danh,
 * độ dày từng chặng) và hành vi của BỘ LỌC theo khả năng chi tiêu khi ván chạy thật.
 */

const SEED = 20260813

/** Sáu chặng đời. Liệt kê tay để thêm một giá trị vào `GiaiDoanThe` là phải ghé lại đây. */
const GIAI_DOAN: GiaiDoanThe[] = ['docThan', 'giaDinh', 'conCai', 'tuoiGia', 'ongBa']

/**
 * Trần giá trị của v1.9: ba triệu đồng đổi một điểm hạnh phúc. Xem khối chú thích đầu
 * mảng `THE_TIEU_DUNG` — bản trước để tấm tệ nhất ở 7,50 và đó chính là tấm biến cơ
 * chế hai chiều thành khoản phạt thu đều tay trên đầu người nghèo.
 */
const TRAN_DONG_MOI_DIEM = 3 * TRIEU

/**
 * Sàn giá trị. Ghi 166.000đ chứ không phải 170.000đ: con số "0,17 triệu" trong chú
 * thích của `THE_TIEU_DUNG` là 500.000 ÷ 3 điểm = 166.667đ đã LÀM TRÒN hai chữ số,
 * mà thẻ ấy (t01 "Cà phê cuối tuần với bạn cũ") đang là thẻ rẻ nhất bộ bài. Lấy đúng
 * 0,17 thì bài kiểm thử đỏ vì một phép làm tròn trong câu văn chứ không vì bảng giá
 * sai — mà đỏ giả thì lần sau người ta nới ngưỡng cho xanh, và cái sàn mất hết nghĩa.
 *
 * Sàn tồn tại vì thẻ quá rẻ trên mỗi điểm là một vòi hạnh phúc gần như miễn phí: nhận
 * hết mọi tấm rẻ là qua ải hạnh phúc mà chẳng phải đánh đổi gì, tức là tắt luôn cửa
 * thua duy nhất của game.
 */
const SAN_DONG_MOI_DIEM = 166_000

/**
 * Mốc điểm cao nhất bộ bài hiện tại. Không phải hằng số cân bằng trong `config.ts` mà
 * là một cái chốt: điểm càng cao thì khoản phạt TỪ CHỐI càng nặng, nên một tấm 60 điểm
 * lọt vào bảng nội dung sẽ là cú trừ hạnh phúc lớn nhất cả ván mà không ai chủ ý đặt ra.
 */
const DIEM_TOI_DA = 30

const dongMoiDiem = (t: TheTieuDung): number => t.gia / t.diem

const trieu = (v: number): string => (v / TRIEU).toFixed(2)

/** Giá THẬT phải trả cho một tấm thẻ ở đúng trạng thái ván đang xét. */
const giaThucCuaThe = (s: GameState, the: TheTieuDung): number =>
  Math.round(giaThucTe(s, the.gia) * heSoMatBangSong(s))

/**
 * Ngưỡng tiền của một năm, đo bằng ĐỒNG chứ không quy về mặt bằng giá gốc — tức là vế
 * bên phải mà `giaThucCuaThe` phải nằm dưới. Dựng lại đúng biểu thức bên trong
 * `tranGiaTheGoc` để bài kiểm thử nói bằng đơn vị người chơi cảm nhận được.
 */
function nguongTienCuaNam(s: GameState): number {
  const tt = CONFIG.theTieuDung
  return Math.max(
    tt.tranTheoKhaNangChiTieu * khaNangChiTieu(s),
    tt.sanTheoChiPhi * s.chiPhiHangNam,
  )
}

/** Chạy hết chuỗi thẻ của một năm, trả lời giống nhau cho mọi thẻ. */
function duyetHetThe(s: GameState, nhan: boolean): GameState {
  let cur = s
  let baoVe = 0
  while (cur.phase === 'theBai' && baoVe++ < 20) {
    cur = reducer(cur, { type: 'quyetDinhThe', nhan })
  }
  return cur
}

/**
 * Sống liền `soNam` năm và trả về trạng thái ĐẦU MỖI NĂM (phase 'chiPhi') — đúng
 * khoảnh khắc bộ thẻ của năm ấy vừa rút xong và người chơi sắp nhìn thấy nó.
 *
 * Mỗi năm bơm tiền mặt và ghim hạnh phúc lên 100. Hai phép ghim ấy KHÔNG nới trần giá
 * thẻ một đồng nào: `khaNangChiTieu` chỉ đọc lương, thu nhập thụ động và nghĩa vụ hàng
 * năm, tuyệt nhiên không đọc tiền mặt. Chúng chỉ giữ cho ván sống đủ lâu để quét hết
 * bốn mươi lăm năm thay vì thua vì hạnh phúc ở năm thứ ba — mọi bài dưới đây soi BỘ
 * LỌC bộ bài chứ không soi độ khó.
 *
 * `chinh` chạy ở đầu mỗi năm, dùng để ép một hoàn cảnh mà ván chơi bình thường không
 * tự đi tới (nhân vật kiệt quệ ở bài "vế sàn"). Mặc định là để nguyên.
 */
function songNhieuNam(
  s0: GameState,
  soNam: number,
  chinh: (s: GameState) => GameState = (s) => s,
): GameState[] {
  const dauNam: GameState[] = [s0]
  let cur = s0
  for (let i = 0; i < soNam; i++) {
    if (cur.trangThai !== 'dangChoi' || cur.phase !== 'chiPhi') break
    const batDau = chinh({
      ...cur,
      tienMat: Math.max(300 * TRIEU, cur.chiPhiHangNam * 20),
    })
    cur = duyetHetThe(reducer(batDau, { type: 'traChiPhi' }), false)
    cur = reducer({ ...cur, hanhPhuc: 100 }, { type: 'ketThucNam' })
    if (cur.trangThai !== 'dangChoi' || cur.phase !== 'tongKet') break
    cur = reducer(cur, { type: 'dongTongKet' })
    dauNam.push(cur)
  }
  return dauNam
}

/** Nhân vật nghèo nhất mà màn chọn nghề cho phép dựng: giáo viên, thuần nông, bậc lương thấp nhất. */
const vanNgheoNhat = (seed: number): GameState =>
  taoGameMoi('giaoVien', seed, { xuatThanId: 'thuanNong', heSoLuongKhoiDiem: 0.75 })

/* ============================================================
 *  1. Bảng giá: một điểm hạnh phúc đáng bao nhiêu tiền
 * ============================================================ */

describe('bảng giá thẻ — đồng trên mỗi điểm hạnh phúc', () => {
  it('không thẻ nào bán hạnh phúc đắt hơn ba triệu đồng một điểm', () => {
    // Không dùng `toBeLessThanOrEqual` trong vòng lặp: nó đỏ ở tấm đầu tiên phạm luật
    // rồi dừng, mà người sửa bảng nội dung cần thấy TRỌN danh sách id để sửa một lượt.
    const pham = THE_TIEU_DUNG.filter((t) => dongMoiDiem(t) > TRAN_DONG_MOI_DIEM).map(
      (t) => `${t.id} ${t.ten}: ${trieu(dongMoiDiem(t))} triệu mỗi điểm`,
    )
    expect(pham).toEqual([])
  })

  it('cũng không thẻ nào rẻ bất thường dưới sàn giá trị', () => {
    const pham = THE_TIEU_DUNG.filter((t) => dongMoiDiem(t) < SAN_DONG_MOI_DIEM).map(
      (t) => `${t.id} ${t.ten}: ${trieu(dongMoiDiem(t))} triệu mỗi điểm`,
    )
    expect(pham).toEqual([])
  })

  it('dải giá trị vẫn đủ rộng để mỗi thẻ là một quyết định thật', () => {
    // Trần và sàn chỉ có nghĩa nếu bộ bài THẬT SỰ trải kín khoảng giữa. Bộ bài dồn hết
    // vào một mức thì mọi tấm đều đáng mua như nhau và người chơi bấm nhận không cần
    // nghĩ — chính là thứ mà bài học "mua vui bằng đồ đạc là cách đắt nhất để vui"
    // dựa vào để tồn tại.
    const tyLe = THE_TIEU_DUNG.map(dongMoiDiem)
    expect(Math.max(...tyLe) / Math.min(...tyLe)).toBeGreaterThan(10)
  })
})

/* ============================================================
 *  2. Định danh: mỗi tấm thẻ là một tấm riêng
 * ============================================================ */

describe('định danh thẻ', () => {
  /** Trả về các giá trị bị dùng lại, kèm id của những thẻ dùng chung giá trị ấy. */
  function timTrung(lay: (t: TheTieuDung) => string): string[] {
    const theo = new Map<string, string[]>()
    for (const the of THE_TIEU_DUNG) {
      const khoa = lay(the)
      theo.set(khoa, [...(theo.get(khoa) ?? []), the.id])
    }
    return [...theo.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([khoa, ids]) => `${khoa} ← ${ids.join(', ')}`)
  }

  it('mọi thẻ có id riêng', () => {
    // Trùng id là lỗi nặng nhất trong ba lỗi ở đây, vì `theNamTruoc` lọc theo id: hai
    // thẻ chung id thì rút được tấm này sẽ âm thầm khoá luôn tấm kia của năm sau.
    expect(timTrung((t) => t.id)).toEqual([])
  })

  it('mọi thẻ có tên riêng', () => {
    expect(timTrung((t) => t.ten)).toEqual([])
  })

  it('mọi thẻ có biểu tượng riêng', () => {
    // Trùng biểu tượng là lỗi GIAO DIỆN thật chứ không phải chuyện sạch sẽ của dữ liệu:
    // trong pha thẻ bài người chơi nhìn hình trước khi đọc chữ, nên hai thẻ khác nhau
    // hiện cùng một hình sẽ bị hiểu là game đang phát lại đúng tấm vừa xong.
    expect(timTrung((t) => t.emoji)).toEqual([])
  })
})

/* ============================================================
 *  3. Điểm hạnh phúc: khoản phạt từ chối nằm trong tầm kiểm soát
 * ============================================================ */

describe('điểm hạnh phúc của thẻ', () => {
  it('điểm luôn là số nguyên từ hai trở lên', () => {
    // Số lẻ thì `themHanhPhuc` cộng ra hạnh phúc lẻ và cả HUD lẫn bảng tổng kết phải
    // làm tròn mỗi nơi một kiểu. Dưới hai điểm thì cả hai vế của quyết định đều nhạt
    // tới mức bấm gì cũng như nhau, tấm thẻ ấy chỉ tổ kéo dài pha thẻ bài.
    const pham = THE_TIEU_DUNG.filter(
      (t) => !Number.isInteger(t.diem) || t.diem < 2,
    ).map((t) => `${t.id}: ${t.diem} điểm`)
    expect(pham).toEqual([])
  })

  it('không thẻ nào vượt mốc điểm cao nhất của bộ bài hiện tại', () => {
    // Điểm là con dao hai lưỡi: nó cũng CHÍNH LÀ khoản phạt khi từ chối. Một tấm điểm
    // quá cao mà người chơi không đủ tiền nhận sẽ là cú trừ hạnh phúc nặng nhất cả ván,
    // giáng xuống đúng người ít có khả năng nhận nhất.
    const pham = THE_TIEU_DUNG.filter((t) => t.diem > DIEM_TOI_DA).map(
      (t) => `${t.id}: ${t.diem} điểm`,
    )
    expect(pham).toEqual([])
  })
})

/* ============================================================
 *  4. Độ dày bộ bài từng chặng
 * ============================================================ */

describe('độ dày bộ bài', () => {
  /**
   * Bộ bài mỏng CỘNG bộ lọc theo khả năng chi tiêu là một tổ hợp tệ hơn hẳn từng cái
   * riêng lẻ: bộ lọc cắt phần đắt của bộ bài, nên người nghèo chỉ còn phần đuôi rẻ,
   * mà phần đuôi ấy mỏng thì năm nào họ cũng gặp lại đúng mấy tấm cũ. Trớ trêu là
   * người chơi gặp cảnh lặp bài chán nhất lại đúng là người mà v1.9 sinh ra để cứu.
   */
  it('mỗi chặng đời có ít nhất mười thẻ', () => {
    const mong = GIAI_DOAN.map((g) => ({
      g,
      so: THE_TIEU_DUNG.filter((t) => t.giaiDoan === g).length,
    }))
      .filter((x) => x.so < 10)
      .map((x) => `${x.g}: ${x.so} thẻ`)
    expect(mong).toEqual([])
  })

  it('nhóm thẻ mọi lúc có ít nhất bốn mươi thẻ', () => {
    // Nhóm không ghi `giaiDoan` là nhóm DUY NHẤT có mặt ở mọi năm của ván, từ tuổi 21
    // tới tuổi 100, nên nó phải dày hơn hẳn năm chặng kia chứ không chỉ bằng.
    const moiLuc = THE_TIEU_DUNG.filter((t) => t.giaiDoan === undefined)
    expect(moiLuc.length).toBeGreaterThanOrEqual(40)
  })

  it('mọi thẻ đều thuộc một chặng đã khai báo hoặc thuộc nhóm mọi lúc', () => {
    // Sai chính tả trong `giaiDoan` không làm TypeScript kêu ở mọi lối viết, mà hậu quả
    // thì im lặng tuyệt đối: `rutThe` rơi xuống `return true` và tấm thẻ ấy hiện ở mọi
    // năm — thẻ "trông cháu giúp con" mời một người hai mươi mốt tuổi.
    const lac = THE_TIEU_DUNG.filter(
      (t) => t.giaiDoan !== undefined && !GIAI_DOAN.includes(t.giaiDoan),
    ).map((t) => `${t.id}: ${t.giaiDoan}`)
    expect(lac).toEqual([])
  })
})

/* ============================================================
 *  5. Trần giá thẻ quy về mặt bằng giá gốc
 * ============================================================ */

describe('trần giá thẻ — quy về mặt bằng giá gốc', () => {
  it('miễn nhiễm với lạm phát: chi phí và khả năng cùng nhân đôi thì trần không đổi', () => {
    // Đây là lý do `tranGiaTheGoc` được viết ra chứ không so thẳng bằng tiền: cả hai vế
    // của phép so đều tỉ lệ thuận với chỉ số giá, nên chỉ số giá triệt tiêu và bộ lọc
    // không cần biết gì về lạm phát. Nhờ vậy `CONFIG.theTieuDung` là hai con số cài một
    // lần cho cả trăm năm, không phải bảng số phải chỉnh lại theo từng mốc thời gian.
    const khaNang = 30 * TRIEU
    const chiPhi = 102 * TRIEU
    expect(tranGiaTheGoc(khaNang * 2, chiPhi * 2)).toBe(tranGiaTheGoc(khaNang, chiPhi))
    // Kiểm luôn ở nhánh SÀN, vì hai vế của `Math.max` phải cùng thuần nhất thì tính
    // chất trên mới đúng ở mọi mức khả năng chi tiêu chứ không riêng nhánh trần.
    const tungThieu = -20 * TRIEU
    expect(tranGiaTheGoc(tungThieu * 2, chiPhi * 2)).toBe(
      tranGiaTheGoc(tungThieu, chiPhi),
    )
  })

  it('khả năng chi tiêu âm vẫn cho ra trần dương — vế sàn là lan can', () => {
    // Số âm nhân bốn vẫn âm. Nếu chỉ có vế trần thì trần hoá âm, không thẻ nào lọt, và
    // bộ bài RỖNG đúng vào năm bi đát nhất của ván.
    const tran = tranGiaTheGoc(-200 * TRIEU, 102 * TRIEU)
    expect(tran).toBeGreaterThan(0)
    // Và lan can phải đủ cao để còn thẻ thật lọt qua, chứ không phải dương suông.
    expect(THE_TIEU_DUNG.filter((t) => t.gia <= tran).length).toBeGreaterThan(10)
  })

  it('ván của người kiệt quệ vẫn rút ra thẻ suốt ba mươi năm liền', () => {
    // BẤT BIẾN QUAN TRỌNG NHẤT CỦA CẢ FILE. Bộ bài rỗng không chỉ là màn hình trống:
    // thẻ tiêu dùng là đường hồi phục hạnh phúc chủ động duy nhất mà người nghèo với
    // tới được (ước nguyện thì đắt, trị liệu thì phải trả tiền), nên rỗng bộ bài là
    // cắt luôn đường sống của đúng người đang cần nó — hỏng theo chiều ngược lại với
    // chính lỗi mà bộ lọc v1.9 sinh ra để chữa.
    const kietQue = (s: GameState): GameState => ({ ...s, luong: 1 * TRIEU })
    const s0 = kietQue(taoGameMoi('giaoVien', SEED))
    expect(khaNangChiTieu(s0)).toBeLessThan(0)

    const cacNam = songNhieuNam(s0, 30, kietQue)
    expect(cacNam.length).toBe(31)
    for (const s of cacNam) {
      expect(khaNangChiTieu(s)).toBeLessThan(0)
      expect(s.theConLai.length).toBeGreaterThanOrEqual(CONFIG.soTheMoiNamMin)
    }
  })
})

/* ============================================================
 *  6. Bộ lọc theo khả năng chi tiêu, đo trên ván chạy thật
 * ============================================================ */

describe('bộ lọc theo khả năng chi tiêu thật sự cắn', () => {
  const CAC_SEED = [1, 2, 3, 4, 5, 6, 7, 8]
  const SO_NAM = 45

  it('người nghèo không bao giờ được mời thẻ vượt trần của CHÍNH năm đang nhìn', () => {
    // Mốc thời gian là năm ĐANG NHÌN THẤY bộ thẻ, và mốc ấy đúng vì bước 14 của
    // `chuyenNam` dựng trọn `trangThaiNamMoi` TRƯỚC khi rút bài, nên trần được tính
    // trên đúng túi tiền của năm sắp sống.
    //
    // ---------- Vì sao mốc này từng sai, và vì sao nay không được nới ----------
    // Bản đầu của v1.9 rút bài bằng số liệu năm vừa khép lại. Sai số ấy chỉ lộ ra ở
    // những năm có cột mốc đời rơi vào giữa hai thời điểm — cưới đội chi phí thêm
    // 20%, sinh con thêm 25% mỗi cháu, nghỉ hưu cắt lương còn 45%. Đo trên 1628 lượt
    // thẻ của tám ván nghèo nhất khi ấy: 12 lượt vượt ngưỡng, rơi vào 7 năm trên tổng
    // 360, và KHÔNG lượt nào nằm ngoài năm có cột mốc mới. Ca tệ nhất là một tấm thẻ
    // 189,1 triệu mời vào năm cưới, trong khi ngưỡng năm ấy chỉ 12,1 triệu.
    //
    // Nói cách khác, chỗ hở cũ nằm đúng vào những năm ĐÁNG NHỚ NHẤT của một ván chơi.
    // Nếu bài này đỏ trở lại, đừng thêm phép loại trừ năm cột mốc: đó chính là cái
    // triệu chứng, và chỗ phải sửa là thứ tự dựng trạng thái trong `chuyenNam`.
    const pham: string[] = []
    let daSoi = 0
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanNgheoNhat(seed), SO_NAM)) {
        const tran = tranGiaTheGoc(khaNangChiTieu(s), s.chiPhiHangNam)
        for (const the of s.theConLai) {
          daSoi++
          if (the.gia > tran) {
            pham.push(
              `seed ${seed} năm ${s.nam} thẻ ${the.id}:` +
                ` giá gốc ${trieu(the.gia)} triệu vượt trần ${trieu(tran)} triệu`,
            )
          }
        }
      }
    }
    expect(pham).toEqual([])
    // Chốt luôn cỡ mẫu: một ngày nào đó `songNhieuNam` gãy sớm vì luật chơi đổi thì
    // bài kiểm thử này sẽ xanh vì không soi tấm nào, và không ai biết.
    expect(daSoi).toBeGreaterThan(1000)
  })

  it('giá thực tế của mọi thẻ luôn nằm trong ngưỡng tiền của chính năm đó, KỂ CẢ năm cột mốc', () => {
    // Vế còn lại của cùng một bất biến, lần này nói bằng ĐỒNG chứ không bằng mặt bằng
    // giá gốc — tức đúng con số người chơi nhìn thấy trên tấm thẻ.
    //
    // CỐ Ý không trừ ra năm nào cả. Chính những năm có cột mốc đời mới là chỗ bản đầu
    // của v1.9 hở, nên loại chúng ra là loại đúng phần duy nhất đáng kiểm.
    const pham: string[] = []
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanNgheoNhat(seed), SO_NAM)) {
        const nguong = nguongTienCuaNam(s)
        for (const the of s.theConLai) {
          const giaThuc = giaThucCuaThe(s, the)
          if (giaThuc > nguong) {
            pham.push(
              `seed ${seed} năm ${s.nam} thẻ ${the.id}:` +
                ` ${trieu(giaThuc)} triệu vượt ngưỡng ${trieu(nguong)} triệu`,
            )
          }
        }
      }
    }
    expect(pham).toEqual([])
  })

  it('bộ lọc cắt thật chứ không phải bộ lọc trang trí', () => {
    // Hai bài trên đều xanh một cách TẦM THƯỜNG nếu trần cao hơn tấm đắt nhất bộ bài —
    // một bộ lọc không bao giờ cắt gì thì không bao giờ vi phạm gì. Bài này chốt vế còn
    // lại: với nhân vật nghèo nhất, trần năm đầu thật sự nằm giữa bộ bài.
    //
    // Đo ở bộ số hiện tại: trần năm đầu 21,77 triệu (giá gốc), cắt 25 trên 122 thẻ, tấm
    // đắt nhất bộ bài là 80 triệu. Ngưỡng dưới đây để ở 15 thẻ chứ không phải sát 25:
    // nó canh cái CHẾ ĐỘ hỏng (bộ lọc thôi cắn) chứ không canh từng bước hiệu chỉnh cân
    // bằng, mà `tranTheoKhaNangChiTieu` thì đúng là một cần gạt được phép chỉnh.
    const s = vanNgheoNhat(SEED)
    const tran = tranGiaTheGoc(khaNangChiTieu(s), s.chiPhiHangNam)
    const datNhat = Math.max(...THE_TIEU_DUNG.map((t) => t.gia))
    expect(tran).toBeLessThan(datNhat)
    expect(THE_TIEU_DUNG.filter((t) => t.gia > tran).length).toBeGreaterThanOrEqual(15)
  })
})

/* ============================================================
 *  7. Hai chặng đời mới của v1.9
 * ============================================================ */

describe('chặng độc thân, gia đình và ông bà', () => {
  const CAC_SEED = [11, 22, 33, 44]
  /** Đủ dài để đi qua cưới hỏi, sinh con, nghỉ hưu và tới lúc con tròn tuổi sinh cháu. */
  const SO_NAM = 60

  /** Nhân vật dư dả để trần giá không che mất chặng nào khỏi phép quét. */
  const vanDuDa = (seed: number): GameState =>
    taoGameMoi('bacSi', seed, { xuatThanId: 'khaGia', heSoLuongKhoiDiem: 1.25 })

  it('thẻ độc thân chỉ ra khi chưa kết hôn, thẻ gia đình chỉ ra khi đã kết hôn', () => {
    const pham: string[] = []
    let daThayDocThan = 0
    let daThayGiaDinh = 0
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanDuDa(seed), SO_NAM)) {
        for (const the of s.theConLai) {
          if (the.giaiDoan === 'docThan') {
            daThayDocThan++
            if (s.daKetHon) pham.push(`seed ${seed} năm ${s.nam}: ${the.id} khi đã cưới`)
          }
          if (the.giaiDoan === 'giaDinh') {
            daThayGiaDinh++
            if (!s.daKetHon) pham.push(`seed ${seed} năm ${s.nam}: ${the.id} khi chưa cưới`)
          }
        }
      }
    }
    expect(pham).toEqual([])
    // Không có hai dòng này thì bài kiểm thử vẫn xanh khi ai đó xoá sạch hai chặng khỏi
    // bảng nội dung — xanh vì chẳng còn gì để vi phạm.
    expect(daThayDocThan).toBeGreaterThan(0)
    expect(daThayGiaDinh).toBeGreaterThan(0)
  })

  it('hai chặng ấy không bao giờ cùng có mặt trong một tay bài', () => {
    // Hệ quả trực tiếp của bài trên, nhưng đáng khoá riêng vì nó là thứ NGƯỜI CHƠI nhìn
    // thấy: một tay bài vừa mời "nhậu lẩu với hội bạn thân" vừa mời "kỷ niệm ngày cưới"
    // là game tự mâu thuẫn ngay trên cùng một màn hình, dù mỗi tấm xét riêng đều hợp lệ.
    const pham: string[] = []
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanDuDa(seed), SO_NAM)) {
        const coDocThan = s.theConLai.some((t) => t.giaiDoan === 'docThan')
        const coGiaDinh = s.theConLai.some((t) => t.giaiDoan === 'giaDinh')
        if (coDocThan && coGiaDinh) {
          pham.push(`seed ${seed} năm ${s.nam}: ${s.theConLai.map((t) => t.id).join(', ')}`)
        }
      }
    }
    expect(pham).toEqual([])
  })

  it('thẻ ông bà chỉ ra khi đã có một người con tròn tuổi sinh cháu', () => {
    // Điều kiện phải trùng KHÍT với điều kiện sinh ra sự kiện `lenChucOngBa` trong
    // `chuyenNam`. Lệch một năm thôi là game mời thẻ "lì xì cháu ngày mùng một Tết"
    // trước khi kể rằng bạn đã lên chức — hai giọng nói về cùng một cột mốc mà không
    // khớp nhau.
    const pham: string[] = []
    let daThay = 0
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanDuDa(seed), SO_NAM)) {
        const daCoChau = s.conCai.some(
          (namSinh) => s.nam - namSinh >= CONFIG.cotTruyen.conTuoiSinhChau,
        )
        for (const the of s.theConLai) {
          if (the.giaiDoan !== 'ongBa') continue
          daThay++
          if (!daCoChau) pham.push(`seed ${seed} năm ${s.nam}: ${the.id} khi chưa có cháu`)
        }
      }
    }
    expect(pham).toEqual([])
    expect(daThay).toBeGreaterThan(0)
  })

  it('chặng ông bà chồng lên chặng gia đình và tuổi già chứ không thay thế', () => {
    // Đời thật thì một người bảy mươi tuổi có cháu vẫn là vợ chồng với nhau và vẫn đang
    // già đi; ba chặng ấy là ba mặt của cùng một quãng đời. Nếu `rutThe` từng bị sửa
    // thành chuỗi if/else loại trừ lẫn nhau thì hai chặng kia sẽ lặng lẽ biến mất khỏi
    // ba mươi năm cuối ván, mà không có bài kiểm thử nào đỏ.
    const daGap = new Set<GiaiDoanThe>()
    for (const seed of CAC_SEED) {
      for (const s of songNhieuNam(vanDuDa(seed), SO_NAM)) {
        const daCoChau = s.conCai.some(
          (namSinh) => s.nam - namSinh >= CONFIG.cotTruyen.conTuoiSinhChau,
        )
        if (!daCoChau) continue
        for (const the of s.theConLai) {
          if (the.giaiDoan !== undefined) daGap.add(the.giaiDoan)
        }
      }
    }
    expect([...daGap].sort()).toEqual(['giaDinh', 'ongBa', 'tuoiGia'])
  })
})

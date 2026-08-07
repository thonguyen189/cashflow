/**
 * Kịch bản chơi thử — chạy: npx vite-node scripts/trai-nghiem-demo.ts <ngheId> <seed> <persona> <soNam>
 * persona: canThan | lieuLinh | hoangPhi
 * soNam: số năm chơi (mặc định 10); ghi 'het' để chơi tới khi ván kết thúc
 *        (thắng, thua, hoặc viên mãn ở tuổi 100).
 * In ra đúng những gì người chơi nhìn thấy (dùng cùng hàm định dạng với giao diện).
 */
import { CONFIG } from '../src/game/config'
import { NGHE, TAI_SAN, timCoHoi, timNghe, timUocNguyen } from '../src/game/content'
import {
  dangCoBaoHiem,
  giaThucTe,
  giaTriDauTu,
  khoaHocConLai,
  muaToiDa,
  phiBaoHiem,
  reducer,
  taoGameMoi,
  thuNhapThuDong,
  tongTaiSan,
  tuoiHienTai,
} from '../src/game/engine'
import { dinhDangPhanTram, dinhDangTien } from '../src/game/format'
import type { AssetId, GameState, TongKetNam } from '../src/game/types'

const [ngheId = 'giaoVien', seedRaw = '20260806', persona = 'canThan', soNamRaw = '10'] =
  process.argv.slice(2)
const seed = Number(seedRaw)
/** Số năm tối đa sẽ chơi; 'het' = không giới hạn, đi tới khi ván tự kết thúc. */
const soNamChoi =
  soNamRaw === 'het' ? Number.POSITIVE_INFINITY : Math.max(1, Number(soNamRaw) || 10)

const P = {
  canThan: { nguongMoiDiem: 1_200_000, duPhong: 0.6, canhBac: false, phanBo: [['coPhieu', 0.6], ['vang', 0.25], ['traiPhieu', 1]] as [AssetId, number][] },
  lieuLinh: { nguongMoiDiem: 1_000_000, duPhong: 0.35, canhBac: true, phanBo: [['crypto', 0.5], ['coPhieu', 0.35], ['traiPhieu', 1]] as [AssetId, number][] },
  hoangPhi: { nguongMoiDiem: 99_000_000_000, duPhong: 0.6, canhBac: false, phanBo: [['traiPhieu', 1]] as [AssetId, number][] },
}[persona]!

const nghe = timNghe(ngheId)!
console.log('════════ MÀN CHỌN NGHỀ ════════')
for (const n of NGHE)
  console.log(
    `${n.emoji} ${n.ten}: lương ${dinhDangTien(n.luong)}, chi phí ${dinhDangTien(n.chiPhi)} — ${n.moTa}`,
  )
console.log(`\n>> Tôi chọn: ${nghe.emoji} ${nghe.ten} (persona ${persona}, seed ${seed})`)

let s = taoGameMoi(ngheId, seed)

console.log('\n════════ TAB ĐẦU TƯ NGAY NĂM 1 (yêu cầu 4) ════════')
for (const ts of TAI_SAN) {
  const lichSu = s.lichSuGia[ts.id]!
  const thayDoi = lichSu[0]! > 0 ? s.giaTaiSan[ts.id] / lichSu[0]! - 1 : 0
  console.log(
    `${ts.emoji} ${ts.ten}: ${dinhDangTien(s.giaTaiSan[ts.id])}/${ts.donViTen} ` +
      `${dinhDangPhanTram(thayDoi)} — biểu đồ ${lichSu.length} điểm ` +
      `[${lichSu.map((g) => dinhDangTien(g)).join(' → ')}]`,
  )
}

function hud(s: GameState) {
  return `[HUD] 📊 ${dinhDangTien(giaTriDauTu(s))} · 💵 ${dinhDangTien(s.tienMat)} · 😊 ${s.hanhPhuc}`
}

/** In một màn tổng kết năm — dùng chung cho các năm giữa và tổng kết cuối. */
function inTongKet(tk: TongKetNam) {
  console.log(
    `Tổng tài sản: ${dinhDangTien(tk.tongTaiSan)} (${((tk.tongTaiSan / CONFIG.mucTieuTaiSan) * 100).toFixed(1)}% mục tiêu)`,
  )
  console.log(`Lương năm tới: ${dinhDangTien(tk.luong)} (${dinhDangPhanTram(tk.tangLuong)})`)
  if (tk.thuNhapThuDong > 0)
    console.log(`Thu nhập thụ động: ${dinhDangTien(tk.thuNhapThuDong)}`)
  if (tk.thuNhapBanDoi > 0)
    console.log(`Thu nhập của bạn đời: ${dinhDangTien(tk.thuNhapBanDoi)}`)
  for (const l of tk.loiTucTaiSan)
    console.log(
      `  ${l.ten}: ${dinhDangPhanTram(l.bienDong)}${l.loiTuc > 0 ? ` · lợi tức +${dinhDangTien(l.loiTuc)}` : ''}`,
    )
  if (tk.phatKhatVong > 0) console.log(`Chưa đạt khát vọng: −${tk.phatKhatVong} hạnh phúc`)
  if (tk.hanhPhucTuUocNguyen > 0)
    console.log(`Từ các món ước nguyện: +${tk.hanhPhucTuUocNguyen} hạnh phúc`)
  for (const sk of tk.suKien)
    console.log(
      `  ▸ ${sk.tieuDe}${sk.tienThayDoi !== 0 ? ` (${dinhDangTien(sk.tienThayDoi)})` : ''}${sk.hanhPhucThayDoi !== 0 ? ` (${sk.hanhPhucThayDoi > 0 ? '+' : ''}${sk.hanhPhucThayDoi} hạnh phúc)` : ''} — ${sk.moTa}`,
    )
}

while (s.lichSu.length < soNamChoi) {
  if (s.phase === 'tongKet' && s.tongKet) {
    console.log(`\n──── 📋 TỔNG KẾT NĂM ${s.tongKet.nam} ────`)
    inTongKet(s.tongKet)
    s = reducer(s, { type: 'dongTongKet' })
    continue
  }
  // Chế độ 'het': thắng rồi vẫn chọn sống trọn hành trình tới tuổi 100
  if (s.trangThai === 'thang' && soNamChoi === Number.POSITIVE_INFINITY) {
    console.log('\n🌅 ĐÃ ĐẠT MỤC TIÊU — chọn "Chơi tiếp, sống trọn hành trình tới tuổi 100"')
    s = reducer(s, { type: 'choiTiepSauThang' })
    continue
  }
  if (s.trangThai !== 'dangChoi') break

  if (s.phase === 'chiPhi') {
    console.log(`\n════════ NĂM ${s.nam} ════════  ${hud(s)}`)
    console.log(`🧾 Chi phí sinh hoạt năm nay: ${dinhDangTien(s.chiPhiHangNam)} → thanh toán`)
    s = reducer(s, { type: 'traChiPhi' })
    continue
  }

  if (s.phase === 'theBai') {
    const the = s.theConLai[0]!
    const gia = giaThucTe(s, the.gia)
    const moiDiem = gia / the.diem
    const nhan =
      s.hanhPhuc < 62
        ? s.tienMat >= gia
        : moiDiem <= P.nguongMoiDiem * s.chiSoGia && s.tienMat >= gia
    console.log(
      `${the.emoji} "${the.ten}" — ${dinhDangTien(gia)} — nhận +${the.diem} / từ chối −${the.diem} → ${nhan ? 'NHẬN' : 'từ chối'}`,
    )
    s = reducer(s, { type: 'quyetDinhThe', nhan })
    continue
  }

  // ---- giai đoạn tự do ----
  if (!dangCoBaoHiem(s) && persona !== 'lieuLinh') {
    const phi = phiBaoHiem(s)
    if (s.tienMat > phi * 3) {
      console.log(`🛡️ Mua bảo hiểm y tế: ${dinhDangTien(phi)}`)
      s = reducer(s, { type: 'muaBaoHiem' })
      continue
    }
  }

  if (!s.uocNguyenDaMua.includes(s.khatVongId)) {
    const un = timUocNguyen(s.khatVongId)!
    // v1.2: giá ước nguyện khoá tại đầu ván, không leo theo lạm phát
    const gia = un.gia
    if (s.tienMat > gia * 1.3) {
      console.log(`⭐ Mua khát vọng ${un.emoji} ${un.ten}: ${dinhDangTien(gia)} (giá giữ nguyên như thời trẻ)`)
      s = reducer(s, { type: 'muaUocNguyen', uocNguyenId: un.id })
      continue
    }
  }

  // v1.2: đã nghỉ hưu thì engine chặn mua khoá học — bỏ qua để không lặp vô hạn
  const kh = s.daNghiHuu
    ? undefined
    : [...khoaHocConLai(s)].reverse().find((k) => s.tienMat > giaThucTe(s, k.gia) * 2.5)
  if (kh) {
    const luongCu = s.luong
    console.log(`🎓 Học "${kh.ten}": ${dinhDangTien(giaThucTe(s, kh.gia))}`)
    s = reducer(s, { type: 'muaKhoaHoc', khoaHocId: kh.id })
    console.log(`   → lương ${dinhDangTien(luongCu)} thành ${dinhDangTien(s.luong)}`)
    continue
  }

  const coHoi = s.coHoiNamNay[0]
  if (coHoi) {
    const gia = giaThucTe(s, coHoi.gia)
    const laKD = coHoi.loai === 'kinhDoanh'
    const nhan = (laKD ? s.tienMat > gia * 1.5 : P.canhBac && s.tienMat > gia * 2)
    console.log(
      `${coHoi.emoji} Cơ hội "${coHoi.ten}" — vốn ${dinhDangTien(gia)}${laKD ? `, thu nhập ${dinhDangTien(giaThucTe(s, coHoi.thuNhapMoiNam ?? 0))}/năm` : `, thắng ${Math.round((coHoi.xacSuatThang ?? 0) * 100)}% ×${coHoi.heSoNhan}`} → ${nhan ? 'THAM GIA' : 'bỏ qua'}`,
    )
    s = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan })
    continue
  }

  // Phân bổ đầu tư một lượt duy nhất: mỗi tài sản mua tối đa một lần mỗi năm,
  // xong là kết thúc năm — không quay lại nhặt nhạnh 1-3 đơn vị lặt vặt.
  const duPhong = s.chiPhiHangNam * P.duPhong
  let coTheDung = s.tienMat - duPhong
  for (const [id, tyLe] of P.phanBo) {
    if (coTheDung <= 0) break
    const ngan = Math.min(coTheDung * tyLe, s.tienMat)
    const soDonVi = Math.min(Math.floor(ngan / s.giaTaiSan[id]), muaToiDa(s, id))
    if (soDonVi > 0) {
      const ts = TAI_SAN.find((t) => t.id === id)!
      console.log(
        `📊 Mua ${soDonVi.toLocaleString('vi-VN')} ${ts.donViTen} ${ts.ten}: ${dinhDangTien(soDonVi * s.giaTaiSan[id])}`,
      )
      s = reducer(s, { type: 'dauTu', assetId: id, soDonVi })
      coTheDung -= soDonVi * s.giaTaiSan[id]
    }
  }

  console.log(`⏭ Kết thúc năm ${s.nam}.  ${hud(s)}`)
  s = reducer(s, { type: 'ketThucNam' })
}

if (s.phase === 'tongKet' && s.tongKet) {
  console.log(`\n──── 📋 TỔNG KẾT NĂM ${s.tongKet.nam} (năm thứ ${s.lichSu.length}) ────`)
  inTongKet(s.tongKet)
}

console.log(`\n════════ SAU ${s.lichSu.length} NĂM ════════`)
console.log(hud(s))
console.log(`Trạng thái: ${s.trangThai}${s.lyDoKetThuc ? ` — ${s.lyDoKetThuc}` : ''}`)
console.log(
  `Gia đình: ${s.daKetHon ? `kết hôn năm ${s.cotTruyen.namCuoi}` : 'độc thân'}` +
    ` · ${
      s.conCai.length > 0
        ? `${s.conCai.length} con (sinh năm ${s.conCai.join(', ')})`
        : 'chưa có con'
    }` +
    ` · ${s.daNghiHuu ? 'đã nghỉ hưu' : 'chưa nghỉ hưu'}` +
    ` · hiện ${Math.min(tuoiHienTai(s), CONFIG.cotTruyen.tuoiVienMan)} tuổi`,
)
console.log(`Lương: ${dinhDangTien(s.luong)} · Chi phí: ${dinhDangTien(s.chiPhiHangNam)}`)
console.log(`Thu nhập thụ động: ${dinhDangTien(thuNhapThuDong(s))}`)
console.log(
  `Doanh nghiệp: ${
    Object.entries(
      s.doanhNghiep.reduce<Record<string, number>>((acc, d) => {
        acc[d.coHoiId] = (acc[d.coHoiId] ?? 0) + 1
        return acc
      }, {}),
    )
      .map(([id, soLuong]) => {
        const c = timCoHoi(id)
        return `${c?.emoji ?? ''} ${c?.ten ?? id}${soLuong > 1 ? ` ×${soLuong}` : ''}`
      })
      .join(', ') || 'chưa có'
  }`,
)
console.log(`Đã học: ${s.khoaHocDaMua.join(', ') || 'chưa'} · Ước nguyện: ${s.uocNguyenDaMua.join(', ') || 'chưa'}`)
for (const ts of TAI_SAN)
  if (s.soHuu[ts.id] > 0)
    console.log(
      `  ${ts.emoji} ${ts.ten}: ${s.soHuu[ts.id].toLocaleString('vi-VN')} ${ts.donViTen} = ${dinhDangTien(s.soHuu[ts.id] * s.giaTaiSan[ts.id])}`,
    )
console.log(
  `Tổng tài sản: ${dinhDangTien(tongTaiSan(s))} / mục tiêu ${dinhDangTien(CONFIG.mucTieuTaiSan)} (${((tongTaiSan(s) / CONFIG.mucTieuTaiSan) * 100).toFixed(1)}%)`,
)
console.log(`Hạnh phúc: ${s.hanhPhuc} (ngưỡng thua ${CONFIG.hanhPhucNguongThua})`)

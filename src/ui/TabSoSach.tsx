import { CONFIG } from '../game/config'
import { TAI_SAN } from '../game/content'
import {
  bienDoThuNhapThuDong,
  giaTriDauTu,
  phiBaoHiem,
  thuNhapThuDong,
  tongTaiSan,
  traNoMoiNam,
  tuoiHienTai,
  xeDangCo,
} from '../game/engine'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { GameState, LoaiBaoHiemXe } from '../game/types'

/** Ba loại bảo hiểm xe, kèm tên đầy đủ để hiển thị — không viết tắt. */
const BAO_HIEM_XE: { loai: LoaiBaoHiemXe; ten: string }[] = [
  { loai: 'trachNhiemDanSu', ten: 'trách nhiệm dân sự (bắt buộc)' },
  { loai: 'vatChatXe', ten: 'vật chất xe' },
  { loai: 'taiNanNguoiTrenXe', ten: 'tai nạn người ngồi trên xe' },
]

/**
 * Bảng tài chính tổng hợp + lịch sử các năm.
 * Bản gốc thiếu hẳn phần này, người chơi phải tự nhớ mọi thứ.
 */
export default function TabSoSach({ state }: { state: GameState }) {
  // Thu nhập doanh nghiệp không còn cố định: `thuDong` là mức nền của năm nay,
  // còn số thực nhận rơi đâu đó trong biên độ dưới đây.
  const thuDong = thuNhapThuDong(state)
  const bienDo = bienDoThuNhapThuDong(state)
  const coDoanhNghiep = state.doanhNghiep.length > 0
  const xe = xeDangCo(state)
  const traNo = traNoMoiNam(state)
  const banDoi = state.daKetHon
    ? Math.round(state.luong * CONFIG.cotTruyen.cuoiThuNhapBanDoi)
    : 0
  const tongThu = state.luong + thuDong + banDoi
  const tongChi = state.chiPhiHangNam + traNo
  const rong = tongThu - tongChi

  const tongNo = state.khoanVay.reduce(
    (t, v) => t + v.thanhToanMoiNam * v.namConLai,
    0,
  )

  /** năm (trong game) chạm tuổi nghỉ hưu: tuổi 60 rơi vào năm 40 */
  const namNghiHuu =
    CONFIG.cotTruyen.tuoiNghiHuu - CONFIG.cotTruyen.tuoiBatDau + 1

  return (
    <>
      <div className="muc">💵 Dòng tiền một năm</div>
      <div className="the">
        <div className="hang">
          <span className="hang-nhan">{state.daNghiHuu ? 'Lương hưu' : 'Lương'}</span>
          <span className="hang-gia-tri duong">{dinhDangTien(state.luong)}</span>
        </div>
        {banDoi > 0 && (
          <div className="hang">
            <span className="hang-nhan">Bạn đời góp</span>
            <span className="hang-gia-tri duong">{dinhDangTien(banDoi)}</span>
          </div>
        )}
        <div className="hang">
          <span className="hang-nhan">
            Thu nhập thụ động{coDoanhNghiep ? ' — mức nền' : ''}
          </span>
          <span className="hang-gia-tri duong">{dinhDangTien(thuDong)}</span>
        </div>
        {coDoanhNghiep && (
          <div className="hang">
            <span className="hang-nhan">Khoảng có thể nhận năm nay</span>
            <span className="hang-gia-tri">
              {dinhDangTien(bienDo.thap)} – {dinhDangTien(bienDo.cao)}
            </span>
          </div>
        )}
        <div className="hang">
          <span className="hang-nhan">Chi phí sinh hoạt</span>
          <span className="hang-gia-tri am">−{dinhDangTien(state.chiPhiHangNam)}</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Trả nợ</span>
          <span className="hang-gia-tri am">
            {traNo > 0 ? `−${dinhDangTien(traNo)}` : '—'}
          </span>
        </div>
        <div className="hang">
          <span className="hang-nhan">
            <strong>Dòng tiền ròng</strong>
          </span>
          <span className={`hang-gia-tri ${rong >= 0 ? 'duong' : 'am'}`}>
            {rong >= 0 ? '+' : '−'}
            {dinhDangTien(Math.abs(rong))}
          </span>
        </div>
        <p className="mo-ta" style={{ margin: '10px 0 0' }}>
          Chưa tính lợi tức đầu tư và chi tiêu cho hạnh phúc — hai khoản đó thay đổi
          theo từng năm.
          {coDoanhNghiep &&
            ' Thu nhập từ doanh nghiệp cũng lên xuống mỗi năm theo tình hình làm ăn, nên dòng tiền ròng ở trên chỉ là mức nền.'}
        </p>
      </div>

      <div className="muc">🏆 Tài sản</div>
      <div className="the">
        <div className="hang">
          <span className="hang-nhan">💵 Tiền mặt</span>
          <span className="hang-gia-tri">{dinhDangTien(state.tienMat)}</span>
        </div>
        {TAI_SAN.filter((t) => state.soHuu[t.id] > 0).map((t) => (
          <div className="hang" key={t.id}>
            <span className="hang-nhan">
              {t.emoji} {t.ten} · {state.soHuu[t.id].toLocaleString('vi-VN')}{' '}
              {t.donViTen}
            </span>
            <span className="hang-gia-tri">
              {dinhDangTien(state.soHuu[t.id] * state.giaTaiSan[t.id])}
            </span>
          </div>
        ))}
        <div className="hang">
          <span className="hang-nhan">
            <strong>Tổng tài sản</strong>
          </span>
          <span className="hang-gia-tri duong">{dinhDangTien(tongTaiSan(state))}</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Trong đó danh mục đầu tư</span>
          <span className="hang-gia-tri">{dinhDangTien(giaTriDauTu(state))}</span>
        </div>
      </div>

      <div className="muc">👪 Gia đình</div>
      <div className="the">
        <div className="hang">
          <span className="hang-nhan">Tuổi hiện tại</span>
          <span className="hang-gia-tri">{tuoiHienTai(state)} tuổi</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Hôn nhân</span>
          <span className="hang-gia-tri">
            {state.daKetHon ? `Kết hôn năm ${state.cotTruyen.namCuoi}` : 'Độc thân'}
          </span>
        </div>
        {state.conCai.map((namSinh, i) => {
          const tuoiCon = state.nam - namSinh
          const trangThaiCon =
            tuoiCon >= CONFIG.cotTruyen.conTuoiTuLap
              ? 'đã tự lập'
              : tuoiCon >= CONFIG.cotTruyen.conTuoiDaiHoc
                ? 'đang học đại học'
                : 'đang nuôi'
          return (
            <div className="hang" key={`con-${i}`}>
              <span className="hang-nhan">
                Con thứ {i + 1} — sinh năm {namSinh}
              </span>
              <span className="hang-gia-tri">{trangThaiCon}</span>
            </div>
          )
        })}
        <div className="hang">
          <span className="hang-nhan">Nghỉ hưu</span>
          <span className="hang-gia-tri">
            {state.daNghiHuu
              ? `Đã nghỉ hưu từ năm ${namNghiHuu}`
              : state.nam >= namNghiHuu
                ? 'Ngay cuối năm nay'
                : `Còn ${namNghiHuu - state.nam} năm nữa`}
          </span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Hệ số chi phí gia đình</span>
          <span className="hang-gia-tri">
            ×{state.heSoChiPhi.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <div className="muc">🛡️ Nghĩa vụ &amp; bảo vệ</div>
      <div className="the">
        <div className="hang">
          <span className="hang-nhan">Tổng nợ còn phải trả</span>
          <span className="hang-gia-tri am">
            {tongNo > 0 ? dinhDangTien(tongNo) : '—'}
          </span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Bảo hiểm y tế</span>
          <span className="hang-gia-tri">
            {state.baoHiemDenNam >= state.nam
              ? `Còn hiệu lực · ${dinhDangTien(phiBaoHiem(state))}/năm`
              : 'Chưa mua'}
          </span>
        </div>
        {xe && (
          <div className="hang">
            <span className="hang-nhan">Xe đang có</span>
            <span className="hang-gia-tri">
              {xe.emoji} {xe.ten} · {dinhDangTien(xe.giaTri)}
            </span>
          </div>
        )}
        {xe &&
          BAO_HIEM_XE.map((b) => (
            <div className="hang" key={b.loai}>
              <span className="hang-nhan">Bảo hiểm {b.ten}</span>
              <span
                className={`hang-gia-tri ${
                  state.baoHiemXe[b.loai] >= state.nam ? 'duong' : 'am'
                }`}
              >
                {state.baoHiemXe[b.loai] >= state.nam ? 'Còn hiệu lực' : 'Chưa mua'}
              </span>
            </div>
          ))}
        <div className="hang">
          <span className="hang-nhan">Chỉ số giá tích luỹ</span>
          <span className="hang-gia-tri">
            ×{state.chiSoGia.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <div className="muc">📜 Lịch sử các năm</div>
      {state.lichSu.length === 0 ? (
        <div className="the">
          <p className="mo-ta" style={{ margin: 0 }}>
            Hết năm đầu tiên sẽ có số liệu ở đây.
          </p>
        </div>
      ) : (
        <div className="the cuon-ngang">
          <table className="bang">
            <thead>
              <tr>
                <th>Năm</th>
                <th>Lương</th>
                <th>Chi phí</th>
                <th>Tiền mặt</th>
                <th>Đầu tư</th>
                <th>Tổng</th>
                <th>Hạnh phúc</th>
                <th>Lạm phát</th>
              </tr>
            </thead>
            <tbody>
              {[...state.lichSu].reverse().map((d) => (
                <tr key={d.nam}>
                  <td>{d.nam}</td>
                  <td>{dinhDangTien(d.luong)}</td>
                  <td>{dinhDangTien(d.chiPhi)}</td>
                  <td>{dinhDangTien(d.tienMat)}</td>
                  <td>{dinhDangTien(d.giaTriDauTu)}</td>
                  <td>
                    <strong>{dinhDangTien(d.tongTaiSan)}</strong>
                  </td>
                  <td>{d.hanhPhuc}</td>
                  <td>{dinhDangPhanTram(d.lamPhat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

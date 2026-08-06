import { TAI_SAN } from '../game/content'
import {
  giaTriDauTu,
  phiBaoHiem,
  thuNhapThuDong,
  tongTaiSan,
  traNoMoiNam,
} from '../game/engine'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { GameState } from '../game/types'

/**
 * Bảng tài chính tổng hợp + lịch sử các năm.
 * Bản gốc thiếu hẳn phần này, người chơi phải tự nhớ mọi thứ.
 */
export default function TabSoSach({ state }: { state: GameState }) {
  const thuDong = thuNhapThuDong(state)
  const traNo = traNoMoiNam(state)
  const tongThu = state.luong + thuDong
  const tongChi = state.chiPhiHangNam + traNo
  const rong = tongThu - tongChi

  const tongNo = state.khoanVay.reduce(
    (t, v) => t + v.thanhToanMoiNam * v.namConLai,
    0,
  )

  return (
    <>
      <div className="muc">Dòng tiền một năm</div>
      <div className="the">
        <div className="hang">
          <span className="hang-nhan">Lương</span>
          <span className="hang-gia-tri duong">{dinhDangTien(state.luong)}</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Thu nhập thụ động</span>
          <span className="hang-gia-tri duong">{dinhDangTien(thuDong)}</span>
        </div>
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
        </p>
      </div>

      <div className="muc">Tài sản</div>
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

      <div className="muc">Nghĩa vụ &amp; bảo vệ</div>
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
        <div className="hang">
          <span className="hang-nhan">Số con</span>
          <span className="hang-gia-tri">{state.soConDaSinh}</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">Chỉ số giá tích luỹ</span>
          <span className="hang-gia-tri">
            ×{state.chiSoGia.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <div className="muc">Lịch sử các năm</div>
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
                <th>HP</th>
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

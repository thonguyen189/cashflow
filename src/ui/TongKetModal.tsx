import { CONFIG } from '../game/config'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { Action, GameState, SuKienLoai } from '../game/types'

const BIEU_TUONG_SU_KIEN: Record<SuKienLoai, string> = {
  lamPhat: '📈',
  omDau: '🏥',
  sinhCon: '👶',
  thuongTet: '🧧',
  canhBacKetQua: '🎲',
  ketHon: '💍',
  conVaoDaiHoc: '🎓',
  conTuLap: '🧳',
  lenChucOngBa: '👴',
  tuoiGia: '🍂',
  nghiHuu: '🌇',
  mungTho: '🎊',
  thangChuc: '🏆',
  suCo: '🔧',
  banTaiSan: '📉',
  mocTaiSan: '🚩',
}

export default function TongKetModal({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  const tk = state.tongKet
  if (!tk) return null
  const tienDo = Math.min(1, tk.tongTaiSan / CONFIG.mucTieuTaiSan)

  return (
    <div className="lop-phu">
      <div className="modal">
        <h2 className="modal-tieu-de">📋 Tổng kết năm {tk.nam}</h2>

        <div className="the">
          <div className="hang">
            <span className="hang-nhan">Tổng tài sản</span>
            <span className="hang-gia-tri duong">{dinhDangTien(tk.tongTaiSan)}</span>
          </div>
          <div className="thanh-tien-do" style={{ margin: '10px 0 0' }}>
            <div style={{ width: `${tienDo * 100}%` }} />
          </div>
          <div className="tien-do-chu" style={{ margin: '6px 0 0' }}>
            {(tienDo * 100).toFixed(1).replace('.', ',')}% mục tiêu
          </div>
        </div>

        <div className="muc">💰 Thu nhập</div>
        <div className="the">
          <div className="hang">
            <span className="hang-nhan">
              {state.daNghiHuu ? 'Lương hưu năm tới' : 'Lương năm tới'}
            </span>
            <span className="hang-gia-tri">
              {dinhDangTien(tk.luong)}{' '}
              <span className={tk.tangLuong >= 0 ? 'duong' : 'am'}>
                {dinhDangPhanTram(tk.tangLuong)}
              </span>
            </span>
          </div>
          {tk.thuNhapThuDong > 0 && (
            <div className="hang">
              <span className="hang-nhan">Thu nhập thụ động</span>
              <span className="hang-gia-tri duong">
                {dinhDangTien(tk.thuNhapThuDong)}
              </span>
            </div>
          )}
          {tk.thuNhapBanDoi > 0 && (
            <div className="hang">
              <span className="hang-nhan">Thu nhập của bạn đời</span>
              <span className="hang-gia-tri duong">
                {dinhDangTien(tk.thuNhapBanDoi)}
              </span>
            </div>
          )}
        </div>

        {tk.loiTucTaiSan.length > 0 && (
          <>
            <div className="muc">📊 Danh mục đầu tư</div>
            <div className="the">
              {tk.loiTucTaiSan.map((l) => (
                <div className="hang" key={l.id}>
                  <span className="hang-nhan">{l.ten}</span>
                  <span className="hang-gia-tri">
                    <span className={l.bienDong >= 0 ? 'duong' : 'am'}>
                      {dinhDangPhanTram(l.bienDong)}
                    </span>
                    {l.loiTuc > 0 && (
                      <span className="duong"> · +{dinhDangTien(l.loiTuc)}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="muc">😊 Hạnh phúc</div>
        <div className="the">
          {tk.phatKhatVong > 0 && (
            <div className="hang">
              <span className="hang-nhan">Chưa đạt khát vọng</span>
              <span className="hang-gia-tri am">−{tk.phatKhatVong}</span>
            </div>
          )}
          {tk.hanhPhucTuUocNguyen > 0 && (
            <div className="hang">
              <span className="hang-nhan">Từ các món ước nguyện</span>
              <span className="hang-gia-tri duong">+{tk.hanhPhucTuUocNguyen}</span>
            </div>
          )}
          <div className="hang">
            <span className="hang-nhan">Hiện tại</span>
            <span className="hang-gia-tri">{state.hanhPhuc}</span>
          </div>
        </div>

        <div className="muc">📰 Sự kiện</div>
        {tk.suKien.map((sk, i) => (
          <div className="su-kien" key={i}>
            <div className="su-kien-tieu-de">
              {BIEU_TUONG_SU_KIEN[sk.loai]} {sk.tieuDe}
              {sk.tienThayDoi !== 0 && (
                <span className={sk.tienThayDoi > 0 ? ' duong' : ' am'}>
                  {' '}
                  {sk.tienThayDoi > 0 ? '+' : '−'}
                  {dinhDangTien(Math.abs(sk.tienThayDoi))}
                </span>
              )}
              {sk.hanhPhucThayDoi !== 0 && (
                <span className={sk.hanhPhucThayDoi > 0 ? ' duong' : ' am'}>
                  {' '}
                  {sk.hanhPhucThayDoi > 0 ? '+' : ''}
                  {sk.hanhPhucThayDoi} hạnh phúc
                </span>
              )}
            </div>
            <div className="su-kien-mo-ta">{sk.moTa}</div>
          </div>
        ))}

        <p className="ghi-chu-luu">
          💾 Ván chơi đã được lưu tự động trên máy của bạn.
        </p>
        <button
          className="nut nut-chinh nut-rong"
          onClick={() => dispatch({ type: 'dongTongKet' })}
        >
          {state.trangThai !== 'dangChoi' ? 'Xem kết quả' : `Bắt đầu năm ${state.nam}`}
        </button>
      </div>
    </div>
  )
}

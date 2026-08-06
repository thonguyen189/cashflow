import { CONFIG } from '../game/config'
import { tongTaiSan } from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { GameState } from '../game/types'

export default function KetThucModal({
  state,
  onChoiLai,
}: {
  state: GameState
  onChoiLai: () => void
}) {
  const thang = state.trangThai === 'thang'
  return (
    <div className="lop-phu">
      <div className="modal" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{thang ? '🎉' : '💤'}</div>
        <h2 className={`modal-tieu-de ${thang ? 'ket-thuc-thang' : 'ket-thuc-thua'}`}>
          {thang ? 'Bạn đã tự do tài chính' : 'Ván đấu kết thúc'}
        </h2>
        <p className="mo-ta">{state.lyDoKetThuc}</p>

        <div className="the" style={{ textAlign: 'left' }}>
          <div className="hang">
            <span className="hang-nhan">Số năm đã chơi</span>
            <span className="hang-gia-tri">{state.lichSu.length}</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Tổng tài sản</span>
            <span className="hang-gia-tri">{dinhDangTien(tongTaiSan(state))}</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Mục tiêu</span>
            <span className="hang-gia-tri">
              {dinhDangTien(CONFIG.mucTieuTaiSan)}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Hạnh phúc cuối cùng</span>
            <span className="hang-gia-tri">{state.hanhPhuc}</span>
          </div>
        </div>

        <button className="nut nut-chinh nut-rong" onClick={onChoiLai}>
          Chơi ván mới
        </button>
      </div>
    </div>
  )
}

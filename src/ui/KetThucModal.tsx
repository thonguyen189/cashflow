import { CONFIG } from '../game/config'
import {
  dongTienThuDong,
  mocTaiSanCuaNghe,
  mucTieuTuDo,
  tienDoTuDo,
  tongTaiSan,
  tuoiHienTai,
} from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { Action, GameState } from '../game/types'

export default function KetThucModal({
  state,
  dispatch,
  onChoiLai,
}: {
  state: GameState
  dispatch: (a: Action) => void
  onChoiLai: () => void
}) {
  const thang = state.trangThai === 'thang'
  const vienMan = state.trangThai === 'vienMan'
  const bieuTuong = thang ? '🎉' : vienMan ? '🌅' : '💔'
  const tieuDe = thang
    ? 'Bạn đã tự do tài chính'
    : vienMan
      ? 'Hành trình trăm năm viên mãn'
      : 'Ván đấu kết thúc'
  const lopTieuDe = thang
    ? 'ket-thuc-thang'
    : vienMan
      ? 'ket-thuc-vien-man'
      : 'ket-thuc-thua'
  const tong = tongTaiSan(state)
  const dongTien = dongTienThuDong(state)
  const canCo = mucTieuTuDo(state)
  const phanTramTuDo = (tienDoTuDo(state) * 100).toFixed(1).replace('.', ',')
  const mocNamNay = mocTaiSanCuaNghe(state.ngheId, state.chiSoGia)
  const mocCaoNhatDaDat = state.mocTaiSanDaQua.length
    ? mocNamNay[Math.max(...state.mocTaiSanDaQua)]
    : undefined

  return (
    <div className="lop-phu">
      <div className="modal" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{bieuTuong}</div>
        <h2 className={`modal-tieu-de ${lopTieuDe}`}>{tieuDe}</h2>
        <p className="mo-ta">{state.lyDoKetThuc}</p>

        <div className="the" style={{ textAlign: 'left' }}>
          <div className="hang">
            <span className="hang-nhan">Số năm đã chơi</span>
            <span className="hang-gia-tri">
              {state.lichSu.length} năm · tới tuổi{' '}
              {Math.min(tuoiHienTai(state), CONFIG.cotTruyen.tuoiVienMan)}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">🕊️ Dòng tiền thụ động</span>
            <span className="hang-gia-tri duong">{dinhDangTien(dongTien)}/năm</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Mức cần đạt</span>
            <span className="hang-gia-tri">{dinhDangTien(canCo)}/năm</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Tự do tài chính đạt được</span>
            <span className="hang-gia-tri">{phanTramTuDo}%</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Tổng tài sản</span>
            <span className="hang-gia-tri">{dinhDangTien(tong)}</span>
          </div>
          <div className="hang">
            <span className="hang-nhan">🚩 Cột mốc tài sản</span>
            <span className="hang-gia-tri">
              {state.mocTaiSanDaQua.length}/{mocNamNay.length}
              {mocCaoNhatDaDat !== undefined
                ? ` · cao nhất ${dinhDangTien(mocCaoNhatDaDat)}`
                : ''}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Gia đình</span>
            <span className="hang-gia-tri">
              {state.daKetHon
                ? `Kết hôn năm ${state.cotTruyen.namCuoi}`
                : 'Độc thân'}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Con cái</span>
            <span className="hang-gia-tri">
              {state.conCai.length > 0
                ? `${state.conCai.length} người con`
                : 'Chưa có con'}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Nghỉ hưu</span>
            <span className="hang-gia-tri">
              {state.daNghiHuu ? 'Đã nghỉ hưu' : 'Chưa nghỉ hưu'}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">Hạnh phúc cuối cùng</span>
            <span className="hang-gia-tri">{state.hanhPhuc}</span>
          </div>
          {state.soLanPhaSan > 0 && (
            <div className="hang">
              <span className="hang-nhan">💀 Phá sản</span>
              <span className="hang-gia-tri am">
                Đã phá sản {state.soLanPhaSan} lần trên hành trình này
              </span>
            </div>
          )}
        </div>

        {thang && tuoiHienTai(state) <= CONFIG.cotTruyen.tuoiVienMan && (
          <>
            <button
              className="nut nut-chinh nut-rong"
              onClick={() => dispatch({ type: 'choiTiepSauThang' })}
            >
              🌅 Chơi tiếp, sống trọn hành trình tới tuổi{' '}
              {CONFIG.cotTruyen.tuoiVienMan}
            </button>
            <div style={{ height: 10 }} />
          </>
        )}
        <button
          className={`nut nut-rong${thang ? '' : ' nut-chinh'}`}
          onClick={onChoiLai}
        >
          Chơi ván mới
        </button>
      </div>
    </div>
  )
}

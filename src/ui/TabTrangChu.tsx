import { useState } from 'react'
import { CONFIG } from '../game/config'
import { timUocNguyen } from '../game/content'
import {
  dangCoBaoHiem,
  giaThucTe,
  khoaHocConLai,
  phiBaoHiem,
  thanhToanMoiNamCuaKhoanVay,
  traNoMoiNam,
  uocNguyenConLai,
  vayToiDa,
} from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { Action, GameState } from '../game/types'

interface Props {
  state: GameState
  dispatch: (a: Action) => void
}

/* ---------- Thẻ hành động của năm ---------- */
function TheHanhDong({ state, dispatch }: Props) {
  if (state.phase === 'chiPhi') {
    return (
      <div className="the-quyet-dinh">
        <div className="the-bieu-tuong">🧾</div>
        <div className="the-ten">Chi phí sinh hoạt năm nay</div>
        <p className="mo-ta">
          Tiền ăn, ở, đi lại, quần áo cho cả năm. Phải thanh toán trước khi làm gì khác.
        </p>
        <div className="the-gia">{dinhDangTien(state.chiPhiHangNam)}</div>
        <div style={{ height: 18 }} />
        <button
          className="nut nut-chinh nut-rong"
          onClick={() => dispatch({ type: 'traChiPhi' })}
        >
          Thanh toán
        </button>
      </div>
    )
  }

  if (state.phase === 'theBai') {
    const the = state.theConLai[0]
    if (!the) return null
    const gia = giaThucTe(state, the.gia)
    const duTien = state.tienMat >= gia
    return (
      <div className="the-quyet-dinh">
        <div className="the-bieu-tuong">{the.emoji}</div>
        <div className="the-ten">{the.ten}</div>
        <div className="the-gia">{dinhDangTien(gia)}</div>
        <div className="the-diem">
          Nhận: <strong className="duong">+{the.diem}</strong> hạnh phúc
        </div>
        <div className="canh-bao-tu-choi">
          Từ chối cũng mất <strong>−{the.diem}</strong> hạnh phúc. Chênh lệch giữa hai
          lựa chọn là <strong>{the.diem * 2}</strong> điểm.
        </div>
        <div className="hang-nut">
          <button
            className="nut nut-tu-choi"
            onClick={() => dispatch({ type: 'quyetDinhThe', nhan: false })}
          >
            Từ chối −{the.diem}
          </button>
          <button
            className="nut nut-nhan"
            disabled={!duTien}
            onClick={() => dispatch({ type: 'quyetDinhThe', nhan: true })}
          >
            {duTien ? `Nhận +${the.diem}` : 'Không đủ tiền'}
          </button>
        </div>
        <div className="the-diem" style={{ marginTop: 12, marginBottom: 0 }}>
          Còn {state.theConLai.length} thẻ trong năm nay
        </div>
      </div>
    )
  }

  const sapThua = state.hanhPhuc < CONFIG.hanhPhucNguongThua
  return (
    <div className="the-quyet-dinh">
      <div className="the-bieu-tuong">🗓️</div>
      <div className="the-ten">Trước khi kết thúc năm</div>
      <p className="mo-ta">
        Xem lại danh mục đầu tư, cân nhắc học thêm, mua bảo hiểm hoặc chốt một cơ hội
        kinh doanh. Sang năm mới là mọi giá đều tăng.
      </p>
      {sapThua && (
        <div className="canh-bao-tu-choi">
          Hạnh phúc đang ở mức {state.hanhPhuc}, dưới ngưỡng{' '}
          {CONFIG.hanhPhucNguongThua}. Kết thúc năm lúc này là <strong>thua</strong>.
        </div>
      )}
      <button
        className="nut nut-chinh nut-rong"
        onClick={() => dispatch({ type: 'ketThucNam' })}
      >
        Kết thúc năm {state.nam}
      </button>
    </div>
  )
}

/* ---------- Ngân hàng ---------- */
function KhuNganHang({ state, dispatch }: Props) {
  const [kyHan, setKyHan] = useState(3)
  const tran = vayToiDa(state, kyHan)
  const [goc, setGoc] = useState(0)
  const gocThuc = Math.min(goc, tran)
  const traMoiNam = gocThuc > 0 ? thanhToanMoiNamCuaKhoanVay(gocThuc, kyHan) : 0

  return (
    <div className="the">
      <div className="the-tieu-de">🏦 Ngân hàng</div>
      <p className="mo-ta">
        Lãi {Math.round(CONFIG.laiSuatVay * 100)}%/năm, kỳ hạn tối đa{' '}
        {CONFIG.kyHanVayToiDa} năm, không trả trước hạn được. Tổng nợ phải trả mỗi năm
        không vượt quá {Math.round(CONFIG.tyLeThanhToanToiDa * 100)}% lương.
      </p>

      {state.khoanVay.length > 0 && (
        <>
          <div className="hang">
            <span className="hang-nhan">Đang trả nợ mỗi năm</span>
            <span className="hang-gia-tri am">
              {dinhDangTien(traNoMoiNam(state))}
            </span>
          </div>
          {state.khoanVay.map((v) => (
            <div className="hang" key={v.id}>
              <span className="hang-nhan">
                Gốc {dinhDangTien(v.goc)} · còn {v.namConLai} năm
              </span>
              <span className="hang-gia-tri">
                {dinhDangTien(v.thanhToanMoiNam)}/năm
              </span>
            </div>
          ))}
        </>
      )}

      <div className="o-so-luong">
        <span className="hang-nhan">Kỳ hạn</span>
        {Array.from({ length: CONFIG.kyHanVayToiDa }, (_, i) => i + 1).map((k) => (
          <button
            key={k}
            className={`nut${kyHan === k ? ' nut-chinh' : ''}`}
            style={{ padding: '7px 0', flex: 1, fontSize: 13 }}
            onClick={() => setKyHan(k)}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="o-so-luong">
        <input
          type="range"
          min={0}
          max={Math.max(tran, 1)}
          step={Math.max(1, Math.round(tran / 100))}
          value={gocThuc}
          onChange={(e) => setGoc(Number(e.target.value))}
        />
        <span className="so-luong-chu">{dinhDangTien(gocThuc)}</span>
      </div>

      <div className="hang">
        <span className="hang-nhan">Trả mỗi năm trong {kyHan} năm</span>
        <span className="hang-gia-tri am">{dinhDangTien(traMoiNam)}</span>
      </div>

      <button
        className="nut nut-rong"
        disabled={gocThuc <= 0}
        onClick={() => {
          dispatch({ type: 'vay', goc: gocThuc, kyHan })
          setGoc(0)
        }}
      >
        {tran <= 0 ? 'Đã chạm trần vay' : `Vay ${dinhDangTien(gocThuc)}`}
      </button>
    </div>
  )
}

/* ---------- Tab ---------- */
export default function TabTrangChu({ state, dispatch }: Props) {
  const coBaoHiem = dangCoBaoHiem(state)
  const phi = giaThucTe(state, phiBaoHiem(state))
  const khoaHoc = khoaHocConLai(state)
  const uocNguyen = uocNguyenConLai(state)
  const khatVong = timUocNguyen(state.khatVongId)

  return (
    <>
      <TheHanhDong state={state} dispatch={dispatch} />

      <div className="muc">🛡️ Bảo hiểm y tế</div>
      <div className="the">
        <p className="mo-ta">
          Có bảo hiểm thì khi ốm đau được chi trả toàn bộ. Không có thì mất{' '}
          {Math.round(CONFIG.suKien.omDauChiPhiTyLeLuong * 100)}% lương và{' '}
          {CONFIG.suKien.omDauMatHanhPhuc} điểm hạnh phúc. Hiệu lực một năm.
        </p>
        <div className="hang">
          <span className="hang-nhan">
            {coBaoHiem ? `Còn hiệu lực hết năm ${state.baoHiemDenNam}` : 'Chưa mua'}
          </span>
          <button
            className={`nut${coBaoHiem ? '' : ' nut-chinh'}`}
            disabled={coBaoHiem || state.tienMat < phi}
            onClick={() => dispatch({ type: 'muaBaoHiem' })}
          >
            {coBaoHiem ? 'Đã có' : `Mua ${dinhDangTien(phi)}`}
          </button>
        </div>
      </div>

      <div className="muc">🎓 Giáo dục — tăng lương vĩnh viễn</div>
      {khoaHoc.length === 0 && (
        <div className="the">
          <p className="mo-ta" style={{ margin: 0 }}>
            Bạn đã học hết mọi bậc.
          </p>
        </div>
      )}
      {khoaHoc.map((k) => {
        const gia = giaThucTe(state, k.gia)
        return (
          <div className="muc-mua" key={k.id}>
            <span className="muc-mua-emoji">🎓</span>
            <div className="muc-mua-than">
              <div className="muc-mua-ten">{k.ten}</div>
              <div className="muc-mua-phu">
                Tăng lương {Math.round(k.tangLuongMin * 100)}–
                {Math.round(k.tangLuongMax * 100)}%
              </div>
            </div>
            <button
              className="nut muc-mua-nut"
              disabled={state.tienMat < gia}
              onClick={() => dispatch({ type: 'muaKhoaHoc', khoaHocId: k.id })}
            >
              {dinhDangTien(gia)}
            </button>
          </div>
        )
      })}

      <div className="muc">🌠 Ước nguyện — hạnh phúc mỗi năm</div>
      {state.uocNguyenDaMua.map((id) => {
        const u = timUocNguyen(id)
        if (!u) return null
        return (
          <div className="muc-mua the-da-mua" key={id}>
            <span className="muc-mua-emoji">{u.emoji}</span>
            <div className="muc-mua-than">
              <div className="muc-mua-ten">{u.ten}</div>
              <div className="muc-mua-phu">+{u.hanhPhucMoiNam} hạnh phúc mỗi năm</div>
            </div>
            <span className="nhan-da-mua">Đã có</span>
          </div>
        )
      })}
      {uocNguyen.map((u) => {
        const gia = giaThucTe(state, u.gia)
        const laKhatVong = u.id === state.khatVongId
        return (
          <div className="muc-mua" key={u.id}>
            <span className="muc-mua-emoji">{u.emoji}</span>
            <div className="muc-mua-than">
              <div className="muc-mua-ten">
                {u.ten}
                {laKhatVong && ' ⭐'}
              </div>
              <div className="muc-mua-phu">
                +{u.hanhPhucMoiNam} hạnh phúc mỗi năm
                {laKhatVong &&
                  ` · gỡ khoản phạt −${CONFIG.phatKhatVongMoiNam}/năm`}
              </div>
            </div>
            <button
              className={`nut muc-mua-nut${laKhatVong ? ' nut-chinh' : ''}`}
              disabled={state.tienMat < gia}
              onClick={() => dispatch({ type: 'muaUocNguyen', uocNguyenId: u.id })}
            >
              {dinhDangTien(gia)}
            </button>
          </div>
        )
      })}
      {khatVong && !state.uocNguyenDaMua.includes(state.khatVongId) && (
        <p className="mo-ta">
          ⭐ {khatVong.ten} là khát vọng của nghề bạn chọn. Mỗi năm chưa có nó, bạn mất{' '}
          {CONFIG.phatKhatVongMoiNam} điểm hạnh phúc.
        </p>
      )}

      <div className="muc">💳 Vay vốn</div>
      <KhuNganHang state={state} dispatch={dispatch} />
    </>
  )
}

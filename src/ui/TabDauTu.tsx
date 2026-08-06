import { useState } from 'react'
import { TAI_SAN } from '../game/content'
import { muaToiDa } from '../game/engine'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { Action, AssetId, GameState, TaiSan } from '../game/types'

function BieuDo({ dulieu }: { dulieu: number[] }) {
  if (dulieu.length < 2) {
    return (
      <p className="mo-ta" style={{ margin: '8px 0 0' }}>
        Chưa có lịch sử giá — hết năm đầu tiên sẽ có biểu đồ.
      </p>
    )
  }
  const min = Math.min(...dulieu)
  const max = Math.max(...dulieu)
  const bien = max - min || 1
  const diem = dulieu
    .map((v, i) => {
      const x = (i / (dulieu.length - 1)) * 100
      const y = 96 - ((v - min) / bien) * 92
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  const len = dulieu.length
  const tang = (dulieu[len - 1] ?? 0) >= (dulieu[0] ?? 0)
  return (
    <svg className="bieu-do" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={diem}
        fill="none"
        stroke={tang ? 'var(--xanh)' : 'var(--do)'}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TheTaiSan({
  ts,
  state,
  dispatch,
}: {
  ts: TaiSan
  state: GameState
  dispatch: (a: Action) => void
}) {
  const [muaSo, setMuaSo] = useState(0)
  const [banSo, setBanSo] = useState(0)

  const gia = state.giaTaiSan[ts.id]
  const dangCo = state.soHuu[ts.id]
  const toiDa = muaToiDa(state, ts.id)
  const lichSu = state.lichSuGia[ts.id] ?? []
  const giaDau = lichSu[0] ?? gia
  const thayDoi = giaDau > 0 ? gia / giaDau - 1 : 0

  const muaThuc = Math.min(muaSo, toiDa)
  const banThuc = Math.min(banSo, dangCo)

  return (
    <div className="the">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{ts.emoji}</span>
        <div style={{ flex: 1 }}>
          <div className="the-tieu-de" style={{ marginBottom: 0 }}>
            {ts.ten}
          </div>
          <div className="muc-mua-phu">
            {dinhDangTien(gia)} / {ts.donViTen}{' '}
            <span className={thayDoi >= 0 ? 'duong' : 'am'}>
              {dinhDangPhanTram(thayDoi)}
            </span>
          </div>
        </div>
      </div>

      <p className="mo-ta" style={{ margin: '10px 0 0' }}>
        {ts.moTa}
      </p>

      <BieuDo dulieu={lichSu} />

      <div className="hang">
        <span className="hang-nhan">Đang nắm giữ</span>
        <span className="hang-gia-tri">
          {dangCo > 0
            ? `${dangCo.toLocaleString('vi-VN')} ${ts.donViTen} · ${dinhDangTien(
                dangCo * gia,
              )}`
            : '—'}
        </span>
      </div>

      {toiDa > 0 ? (
        <>
          <div className="o-so-luong">
            <input
              type="range"
              min={0}
              max={toiDa}
              value={muaThuc}
              onChange={(e) => setMuaSo(Number(e.target.value))}
            />
            <span className="so-luong-chu">
              {muaThuc.toLocaleString('vi-VN')} {ts.donViTen}
            </span>
          </div>
          <button
            className="nut nut-chinh nut-rong"
            disabled={muaThuc <= 0}
            onClick={() => {
              dispatch({ type: 'dauTu', assetId: ts.id, soDonVi: muaThuc })
              setMuaSo(0)
            }}
          >
            Mua {dinhDangTien(muaThuc * gia)}
          </button>
        </>
      ) : (
        <p className="mo-ta" style={{ margin: '10px 0 0' }}>
          Chưa đủ tiền mua một {ts.donViTen}. Cần ít nhất {dinhDangTien(gia)}.
        </p>
      )}

      {dangCo > 0 && (
        <>
          <div className="o-so-luong">
            <input
              type="range"
              min={0}
              max={dangCo}
              value={banThuc}
              onChange={(e) => setBanSo(Number(e.target.value))}
            />
            <span className="so-luong-chu">
              {banThuc.toLocaleString('vi-VN')} {ts.donViTen}
            </span>
          </div>
          <button
            className="nut nut-rong"
            disabled={banThuc <= 0}
            onClick={() => {
              dispatch({ type: 'ban', assetId: ts.id, soDonVi: banThuc })
              setBanSo(0)
            }}
          >
            Bán {dinhDangTien(banThuc * gia)}
          </button>
        </>
      )}
    </div>
  )
}

export default function TabDauTu({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  const moKhoa = TAI_SAN.filter((t) => state.tienMat >= t.giaDonVi || state.soHuu[t.id] > 0)
  const chuaMo = TAI_SAN.filter((t) => !moKhoa.includes(t))

  return (
    <>
      <div className="muc">Danh mục đầu tư</div>
      {moKhoa.map((ts) => (
        <TheTaiSan key={ts.id} ts={ts} state={state} dispatch={dispatch} />
      ))}

      {chuaMo.length > 0 && (
        <>
          <div className="muc">Chưa mở khoá</div>
          {chuaMo.map((ts) => (
            <div className="muc-mua the-da-mua" key={ts.id}>
              <span className="muc-mua-emoji">🔒</span>
              <div className="muc-mua-than">
                <div className="muc-mua-ten">
                  {ts.emoji} {ts.ten}
                </div>
                <div className="muc-mua-phu">
                  Cần {dinhDangTien(state.giaTaiSan[ts.id as AssetId])} cho một{' '}
                  {ts.donViTen}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { CONFIG } from './game/config'
import { reducer, taoGameMoi, tongTaiSan } from './game/engine'
import { luuVan, taiVan, xoaVan } from './game/luu'
import type { Action, GameState } from './game/types'
import ChonNghe from './ui/ChonNghe'
import Hud from './ui/Hud'
import KetThucModal from './ui/KetThucModal'
import TabDauTu from './ui/TabDauTu'
import TabKinhDoanh from './ui/TabKinhDoanh'
import TabSoSach from './ui/TabSoSach'
import TabTrangChu from './ui/TabTrangChu'
import TongKetModal from './ui/TongKetModal'

type Tab = 'trangChu' | 'dauTu' | 'kinhDoanh' | 'soSach'

const TABS: { id: Tab; ten: string; icon: string }[] = [
  { id: 'trangChu', ten: 'Trang chủ', icon: '🏠' },
  { id: 'dauTu', ten: 'Đầu tư', icon: '📊' },
  { id: 'kinhDoanh', ten: 'Cơ hội', icon: '💼' },
  { id: 'soSach', ten: 'Sổ sách', icon: '📒' },
]

export default function App() {
  const [state, setState] = useState<GameState | null>(() => taiVan())
  const [tab, setTab] = useState<Tab>('trangChu')

  useEffect(() => {
    if (state) luuVan(state)
  }, [state])

  const dispatch = useCallback((a: Action) => {
    setState((s) => (s ? reducer(s, a) : s))
  }, [])

  const batDau = (ngheId: string) => {
    setTab('trangChu')
    setState(taoGameMoi(ngheId))
  }

  const veManChon = () => {
    xoaVan()
    setState(null)
  }

  if (!state) return <ChonNghe onChon={batDau} />

  const tong = tongTaiSan(state)
  const tienDo = Math.min(1, tong / CONFIG.mucTieuTaiSan)

  return (
    <>
      <div className="dau-trang">
        <div className="nam">Năm {state.nam}</div>
        <button className="nut-nho" onClick={veManChon}>
          Ván mới
        </button>
      </div>

      <Hud state={state} />

      <div className="thanh-tien-do">
        <div style={{ width: `${tienDo * 100}%` }} />
      </div>
      <div className="tien-do-chu">
        Mục tiêu: {(CONFIG.mucTieuTaiSan / 1_000_000_000).toString().replace('.', ',')} tỷ
        {' · '}
        đã đạt {(tienDo * 100).toFixed(1).replace('.', ',')}%
        {' · '}
        còn {CONFIG.soNamToiDa - state.nam + 1} năm
      </div>

      <div className="noi-dung">
        {tab === 'trangChu' && <TabTrangChu state={state} dispatch={dispatch} />}
        {tab === 'dauTu' && <TabDauTu state={state} dispatch={dispatch} />}
        {tab === 'kinhDoanh' && <TabKinhDoanh state={state} dispatch={dispatch} />}
        {tab === 'soSach' && <TabSoSach state={state} />}
      </div>

      <nav className="thanh-tab">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' hoat-dong' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.ten}
          </button>
        ))}
      </nav>

      {state.phase === 'tongKet' && state.tongKet && (
        <TongKetModal state={state} dispatch={dispatch} />
      )}
      {state.phase === 'ketThuc' && (
        <KetThucModal state={state} onChoiLai={veManChon} />
      )}
    </>
  )
}

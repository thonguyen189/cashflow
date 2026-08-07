import { useCallback, useEffect, useState } from 'react'
import { CONFIG } from './game/config'
import { reducer, taoGameMoi, tongTaiSan, tuoiHienTai } from './game/engine'
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

  const ct = CONFIG.cotTruyen
  const tong = tongTaiSan(state)
  const tyLeMucTieu = tong / CONFIG.mucTieuTaiSan
  const tuoi = Math.min(tuoiHienTai(state), ct.tuoiVienMan)
  const namConLai = Math.max(0, ct.tuoiVienMan - tuoi)
  // Sau khi đã chinh phục mục tiêu tài sản, thanh tiến độ chuyển sang đo
  // hành trình cuộc đời — nếu không thì nó đứng im ở 100% suốt sáu chục năm.
  const doDoiNguoi = state.daDatMucTieu
  const tienDo = doDoiNguoi
    ? (tuoi - ct.tuoiBatDau) / (ct.tuoiVienMan - ct.tuoiBatDau)
    : Math.min(1, tyLeMucTieu)

  return (
    <>
      <div className="dau-trang">
        <div className="nam">
          Năm {state.nam} · {tuoi} tuổi
          {state.daNghiHuu && <span className="nhan-nghi-huu">đã nghỉ hưu</span>}
        </div>
        <button className="nut-nho" onClick={veManChon}>
          Ván mới
        </button>
      </div>

      <Hud state={state} />

      <div className="thanh-tien-do co-moc">
        <div style={{ width: `${tienDo * 100}%` }} />
        {!doDoiNguoi &&
          CONFIG.mocTaiSan.map((moc) => (
            <span
              key={moc}
              className={`vach-moc${state.mocTaiSanDaQua.includes(moc) ? ' da-qua' : ''}`}
              style={{ left: `${(moc / CONFIG.mucTieuTaiSan) * 100}%` }}
            />
          ))}
        {doDoiNguoi &&
          ct.mungThoTuoi.map((tuoiTho) => (
            <span
              key={tuoiTho}
              className={`vach-moc${tuoi >= tuoiTho ? ' da-qua' : ''}`}
              style={{
                left: `${((tuoiTho - ct.tuoiBatDau) / (ct.tuoiVienMan - ct.tuoiBatDau)) * 100}%`,
              }}
            />
          ))}
      </div>
      <div className="tien-do-chu">
        {doDoiNguoi ? (
          <>
            🏆 Đã đạt mục tiêu · tài sản{' '}
            {(tyLeMucTieu * 100).toFixed(0).replace('.', ',')}% mức 10 tỷ
            {' · '}
            còn {namConLai} năm tới tuổi {ct.tuoiVienMan}
          </>
        ) : (
          <>
            Mục tiêu:{' '}
            {(CONFIG.mucTieuTaiSan / 1_000_000_000).toString().replace('.', ',')} tỷ
            {' · '}
            đã đạt {(tyLeMucTieu * 100).toFixed(1).replace('.', ',')}%
          </>
        )}
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
        <KetThucModal state={state} dispatch={dispatch} onChoiLai={veManChon} />
      )}
    </>
  )
}

import { CONFIG } from '../game/config'
import { giaTriDauTu, tienDoTuDo } from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { GameState } from '../game/types'

function matCuoi(hp: number): string {
  if (hp >= 100) return '🤩'
  if (hp >= 80) return '😄'
  if (hp >= 65) return '🙂'
  if (hp >= CONFIG.hanhPhucNguongThua) return '😐'
  return '😟'
}

export default function Hud({ state }: { state: GameState }) {
  const nguyHiem = state.hanhPhuc < CONFIG.hanhPhucNguongThua
  const tuDo = tienDoTuDo(state)
  return (
    <div className="hud">
      <div className="hud-o">
        <div className="hud-so" style={state.daTuDo ? { color: 'var(--xanh)' } : undefined}>
          {(tuDo * 100).toFixed(0)}%
        </div>
        <div className="hud-nhan">🕊️ Tự do</div>
      </div>
      <div className="hud-o">
        <div className="hud-so">{dinhDangTien(giaTriDauTu(state))}</div>
        <div className="hud-nhan">📊 Đầu tư</div>
      </div>
      <div className="hud-o">
        <div className="hud-so">{dinhDangTien(state.tienMat)}</div>
        <div className="hud-nhan">💵 Tiền mặt</div>
      </div>
      <div className="hud-o">
        <div className="hud-so" style={nguyHiem ? { color: 'var(--do)' } : undefined}>
          {state.hanhPhuc}
        </div>
        <div className="hud-nhan">
          {matCuoi(state.hanhPhuc)} Hạnh phúc
        </div>
      </div>
    </div>
  )
}

import { timCoHoi } from '../game/content'
import { giaThucTe } from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { Action, GameState } from '../game/types'

export default function TabKinhDoanh({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  return (
    <>
      <div className="muc">💼 Cơ hội năm nay</div>
      {state.coHoiNamNay.length === 0 && (
        <div className="the">
          <p className="mo-ta" style={{ margin: 0 }}>
            Năm nay không còn cơ hội nào. Sang năm sẽ có lời mời mới.
          </p>
        </div>
      )}

      {state.coHoiNamNay.map((c) => {
        const gia = giaThucTe(state, c.gia)
        const duTien = state.tienMat >= gia
        const laCanhBac = c.loai === 'canhBac'
        return (
          <div className="the-quyet-dinh" key={c.id}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{c.emoji}</div>
            <div className="the-ten">{c.ten}</div>
            <p className="mo-ta">{c.moTa}</p>

            <div className="hang">
              <span className="hang-nhan">Vốn bỏ ra</span>
              <span className="hang-gia-tri am">{dinhDangTien(gia)}</span>
            </div>
            {laCanhBac ? (
              <>
                <div className="hang">
                  <span className="hang-nhan">Xác suất thắng</span>
                  <span className="hang-gia-tri">
                    {Math.round((c.xacSuatThang ?? 0) * 100)}%
                  </span>
                </div>
                <div className="hang">
                  <span className="hang-nhan">Nếu thắng</span>
                  <span className="hang-gia-tri duong">
                    {dinhDangTien(gia * (c.heSoNhan ?? 0))}
                  </span>
                </div>
                <div className="canh-bao-tu-choi" style={{ marginTop: 12 }}>
                  Kỳ vọng{' '}
                  {dinhDangTien(
                    gia * (c.xacSuatThang ?? 0) * (c.heSoNhan ?? 0) - gia,
                  )}{' '}
                  — mở kết quả vào cuối năm.
                </div>
              </>
            ) : (
              <>
                <div className="hang">
                  <span className="hang-nhan">Thu nhập mỗi năm</span>
                  <span className="hang-gia-tri duong">
                    {dinhDangTien(giaThucTe(state, c.thuNhapMoiNam ?? 0))}
                  </span>
                </div>
                <div className="hang">
                  <span className="hang-nhan">Hoàn vốn sau</span>
                  <span className="hang-gia-tri">
                    {((c.gia / (c.thuNhapMoiNam || 1)) || 0).toFixed(1).replace('.', ',')} năm
                  </span>
                </div>
              </>
            )}

            <div style={{ height: 16 }} />
            <div className="hang-nut">
              <button
                className="nut nut-tu-choi"
                onClick={() =>
                  dispatch({ type: 'quyetDinhCoHoi', coHoiId: c.id, nhan: false })
                }
              >
                Bỏ qua
              </button>
              <button
                className="nut nut-nhan"
                disabled={!duTien}
                onClick={() =>
                  dispatch({ type: 'quyetDinhCoHoi', coHoiId: c.id, nhan: true })
                }
              >
                {duTien ? 'Tham gia' : 'Không đủ vốn'}
              </button>
            </div>
          </div>
        )
      })}

      {state.canhBacDangCho.length > 0 && (
        <>
          <div className="muc">🎲 Đang chờ kết quả</div>
          {state.canhBacDangCho.map((c, i) => (
            <div className="muc-mua" key={`${c.coHoiId}-${i}`}>
              <span className="muc-mua-emoji">
                {timCoHoi(c.coHoiId)?.emoji ?? '🎲'}
              </span>
              <div className="muc-mua-than">
                <div className="muc-mua-ten">
                  {timCoHoi(c.coHoiId)?.ten ?? c.coHoiId}
                </div>
                <div className="muc-mua-phu">
                  Đã đặt {dinhDangTien(c.gia)} — mở vào cuối năm
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="muc">🏪 Doanh nghiệp đang sở hữu</div>
      {state.doanhNghiep.length === 0 ? (
        <div className="the">
          <p className="mo-ta" style={{ margin: 0 }}>
            Chưa góp vốn vào đâu. Thu nhập thụ động là cách duy nhất để thoát khỏi việc
            phụ thuộc hoàn toàn vào lương.
          </p>
        </div>
      ) : (
        state.doanhNghiep.map((d, i) => (
          <div className="muc-mua" key={`${d.coHoiId}-${i}`}>
            <span className="muc-mua-emoji">
              {timCoHoi(d.coHoiId)?.emoji ?? '💼'}
            </span>
            <div className="muc-mua-than">
              <div className="muc-mua-ten">{d.ten}</div>
              <div className="muc-mua-phu">
                {dinhDangTien(d.thuNhapMoiNam)} mỗi năm
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}

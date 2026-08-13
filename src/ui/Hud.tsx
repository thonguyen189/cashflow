import { CONFIG } from '../game/config'
import { daTuDoTaiChinh, dangTriLieu, giaTriDauTu, tienDoTuDo } from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { GameState } from '../game/types'

/**
 * Biểu tượng đứng trước nhãn hạnh phúc.
 *
 * Đang trị liệu thì trả 🧘 THAY CHO nét mặt, chứ không gắn thêm emoji thứ hai vào
 * ô: lưới HUD chia bốn cột đều nhau, trên máy hẹp mỗi ô chỉ còn khoảng 80px mà nhãn
 * lại là cỡ chữ 11px — thêm một emoji nữa là dòng "Hạnh phúc" gãy xuống hàng và ô
 * hạnh phúc cao vống hơn ba ô còn lại. Giấu nét mặt trong ba năm là cái giá rẻ hơn
 * hẳn so với vỡ lưới, và bản thân 🧘 đã kể đúng chuyện đang xảy ra; mức hạnh phúc
 * thì vẫn đọc được nguyên vẹn ở con số ngay trên nhãn và ở màu của nó.
 *
 * Nhưng chỉ nhường chỗ khi CÒN AN TOÀN: dưới ngưỡng thua thì bấm Kết thúc năm là
 * mất ván, mà 🧘 lại đọc ra là "đang an ổn" — dựng cờ trắng ngay cạnh con số đang
 * tô đỏ là hai tín hiệu chọi nhau đúng lúc nguy hiểm nhất. Vùng đó trả 😟 về đúng
 * chỗ của nó, vẫn một emoji mỗi ô nên lưới không vỡ.
 */
function matCuoi(hp: number, dangTri: boolean): string {
  if (dangTri && hp >= CONFIG.hanhPhucNguongThua) return '🧘'
  if (hp >= 100) return '🤩'
  if (hp >= 80) return '😄'
  // Mốc này vốn là số cứng 65, chẳng khớp với ngưỡng nào của engine: nét mặt hết
  // cười ở 65 còn màu số vẫn bình thường tới tận 50, nên hai tín hiệu báo động lệch
  // pha nhau. Buộc nó vào `hanhPhucNguongCanhBao` để mặt và màu cùng đổi đúng lúc
  // người chơi bước vào vùng mà game bắt đầu kể chuyện kiệt sức.
  if (hp >= CONFIG.hanhPhucNguongCanhBao) return '🙂'
  if (hp >= CONFIG.hanhPhucNguongThua) return '😐'
  return '😟'
}

/**
 * Màu số hạnh phúc, ba mức thay vì hai.
 *
 * Mức vàng ở khoảng cảnh báo là để người chơi thấy mình bước vào vùng nguy hiểm
 * trước một nhịp: đợi tới lúc số đỏ mới đi gặp chuyên gia thì liệu trình không cứu
 * nổi năm đó nữa, vì nó chỉ trả điểm sau khi cửa ải thua đã đóng.
 */
function mauHanhPhuc(hp: number): string | undefined {
  if (hp < CONFIG.hanhPhucNguongThua) return 'var(--do)'
  if (hp < CONFIG.hanhPhucNguongCanhBao) return 'var(--vang-dam)'
  return undefined
}

export default function Hud({ state }: { state: GameState }) {
  const mauSoHanhPhuc = mauHanhPhuc(state.hanhPhuc)
  const tuDo = tienDoTuDo(state)
  return (
    <div className="hud">
      <div className="hud-o">
        {/* Màu và số phải đọc CÙNG MỘT nguồn. Trước đây màu đọc `state.daTuDo` —
          * một cờ chỉ bật lên chứ không bao giờ tắt lại — còn con số đọc
          * `tienDoTuDo` vốn sống động và tụt được. Ca xảy ra: người chơi đạt tự
          * do rồi bấm "Chơi tiếp", sau đó khủng hoảng kinh tế hoặc doanh nghiệp
          * đóng cửa kéo dòng tiền thụ động xuống — thanh chỉ số hiện "71%" màu
          * xanh trong khi tab Sổ sách ngay dưới ghi còn thiếu bao nhiêu mỗi năm. */}
        <div
          className="hud-so"
          style={daTuDoTaiChinh(state) ? { color: 'var(--xanh)' } : undefined}
        >
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
        <div
          className="hud-so"
          style={mauSoHanhPhuc ? { color: mauSoHanhPhuc } : undefined}
        >
          {state.hanhPhuc}
        </div>
        <div className="hud-nhan">
          {matCuoi(state.hanhPhuc, dangTriLieu(state))} Hạnh phúc
        </div>
      </div>
      <div className={`hud-o thi-truong ${state.thiTruong}`}>
        <div className="hud-so">{CONFIG.thiTruong.ten[state.thiTruong]}</div>
        <div className="hud-nhan">
          {CONFIG.thiTruong.icon[state.thiTruong]} Thị trường
        </div>
      </div>
    </div>
  )
}

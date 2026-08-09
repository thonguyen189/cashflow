import { CONFIG } from '../game/config'
import {
  chiPhiChuaToiUu,
  dangDuocHoTro,
  dangTriLieu,
  daToiUuChiPhi,
  hoiPhucTriLieu,
  phiChuyenGiaTaiChinh,
  phiChuyenGiaTamLy,
  soNamTriLieuConLai,
  toiUuDaVaoSo,
} from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { Action, GameState } from '../game/types'

interface Props {
  state: GameState
  dispatch: (a: Action) => void
}

/* ---------- Chuyên gia đồng hành ----------
 * Hai gói dịch vụ cho tuyến hạnh phúc: liệu trình tâm lý nhiều năm và bản kế
 * hoạch chi tiêu một lần. Cả hai đều lấy phí theo `chiPhiHangNam` nên phải gọi
 * hàm của engine, tuyệt đối không tự nhân lại ở đây — nút mà hiện một giá còn
 * engine trừ một giá khác thì người chơi mất niềm tin vào cả bảng số.
 */
export default function KhuChuyenGia({ state, dispatch }: Props) {
  const cg = CONFIG.chuyenGia
  // Điều kiện hỗ trợ là CỜ kiệt sức đã chốt ở Tổng kết năm trước, không phải mức
  // hạnh phúc lúc này. Phải hỏi engine đúng hàm mà hai hàm phí đang hỏi, nếu không
  // giao diện và reducer sẽ có lúc bất đồng về việc còn được giảm giá hay không.
  const duocHoTro = dangDuocHoTro(state)
  const phiTamLy = phiChuyenGiaTamLy(state)
  const phiTaiChinh = phiChuyenGiaTaiChinh(state)
  const dangTri = dangTriLieu(state)
  const daToiUu = daToiUuChiPhi(state)
  // Mức hồi của LẦN MUA KẾ TIẾP: `soLanTriLieu` chỉ tăng lúc thuê nên phải cộng
  // một để nhìn thấy trước hiệu quả đã nhạt đi bao nhiêu.
  const hoiLanSau = hoiPhucTriLieu(state.soLanTriLieu + 1)

  // Phần giảm chi phí chỉ vào sổ ở bước 10 của `chuyenNam`, nên suốt phần còn lại
  // của năm vừa thuê thì `chiPhiHangNam` vẫn là con số CHƯA giảm. Hỏi engine đúng
  // câu hỏi mà Sổ sách đang hỏi — hai màn nói ngược nhau về đúng món đắt nhất của
  // bản này thì người chơi vừa trả cả một năm chi phí sẽ tưởng mình bị lừa.
  const daVaoSo = toiUuDaVaoSo(state)
  // Khoản tiết kiệm THẬT của năm nay: hiệu của hai con số, đúng bằng 0 khi phần
  // giảm chưa vào sổ. Cố ý không chia ngược cho `heSoToiUuChiPhi` — phép chia ấy
  // chỉ đúng khi `chiPhiHangNam` đã giảm, mà nó thổi con số lên trong đúng năm
  // người chơi cần đọc đúng nhất, và chia cho 0 nếu ai đó đặt `giamChiPhi: 1`.
  const tietKiemDaVaoSo = chiPhiChuaToiUu(state) - state.chiPhiHangNam
  // Mức giảm ước tính trên mặt bằng giá của năm nay, dùng cho cả lúc chào hàng lẫn
  // lúc báo "sẽ áp dụng từ năm sau".
  const tietKiemUocTinh = Math.round(state.chiPhiHangNam * cg.taiChinh.giamChiPhi)
  const mucGiamPhanTram = Math.round(cg.taiChinh.giamChiPhi * 100)

  /**
   * Dòng phụ báo đang được hỗ trợ, gắn vào cả hai thẻ còn mua được.
   *
   * Cố ý KHÔNG gạch ngang giá gốc: `styles.css` không có lớp gạch ngang nào, mà đẻ
   * thêm một lớp chỉ để khoe con số người chơi không phải trả thì không đáng. Giá
   * trên nút luôn là giá THẬT sẽ bị trừ, đúng con số hai hàm phí trả về.
   */
  const dongHoTro = duocHoTro && (
    <div className="muc-mua-phu">🤝 Đang được hỗ trợ một nửa phí</div>
  )

  return (
    <>
      <div className="muc">🧑‍⚕️ Chuyên gia đồng hành</div>
      <div className="the">
        <p className="mo-ta" style={{ marginBottom: duocHoTro ? 12 : 0 }}>
          🧠 Tinh thần cũng cần được chăm sóc như thân thể, và tiền bạc cũng cần một
          người ngoài soát lại giúp. Hãy đi gặp chuyên gia <strong>sớm</strong>, lúc
          hạnh phúc còn cao: buổi trị liệu chỉ cộng điểm sau khi năm đã khép lại, nên
          đợi rơi xuống dưới ngưỡng {CONFIG.hanhPhucNguongThua} mới tìm tới thì đã muộn.
          Liệu trình cũng chỉ là chỗ dựa để bạn đổi được nếp sống — đổi được thì lần
          sau đỡ hẳn, còn giữ nguyên hoàn cảnh cũ thì liệu trình sau nâng được ít hơn.
        </p>
        {/* Cờ kiệt sức chỉ tắt khi hạnh phúc leo lại từ ngưỡng cảnh báo trở lên, mà
            chuyện kiệt sức thì chỉ kể MỘT LẦN cho mỗi lần rơi. Nên tuyệt đối không
            nói "Tổng kết năm ngoái ghi nhận": ở năm thứ ba của một quãng đáy, bảng
            Tổng kết năm ngoái không hề có dòng kiệt sức nào mà mức giảm vẫn còn. */}
        {duocHoTro && (
          <p className="mo-ta" style={{ margin: 0 }}>
            🤝 Bạn vẫn đang trong quãng kiệt sức mà bảng Tổng kết đã ghi nhận, nên
            chương trình hỗ trợ của cơ quan và cộng đồng vẫn còn hiệu lực: cả hai gói
            chỉ còn một nửa phí, cho tới khi hạnh phúc leo lại từ{' '}
            {CONFIG.hanhPhucNguongCanhBao} trở lên.
          </p>
        )}
      </div>

      {/* Đang trong liệu trình thì mượn khuôn của mục Ước nguyện — thẻ mờ đi kèm một
          nhãn thay cho nút — vì đây cũng là món đang sở hữu, không phải nút hỏng. */}
      {dangTri ? (
        <div className="muc-mua the-da-mua">
          <span className="muc-mua-emoji">🧘</span>
          <div className="muc-mua-than">
            <div className="muc-mua-ten">Chuyên gia tâm lý</div>
            <div className="muc-mua-phu">
              Mỗi năm hồi +{hoiPhucTriLieu(state.soLanTriLieu)} hạnh phúc, cộng vào lúc
              Tổng kết năm
            </div>
          </div>
          <span className="nhan-da-mua">
            Đang trị liệu · còn {soNamTriLieuConLai(state)} năm
          </span>
        </div>
      ) : (
        <div className="muc-mua">
          <span className="muc-mua-emoji">🧘</span>
          <div className="muc-mua-than">
            <div className="muc-mua-ten">Chuyên gia tâm lý</div>
            {/* Lý do trong truyện phải nằm TRÊN màn hình chứ không chỉ trong comment:
                nói "đã trị liệu N lần nên hiệu quả nhạt dần" là quy nguyên nhân cho
                số lần đi trị liệu, mà đó lại là điều cả đặc tả lẫn hai khối chú thích
                của engine và cấu hình đều dặn phải tránh. Cái nhạt dần ở đây mô phỏng
                việc dùng trị liệu để THAY CHO thay đổi nếp sống. */}
            <div className="muc-mua-phu">
              {`Liệu trình ${cg.tamLy.soNamLieuTrinh} năm, tính cả năm nay · mỗi năm hồi +${hoiLanSau} hạnh phúc${
                state.soLanTriLieu > 0
                  ? ` · đã qua ${state.soLanTriLieu} liệu trình mà hoàn cảnh gây kiệt sức chưa đổi, nên lần này đỡ được ít hơn lần trước`
                  : ''
              }`}
            </div>
            {dongHoTro}
          </div>
          <button
            className="nut muc-mua-nut nut-chinh"
            disabled={state.tienMat < phiTamLy}
            onClick={() => dispatch({ type: 'thueChuyenGiaTamLy' })}
          >
            {dinhDangTien(phiTamLy)}
          </button>
        </div>
      )}

      <div className={`muc-mua${daToiUu ? ' the-da-mua' : ''}`}>
        <span className="muc-mua-emoji">🧭</span>
        <div className="muc-mua-than">
          <div className="muc-mua-ten">Chuyên gia hoạch định tài chính</div>
          <div className="muc-mua-phu">
            {!daToiUu
              ? `Giảm ${mucGiamPhanTram}% chi phí sinh hoạt vĩnh viễn — khoảng ${dinhDangTien(tietKiemUocTinh)} mỗi năm · +${cg.taiChinh.hanhPhucNgay} hạnh phúc ngay · cả ván chỉ một lần`
              : daVaoSo
                ? `Đang tiết kiệm ${dinhDangTien(tietKiemDaVaoSo)} tiền chi phí sinh hoạt mỗi năm, và khoản này lớn dần theo lạm phát`
                : `Phần giảm ${mucGiamPhanTram}% sẽ áp dụng từ năm sau — khoảng ${dinhDangTien(tietKiemUocTinh)} mỗi năm, và khoản này lớn dần theo lạm phát`}
          </div>
          {/* Đã thuê rồi thì không còn gì để hỗ trợ nữa — chỉ khoe mức giảm khi nút
              mua vẫn còn đó. */}
          {!daToiUu && dongHoTro}
        </div>
        {/* Đã thuê thì dùng đúng nhãn "Đã có" của mọi món đã sở hữu trong game —
            bảo hiểm, bảo hiểm xe, ước nguyện — chứ không đặt nhãn riêng, để người
            chơi quét mắt một lượt là biết ngay món nào đã nằm trong tay. */}
        {daToiUu ? (
          <span className="nhan-da-mua">Đã có</span>
        ) : (
          <button
            className="nut muc-mua-nut"
            disabled={state.tienMat < phiTaiChinh}
            onClick={() => dispatch({ type: 'thueChuyenGiaTaiChinh' })}
          >
            {dinhDangTien(phiTaiChinh)}
          </button>
        )}
      </div>
    </>
  )
}

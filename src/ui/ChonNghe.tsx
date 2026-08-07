import { CONFIG } from '../game/config'
import { NGHE, timUocNguyen } from '../game/content'
import { dinhDangTien } from '../game/format'

export default function ChonNghe({ onChon }: { onChon: (ngheId: string) => void }) {
  return (
    <div className="man-chon">
      <h1 className="tieu-de-lon">💰 Dòng Tiền</h1>
      <p className="mo-ta">
        Một hành trình trăm năm, mỗi lượt là một năm. Bạn bắt đầu ở tuổi{' '}
        {CONFIG.cotTruyen.tuoiBatDau}, rồi lần lượt đi qua chuyện cưới xin, sinh
        con, nghỉ hưu ở tuổi {CONFIG.cotTruyen.tuoiNghiHuu} và đi trọn tới{' '}
        {CONFIG.cotTruyen.tuoiVienMan} tuổi — vừa tích luỹ tài sản, vừa giữ cho
        mình đủ hạnh phúc để đi tiếp. Tích luỹ đủ{' '}
        <strong>
          {(CONFIG.mucTieuTaiSan / 1_000_000_000).toString().replace('.', ',')} tỷ
        </strong>{' '}
        là thắng; để hạnh phúc rơi xuống dưới {CONFIG.hanhPhucNguongThua} là thua;
        sống trọn trăm năm là kết thúc viên mãn.
      </p>

      <div className="muc">🧑‍💼 Chọn nghề nghiệp</div>
      {NGHE.map((n) => {
        const thangDu = n.luong - n.chiPhi
        const tyLe = Math.round((thangDu / n.luong) * 100)
        const khatVong = timUocNguyen(n.khatVongId)
        return (
          <button key={n.id} className="the-nghe" onClick={() => onChon(n.id)}>
            <div className="the-nghe-dau">
              <span style={{ fontSize: 30 }}>{n.emoji}</span>
              <span className="the-nghe-ten">{n.ten}</span>
            </div>
            <p className="mo-ta" style={{ marginBottom: 10 }}>
              {n.moTa}
            </p>
            <div className="hang">
              <span className="hang-nhan">Lương mỗi năm</span>
              <span className="hang-gia-tri">{dinhDangTien(n.luong)}</span>
            </div>
            <div className="hang">
              <span className="hang-nhan">Chi phí mỗi năm</span>
              <span className="hang-gia-tri am">{dinhDangTien(n.chiPhi)}</span>
            </div>
            <div className="hang">
              <span className="hang-nhan">Thặng dư</span>
              <span className="hang-gia-tri duong">
                {dinhDangTien(thangDu)} ({tyLe}%)
              </span>
            </div>
            <div className="hang">
              <span className="hang-nhan">Khát vọng</span>
              <span className="hang-gia-tri">
                {khatVong?.emoji} {khatVong?.ten}
              </span>
            </div>
          </button>
        )
      })}
      <p className="mo-ta" style={{ marginTop: 16 }}>
        Chưa mua được món khát vọng thì mỗi năm bị trừ {CONFIG.phatKhatVongMoiNam} điểm
        hạnh phúc.
      </p>
    </div>
  )
}

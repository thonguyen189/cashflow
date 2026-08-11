import { useState } from 'react'
import { CONFIG } from '../game/config'
import { NGHE, XUAT_THAN, timNghe, timUocNguyen, timXuatThan } from '../game/content'
import {
  apLucTheoBacLuong,
  mocTaiSanCuaNghe,
  nghiaVuNamDau,
  tangLuongThucTheoTuoi,
  tinhHeSoChiPhi,
} from '../game/engine'
import { dinhDangTien } from '../game/format'
import type { Nghe, ThietLapNhanVat, XuatThanId } from '../game/types'

/**
 * Lương dự kiến ở một tuổi bất kỳ, cộng dồn từng năm theo `duongCongSuNghiep`
 * — CHÍNH LÀ công thức `tangLuongThucTheoTuoi` mà engine dùng để tính lương
 * thật mỗi năm (v1.7). Ba nghề nay khởi điểm gần như nhau (90–144 triệu) nên
 * đây mới là thông tin quyết định của màn chọn nghề, không phải lương năm đầu.
 */
function luongTaiTuoi(nghe: Nghe, denTuoi: number): number {
  let luong = nghe.luong
  for (let tuoi = CONFIG.cotTruyen.tuoiBatDau + 1; tuoi <= denTuoi; tuoi++) {
    luong *= 1 + tangLuongThucTheoTuoi(nghe, tuoi)
  }
  return Math.round(luong)
}

export default function ChonNghe({
  onChon,
}: {
  onChon: (ngheId: string, thietLap: ThietLapNhanVat) => void
}) {
  const [ngheDaChon, setNgheDaChon] = useState<string | null>(null)
  const [xuatThanId, setXuatThanId] = useState<XuatThanId>('vienChuc')
  const [bacLuong, setBacLuong] = useState<number>(1)

  if (ngheDaChon === null) {
    return (
      <div className="man-chon">
        <h1 className="tieu-de-lon">💰 Dòng Tiền</h1>
        <p className="mo-ta">
          Một hành trình trăm năm, mỗi lượt là một năm. Bạn bắt đầu ở tuổi{' '}
          {CONFIG.cotTruyen.tuoiBatDau}, rồi lần lượt đi qua chuyện cưới xin, sinh
          con, nghỉ hưu ở tuổi {CONFIG.cotTruyen.tuoiNghiHuu} và đi trọn tới{' '}
          {CONFIG.cotTruyen.tuoiVienMan} tuổi — vừa gây dựng dòng tiền, vừa giữ cho
          mình đủ hạnh phúc để đi tiếp. Xây được{' '}
          <strong>dòng tiền thụ động đủ nuôi cả năm</strong> là thắng; để hạnh phúc
          rơi xuống dưới {CONFIG.hanhPhucNguongThua} là thua; sống trọn trăm năm là
          kết thúc viên mãn.
        </p>
        <p className="mo-ta">
          🕊️ Mỗi nghề một cái đích riêng: sống càng đắt đỏ thì càng phải gây dựng
          nhiều. Vàng và tiền mã hoá không đẻ ra đồng nào mỗi năm nên không mua nổi
          tự do — chỉ doanh nghiệp, bất động sản cho thuê, cổ tức và lãi trái phiếu
          mới tính.
        </p>

        <div className="muc">🧑‍💼 Chọn nghề nghiệp</div>
        {NGHE.map((n) => {
          const thangDu = n.luong - n.chiPhi
          const tyLe = Math.round((thangDu / n.luong) * 100)
          const khatVong = timUocNguyen(n.khatVongId)
          const canDongTien = nghiaVuNamDau(n)
          const mocCaoNhat = mocTaiSanCuaNghe(n.id).at(-1) ?? 0
          return (
            <button key={n.id} className="the-nghe" onClick={() => setNgheDaChon(n.id)}>
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
                <span className="hang-nhan">🕊️ Tự do tài chính khi dòng tiền đạt</span>
                <span className="hang-gia-tri duong">
                  {dinhDangTien(canDongTien)}/năm
                </span>
              </div>
              <div className="hang">
                <span className="hang-nhan">🚩 Cột mốc tài sản cao nhất</span>
                <span className="hang-gia-tri">{dinhDangTien(mocCaoNhat)}</span>
              </div>
              <div className="hang">
                <span className="hang-nhan">Khát vọng</span>
                <span className="hang-gia-tri">
                  {khatVong?.emoji} {khatVong?.ten}
                </span>
              </div>
              <div className="duong-su-nghiep">
                <span>📈 Lương dự kiến:</span>
                <span>tuổi 30 · {dinhDangTien(luongTaiTuoi(n, 30))}</span>
                <span>tuổi 40 · {dinhDangTien(luongTaiTuoi(n, 40))}</span>
                <span>tuổi 60 · {dinhDangTien(luongTaiTuoi(n, 60))}</span>
              </div>
            </button>
          )
        })}
        <p className="mo-ta" style={{ marginTop: 16 }}>
          Chưa mua được món khát vọng thì mỗi năm bị trừ {CONFIG.phatKhatVongMoiNam} điểm
          hạnh phúc. Con số tự do ở trên là mức của năm đầu tiên — cưới xin, sinh con
          và lạm phát sẽ đẩy nó lên, nên cái đích còn biết chạy.
        </p>
      </div>
    )
  }

  const nghe = timNghe(ngheDaChon)!
  const xuatThan = timXuatThan(xuatThanId)!
  const luong = Math.round(nghe.luong * bacLuong)
  const chiPhi = Math.round(nghe.chiPhi * tinhHeSoChiPhi(false, [], 1, xuatThan, bacLuong))
  const apLuc = apLucTheoBacLuong(bacLuong)
  const dauApLuc = apLuc > 0 ? '+' : apLuc < 0 ? '−' : ''
  const dichTuDo = nghiaVuNamDau(nghe, xuatThan, bacLuong)

  return (
    <div className="man-chon">
      <button className="nut-nho" onClick={() => setNgheDaChon(null)}>
        ◀️ Chọn lại nghề
      </button>
      <h1 className="tieu-de-lon" style={{ marginTop: 12 }}>
        {nghe.emoji} {nghe.ten}
      </h1>
      <p className="mo-ta">
        Xuất thân quyết định vốn liếng và gánh nặng bạn mang theo suốt ván. Bậc
        lương đổi tiền lấy áp lực — chọn cao thì thặng dư lớn hơn nhưng hạnh phúc
        hao mòn nhanh hơn mỗi năm.
      </p>

      <div className="muc">🌱 Xuất thân</div>
      {XUAT_THAN.map((x) => {
        const von = Math.round(luong * x.tyLeVonBanDau)
        const no = Math.round(luong * x.tyLeNoBanDau)
        const heSoChiPhiChu = `×${String(x.heSoChiPhiSong).replace('.', ',')}`
        return (
          <button
            key={x.id}
            className={`the-nghe${xuatThanId === x.id ? ' the-nghe-chon' : ''}`}
            onClick={() => setXuatThanId(x.id)}
          >
            <div className="the-nghe-dau">
              <span style={{ fontSize: 30 }}>{x.emoji}</span>
              <span className="the-nghe-ten">{x.ten}</span>
            </div>
            <p className="mo-ta" style={{ marginBottom: 10 }}>
              {x.moTa}
            </p>
            <div className="hang">
              <span className="hang-nhan">💰 Vốn ban đầu</span>
              <span className="hang-gia-tri duong">{dinhDangTien(von)}</span>
            </div>
            {no > 0 && (
              <div className="hang">
                <span className="hang-nhan">🧾 Nợ học phí</span>
                <span className="hang-gia-tri am">{dinhDangTien(no)}</span>
              </div>
            )}
            <div className="hang">
              <span className="hang-nhan">🏠 Chi phí sống</span>
              <span className="hang-gia-tri">{heSoChiPhiChu}</span>
            </div>
            {x.tyLePhungDuong > 0 && (
              <div className="hang">
                <span className="hang-nhan">👨‍👩‍👦 Gửi về quê</span>
                <span className="hang-gia-tri am">
                  {Math.round(x.tyLePhungDuong * 100)}% chi phí sinh hoạt tới tuổi{' '}
                  {x.phungDuongDenTuoi}
                </span>
              </div>
            )}
            {x.hanhPhucBanDau > 0 && (
              <div className="hang">
                <span className="hang-nhan">😊 Hạnh phúc khởi đầu</span>
                <span className="hang-gia-tri duong">+{x.hanhPhucBanDau} điểm</span>
              </div>
            )}
            <div className="hang">
              <span className="hang-nhan">👴 Bố mẹ có tích luỹ</span>
              <span className={`hang-gia-tri${x.boMeCoTichLuy ? ' duong' : ''}`}>
                {x.boMeCoTichLuy
                  ? 'Có — đỡ hơn hẳn nếu bố mẹ ngã bệnh'
                  : 'Không — bố mẹ ngã bệnh sẽ tốn kém hơn nhiều'}
              </span>
            </div>
          </button>
        )
      })}

      <div className="muc">💼 Bậc lương</div>
      <div className="hang-nut" style={{ flexWrap: 'wrap' }}>
        {CONFIG.xuatThan.bacLuong.map((bac) => (
          <button
            key={bac}
            className={`nut${bacLuong === bac ? ' nut-chinh' : ''}`}
            style={{ padding: '7px 0', flex: 1, fontSize: 13 }}
            onClick={() => setBacLuong(bac)}
          >
            ×{String(bac).replace('.', ',')}
          </button>
        ))}
      </div>

      <div className="the" style={{ marginTop: 12 }}>
        <div className="hang">
          <span className="hang-nhan">💰 Lương mỗi năm</span>
          <span className="hang-gia-tri">{dinhDangTien(luong)}</span>
        </div>
        <div className="hang">
          <span className="hang-nhan">🏠 Chi phí mỗi năm</span>
          <span className="hang-gia-tri am">{dinhDangTien(chiPhi)}</span>
        </div>
        <div className="hang">
          {/* Nhãn phải đổi theo DẤU: âm là áp lực thật (lương cao), dương là
           * nhẹ nhõm (lương thấp) — gán cứng "Áp lực" cho cả hai chiều từng
           * làm mặt lo lắng + chữ "áp lực" + số dương màu xanh chỏi nhau. */}
          <span className="hang-nhan">
            {apLuc < 0 ? '😰 Áp lực mỗi năm' : '😌 Thong thả mỗi năm'}
          </span>
          <span className={`hang-gia-tri${apLuc > 0 ? ' duong' : apLuc < 0 ? ' am' : ''}`}>
            {dauApLuc}
            {Math.abs(apLuc)} hạnh phúc
          </span>
        </div>
        <div className="hang">
          <span className="hang-nhan">🕊️ Tự do tài chính khi dòng tiền đạt</span>
          <span className="hang-gia-tri duong">{dinhDangTien(dichTuDo)}/năm</span>
        </div>
      </div>

      <button
        className="nut nut-chinh nut-rong"
        onClick={() => onChon(ngheDaChon, { xuatThanId, heSoLuongKhoiDiem: bacLuong })}
      >
        ▶️ Bắt đầu
      </button>
    </div>
  )
}

import { CONFIG } from '../game/config'
import { dongTienThuDong, mucTieuTuDo, tienDoTuDo } from '../game/engine'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { Action, GameState, SuKienLoai } from '../game/types'

const BIEU_TUONG_SU_KIEN: Record<SuKienLoai, string> = {
  lamPhat: '📈',
  omDau: '🏥',
  sinhCon: '👶',
  thuongTet: '🧧',
  canhBacKetQua: '🎲',
  ketHon: '💍',
  conVaoDaiHoc: '🎓',
  conTuLap: '🧳',
  lenChucOngBa: '👴',
  tuoiGia: '🍂',
  nghiHuu: '🌇',
  mungTho: '🎊',
  thangChuc: '🏆',
  thueThuNhap: '🧾',
  suCo: '🔧',
  banTaiSan: '📉',
  mocTaiSan: '🚩',
  vaChamGiaoThong: '💥',
  xeHongNang: '🔧',
  matTromXe: '🕵️',
  phatThieuBaoHiemXe: '👮',
  kietSuc: '😔',
  triLieu: '🧘',
  suKienKetQua: '🎪',
  chuKyKinhTe: '🌐',
  bienCoLon: '⚡',
  thanhLyDoanhNghiep: '🏷️',
  phaSan: '💀',
  doanhNghiepPhaSan: '🏚️',
  baoLanh: '🤝',
}

export default function TongKetModal({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  const tk = state.tongKet
  if (!tk) return null
  const tienDo = tienDoTuDo(state)
  const dongTien = dongTienThuDong(state)
  const canCo = mucTieuTuDo(state)
  /** chỉ những kênh người chơi đang thật sự nắm giữ mới là danh mục của họ */
  const danhMucDangNamGiu = tk.bienDongTaiSan.filter((l) => l.dangNamGiu)
  const tongThuNhapDoanhNghiep = tk.thuNhapDoanhNghiep.reduce(
    (tong, d) => tong + d.soTien,
    0,
  )

  return (
    <div className="lop-phu">
      <div className="modal">
        <h2 className="modal-tieu-de">📋 Tổng kết năm {tk.nam}</h2>

        {tk.thiTruongSau !== tk.thiTruongTruoc && (
          <div className={`bang-chu-ky ${tk.thiTruongSau}`}>
            {CONFIG.thiTruong.icon[tk.thiTruongSau]} Kinh tế chuyển từ{' '}
            {CONFIG.thiTruong.ten[tk.thiTruongTruoc].toLowerCase()} sang{' '}
            {CONFIG.thiTruong.ten[tk.thiTruongSau].toLowerCase()}
          </div>
        )}

        <div className="the">
          <div className="hang">
            <span className="hang-nhan">Tổng tài sản</span>
            {/* Màu phải hỏi dấu. Lớp `duong` gán cứng là sai: tổng tài sản ÂM
              * được thật — engine chỉ tuyên phá sản khi thâm hụt vượt cả năm chi
              * phí, còn dưới mức đó thì bắn sự kiện "Túng thiếu" và để nguyên
              * tiền mặt âm. Những năm đầu ván chưa có tài sản nào để bán nên tổng
              * âm là chuyện thường. Khi ấy bảng này in "Túng thiếu" ở mục sự kiện
              * mà ngay phía trên lại là "−12 triệu" màu xanh lá. */}
            <span className={`hang-gia-tri ${tk.tongTaiSan < 0 ? 'am' : 'duong'}`}>
              {dinhDangTien(tk.tongTaiSan)}
            </span>
          </div>
          <div className="hang">
            <span className="hang-nhan">🕊️ Dòng tiền thụ động trên mức cần đạt</span>
            {/* `hang-gia-tri-dai` chứ không `hang-gia-tri`: hai con số tiền ghép
              * bằng chữ "trên" thì `nowrap` của lớp kia làm ô không co được, và
              * modal mọc thanh cuộn ngang trên màn hẹp. */}
            <span className="hang-gia-tri-dai">
              {dinhDangTien(dongTien)} trên {dinhDangTien(canCo)}
            </span>
          </div>
          <div className="thanh-tien-do" style={{ margin: '10px 0 0' }}>
            <div style={{ width: `${tienDo * 100}%` }} />
          </div>
          <div className="tien-do-chu" style={{ margin: '6px 0 0' }}>
            {(tienDo * 100).toFixed(1).replace('.', ',')}% chặng đường tự do tài chính
          </div>
        </div>

        <div className="muc">💰 Thu nhập</div>
        <div className="the">
          <div className="hang">
            <span className="hang-nhan">
              {state.daNghiHuu ? 'Lương hưu năm tới' : 'Lương năm tới'}
            </span>
            <span className="hang-gia-tri">
              {dinhDangTien(tk.luong)}{' '}
              <span className={tk.tangLuong >= 0 ? 'duong' : 'am'}>
                {dinhDangPhanTram(tk.tangLuong)}
              </span>
            </span>
          </div>
          {tk.thuNhapThuDong > 0 && (
            <div className="hang">
              <span className="hang-nhan">Thu nhập thụ động</span>
              <span className="hang-gia-tri duong">
                {dinhDangTien(tk.thuNhapThuDong)}
              </span>
            </div>
          )}
          {tk.thuNhapBanDoi > 0 && (
            <div className="hang">
              <span className="hang-nhan">Thu nhập của bạn đời</span>
              <span className="hang-gia-tri duong">
                {dinhDangTien(tk.thuNhapBanDoi)}
              </span>
            </div>
          )}
        </div>

        {tk.thuNhapDoanhNghiep.length > 0 && (
          <>
            <div className="muc">🏪 Doanh nghiệp năm nay</div>
            <div className="the">
              {tk.thuNhapDoanhNghiep.map((d, i) => (
                <div className="hang" key={`${d.coHoiId}-${i}`}>
                  <span className="hang-nhan">{d.ten}</span>
                  <span className="hang-gia-tri">
                    <span className="duong">{dinhDangTien(d.soTien)}</span>{' '}
                    <span className={d.bienDong >= 0 ? 'duong' : 'am'}>
                      {dinhDangPhanTram(d.bienDong)}
                    </span>
                  </span>
                </div>
              ))}
              <div className="hang">
                <span className="hang-nhan">
                  <strong>Tổng cộng</strong>
                </span>
                <span className="hang-gia-tri duong">
                  {dinhDangTien(tongThuNhapDoanhNghiep)}
                </span>
              </div>
            </div>
          </>
        )}

        {danhMucDangNamGiu.length > 0 && (
          <>
            <div className="muc">📊 Danh mục đầu tư</div>
            <div className="the">
              {danhMucDangNamGiu.map((l) => (
                <div className="hang" key={l.id}>
                  <span className="hang-nhan">{l.ten}</span>
                  <span className="hang-gia-tri">
                    <span className={l.bienDong >= 0 ? 'duong' : 'am'}>
                      {dinhDangPhanTram(l.bienDong)}
                    </span>
                    {l.loiTuc > 0 && (
                      <span className="duong"> · +{dinhDangTien(l.loiTuc)}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="muc">🌐 Thị trường năm nay</div>
        <div className="the">
          {tk.bienDongTaiSan.map((l) => (
            <div className="hang" key={l.id}>
              <span className="hang-nhan">{l.ten}</span>
              <span
                className={`hang-gia-tri ${l.bienDong >= 0 ? 'duong' : 'am'}`}
              >
                {dinhDangPhanTram(l.bienDong)}
              </span>
            </div>
          ))}
          <p className="mo-ta" style={{ margin: '10px 0 0' }}>
            Đây chỉ là tin thị trường để bạn cân nhắc mua vào, không phải kết quả đầu
            tư của bạn.
          </p>
        </div>

        <div className="muc">😊 Hạnh phúc</div>
        <div className="the">
          {tk.phatKhatVong > 0 && (
            <div className="hang">
              <span className="hang-nhan">Chưa đạt khát vọng</span>
              <span className="hang-gia-tri am">−{tk.phatKhatVong}</span>
            </div>
          )}
          {tk.hanhPhucTuUocNguyen > 0 && (
            <div className="hang">
              <span className="hang-nhan">Từ các món ước nguyện</span>
              <span className="hang-gia-tri duong">+{tk.hanhPhucTuUocNguyen}</span>
            </div>
          )}
          <div className="hang">
            <span className="hang-nhan">Hiện tại</span>
            <span className="hang-gia-tri">{state.hanhPhuc}</span>
          </div>
        </div>

        <div className="muc">📰 Sự kiện</div>
        {tk.suKien.map((sk, i) => (
          <div className="su-kien" key={i}>
            <div className="su-kien-tieu-de">
              {BIEU_TUONG_SU_KIEN[sk.loai]} {sk.tieuDe}
              {sk.tienThayDoi !== 0 && (
                <span className={sk.tienThayDoi > 0 ? ' duong' : ' am'}>
                  {' '}
                  {sk.tienThayDoi > 0 ? '+' : '−'}
                  {dinhDangTien(Math.abs(sk.tienThayDoi))}
                </span>
              )}
              {sk.hanhPhucThayDoi !== 0 && (
                <span className={sk.hanhPhucThayDoi > 0 ? ' duong' : ' am'}>
                  {' '}
                  {sk.hanhPhucThayDoi > 0 ? '+' : ''}
                  {sk.hanhPhucThayDoi} hạnh phúc
                </span>
              )}
            </div>
            <div className="su-kien-mo-ta">{sk.moTa}</div>
          </div>
        ))}

        <p className="ghi-chu-luu">
          💾 Ván chơi đã được lưu tự động trên máy của bạn.
        </p>
        <button
          className="nut nut-chinh nut-rong"
          onClick={() => dispatch({ type: 'dongTongKet' })}
        >
          {state.trangThai !== 'dangChoi' ? 'Xem kết quả' : `Bắt đầu năm ${state.nam}`}
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { CONFIG } from '../game/config'
import { timCoHoi, timNghe } from '../game/content'
import {
  bienDoThuNhapThuDong,
  dangCamCoHoi,
  giaThucTe,
  heSoBaoHoa,
  quyMoToiDa,
  taiSanRong,
  thuNhapNenNamNay,
  thuNhapThuDong,
} from '../game/engine'
import { dinhDangPhanTram, dinhDangTien } from '../game/format'
import type { Action, DoanhNghiep, GameState } from '../game/types'

/** "−20% … +24%" — biên độ dao động thu nhập của một cơ hội kinh doanh. */
function daoDong(min: number | undefined, max: number | undefined): string {
  return `${dinhDangPhanTram(min ?? 0, 0)} … ${dinhDangPhanTram(max ?? 0, 0)}`
}

export default function TabKinhDoanh({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  /** Bậc quy mô đang chọn cho từng cơ hội, ánh xạ theo id; mặc định 1 suất. */
  const [quyMoDaChon, setQuyMoDaChon] = useState<Record<string, number>>({})
  const datQuyMo = (coHoiId: string, bac: number) =>
    setQuyMoDaChon((truoc) => ({ ...truoc, [coHoiId]: bac }))

  /** Gộp các doanh nghiệp trùng cơ hội VÀ trùng năm góp vốn: hiển thị "Tên ×N" +
   * tổng thu nhập nhóm. Phải khoá thêm theo `namGop` vì mức bão hoà (v1.7, Task 6)
   * tính theo tuổi doanh nghiệp — gộp hai suất góp vốn khác năm vào một hàng sẽ
   * chỉ hiện được một hệ số bão hoà, sai với suất còn lại.
   *
   * Thu nhập nền năm nay dùng đúng `thuNhapNenNamNay` của engine (đã nhân cả lạm
   * phát lẫn hệ số bão hoà) — bản trước tự tính lại công thức lạm phát ở đây và bỏ
   * sót hệ số bão hoà, khiến bảng hiện thu nhập cao hơn số tiền engine thực trả. */
  const nhomDoanhNghiep: {
    coHoiId: string
    namGop: number
    ten: string
    soLuong: number
    tongThuNhapNen: number
    dTieuBieu: DoanhNghiep
  }[] = []
  for (const d of state.doanhNghiep) {
    const nenNamNay = thuNhapNenNamNay(state, d)
    const daCo = nhomDoanhNghiep.find(
      (n) => n.coHoiId === d.coHoiId && n.namGop === d.namGop,
    )
    if (daCo) {
      daCo.soLuong += 1
      daCo.tongThuNhapNen += nenNamNay
    } else {
      nhomDoanhNghiep.push({
        coHoiId: d.coHoiId,
        namGop: d.namGop,
        ten: d.ten,
        soLuong: 1,
        tongThuNhapNen: nenNamNay,
        dTieuBieu: d,
      })
    }
  }

  const tongNen = thuNhapThuDong(state)
  const bienDo = bienDoThuNhapThuDong(state)

  return (
    <>
      <div className="muc">💼 Cơ hội năm nay</div>
      {state.coHoiNamNay.length === 0 && (
        <div className="the">
          {dangCamCoHoi(state) ? (
            <div className="canh-bao-tu-choi" style={{ margin: 0 }}>
              🚫 Sau phá sản, còn {state.camCoHoiDenNam - state.nam + 1} năm nữa
              mới có cơ hội kinh doanh mới.
            </div>
          ) : (
            <p className="mo-ta" style={{ margin: 0 }}>
              Năm nay không còn cơ hội nào. Sang năm sẽ có lời mời mới.
            </p>
          )}
        </div>
      )}

      {state.coHoiNamNay.map((c) => {
        const gia = giaThucTe(state, c.gia)
        const nghe = c.ngheId ? timNghe(c.ngheId) : undefined
        const laSuKien = c.loai === 'toChucSuKien'
        const laCanhBac = c.loai === 'canhBac'

        // Canh bạc giữ nguyên một suất — thanh trượt quy mô chỉ có ý nghĩa với
        // cơ hội kinh doanh và tổ chức sự kiện, nơi người chơi thật sự bỏ vốn.
        const tran = laCanhBac ? 1 : quyMoToiDa(state, c)
        const bacChoPhep = laCanhBac
          ? []
          : CONFIG.quyMoGopVon.bac.filter((b) => b <= tran)
        // Kẹp bậc đã chọn về trần HIỆN TẠI: nhận một thẻ khác trong cùng năm có
        // thể làm tiền mặt giảm và trần của thẻ này co lại theo — nếu không kẹp
        // ở đây thì quy mô cũ (ví dụ 12×) vẫn đứng yên trong khi trần đã tụt
        // xuống 1×, nút hiện "Không đủ vốn" dù người chơi thừa sức mua 1 suất.
        const quyMo = laCanhBac ? 1 : Math.min(quyMoDaChon[c.id] ?? 1, tran)
        const von = gia * quyMo
        const thuNhapTheoQuyMo = giaThucTe(state, c.thuNhapMoiNam ?? 0) * quyMo
        const taiSanRongHienTai = taiSanRong(state)
        // Tài sản ròng không dương thì tỉ lệ von/taiSanRong không còn nghĩa —
        // đừng bịa ra một con số (bản cũ gán cứng 1 = "100%"). Đúng như engine
        // đọc (`taiSanRong(s)` được kẹp về tối thiểu 1 trong biến cố doanh
        // nghiệp đóng cửa), đây luôn là ca rủi ro tập trung cao nhất.
        const tyTrong = taiSanRongHienTai > 0 ? von / taiSanRongHienTai : null
        const tapTrungCao =
          tyTrong === null || tyTrong > CONFIG.quyMoGopVon.nguongCanhBaoTapTrung
        const duTien = tran > 0 && state.tienMat >= von
        return (
          <div className="the-quyet-dinh" key={c.id}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{c.emoji}</div>
            <div className="the-ten">
              {c.ten}
              {nghe && (
                <span className="nhan-nho">
                  {nghe.emoji} Riêng nghề {nghe.ten}
                </span>
              )}
            </div>
            <p className="mo-ta">{c.moTa}</p>
            {c.chiMotLan && (
              <p className="mo-ta" style={{ marginTop: -6 }}>
                🎯 Chỉ tham gia được một lần trong cả ván.
              </p>
            )}

            <div className="hang">
              <span className="hang-nhan">Vốn một suất</span>
              <span className="hang-gia-tri am">{dinhDangTien(gia)}</span>
            </div>

            {c.loai === 'canhBac' && (
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
            )}

            {c.loai === 'kinhDoanh' && (
              <>
                <div className="hang">
                  <span className="hang-nhan">Thu nhập một suất mỗi năm</span>
                  <span className="hang-gia-tri-dai duong">
                    {dinhDangTien(giaThucTe(state, c.thuNhapMoiNam ?? 0))}{' '}
                    <span className="chu-phu">
                      · dao động{' '}
                      {daoDong(c.bienDongThuNhapMin, c.bienDongThuNhapMax)}
                    </span>
                  </span>
                </div>
                <div className="hang">
                  <span className="hang-nhan">Hoàn vốn sau</span>
                  <span className="hang-gia-tri">
                    {(c.gia / (c.thuNhapMoiNam || 1) || 0)
                      .toFixed(1)
                      .replace('.', ',')}{' '}
                    năm
                  </span>
                </div>
                <p className="mo-ta" style={{ marginTop: 12, marginBottom: 0 }}>
                  📈 Thu nhập bám theo lạm phát nên không teo dần theo thời gian; mỗi
                  năm nhận nhiều hay ít là do biên độ dao động ở trên.
                </p>
              </>
            )}

            {laSuKien && (
              <>
                <div className="hang">
                  <span className="hang-nhan">Lợi nhuận</span>
                  <span className="hang-gia-tri-dai">
                    {daoDong(c.loiNhuanMin, c.loiNhuanMax)}{' '}
                    <span className="chu-phu">
                      · nhận lại {dinhDangTien(gia * (1 + (c.loiNhuanMin ?? 0)))} …{' '}
                      {dinhDangTien(gia * (1 + (c.loiNhuanMax ?? 0)))}
                    </span>
                  </span>
                </div>
                <div className="canh-bao-tu-choi" style={{ marginTop: 12 }}>
                  🎪 Nhận lại vốn cộng lợi nhuận đúng <strong>một lần</strong> vào cuối
                  năm rồi kết thúc — không có thu nhập các năm sau.
                </div>
              </>
            )}

            {!laCanhBac && tran === 0 && (
              <div className="canh-bao-tu-choi" style={{ marginTop: 12 }}>
                💸 Chưa đủ tiền cho một suất.
              </div>
            )}

            {bacChoPhep.length > 0 && (
              <div className="quy-mo">
                <div className="quy-mo-nhan">📐 Quy mô góp vốn</div>
                <div className="quy-mo-bac">
                  {bacChoPhep.map((b) => (
                    <button
                      key={b}
                      className={`nut-bac${quyMo === b ? ' hoat-dong' : ''}`}
                      onClick={() => datQuyMo(c.id, b)}
                    >
                      {b}×
                    </button>
                  ))}
                </div>
                <div className="hang">
                  <span className="hang-nhan">💰 Tổng vốn phải bỏ</span>
                  <span className="hang-gia-tri am">{dinhDangTien(von)}</span>
                </div>
                {c.loai === 'kinhDoanh' && (
                  <div className="hang">
                    <span className="hang-nhan">📈 Tổng thu nhập mỗi năm</span>
                    <span className="hang-gia-tri duong">
                      {dinhDangTien(thuNhapTheoQuyMo)}
                    </span>
                  </div>
                )}
                <div className="hang">
                  <span className="hang-nhan">🧮 Tỉ trọng trên tài sản ròng</span>
                  <span className={`hang-gia-tri${tapTrungCao ? ' am' : ''}`}>
                    {tyTrong === null
                      ? '⚠️ Tài sản ròng không dương — rủi ro tập trung cao nhất'
                      : `${(tyTrong * 100).toFixed(0)}%${tapTrungCao ? ' ⚠️ tập trung cao' : ''}`}
                  </span>
                </div>
              </div>
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
                  dispatch({
                    type: 'quyetDinhCoHoi',
                    coHoiId: c.id,
                    nhan: true,
                    heSoQuyMo: quyMo,
                  })
                }
              >
                {!duTien ? 'Không đủ vốn' : laSuKien ? 'Nhận tổ chức' : 'Tham gia'}
              </button>
            </div>
          </div>
        )
      })}

      {state.khoanDangCho.length > 0 && (
        <>
          <div className="muc">⏳ Đang chờ kết quả</div>
          {state.khoanDangCho.map((k, i) => {
            const c = timCoHoi(k.coHoiId)
            const laCanhBac = k.loai === 'canhBac'
            return (
              <div className="muc-mua" key={`${k.coHoiId}-${i}`}>
                <span className="muc-mua-emoji">
                  {c?.emoji ?? (laCanhBac ? '🎲' : '🎪')}
                </span>
                <div className="muc-mua-than">
                  <div className="muc-mua-ten">{c?.ten ?? k.coHoiId}</div>
                  <div className="muc-mua-phu">
                    {laCanhBac
                      ? `Đã đặt ${dinhDangTien(k.gia)} — mở kết quả ăn thua vào cuối năm`
                      : `Đã bỏ ra ${dinhDangTien(k.gia)} tiền vốn — thu lại vốn và lợi nhuận vào cuối năm`}
                  </div>
                </div>
              </div>
            )
          })}
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
        <>
          <div className="the">
            <div className="hang">
              <span className="hang-nhan">Thu nhập thụ động năm nay</span>
              <span className="hang-gia-tri duong">{dinhDangTien(tongNen)}</span>
            </div>
            <div className="hang">
              <span className="hang-nhan">Tuỳ năm, có thể nhận trong khoảng</span>
              <span className="hang-gia-tri-dai">
                {dinhDangTien(bienDo.thap)} … {dinhDangTien(bienDo.cao)}
              </span>
            </div>
          </div>
          {nhomDoanhNghiep.map((n) => {
            const c = timCoHoi(n.coHoiId)
            const baoHoa = heSoBaoHoa(state, n.dTieuBieu)
            // Ngưỡng 80% chỉ để GỢI Ý người chơi cân nhắc, không khoá tính năng
            // nào — khớp đúng ngưỡng ví dụ trong đặc tả Task 14.
            const baoHoaThap = baoHoa < 0.8
            return (
              <div className="muc-mua" key={`${n.coHoiId}-${n.namGop}`}>
                <span className="muc-mua-emoji">{c?.emoji ?? '💼'}</span>
                <div className="muc-mua-than">
                  <div className="muc-mua-ten">
                    {n.ten}
                    {n.soLuong > 1 && ` ×${n.soLuong}`}
                  </div>
                  <div className="muc-mua-phu">
                    {dinhDangTien(n.tongThuNhapNen)} mỗi năm · dao động{' '}
                    {daoDong(c?.bienDongThuNhapMin, c?.bienDongThuNhapMax)}
                  </div>
                  <span className={`bao-hoa${baoHoaThap ? ' bao-hoa-thap' : ''}`}>
                    ⏳ Thu nhập còn {Math.round(baoHoa * 100)}% so với ngày đầu
                    {baoHoaThap && ' — cân nhắc gây dựng thêm chỗ mới'}
                  </span>
                </div>
              </div>
            )
          })}
        </>
      )}
    </>
  )
}

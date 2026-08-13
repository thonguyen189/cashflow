import { useState } from 'react'
import { TAI_SAN } from '../game/content'
import { muaToiDa } from '../game/engine'
import { dinhDangTien, dinhDangPhanTram } from '../game/format'
import type { Action, AssetId, GameState, TaiSan } from '../game/types'

function BieuDo({ dulieu }: { dulieu: number[] }) {
  if (dulieu.length < 2) return null
  const min = Math.min(...dulieu)
  const max = Math.max(...dulieu)
  const bien = max - min || 1
  const toaDo = dulieu.map((v, i) => {
    const x = (i / (dulieu.length - 1)) * 100
    const y = 96 - ((v - min) / bien) * 92
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const diem = toaDo.join(' ')
  const len = dulieu.length
  // Màu lấy theo bước đi của NĂM VỪA RỒI, không theo chênh lệch hai đầu cửa sổ.
  //
  // Cách cũ so điểm cuối với điểm đầu của cửa sổ mười lăm năm. Với mô hình giá
  // v1.8, giá đi lên dài hạn nhưng sập sâu theo chu kỳ, nên trong những năm giá
  // sập từ 20% trở lên biểu đồ VẪN TÔ XANH ở 96–99% số lần: người chơi vừa mất
  // hai phần ba tài sản, mở tab lên thấy một đường xanh đi lên. Màu giờ khớp đúng
  // con số phần trăm nằm ngay bên trên nó.
  const tang = (dulieu[len - 1] ?? 0) >= (dulieu[len - 2] ?? 0)
  const mau = tang ? 'var(--xanh)' : 'var(--do)'
  return (
    <svg className="bieu-do" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points={`0,100 ${diem} 100,100`} fill={mau} opacity={0.12} />
      <polyline
        points={diem}
        fill="none"
        stroke={mau}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TheTaiSan({
  ts,
  state,
  dispatch,
}: {
  ts: TaiSan
  state: GameState
  dispatch: (a: Action) => void
}) {
  const [muaSo, setMuaSo] = useState(0)
  const [banSo, setBanSo] = useState(0)

  const gia = state.giaTaiSan[ts.id]
  const dangCo = state.soHuu[ts.id]
  const toiDa = muaToiDa(state, ts.id)
  const lichSu = state.lichSuGia[ts.id] ?? []
  // So với NĂM NGOÁI, không phải so với đầu cửa sổ lịch sử.
  //
  // Cách cũ lấy `lichSu[0]` làm mốc, mà `lichSuGia` là cửa sổ TRƯỢT mười lăm năm
  // (`.slice(-15)` trong engine) nên mẫu số ấy tự đi mỗi năm. Ba hệ quả đo được:
  // trung vị của con số hiển thị là +390% với cổ phiếu; nó ĐI XUỐNG trong 30% số
  // năm giá ĐI LÊN — người chơi đọc ra là lỗi phần mềm; và vì đây là con số phần
  // trăm duy nhất trên tab đầu tư, ai cũng đọc nó thành lãi của chính mình, kể cả
  // khi vừa mua xong và vừa lỗ nặng.
  //
  // Biến động một năm là thứ khớp với bảng tổng kết cuối năm và là cách đọc tự
  // nhiên của một con số đứng cạnh giá. Nhãn "so với năm ngoái" ở dưới nói rõ mốc
  // — con số cũ không có nhãn nào cả.
  const giaTruoc = lichSu[lichSu.length - 2] ?? gia
  const thayDoi = giaTruoc > 0 ? gia / giaTruoc - 1 : 0

  const muaThuc = Math.min(muaSo, toiDa)
  const banThuc = Math.min(banSo, dangCo)

  return (
    <div className="the">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{ts.emoji}</span>
        <div style={{ flex: 1 }}>
          <div className="the-tieu-de" style={{ marginBottom: 0 }}>
            {ts.ten}
          </div>
          <div className="muc-mua-phu">
            {dinhDangTien(gia)} / {ts.donViTen}{' '}
            <span className={thayDoi >= 0 ? 'duong' : 'am'}>
              {dinhDangPhanTram(thayDoi)}
            </span>{' '}
            so với năm ngoái
          </div>
        </div>
      </div>

      <p className="mo-ta" style={{ margin: '10px 0 0' }}>
        {ts.moTa}
      </p>

      <BieuDo dulieu={lichSu} />

      <div className="hang">
        <span className="hang-nhan">Đang nắm giữ</span>
        <span className="hang-gia-tri">
          {dangCo > 0
            ? `${dangCo.toLocaleString('vi-VN')} ${ts.donViTen} · ${dinhDangTien(
                dangCo * gia,
              )}`
            : '—'}
        </span>
      </div>

      {toiDa > 0 ? (
        <>
          <div className="o-so-luong">
            <input
              type="range"
              min={0}
              max={toiDa}
              value={muaThuc}
              onChange={(e) => setMuaSo(Number(e.target.value))}
            />
            <span className="so-luong-chu">
              {muaThuc.toLocaleString('vi-VN')} {ts.donViTen}
            </span>
          </div>
          <button
            className="nut nut-chinh nut-rong"
            disabled={muaThuc <= 0}
            onClick={() => {
              dispatch({ type: 'dauTu', assetId: ts.id, soDonVi: muaThuc })
              setMuaSo(0)
            }}
          >
            Mua {dinhDangTien(muaThuc * gia)}
          </button>
        </>
      ) : (
        <p className="mo-ta" style={{ margin: '10px 0 0' }}>
          Chưa đủ tiền mua một {ts.donViTen}. Cần ít nhất {dinhDangTien(gia)}.
        </p>
      )}

      {dangCo > 0 && (
        <>
          <div className="o-so-luong">
            <input
              type="range"
              min={0}
              max={dangCo}
              value={banThuc}
              onChange={(e) => setBanSo(Number(e.target.value))}
            />
            <span className="so-luong-chu">
              {banThuc.toLocaleString('vi-VN')} {ts.donViTen}
            </span>
          </div>
          <button
            className="nut nut-rong"
            disabled={banThuc <= 0}
            onClick={() => {
              dispatch({ type: 'ban', assetId: ts.id, soDonVi: banThuc })
              setBanSo(0)
            }}
          >
            Bán {dinhDangTien(banThuc * gia)}
          </button>
        </>
      )}
    </div>
  )
}

export default function TabDauTu({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (a: Action) => void
}) {
  // Cổng mở khoá phải đọc giá HIỆN TẠI. `ts.giaDonVi` là giá năm 1 và nó đứng yên
  // suốt ván, trong khi dòng "Cần ... cho một ..." ngay bên dưới lại in giá hiện
  // tại — hai con số khác nhau, và tới v1.8 chúng tách xa nhau thật sự.
  //
  // Mô hình giá mới cho phép giá nằm DƯỚI mốc năm 1 nhiều năm liền: đo được tiền
  // mã hoá 5,7% số năm, có đợt kéo dài tới 15 năm. Dùng `giaDonVi` khi ấy sinh ra
  // đúng một lời tự mâu thuẫn trên màn hình — thẻ bị xếp vào mục "Chưa mở khoá"
  // mà lại ghi "Cần 120 triệu" trong lúc người chơi đang cầm 150 triệu. Tệ hơn
  // nữa, nó khoá cửa đúng vào lúc giá rẻ, tức chặn ngay nước đi mà cả mô hình mới
  // dựng lên để thưởng (xem `biendong-dau-tu.test.ts`, "mua lúc rẻ phải được
  // thưởng"). Lưu ý `engine.ts` cũng có một hàm TÊN LÀ `giaDonVi(s, id)` nhưng nó
  // trả giá hiện tại — chính sự trùng tên này làm cái bẫy dễ sập.
  const moKhoa = TAI_SAN.filter(
    (t) => state.tienMat >= state.giaTaiSan[t.id] || state.soHuu[t.id] > 0,
  )
  const chuaMo = TAI_SAN.filter((t) => !moKhoa.includes(t))

  return (
    <>
      <div className="muc">📊 Danh mục đầu tư</div>
      {moKhoa.map((ts) => (
        <TheTaiSan key={ts.id} ts={ts} state={state} dispatch={dispatch} />
      ))}

      {chuaMo.length > 0 && (
        <>
          <div className="muc">🔒 Chưa mở khoá</div>
          {chuaMo.map((ts) => (
            <div className="muc-mua the-da-mua" key={ts.id}>
              <span className="muc-mua-emoji">🔒</span>
              <div className="muc-mua-than">
                <div className="muc-mua-ten">
                  {ts.emoji} {ts.ten}
                </div>
                <div className="muc-mua-phu">
                  Cần {dinhDangTien(state.giaTaiSan[ts.id as AssetId])} cho một{' '}
                  {ts.donViTen}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

import { CONFIG } from './config'
import { TAI_SAN, timUocNguyen } from './content'
import {
  THIET_LAP_MAC_DINH,
  daToiUuChiPhi,
  dangCoBaoHiem,
  dangCoBaoHiemXe,
  dangTriLieu,
  dongTienThuDong,
  giaThucTe,
  giaUocNguyen,
  khoaHocConLai,
  muaToiDa,
  mucTieuTuDo,
  phiBaoHiem,
  phiBaoHiemXe,
  phiChuyenGiaTaiChinh,
  phiChuyenGiaTamLy,
  reducer,
  taoGameMoi,
  tongTaiSan,
  xeDangCo,
} from './engine'
import type { LoaiBaoHiemXe, ThietLapNhanVat } from './types'

export interface KetQuaSim {
  thang: boolean
  soNam: number
  tongTaiSan: number
  /** dòng tiền thụ động và nghĩa vụ ở thời điểm ván khép lại */
  dongTienThuDong: number
  nghiaVu: number
  hanhPhucCuoi: number
  lyDo: string
}

export interface ChienLuoc {
  /** nhận thẻ nếu chi phí mỗi điểm hạnh phúc thấp hơn ngưỡng này */
  nguongMoiDiem: number
  /** giữ lại bao nhiêu tiền mặt phòng thân trước khi đem đi đầu tư */
  duPhongTheoChiPhi: number
  /** ưu tiên đầu tư theo thứ tự này */
  uuTienTaiSan: readonly string[]
  muaBaoHiem: boolean
  /**
   * Những loại bảo hiểm xe bot chịu mua khi trong tay đã có xe. Để thành danh
   * sách chứ không phải một công tắc chung, vì mỗi loại có kỳ vọng khác hẳn
   * nhau: loại bắt buộc cố ý lãi đậm, hai loại tự nguyện cố ý lỗ nhẹ. Bật tắt
   * cả cụm thì hai chiều triệt tiêu nhau và không đo được gì.
   */
  muaBaoHiemXe: readonly LoaiBaoHiemXe[]
  muaGiaoDuc: boolean
  muaUocNguyen: boolean
  /** thuê chuyên gia tâm lý mỗi khi hạnh phúc rơi xuống dưới ngưỡng cảnh báo */
  thueChuyenGiaTamLy: boolean
  /** thuê chuyên gia hoạch định tài chính ngay khi đủ tiền */
  thueChuyenGiaTaiChinh: boolean
  nhanCoHoiKinhDoanh: boolean
  nhanCanhBac: boolean
  /** nhận cơ hội tổ chức sự kiện — kỳ vọng dương, mở kết quả ngay cuối năm */
  nhanToChucSuKien: boolean
}

export const CHIEN_LUOC_CAN_BANG: ChienLuoc = {
  nguongMoiDiem: 1_500_000,
  duPhongTheoChiPhi: 0.5,
  // Điều kiện thắng là dòng tiền, nên bot cân bằng bỏ hẳn vàng — tăng giá tốt
  // nhưng lợi tức bằng 0, không đưa người chơi tới gần tự do tài chính chút nào.
  uuTienTaiSan: ['batDongSan', 'coPhieu', 'traiPhieu'],
  muaBaoHiem: true,
  muaBaoHiemXe: ['trachNhiemDanSu', 'vatChatXe', 'taiNanNguoiTrenXe'],
  muaGiaoDuc: true,
  muaUocNguyen: true,
  thueChuyenGiaTamLy: true,
  thueChuyenGiaTaiChinh: true,
  nhanCoHoiKinhDoanh: true,
  nhanCanhBac: false,
  nhanToChucSuKien: true,
}

/**
 * Thứ tự mua bảo hiểm xe: trách nhiệm dân sự trước vì rẻ nhất và là loại bắt
 * buộc, rồi tới vật chất xe — loại duy nhất chặn được cú mất trộm xoá luôn món
 * ước nguyện — cuối cùng mới tới tai nạn người ngồi trên xe.
 */
const THU_TU_BAO_HIEM_XE: readonly LoaiBaoHiemXe[] = [
  'trachNhiemDanSu',
  'vatChatXe',
  'taiNanNguoiTrenXe',
]

/**
 * Bot chơi một ván trọn vẹn theo chiến lược cho trước.
 * Dùng để kiểm tra game có thắng được không và mất bao nhiêu năm.
 */
export function moPhongMotVan(
  ngheId: string,
  seed: number,
  cl: ChienLuoc = CHIEN_LUOC_CAN_BANG,
  thietLap: ThietLapNhanVat = THIET_LAP_MAC_DINH,
): KetQuaSim {
  let s = taoGameMoi(ngheId, seed, thietLap)
  let baoVe = 0

  while (s.trangThai === 'dangChoi' && baoVe++ < 4000) {
    if (s.phase === 'tongKet') {
      s = reducer(s, { type: 'dongTongKet' })
      continue
    }

    if (s.phase === 'chiPhi') {
      s = reducer(s, { type: 'traChiPhi' })
      continue
    }

    if (s.phase === 'theBai') {
      const the = s.theConLai[0]!
      const gia = giaThucTe(s, the.gia)
      const moiDiem = gia / the.diem
      // Giữ hạnh phúc an toàn: dưới 65 thì nhận rộng tay hơn. Số 65 là vùng đệm CỐ Ý
      // nằm trên `hanhPhucNguongCanhBao` để bot phản ứng sớm hơn một nhịp so với lúc
      // game bắt đầu kể chuyện kiệt sức.
      //
      // `s.chiSoGia` phải nhân vào CẢ HAI nhánh: ngưỡng đo bằng tiền trên mỗi điểm
      // hạnh phúc, mà giá thẻ leo theo lạm phát. Chỉ nhân ở nhánh thường thì khi
      // `chiSoGia` vượt 4, nhánh "nới rộng tay" hoá ra chặt hơn nhánh thường — đúng
      // ngược lại ý định. Bộ số hiện tại chưa chạm vào ca đó, nhưng nới biên lạm
      // phát hay kéo dài ván chơi là nó bật lên.
      const nguong =
        (s.hanhPhuc < 65 ? cl.nguongMoiDiem * 4 : cl.nguongMoiDiem) * s.chiSoGia
      const nhan = moiDiem <= nguong && s.tienMat >= gia
      s = reducer(s, { type: 'quyetDinhThe', nhan })
      continue
    }

    // ---- giai đoạn tự do ----
    // 1. bảo hiểm trước, vì rẻ mà chặn được cú đau.
    // phiBaoHiem đã gồm lạm phát — không bọc thêm giaThucTe.
    if (cl.muaBaoHiem && !dangCoBaoHiem(s)) {
      const phi = phiBaoHiem(s)
      if (s.tienMat > phi * 3) {
        const sau = reducer(s, { type: 'muaBaoHiem' })
        if (sau !== s) {
          s = sau
          continue
        }
      }
    }

    // 2. bảo hiểm xe — chỉ khi đã có xe trong tay, mua dần từng loại còn thiếu.
    // phiBaoHiemXe đã gồm lạm phát nên tuyệt đối không bọc thêm giaThucTe.
    if (cl.muaBaoHiemXe.length > 0 && xeDangCo(s)) {
      let daMuaBaoHiemXe = false
      for (const loai of THU_TU_BAO_HIEM_XE) {
        if (!cl.muaBaoHiemXe.includes(loai)) continue
        if (dangCoBaoHiemXe(s, loai)) continue
        const phi = phiBaoHiemXe(s, loai)
        if (s.tienMat <= phi * 3) continue
        const sau = reducer(s, { type: 'muaBaoHiemXe', loai })
        if (sau !== s) {
          s = sau
          daMuaBaoHiemXe = true
          break
        }
      }
      if (daMuaBaoHiemXe) continue
    }

    // 3. chuyên gia tâm lý — chỉ gọi khi tinh thần đã rơi xuống vùng cảnh báo.
    // Không đòi khoản đệm gấp ba như bảo hiểm: đây là cấp cứu chứ không phải
    // khoản chi phòng xa, mà phí cũng chỉ bằng một phần tư chi phí sinh hoạt
    // (còn một nửa chừng ấy khi đang dưới ngưỡng), nên chờ đủ đệm là chờ chết.
    // phiChuyenGiaTamLy đã gồm lạm phát nên tuyệt đối không bọc thêm giaThucTe.
    if (
      cl.thueChuyenGiaTamLy &&
      s.hanhPhuc < CONFIG.hanhPhucNguongCanhBao &&
      !dangTriLieu(s)
    ) {
      const phi = phiChuyenGiaTamLy(s)
      if (s.tienMat >= phi) {
        const sau = reducer(s, { type: 'thueChuyenGiaTamLy' })
        if (sau !== s) {
          s = sau
          continue
        }
      }
    }

    // 4. chuyên gia hoạch định tài chính — một lần cho cả ván, càng sớm càng
    // lời vì tám phần trăm chi phí tiết kiệm được cộng dồn suốt phần đời còn
    // lại. Vẫn giữ khuôn thận trọng gấp ba lần phí: gói này đắt gấp gần năm lần
    // liệu trình, dốc sạch tiền mặt cho nó thì năm sau không còn gì để trả chi phí.
    if (cl.thueChuyenGiaTaiChinh && !daToiUuChiPhi(s)) {
      const phi = phiChuyenGiaTaiChinh(s)
      if (s.tienMat > phi * 3) {
        const sau = reducer(s, { type: 'thueChuyenGiaTaiChinh' })
        if (sau !== s) {
          s = sau
          continue
        }
      }
    }

    // 5. khát vọng, để cắt khoản phạt hạnh phúc hàng năm. Giá khoá thời trẻ,
    //    trừ khi món đó đã từng mất — khi ấy phải mua lại theo giá hiện hành.
    if (cl.muaUocNguyen && !s.uocNguyenDaMua.includes(s.khatVongId)) {
      const un = timUocNguyen(s.khatVongId)
      if (un) {
        const gia = giaUocNguyen(s, un.id)
        if (s.tienMat > gia * 1.5) {
          const sau = reducer(s, { type: 'muaUocNguyen', uocNguyenId: un.id })
          if (sau !== s) {
            s = sau
            continue
          }
        }
      }
    }

    // 6. học lên, ưu tiên bậc đắt nhất còn mua nổi
    if (cl.muaGiaoDuc) {
      const ungVien = [...khoaHocConLai(s)]
        .reverse()
        .find((k) => s.tienMat > giaThucTe(s, k.gia) * 2)
      if (ungVien) {
        const sau = reducer(s, { type: 'muaKhoaHoc', khoaHocId: ungVien.id })
        if (sau !== s) {
          s = sau
          continue
        }
      }
    }

    // 7. cơ hội: xử lý từng cái một, vòng lặp sẽ quay lại lo cái tiếp theo
    const coHoi = s.coHoiNamNay[0]
    if (coHoi) {
      const gia = giaThucTe(s, coHoi.gia)
      const chapNhanLoai =
        coHoi.loai === 'kinhDoanh'
          ? cl.nhanCoHoiKinhDoanh
          : coHoi.loai === 'toChucSuKien'
            ? cl.nhanToChucSuKien
            : cl.nhanCanhBac
      const muon = chapNhanLoai && s.tienMat > gia * 1.3
      s = reducer(s, { type: 'quyetDinhCoHoi', coHoiId: coHoi.id, nhan: muon })
      continue
    }

    // 8. đem phần dư đi đầu tư
    const duPhong = s.chiPhiHangNam * cl.duPhongTheoChiPhi
    const coTheDung = s.tienMat - duPhong
    if (coTheDung > 0) {
      let daMua = false
      for (const id of cl.uuTienTaiSan) {
        const ts = TAI_SAN.find((t) => t.id === id)
        if (!ts) continue
        const gia = s.giaTaiSan[ts.id]
        const soDonVi = Math.min(
          Math.floor(coTheDung / gia),
          muaToiDa(s, ts.id),
        )
        if (soDonVi > 0) {
          s = reducer(s, { type: 'dauTu', assetId: ts.id, soDonVi })
          daMua = true
          break
        }
      }
      if (daMua) continue
    }

    // 9. hết việc thì đóng năm
    s = reducer(s, { type: 'ketThucNam' })
  }

  return {
    thang: s.trangThai === 'thang',
    soNam: s.lichSu.length,
    tongTaiSan: tongTaiSan(s),
    dongTienThuDong: dongTienThuDong(s),
    nghiaVu: mucTieuTuDo(s),
    hanhPhucCuoi: s.hanhPhuc,
    lyDo: s.lyDoKetThuc ?? 'hết lượt mô phỏng',
  }
}

export function moPhongNhieuVan(
  ngheId: string,
  soVan: number,
  cl?: ChienLuoc,
  thietLap?: ThietLapNhanVat,
) {
  const kq: KetQuaSim[] = []
  for (let i = 0; i < soVan; i++) {
    kq.push(moPhongMotVan(ngheId, 1000 + i * 7919, cl, thietLap))
  }
  const thang = kq.filter((k) => k.thang)
  const thua = kq.filter((k) => !k.thang)
  return {
    soVan,
    tyLeThang: thang.length / soVan,
    soNamTrungBinhKhiThang: thang.length
      ? thang.reduce((t, k) => t + k.soNam, 0) / thang.length
      : NaN,
    soNamNhanhNhat: thang.length ? Math.min(...thang.map((k) => k.soNam)) : NaN,
    soNamChamNhat: thang.length ? Math.max(...thang.map((k) => k.soNam)) : NaN,
    taiSanTrungBinhKhiThua: thua.length
      ? thua.reduce((t, k) => t + k.tongTaiSan, 0) / thua.length
      : NaN,
    /** ván thua đi được bao xa trên chặng tự do tài chính — dùng để dò độ khó */
    tienDoTuDoTrungBinhKhiThua: thua.length
      ? thua.reduce((t, k) => t + (k.nghiaVu > 0 ? k.dongTienThuDong / k.nghiaVu : 1), 0) /
        thua.length
      : NaN,
    ketQua: kq,
  }
}

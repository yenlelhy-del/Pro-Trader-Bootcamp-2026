/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { Download, FileSpreadsheet, Check, Send, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExclusiveToolProps {
  isBrokerMode: boolean;
}

export default function ExclusiveTool({ isBrokerMode }: ExclusiveToolProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập Họ và Tên");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError("Vui lòng nhập Số điện thoại Zalo hợp lệ");
      return;
    }

    setError("");
    setIsSent(true);

    // Trigger the real CSV file download
    setTimeout(() => {
      triggerFileDownload();
      setTimeout(() => {
        setShowModal(false);
        setIsSent(false);
        setName("");
        setPhone("");
      }, 2000);
    }, 1200);
  };

  const triggerFileDownload = () => {
    const csvContent = isBrokerMode
      ? "\uFEFF" + // UTF-8 BOM
        "Mẫu Nhật Ký Giám Sát & Quản Trị Rủi Ro Broker - PKD6 Bootcamp 2026\n" +
        "Ngày giao dịch,Mã Cổ Phiếu,Loại Lệnh (BUY/SELL),Giá Khớp,Khối Lượng,Vốn Khách Hàng Phân Bổ (%),Cắt Lỗ (%),Chốt Lời (%),P&L Khách Hàng (%),Trạng Thái,Broker Phụ Trách\n" +
        "06/07/2026,FPT,BUY,135000,1000,40%,-4%,15%,+5.2%,Đạt chỉ tiêu,Nguyễn Tuấn Anh\n" +
        "06/07/2026,TCB,BUY,48000,2000,30%,-3%,10%,-1.5%,Đang theo dõi,Lê Minh Triết\n" :
        "\uFEFF" + // UTF-8 BOM
        "Mẫu Nhật Ký Giao Dịch & Quản Trị Rủi Ro - Pro Trader Bootcamp 2026\n" +
        "Ngày giao dịch,Mã Cổ Phiếu,Loại Lệnh (BUY/SELL),Giá Khớp,Khối Lượng,Vốn Phân Bổ (%),Cắt Lỗ (%),Chốt Lời (%),P&L Đạt Được (%),Trạng Thái\n" +
        "06/07/2026,FPT,BUY,135000,1000,40%,-4%,15%,+5.2%,Đạt chỉ tiêu\n" +
        "06/07/2026,TCB,BUY,48000,2000,30%,-3%,10%,-1.5%,Đang theo dõi\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", isBrokerMode ? "Nhat_Ky_Giam_Sat_Broker_Bootcamp_2026.csv" : "Nhat_Ky_Quan_Tri_Rui_Ro_Bootcamp_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-20 md:py-28 bg-surface-container-lowest border-b border-outline-custom/20 overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Panel: High Fidelity Laptop Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary-neon/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <motion.div 
              initial={{ opacity: 0, rotate: 1 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative bg-surface rounded-2xl border border-outline-custom/30 p-2 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.6)] group hover:scale-[1.01] transition-transform duration-500"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSQtyDG6F6d0WLfQAt3TgSG2ds-Uvyzrxnl8tmXFHCV00sQzjiiwYF5IJF067XXH7AZZHPAvxcgLaxdrS_8ahdg3pyJTL3jQaWtvrfoqGH8XsTUDwN0YW0zJ2JpwF3l-lPNCbuGW3zFRRwwAlzEW_j_8H2QU4EdtOgE8Ld52ZtClVsuH8T1z6rBGLToyG0vRwQJbtmgGymrHXmEeutVB9dfhgHHc_yEydevC3kjrIf7VMHIcA4vyZTbvkX3QjNwuFtxUE3ZQoEOO4" 
                alt="High-fidelity trading terminal dashboard showing NAV growth and risk metrics" 
                referrerPolicy="no-referrer"
                className="relative z-10 w-full h-auto rounded-xl border border-primary-neon/20 shadow-[0_0_30px_var(--glow-color)]"
              />
              <div className="absolute top-6 left-6 bg-background/95 backdrop-blur border border-outline-custom/40 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-neon animate-ping"></span>
                <span className="font-mono text-[9px] text-primary-neon font-bold tracking-widest uppercase">{isBrokerMode ? "BROKER JOURNAL" : "AUTO JOURNAL"}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Panel: Pitch & Download CTA */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase leading-tight tracking-tight">
              {isBrokerMode ? (
                <>
                  CÔNG CỤ GIÁM SÁT
                  <br />
                  KỶ LUẬT ĐỘC QUYỀN
                </>
              ) : (
                <>
                  CÔNG CỤ QUẢN TRỊ
                  <br />
                  RỦI RO ĐỘC QUYỀN
                </>
              )}
            </h2>
            
            <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
              {isBrokerMode 
                ? "Bộ công cụ quản lý danh mục khách hàng, đối chiếu rủi ro thực tế và nhật ký tư vấn được thiết kế chuyên biệt cho đội ngũ Broker PKD6."
                : "Công cụ tính toán vị thế tối ưu, kiểm soát drawdown tự động và nhật ký giao dịch được thiết kế riêng bởi các chuyên gia tài chính cho học viên Bootcamp 2026."
              }
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-primary-neon/10 rounded text-primary-neon mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-on-surface-variant">
                  {isBrokerMode ? (
                    <><strong className="text-white">Giám sát Position Sizing nhóm:</strong> Hệ thống tự động hóa vị thế của khách hàng dựa trên biên an toàn định sẵn của phòng.</>
                  ) : (
                    <><strong className="text-white">Tự động tính Position Sizing:</strong> Chỉ cần nhập số vốn hiện tại và khoảng cách cắt lỗ, file tự động tính số lượng cổ phiếu cần mua.</>
                  )}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-primary-neon/10 rounded text-primary-neon mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-on-surface-variant">
                  {isBrokerMode ? (
                    <><strong className="text-white">Cảnh báo sụt giảm tài khoản khách:</strong> Phát tín hiệu đỏ ngay lập tức khi danh mục khách hàng chạm ngưỡng -4.0% ngày hoặc -8.0% NAV tổng.</>
                  ) : (
                    <><strong className="text-white">Báo động sụt giảm (Drawdown):</strong> Cảnh báo bằng mã màu đỏ sẫm khi tiệm cận giới hạn -4.0% ngày hoặc -8.0% NAV tổng.</>
                  )}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1 bg-primary-neon/10 rounded text-primary-neon mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-on-surface-variant">
                  {isBrokerMode ? (
                    <><strong className="text-white">Thanh khoản & Quy mô tư vấn:</strong> Tự động rà soát danh mục VN100, khối lượng giao dịch &gt; 200k, đảm bảo tỷ trọng mã khách hàng ≤ 40%.</>
                  ) : (
                    <><strong className="text-white">Thanh khoản & Đa dạng hoá:</strong> Tích hợp sẵn bộ lọc VN100, tự kiểm tra quy tắc không vượt quá 40% NAV/mã.</>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto bg-surface-bright border border-primary-neon/50 text-primary-neon font-headline text-xs sm:text-sm font-extrabold px-8 py-5 rounded-xl hover:bg-primary-neon hover:text-background transition-all flex items-center justify-center gap-3 cursor-pointer uppercase tracking-wider glow-green"
              >
                <Download className="w-4 h-4" />
                {isBrokerMode ? "[ Nhận File Excel Giám Sát Qua Zalo ]" : "[ Nhận File Excel Miễn Phí Qua Zalo ]"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Download Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            ></motion.div>

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-surface border-2 border-primary-neon/50 p-6 md:p-8 rounded-3xl shadow-2xl z-10"
            >
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-primary-neon/10 rounded-full text-primary-neon mb-3 animate-bounce">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-headline font-extrabold text-white uppercase">TẢI FILE QUẢN TRỊ RỦI RO</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Vui lòng cung cấp thông tin để hệ thống gửi file Excel và liên kết Zalo hỗ trợ.
                </p>
              </div>

              {isSent ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-primary-neon/15 text-primary-neon rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-white font-bold uppercase text-sm">GỬI THÔNG TIN THÀNH CÔNG!</h4>
                  <p className="text-xs text-on-surface-variant">
                    File <strong className="text-primary-neon">Nhat_Ky_Quan_Tri_Rui_Ro.csv</strong> đang tự động tải xuống thiết bị của bạn...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDownload} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-error-neon/30 text-error-neon text-xs p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-steel font-bold uppercase tracking-wider">Họ và Tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-background border border-outline-custom/40 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-neon outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-steel font-bold uppercase tracking-wider">Số Điện Thoại Zalo</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0398 992 555"
                      className="w-full bg-background border border-outline-custom/40 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-neon outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-neon text-[#002114] font-headline text-xs font-extrabold py-4 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    NHẬN FILE EXCEL MIỄN PHÍ
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full text-center text-[11px] text-muted-steel hover:text-white mt-2 cursor-pointer hover:underline"
                  >
                    Hủy bỏ
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

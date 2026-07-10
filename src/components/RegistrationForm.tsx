/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { Check, User, Phone, Tag, Award, Sparkles, Download, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface RegistrationFormProps {
  isBrokerMode: boolean;
}

export default function RegistrationForm({ isBrokerMode }: RegistrationFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [brokerCode, setBrokerCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredCode, setRegisteredCode] = useState("");
  const [remainingSlots, setRemainingSlots] = useState(32);
  const [error, setError] = useState("");

  useEffect(() => {
    // Read from localStorage to see if already registered
    const stored = localStorage.getItem("ptb_2026_registered");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFullName(parsed.fullName);
      setPhone(parsed.phone);
      setBrokerCode(parsed.brokerCode || "");
      setRegisteredCode(parsed.code);
      setIsRegistered(true);
      setRemainingSlots(31);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Vui lòng cung cấp Họ và Tên của bạn.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError("Vui lòng cung cấp Số điện thoại (Zalo) hợp lệ.");
      return;
    }

    setIsSubmitting(true);

    const code = isBrokerMode 
      ? `PBB-2026-${Math.floor(1000 + Math.random() * 9000)}` 
      : `PTB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const regData = { fullName, phone, brokerCode, code };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: dbError } = await supabase
          .from("leads")
          .insert([
            {
              full_name: fullName,
              phone: phone,
              broker_code: brokerCode || null,
              code: code
            }
          ]);

        if (dbError) {
          console.error("Supabase insert error:", dbError);
          setError("Có lỗi xảy ra khi lưu đăng ký vào cơ sở dữ liệu. Vui lòng thử lại.");
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Supabase exception:", err);
        setError("Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại.");
        setIsSubmitting(false);
        return;
      }
    }

    // Save to localStorage & show success screen
    localStorage.setItem("ptb_2026_registered", JSON.stringify(regData));
    setRegisteredCode(code);
    setIsSubmitting(false);
    setIsRegistered(true);
    setRemainingSlots(31);

    // Trigger automatic file download of trade journal
    triggerFileDownload();
  };

  const triggerFileDownload = () => {
    const csvContent = isBrokerMode
      ? "\uFEFF" + // UTF-8 BOM
        "BẢNG ĐƯỜNG ĐUA PRO BROKER BOOTCAMP 2026\n" +
        "Họ và Tên Học Viên: " + fullName + "\n" +
        "Mã Đăng Ký Đường Đua: " + registeredCode + "\n" +
        "Ngày kích hoạt: " + new Date().toLocaleDateString("vi-VN") + "\n\n" +
        "Nhật Ký Quản Trị Rủi Ro & Đo Lường Kỷ Luật\n" +
        "Ngày,Mã CK,Mua/Bán,Giá Khớp,Khối Lượng,Lãi Lỗ Khách Hàng (%),Trạng Thái,Ghi Chú\n" +
        "06/07/2026,FPT,BUY,135000,1000,5.2%,Passed,Đạt chuẩn danh mục Vòng 1\n" +
        "06/07/2026,TCB,BUY,48000,2000,-1.5%,Active,Dưới mức sụt giảm cho phép\n"
      : "\uFEFF" + // UTF-8 BOM
        "BẢNG THỬ THÁCH PRO TRADER BOOTCAMP 2026\n" +
        "Họ và Tên Học Viên: " + fullName + "\n" +
        "Mã Đăng Ký Thử Thách: " + registeredCode + "\n" +
        "Ngày kích hoạt: " + new Date().toLocaleDateString("vi-VN") + "\n\n" +
        "Nhật Ký Quản Trị Rủi Ro & Giao Dịch\n" +
        "Ngày,Mã CK,Mua/Bán,Giá Khớp,Khối Lượng,Lãi Lỗ Dự Kiến (%),Trạng Thái,Ghi Chú\n" +
        "06/07/2026,FPT,BUY,135000,1000,5.2%,Passed,Đạt chuẩn NAV Vòng 1\n" +
        "06/07/2026,TCB,BUY,48000,2000,-1.5%,Active,Dưới mức sụt giảm cho phép\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", isBrokerMode ? `Kich_Hoat_Moi_Gioi_${fullName.replace(/\s+/g, "_")}.csv` : `Kich_Hoat_Thu_Thach_${fullName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetRegistration = () => {
    localStorage.removeItem("ptb_2026_registered");
    setFullName("");
    setPhone("");
    setBrokerCode("");
    setRegisteredCode("");
    setIsRegistered(false);
    setRemainingSlots(32);
  };

  const steps = isBrokerMode ? [
    {
      num: 1,
      title: "Đăng ký thành công",
      desc: "Hệ thống ghi nhận thông tin đăng ký tham gia thử thách Broker và cấp mã số đăng ký.",
    },
    {
      num: 2,
      title: "Xác thực phòng ban",
      desc: "Trưởng phòng kinh doanh hoặc admin sẽ liên hệ qua Zalo trong vòng 5-10 phút để xác nhận.",
    },
    {
      num: 3,
      title: "Nhận File Đo lường Rủi ro",
      desc: "Nhận ngay bộ công cụ Nhật ký giao dịch khách hàng & File Excel tính toán rủi ro nhóm của Broker.",
    },
    {
      num: 4,
      title: "Bắt đầu đường đua",
      desc: "Liên kết tài khoản của Broker/khách hàng (tối thiểu 10 triệu VND) để bắt đầu đo lường kỷ luật nhóm.",
    },
  ] : [
    {
      num: 1,
      title: "Đăng ký thành công",
      desc: "Hệ thống ghi nhận thông tin đăng ký và cấp mã định danh đăng ký cho tài khoản của bạn.",
    },
    {
      num: 2,
      title: "Kết bạn Zalo xác nhận",
      desc: "Huấn luyện viên phụ trách sẽ chủ động liên hệ trong vòng 5-10 phút để kích hoạt tài khoản.",
    },
    {
      num: 3,
      title: "Nhận File Quản trị Rủi ro",
      desc: "Nhận ngay bộ công cụ Nhật ký giao dịch tự động & File Excel tính toán rủi ro độc quyền của Bootcamp.",
    },
    {
      num: 4,
      title: "Bắt đầu hành trình thử thách",
      desc: "Nạp 10 triệu VND tối thiểu vào tài khoản cá nhân và bắt đầu rèn luyện kỷ luật cùng cộng đồng Pro.",
    },
  ];

  return (
    <section id="register" className="py-20 md:py-28 relative overflow-hidden bg-background">
      {/* Decorative ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-neon/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Instructions and steps */}
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase leading-tight tracking-tight">
                {isBrokerMode ? "ĐĂNG KÝ ĐƯỜNG ĐUA" : "ĐĂNG KÝ THAM GIA"}
                <br />
                <span className="text-primary-neon drop-shadow-[0_0_12px_rgba(0,230,118,0.3)]">
                  {isBrokerMode ? "NHẬN BỘ CÔNG CỤ BẢO VỆ VỐN" : "NHẬN QUÀ TẶNG BẢO VỆ VỐN"}
                </span>
              </h2>
              <p className="text-on-surface-variant text-base sm:text-lg">
                {isBrokerMode 
                  ? "Hoàn tất đăng ký bên dưới để nhận được tài liệu hướng dẫn đo lường kỷ luật và kích hoạt tài khoản tham gia đường đua Broker."
                  : "Hoàn tất đăng ký bên dưới để nhận được tài liệu hướng dẫn nhật ký giao dịch và kích hoạt tài khoản tham gia thử thách Bootcamp."
                }
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4 sm:gap-6 items-start group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-neon/10 border border-primary-neon/30 flex items-center justify-center text-primary-neon font-bold font-mono text-sm group-hover:bg-primary-neon group-hover:text-[#002114] transition-all duration-300">
                    {step.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold font-headline text-sm sm:text-base group-hover:text-primary-neon transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Registration Card & Success Member Ticket */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {isRegistered ? (
                /* Success Certificate Card / Member Ticket */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface border-2 border-primary-neon p-6 sm:p-8 md:p-10 rounded-3xl glow-green-strong shadow-2xl space-y-8 relative overflow-hidden"
                >
                  {/* Decorative badge */}
                  <div className="absolute top-4 right-4 bg-primary-neon/15 text-primary-neon border border-primary-neon/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    REGISTERED MEMBER
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-primary-neon/15 text-primary-neon rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-neon/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-headline font-black text-white uppercase tracking-wider">
                      ĐĂNG KÝ THÀNH CÔNG!
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {isBrokerMode 
                        ? "Bạn đã kích hoạt thành công đường đua chặng này. Hãy chụp màn hình tấm vé này gửi cho Trưởng phòng!"
                        : "Bạn đã kích hoạt thành công thử thách chặng này. Hãy chụp màn hình tấm vé này gửi cho Broker phụ trách!"
                      }
                    </p>
                  </div>

                  {/* High Fidelity Ticket Layout */}
                  <div className="bg-background border border-outline-custom/30 rounded-2xl p-6 font-mono space-y-4 relative">
                    {/* Circle punchouts in ticket borders */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface border-r border-outline-custom/30"></div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface border-l border-outline-custom/30"></div>

                    <div className="text-center border-b border-dashed border-outline-custom/30 pb-4">
                      <div className="text-[10px] text-muted-steel uppercase font-extrabold tracking-widest">
                        {isBrokerMode ? "MÃ ĐĂNG KÝ ĐƯỜNG ĐUA" : "MÃ ĐĂNG KÝ THỬ THÁCH"}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-primary-neon mt-1 animate-pulse">
                        {registeredCode}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-steel font-bold uppercase">HỌ VÀ TÊN:</span>
                        <span className="text-white font-extrabold uppercase">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-steel font-bold uppercase">SỐ ĐIỆN THOẠI:</span>
                        <span className="text-white font-extrabold">{phone}</span>
                      </div>
                      {brokerCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-steel font-bold uppercase">
                            {isBrokerMode ? "MÃ PHÒNG KD:" : "MÃ BROKER:"}
                          </span>
                          <span className="text-white font-extrabold uppercase">{brokerCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-steel font-bold uppercase">TRẠNG THÁI:</span>
                        <span className="text-primary-neon font-black uppercase">CHỜ GỌI XÁC NHẬN</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={triggerFileDownload}
                      className={`w-full bg-primary-neon ${isBrokerMode ? "text-black" : "text-[#002114]"} font-headline text-xs font-extrabold py-4 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer`}
                    >
                      <Download className="w-4 h-4" />
                      {isBrokerMode ? "TẢI LẠI FILE ĐO LƯỜNG KỶ LUẬT" : "TẢI LẠI FILE QUẢN TRỊ RỦI RO"}
                    </button>
                    
                    <button
                      onClick={handleResetRegistration}
                      className="w-full text-center text-[10px] text-muted-steel hover:text-error-neon transition-colors py-2 cursor-pointer uppercase font-bold tracking-wider"
                    >
                      Nhập Đơn Mới (Reset)
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Registration Form */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface border-2 border-primary-neon/40 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl space-y-6 relative"
                >
                  <div className="text-center mb-6">
                    <h3 className="font-headline text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wider">
                      {isBrokerMode ? "ĐƠN ĐĂNG KÝ ĐƯỜNG ĐUA" : "ĐƠN ĐĂNG KÝ THAM GIA"}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {isBrokerMode 
                        ? "Bắt đầu hành trình Pro Broker chuyên nghiệp ngay hôm nay"
                        : "Bắt đầu hành trình Pro Trader kỷ luật ngay hôm nay"
                      }
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-error-neon/30 text-error-neon text-xs p-3.5 rounded-xl flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name Input */}
                    <div className="space-y-1.5">
                      <label className="font-headline text-[10px] text-muted-steel uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-neon" />
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        disabled={isSubmitting}
                        className="w-full bg-background border border-outline-custom/40 rounded-xl px-5 py-4 text-white text-sm focus:border-primary-neon focus:ring-1 focus:ring-primary-neon outline-none transition-all placeholder:text-muted-steel/35 font-medium"
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                      <label className="font-headline text-[10px] text-muted-steel uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary-neon" />
                        Số Điện Thoại (Zalo)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0398 992 555"
                        disabled={isSubmitting}
                        className="w-full bg-background border border-outline-custom/40 rounded-xl px-5 py-4 text-white text-sm focus:border-primary-neon focus:ring-1 focus:ring-primary-neon outline-none transition-all placeholder:text-muted-steel/35 font-mono"
                      />
                    </div>

                    {/* Broker Code Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="font-headline text-[10px] text-muted-steel uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-primary-neon" />
                          {isBrokerMode ? "MÃ PHÒNG KINH DOANH (NẾU CÓ)" : "MÃ BROKER (NẾU CÓ)"}
                        </label>
                        <span className="text-[9px] text-muted-steel/50 uppercase font-black tracking-widest">
                          Tùy chọn
                        </span>
                      </div>
                      <input
                        type="text"
                        value={brokerCode}
                        onChange={(e) => setBrokerCode(e.target.value)}
                        placeholder={isBrokerMode ? "Nhập tên hoặc mã phòng kinh doanh" : "Nhập tên hoặc mã môi giới"}
                        disabled={isSubmitting}
                        className="w-full bg-background border border-outline-custom/40 rounded-xl px-5 py-4 text-white text-sm focus:border-primary-neon focus:ring-1 focus:ring-primary-neon outline-none transition-all placeholder:text-muted-steel/35 font-medium"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-primary-neon ${isBrokerMode ? "text-black" : "text-[#002114]"} font-headline text-sm font-extrabold py-4.5 rounded-xl hover:brightness-110 transition-all glow-green uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4.5 h-4.5 rounded-full border-2 border-background border-t-transparent animate-spin"></span>
                            ĐANG ĐĂNG KÝ...
                          </span>
                        ) : (
                          isBrokerMode ? "KÍCH HOẠT ĐƯỜNG ĐUA" : "KÍCH HOẠT THỬ THÁCH"
                        )}
                      </button>
                      
                      {/* Available slots count */}
                      <div className="mt-6 flex items-center justify-center gap-2 text-error-neon text-[10px] font-black uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 bg-error-neon rounded-full"></span>
                        {isBrokerMode 
                          ? `Đã có 12 Broker đăng ký tham gia. Chỉ còn trống ${remainingSlots} suất chặng này.`
                          : `Đã có 18 trader đăng ký thành công. Chỉ còn trống ${remainingSlots} suất chặng này.`
                        }
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

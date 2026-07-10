/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ChevronRight, Shield, Award, Users, Percent } from "lucide-react";

interface HeroSectionProps {
  isBrokerMode: boolean;
}

export default function HeroSection({ isBrokerMode }: HeroSectionProps) {
  const scrollToRegister = () => {
    const element = document.getElementById("register");
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative min-h-[600px] flex items-center terminal-grid py-12 md:py-20 lg:py-24 border-b border-outline-custom/20 overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary-neon/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-error-neon/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Pitch Panel */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-primary-neon/30 rounded-full"
            >
              <span className="w-2 h-2 bg-primary-neon rounded-full animate-pulse shadow-[0_0_8px_#FFB300]"></span>
              <span className="font-headline text-[10px] tracking-widest text-primary-neon uppercase font-bold">
                {isBrokerMode ? "Professional Brokerage Unit PKD6" : "Institutional Grade Environment"}
              </span>
            </motion.div>

            {isBrokerMode ? (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                TƯ VẤN KỶ LUẬT
                <br />
                HẠN MỨC ỦY THÁC LỚN{" "}
                <span 
                  className="text-primary-neon font-extrabold relative inline-block drop-shadow-[0_0_15px_rgba(255,179,0,0.4)]"
                >
                  THƯỞNG HOA HỒNG LÊN ĐẾN 80%
                </span>
              </motion.h1>
            ) : (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                GIAO DỊCH KỶ LUẬT
                <br />
                HẠN MỨC KHỦNG{" "}
                <span 
                  className="text-primary-neon font-extrabold relative inline-block drop-shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                >
                  CHIA THƯỞNG LÊN ĐẾN 80%
                </span>
              </motion.h1>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed"
            >
              {isBrokerMode 
                ? "Chứng minh năng lực quản trị rủi ro danh mục của khách hàng để được mở rộng hạn mức quản lý tài sản lớn (AUM x10) và tối ưu hóa doanh thu hoa hồng."
                : "Chứng minh năng lực quản trị rủi ro để nhận đặc quyền hạn mức giao dịch lớn và giữ lại tới 80% lợi nhuận trong môi trường chuyên nghiệp nhất."
              }
            </motion.p>

            {/* Quick Stats Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2"
            >
              <div className="bg-surface/50 border border-outline-custom/20 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 bg-primary-neon/10 rounded-lg text-primary-neon">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-steel font-bold">{isBrokerMode ? "NHÓM BROKER" : "120+ TRADERS"}</div>
                  <div className="text-[10px] text-on-surface-variant">{isBrokerMode ? "PKD6 Tinh Anh" : "Đang thử thách"}</div>
                </div>
              </div>
              <div className="bg-surface/50 border border-outline-custom/20 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 bg-primary-neon/10 rounded-lg text-primary-neon">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-steel font-bold">{isBrokerMode ? "80% CHIA SẺ" : "80% CHIA SẺ"}</div>
                  <div className="text-[10px] text-on-surface-variant">{isBrokerMode ? "Phí & Lợi nhuận" : "Lợi nhuận rút về"}</div>
                </div>
              </div>
              <div className="bg-surface/50 border border-outline-custom/20 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 bg-primary-neon/10 rounded-lg text-primary-neon">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-steel font-bold">MAX -8%</div>
                  <div className="text-[10px] text-on-surface-variant">{isBrokerMode ? "Giới hạn sụt giảm NAV" : "Giới hạn sụt giảm"}</div>
                </div>
              </div>
              <div className="bg-surface/50 border border-outline-custom/20 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 bg-primary-neon/10 rounded-lg text-primary-neon">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-steel font-bold">{isBrokerMode ? "100M HẠN MỨC" : "100M CAPITAL"}</div>
                  <div className="text-[10px] text-on-surface-variant">{isBrokerMode ? "Phân bổ AUM Vòng 2" : "Thăng hạng Vòng 2"}</div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6"
            >
              <button
                onClick={scrollToRegister}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary-neon ${isBrokerMode ? "text-black" : "text-[#002114]"} font-headline text-xs sm:text-sm font-extrabold px-8 py-5 rounded-xl hover:brightness-115 transition-all ${isBrokerMode ? "shadow-[0_0_20px_rgba(255,179,0,0.3)]" : "shadow-[0_0_20px_rgba(0,230,118,0.3)]"} uppercase tracking-wider cursor-pointer font-bold group`}
              >
                {isBrokerMode ? "[ THAM GIA ĐƯỜNG ĐUA – NHẬN FILE ĐO LƯỜNG KỶ LUẬT ]" : "[ ĐĂNG KÝ THỬ THÁCH – NHẬN FILE NHẬT KÝ RỦI RO ]"}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Graphics Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative group"
          >
            <div className={`absolute -inset-4 ${isBrokerMode ? "bg-primary-neon/10" : "bg-primary-neon/10"} blur-[80px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none`}></div>
            <div className="relative border border-outline-custom/40 rounded-3xl p-2 bg-surface/30 backdrop-blur-sm shadow-2xl overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida/AP1WRLvbfUBm6gdoV88IvcgSFoXBbtGnU56ytlGaBFyyPBTePmEFw95rGqe5FJZMXvjmBbBIKHkrzKZvJlZSxfyB1s3w_JELl2lX-PqiGY--vu6m3oT8eWJyIKGQnx7nIb6H87YmYUOlxFua6YrcdQQZlYWdP9uqfG_HKrfcESo3A0uRdDqiaqj9ygRZPDaoVuwQyNFjzjlbZ-sLfsSHsH1GpwO97ngtajJ5rS-XJd2NEVH4Z831ZN1YHElkJ6g"
                alt="Trading Mascot Rabbit and Elephant"
                referrerPolicy="no-referrer"
                className="relative z-10 w-full h-auto rounded-2xl border border-outline-custom/20 shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <span className="bg-black/90 border-primary-neon/30 text-primary-neon backdrop-blur-md border text-[9px] font-bold px-2 py-1 rounded">
                  {isBrokerMode ? "BROKER CHALLENGE" : "BOOTCAMP ACTIVE"}
                </span>
                <span className="bg-[#440003]/90 backdrop-blur-md border border-error-neon/30 text-error-neon text-[9px] font-bold px-2 py-1 rounded">
                  SECURE VAULT
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

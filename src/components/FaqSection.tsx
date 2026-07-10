/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, MessageSquare } from "lucide-react";
import { FAQ_ITEMS, FAQ_BROKERS_ITEMS } from "../data";
import zaloQrCode from "../../assets/zalo_qr_code.jpg";

interface FaqSectionProps {
  isBrokerMode: boolean;
}

export default function FaqSection({ isBrokerMode }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(isBrokerMode ? "faq-b1" : "faq-1");

  useEffect(() => {
    setOpenId(isBrokerMode ? "faq-b1" : "faq-1");
  }, [isBrokerMode]);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const faqs = isBrokerMode ? FAQ_BROKERS_ITEMS : FAQ_ITEMS;

  return (
    <section id="faq" className="py-20 md:py-28 bg-background border-b border-outline-custom/20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-3 bg-primary-neon/10 border border-primary-neon/20 rounded-full text-primary-neon">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
            HỎI ĐÁP THƯỜNG GẶP
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-xs sm:text-sm">
            {isBrokerMode 
              ? "Tất cả những thông tin chi tiết bạn cần biết về quy chế hoạt động của nhóm Broker, phân bổ hạn mức, và quản trị rủi ro nhóm."
              : "Tất cả những thông tin chi tiết bạn cần biết về cơ chế hoạt động, thăng hạng, bảo vệ vốn và chia thưởng."
            }
          </p>
        </div>

        {/* FAQ Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Left Decorative Banner Card */}
          <div className="lg:col-span-4 bg-surface border border-outline-custom/20 p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] bg-primary-neon/10 border border-primary-neon/30 text-primary-neon font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                Support Hub
              </span>
              <h3 className="text-lg font-headline font-extrabold text-white uppercase">
                CẦN HỖ TRỢ TRỰC TIẾP?
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Đội ngũ chuyên gia và các Broker giám sát của chúng tôi luôn trực tuyến để giải đáp mọi khúc mắc 24/7.
              </p>
            </div>

            <div className="bg-background border border-outline-custom/30 rounded-2xl p-4 flex flex-col items-center space-y-4">
              <div className="flex gap-3 text-xs w-full">
                <div className="p-2 bg-primary-neon/15 text-primary-neon rounded-lg h-fit">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white">Liên hệ Zalo Broker</h4>
                  <p className="text-muted-steel mt-0.5 font-mono">0398 992 555</p>
                  <p className="text-[10px] text-primary-neon font-bold mt-1">Phản hồi trong 5 phút</p>
                </div>
              </div>
              <div className="border-t border-outline-custom/10 w-full pt-3 flex flex-col items-center">
                <span className="text-[9px] text-muted-steel uppercase font-extrabold mb-3">Quét mã QR kết bạn:</span>
                <div className="bg-white p-1 rounded-2xl border border-primary-neon/30 w-32 h-32 flex items-center justify-center relative overflow-hidden group shadow-md">
                  <img 
                    src={zaloQrCode} 
                    alt="Zalo QR Code" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-steel leading-relaxed">
              {isBrokerMode 
                ? "(*) Chương trình Pro Broker Bootcamp được tổ chức nội bộ dành cho phòng kinh doanh PKD6, phi lợi nhuận và hoàn toàn minh bạch."
                : "(*) Chương trình Pro Trader Bootcamp không thu bất kỳ khoản phí học viên nào, mọi hoạt động chia sẻ đều hoàn toàn phi lợi nhuận."
              }
            </div>
          </div>

          {/* Right Accordions List */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-surface border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-primary-neon/50 shadow-[0_0_15px_var(--glow-color)] bg-surface-bright/20" 
                      : "border-outline-custom/20 hover:border-outline-custom/50"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-headline text-sm sm:text-base font-bold text-white uppercase tracking-wide focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-colors ${isOpen ? "text-primary-neon" : "text-muted-steel"}`} />
                      <span>{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary-neon flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-steel flex-shrink-0" />
                    )}
                  </button>

                  {/* Expandable answer panel */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[300px] border-t border-outline-custom/10 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="p-5 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { DollarSign, ShieldAlert, Zap, TrendingUp, HelpCircle } from "lucide-react";

interface LimitCalculatorProps {
  isBrokerMode: boolean;
}

export default function LimitCalculator({ isBrokerMode }: LimitCalculatorProps) {
  // Value in millions VND. Default is 50. Range is 10 to 500.
  const [capital, setCapital] = useState<number>(50);

  // Formatting utility
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Calculations
  const rawCapital = capital * 1000000;
  const maxDrawdown = rawCapital * 0.08;
  const leverageVòng2 = 100000000; // 100 million VND fixed

  return (
    <section id="calculator" className="py-20 md:py-28 bg-background border-b border-outline-custom/20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        
        {/* Inner Bordered Wrap Container */}
        <div className="bg-surface border border-primary-neon/20 rounded-3xl p-6 sm:p-8 md:p-12 shadow-[0_0_40px_rgba(0,230,118,0.03)]">
          
          {/* Header Title */}
          <div className="mb-12 text-center space-y-4">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-neon uppercase tracking-tight">
              {isBrokerMode ? "MÁY TÍNH HẠN MỨC ỦY THÁC & RỦI RO" : "MÁY TÍNH HẠN MỨC GIAO DỊCH & RỦI RO"}
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-xs sm:text-sm">
              {isBrokerMode 
                ? "Kéo thanh trượt để điều chỉnh số vốn đăng ký tham gia thử thách ban đầu của phòng và xem các thông số tính toán rủi ro cùng hạn mức AUM nhận quản lý:"
                : "Kéo thanh trượt để điều chỉnh số vốn tham gia thử thách ban đầu của bạn và xem các thông số tính toán rủi ro kỷ luật cũng như hạn mức ưu đãi nhận được:"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Control Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <label className="font-headline text-xs text-muted-steel uppercase font-extrabold tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-neon" />
                    {isBrokerMode ? "Chọn Vốn Đăng Ký Thử Thách (Vòng 1):" : "Chọn Vốn Giao Dịch Ban Đầu (Vòng 1):"}
                  </label>
                  
                  <div className="text-left sm:text-right">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono leading-none">
                      {capital} triệu
                    </span>
                    <span className="block text-primary-neon text-xs sm:text-sm font-extrabold tracking-widest uppercase mt-1">
                      VND
                    </span>
                  </div>
                </div>

                {/* Slider Input */}
                <div className="relative pt-2">
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer accent-primary-neon"
                  />
                  <div className="flex justify-between text-[10px] text-muted-steel font-mono mt-3 font-bold">
                    <span>10 TRIỆU</span>
                    <span>100M</span>
                    <span>200M</span>
                    <span>300M</span>
                    <span>400M</span>
                    <span>500 TRIỆU</span>
                  </div>
                </div>
              </div>

              {/* Operational Rules Box */}
              <div className="bg-surface-container-lowest/80 border border-outline-custom/30 rounded-2xl p-5 md:p-6 space-y-4">
                <h5 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-neon" />
                  * Công thức vận hành:
                </h5>
                
                <ul className="text-xs text-on-surface-variant space-y-3 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-neon font-bold mt-0.5">•</span>
                    <span>Giới hạn sụt giảm tài khoản bảo vệ vốn luôn giữ cố định ở mức <strong className="text-white">8% NAV</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-neon font-bold mt-0.5">•</span>
                    <span>
                      {isBrokerMode 
                        ? <>Hạn mức ủy thác quản lý quỹ tại Vòng 2 được cấp cố định <strong className="text-white">100 triệu VND</strong>.</>
                        : <>Hạn mức giao dịch thực chiến tại Vòng 2 được cấp cố định <strong className="text-white">100 triệu VND</strong>.</>
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-neon font-bold mt-0.5">•</span>
                    <span>
                      {isBrokerMode 
                        ? <>Tỷ lệ chia sẻ hoa hồng và phí quản lý lên đến <strong className="text-white">80%</strong>, đánh giá định kỳ 2 tháng một lần.</>
                        : <>Tỷ lệ chia sẻ lợi nhuận lên đến <strong className="text-white">80%</strong>, đánh giá định kỳ 2 tháng một lần.</>
                      }
                    </span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Right Calculations Card Column */}
            <div className="lg:col-span-5 flex flex-col h-full justify-center">
              
              <div className="bg-surface-container-low border border-primary-neon/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden flex-grow flex flex-col justify-between">
                
                {/* Decorative mesh line */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-neon/5 blur-3xl rounded-full pointer-events-none"></div>
                
                <div>
                  <h3 className="text-primary-neon font-headline font-extrabold text-lg sm:text-xl border-b border-outline-custom/20 pb-4 uppercase tracking-wider">
                    Thông Số Tính Toán
                  </h3>
                  
                  <div className="space-y-5 pt-4">
                    
                    {/* Row 1: Max Loss limit */}
                    <div className="flex justify-between items-center py-2.5 border-b border-outline-custom/10">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-error-neon" />
                        <span className="text-on-surface-variant text-xs sm:text-sm">
                          Sụt giảm tối đa (8%):
                        </span>
                      </div>
                      <span className="text-error-neon font-extrabold font-mono text-sm sm:text-base">
                        {formatVND(maxDrawdown)}
                      </span>
                    </div>

                    {/* Row 2: Vòng 2 capital */}
                    <div className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary-neon" />
                        <span className="text-on-surface-variant text-xs sm:text-sm">
                          {isBrokerMode ? "Hạn mức AUM Vòng 2:" : "Hạn mức Vòng 2:"}
                        </span>
                      </div>
                      <span className="text-primary-neon font-extrabold font-mono text-sm sm:text-base">
                        {formatVND(leverageVòng2)}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Profit Split Highlight Box */}
                <div className="bg-primary-neon/5 border border-primary-neon/20 p-4 rounded-2xl flex items-center justify-between mt-6">
                  <span className="text-xs text-muted-steel font-bold uppercase tracking-wider">
                    {isBrokerMode ? "Chia sẻ hoa hồng/phí:" : "Chia sẻ lợi nhuận:"}
                  </span>
                  <span className="text-primary-neon font-headline text-xs sm:text-sm font-black">
                    80% / 20% (Nhận 80%)
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

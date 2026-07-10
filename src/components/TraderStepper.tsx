import { STAGE_RULES, STAGE_BROKERS_RULES } from "../data";
import { TrendingUp, Rocket, Landmark, Award, ShieldAlert, BadgeInfo } from "lucide-react";

interface TraderStepperProps {
  isBrokerMode: boolean;
}

export default function TraderStepper({ isBrokerMode }: TraderStepperProps) {
  const stages = isBrokerMode ? STAGE_BROKERS_RULES : STAGE_RULES;

  return (
    <section id="stepper" className="py-16 md:py-24 bg-background border-b border-outline-custom/20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
            {isBrokerMode ? "LỘ TRÌNH THĂNG TIẾN BROKER" : "LỘ TRÌNH THĂNG TIẾN TRADER"}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm sm:text-base">
            {isBrokerMode 
              ? "Hệ thống phát triển năng lực tư vấn và quản lý rủi ro nhóm dành cho môi giới chuyên nghiệp." 
              : "Hệ thống thăng hạng chuyên nghiệp dựa trên năng lực quản trị rủi ro thực tế của bạn."
            }
          </p>
        </div>

        {/* Stepper Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          
          {stages.map((stage, index) => {
            const isStage2 = stage.stage === 2;
            return (
              <div 
                key={stage.stage} 
                className={`bg-surface rounded-3xl flex flex-col h-full hover:border-outline-custom/50 transition-all duration-300 relative ${
                  isStage2 
                    ? `border-2 border-primary-neon/50 shadow-[0_0_30px_var(--glow-color)]` 
                    : "border border-outline-custom/20"
                }`}
              >
                {isStage2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-neon text-background text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full uppercase z-20 shadow-lg">
                    {isBrokerMode ? "ĐẶC QUYỀN ỦY THÁC AUM" : "ĐẶC QUYỀN THỰC CHIẾN"}
                  </div>
                )}

                <div className={`p-6 md:p-8 border-b rounded-t-[22px] ${isStage2 ? "border-primary-neon/20 bg-primary-neon/5" : "border-outline-custom/10 bg-surface-bright/20"}`}>
                  
                  <div className={`inline-block px-3 py-1 rounded-full mb-4 ${isStage2 ? "bg-primary-neon text-background" : "bg-primary-neon/10 border border-primary-neon/20 text-primary-neon"}`}>
                    <span className="font-headline text-[10px] tracking-widest font-bold uppercase">
                      {isStage2 ? "GIAI ĐOẠN TĂNG TRƯỞNG" : "GIAI ĐOẠN SÀNG LỌC"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-headline font-extrabold text-white mb-2 uppercase">
                    {stage.title} ({stage.subtitle})
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    {isStage2 ? (
                      <Rocket className="w-5 h-5 text-primary-neon animate-pulse" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-primary-neon animate-pulse" />
                    )}
                    <p className="text-primary-neon font-bold text-sm sm:text-base">
                      Mục tiêu: {stage.targetProfit}
                    </p>
                  </div>

                  {/* Specs Subgrid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`bg-background p-4 rounded-xl border ${isStage2 ? "border-primary-neon/30" : "border-outline-custom/30"}`}>
                      <div className="text-[10px] text-muted-steel font-extrabold uppercase mb-1 tracking-wider">
                        {isStage2 ? (isBrokerMode ? "HẠN MỨC ỦY THÁC" : "HẠN MỨC GIAO DỊCH") : "NAV TỐI THIỂU"}
                      </div>
                      <div className="text-lg font-bold text-white font-mono">
                        {stage.minCapital}
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
                        {isStage2 
                          ? (isBrokerMode ? "Cấp quyền tư vấn và quản lý hạn mức tài sản lớn gấp 10 lần vốn." : "Cấp tài khoản có hạn mức gấp 10 lần so với số vốn nạp thực tế.")
                          : (isBrokerMode ? "Vốn tối thiểu của Broker hoặc nhóm khách hàng để tham gia thử thách." : "Nạp vào tài khoản cá nhân, đây là yêu cầu tối thiểu để bắt đầu.")
                        }
                      </div>
                    </div>
                    
                    <div className={`bg-background p-4 rounded-xl border relative ${isStage2 ? "border-primary-neon/30" : "border-outline-custom/30"}`}>
                      <div className="absolute top-3 right-3">
                        {isStage2 ? (
                          <Landmark className="w-4 h-4 text-primary-neon animate-pulse" />
                        ) : (
                          <Award className="w-4 h-4 text-primary-neon animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-muted-steel font-extrabold uppercase mb-1 tracking-wider">
                        {isBrokerMode ? "CHIA SẺ LỢI NHUẬN/PHÍ" : "CHIA THƯỞNG"}
                      </div>
                      <div className="text-lg font-bold text-primary-neon font-mono">
                        {stage.payoutSplit}
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
                        {stage.payoutDesc}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-6 md:p-8 space-y-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-muted-steel uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-error-neon" />
                        Quy tắc quản trị rủi ro:
                      </h4>
                      {isStage2 && (
                        <span className="text-[10px] bg-surface-bright border border-outline-custom/40 px-2.5 py-1 rounded text-white font-extrabold uppercase tracking-wide">
                          Review 2 tháng/lần
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm border-b border-outline-custom/10 pb-2">
                        <span className="text-on-surface-variant">Sụt giảm ngày tối đa</span>
                        <span className="text-error-neon font-bold font-mono">{stage.rules.dailyDrawdown}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm border-b border-outline-custom/10 pb-2">
                        <span className="text-on-surface-variant">Sụt giảm tổng tối đa</span>
                        <span className="text-error-neon font-bold font-mono">{stage.rules.totalDrawdown}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm border-b border-outline-custom/10 pb-2">
                        <span className="text-on-surface-variant">Đa dạng hóa (Mã đơn lẻ)</span>
                        <span className="text-white font-bold font-mono">{stage.rules.maxSingleAsset}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm border-b border-outline-custom/10 pb-2">
                        <span className="text-on-surface-variant">Quy tắc nhất quán</span>
                        <span className="text-white font-bold font-mono">{stage.rules.consistencyRule}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-on-surface-variant">Bộ lọc thanh khoản</span>
                        <span className="text-primary-neon font-bold font-mono">{stage.rules.liquidityFilter}</span>
                      </div>
                    </div>
                  </div>

                  {stage.bonusText && (
                    <div className="pt-4 border-t border-outline-custom/10 mt-6">
                      <p className="text-[10px] text-primary-neon/80 italic leading-relaxed flex items-start gap-1.5">
                        <BadgeInfo className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {stage.bonusText}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

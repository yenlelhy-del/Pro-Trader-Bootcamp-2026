import React, { useState } from 'react';
import { Shield, TrendingUp, Award, ArrowRight, Download, CheckCircle, Phone, HelpCircle, Activity, Info, Zap } from 'lucide-react';

import cyberMascotsImg from '../assets/images/cyber_trading_mascots_1783395625371.jpg';
import riskToolImg from '../assets/images/risk_management_tool_1783395641022.jpg';
import qrThuImg from '../assets/images/kbsv_trinh_thi_anh_thu.png';
import qrTrinhImg from '../assets/images/kbsv_le_vu_tu_trinh.png';
import qrQuangImg from '../assets/images/kbsv_nguyen_minh_quang.png';

interface HomeSectionProps {
  onRegisterSuccess: (name: string, phone: string, brokerCode: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function HomeSection({ onRegisterSuccess, setActiveTab }: HomeSectionProps) {
  // Calculator state
  const [capital, setCapital] = useState<number>(50000000); // 50 million VND default
  
  // Registration Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [brokerCode, setBrokerCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  // Tool Request modal state
  const [showToolModal, setShowToolModal] = useState(false);
  const [toolPhone, setToolPhone] = useState('');
  const [toolSubmitted, setToolSubmitted] = useState(false);

  // Broker Modal state
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [selectedCtck, setSelectedCtck] = useState<'KIS' | 'KBSV'>('KIS');
  const [selectedKbsvBroker, setSelectedKbsvBroker] = useState<number>(0);

  const kbsvBrokers = [
    {
      name: 'Trịnh Thị Anh Thư',
      id: '0011000306',
      qrPath: qrThuImg
    },
    {
      name: 'Lê Vũ Tú Trinh',
      id: '0011000776',
      qrPath: qrTrinhImg
    },
    {
      name: 'Nguyễn Minh Quang',
      id: '0011000297',
      qrPath: qrQuangImg
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(val)
      .replace('₫', 'đ');
  };

  const formatNumberWithDots = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;
    
    setIsSubmitted(true);
    setSubmittedName(fullName);
    onRegisterSuccess(fullName, phoneNumber, brokerCode);
  };

  const handleToolRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolPhone) return;
    setToolSubmitted(true);
    setTimeout(() => {
      setShowToolModal(false);
      setToolSubmitted(false);
      setToolPhone('');
      alert('Hệ thống đã ghi nhận yêu cầu. Link tải File Excel Quản trị rủi ro đã được gửi qua Zalo số: ' + toolPhone);
    }, 1500);
  };

  const handleScrollToRegister = () => {
    const section = document.getElementById('registration-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToOpenAccount = () => {
    const section = document.getElementById('open-account-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        setShowBrokerModal(true);
      }, 600);
    }
  };

  return (
    <div className="space-y-20 pb-12 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-brand-mint-bg border border-brand-mint/40 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-ping" />
              <span className="font-display text-[10px] sm:text-xs font-black tracking-widest text-brand-mint uppercase">
                Đồng hành giao dịch thực chiến
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
              GIAO DỊCH KỶ LUẬT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-mint via-[#ffe58f] to-brand-mint">
                HẠN MỨC KHỦNG
              </span> <br />
              CHIA THƯỞNG TỚI <span className="text-brand-mint">80%</span>
            </h1>

            <p className="text-brand-gray-light text-sm sm:text-base md:text-lg max-w-2xl font-sans font-light leading-relaxed">
              Chứng minh năng lực quản trị rủi ro để nhận đặc quyền hạn mức giao dịch lớn và giữ lại tới 80% lợi nhuận trong môi trường chuyên nghiệp nhất.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleScrollToOpenAccount}
                className="px-6 py-4 bg-brand-mint text-brand-bg font-display font-black text-xs sm:text-sm tracking-wider rounded-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,225,161,0.4)] hover:bg-white transform hover:-translate-y-0.5 text-center uppercase"
                id="hero-cta-btn"
              >
                [ THAM GIA THỬ THÁCH - MỞ TÀI KHOẢN NGAY ]
              </button>
            </div>
          </div>

          {/* Right Image Display */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="relative z-10 rounded-lg overflow-hidden border border-brand-surface-bright/80 shadow-[0_0_50px_rgba(4,45,32,0.6)]">
              <img
                src={cyberMascotsImg}
                alt="Cyber Trading Terminal Mascots"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/60 via-transparent to-transparent pointer-events-none" />
            </div>
            {/* Ambient glows behind the image */}
            <div className="absolute -inset-4 bg-brand-mint/5 rounded-full filter blur-2xl pointer-events-none" />
          </div>

        </div>
      </section>


      {/* Ticker Marquee Banner */}
      <section className="w-full bg-[#0a0907] border-y border-brand-mint/20 overflow-hidden py-3.5 shadow-[0_0_20px_rgba(255,208,44,0.05)]">
        <div className="relative w-full flex items-center">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Set 1 */}
            <div className="flex items-center space-x-12 pr-12 flex-shrink-0">
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-mint tracking-wider uppercase">
                <Zap className="w-4 h-4 text-brand-mint" />
                <span>Tối ưu hiệu quả giao dịch</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-white tracking-wider uppercase">
                <Shield className="w-4 h-4 text-brand-mint" />
                <span>Bắt đầu giao dịch như người chuyên nghiệp</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-mint tracking-wider uppercase">
                <Activity className="w-4 h-4 text-brand-mint" />
                <span>Giao dịch theo tiêu chuẩn rõ ràng</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-white tracking-wider uppercase">
                <Info className="w-4 h-4 text-brand-mint" />
                <span>Được trang bị kiến thức bài bản</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-gold tracking-wider uppercase">
                <Award className="w-4 h-4 text-brand-gold" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-white to-brand-gold">Trader giỏi nhận ưu đãi hạn mức lớn</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
            </div>
            {/* Set 2 */}
            <div className="flex items-center space-x-12 pr-12 flex-shrink-0">
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-mint tracking-wider uppercase">
                <Zap className="w-4 h-4 text-brand-mint" />
                <span>Tối ưu hiệu quả giao dịch</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-white tracking-wider uppercase">
                <Shield className="w-4 h-4 text-brand-mint" />
                <span>Bắt đầu giao dịch như người chuyên nghiệp</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-mint tracking-wider uppercase">
                <Activity className="w-4 h-4 text-brand-mint" />
                <span>Giao dịch theo tiêu chuẩn rõ ràng</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-white tracking-wider uppercase">
                <Info className="w-4 h-4 text-brand-mint" />
                <span>Được trang bị kiến thức bài bản</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
              <span className="flex items-center space-x-2 text-xs sm:text-sm font-display font-black text-brand-gold tracking-wider uppercase">
                <Award className="w-4 h-4 text-brand-gold" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-white to-brand-gold">Trader giỏi nhận ưu đãi hạn mức lớn</span>
              </span>
              <span className="text-brand-gray/40 font-bold">✦</span>
            </div>
          </div>
        </div>
      </section>


      {/* 2. THREE PRINCIPLES */}
      <section className="bg-brand-container/50 border-y border-brand-surface-bright/35 py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase">
              3 NGUYÊN TẮC VÀNG TẠI BOOTCAMP
            </h2>
            <p className="text-brand-gray text-xs sm:text-sm font-sans max-w-xl mx-auto">
              Liên hệ tư vấn môi giới để mở tài khoản và bắt đầu ngay hôm nay!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-brand-surface border border-brand-surface-bright hover:border-brand-mint/50 p-6 rounded-lg transition-all duration-300 flex flex-col space-y-4 group">
              <div className="bg-brand-mint-bg w-12 h-12 rounded flex items-center justify-center border border-brand-mint/20 group-hover:border-brand-mint/40 transition-colors">
                <Shield className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase">
                KỶ LUẬT LÀ SỨC MẠNH
              </h3>
              <p className="text-brand-gray-light text-xs sm:text-sm leading-relaxed font-sans">
                Giới hạn sụt giảm <span className="text-brand-mint font-bold">Max Drawdown &lt; 7%</span> để bảo vệ vốn tuyệt đối. Mọi vi phạm quy tắc quản trị rủi ro sẽ buộc dừng cuộc chơi ngay lập tức nhằm rèn luyện tư duy kỷ luật thép.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-brand-surface border border-brand-surface-bright hover:border-brand-mint/50 p-6 rounded-lg transition-all duration-300 flex flex-col space-y-4 group">
              <div className="bg-brand-mint-bg w-12 h-12 rounded flex items-center justify-center border border-brand-mint/20 group-hover:border-brand-mint/40 transition-colors">
                <TrendingUp className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase">
                HIỆU SUẤT LÀ THƯỚC ĐO
              </h3>
              <p className="text-brand-gray-light text-xs sm:text-sm leading-relaxed font-sans">
                Mục tiêu đạt tỷ suất lợi nhuận <span className="text-brand-mint font-bold">Lãi ≥ 5% NAV</span> theo quy tắc giao dịch bắt buộc là điều kiện tiên quyết để bạn chứng minh năng lực thăng hạng vào Vòng 2.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-brand-surface border border-brand-surface-bright hover:border-brand-mint/50 p-6 rounded-lg transition-all duration-300 flex flex-col space-y-4 group">
              <div className="bg-brand-mint-bg w-12 h-12 rounded flex items-center justify-center border border-brand-mint/20 group-hover:border-brand-mint/40 transition-colors">
                <Award className="w-6 h-6 text-brand-mint" />
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase">
                CHIA SẺ LÀ ĐỘNG LỰC
              </h3>
              <p className="text-brand-gray-light text-xs sm:text-sm leading-relaxed font-sans">
                Cơ chế chia sẻ lợi nhuận <span className="text-brand-mint font-bold">lên tới 80%</span> cho những cá nhân giao dịch xuất sắc và tuân thủ tuyệt đối quy tắc. Càng kỷ luật bền vững, phần thưởng tài chính càng lớn.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* 3. TRADER ROADMAP */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase">
            LỘ TRÌNH THĂNG TIẾN TRADER
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-sans max-w-xl mx-auto">
            Hệ thống thăng hạng chuyên nghiệp dựa trên năng lực quản trị rủi ro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Phase 1: Vong 1 */}
          <div className="bg-brand-container border border-brand-surface-bright rounded-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-surface-bright/30 border-b border-l border-brand-surface-bright px-4 py-1 rounded-bl text-[10px] font-bold text-brand-gray uppercase tracking-widest font-display">
              Chặng 1
            </div>

            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 bg-brand-surface text-brand-mint border border-brand-mint/30 rounded text-[10px] font-black tracking-widest uppercase font-display">
                Giai Đoạn Sàng Lọc
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
                VÒNG 1: THỬ THÁCH KỶ LUẬT (2 THÁNG)
              </h3>
              <div className="flex items-center space-x-2 text-brand-mint text-xs sm:text-sm font-bold font-display">
                <TrendingUp className="w-4 h-4 text-brand-mint" />
                <div className="flex items-center space-x-1.5">
                  <span>Mục tiêu: Lãi ≥ 5% NAV để thăng hạng.</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Mục tiêu lợi nhuận (Profit Target):</strong> Đạt mức lợi nhuận ròng tối thiểu +5.0% NAV để đủ điều kiện thăng hạng lên Vòng 2.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats box */}
            <div className="grid grid-cols-2 gap-4 bg-brand-surface/80 p-4 rounded border border-brand-surface-bright/40 font-display">
              <div>
                <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider block">NAV tối thiểu</span>
                <span className="text-base sm:text-lg font-black text-white">30 triệu VND</span>
                <span className="text-[10px] text-brand-gray block font-sans font-light leading-snug mt-0.5">Nạp vào tài khoản CTCK chỉ định</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider block">Chia thưởng</span>
                <span className="text-base sm:text-lg font-black text-brand-mint">1 triệu / người</span>
                <span className="text-[10px] text-brand-gray block font-sans font-light leading-snug mt-0.5">Áp dụng cho Top 10 trader xuất sắc</span>
              </div>
            </div>

            {/* Rules checklist */}
            <div className="space-y-3 font-display text-xs">
              <div className="text-[10px] uppercase tracking-wider text-brand-gray font-black">QUY TẮC GIAO DỊCH BẮT BUỘC:</div>
              
              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Giới hạn sụt giảm ngày</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Max Daily Drawdown:</strong> -4.0% NAV đầu ngày. Biên trần/sàn HSX là 7%, mức 4% sẽ ép trader buộc phải phân bổ danh mục (tối thiểu 2-3 mã) thay vì tất tay 1 mã đầu cơ.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-red font-bold">-4.0% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Giới hạn sụt giảm tổng</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Max Overall Drawdown:</strong> -8.0% NAV tính từ mốc NAV gốc ban đầu.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-red font-bold">-8.0% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Số ngày giao dịch tối thiểu</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Min Trading Days:</strong> Phải có tối thiểu 15 ngày phát sinh vị thế thực tế để đảm bảo tính đều tay, kỷ luật lâu dài và loại bỏ yếu tố may rủi.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">15 ngày</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Quy tắc đa dạng hóa</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Diversification Rule:</strong> Không mua phân bổ quá 40% NAV vào một mã cổ phiếu đơn lẻ duy nhất tại bất kỳ thời điểm nào.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">Max 40% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Quy tắc nhất quán</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Consistency Rule:</strong> Lợi nhuận từ một mã cổ phiếu duy nhất không được chiếm quá 40% tổng mục tiêu lợi nhuận của toàn vòng.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">Lãi mã &lt; 40%</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Bộ lọc thanh khoản</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Liquidity Filter:</strong> Chỉ được giao dịch các mã thuộc rổ VN100 hoặc có khối lượng giao dịch trung bình 20 phiên &gt; 200.000 cổ phiếu/phiên để tránh rủi ro kẹt thanh khoản.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-mint font-bold">VN100 / &gt;200k</span>
              </div>
            </div>

            <p className="text-[10px] text-brand-gray italic font-sans leading-relaxed">
              (*) Hiệu suất lớn hơn hoặc bằng quy tắc & tiêu chuẩn quy định tại Vòng 1.
            </p>
          </div>

          {/* Phase 2: Vong 2 */}
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(255,208,44,0.05)]">
            <div className="absolute top-0 right-0 bg-brand-mint/10 border-b border-l border-brand-mint/20 px-4 py-1 rounded-bl text-[10px] font-bold text-brand-mint uppercase tracking-widest font-display">
              Chặng 2
            </div>

            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 bg-brand-mint-bg text-brand-mint border border-brand-mint/50 rounded text-[10px] font-black tracking-widest uppercase font-display">
                Giai Đoạn Tăng Trưởng
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
                VÒNG 2: TĂNG TRƯỞNG CHUYÊN NGHIỆP
              </h3>
              <div className="flex items-center space-x-2 text-[#ffe58f] text-xs sm:text-sm font-bold font-display">
                <TrendingUp className="w-4 h-4 text-[#ffe58f]" />
                <div className="flex items-center space-x-1.5">
                  <span>Mục tiêu: Tối ưu hóa lợi nhuận - Càng cao càng tốt.</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Mục tiêu lợi nhuận (Profit Target):</strong> Không giới hạn trần lợi nhuận. Tối ưu hoá hiệu suất giao dịch để nhận được phần chia thưởng 80% từ tài khoản uỷ thác.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats box */}
            <div className="grid grid-cols-2 gap-4 bg-brand-surface/80 p-4 rounded border border-brand-surface-bright/40 font-display">
              <div>
                <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider block">Hạn mức</span>
                <span className="text-base sm:text-lg font-black text-brand-mint">x10 lần vốn</span>
                <span className="text-[10px] text-brand-gray block font-sans font-light leading-snug mt-0.5">Được cấp vốn ủy thác từ học viện</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider block">Chia thưởng</span>
                <span className="text-base sm:text-lg font-black text-brand-gold">80% Lợi nhuận</span>
                <span className="text-[10px] text-brand-gray block font-sans font-light leading-snug mt-0.5">Khấu trừ định kỳ 2 tháng một lần</span>
              </div>
            </div>

            {/* Rules checklist */}
            <div className="space-y-3 font-display text-xs">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-brand-gray font-black">
                <span>QUY TẮC GIAO DỊCH BẮT BUỘC:</span>
                <span className="text-brand-mint font-mono font-bold">REVIEW 2 THÁNG/LẦN</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Giới hạn sụt giảm ngày</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Max Daily Drawdown:</strong> -4.0% NAV đầu ngày. Biên trần/sàn HSX là 7%, mức 4% sẽ ép trader buộc phải phân bổ danh mục (tối thiểu 2-3 mã) thay vì tất tay 1 mã đầu cơ.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-red font-bold">-4.0% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Giới hạn sụt giảm tổng</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Max Overall Drawdown:</strong> -8.0% NAV tính từ mốc NAV gốc ban đầu.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-red font-bold">-8.0% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Số ngày giao dịch tối thiểu</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Min Trading Days:</strong> Phải có tối thiểu 15 ngày phát sinh vị thế thực tế để đảm bảo tính đều tay, kỷ luật lâu dài và loại bỏ yếu tố may rủi.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">15 ngày</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Quy tắc đa dạng hóa</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Diversification Rule:</strong> Không mua phân bổ quá 40% NAV vào một mã cổ phiếu đơn lẻ duy nhất tại bất kỳ thời điểm nào.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">Max 40% NAV</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-brand-surface-bright/30">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Quy tắc nhất quán</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Consistency Rule:</strong> Lợi nhuận từ một mã cổ phiếu duy nhất không được chiếm quá 40% tổng mục tiêu lợi nhuận của toàn vòng.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">Lãi mã &lt; 40%</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-brand-gray-light">Bộ lọc thanh khoản</span>
                  <div className="relative group">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                      <strong>Liquidity Filter:</strong> Chỉ được giao dịch các mã thuộc rổ VN100 hoặc có khối lượng giao dịch trung bình 20 phiên &gt; 200.000 cổ phiếu/phiên để tránh rủi ro kẹt thanh khoản.
                    </div>
                  </div>
                </div>
                <span className="font-mono text-brand-mint font-bold">VN100 / &gt;200k</span>
              </div>
            </div>

            <button
              onClick={handleScrollToRegister}
              className="w-full py-3.5 bg-brand-mint-bg border border-brand-mint hover:bg-brand-mint/20 text-brand-mint font-display text-xs font-black tracking-wider rounded transition-colors uppercase"
            >
              Tham gia thi đấu nhận hạn mức ngay
            </button>
          </div>

        </div>

      </section>


      {/* 4. PROPRIETARY RISK TOOL */}
      <section className="bg-brand-container/30 border-y border-brand-surface-bright/30 py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Visual Tool Mock */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative z-10 rounded-lg overflow-hidden border border-brand-surface-bright shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <img
                src={riskToolImg}
                alt="Stock Trading Risk Management Tool Screenshot"
                className="w-full h-auto object-cover transform hover:scale-[1.03] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -inset-4 bg-brand-mint/5 rounded-full filter blur-2xl pointer-events-none" />
          </div>

          {/* Right Text */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <span className="inline-block px-3 py-1 bg-brand-mint-bg text-brand-mint border border-brand-mint/30 rounded text-[10px] font-black tracking-widest uppercase font-display">
              Công cụ đồng hành đặc quyền
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase leading-snug">
              CÔNG CỤ QUẢN TRỊ <br />
              RỦI RO ĐỘC QUYỀN
            </h2>
            <p className="text-brand-gray-light text-sm sm:text-base font-sans font-light leading-relaxed">
              Công cụ tính toán vị thế giao dịch dựa trên rủi ro, theo dõi tự động drawdown tài khoản theo thời gian thực và quản lý nhật ký giao dịch một cách chi tiết nhất. Bản Excel độc quyền được thiết kế dành riêng cho học viên Pro Trader Bootcamp.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setShowToolModal(true)}
                className="px-6 py-3.5 bg-brand-mint text-brand-bg font-display font-black text-xs sm:text-sm tracking-wider rounded transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,225,161,0.35)] flex items-center space-x-2 border border-transparent hover:border-brand-mint hover:bg-transparent hover:text-brand-mint uppercase"
              >
                <Download className="w-5 h-5" />
                <span>[ Nhận File Excel Miễn Phí Qua Zalo ]</span>
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* 5. INTERACTIVE SLIDER RISK CALCULATOR */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase">
            MÁY TÍNH HẠN MỨC GIAO DỊCH & RỦI RO
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-sans max-w-2xl mx-auto">
            Kéo thanh trượt để điều chỉnh số vốn tham gia thử thách ban đầu của bạn và xem các thông số tính toán rủi ro kỷ luật cũng như hạn mức ưu đãi nhận được:
          </p>
        </div>

        <div className="bg-brand-container border border-brand-surface-bright rounded-lg p-6 sm:p-8 space-y-8">
          
          {/* Slider input */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="font-display font-bold text-xs uppercase text-brand-gray tracking-wider">
                CHỌN VỐN GIAO DỊCH BAN ĐẦU (VÒNG 1):
              </label>
              <div className="font-mono text-2xl sm:text-3xl font-black text-brand-mint flex items-baseline">
                <span>{formatNumberWithDots(capital / 1000000)}</span>
                <span className="text-xs sm:text-sm text-brand-gray ml-1">triệu VND</span>
              </div>
            </div>

            <div className="relative pt-2">
              <input
                type="range"
                min={30000000}
                max={500000000}
                step={10000000}
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full h-2 bg-brand-surface-bright rounded-lg appearance-none cursor-pointer accent-brand-mint focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #ffd02c 0%, #ffd02c ${((capital - 30000000) / (500000000 - 30000000)) * 100}%, #353127 ${((capital - 30000000) / (500000000 - 30000000)) * 100}%, #353127 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-brand-gray font-mono mt-2">
                <span>30 TRIỆU</span>
                <span>100 TRIỆU</span>
                <span>200 TRIỆU</span>
                <span>300 TRIỆU</span>
                <span>400 TRIỆU</span>
                <span>500 TRIỆU</span>
              </div>
            </div>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Info: How it works */}
            <div className="lg:col-span-5 bg-brand-surface/50 border border-brand-surface-bright p-6 rounded-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-brand-mint font-display font-bold text-sm uppercase tracking-wide border-b border-brand-surface-bright/40 pb-3">
                  <Activity className="w-5 h-5" />
                  <span>* Công thức vận hành:</span>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-brand-gray-light font-sans leading-relaxed">
                  <li className="flex items-start">
                    <span className="text-brand-mint mr-2">•</span>
                    <span>Giới hạn sụt giảm tài khoản bảo vệ vốn luôn giữ ở mức <strong className="text-white font-medium">7% NAV</strong>.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-mint mr-2">•</span>
                    <span>Hạn mức giao dịch ưu đãi tại Chặng 2 gấp <strong className="text-white font-medium">10 lần</strong> số vốn nạp thực tế ban đầu.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-mint mr-2">•</span>
                    <span>Tỷ lệ chia sẻ lợi nhuận tại Chặng 2 lên đến <strong className="text-white font-medium">80%</strong> cho học viên xuất sắc.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-surface-bright/30 flex items-center space-x-2 text-[11px] text-brand-gray font-sans italic">
                <Info className="w-4 h-4 text-brand-mint" />
                <span>Số vốn ban đầu càng lớn, hạn mức cấp bổ sung và bộ đệm rủi ro càng mở rộng.</span>
              </div>
            </div>

            {/* Right Info: Live Calculated Stats */}
            <div className="lg:col-span-7 bg-brand-surface border border-brand-surface-bright p-6 rounded-lg space-y-6">
              <div className="font-display font-bold text-sm uppercase text-brand-gray-light tracking-wide border-b border-brand-surface-bright/50 pb-3">
                Thông Số Tính Toán
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Stat 1 */}
                <div className="bg-[#1a1813] border border-brand-surface-bright/50 p-4 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">
                    Giới hạn sụt giảm tối đa (7%):
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-brand-red mt-1.5">
                    {formatNumberWithDots(Math.floor(capital * 0.07))} đ
                  </div>
                  <span className="text-[10px] text-brand-gray mt-1 block">
                    Bộ đệm rủi ro an toàn tuyệt đối
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="bg-[#1a1813] border border-brand-surface-bright/50 p-4 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">
                    Hạn mức siêu ưu đãi (Vòng 2 - x10):
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-brand-mint mt-1.5">
                    {formatNumberWithDots(capital * 10)} đ
                  </div>
                  <span className="text-[10px] text-brand-gray mt-1 block">
                    Vốn ủy thác cấp bổ sung từ học viện
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="bg-[#1a1813] border border-brand-surface-bright/50 p-4 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">
                    Hạn mức đặc quyền Pro (Vòng 3):
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-brand-gold mt-1.5">
                    {formatNumberWithDots(capital * 4)} đ
                  </div>
                  <span className="text-[10px] text-brand-gray mt-1 block">
                    Hạn mức tối đa được nâng cấp tiếp
                  </span>
                </div>

                {/* Stat 4 */}
                <div className="bg-[#1a1813] border border-brand-surface-bright/50 p-4 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">
                    Cơ chế chia sẻ lợi nhuận:
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-white mt-1.5">
                    80% / 20%
                  </div>
                  <span className="text-[10px] text-brand-mint font-display font-medium mt-1 block">
                    Bạn nhận về 80% lợi nhuận
                  </span>
                </div>

              </div>

              {/* Simulation CTA */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full py-3.5 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-widest rounded transition-colors flex items-center justify-center space-x-2 uppercase"
              >
                <Zap className="w-4 h-4" />
                <span>Chạy Thử Nghiệm Mô Phỏng Giao Dịch Thực Tế Với Số Vốn Này</span>
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* 6. HOW TO START */}
      <section className="bg-brand-container border-y border-brand-surface-bright/30 py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase">
              CÁC BƯỚC ĐỂ BẮT ĐẦU
            </h2>
            <p className="text-brand-gray text-xs sm:text-sm font-sans max-w-xl mx-auto">
              Lộ trình đơn giản để bạn trở thành một Pro Trader thực thụ tại Bootcamp 2026
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Step 1 */}
            <div className="bg-brand-surface border border-brand-surface-bright p-5 rounded-lg flex flex-col items-center text-center space-y-4 relative">
              <div className="bg-brand-surface-bright border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-brand-mint text-sm">
                1
              </div>
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">
                ĐIỀN ĐƠN ĐĂNG KÝ
              </h3>
              <p className="text-brand-gray text-xs font-sans font-light leading-relaxed">
                Hoàn tất đầy đủ thông tin cá nhân chính xác tại biểu mẫu đăng ký bên dưới.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-brand-surface border border-brand-surface-bright p-5 rounded-lg flex flex-col items-center text-center space-y-4 relative">
              <div className="bg-brand-surface-bright border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-brand-mint text-sm">
                2
              </div>
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">
                MỞ TÀI KHOẢN
              </h3>
              <p className="text-brand-gray text-xs font-sans font-light leading-relaxed">
                Đăng ký mở tài khoản giao dịch chứng khoán qua link chỉ định của công ty đối tác.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-brand-surface border border-brand-surface-bright p-5 rounded-lg flex flex-col items-center text-center space-y-4 relative">
              <div className="bg-brand-surface-bright border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-brand-mint text-sm">
                3
              </div>
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">
                KẾT NỐI TƯ VẤN
              </h3>
              <p className="text-brand-gray text-xs font-sans font-light leading-relaxed">
                Liên hệ Hotline hoặc Zalo hỗ trợ để được hướng dẫn kích hoạt tài khoản thử thách.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-brand-surface border border-brand-surface-bright p-5 rounded-lg flex flex-col items-center text-center space-y-4 relative">
              <div className="bg-brand-surface-bright border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-brand-mint text-sm">
                4
              </div>
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">
                THAM GIA CỘNG ĐỒNG
              </h3>
              <p className="text-brand-gray text-xs font-sans font-light leading-relaxed">
                Gia nhập kênh Discord và Zalo nhóm Lion Invest để nhận tài liệu độc quyền mỗi ngày.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-brand-surface border border-brand-surface-bright p-5 rounded-lg flex flex-col items-center text-center space-y-4 relative">
              <div className="bg-brand-surface-bright border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-brand-mint text-sm">
                5
              </div>
              <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">
                BẮT ĐẦU CUỘC ĐUA
              </h3>
              <p className="text-brand-gray text-xs font-sans font-light leading-relaxed">
                Bắt đầu giao dịch kỷ luật rủi ro, hoàn thành mục tiêu để nhận giải thưởng và thăng hạng.
              </p>
            </div>

          </div>

          <div id="open-account-section" className="flex justify-center pt-4">
            <button
              onClick={() => setShowBrokerModal(true)}
              className="px-8 py-4 bg-brand-mint text-brand-bg font-display font-black text-xs tracking-wider rounded-md transition-all hover:bg-white transform hover:scale-102 uppercase shadow-[0_0_20px_rgba(0,225,161,0.2)]"
            >
              MỞ TÀI KHOẢN NGAY
            </button>
          </div>

        </div>
      </section>


      {/* 7. REGISTRATION & BENEFITS */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="registration-section">
        
        {/* Left Column: Benefits checklist */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase leading-snug">
              ĐĂNG KÝ THAM GIA <br />
              NHẬN QUÀ TẶNG <br />
              <span className="text-brand-mint">BẢO VỆ VỐN</span>
            </h2>
            <p className="text-brand-gray-light text-sm sm:text-base font-sans font-light leading-relaxed">
              Hoàn tất đăng ký ngay hôm nay để bắt đầu hành trình huấn luyện chuyên nghiệp hóa kỹ năng quản trị rủi ro & giao dịch kỷ luật của bạn.
            </p>
          </div>

          {/* Stepper details */}
          <div className="space-y-6">
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-brand-mint/10 border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono text-brand-mint text-sm font-black">
                1
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase">Đăng ký thành công</h4>
                <p className="text-brand-gray text-xs sm:text-sm font-sans leading-relaxed">
                  Hệ thống tự động ghi nhận dữ liệu của bạn và cấp mã định danh học viên trực tiếp.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-brand-mint/10 border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono text-brand-mint text-sm font-black">
                2
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase">Kết bạn Zalo xác nhận</h4>
                <p className="text-brand-gray text-xs sm:text-sm font-sans leading-relaxed">
                  Đội ngũ chuyên viên Broker liên hệ trực tiếp trong vòng 5-10 phút để hỗ trợ làm thủ tục.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-brand-mint/10 border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono text-brand-mint text-sm font-black">
                3
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase">Nhận File Quản trị độc quyền</h4>
                <p className="text-brand-gray text-xs sm:text-sm font-sans leading-relaxed">
                  Nhận ngay link tải file Excel Nhật ký rủi ro & Quản trị vị thế giao dịch thực chiến miễn phí.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-brand-mint/10 border border-brand-mint/30 w-10 h-10 rounded-full flex items-center justify-center font-mono text-brand-mint text-sm font-black">
                4
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white uppercase">Bắt đầu thử thách thăng hạng</h4>
                <p className="text-brand-gray text-xs sm:text-sm font-sans leading-relaxed">
                  Nạp tối thiểu 30 triệu VND vào tài khoản cá nhân chứng khoán tự quản và tranh tài kỷ luật cùng cộng đồng.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-6 bg-brand-container border border-brand-surface-bright p-6 sm:p-8 rounded-lg space-y-6 relative">
          
          <div className="text-center space-y-2">
            <h3 className="font-display font-black text-xl text-white uppercase">
              ĐƠN ĐĂNG KÝ THAM GIA
            </h3>
            <p className="text-brand-gray text-xs font-sans">
              Bắt đầu hành trình Pro Trader kỷ luật ngay hôm nay
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-brand-surface border border-brand-mint/30 p-6 rounded text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-brand-mint/10 border border-brand-mint/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-brand-mint" />
              </div>
              <h4 className="font-display font-black text-lg text-white uppercase">
                Đăng Ký Thành Công!
              </h4>
              <p className="text-brand-gray-light text-xs sm:text-sm font-sans max-w-sm mx-auto leading-relaxed">
                Xin chào <strong className="text-white">{submittedName}</strong>, chúng tôi đã ghi nhận đăng ký thử thách của bạn. Chuyên viên tư vấn sẽ liên hệ qua số điện thoại <strong className="text-white">{phoneNumber}</strong> (Zalo) của bạn sau ít phút.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFullName('');
                  setPhoneNumber('');
                  setBrokerCode('');
                }}
                className="px-4 py-2 bg-brand-surface-bright text-white hover:bg-brand-surface border border-brand-surface-bright rounded text-xs font-bold font-display"
              >
                ĐĂNG KÝ MỚI
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                  Số điện thoại (Zalo) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0901 234 567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                  Môi giới quản lý / Mã Broker *
                </label>
                <select
                  required
                  value={brokerCode}
                  onChange={(e) => setBrokerCode(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all"
                >
                  <option value="" disabled className="bg-brand-container text-brand-gray">-- Chọn Môi giới hoặc tùy chọn khác --</option>
                  <option value="0011000306" className="bg-brand-container text-white">Trịnh Thị Anh Thư (Mã: 0011000306)</option>
                  <option value="0011000776" className="bg-brand-container text-white">Lê Vũ Tú Trinh (Mã: 0011000776)</option>
                  <option value="0011000297" className="bg-brand-container text-white">Nguyễn Minh Quang (Mã: 0011000297)</option>
                  <option value="Khác" className="bg-brand-container text-white">Khác (Không có / Môi giới tự do)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-widest rounded transition-all transform hover:scale-[1.01] uppercase glow-mint"
                >
                  KÍCH HOẠT THỬ THÁCH
                </button>
              </div>

              <div className="text-[10px] text-center text-brand-gray leading-normal border-t border-brand-surface-bright/40 pt-4 font-sans">
                ⚠️ Đã có 18 TRADER tại phòng giao dịch đăng ký thành công. <br />
                Chỉ còn trống <strong className="text-brand-mint font-bold">32 suất</strong> tham gia thử thách chặng này.
              </div>

            </form>
          )}

        </div>

      </section>


      {/* 8. SUPPORT & COMMUNITY */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-container border border-brand-mint/20 rounded-lg p-6 sm:p-10 text-center space-y-6 shadow-[0_0_30px_rgba(0,225,161,0.02)]">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            HỖ TRỢ & CỘNG ĐỒNG
          </h2>
          <p className="text-brand-gray-light text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
            Kết nối trực tiếp với đội ngũ chuyên gia môi giới hỗ trợ 24/7 và gia nhập cộng đồng Trader Lion Invest để nhận các phân tích thị trường cùng tài liệu độc quyền.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 font-display">
            {/* Hotline Broker */}
            <a
              href="tel:0563959999"
              className="flex items-center space-x-3 bg-brand-surface border border-brand-surface-bright hover:border-brand-mint px-6 py-3.5 rounded text-xs font-black text-brand-mint tracking-wider transition-colors w-full sm:w-auto justify-center"
            >
              <Phone className="w-4 h-4" />
              <span>HOTLINE BROKER: 056 395 9999</span>
            </a>

            {/* Discord Link */}
            <a
              href="https://discord.gg/5nMrdAWxE"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 bg-brand-mint hover:bg-white px-6 py-3.5 rounded text-xs font-black text-brand-bg tracking-wider transition-colors w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
              </svg>
              <span>CỘNG ĐỒNG: LION INVEST DISCORD</span>
            </a>
          </div>
        </div>
      </section>


      {/* --- POPUP MODAL: RECEIVE FILE EXCEL VIA ZALO --- */}
      {showToolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowToolModal(false)} />
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 max-w-md w-full relative z-10 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-brand-mint/10 border border-brand-mint/20 rounded-full flex items-center justify-center mx-auto text-brand-mint">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase">
                TẢI FILE EXCEL QUẢN TRỊ RỦI RO
              </h3>
              <p className="text-brand-gray text-xs font-sans">
                Vui lòng nhập số điện thoại Zalo của bạn để hệ thống tự động gửi link tải file Excel đặc quyền miễn phí.
              </p>
            </div>

            <form onSubmit={handleToolRequestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-wider font-display">
                  Số điện thoại Zalo của bạn:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0901 234 567"
                  value={toolPhone}
                  onChange={(e) => setToolPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowToolModal(false)}
                  className="flex-1 py-2.5 bg-brand-surface hover:bg-brand-surface-bright border border-brand-surface-bright text-white font-display text-xs font-bold rounded transition-colors uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={toolSubmitted}
                  className="flex-1 py-2.5 bg-brand-mint hover:bg-white text-brand-bg font-display text-xs font-black rounded transition-colors uppercase"
                >
                  {toolSubmitted ? 'Đang gửi...' : 'Xác nhận nhận file'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


      {/* --- POPUP MODAL: CHOOSE BROKER / OPEN ACCOUNT --- */}
      {showBrokerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowBrokerModal(false)} />
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 max-w-lg w-full relative z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-brand-mint/10 border border-brand-mint/20 rounded-full flex items-center justify-center mx-auto text-brand-mint">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase">
                MỞ TÀI KHOẢN CTCK KB SECURITIES (KBSV)
              </h3>
              <p className="text-brand-gray text-xs font-sans">
                Đăng ký mở tài khoản giao dịch ưu đãi tại đối tác Công ty Chứng khoán chính thức cho giải đấu Bootcamp 2026:
              </p>
            </div>

            <div className="space-y-4 animate-fade-in">
              
              {/* Sub-broker Selection Cards */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-wider font-display">
                  CHỌN MÔI GIỚI HỖ TRỢ (KBSV):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {kbsvBrokers.map((broker, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedKbsvBroker(idx)}
                      className={`py-2.5 px-1 text-[10px] font-bold font-display rounded border text-center transition-all leading-tight ${
                        selectedKbsvBroker === idx
                          ? 'bg-brand-mint-bg text-brand-mint border-brand-mint shadow-[0_0_8px_rgba(255,208,44,0.15)]'
                          : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white'
                      }`}
                    >
                      <div>{broker.name}</div>
                      <div className="font-mono text-[8px] text-brand-gray mt-0.5">ID: {broker.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected KBSV Broker Details Card */}
              <div className="bg-brand-surface border border-brand-mint/40 p-5 rounded-lg space-y-4 relative overflow-hidden group hover:border-brand-mint transition-all">
                <div className="absolute top-0 right-0 bg-brand-mint/10 border-b border-l border-brand-mint/20 px-3 py-1 rounded-bl text-[9px] font-black text-brand-mint uppercase tracking-widest font-display">
                  ĐỐI TÁC CHÍNH THỨC
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-display font-black text-white">CTCK KB SECURITIES (KBSV)</span>
                    <span className="text-[10px] bg-brand-mint text-brand-bg px-2 py-0.5 rounded font-bold font-display uppercase tracking-wider">
                      KBSV
                    </span>
                  </div>
                  <p className="text-brand-gray-light text-xs font-sans leading-relaxed">
                    Sử dụng điện thoại để quét mã QR bên dưới hoặc quét trong ứng dụng **KB Buddy** để mở tài khoản eKYC liên kết trực tiếp với mã môi giới hỗ trợ.
                  </p>
                </div>

                {/* Broker Info Matrix */}
                <div className="grid grid-cols-2 gap-3 bg-brand-container border border-brand-surface-bright/50 p-3 rounded font-display text-xs">
                  <div>
                    <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider block">Broker Phụ Trách:</span>
                    <span className="font-bold text-white uppercase">{kbsvBrokers[selectedKbsvBroker].name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider block">Mã Số Broker (ID):</span>
                    <span className="font-mono font-bold text-brand-mint">{kbsvBrokers[selectedKbsvBroker].id}</span>
                  </div>
                </div>

                {/* Dynamic QR Code display */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-brand-surface-bright/50 max-w-[200px] mx-auto shadow-[0_0_20px_rgba(255,208,44,0.1)]">
                  <img
                    src={kbsvBrokers[selectedKbsvBroker].qrPath}
                    alt={`QR Code ${kbsvBrokers[selectedKbsvBroker].name}`}
                    className="w-36 h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] text-brand-bg font-black mt-2 uppercase font-display leading-none">
                    {kbsvBrokers[selectedKbsvBroker].name}
                  </span>
                  <span className="text-[9px] text-brand-bg/60 font-mono mt-0.5 leading-none">
                    ID: {kbsvBrokers[selectedKbsvBroker].id}
                  </span>
                </div>

              </div>

            </div>

            <div className="border-t border-brand-surface-bright/50 pt-4 text-[10px] text-brand-gray text-center font-sans leading-relaxed">
              * Sau khi hoàn thành mở tài khoản trực tuyến eKYC, vui lòng chụp lại màn hình số hiệu tài khoản và gửi cho broker phụ trách để nhận phân bổ phòng giao dịch.
            </div>

            <button
              onClick={() => setShowBrokerModal(false)}
              className="w-full py-2.5 bg-brand-surface hover:bg-brand-surface-bright border border-brand-surface-bright text-white font-display text-xs font-bold rounded transition-colors uppercase"
            >
              Đóng lại
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

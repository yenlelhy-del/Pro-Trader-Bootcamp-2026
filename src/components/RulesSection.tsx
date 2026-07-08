import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Shield, TrendingUp, Award } from 'lucide-react';
import { INITIAL_FAQS } from '../data';
import { BrandConfig } from '../brandConfig';

interface RulesSectionProps {
  brand: BrandConfig;
}

export default function RulesSection({ brand }: RulesSectionProps) {
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'thể_lệ' | 'quản_trị' | 'kỹ_thuật'>('All');

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  // Filter FAQs based on selected category
  const filteredFaqs = INITIAL_FAQS.filter((faq) => {
    if (selectedCategory === 'All') return true;
    return faq.category === selectedCategory;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Title */}
      <div className="border-b border-brand-surface-bright/50 pb-6">
        <div className="inline-flex items-center space-x-1.5 bg-brand-mint-bg border border-brand-mint/30 px-2.5 py-1 rounded">
          <BookOpen className="w-4 h-4 text-brand-mint" />
          <span className="font-display text-[10px] font-bold text-brand-mint tracking-wider uppercase">COMMUNITY RULES</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-2">
          THỂ LỆ CHƯƠNG TRÌNH & HỎI ĐÁP (FAQ)
        </h1>
        <p className="text-brand-gray text-xs sm:text-sm font-sans mt-1">
          Đọc kỹ quy tắc quản trị rủi ro kỷ luật bắt buộc để hiểu rõ các bộ chỉ số đo lường trước khi tham gia cuộc thi.
        </p>
      </div>

      {/* Rules Checklist Deep-Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Daily Drawdown */}
        <div className="bg-brand-container border border-brand-surface-bright p-6 rounded-lg space-y-4">
          <div className="bg-brand-mint-bg w-10 h-10 rounded flex items-center justify-center border border-brand-mint/20 text-brand-mint">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
            LUẬT SỤT GIẢM NGÀY (Max -4.0% NAV)
          </h3>
          <p className="text-xs text-brand-gray-light leading-relaxed font-sans">
            Sụt giảm tài sản ròng tối đa trong ngày không được chạm mức -4.0%. Giá trị này được đo lường dựa trên NAV cao nhất của ngày giao dịch đó (bao gồm cả khoản lỗ từ các trạng thái chưa đóng). Vi phạm sẽ buộc tạm dừng tài khoản ngay lập tức để cơ cấu.
          </p>
          <div className="bg-brand-surface p-3.5 rounded border border-brand-surface-bright/50 text-[11px] font-mono leading-relaxed text-brand-gray-light">
            <span className="text-brand-red font-bold uppercase block mb-1">Ví dụ tính toán:</span>
            <span>Vốn đầu ngày: 100M VND. Lỗ chưa đóng lớn nhất trong phiên chạm 96M VND (tức -4.0M VND) =&gt; Vi phạm lập tức kể cả cuối phiên giá hồi phục.</span>
          </div>
        </div>

        {/* Card 2: Total Drawdown */}
        <div className="bg-brand-container border border-brand-surface-bright p-6 rounded-lg space-y-4">
          <div className="bg-brand-mint-bg w-10 h-10 rounded flex items-center justify-center border border-brand-mint/20 text-brand-mint">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
            LUẬT SỤT GIẢM TỔNG (Max -8.0% NAV)
          </h3>
          <p className="text-xs text-brand-gray-light leading-relaxed font-sans">
            Giới hạn sụt giảm tổng lũy kế tối đa tài khoản không được phép rơi sâu hơn -8.0% so với số tiền nạp ban đầu bắt đầu giải đấu. Đây là mốc ranh giới an toàn tuyệt đối nhằm bảo toàn vốn khả dụng tối thiểu để thăng hạng chặng sau.
          </p>
          <div className="bg-brand-surface p-3.5 rounded border border-brand-surface-bright/50 text-[11px] font-mono leading-relaxed text-brand-gray-light">
            <span className="text-brand-red font-bold uppercase block mb-1">Ví dụ tính toán:</span>
            <span>Nạp ban đầu: 50M VND. Giá trị ròng NAV tài khoản rơi xuống mức thấp hơn 46M VND ở bất kỳ giây nào =&gt; Bạn chính thức bị đình chỉ thi đấu bảo vệ vốn.</span>
          </div>
        </div>

        {/* Card 3: Consistency Rule */}
        <div className="bg-brand-container border border-brand-surface-bright p-6 rounded-lg space-y-4">
          <div className="bg-brand-mint-bg w-10 h-10 rounded flex items-center justify-center border border-brand-mint/20 text-brand-mint">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wider">
            LUẬT NHẤT QUÁN & THANH KHOẢN
          </h3>
          <p className="text-xs text-brand-gray-light leading-relaxed font-sans">
            Tránh trường hợp ăn may 'all-in' vào một mã cổ phiếu đột biến. Lợi nhuận kiếm được từ một mã đơn lẻ không được chiếm quá 40% trong tổng chỉ tiêu thăng hạng 5% NAV. Đồng thời chỉ giao dịch rổ VN100 có thanh khoản an toàn.
          </p>
          <div className="bg-brand-surface p-3.5 rounded border border-brand-surface-bright/50 text-[11px] font-mono leading-relaxed text-brand-gray-light">
            <span className="text-[#8cd6b2] font-bold uppercase block mb-1">Quy định nhất quán:</span>
            <span>Mục tiêu lãi thăng hạng là 2.5M VND. Không có bất kỳ giao dịch một mã đơn lẻ nào được mang lại quá 1M VND lợi nhuận tính vào tổng điểm.</span>
          </div>
        </div>

      </div>

      {/* Accordion FAQs Section */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-surface-bright/50 pb-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-brand-mint" />
            <span className="font-display font-black text-sm uppercase text-white tracking-wider">CÂU HỎI THƯỜNG GẶP (FAQs)</span>
          </div>

          {/* Category Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'All', label: 'TẤT CẢ' },
              { id: 'thể_lệ', label: 'THỂ LỆ' },
              { id: 'quản_trị', label: 'QUẢN TRỊ RỦI RO' },
              { id: 'kỹ_thuật', label: 'KỸ THUẬT' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded font-display text-[10px] font-bold tracking-wider border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-mint text-brand-bg border-brand-mint shadow-[0_0_10px_rgba(0,225,161,0.2)]'
                    : 'bg-brand-surface border-brand-surface-bright text-brand-gray hover:text-white hover:border-brand-gray'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-brand-container border border-brand-surface-bright p-8 rounded text-center text-brand-gray text-xs font-sans">
              Không tìm thấy câu hỏi nào phù hợp với danh mục này.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = activeFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-brand-container border border-brand-surface-bright hover:border-brand-mint/30 rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 flex justify-between items-center space-x-4 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-1.5 h-1.5 bg-brand-mint rounded-full flex-shrink-0" />
                      <span className="font-display font-bold text-xs sm:text-sm tracking-wide">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brand-mint flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-gray flex-shrink-0" />
                    )}
                  </button>

                  {/* Expandable answers */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-gray-light font-sans leading-relaxed border-t border-brand-surface-bright/30 bg-[#0e1713]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}

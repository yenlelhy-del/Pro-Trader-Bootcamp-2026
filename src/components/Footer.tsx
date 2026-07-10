import React from 'react';
import { BrandConfig } from '../brandConfig';

interface FooterProps {
  brand: BrandConfig;
  onAdminClick?: () => void;
}

export default function Footer({ brand, onAdminClick }: FooterProps) {
  return (
    <footer className="bg-brand-container border-t border-brand-surface-bright/50 py-12 mt-12 text-brand-gray">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 border-b border-brand-surface/50 pb-8 mb-8">
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-sm tracking-wider text-white">
                {brand.name}
              </span>
              <span className="font-display font-bold text-sm text-brand-mint">
                {brand.subName}
              </span>
            </div>
            <p className="text-xs text-brand-gray mt-2 max-w-md">
              Học viện đào tạo & phát triển Trader chuyên nghiệp, hướng tới xây dựng cộng đồng giao dịch kỷ luật và bền vững tại thị trường chứng khoán Việt Nam.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-brand-gray-light">
            <a href="#terms" className="hover:text-brand-mint transition-colors">Điều khoản dịch vụ</a>
            <a href="#privacy" className="hover:text-brand-mint transition-colors">Chính sách bảo mật</a>
            <a href="#support" className="hover:text-brand-mint transition-colors">Liên hệ hỗ trợ</a>
            {onAdminClick && (
              <button 
                onClick={onAdminClick}
                className="hover:text-brand-mint transition-colors cursor-pointer text-left focus:outline-none"
              >
                Trang Admin
              </button>
            )}
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[11px] space-y-4 md:space-y-0">
          <p>© 2026 {brand.name} {brand.subName}. All rights reserved. Built for institutional trading discipline.</p>
          <p className="text-brand-gray/60 italic max-w-xl text-center md:text-right">
            Cảnh báo rủi ro: Giao dịch chứng khoán luôn tiềm ẩn rủi ro thua lỗ vốn. Các số liệu mô phỏng và kế hoạch đào tạo nhằm mục đích phát triển kỷ luật giao dịch và không phải là lời khuyên đầu tư tài chính trực tiếp.
          </p>
        </div>
      </div>
    </footer>
  );
}

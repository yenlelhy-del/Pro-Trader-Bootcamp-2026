import React, { useState } from 'react';
import { Search, Filter, Award, CheckCircle, XCircle, ArrowUpRight, AwardIcon, TrendingUp, Shield, HelpCircle, Activity } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { INITIAL_LEADERBOARD } from '../data';

export default function LeaderboardSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'All' | 'Voi' | 'Thỏ'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Passed' | 'Active'>('All');
  const [selectedTrader, setSelectedTrader] = useState<LeaderboardEntry | null>(null);

  // Filter leaderboard based on user criteria
  const filteredLeaderboard = INITIAL_LEADERBOARD.filter((trader) => {
    const matchesSearch = trader.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyle === 'All' || trader.style === selectedStyle;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Passed' && trader.passed) ||
      (selectedStatus === 'Active' && !trader.passed);

    return matchesSearch && matchesStyle && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Title */}
      <div className="border-b border-brand-surface-bright/50 pb-6">
        <div className="inline-flex items-center space-x-1.5 bg-brand-mint-bg border border-brand-mint/30 px-2.5 py-1 rounded">
          <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-ping" />
          <span className="font-display text-[10px] font-bold text-brand-mint tracking-wider uppercase">LIVE STATISTICS</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-2">
          BẢNG XẾP HẠNG TRADER CHUYÊN NGHIỆP
        </h1>
        <p className="text-brand-gray text-xs sm:text-sm font-sans mt-1">
          Bảng vinh danh trực tuyến những chiến binh giữ kỷ luật rủi ro tốt nhất và đạt tỷ suất lợi nhuận xuất sắc tại Bootcamp.
        </p>
      </div>

      {/* Control Filters Block */}
      <div className="bg-brand-container border border-brand-surface-bright p-4 sm:p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-gray">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm họ tên trader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-colors"
          />
        </div>

        {/* Style selection tabs */}
        <div className="md:col-span-4 flex space-x-2">
          {['All', 'Voi', 'Thỏ'].map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style as any)}
              className={`flex-1 py-2.5 text-xs font-bold font-display rounded border transition-all ${
                selectedStyle === style
                  ? 'bg-brand-mint-bg text-brand-mint border-brand-mint'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white'
              }`}
            >
              STYLE: {style === 'All' ? 'TẤT CẢ' : style === 'Voi' ? 'VOI 🐘' : 'THỎ 🐇'}
            </button>
          ))}
        </div>

        {/* Status selection tabs */}
        <div className="md:col-span-4 flex space-x-2">
          {['All', 'Passed', 'Active'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as any)}
              className={`flex-1 py-2.5 text-xs font-bold font-display rounded border transition-all ${
                selectedStatus === status
                  ? 'bg-brand-mint-bg text-brand-mint border-brand-mint'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white'
              }`}
            >
              {status === 'All' ? 'TẤT CẢ TRẠNG THÁI' : status === 'Passed' ? 'ĐÃ THĂNG HẠNG' : 'ĐANG THI ĐẤU'}
            </button>
          ))}
        </div>

      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-brand-container border border-brand-surface-bright rounded-lg overflow-hidden">
        <div className="p-4 border-b border-brand-surface-bright/50 flex justify-between items-center bg-brand-surface-bright/10">
          <span className="font-display font-bold text-xs uppercase text-brand-gray-light">DANH SÁCH BAN VINH DANH</span>
          <span className="font-mono text-[10px] text-brand-gray">HIỂN THỊ: {filteredLeaderboard.length} HỌC VIÊN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-surface-bright/50 text-[10px] uppercase text-brand-gray font-display tracking-wider">
                <th className="p-4 text-center w-16">Hạng</th>
                <th className="py-4">Họ và tên</th>
                <th className="py-4 text-center w-28">Trường Phái</th>
                <th className="py-4 text-right w-28">Tỷ Lệ Thắng</th>
                <th className="py-4 text-right w-24">Số Lệnh</th>
                <th className="py-4 text-right w-36">Lãi lũy kế</th>
                <th className="py-4 text-right w-28">Drawdown Max</th>
                <th className="py-4 text-center w-24">Kết quả</th>
                <th className="p-4 text-center w-20">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-surface-bright/25 font-display text-xs">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-brand-gray font-sans">
                    Không tìm thấy trader nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((trader) => {
                  const isTop3 = trader.rank <= 3;
                  return (
                    <tr
                      key={trader.rank}
                      className="hover:bg-brand-surface/25 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTrader(trader)}
                    >
                      {/* Rank Column */}
                      <td className="p-4 text-center font-mono">
                        {isTop3 ? (
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] mx-auto ${
                            trader.rank === 1 ? 'bg-brand-gold text-brand-bg shadow-[0_0_10px_rgba(255,226,94,0.3)]' :
                            trader.rank === 2 ? 'bg-brand-gray-light text-brand-bg' :
                            'bg-[#cd7f32] text-white'
                          }`}>
                            {trader.rank}
                          </div>
                        ) : (
                          <span className="text-brand-gray">{trader.rank}</span>
                        )}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={trader.avatarUrl}
                            alt={trader.name}
                            className="w-8 h-8 rounded-full border border-brand-surface-bright object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white group-hover:text-brand-mint transition-colors block">
                              {trader.name}
                            </span>
                            <span className="text-[10px] text-brand-gray font-mono">Học viên khóa IV</span>
                          </div>
                        </div>
                      </td>

                      {/* Trading Style Badge */}
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          trader.style === 'Voi'
                            ? 'bg-[#261f0a] text-brand-mint border border-[#3e3415]'
                            : 'bg-brand-mint-bg text-brand-mint border border-brand-mint/20'
                        }`}>
                          {trader.style === 'Voi' ? '🐘 Voi' : '🐇 Thỏ'}
                        </span>
                      </td>

                      {/* Win Rate Progress Bar */}
                      <td className="py-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-mono font-bold text-white">{trader.winRate.toFixed(1)}%</span>
                          <div className="w-16 h-1 bg-brand-surface rounded overflow-hidden mt-1">
                            <div className="bg-brand-mint h-full" style={{ width: `${trader.winRate}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Total Trades */}
                      <td className="py-4 text-right font-mono font-semibold text-brand-gray-light">
                        {trader.totalTrades}
                      </td>

                      {/* Profit growth */}
                      <td className="py-4 text-right font-mono font-black text-brand-mint">
                        +{trader.profitGrowth.toFixed(1)}%
                      </td>

                      {/* Max Drawdown */}
                      <td className="py-4 text-right font-mono font-bold text-brand-red">
                        -{trader.maxDrawdown.toFixed(1)}%
                      </td>

                      {/* Result badge */}
                      <td className="py-4 text-center">
                        {trader.passed ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-brand-mint">
                            <CheckCircle className="w-4 h-4 mr-1 text-brand-mint" />
                            <span>Vượt qua</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-brand-gray">
                            <Activity className="w-4 h-4 mr-1 text-brand-gray" />
                            <span>Thi đấu</span>
                          </span>
                        )}
                      </td>

                      {/* Action trigger */}
                      <td className="p-4 text-center">
                        <button className="p-1.5 bg-brand-surface group-hover:bg-brand-mint-bg border border-brand-surface-bright group-hover:border-brand-mint rounded text-brand-gray group-hover:text-brand-mint transition-all">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>


      {/* Style explanation cards block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 font-sans">
        
        {/* Style Elephant explanation */}
        <div className="bg-brand-container border border-brand-surface-bright/60 p-5 rounded-lg flex space-x-4 items-start">
          <div className="p-3 bg-[#261f0a] border border-[#3e3415] text-brand-mint rounded">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display font-black text-xs uppercase text-white tracking-wider">Trường phái Voi (Elephant Stable-trader)</h4>
            <p className="text-xs text-brand-gray-light leading-relaxed">
              Nhóm trader ưu tiên lệnh khối lượng lớn, giao dịch theo xu hướng dài, nắm giữ dài ngày, tỷ lệ thắng cao và cực kỳ tôn trọng rào cản sụt giảm drawdown. Phân bổ mã cổ phiếu mang tính an toàn cao.
            </p>
          </div>
        </div>

        {/* Style Rabbit explanation */}
        <div className="bg-brand-container border border-brand-surface-bright/60 p-5 rounded-lg flex space-x-4 items-start">
          <div className="p-3 bg-brand-mint-bg border border-brand-mint/20 text-brand-mint rounded">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display font-black text-xs uppercase text-white tracking-wider">Trường phái Thỏ (Rabbit Agile-scalper)</h4>
            <p className="text-xs text-brand-gray-light leading-relaxed">
              Nhóm trader giao dịch năng động, số lượng lệnh nhiều, chốt lời chốt lỗ nhanh ngắn hạn trong phiên. Khả năng xoay chuyển danh mục nhanh nhạy với dòng tiền và tối ưu biến động ngắn hạn cực tốt.
            </p>
          </div>
        </div>

      </div>


      {/* --- POPUP DETAIL MODAL: TRADER DETAILED REPORT CARD --- */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedTrader(null)} />
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 max-w-lg w-full relative z-10 space-y-6">
            
            {/* Header: Name and avatar */}
            <div className="flex items-center space-x-4 border-b border-brand-surface-bright pb-4">
              <img
                src={selectedTrader.avatarUrl}
                alt={selectedTrader.name}
                className="w-14 h-14 rounded-full border border-brand-mint object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-black text-lg text-white uppercase">{selectedTrader.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    selectedTrader.style === 'Voi' ? 'bg-[#261f0a] text-brand-mint' : 'bg-brand-mint-bg text-brand-mint'
                  }`}>
                    {selectedTrader.style === 'Voi' ? 'VOI 🐘' : 'THỎ 🐇'}
                  </span>
                </div>
                <p className="text-brand-gray text-xs font-sans">
                  Học viên thi đấu tích cực nhất khóa đào tạo Bootcamp 2026
                </p>
              </div>
            </div>

            {/* Performance analysis matrix */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tỷ suất lũy kế:</span>
                <span className="font-mono text-lg font-black text-brand-mint">+{selectedTrader.profitGrowth.toFixed(1)}%</span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Sụt giảm drawdown max:</span>
                <span className="font-mono text-lg font-black text-brand-red">-{selectedTrader.maxDrawdown.toFixed(1)}%</span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tổng số giao dịch:</span>
                <span className="font-mono text-sm font-bold text-white">{selectedTrader.totalTrades} lệnh khớp</span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tỷ lệ thắng (Win Rate):</span>
                <span className="font-mono text-sm font-bold text-white">{selectedTrader.winRate.toFixed(1)}%</span>
              </div>

            </div>

            {/* Qualitative profile info */}
            <div className="space-y-3 font-sans text-xs text-brand-gray-light leading-relaxed border-t border-brand-surface-bright/50 pt-4">
              <div>
                <strong className="text-white font-medium block mb-1">Mã cổ phiếu yêu thích:</strong>
                <span className="font-mono px-1.5 py-0.5 bg-brand-surface rounded text-brand-mint font-bold uppercase tracking-wider">
                  {selectedTrader.style === 'Voi' ? 'FPT / HPG / VCB' : 'TCB / MWG / SSI'}
                </span>
              </div>

              <div>
                <strong className="text-white font-medium block mb-1">Báo cáo kỷ luật rủi ro:</strong>
                <div className="space-y-1 mt-1 font-display text-[11px]">
                  <div className="flex items-center text-brand-mint">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Sụt giảm ngày tối đa: Tuân thủ tuyệt đối (Max -2.1% NAV)</span>
                  </div>
                  <div className="flex items-center text-brand-mint">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Bộ lọc mã thanh khoản: Tuân thủ 100% trong rổ VN100</span>
                  </div>
                  <div className="flex items-center text-brand-mint">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>Đa dạng hóa vốn: Không mua gom quá 40% NAV/mã</span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-surface p-3 rounded border border-brand-surface-bright text-brand-gray italic text-[11px] leading-relaxed">
                "Bootcamp giúp tôi nhìn nhận sâu sắc hơn về rủi ro. Trước đây tôi chỉ tìm cách kiếm tiền nhanh, giờ tôi hiểu rằng bảo vệ vốn mới là chìa khóa thăng tiến chuyên nghiệp."
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedTrader(null)}
                className="w-full py-2.5 bg-brand-surface hover:bg-brand-surface-bright border border-brand-surface-bright text-white font-display text-xs font-bold rounded transition-colors uppercase"
              >
                Đóng báo cáo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

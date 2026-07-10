/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Trophy, Search, ArrowUpDown, Flame, TrendingUp } from "lucide-react";
import { MOCK_TRADERS, MOCK_BROKERS } from "../data";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface LeaderboardProps {
  isBrokerMode: boolean;
}

export default function Leaderboard({ isBrokerMode }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "winRate" | "navGrowth" | "maxDrawdown">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [traders, setTraders] = useState<typeof MOCK_TRADERS>(isBrokerMode ? MOCK_BROKERS : MOCK_TRADERS);

  useEffect(() => {
    setTraders(isBrokerMode ? MOCK_BROKERS : MOCK_TRADERS);
  }, [isBrokerMode]);

  useEffect(() => {
    // Only fetch from Supabase in default trader mode. For broker mode, we stick to mock.
    if (!isBrokerMode && isSupabaseConfigured && supabase) {
      const fetchLeaderboard = async () => {
        try {
          const { data, error } = await supabase
            .from("leaderboard")
            .select("*")
            .order("rank", { ascending: true });

          if (error) {
            console.error("Error fetching leaderboard from Supabase:", error);
            return;
          }

          if (data && data.length > 0) {
            const mapped = data.map((t) => ({
              id: t.id,
              rank: t.rank,
              name: t.name,
              winRate: t.win_rate,
              navGrowth: t.nav_growth,
              maxDrawdown: t.max_drawdown,
              streak: t.streak,
              profitAmount: Number(t.profit_amount)
            }));
            setTraders(mapped);
          }
        } catch (err) {
          console.error("Failed to connect to Supabase:", err);
        }
      };
      fetchLeaderboard();
    }
  }, [isBrokerMode]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Filter & Search logic
  const filteredTraders = traders.filter((trader) => {
    return trader.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    let aVal = a[sortBy] as number;
    let bVal = b[sortBy] as number;

    // Rank is sorted descending normally, let's treat lower rank number as higher value
    if (sortBy === "rank") {
      return sortOrder === "asc" ? a.rank - b.rank : b.rank - a.rank;
    }

    if (sortOrder === "asc") {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  const handleSort = (field: "rank" | "winRate" | "navGrowth" | "maxDrawdown") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "rank" ? "asc" : "desc"); // Default sort descending for percentages, asc for rank
    }
    setCurrentPage(1);
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Pagination parameters
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTraders.length / itemsPerPage);
  const displayedTraders = filteredTraders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section id="leaderboard" className="py-20 md:py-28 bg-surface-container-lowest border-b border-outline-custom/20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-3 bg-primary-neon/10 border border-primary-neon/20 rounded-full text-primary-neon">
            <Trophy className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
            {isBrokerMode ? "BẢNG XẾP HẠNG BROKER" : "BẢNG XẾP HẠNG TRADER"}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-xs sm:text-sm">
            {isBrokerMode 
              ? "Tôn vinh các Broker tinh anh tuân thủ kỷ luật quản lý rủi ro nhóm, dẫn dắt danh mục tài sản khách hàng tăng trưởng bền vững."
              : "Tôn vinh các tinh anh giao dịch tuân thủ kỷ luật vàng, duy trì tăng trưởng tài sản đều đặn và có hiệu suất quản trị rủi ro xuất sắc nhất."
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-surface border border-outline-custom/20 p-5 rounded-2xl max-w-5xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-steel" />
            <input
              type="text"
              placeholder={isBrokerMode ? "Tìm kiếm Broker..." : "Tìm kiếm Trader..."}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-background border border-outline-custom/30 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs sm:text-sm focus:border-primary-neon outline-none"
            />
          </div>
          <div className="text-xs text-muted-steel font-bold uppercase tracking-wider">
            {isBrokerMode ? "Cập nhật hàng ngày từ dữ liệu PKD6" : "Cập nhật hàng ngày từ Google Sheets"}
          </div>
        </div>

        {/* High Density Table */}
        <div className="max-w-5xl mx-auto bg-surface border border-outline-custom/20 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright/20 border-b border-outline-custom/20 text-[10px] text-muted-steel font-extrabold uppercase tracking-widest font-headline">
                  <th 
                    onClick={() => handleSort("rank")}
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors select-none"
                  >
                    Hạng <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                  </th>
                  <th className="py-4 px-6">{isBrokerMode ? "Broker / Chuyên Viên" : "Trader"}</th>
                  <th 
                    onClick={() => handleSort("winRate")}
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors select-none text-right"
                  >
                    {isBrokerMode ? "Tỉ Lệ Thắng Khách" : "Tỉ Lệ Thắng"} <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                  </th>
                  <th 
                    onClick={() => handleSort("navGrowth")}
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors select-none text-right"
                  >
                    {isBrokerMode ? "Hiệu Suất Nhóm (%)" : "Lãi Suất (%)"} <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                  </th>
                  <th 
                    onClick={() => handleSort("maxDrawdown")}
                    className="py-4 px-6 cursor-pointer hover:text-white transition-colors select-none text-right"
                  >
                    {isBrokerMode ? "Sụt Giảm Max Khách" : "Sụt Giảm Max"} <ArrowUpDown className="inline-block w-3 h-3 ml-1" />
                  </th>
                  <th className="py-4 px-6 text-right">{isBrokerMode ? "Lợi Nhuận Khách Hàng" : "Lợi Nhuận Quy Đổi"}</th>
                  <th className="py-4 px-6 text-center">{isBrokerMode ? "Chuỗi Kỷ Luật" : "Chuỗi Thắng"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-custom/10 text-xs sm:text-sm font-sans">
                {displayedTraders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant italic">
                      {isBrokerMode ? "Không tìm thấy Broker nào khớp điều kiện tìm kiếm." : "Không tìm thấy Trader nào khớp điều kiện tìm kiếm."}
                    </td>
                  </tr>
                ) : (
                  displayedTraders.map((trader) => (
                    <tr 
                      key={trader.id}
                      className="hover:bg-surface-bright/10 transition-colors"
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 font-mono font-bold">
                        {trader.rank === 1 ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${isBrokerMode ? "bg-primary-neon text-background shadow-[0_0_8px_var(--glow-color-strong)]" : "bg-yellow-500 text-background shadow-[0_0_8px_rgba(234,179,8,0.5)]"} font-black text-xs`}>
                            1
                          </span>
                        ) : trader.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-background font-black text-xs">
                            2
                          </span>
                        ) : trader.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">{trader.rank}</span>
                        )}
                      </td>

                      {/* Name Column */}
                      <td className="py-4 px-6 font-bold text-white font-sans">
                        {trader.name}
                      </td>

                      {/* Win rate Column */}
                      <td className="py-4 px-6 font-mono font-bold text-right text-white">
                        {trader.winRate}%
                      </td>

                      {/* NAV Growth */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-primary-neon">
                          <TrendingUp className="w-3 h-3" />
                          +{trader.navGrowth}%
                        </span>
                      </td>

                      {/* Max Drawdown */}
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono font-bold text-error-neon">
                          {trader.maxDrawdown}%
                        </span>
                      </td>

                      {/* Profit Amount */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-white">
                        {formatVND(trader.profitAmount)}
                      </td>

                      {/* Streak Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1 bg-[#4a2e00]/40 border border-amber-600/30 text-amber-500 font-bold font-mono px-2 py-0.5 rounded text-[10px]">
                          <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
                          <span>{trader.streak}d</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-surface-bright/5 border-t border-outline-custom/20 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-steel font-mono gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Dữ liệu được cập nhật cuối mỗi ngày qua hệ thống Google Sheets
            </span>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase border transition-all cursor-pointer ${
                    currentPage === 1
                      ? "border-outline-custom/20 text-on-surface-variant/30 cursor-not-allowed"
                      : "border-outline-custom/40 text-on-surface-variant hover:border-primary-neon hover:text-primary-neon"
                  }`}
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-primary-neon text-[#002114]"
                          : "bg-surface-bright/20 border border-outline-custom/30 text-on-surface-variant hover:border-primary-neon hover:text-primary-neon"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase border transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? "border-outline-custom/20 text-on-surface-variant/30 cursor-not-allowed"
                      : "border-outline-custom/40 text-on-surface-variant hover:border-primary-neon hover:text-primary-neon"
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
            
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Trang {currentPage} / {totalPages || 1} (Tổng số {filteredTraders.length} {isBrokerMode ? "Broker" : "Trader"})
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}

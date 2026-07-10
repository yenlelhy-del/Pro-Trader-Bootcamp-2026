/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, Lock, AlertTriangle, Play, RefreshCw, Plus, Trash2 } from "lucide-react";
import { MockTrade } from "../types";

interface DisciplineGaugesProps {
  isBrokerMode: boolean;
}

export default function DisciplineGauges({ isBrokerMode }: DisciplineGaugesProps) {
  // Real-time state
  const [cumulativeReturn, setCumulativeReturn] = useState<number>(1.0); // Initial +1% in design
  const [currentDrawdown, setCurrentDrawdown] = useState<number>(-1.5); // Initial drawdown %
  const [trades, setTrades] = useState<MockTrade[]>([
    { id: "t1", ticker: "FPT", type: "BUY", price: 135000, volume: 1000, pnl: 2.5, timestamp: "09:30" },
    { id: "t2", ticker: "TCB", type: "BUY", price: 48000, volume: 2000, pnl: -1.5, timestamp: "10:15" },
  ]);

  // Input fields for mock trade
  const [ticker, setTicker] = useState("VHM");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [pnlVal, setPnlVal] = useState<number>(1.5);

  const maxDrawdownLimit = -8.0;
  const targetProfitLimit = 5.0;

  // Calculate stats based on simulated trades
  const handleAddTrade = (customPnl?: number) => {
    const finalPnl = customPnl !== undefined ? customPnl : pnlVal;
    
    const newTrade: MockTrade = {
      id: "t-" + Date.now(),
      ticker: customPnl !== undefined ? (customPnl > 0 ? "SSI" : "MWG") : ticker.toUpperCase(),
      type: tradeType,
      price: 35000,
      volume: 1000,
      pnl: finalPnl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const newTrades = [newTrade, ...trades];
    setTrades(newTrades);

    // Calculate cumulative return
    const netReturn = cumulativeReturn + finalPnl;
    setCumulativeReturn(Number(netReturn.toFixed(1)));

    // Adjust drawdown
    if (finalPnl < 0) {
      const prospectiveDrawdown = currentDrawdown + finalPnl;
      setCurrentDrawdown(Number(Math.max(prospectiveDrawdown, -10).toFixed(1)));
    } else {
      // Small recovery in drawdown
      const prospectiveDrawdown = currentDrawdown + (finalPnl * 0.3);
      setCurrentDrawdown(Number(Math.min(prospectiveDrawdown, 0).toFixed(1)));
    }
  };

  const handleReset = () => {
    setCumulativeReturn(1.0);
    setCurrentDrawdown(-1.5);
    setTrades([
      { id: "t1", ticker: "FPT", type: "BUY", price: 135000, volume: 1000, pnl: 2.5, timestamp: "09:30" },
      { id: "t2", ticker: "TCB", type: "BUY", price: 48000, volume: 2000, pnl: -1.5, timestamp: "10:15" },
    ]);
  };

  const handleDeleteTrade = (id: string, pnl: number) => {
    setTrades(trades.filter((t) => t.id !== id));
    setCumulativeReturn(Number((cumulativeReturn - pnl).toFixed(1)));
    if (pnl < 0) {
      setCurrentDrawdown(Number(Math.min(0, currentDrawdown - (pnl * 0.5)).toFixed(1)));
    }
  };

  // SVG parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65

  // Calculations for SVGs
  const getProfitDashoffset = () => {
    const percentage = Math.min(Math.max(cumulativeReturn, 0) / targetProfitLimit, 1);
    return circumference * (1 - percentage);
  };

  const getDrawdownDashoffset = () => {
    // drawdown is negative. -7% is full drawdown gauge.
    const percentage = Math.min(Math.max(Math.abs(currentDrawdown), 0) / Math.abs(maxDrawdownLimit), 1);
    return circumference * (1 - percentage);
  };

  // Determine current system status
  const isBreached = currentDrawdown <= maxDrawdownLimit;
  const isPassed = cumulativeReturn >= targetProfitLimit && !isBreached;

  return (
    <section id="dashboard" className="bg-surface-container-lowest py-16 md:py-24 border-y border-outline-custom/20">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
            {isBrokerMode ? "KỶ LUẬT NHÓM LÀ THƯỚC ĐO THÀNH CÔNG" : "KỶ LUẬT LÀ NỀN TẢNG LỢI NHUẬN"}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {isBrokerMode 
              ? "Hệ thống đối chiếu Real-time Client Monitor đảm bảo danh mục tư vấn luôn trong ngưỡng an toàn bảo vệ vốn."
              : "Hệ thống giám sát Real-time Broker Tracking đảm bảo mọi vị thế đều tuân thủ nguyên tắc bảo vệ vốn tối thượng."
            }
          </p>
        </div>

        {/* Dynamic Status Alert Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          {isBreached ? (
            <div className="bg-red-500/10 border border-error-neon/40 text-error-neon p-4 rounded-2xl flex items-center gap-4 animate-pulse">
              <div className="p-2 bg-error-neon/20 rounded-full">
                <Lock className="w-6 h-6 text-error-neon" />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-wider text-sm">HỆ THỐNG ĐÃ TỰ ĐỘNG KHÓA VỊ THẾ (BREACHED)</h4>
                <p className="text-xs text-error-neon/90 mt-0.5">Sụt giảm hiện tại ({currentDrawdown}%) vượt quá giới hạn an toàn tối đa ({maxDrawdownLimit}%). Vui lòng trao đổi với Coach.</p>
              </div>
            </div>
          ) : isPassed ? (
            <div className="bg-emerald-500/10 border border-primary-neon/40 text-primary-neon p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-primary-neon/20 rounded-full animate-bounce">
                <CheckCircle className="w-6 h-6 text-primary-neon" />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-wider text-sm">ĐỦ ĐIỀU KIỆN THĂNG HẠNG VÒNG 2 (PASSED)</h4>
                <p className="text-xs text-primary-neon/90 mt-0.5">Tỷ suất lợi nhuận đạt {cumulativeReturn}% (Yêu cầu: ≥ {targetProfitLimit}%) và giữ tài khoản an toàn tuyệt đối!</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-tertiary-gold/40 text-tertiary-gold p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-tertiary-gold/20 rounded-full animate-pulse">
                <AlertTriangle className="w-6 h-6 text-tertiary-gold" />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-wider text-sm">{isBrokerMode ? "CLIENT PORTFOLIOS: ĐANG HOẠT ĐỘNG (ACTIVE)" : "BROKER MONITORING: ĐANG HOẠT ĐỘNG (ACTIVE)"}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Mục tiêu: Đạt {targetProfitLimit}% hiệu suất. Sụt giảm hiện tại: {currentDrawdown}% (Ngưỡng khóa: {maxDrawdownLimit}%).</p>
              </div>
            </div>
          )}
        </div>

        {/* Dual Gauge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto mb-16">
          
          {/* Performance Target Gauge */}
          <div className="bg-surface border border-outline-custom/20 p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group hover:border-primary-neon/50 transition-colors duration-300">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary-neon/10 border border-primary-neon/30 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-primary-neon">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-neon animate-ping"></span>
              PROFIT TARGET
            </div>

            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-outline-variant-custom/30"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                ></circle>
                <motion.circle
                  className="text-primary-neon glow-green"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: getProfitDashoffset() }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  strokeLinecap="round"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <CheckCircle className={`w-8 h-8 mb-1 transition-colors ${cumulativeReturn >= targetProfitLimit ? "text-primary-neon animate-bounce" : "text-primary-neon/50"}`} />
                <div className="text-3xl font-extrabold text-white font-mono">
                  {cumulativeReturn > 0 ? `+${cumulativeReturn}` : cumulativeReturn}%
                </div>
              </div>
            </div>

            <h4 className="font-headline text-primary-neon font-bold mb-2 uppercase tracking-widest text-sm">
              Mục Tiêu Hiệu Suất
            </h4>
            <p className="text-on-surface-variant text-xs max-w-xs leading-relaxed">
              Cần đạt tỷ suất lợi nhuận tối thiểu {targetProfitLimit}% để chứng minh kỹ luật thăng hạng. Hiện tại: {cumulativeReturn}% / {targetProfitLimit}%.
            </p>
          </div>

          {/* Capital Protection Gauge */}
          <div className="bg-surface border border-outline-custom/20 p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group hover:border-error-neon/50 transition-colors duration-300">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-error-neon/10 border border-error-neon/30 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-error-neon">
              <span className="w-1.5 h-1.5 rounded-full bg-error-neon animate-ping"></span>
              SAFE DRAWDOWN
            </div>

            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-outline-variant-custom/30"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                ></circle>
                <motion.circle
                  className="text-error-neon glow-red"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: getDrawdownDashoffset() }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  strokeLinecap="round"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Lock className={`w-8 h-8 mb-1 transition-colors ${isBreached ? "text-error-neon animate-shake" : "text-error-neon/50"}`} />
                <div className="text-3xl font-extrabold text-white font-mono">
                  {currentDrawdown}%
                </div>
              </div>
            </div>

            <h4 className="font-headline text-error-neon font-bold mb-2 uppercase tracking-widest text-sm">
              Giới Hạn Bảo Vệ Vốn
            </h4>
            <p className="text-on-surface-variant text-xs max-w-xs leading-relaxed">
              Chạm ngưỡng {maxDrawdownLimit}% sụt giảm, hệ thống tự động khóa vị thế. Bảo vệ vốn là ưu tiên hàng đầu.
            </p>
          </div>

        </div>

        {/* Interactive Simulated Trade Console */}
        <div className="bg-surface/40 border border-outline-custom/20 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-outline-custom/20 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                <Play className="w-4 h-4 text-primary-neon fill-primary-neon" />
                {isBrokerMode ? "Mô phỏng Giao Dịch Nhóm Môi Giới" : "Mô phỏng Giao Dịch Thực Tế"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {isBrokerMode 
                  ? "Giả lập các lệnh lãi/lỗ từ khách hàng để kiểm tra phản hồi từ hệ thống Client Tracking của phòng."
                  : "Thêm các lệnh lãi/lỗ giả lập để xem hệ thống Broker Tracking phản hồi tự động trong nháy mắt."
                }
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-bold bg-surface-bright border border-outline-custom/40 px-3.5 py-2 rounded-lg hover:border-primary-neon transition-all hover:text-primary-neon cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Mô Phỏng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-muted-steel font-bold uppercase">Mã Cổ Phiếu</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                maxLength={4}
                className="w-full bg-background border border-outline-custom/40 rounded-lg px-3 py-2.5 text-white font-bold font-mono focus:border-primary-neon outline-none text-sm uppercase"
              />
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-muted-steel font-bold uppercase">Loại Lệnh</label>
              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as "BUY" | "SELL")}
                className="w-full bg-background border border-outline-custom/40 rounded-lg px-3 py-2.5 text-white focus:border-primary-neon outline-none text-sm cursor-pointer"
              >
                <option value="BUY">MUA (BUY)</option>
                <option value="SELL">BÁN (SELL)</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] text-muted-steel font-bold uppercase">Lãi / Lỗ (% NAV)</label>
              <input
                type="number"
                step="0.1"
                value={pnlVal}
                onChange={(e) => setPnlVal(Number(e.target.value))}
                className="w-full bg-background border border-outline-custom/40 rounded-lg px-3 py-2.5 text-white font-bold font-mono focus:border-primary-neon outline-none text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <button
                onClick={() => handleAddTrade()}
                disabled={isBreached}
                className={`w-full font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer ${
                  isBreached
                    ? "bg-outline-custom/30 text-on-surface-variant/40 border border-dashed border-outline-custom cursor-not-allowed"
                    : `bg-primary-neon ${isBrokerMode ? "text-black" : "text-[#002114]"} hover:brightness-110 shadow-md`
                }`}
              >
                <Plus className="w-4 h-4" />
                {isBrokerMode ? "Ghi Nhận Lệnh Khách" : "Ghi Nhận Lệnh"}
              </button>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <span className="text-xs text-muted-steel font-bold uppercase">Phím tắt nhanh:</span>
            <button
              onClick={() => handleAddTrade(1.5)}
              disabled={isBreached}
              className="bg-primary-neon/10 border border-primary-neon/30 text-primary-neon text-xs px-3 py-1.5 rounded-md hover:bg-primary-neon hover:text-black transition-all cursor-pointer"
            >
              Lệnh Lãi +1.5%
            </button>
            <button
              onClick={() => handleAddTrade(4.0)}
              disabled={isBreached}
              className="bg-primary-neon/10 border border-primary-neon/30 text-primary-neon text-xs px-3 py-1.5 rounded-md hover:bg-primary-neon hover:text-black transition-all cursor-pointer"
            >
              Lệnh Lãi Đậm +4.0%
            </button>
            <button
              onClick={() => handleAddTrade(-1.0)}
              disabled={isBreached}
              className="bg-[#440003]/40 border border-error-neon/30 text-error-neon text-xs px-3 py-1.5 rounded-md hover:bg-error-neon hover:text-white transition-all cursor-pointer"
            >
              Lệnh Lỗ -1.0%
            </button>
            <button
              onClick={() => handleAddTrade(-4.5)}
              disabled={isBreached}
              className="bg-[#440003]/40 border border-error-neon/30 text-error-neon text-xs px-3 py-1.5 rounded-md hover:bg-error-neon hover:text-white transition-all cursor-pointer"
            >
              Lệnh Lỗ Nặng -4.5%
            </button>
          </div>

          {/* Simulated Trade Logs */}
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            <h4 className="text-[10px] text-muted-steel font-bold uppercase tracking-wider">
              {isBrokerMode ? "Nhật Ký Lệnh Giả Lập Khách Hàng" : "Lịch Sử Giao Dịch Giả Lập"}
            </h4>
            {trades.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-3 text-center">Chưa ghi nhận lệnh giao dịch nào.</p>
            ) : (
              trades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-background border border-outline-custom/20 rounded-xl p-3 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === "BUY" ? "bg-primary-neon/15 text-primary-neon" : "bg-blue-500/15 text-blue-400"}`}>
                      {trade.type}
                    </span>
                    <span className="font-bold text-white text-sm">{trade.ticker}</span>
                    <span className="text-on-surface-variant">{trade.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${trade.pnl >= 0 ? "text-primary-neon" : "text-error-neon"}`}>
                      {trade.pnl >= 0 ? `+${trade.pnl}%` : `${trade.pnl}%`}
                    </span>
                    <button
                      onClick={() => handleDeleteTrade(trade.id, trade.pnl)}
                      className="text-on-surface-variant hover:text-error-neon transition-colors p-1"
                      title="Xóa lệnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

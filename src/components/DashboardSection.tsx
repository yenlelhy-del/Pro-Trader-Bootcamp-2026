import React, { useState, useEffect } from 'react';
import { Terminal, Plus, Trash2, CheckCircle, AlertTriangle, Play, HelpCircle, Activity, RotateCcw } from 'lucide-react';
import { TradeLog, AccountState } from '../types';
import { INITIAL_TRADE_LOGS } from '../data';

// Mock list of compliant VN100 tickers for the compliance validator
const COMPLIANT_TICKERS = ['FPT', 'TCB', 'HPG', 'VNM', 'MWG', 'SSI', 'VND', 'MSN', 'VHM', 'VIC', 'ACB', 'MBB', 'VPB', 'STB', 'GAS', 'CTG', 'HDB', 'VRE', 'TPB'];

export default function DashboardSection() {
  // Load initial capital and trade logs from localStorage on mount
  const [initialCapital, setInitialCapital] = useState<number>(() => {
    const saved = localStorage.getItem('pro_trader_initial_capital');
    return saved ? Number(saved) : 50000000;
  });

  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(() => {
    const saved = localStorage.getItem('pro_trader_trade_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pro_trader_initial_capital', initialCapital.toString());
  }, [initialCapital]);

  useEffect(() => {
    localStorage.setItem('pro_trader_trade_logs', JSON.stringify(tradeLogs));
  }, [tradeLogs]);
  
  // Form input state
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(100);
  const [entryPrice, setEntryPrice] = useState<string>('50');
  const [exitPrice, setExitPrice] = useState<string>('53');
  const [weight, setWeight] = useState<number>(20); // default 20% NAV allocation
  const [comment, setComment] = useState('');

  // States for closing an open position inline
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [tempExitPrice, setTempExitPrice] = useState<string>('');

  // Fetch real-time stock price automatically when user types ticker symbol
  useEffect(() => {
    const cleanTicker = ticker.trim().toUpperCase();
    if (cleanTicker.length === 3) {
      const controller = new AbortController();
      const to = Math.floor(Date.now() / 1000);
      const from = to - 86400 * 7; // Last 7 days to cover weekends
      
      fetch(
        `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?symbol=${cleanTicker}&from=${from}&to=${to}&resolution=1D`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.c && data.c.length > 0) {
            const lastPrice = data.c[data.c.length - 1];
            const formattedPrice = Number(lastPrice.toFixed(2)).toString();
            setEntryPrice(formattedPrice);
            const defaultExit = action === 'BUY' ? lastPrice * 1.03 : lastPrice * 0.97;
            setExitPrice(Number(defaultExit.toFixed(2)).toString());
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Error fetching stock price:', err);
          }
        });

      return () => controller.abort();
    }
  }, [ticker, action]);

  // Selected trade index for chart tooltip
  const [hoveredTradeIdx, setHoveredTradeIdx] = useState<number | null>(null);

  // Stats and Compliance state calculated dynamically
  const [stats, setStats] = useState<AccountState>({
    initialBalance: initialCapital,
    currentBalance: initialCapital,
    peakBalance: initialCapital,
    totalTrades: 0,
    winRate: 0,
    maxDrawdown: 0,
    dailyDrawdown: 0,
    isCompliant: {
      maxDailyDrawdown: true,
      maxTotalDrawdown: true,
      diversification: true,
      consistency: true,
      liquidity: true,
    }
  });

  // Effect to recalculate all stats whenever tradeLogs or initialCapital changes
  useEffect(() => {
    let balance = initialCapital;
    let peak = initialCapital;
    let maxDD = 0;
    let winCount = 0;
    
    // Track daily drawdown triggers
    let isDailyDrawdownCompliant = true;
    let isTotalDrawdownCompliant = true;
    let isDiversificationCompliant = true;
    let isConsistencyCompliant = true;
    let isLiquidityCompliant = true;

    // Target profit for passing (5% of initial)
    const targetProfit = initialCapital * 0.05;

    // Check diversification and liquidity on ALL positions (even open ones)
    tradeLogs.forEach((trade) => {
      // Check Single-Asset NAV allocation weight (diversification)
      if (trade.weightPercentage > 40) {
        isDiversificationCompliant = false;
      }

      // Check Liquidity / VN100 ticker compliant
      if (!COMPLIANT_TICKERS.includes(trade.ticker.toUpperCase())) {
        isLiquidityCompliant = false;
      }
    });

    const closedTrades = tradeLogs.filter(t => t.status === 'CLOSED');

    // Run chronological recalculation of equity curve for closed positions only
    closedTrades.forEach((trade) => {
      balance += trade.profit;
      
      if (balance > peak) {
        peak = balance;
      }
      
      const currentDD = ((peak - balance) / peak) * 100;
      if (currentDD > maxDD) {
        maxDD = currentDD;
      }

      if (trade.profit > 0) {
        winCount++;
      }

      // 1. Check Max Daily Drawdown rule: single day/trade loss shouldn't exceed 4% of current peak NAV
      const tradeDDPercentage = (Math.abs(trade.profit) / peak) * 100;
      if (trade.profit < 0 && tradeDDPercentage >= 4.0) {
        isDailyDrawdownCompliant = false;
      }

      // 3. Check Consistency rule: a single trade's profit should not make up more than 40% of the profit target
      if (trade.profit > 0 && trade.profit > targetProfit * 0.4) {
        isConsistencyCompliant = false;
      }
    });

    // Overall total drawdown check
    const totalDD = ((peak - balance) / initialCapital) * 100;
    if (totalDD >= 8.0 || ((initialCapital - balance) / initialCapital) * 100 >= 8.0) {
      isTotalDrawdownCompliant = false;
    }

    const calculatedWinRate = closedTrades.length > 0 ? (winCount / closedTrades.length) * 100 : 0;

    setStats({
      initialBalance: initialCapital,
      currentBalance: balance,
      peakBalance: peak,
      totalTrades: closedTrades.length,
      winRate: calculatedWinRate,
      maxDrawdown: maxDD,
      dailyDrawdown: closedTrades.length > 0 && closedTrades[closedTrades.length - 1].profit < 0 ? (Math.abs(closedTrades[closedTrades.length - 1].profit) / peak) * 100 : 0,
      isCompliant: {
        maxDailyDrawdown: isDailyDrawdownCompliant,
        maxTotalDrawdown: isTotalDrawdownCompliant,
        diversification: isDiversificationCompliant,
        consistency: isConsistencyCompliant,
        liquidity: isLiquidityCompliant,
      }
    });
  }, [tradeLogs, initialCapital]);

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    const parsedEntry = parseFloat(entryPrice.replace(',', '.')) || 0;

    const newTrade: TradeLog = {
      id: 't_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ticker: ticker.toUpperCase(),
      action,
      quantity,
      price: parsedEntry * 1000,
      exitPrice: null,
      profit: 0,
      drawdownPercentage: 0,
      comment: comment || 'Mở vị thế giao dịch.',
      weightPercentage: weight,
      status: 'OPEN',
    };

    setTradeLogs([...tradeLogs, newTrade]);

    // Reset inputs
    setTicker('');
    setComment('');
  };

  const handleCloseTrade = (id: string, exitPriceStr: string) => {
    const parsedExit = parseFloat(exitPriceStr.replace(',', '.')) || 0;
    if (parsedExit <= 0) return;

    setTradeLogs(prevLogs => {
      return prevLogs.map(trade => {
        if (trade.id !== id) return trade;

        const multiplier = trade.action === 'BUY' ? 1 : -1;
        const entryPriceValue = trade.price / 1000;
        const profit = trade.quantity * (parsedExit - entryPriceValue) * 1000 * multiplier;

        return {
          ...trade,
          exitPrice: parsedExit * 1000,
          profit,
          drawdownPercentage: profit < 0 ? (Math.abs(profit) / stats.peakBalance) * 100 : 0,
          status: 'CLOSED',
        };
      });
    });
  };

  const handleDeleteTrade = (id: string) => {
    setTradeLogs(tradeLogs.filter(t => t.id !== id));
  };

  const handleResetTerminal = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký giao dịch không?')) {
      setTradeLogs([]);
    }
  };

  // Build the coordinates for our custom high-fidelity SVG chart
  const buildSvgPath = (width: number, height: number) => {
    const closedTrades = tradeLogs.filter(t => t.status === 'CLOSED');
    if (closedTrades.length === 0) return { path: '', points: [], areaPath: '' };

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Track cumulative balance progression starting with initialCapital
    const balanceHistory: number[] = [initialCapital];
    let runningBalance = initialCapital;
    closedTrades.forEach(trade => {
      runningBalance += trade.profit;
      balanceHistory.push(runningBalance);
    });

    const minVal = Math.min(...balanceHistory) * 0.98;
    const maxVal = Math.max(...balanceHistory) * 1.02;
    const valRange = maxVal - minVal;

    const points = balanceHistory.map((val, idx) => {
      const x = padding + (idx / (balanceHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
      return { x, y, value: val, index: idx };
    });

    // Create line path
    let d = '';
    points.forEach((pt, idx) => {
      if (idx === 0) {
        d += `M ${pt.x} ${pt.y}`;
      } else {
        d += ` L ${pt.x} ${pt.y}`;
      }
    });

    // Create filled area path
    let areaD = d;
    if (points.length > 0) {
      areaD += ` L ${points[points.length - 1].x} ${height - padding}`;
      areaD += ` L ${points[0].x} ${height - padding} Z`;
    }

    return { path: d, points, areaPath: areaD, minVal, maxVal };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(val)
      .replace('₫', 'đ');
  };

  const svgData = buildSvgPath(700, 320);

  // Check if target achieved
  const isTargetAchieved = stats.currentBalance >= stats.initialBalance * 1.05;
  const isFailedDrawdown = !stats.isCompliant.maxDailyDrawdown || !stats.isCompliant.maxTotalDrawdown;

  return (
    <div className="space-y-8 animate-fade-in max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-surface-bright/50 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-brand-mint-bg border border-brand-mint/30 px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-pulse" />
            <span className="font-display text-[10px] font-bold text-brand-mint tracking-wider uppercase">SIMULATION TERMINAL MODE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-2">
            MÔ PHỎNG QUẢN TRỊ RỦI RO & GIAO DỊCH
          </h1>
          <p className="text-brand-gray text-xs sm:text-sm font-sans mt-1">
            Ghi nhận nhật ký giao dịch ảo, theo dõi luật sụt giảm tài khoản và kiểm soát drawdown theo chuẩn Bootcamp.
          </p>
        </div>

        <button
          onClick={handleResetTerminal}
          className="flex items-center space-x-2 px-3.5 py-2 bg-brand-surface border border-brand-surface-bright hover:border-brand-red text-xs font-bold font-display text-brand-gray-light hover:text-brand-red rounded transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>LÀM MỚI TOÀN BỘ</span>
        </button>
      </div>

      {/* Starting capital selection */}
      <div className="bg-brand-container border border-brand-surface-bright p-5 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
            Chọn vốn tham gia thử thách (NAV Vòng 1):
          </label>
          <span className="text-[11px] text-brand-gray block mt-1 font-sans">Vốn khởi tạo để tính rào cản sụt giảm rủi ro</span>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          {[30000000, 50000000, 100000000, 200000000, 500000000].map((cap) => (
            <button
              key={cap}
              onClick={() => setInitialCapital(cap)}
              className={`px-4 py-2.5 rounded font-mono text-xs font-bold tracking-wider border transition-all ${
                initialCapital === cap
                  ? 'bg-brand-mint text-brand-bg border-brand-mint shadow-[0_0_15px_rgba(0,225,161,0.25)]'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white hover:border-brand-gray'
              }`}
            >
              {cap / 1000000}M VND
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Statistics & Rules Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Statistics Panels (Col-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Key Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Stat: Current Balance */}
            <div className="bg-brand-container border border-brand-surface-bright p-4 rounded-lg flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">NAV Hiện Tại</span>
              <div className="text-lg sm:text-xl font-mono font-black text-white">
                {formatCurrency(stats.currentBalance)}
              </div>
              <span className={`text-[10px] font-bold block ${stats.currentBalance >= stats.initialBalance ? 'text-brand-mint' : 'text-brand-red'}`}>
                {stats.currentBalance >= stats.initialBalance ? '+' : ''}
                {(((stats.currentBalance - stats.initialBalance) / stats.initialBalance) * 100).toFixed(2)}% lũy kế
              </span>
            </div>

            {/* Stat: Max Drawdown */}
            <div className="bg-brand-container border border-brand-surface-bright p-4 rounded-lg flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">Sụt Giảm Max (MDD)</span>
              <div className={`text-lg sm:text-xl font-mono font-black ${stats.maxDrawdown >= 8.0 ? 'text-brand-red animate-pulse' : 'text-brand-gold'}`}>
                -{stats.maxDrawdown.toFixed(2)}%
              </div>
              <span className="text-[10px] text-brand-gray block">
                Giới hạn tối đa: <strong className="text-brand-red font-mono">-8.0%</strong>
              </span>
            </div>

            {/* Stat: Win Rate */}
            <div className="bg-brand-container border border-brand-surface-bright p-4 rounded-lg flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tỷ Lệ Thắng</span>
              <div className="text-lg sm:text-xl font-mono font-black text-white">
                {stats.winRate.toFixed(1)}%
              </div>
              <span className="text-[10px] text-brand-gray block">
                Trong tổng số {stats.totalTrades} lệnh giao dịch
              </span>
            </div>

            {/* Stat: Target status */}
            <div className="bg-brand-container border border-brand-surface-bright p-4 rounded-lg flex flex-col justify-between space-y-2">
              <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">Trạng Thái Thử Thách</span>
              <div className={`text-sm sm:text-base font-display font-black uppercase ${
                isFailedDrawdown ? 'text-brand-red' : isTargetAchieved ? 'text-brand-mint' : 'text-brand-gray-light'
              }`}>
                {isFailedDrawdown ? 'BỊ LOẠI (VI PHẠM)' : isTargetAchieved ? 'ĐẠT TIÊU CHUẨN' : 'ĐANG THI ĐẤU'}
              </div>
              <span className="text-[10px] text-brand-gray block">
                Mục tiêu thăng hạng: <strong className="text-brand-mint font-mono">+5.0%</strong>
              </span>
            </div>

          </div>

          {/* Equity curve Chart */}
          <div className="bg-brand-container border border-brand-surface-bright p-5 rounded-lg space-y-4">
            <div className="flex justify-between items-center border-b border-brand-surface-bright/40 pb-3">
              <div className="flex items-center space-x-2 text-white font-display font-bold text-xs uppercase tracking-wide">
                <Activity className="text-brand-mint w-4 h-4" />
                <span>Biểu đồ tăng trưởng tài sản (NAV Equity Curve)</span>
              </div>
              <span className="font-mono text-[10px] text-brand-gray">
                Cập nhật tự động sau mỗi lệnh giao dịch
              </span>
            </div>

            {/* SVG Plot */}
            <div className="relative pt-2">
              {tradeLogs.length === 0 ? (
                <div className="h-56 border border-dashed border-brand-surface-bright/50 rounded flex flex-col items-center justify-center text-brand-gray">
                  <Terminal className="w-8 h-8 mb-2 opacity-40" />
                  <span className="text-xs font-sans">Chưa có giao dịch nào được ghi nhận để vẽ đồ thị.</span>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[640px] relative">
                    <svg
                      viewBox="0 0 700 320"
                      className="w-full h-auto bg-brand-surface/30 rounded border border-brand-surface-bright/35"
                    >
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.25, 1].map((ratio, i) => {
                        const y = 40 + ratio * 240;
                        return (
                          <line
                            key={i}
                            x1="40"
                            y1={y}
                            x2="660"
                            y2={y}
                            stroke="var(--color-brand-surface-high)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        );
                      })}
                      
                      {/* Interactive area fill */}
                      {svgData.areaPath && (
                        <path
                          d={svgData.areaPath}
                          fill="url(#equityAreaGradient)"
                        />
                      )}

                      {/* Glowing line plot */}
                      {svgData.path && (
                        <path
                          d={svgData.path}
                          fill="none"
                          stroke="var(--color-brand-mint)"
                          strokeWidth="2.5"
                          className="drop-shadow-[0_0_8px_rgba(255,208,44,0.5)]"
                        />
                      )}

                      {/* Data Point Dots & Interactions */}
                      {svgData.points.map((pt) => (
                        <g key={pt.index}>
                          <circle
                             cx={pt.x}
                             cy={pt.y}
                             r={hoveredTradeIdx === pt.index ? "6" : "4"}
                             fill={hoveredTradeIdx === pt.index ? "#ffffff" : "var(--color-brand-mint)"}
                             stroke="var(--color-brand-bg)"
                             strokeWidth="2"
                             className="cursor-pointer transition-all"
                             onMouseEnter={() => setHoveredTradeIdx(pt.index)}
                             onMouseLeave={() => setHoveredTradeIdx(null)}
                          />
                        </g>
                      ))}

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="equityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-brand-mint)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-brand-mint)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Live tooltip */}
                    {hoveredTradeIdx !== null && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-brand-surface border border-brand-mint/40 rounded p-3 text-xs text-white z-20 space-y-1 shadow-[0_0_15px_rgba(0,225,161,0.15)] max-w-sm pointer-events-none">
                        <div className="flex justify-between space-x-6 font-mono">
                          <span className="text-brand-gray font-bold uppercase">Lần cập nhật:</span>
                          <span className="font-bold">#{hoveredTradeIdx}</span>
                        </div>
                        <div className="flex justify-between space-x-6 font-mono">
                          <span className="text-brand-gray font-bold uppercase">Số dư NAV:</span>
                          <span className="text-brand-mint font-black">
                            {formatCurrency(svgData.points[hoveredTradeIdx].value)}
                          </span>
                        </div>
                        {hoveredTradeIdx > 0 && (
                          <div className="flex justify-between space-x-6 font-mono border-t border-brand-surface-bright/50 pt-1 mt-1">
                            <span className="text-brand-gray font-bold uppercase">Giao dịch gần nhất:</span>
                            <span className={tradeLogs[hoveredTradeIdx - 1].profit >= 0 ? 'text-brand-mint' : 'text-brand-red'}>
                              {tradeLogs[hoveredTradeIdx - 1].profit >= 0 ? '+' : ''}
                              {formatCurrency(tradeLogs[hoveredTradeIdx - 1].profit)} ({tradeLogs[hoveredTradeIdx - 1].ticker})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chart legend instructions */}
            <div className="text-[10px] text-brand-gray font-sans italic leading-normal text-center pt-1">
              💡 Rê chuột qua các nút giao điểm tròn trên biểu đồ để xem thông số chi tiết sự thay đổi tài sản NAV của bạn qua từng lệnh.
            </div>

          </div>

        </div>

        {/* Real-time Rules Compliance List (Col-4) */}
        <div className="lg:col-span-4 bg-brand-container border border-brand-surface-bright p-5 rounded-lg space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="font-display font-bold text-xs uppercase text-brand-gray-light tracking-wider border-b border-brand-surface-bright/50 pb-3">
              Giám Sát Luật Rủi Ro Kỷ Luật
            </div>

            {/* Rules list */}
            <div className="space-y-3 font-display">
              
              {/* Rule 1 */}
              <div className={`p-3.5 rounded border transition-colors flex items-start space-x-3 ${
                stats.isCompliant.maxDailyDrawdown
                  ? 'bg-brand-mint-bg/20 border-brand-mint/10 hover:border-brand-mint/30'
                  : 'bg-brand-red-bg/20 border-brand-red/10 hover:border-brand-red/30'
              }`}>
                {stats.isCompliant.maxDailyDrawdown ? (
                  <CheckCircle className="w-5 h-5 text-brand-mint flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white uppercase">Giới hạn sụt giảm ngày &lt; 4%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    -4.0% NAV đầu ngày. Biên trần/sàn HSX là 7%, mức 4% sẽ ép trader buộc phải phân bổ danh mục (tối thiểu 2-3 mã) thay vì tất tay 1 mã đầu cơ.
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className={`p-3.5 rounded border transition-colors flex items-start space-x-3 ${
                stats.isCompliant.maxTotalDrawdown
                  ? 'bg-brand-mint-bg/20 border-brand-mint/10 hover:border-brand-mint/30'
                  : 'bg-brand-red-bg/20 border-brand-red/10 hover:border-brand-red/30'
              }`}>
                {stats.isCompliant.maxTotalDrawdown ? (
                  <CheckCircle className="w-5 h-5 text-brand-mint flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white uppercase">Giới hạn sụt giảm tổng &lt; 8%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    -8.0% NAV tính từ mốc NAV gốc ban đầu để kiểm soát rủi ro tổng tài khoản.
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className={`p-3.5 rounded border transition-colors flex items-start space-x-3 ${
                stats.isCompliant.diversification
                  ? 'bg-brand-mint-bg/20 border-brand-mint/10 hover:border-brand-mint/30'
                  : 'bg-brand-red-bg/20 border-brand-red/10 hover:border-brand-red/30'
              }`}>
                {stats.isCompliant.diversification ? (
                  <CheckCircle className="w-5 h-5 text-brand-mint flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white uppercase">Quy tắc đa dạng hóa &lt; 40%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Không mua phân bổ quá 40% NAV vào một mã cổ phiếu đơn lẻ duy nhất tại bất kỳ thời điểm nào.
                  </p>
                </div>
              </div>

              {/* Rule 4 */}
              <div className={`p-3.5 rounded border transition-colors flex items-start space-x-3 ${
                stats.isCompliant.consistency
                  ? 'bg-brand-mint-bg/20 border-brand-mint/10 hover:border-brand-mint/30'
                  : 'bg-brand-red-bg/20 border-brand-red/10 hover:border-brand-red/30'
              }`}>
                {stats.isCompliant.consistency ? (
                  <CheckCircle className="w-5 h-5 text-brand-mint flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white uppercase">Quy tắc nhất quán &lt; 40%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Lợi nhuận từ một mã cổ phiếu duy nhất không được chiếm quá 40% tổng mục tiêu lợi nhuận của toàn vòng.
                  </p>
                </div>
              </div>

              {/* Rule 5 */}
              <div className={`p-3.5 rounded border transition-colors flex items-start space-x-3 ${
                stats.isCompliant.liquidity
                  ? 'bg-brand-mint-bg/20 border-brand-mint/10 hover:border-brand-mint/30'
                  : 'bg-brand-red-bg/20 border-brand-red/10 hover:border-brand-red/30'
              }`}>
                {stats.isCompliant.liquidity ? (
                  <CheckCircle className="w-5 h-5 text-brand-mint flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-white uppercase">Bộ lọc thanh khoản VN100 / &gt;200k</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Chỉ được giao dịch các mã thuộc rổ VN100 hoặc có khối lượng giao dịch trung bình 20 phiên &gt; 200.000 cổ phiếu/phiên để tránh kẹt thanh khoản.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="text-[10px] text-brand-gray-light italic font-sans leading-relaxed border-t border-brand-surface-bright/40 pt-4 mt-6">
            (*) Đèn xanh sáng hiển thị trạng thái tài khoản đang tuân thủ nghiêm ngặt quy định quản trị rủi ro. Nếu xuất hiện cảnh báo đỏ, tài khoản mô phỏng của bạn sẽ bị đình chỉ hoặc không đạt tiêu chuẩn thăng hạng Vòng 2.
          </div>

        </div>

      </div>

      {/* Trade Entry Form & Trade Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trade Entry Form (Col-4) */}
        <div className="lg:col-span-4 bg-brand-container border border-brand-surface-bright p-5 rounded-lg space-y-4">
          <div className="font-display font-bold text-xs uppercase text-brand-gray-light tracking-wider border-b border-brand-surface-bright/50 pb-3 flex items-center justify-between">
            <span>Ghi Nhận Lệnh Giao Dịch Mới</span>
            <div className="relative group">
              <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                Công cụ giúp bạn ghi nhận các vị thế giao dịch thực tế hoặc mô phỏng. **Hãy điền lệnh giao dịch đầu tiên của bạn dưới đây để bắt đầu tự động theo dõi danh mục và kiểm tra tính tuân thủ kỷ luật!**
              </div>
            </div>
          </div>

          <form onSubmit={handleAddTrade} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Mã Cổ Phiếu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FPT, TCB..."
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Loại Giao Dịch
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('BUY')}
                    className={`py-2 text-xs font-bold rounded font-display transition-all ${
                      action === 'BUY'
                        ? 'bg-brand-mint text-brand-bg'
                        : 'bg-brand-surface border border-brand-surface-bright text-brand-gray-light'
                    }`}
                  >
                    MUA
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('SELL')}
                    className={`py-2 text-xs font-bold rounded font-display transition-all ${
                      action === 'SELL'
                        ? 'bg-brand-red text-white'
                        : 'bg-brand-surface border border-brand-surface-bright text-brand-gray-light'
                    }`}
                  >
                    BÁN
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Số Lượng Khớp *
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Tỷ Trọng Mua / NAV (%)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={weight}
                  onChange={(e) => setWeight(Math.min(100, Math.max(1, Number(e.target.value))))}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Giá Entry / Mở vị thế (điền e.g. 23.1) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                />
              </div>

              <div className="flex flex-col justify-center text-[10px] text-brand-gray font-sans italic leading-relaxed pt-2">
                <span>💡 * Vị thế mới sẽ được ghi nhận là <strong>Đang mở (HOLDING)</strong>. Bạn có thể chốt lãi lỗ bất cứ lúc nào bằng cách click nút <strong>"Chốt"</strong> trực tiếp ở cột "Giá exit" của dòng lệnh đó.</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                Nhận Xét / Lý Do Giao Dịch
              </label>
              <textarea
                placeholder="Ví dụ: Breakout hỗ trợ nền giá VN30..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-16 px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-widest rounded transition-colors uppercase flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>GHI NHẬN GIAO DỊCH</span>
            </button>

          </form>

        </div>

        {/* Trade Logs Table (Col-8) */}
        <div className="lg:col-span-8 bg-brand-container border border-brand-surface-bright p-5 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-brand-surface-bright/50 pb-3">
            <div className="font-display font-bold text-xs uppercase text-brand-gray-light tracking-wider flex items-center space-x-1.5">
              <span>Nhật Ký Khớp Lệnh Lũy Kế</span>
              <div className="relative group">
                <HelpCircle className="w-3.5 h-3.5 text-brand-gray hover:text-brand-mint cursor-help" />
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-brand-surface border border-brand-mint/30 p-2.5 rounded shadow-xl text-[10px] text-brand-gray-light leading-relaxed font-sans normal-case hidden group-hover:block z-30 transition-all pointer-events-none">
                  Danh sách lịch sử các vị thế đã khớp. Hệ thống tự động tính toán tổng tài sản và kiểm tra luật chơi từ nhật ký này. **Hãy nhập lệnh ở form bên trái để ghi nhận dữ liệu giao dịch lũy kế của bạn!**
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-[10px] text-brand-gray">
                TỔNG SỐ LỆNH: {tradeLogs.length}
              </span>
              {tradeLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử giao dịch?')) {
                      setTradeLogs([]);
                    }
                  }}
                  className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/30 hover:bg-brand-red/20 text-brand-red font-display text-[9px] font-black uppercase rounded transition-colors"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-surface-bright/50 text-[10px] uppercase text-brand-gray font-display tracking-wider">
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5">Mã</th>
                  <th className="py-2.5 text-center">Lệnh</th>
                  <th className="py-2.5 text-right">Khối lượng</th>
                  <th className="py-2.5 text-right">Giá entry</th>
                  <th className="py-2.5 text-right">Giá exit</th>
                  <th className="py-2.5 text-right">Lợi nhuận (đ)</th>
                  <th className="py-2.5 text-right">Tỷ trọng</th>
                  <th className="py-2.5 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-surface-bright/30 font-display text-xs">
                {tradeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-brand-gray text-xs font-sans">
                      <div className="text-xl mb-2">📈</div>
                      <p className="text-brand-gray-light font-bold mb-1">Chưa ghi nhận lệnh giao dịch nào</p>
                      <p className="text-brand-gray text-[10px] max-w-sm mx-auto leading-relaxed">
                        Hãy nhập lệnh giao dịch đầu tiên ở bảng bên trái để bắt đầu lập nhật ký giao dịch, theo dõi NAV tự động và kiểm tra tính tuân thủ kỷ luật thăng hạng!
                      </p>
                    </td>
                  </tr>
                ) : (
                  [...tradeLogs].reverse().map((trade) => (
                    <tr key={trade.id} className="hover:bg-brand-surface/20 transition-colors">
                      <td className="py-3 text-[10px] text-brand-gray font-mono">{trade.timestamp}</td>
                      <td className="py-3 font-bold text-white uppercase">{trade.ticker}</td>
                      <td className="py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                          trade.action === 'BUY' ? 'bg-brand-mint-bg text-brand-mint border border-brand-mint/10' : 'bg-brand-red-bg text-brand-red border border-brand-red/10'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-medium">{trade.quantity.toLocaleString('vi-VN')}</td>
                      <td className="py-3 text-right font-mono text-brand-gray-light">{trade.price.toLocaleString('vi-VN')}</td>
                      <td className="py-3 text-right font-mono text-brand-gray-light">
                        {trade.status === 'CLOSED' ? (
                          (trade.exitPrice || 0).toLocaleString('vi-VN')
                        ) : (
                          closingTradeId === trade.id ? (
                            <div className="flex items-center space-x-1 justify-end">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Giá exit"
                                value={tempExitPrice}
                                onChange={(e) => setTempExitPrice(e.target.value)}
                                className="w-14 px-1 py-0.5 bg-brand-surface border border-brand-mint rounded text-[10px] text-white focus:outline-none text-right"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCloseTrade(trade.id, tempExitPrice);
                                    setClosingTradeId(null);
                                    setTempExitPrice('');
                                  } else if (e.key === 'Escape') {
                                    setClosingTradeId(null);
                                    setTempExitPrice('');
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  handleCloseTrade(trade.id, tempExitPrice);
                                  setClosingTradeId(null);
                                  setTempExitPrice('');
                                }}
                                className="px-1 py-0.5 bg-brand-mint text-brand-bg rounded text-[9px] font-bold"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => {
                                  setClosingTradeId(null);
                                  setTempExitPrice('');
                                }}
                                className="px-1 py-0.5 bg-brand-surface border border-brand-surface-bright text-brand-gray rounded text-[9px]"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setClosingTradeId(trade.id);
                                setTempExitPrice((trade.price / 1000).toString());
                              }}
                              className="px-2 py-0.5 bg-brand-mint/10 border border-brand-mint/30 hover:bg-brand-mint/20 text-brand-mint text-[9px] font-black uppercase rounded transition-colors"
                            >
                              Chốt
                            </button>
                          )
                        )}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {trade.status === 'CLOSED' ? (
                          <span className={trade.profit >= 0 ? 'text-brand-mint font-bold' : 'text-brand-red font-bold'}>
                            {trade.profit >= 0 ? '+' : ''}
                            {trade.profit.toLocaleString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-brand-gray text-[10px] italic">Đang mở</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono text-brand-gray">{trade.weightPercentage}%</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDeleteTrade(trade.id)}
                          className="text-brand-gray hover:text-brand-red p-1 rounded transition-colors"
                          title="Xóa dòng nhật ký"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Plus, Trash2, CheckCircle, AlertTriangle, Play, HelpCircle, Activity, RotateCcw, Download } from 'lucide-react';
import { TradeLog, AccountState } from '../types';
import { BrandConfig } from '../brandConfig';
import { doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_KEY = 'protrader_trade_logs';

// Mock list of compliant VN100 tickers for the compliance validator
const COMPLIANT_TICKERS = ['FPT', 'TCB', 'HPG', 'VNM', 'MWG', 'SSI', 'VND', 'MSN', 'VHM', 'VIC', 'ACB', 'MBB', 'VPB', 'STB', 'GAS', 'CTG', 'HDB', 'VRE', 'TPB'];

export default function DashboardSection({ 
  brand, 
  currentUser, 
  onTriggerLogin 
}: { 
  brand: BrandConfig; 
  currentUser: any; 
  onTriggerLogin: () => void; 
}) {
  const [initialCapital, setInitialCapital] = useState<number>(10000000); // 10,000,000 VND (Vòng 1/2) default
  const [activeRound, setActiveRound] = useState<'vong1' | 'vong2'>('vong1');

  // Load from localStorage or Firestore
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);

  // Load and subscribe to tradeLogs
  useEffect(() => {
    if (!currentUser) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setTradeLogs(saved ? JSON.parse(saved) : []);
      } catch {
        setTradeLogs([]);
      }
      return;
    }

    const logsRef = collection(db, 'users', currentUser.uid, 'tradeLogs');
    const unsubscribe = onSnapshot(logsRef, (snapshot) => {
      const fetchedLogs: TradeLog[] = [];
      snapshot.forEach((docSnap) => {
        fetchedLogs.push(docSnap.data() as TradeLog);
      });
      fetchedLogs.sort((a, b) => a.id.localeCompare(b.id));
      setTradeLogs(fetchedLogs);
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Persist tradeLogs to localStorage whenever they change (guest mode only)
  useEffect(() => {
    if (currentUser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tradeLogs));
    } catch {
      // storage quota exceeded or unavailable
    }
  }, [tradeLogs, currentUser]);

  const closedTrades = tradeLogs.filter(t => t.status === 'CLOSED');
  
  // Form inputs state
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(100);
  const [entryPrice, setEntryPrice] = useState<string | number>(50.0);
  const [weight, setWeight] = useState<number>(20); // default 20% NAV allocation
  const [comment, setComment] = useState('');

  // Real-time position closing state
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [exitPriceInput, setExitPriceInput] = useState<string>('');

  // Selected trade index for chart tooltip
  const [hoveredTradeIdx, setHoveredTradeIdx] = useState<number | null>(null);

  // Dynamic computed state for trades
  const [computedTradeStates, setComputedTradeStates] = useState<Record<string, { realizedProfit: number; isClosed: boolean; matchedPrice?: number; remainingQty: number }>>({});

  // Stats and Compliance state calculated dynamically
  const [stats, setStats] = useState<AccountState>({
    initialBalance: 10000000,
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

    // Chronological recalculation loop
    const buyQueues: Record<string, { id: string; price: number; quantity: number; weight: number; originalQuantity: number }[]> = {};
    const activeWeights: Record<string, number> = {};
    
    // We will keep a map from trade ID to its computed state
    const computedStates: Record<string, {
      realizedProfit: number;
      isClosed: boolean;
      matchedPrice?: number;
      remainingQty: number;
    }> = {};

    // Initialize all trade states
    tradeLogs.forEach((trade) => {
      computedStates[trade.id] = {
        realizedProfit: 0,
        isClosed: trade.action === 'SELL',
        remainingQty: trade.quantity,
      };
    });

    tradeLogs.forEach((trade) => {
      const ticker = trade.ticker.toUpperCase();
      
      // 1. Check Liquidity / VN100 ticker compliant
      if (!COMPLIANT_TICKERS.includes(ticker)) {
        isLiquidityCompliant = false;
      }
      
      if (trade.action === 'BUY') {
        if (!buyQueues[ticker]) {
          buyQueues[ticker] = [];
        }
        buyQueues[ticker].push({
          id: trade.id,
          price: trade.price,
          quantity: trade.quantity,
          weight: trade.weightPercentage,
          originalQuantity: trade.quantity,
        });
        
        activeWeights[ticker] = (activeWeights[ticker] || 0) + trade.weightPercentage;
        
        computedStates[trade.id].isClosed = false;
        computedStates[trade.id].remainingQty = trade.quantity;
      } else {
        // SELL transaction
        let sellQtyRemaining = trade.quantity;
        let matchedProfitSum = 0;
        let weightedEntrySum = 0;
        let totalMatchedQty = 0;
        
        const queue = buyQueues[ticker] || [];
        while (sellQtyRemaining > 0 && queue.length > 0) {
          const buy = queue[0];
          const matchedQty = Math.min(sellQtyRemaining, buy.quantity);
          const matchedWeight = buy.weight * (matchedQty / buy.quantity);
          
          matchedProfitSum += matchedQty * (trade.price - buy.price) * 1000;
          weightedEntrySum += matchedQty * buy.price;
          totalMatchedQty += matchedQty;
          
          buy.quantity -= matchedQty;
          buy.weight = Math.max(0, buy.weight - matchedWeight);
          
          computedStates[buy.id].remainingQty = buy.quantity;
          if (buy.quantity === 0) {
            computedStates[buy.id].isClosed = true;
            queue.shift();
          }
          
          activeWeights[ticker] = Math.max(0, (activeWeights[ticker] || 0) - matchedWeight);
          sellQtyRemaining -= matchedQty;
        }
        
        computedStates[trade.id].realizedProfit = matchedProfitSum;
        computedStates[trade.id].matchedPrice = totalMatchedQty > 0 ? (weightedEntrySum / totalMatchedQty) : undefined;
        computedStates[trade.id].isClosed = true;
        computedStates[trade.id].remainingQty = 0;
        
        balance += matchedProfitSum;
        
        if (balance > peak) {
          peak = balance;
        }
        
        const currentDD = ((peak - balance) / peak) * 100;
        if (currentDD > maxDD) {
          maxDD = currentDD;
        }
        
        if (matchedProfitSum > 0) {
          winCount++;
        }
        
        // Check Max Daily Drawdown rule
        const tradeDDPercentage = (Math.abs(matchedProfitSum) / peak) * 100;
        if (matchedProfitSum < 0 && tradeDDPercentage >= 4.0) {
          isDailyDrawdownCompliant = false;
        }
        
        // Check Consistency rule
        if (matchedProfitSum > 0 && matchedProfitSum > targetProfit * 0.4) {
          isConsistencyCompliant = false;
        }
      }
      
      // Check diversification weight limit at each transaction state
      Object.keys(activeWeights).forEach((t) => {
        if (activeWeights[t] > 40) {
          isDiversificationCompliant = false;
        }
      });
    });

    // Overall total drawdown check
    const totalDD = ((peak - balance) / initialCapital) * 100;
    if (totalDD >= 8.0 || ((initialCapital - balance) / initialCapital) * 100 >= 8.0) {
      isTotalDrawdownCompliant = false;
    }

    const sellTrades = tradeLogs.filter(t => t.action === 'SELL');
    const calculatedWinRate = sellTrades.length > 0 ? (winCount / sellTrades.length) * 100 : 0;

    // Last sell loss for dailyDrawdown display
    const lastSell = sellTrades[sellTrades.length - 1];
    const lastSellProfit = lastSell ? (computedStates[lastSell.id]?.realizedProfit || 0) : 0;

    setStats({
      initialBalance: initialCapital,
      currentBalance: balance,
      peakBalance: peak,
      totalTrades: sellTrades.length,
      winRate: calculatedWinRate,
      maxDrawdown: maxDD,
      dailyDrawdown: lastSellProfit < 0 
        ? (Math.abs(lastSellProfit) / peak) * 100 
        : 0,
      isCompliant: {
        maxDailyDrawdown: isDailyDrawdownCompliant,
        maxTotalDrawdown: isTotalDrawdownCompliant,
        diversification: isDiversificationCompliant,
        consistency: isConsistencyCompliant,
        liquidity: isLiquidityCompliant,
      }
    });

    setComputedTradeStates(computedStates);
  }, [tradeLogs, initialCapital]);

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    const cleaned = String(entryPrice).trim().replace(/,/g, '.');
    const parsedPrice = parseFloat(cleaned);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Vui lòng nhập giá giao dịch hợp lệ!');
      return;
    }

    const newTrade: TradeLog = {
      id: 't_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ticker: ticker.toUpperCase(),
      action,
      quantity,
      price: parsedPrice,
      comment: comment || 'Ghi nhận thủ công từ mô phỏng.',
      weightPercentage: action === 'BUY' ? weight : 0,
      status: action === 'BUY' ? 'OPEN' : 'CLOSED',
    };

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'tradeLogs', newTrade.id);
      setDoc(docRef, newTrade).catch(err => console.error("Error adding trade to firestore:", err));
    } else {
      setTradeLogs([...tradeLogs, newTrade]);
    }

    // Reset all inputs to blank
    setTicker('');
    setAction('BUY');
    setQuantity(100);
    setEntryPrice('');
    setWeight(20);
    setComment('');
  };

  const handleConfirmCloseTrade = (id: string) => {
    const cleaned = exitPriceInput.trim().replace(/,/g, '.');
    const val = parseFloat(cleaned);
    if (isNaN(val) || val <= 0) {
      alert('Vui lòng nhập giá exit hợp lệ!');
      return;
    }

    const matchedTrade = tradeLogs.find(t => t.id === id);
    if (!matchedTrade) return;

    const matchedState = computedTradeStates[id];
    const qtyToClose = matchedState ? matchedState.remainingQty : matchedTrade.quantity;

    if (qtyToClose <= 0) {
      alert('Vị thế này đã được đóng hoàn toàn!');
      setClosingTradeId(null);
      setExitPriceInput('');
      return;
    }

    // Create a new BÁN trade log
    const closeTrade: TradeLog = {
      id: 't_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ticker: matchedTrade.ticker.toUpperCase(),
      action: 'SELL',
      quantity: qtyToClose,
      price: val,
      comment: `Chốt vị thế cho lệnh mua ngày ${matchedTrade.timestamp}.`,
      weightPercentage: 0,
      status: 'CLOSED',
    };

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'tradeLogs', closeTrade.id);
      setDoc(docRef, closeTrade).catch(err => console.error("Error closing trade in firestore:", err));
    } else {
      setTradeLogs([...tradeLogs, closeTrade]);
    }

    setClosingTradeId(null);
    setExitPriceInput('');
  };

  const handleDeleteTrade = (id: string) => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'tradeLogs', id);
      deleteDoc(docRef).catch(err => console.error("Error deleting trade in firestore:", err));
    } else {
      setTradeLogs(tradeLogs.filter(t => t.id !== id));
    }
  };

  const handleResetTerminal = () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ nhật ký giao dịch không? Hành động này không thể hoàn tác.')) {
      if (currentUser) {
        const batch = writeBatch(db);
        tradeLogs.forEach(t => {
          const docRef = doc(db, 'users', currentUser.uid, 'tradeLogs', t.id);
          batch.delete(docRef);
        });
        batch.commit().catch(err => console.error("Error resetting trades in firestore:", err));
      } else {
        setTradeLogs([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      }
    }
  };

  // Export journal as CSV file
  const handleExportCSV = useCallback(() => {
    if (tradeLogs.length === 0) {
      alert('Nhật ký giao dịch đang trống, không có dữ liệu để xuất.');
      return;
    }
    const buyQueues: Record<string, { price: number; quantity: number }[]> = {};
    const computedRows = tradeLogs.map(t => {
      const ticker = t.ticker.toUpperCase();
      let entryPriceStr = '';
      let exitPriceStr = '';
      let profit = 0;

      if (t.action === 'BUY') {
        if (!buyQueues[ticker]) {
          buyQueues[ticker] = [];
        }
        buyQueues[ticker].push({ price: t.price, quantity: t.quantity });
        entryPriceStr = String(t.price);
        exitPriceStr = '';
        profit = 0;
      } else {
        exitPriceStr = String(t.price);
        let sellQtyRemaining = t.quantity;
        let matchedProfitSum = 0;
        let weightedEntrySum = 0;
        let totalMatchedQty = 0;
        const queue = buyQueues[ticker] || [];
        
        while (sellQtyRemaining > 0 && queue.length > 0) {
          const buy = queue[0];
          const matchedQty = Math.min(sellQtyRemaining, buy.quantity);
          matchedProfitSum += matchedQty * (t.price - buy.price) * 1000;
          weightedEntrySum += matchedQty * buy.price;
          totalMatchedQty += matchedQty;
          
          buy.quantity -= matchedQty;
          if (buy.quantity === 0) {
            queue.shift();
          }
          sellQtyRemaining -= matchedQty;
        }
        
        entryPriceStr = totalMatchedQty > 0 ? String(weightedEntrySum / totalMatchedQty) : '';
        profit = matchedProfitSum;
      }

      return [
        t.timestamp,
        t.ticker,
        t.action === 'BUY' ? 'MUA' : 'BÁN',
        t.quantity,
        entryPriceStr,
        exitPriceStr,
        profit,
        t.action === 'BUY' ? t.weightPercentage : '',
        `"${(t.comment || '').replace(/"/g, '""')}"`
      ];
    });

    const headers = ['Thời Gian', 'Mã CK', 'Lệnh', 'Khối Lượng', 'Giá Entry (x1000đ)', 'Giá Exit (x1000đ)', 'Lợi Nhuận (đ)', 'Tỷ Trọng (%)', 'Nhận Xét'];
    const csvContent = [headers.join(','), ...computedRows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhat-ky-giao-dich-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tradeLogs]);

  // Build the coordinates for our custom high-fidelity SVG chart (CLOSED positions only)
  const buildSvgPath = (width: number, height: number) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Track cumulative balance progression starting with initialCapital
    const balanceHistory: number[] = [initialCapital];
    let runningBalance = initialCapital;

    // FIFO Queue for matching:
    const buyQueues: Record<string, { price: number; quantity: number }[]> = {};

    tradeLogs.forEach((trade) => {
      const ticker = trade.ticker.toUpperCase();
      if (trade.action === 'BUY') {
        if (!buyQueues[ticker]) {
          buyQueues[ticker] = [];
        }
        buyQueues[ticker].push({ price: trade.price, quantity: trade.quantity });
      } else {
        let sellQtyRemaining = trade.quantity;
        let matchedProfitSum = 0;
        const queue = buyQueues[ticker] || [];
        
        while (sellQtyRemaining > 0 && queue.length > 0) {
          const buy = queue[0];
          const matchedQty = Math.min(sellQtyRemaining, buy.quantity);
          matchedProfitSum += matchedQty * (trade.price - buy.price) * 1000;
          buy.quantity -= matchedQty;
          if (buy.quantity === 0) {
            queue.shift();
          }
          sellQtyRemaining -= matchedQty;
        }
        
        runningBalance += matchedProfitSum;
        balanceHistory.push(runningBalance);
      }
    });

    if (balanceHistory.length === 1) {
      balanceHistory.push(initialCapital);
    }

    const minVal = Math.min(...balanceHistory) * 0.98;
    const maxVal = Math.max(...balanceHistory) * 1.02;
    const valRange = maxVal - minVal || 1;

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
          className="flex items-center space-x-2 px-3.5 py-2 bg-brand-surface border border-brand-surface-bright hover:border-brand-red text-xs font-bold font-display text-brand-gray-light hover:text-brand-red rounded transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>LÀM MỚI TOÀN BỘ</span>
        </button>
      </div>

      {/* Auth Banner CTA */}
      {!currentUser && (
        <div className="bg-brand-surface-bright/20 border border-brand-mint/30 rounded p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[0_0_20px_rgba(0,225,161,0.05)]">
          <div className="space-y-1">
            <div className="text-xs font-bold font-display text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 bg-brand-mint rounded-full animate-ping animate-duration-1000" />
              <span>Chế độ Khách (Lưu tạm thời)</span>
            </div>
            <p className="text-[11px] text-brand-gray leading-relaxed font-sans max-w-2xl">
              Nhật ký giao dịch của bạn hiện đang được lưu tạm trên trình duyệt này. Hãy **Đăng ký** hoặc **Đăng nhập** tài khoản để kích hoạt lưu trữ đám mây, bảo vệ nhật ký và theo dõi hiệu suất thực chiến lâu dài của bạn.
            </p>
          </div>
          <button
            onClick={onTriggerLogin}
            className="flex-shrink-0 px-4 py-2 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-wider rounded transition-all uppercase cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Starting capital selection */}
      <div className="bg-brand-container border border-brand-surface-bright p-5 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
            Hạn mức NAV (Chọn Vòng 1 hoặc Vòng 2):
          </label>
          <span className="text-[11px] text-brand-gray block mt-1 font-sans">Chọn hạn mức của Vòng 1 hoặc Vòng 2 để chạy mô phỏng</span>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          {['vong1', 'vong2'].map((round) => (
            <button
              key={round}
              onClick={() => {
                setActiveRound(round as 'vong1' | 'vong2');
                setInitialCapital(10000000);
              }}
              className={`px-4 py-2.5 rounded font-mono text-xs font-bold tracking-wider border transition-all ${
                activeRound === round
                  ? 'bg-brand-mint text-brand-bg border-brand-mint shadow-[0_0_15px_rgba(0,225,161,0.25)]'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white hover:border-brand-gray'
              }`}
            >
              {round === 'vong1' ? '10M VND (Vòng 1)' : '10M VND (Vòng 2)'}
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
                            stroke="#232c27"
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
                          style={{ filter: `drop-shadow(0 0 8px rgba(var(--brand-glow), 0.5))` }}
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
                        {hoveredTradeIdx > 0 && closedTrades[hoveredTradeIdx - 1] && (
                          <div className="flex justify-between space-x-6 font-mono border-t border-brand-surface-bright/50 pt-1 mt-1">
                            <span className="text-brand-gray font-bold uppercase">Giao dịch gần nhất:</span>
                            <span className={closedTrades[hoveredTradeIdx - 1].profit >= 0 ? 'text-brand-mint' : 'text-brand-red'}>
                              {closedTrades[hoveredTradeIdx - 1].profit >= 0 ? '+' : ''}
                              {formatCurrency(closedTrades[hoveredTradeIdx - 1].profit)} ({closedTrades[hoveredTradeIdx - 1].ticker})
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
                  <div className="text-xs font-bold text-white uppercase">Sụt giảm ngày &lt; 4%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Lỗ tối đa của một giao dịch đơn lẻ không được làm sụt giảm quá 4% giá trị đỉnh NAV của ngày.
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
                  <div className="text-xs font-bold text-white uppercase">Sụt giảm tổng tài khoản &lt; 8%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Giá trị NAV tài khoản không bao giờ được sụt giảm quá 8% so với số tiền nạp ban đầu.
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
                  <div className="text-xs font-bold text-white uppercase">Tỷ trọng mã đơn lẻ &lt; 40%</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Không được phân bổ tỷ trọng mua của một mã vượt quá 40% tổng tài sản ban đầu nhằm giảm rủi ro tập trung.
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
                  <div className="text-xs font-bold text-white uppercase">Tính Nhất Quán Lợi Nhuận</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Lợi nhuận từ một mã đơn lẻ không được chiếm quá 40% trong tổng chỉ tiêu 5% NAV yêu cầu để thăng hạng.
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
                  <div className="text-xs font-bold text-white uppercase">Danh Mục VN100 / &gt;200k</div>
                  <p className="text-[10px] text-brand-gray leading-relaxed font-sans font-light mt-0.5">
                    Chỉ giao dịch các mã cổ phiếu an toàn thuộc rổ VN100 có khối lượng trung bình phiên &gt; 200.000 cổ phiếu.
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
          <div className="font-display font-bold text-xs uppercase text-brand-gray-light tracking-wider border-b border-brand-surface-bright/50 pb-3">
            Ghi Nhận Lệnh Giao Dịch Mới
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
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                  Tỷ Trọng Mua / NAV (%)
                </label>
                {action === 'BUY' ? (
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={weight}
                    onChange={(e) => setWeight(Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint"
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    value="Không áp dụng"
                    className="w-full px-3 py-2 bg-brand-surface/40 border border-brand-surface-bright/50 rounded text-xs text-brand-gray cursor-not-allowed focus:outline-none font-sans"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-gray tracking-wider font-display mb-1.5">
                {action === 'BUY' ? 'Giá Entry (x1.000 đ) *' : 'Giá Exit (x1.000 đ) *'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder={action === 'BUY' ? 'Ví dụ: 28.5' : 'Ví dụ: 30.0'}
                value={entryPrice}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/,/g, '.');
                  setEntryPrice(cleaned);
                }}
                className="w-full px-3 py-2 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint font-mono"
              />
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
            <div className="font-display font-bold text-xs uppercase text-brand-gray-light tracking-wider">
              Nhật Ký Khớp Lệnh Lũy Kế
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-brand-gray">
                TỔNG SỐ LỆNH: {tradeLogs.length}
              </span>
              <button
                onClick={handleExportCSV}
                title="Tải về file CSV"
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-surface border border-brand-surface-bright text-brand-gray-light hover:text-brand-mint hover:border-brand-mint transition-colors"
              >
                <Download className="w-3 h-3" />
                Tải CSV
              </button>
              <button
                onClick={handleResetTerminal}
                title="Xóa toàn bộ nhật ký"
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-surface border border-brand-surface-bright text-brand-gray hover:text-brand-red hover:border-brand-red transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Xóa Tất Cả
              </button>
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
                    <td colSpan={9} className="py-8 text-center text-brand-gray text-xs font-sans">
                      Không có lệnh giao dịch nào trong bộ nhớ. Thêm lệnh mới bằng form bên cạnh.
                    </td>
                  </tr>
                ) : (
                  [...tradeLogs].reverse().map((trade) => {
                    const computedState = computedTradeStates[trade.id];
                    const isClosed = computedState ? computedState.isClosed : (trade.action === 'SELL');
                    const entryPriceToRender = trade.action === 'BUY'
                      ? trade.price
                      : (computedState?.matchedPrice !== undefined ? computedState.matchedPrice : undefined);
                    const exitPriceToRender = trade.action === 'SELL'
                      ? trade.price
                      : undefined;
                    const profitToRender = trade.action === 'SELL'
                      ? (computedState?.realizedProfit || 0)
                      : 0;

                    return (
                      <tr key={trade.id} className="hover:bg-brand-surface/20 transition-colors">
                        <td className="py-3 text-[10px] text-brand-gray font-mono">{trade.timestamp}</td>
                        <td className="py-3 font-bold text-white uppercase">
                          <div className="flex items-center space-x-1.5">
                            <span>{trade.ticker}</span>
                            {trade.action === 'BUY' && !isClosed ? (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mint opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-mint" title="Đang mở (HOLDING)"></span>
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                            trade.action === 'BUY' ? 'bg-brand-mint-bg text-brand-mint border border-brand-mint/10' : 'bg-brand-red-bg text-brand-red border border-brand-red/10'
                          }`}>
                            {trade.action === 'BUY' ? 'MUA' : 'BÁN'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-medium text-white">
                          {trade.quantity.toLocaleString('vi-VN')}
                          {trade.action === 'BUY' && computedState && computedState.remainingQty < trade.quantity && computedState.remainingQty > 0 && (
                            <span className="text-[9px] text-brand-mint block font-sans font-light">
                              (còn {computedState.remainingQty.toLocaleString('vi-VN')})
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-brand-gray-light">
                          {entryPriceToRender !== undefined
                            ? entryPriceToRender.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 3 })
                            : '-'
                          }
                        </td>
                        <td className="py-3 text-right font-mono text-brand-gray-light">
                          {trade.action === 'BUY' ? (
                            !isClosed ? (
                              closingTradeId === trade.id ? (
                                <div className="flex items-center space-x-1 justify-end">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    placeholder="Giá exit"
                                    value={exitPriceInput}
                                    onChange={(e) => setExitPriceInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleConfirmCloseTrade(trade.id);
                                      } else if (e.key === 'Escape') {
                                        setClosingTradeId(null);
                                        setExitPriceInput('');
                                      }
                                    }}
                                    className="w-16 px-1.5 py-1 bg-brand-surface border border-brand-mint rounded text-[11px] text-white font-mono text-right focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleConfirmCloseTrade(trade.id)}
                                    className="p-1 text-brand-mint hover:text-white hover:bg-brand-mint/20 rounded font-sans font-bold"
                                    title="Xác nhận"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setClosingTradeId(null);
                                      setExitPriceInput('');
                                    }}
                                    className="p-1 text-brand-red hover:text-white hover:bg-brand-red/20 rounded font-sans font-bold"
                                    title="Hủy"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setClosingTradeId(trade.id);
                                    setExitPriceInput('');
                                  }}
                                  className="px-2 py-0.5 bg-brand-mint/10 border border-brand-mint/30 hover:bg-brand-mint hover:text-brand-bg rounded text-[9px] font-bold text-brand-mint transition-all uppercase tracking-wider font-display"
                                >
                                  CHỐT
                                </button>
                              )
                            ) : (
                              '-'
                            )
                          ) : (
                            exitPriceToRender !== undefined
                              ? exitPriceToRender.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 3 })
                              : '-'
                          )}
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          trade.action === 'BUY'
                            ? 'text-brand-gray'
                            : profitToRender >= 0 ? 'text-brand-mint' : 'text-brand-red'
                        }`}>
                          {trade.action === 'BUY' ? (
                            !isClosed ? (
                              <span className="text-[10px] italic">Đang mở</span>
                            ) : (
                              '-'
                            )
                          ) : (
                            <>
                              {profitToRender >= 0 ? '+' : ''}
                              {profitToRender.toLocaleString('vi-VN')}
                            </>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-brand-gray">
                          {trade.action === 'BUY' ? `${trade.weightPercentage}%` : '-'}
                        </td>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}

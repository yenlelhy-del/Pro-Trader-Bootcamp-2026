import React, { useState, useEffect } from 'react';
import { Search, Award, CheckCircle, XCircle, ArrowUpRight, Shield, HelpCircle, Activity, Calendar, TrendingUp } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { BrandConfig } from '../brandConfig';

interface LeaderboardSectionProps {
  brand: BrandConfig;
}

interface FirestoreTrader {
  accountId: string;
  name: string;
  initialBalance: number;
  currentNAV: number;
  peakNAV: number;
  navGrowth: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  winRate: number;
  isCompliant: boolean;
  stage: string;
  reportDate?: string;
  lastUpdated?: string;
  rank?: number;
}

interface SnapshotEntry {
  date: string;
  navValue: number;
  navGrowth: number;
}

export default function LeaderboardSection({ brand }: LeaderboardSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<'All' | 'Vòng 1' | 'Vòng 2'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Compliant' | 'Violated'>('All');
  
  // Real-time Firestore state
  const [traders, setTraders] = useState<FirestoreTrader[]>([]);
  const [lastReportDate, setLastReportDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Detailed Modal states
  const [selectedTrader, setSelectedTrader] = useState<FirestoreTrader | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  // 1. Listen to global leaderboard data
  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('navGrowth', 'desc'));
    
    const unsubscribeTraders = onSnapshot(q, (snapshot) => {
      const parsed: FirestoreTrader[] = [];
      snapshot.forEach((doc) => {
        parsed.push({ id: doc.id, ...doc.data() } as any);
      });
      
      // Assign ranks dynamically based on sorted order
      const ranked = parsed.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
      
      setTraders(ranked);
      setLoading(false);
    }, (err) => {
      console.error("Error reading leaderboard:", err);
      setLoading(false);
    });

    // Listen to global metadata report date
    const unsubscribeMeta = onSnapshot(doc(db, 'leaderboard_metadata', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastReportDate) {
          setLastReportDate(data.lastReportDate);
        }
      }
    });

    return () => {
      unsubscribeTraders();
      unsubscribeMeta();
    };
  }, []);

  // 2. Fetch history snapshots when a trader is selected
  useEffect(() => {
    if (!selectedTrader) {
      setSnapshots([]);
      return;
    }

    setLoadingSnapshots(true);
    const snapQuery = query(
      collection(db, 'leaderboard_snapshots'),
      where('accountId', '==', selectedTrader.accountId),
      orderBy('date', 'asc')
    );

    getDocs(snapQuery)
      .then((snapShot) => {
        const list: SnapshotEntry[] = [];
        snapShot.forEach((doc) => {
          const d = doc.data();
          list.push({
            date: d.date,
            navValue: d.navValue,
            navGrowth: d.navGrowth
          });
        });
        setSnapshots(list);
      })
      .catch((err) => {
        console.error("Error loading snapshots:", err);
      })
      .finally(() => {
        setLoadingSnapshots(false);
      });
  }, [selectedTrader]);

  // Filter leaderboard based on UI criteria
  const filteredTraders = traders.filter((trader) => {
    const matchesSearch = trader.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          trader.accountId.includes(searchTerm);
    const matchesStage = selectedStage === 'All' || trader.stage === selectedStage;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Compliant' && trader.isCompliant) ||
      (selectedStatus === 'Violated' && !trader.isCompliant);

    return matchesSearch && matchesStage && matchesStatus;
  });

  const formatDateVN = (dateStr: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Render SVG Chart for historical NAV
  const renderNavChart = () => {
    if (snapshots.length < 2) {
      return (
        <div className="h-40 bg-brand-surface border border-brand-surface-bright rounded flex items-center justify-center text-xs text-brand-gray italic font-sans">
          Chưa đủ dữ liệu lịch sử để vẽ biểu đồ (Cần tối thiểu báo cáo của 2 ngày).
        </div>
      );
    }

    const width = 450;
    const height = 160;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = snapshots.map(s => s.navValue);
    const minVal = Math.min(...values) * 0.99;
    const maxVal = Math.max(...values) * 1.01;
    const valRange = maxVal - minVal || 1;

    const points = snapshots.map((s, idx) => {
      const x = padding + (idx / (snapshots.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((s.navValue - minVal) / valRange) * chartHeight;
      return { x, y };
    });

    let d = '';
    points.forEach((pt, idx) => {
      if (idx === 0) d += `M ${pt.x} ${pt.y}`;
      else d += ` L ${pt.x} ${pt.y}`;
    });

    let areaD = d;
    if (points.length > 0) {
      areaD += ` L ${points[points.length - 1].x} ${height - padding}`;
      areaD += ` L ${points[0].x} ${height - padding} Z`;
    }

    return (
      <div className="space-y-1">
        <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block mb-1">
          Biểu đồ NAV tích lũy:
        </span>
        <div className="bg-brand-surface border border-brand-surface-bright/60 p-2.5 rounded relative overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Gradient fill */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e1a1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00e1a1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Zero line */}
            <line 
              x1={padding} 
              y1={padding + chartHeight} 
              x2={width - padding} 
              y2={padding + chartHeight} 
              stroke="#2e3532" 
              strokeWidth="1" 
              strokeDasharray="3 3"
            />

            {/* Area Path */}
            <path d={areaD} fill="url(#chartGrad)" />

            {/* Line Path */}
            <path d={d} fill="none" stroke="#00e1a1" strokeWidth="2.5" />

            {/* End glowing point */}
            {points.length > 0 && (
              <circle 
                cx={points[points.length - 1].x} 
                cy={points[points.length - 1].y} 
                r="4" 
                fill="#00e1a1" 
                className="animate-ping"
              />
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Title */}
      <div className="border-b border-brand-surface-bright/50 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-brand-mint-bg border border-brand-mint/30 px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-pulse" />
            <span className="font-display text-[10px] font-bold text-brand-mint tracking-wider uppercase">LIVE STATISTICS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-2">
            BẢNG XẾP HẠNG TRADER CHUYÊN NGHIỆP
          </h1>
          <p className="text-brand-gray text-xs sm:text-sm font-sans mt-1">
            Bảng vinh danh trực tuyến dựa trên kết quả báo cáo chính thức của Công ty Chứng khoán.
          </p>
        </div>

        {/* Update date badge based on report */}
        <div className="flex items-center space-x-2 bg-brand-container border border-brand-surface-bright px-3.5 py-2 rounded">
          <Calendar className="w-4 h-4 text-brand-mint" />
          <span className="text-xs font-bold font-display uppercase tracking-wide text-brand-gray-light">
            Báo cáo ngày: <strong className="text-white font-mono ml-0.5">{formatDateVN(lastReportDate)}</strong>
          </span>
        </div>
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
            placeholder="Tìm kiếm họ tên / Mã tài khoản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-colors font-sans"
          />
        </div>

        {/* Stage selection tabs */}
        <div className="md:col-span-4 flex space-x-2">
          {['All', 'Vòng 1', 'Vòng 2'].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage as any)}
              className={`flex-1 py-2.5 text-xs font-bold font-display rounded border transition-all cursor-pointer ${
                selectedStage === stage
                  ? 'bg-brand-mint-bg text-brand-mint border-brand-mint'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white'
              }`}
            >
              STAGE: {stage === 'All' ? 'TẤT CẢ' : stage.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Status selection tabs */}
        <div className="md:col-span-4 flex space-x-2">
          {['All', 'Compliant', 'Violated'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as any)}
              className={`flex-1 py-2.5 text-xs font-bold font-display rounded border transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-brand-mint-bg text-brand-mint border-brand-mint'
                  : 'bg-brand-surface border-brand-surface-bright text-brand-gray-light hover:text-white'
              }`}
            >
              {status === 'All' ? 'TẤT CẢ TRẠNG THÁI' : status === 'Compliant' ? 'ĐẠT KỶ LUẬT' : 'VI PHẠM LUẬT'}
            </button>
          ))}
        </div>

      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-brand-container border border-brand-surface-bright rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-brand-surface-bright/50 flex justify-between items-center bg-brand-surface-bright/10">
          <span className="font-display font-bold text-xs uppercase text-brand-gray-light">DANH SÁCH BAN VINH DANH</span>
          <span className="font-mono text-[10px] text-brand-gray">HIỂN THỊ: {filteredTraders.length} HỌC VIÊN</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-mint animate-spin mx-auto" />
            <p className="text-brand-gray text-xs font-sans">Đang tải bảng xếp hạng từ Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-surface-bright/50 text-[10px] uppercase text-brand-gray font-display tracking-wider">
                  <th className="p-4 text-center w-16">Hạng</th>
                  <th className="py-4">Họ và tên / Mã TK</th>
                  <th className="py-4 text-right w-36">Tài sản ròng (NAV)</th>
                  <th className="py-4 text-right w-28">Tăng Trưởng</th>
                  <th className="py-4 text-right w-28">Max Drawdown</th>
                  <th className="py-4 text-right w-28">Daily DD</th>
                  <th className="py-4 text-right w-28">Win Rate</th>
                  <th className="py-4 text-center w-28">Vòng</th>
                  <th className="py-4 text-center w-24">Kết quả</th>
                  <th className="p-4 text-center w-20">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-surface-bright/25 font-display text-xs">
                {filteredTraders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-brand-gray font-sans">
                      Không tìm thấy trader nào trong danh sách xếp hạng.
                    </td>
                  </tr>
                ) : (
                  filteredTraders.map((trader) => {
                    const isTop3 = (trader.rank || 0) <= 3;
                    return (
                      <tr
                        key={trader.accountId}
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

                        {/* Name & ID */}
                        <td className="py-4">
                          <div>
                            <span className="font-bold text-white group-hover:text-brand-mint transition-colors block text-xs">
                              {trader.name}
                            </span>
                            <span className="text-[10px] text-brand-gray font-mono">ID: {trader.accountId}</span>
                          </div>
                        </td>

                        {/* NAV Val */}
                        <td className="py-4 text-right font-mono font-semibold text-white">
                          {new Intl.NumberFormat('vi-VN').format(trader.currentNAV)} đ
                        </td>

                        {/* Profit growth */}
                        <td className={`py-4 text-right font-mono font-black ${trader.navGrowth >= 0 ? 'text-brand-mint' : 'text-brand-red'}`}>
                          {trader.navGrowth >= 0 ? '+' : ''}{trader.navGrowth.toFixed(2)}%
                        </td>

                        {/* Max Drawdown */}
                        <td className="py-4 text-right font-mono font-bold text-brand-red/90">
                          {trader.maxDrawdown > 0 ? '-' : ''}{trader.maxDrawdown.toFixed(2)}%
                        </td>

                        {/* Daily Drawdown */}
                        <td className="py-4 text-right font-mono font-bold text-brand-red/80">
                          {trader.dailyDrawdown > 0 ? '-' : ''}{trader.dailyDrawdown.toFixed(2)}%
                        </td>

                        {/* Win Rate */}
                        <td className="py-4 text-right font-mono text-brand-gray-light">
                          {trader.winRate.toFixed(2)}%
                        </td>

                        {/* Stage badge */}
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            trader.stage === 'Vòng 2'
                              ? 'bg-brand-mint-bg text-brand-mint border border-brand-mint/20'
                              : 'bg-brand-gray-dark/20 text-brand-gray border border-brand-gray-dark/40'
                          }`}>
                            {trader.stage}
                          </span>
                        </td>

                        {/* Result badge */}
                        <td className="py-4 text-center">
                          {trader.isCompliant ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-brand-mint">
                              <CheckCircle className="w-4 h-4 mr-1 text-brand-mint" />
                              <span>Đạt</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-bold text-brand-red">
                              <XCircle className="w-4 h-4 mr-1 text-brand-red" />
                              <span>Vi Phạm</span>
                            </span>
                          )}
                        </td>

                        {/* Action trigger */}
                        <td className="p-4 text-center">
                          <button className="p-1.5 bg-brand-surface group-hover:bg-brand-mint-bg border border-brand-surface-bright group-hover:border-brand-mint rounded text-brand-gray group-hover:text-brand-mint transition-all cursor-pointer">
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
        )}
      </div>

      {/* --- POPUP DETAIL MODAL: TRADER DETAILED REPORT CARD --- */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedTrader(null)} />
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 max-w-lg w-full relative z-10 space-y-6 animate-fade-in shadow-[0_0_50px_rgba(0,225,161,0.15)]">
            
            {/* Header: Name and accountId */}
            <div className="flex justify-between items-start border-b border-brand-surface-bright pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-black text-lg text-white uppercase">{selectedTrader.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    selectedTrader.stage === 'Vòng 2' ? 'bg-brand-mint-bg text-brand-mint' : 'bg-brand-gray-dark/20 text-brand-gray'
                  }`}>
                    {selectedTrader.stage}
                  </span>
                </div>
                <p className="text-brand-gray text-xs font-sans mt-0.5">
                  Tài khoản học viên: <strong className="font-mono text-white">{selectedTrader.accountId}</strong>
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-display uppercase ${
                selectedTrader.isCompliant ? 'bg-brand-mint-bg text-brand-mint' : 'bg-brand-red/10 text-brand-red'
              }`}>
                {selectedTrader.isCompliant ? 'Đạt Kỷ Luật' : 'Vi Phạm Rút Vốn'}
              </span>
            </div>

            {/* Chart Snapshot history */}
            {loadingSnapshots ? (
              <div className="h-40 flex items-center justify-center text-brand-gray text-xs space-x-2 font-sans">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-mint" />
                <span>Đang tải lịch sử tài sản...</span>
              </div>
            ) : (
              renderNavChart()
            )}

            {/* Performance analysis matrix */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tăng trưởng lũy kế:</span>
                <span className={`font-mono text-lg font-black ${selectedTrader.navGrowth >= 0 ? 'text-brand-mint' : 'text-brand-red'}`}>
                  {selectedTrader.navGrowth >= 0 ? '+' : ''}{selectedTrader.navGrowth.toFixed(2)}%
                </span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Drawdown từ đỉnh (Max):</span>
                <span className="font-mono text-lg font-black text-brand-red">-{selectedTrader.maxDrawdown.toFixed(2)}%</span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Sụt giảm trong ngày:</span>
                <span className="font-mono text-sm font-bold text-white">-{selectedTrader.dailyDrawdown.toFixed(2)}%</span>
              </div>

              <div className="bg-brand-surface border border-brand-surface-bright/60 p-3 rounded">
                <span className="text-[9px] text-brand-gray uppercase font-bold tracking-wider font-display block">Tỷ lệ thắng (Win Rate):</span>
                <span className="font-mono text-sm font-bold text-white">{selectedTrader.winRate.toFixed(2)}%</span>
              </div>

            </div>

            {/* Qualitative profile info */}
            <div className="space-y-3 font-sans text-xs text-brand-gray-light leading-relaxed border-t border-brand-surface-bright/50 pt-4">
              <div>
                <strong className="text-white font-medium block mb-1">Ràng buộc Quy tắc Kỷ luật:</strong>
                <div className="space-y-1 mt-1 font-display text-[11px]">
                  <div className={`flex items-center ${selectedTrader.dailyDrawdown <= 4.0 ? 'text-brand-mint' : 'text-brand-red'}`}>
                    {selectedTrader.dailyDrawdown <= 4.0 ? (
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-brand-mint" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mr-1.5 text-brand-red" />
                    )}
                    <span>Daily Drawdown Limit (Max 4%): {selectedTrader.dailyDrawdown <= 4.0 ? 'Tuân thủ' : 'Vi phạm'}</span>
                  </div>
                  <div className={`flex items-center ${selectedTrader.maxDrawdown <= 8.0 ? 'text-brand-mint' : 'text-brand-red'}`}>
                    {selectedTrader.maxDrawdown <= 8.0 ? (
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-brand-mint" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mr-1.5 text-brand-red" />
                    )}
                    <span>Max Overall Drawdown (Max 8%): {selectedTrader.maxDrawdown <= 8.0 ? 'Tuân thủ' : 'Vi phạm'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedTrader(null)}
                className="w-full py-2.5 bg-brand-surface hover:bg-brand-surface-bright border border-brand-surface-bright text-white font-display text-xs font-bold rounded transition-colors uppercase cursor-pointer"
              >
                Đóng báo cáo chi tiết
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

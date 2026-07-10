import React, { useState } from 'react';
import { Upload, Lock, CheckCircle, AlertCircle, Calendar, ArrowLeft, Database, RefreshCw, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

interface AdminSectionProps {
  onBack: () => void;
}

interface ParsedTrader {
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
}

export default function AdminSection({ onBack }: AdminSectionProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // File upload states
  const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 10));
  const [parsedData, setParsedData] = useState<ParsedTrader[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple passcode check for admin auth
    if (passcode === 'bootcamp2026' || passcode === 'finpeace2026' || passcode === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Mật khẩu quản trị không chính xác!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setSaveSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryString = event.target?.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to 2D array of rows
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rows.length === 0) {
          setUploadError('File excel trống hoặc không có dữ liệu.');
          return;
        }

        // Search for header row
        let headerRowIdx = -1;
        let idColIdx = -1;
        let nameColIdx = -1;
        let navColIdx = -1;
        let initialColIdx = -1;
        let peakColIdx = -1;
        let winColIdx = -1;
        let dailyDdColIdx = -1;

        const idKeywords = ['mãtk', 'tài khoản', 'account', 'mãkh', 'mã số', 'id', 'sốtài khoản', 'sốtkhg', 'user', 'uid'];
        const nameKeywords = ['họ tên', 'họ và tên', 'tên', 'name', 'học viên', 'khách hàng', 'tên kh', 'fullname'];
        const navKeywords = ['nav', 'tài sản ròng', 'equity', 'tài sản', 'giá trịts', 'tài sản ròng thực tế', 'tsr', 'current nav', 'tiền cuối ngày'];
        const initialKeywords = ['vốn', 'vốn ban đầu', 'số dư đầu ngày', 'initial', 'vốnđầutư', 'vốnđầungày', 'tiềnđầungày', 'số dư đn', 'balance'];
        const peakKeywords = ['đỉnh nav', 'đỉnh tài sản', 'peak nav', 'peak', 'đỉnh'];
        const winKeywords = ['tỷ lệ thắng', 'win rate', 'winrate', 'tỷ lệlệnhthắng', 'win_rate'];
        const dailyDdKeywords = ['sụt giảm ngày', 'daily drawdown', 'dailydd', 'lỗ trong ngày', 'sụt giảm trong ngày', 'drawdown ngày'];

        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !Array.isArray(row)) continue;

          let hasId = false;
          let hasName = false;

          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').toLowerCase().replace(/\s+/g, '');
            if (!cellVal) continue;

            if (idKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
              idColIdx = c;
              hasId = true;
            }
            if (nameKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
              nameColIdx = c;
              hasName = true;
            }
          }

          if (hasId && hasName) {
            headerRowIdx = r;
            
            // Scan other headers in the same row
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c] || '').toLowerCase().replace(/\s+/g, '');
              if (!cellVal) continue;

              if (c !== idColIdx && c !== nameColIdx) {
                if (navKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
                  navColIdx = c;
                } else if (initialKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
                  initialColIdx = c;
                } else if (peakKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
                  peakColIdx = c;
                } else if (winKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
                  winColIdx = c;
                } else if (dailyDdKeywords.some(kw => cellVal.includes(kw.toLowerCase().replace(/\s+/g, '')))) {
                  dailyDdColIdx = c;
                }
              }
            }
            break; // Header found
          }
        }

        if (headerRowIdx === -1) {
          setUploadError('Không tìm thấy dòng tiêu đề cột phù hợp. File cần chứa tối thiểu cột Mã Tài Khoản (hoặc Số Tài Khoản) và Họ Tên.');
          return;
        }

        const parsedRows: ParsedTrader[] = [];

        // Parse rows below the header row
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          const rawId = row[idColIdx];
          const accountId = rawId !== undefined ? String(rawId).trim() : '';

          const rawName = row[nameColIdx];
          const name = rawName !== undefined ? String(rawName).trim() : '';

          if (!accountId || !name) continue;

          const getValue = (colIdx: number, defaultVal: number) => {
            if (colIdx === -1 || row[colIdx] === undefined) return defaultVal;
            const cleanStr = String(row[colIdx]).replace(/,/g, '').replace(/%/g, '').trim();
            const val = parseFloat(cleanStr);
            return isNaN(val) ? defaultVal : val;
          };

          const currentNAV = getValue(navColIdx, 10000000);
          const initialBalance = getValue(initialColIdx, 10000000);
          const peakNAV = getValue(peakColIdx, currentNAV);
          const winRate = getValue(winColIdx, 50.0);
          const dailyDrawdown = getValue(dailyDdColIdx, 0);

          // Calculations
          const navGrowth = ((currentNAV - initialBalance) / initialBalance) * 100;
          const maxDrawdown = peakNAV > 0 ? ((peakNAV - currentNAV) / peakNAV) * 100 : 0;
          
          // Rules check
          const isCompliant = dailyDrawdown <= 4.0 && maxDrawdown <= 8.0;
          const stage = currentNAV >= 10500000 ? 'Vòng 2' : 'Vòng 1';

          parsedRows.push({
            accountId,
            name,
            initialBalance,
            currentNAV,
            peakNAV,
            navGrowth: parseFloat(navGrowth.toFixed(2)),
            maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
            dailyDrawdown: parseFloat(dailyDrawdown.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
            isCompliant,
            stage,
          });
        }

        if (parsedRows.length === 0) {
          setUploadError('Không thể trích xuất thông tin hợp lệ từ các dòng dữ liệu. Vui lòng kiểm tra lại định dạng file.');
        } else {
          setParsedData(parsedRows);
        }
      } catch (err) {
        console.error(err);
        setUploadError('Đã xảy ra lỗi khi đọc file Excel. Vui lòng đảm bảo file không bị lỗi.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveToDatabase = async () => {
    if (parsedData.length === 0) return;
    setIsSaving(true);
    setUploadError('');

    try {
      const batch = writeBatch(db);

      // Save each trader in leaderboard collection
      parsedData.forEach((trader, index) => {
        // Doc ID = accountId
        const leadRef = doc(db, 'leaderboard', trader.accountId);
        batch.set(leadRef, {
          ...trader,
          reportDate,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });

        // Save daily snapshot
        const snapshotId = `${trader.accountId}_${reportDate.replace(/-/g, '')}`;
        const snapRef = doc(db, 'leaderboard_snapshots', snapshotId);
        batch.set(snapRef, {
          accountId: trader.accountId,
          name: trader.name,
          date: reportDate,
          navValue: trader.currentNAV,
          navGrowth: trader.navGrowth,
          timestamp: new Date().toISOString()
        });
      });

      // Save global metadata config for leaderboard update date
      const metaRef = doc(db, 'leaderboard_metadata', 'global');
      batch.set(metaRef, {
        lastReportDate: reportDate,
        totalTraders: parsedData.length,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      setSaveSuccess(true);
      setParsedData([]);
    } catch (err) {
      console.error(err);
      setUploadError('Đã xảy ra lỗi khi đồng bộ dữ liệu lên Firestore. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-brand-surface-bright/50 pb-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 bg-brand-surface border border-brand-surface-bright text-brand-gray-light hover:text-white rounded transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-black text-2xl text-white uppercase">TRANG QUẢN TRỊ ADMIN</h1>
            <p className="text-brand-gray text-xs font-sans mt-0.5">
              Cập nhật bảng xếp hạng Leaderboard từ báo cáo Excel/CSV của Công ty Chứng khoán.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Login Auth */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-brand-container border border-brand-surface-bright p-8 rounded-lg shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-mint/10 border border-brand-mint/30 rounded-full flex items-center justify-center mx-auto text-brand-mint">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg text-white uppercase">Xác thực Quyền Quản trị</h2>
            <p className="text-brand-gray text-xs">Vui lòng nhập mật khẩu quản trị để tiếp tục.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Nhập mật khẩu (ví dụ: bootcamp2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-brand-surface border border-brand-surface-bright focus:border-brand-mint text-white placeholder-brand-gray-dark px-4 py-3 text-sm rounded outline-none transition"
                autoFocus
              />
              {loginError && (
                <p className="text-brand-red text-[11px] font-sans flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-mint hover:bg-white text-brand-bg font-display text-xs font-black tracking-wider uppercase rounded transition cursor-pointer"
            >
              ĐĂNG NHẬP
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="space-y-8">
          {/* Settings / Upload row */}
          <div className="bg-brand-container border border-brand-surface-bright p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold text-brand-gray-light tracking-wider font-display">
                1. Chọn ngày của báo cáo CTCK:
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-surface-bright focus:border-brand-mint text-white pl-10 pr-4 py-2.5 text-xs rounded outline-none transition font-sans"
                />
              </div>
              <p className="text-[10px] text-brand-gray">
                Ngày này sẽ được hiển thị trên Leaderboard và dùng làm ngày lưu lịch sử snapshot NAV.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold text-brand-gray-light tracking-wider font-display">
                2. Tải lên file Excel/CSV thô:
              </label>
              <div className="relative border border-dashed border-brand-surface-bright hover:border-brand-mint/50 bg-brand-surface/50 rounded-lg p-5 text-center transition cursor-pointer group">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1 text-brand-gray-light group-hover:text-white transition">
                  <FileSpreadsheet className="w-8 h-8 text-brand-mint/60 mx-auto" />
                  <p className="text-xs font-bold font-display uppercase tracking-wide">Click hoặc thả file Excel/CSV</p>
                  <p className="text-[10px] text-brand-gray">Hỗ trợ các file .xlsx, .xls, .csv</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="bg-brand-red/10 border border-brand-red/30 p-4 rounded text-brand-red text-xs font-sans flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Lỗi xử lý file:</p>
                <p className="mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Save Success Message */}
          {saveSuccess && (
            <div className="bg-brand-mint-bg border border-brand-mint/30 p-5 rounded text-brand-mint text-xs font-sans flex items-start gap-3 shadow-[0_0_15px_rgba(0,225,161,0.05)] animate-fade-in">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-white">ĐỒNG BỘ THÀNH CÔNG!</p>
                <p className="text-brand-gray text-[11px]">
                  Bảng xếp hạng Leaderboard và snapshot lịch sử ngày **{reportDate}** đã được cập nhật thành công lên đám mây Cloud Firestore.
                </p>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Xem trước Dữ liệu phân tích ({parsedData.length} Tài khoản)
                  </h3>
                  <p className="text-brand-gray text-[10px] font-sans">
                    Vui lòng kiểm tra kỹ các thông số trước khi cập nhật lên cơ sở dữ liệu.
                  </p>
                </div>

                <button
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-brand-mint text-brand-bg hover:bg-white disabled:bg-brand-gray-dark font-display text-xs font-black tracking-wider uppercase rounded transition shadow-lg cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ĐANG ĐỒNG BỘ...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>ĐẨY LÊN DATABASE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Responsive Table */}
              <div className="bg-brand-container border border-brand-surface-bright rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs font-sans min-w-[800px]">
                  <thead>
                    <tr className="bg-brand-surface border-b border-brand-surface-bright text-brand-gray font-display font-bold uppercase text-[10px] tracking-wider">
                      <th className="px-5 py-4">Học Viên</th>
                      <th className="px-5 py-4 text-center">Tài Khoản</th>
                      <th className="px-5 py-4 text-right">NAV Hiện Tại</th>
                      <th className="px-5 py-4 text-right">Tăng Trưởng</th>
                      <th className="px-5 py-4 text-right">Max Drawdown</th>
                      <th className="px-5 py-4 text-right">Daily DD</th>
                      <th className="px-5 py-4 text-right">Win Rate</th>
                      <th className="px-5 py-4 text-center">Vòng</th>
                      <th className="px-5 py-4 text-center">Kỷ Luật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-bright/40">
                    {parsedData.map((trader, idx) => (
                      <tr key={idx} className="hover:bg-brand-surface/30 transition">
                        <td className="px-5 py-3.5 font-bold text-white">{trader.name}</td>
                        <td className="px-5 py-3.5 text-center text-brand-gray-light font-mono">{trader.accountId}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-white">
                          {new Intl.NumberFormat('vi-VN').format(trader.currentNAV)} đ
                        </td>
                        <td className={`px-5 py-3.5 text-right font-mono font-bold ${trader.navGrowth >= 0 ? 'text-brand-mint' : 'text-brand-red'}`}>
                          {trader.navGrowth >= 0 ? '+' : ''}{trader.navGrowth.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-brand-gray-light">
                          {trader.maxDrawdown.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-brand-gray-light">
                          {trader.dailyDrawdown.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-brand-gray-light">
                          {trader.winRate.toFixed(2)}%
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-display ${trader.stage === 'Vòng 2' ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint' : 'bg-brand-gray-dark/20 border border-brand-gray-dark/40 text-brand-gray'}`}>
                            {trader.stage}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-display ${trader.isCompliant ? 'bg-brand-mint-bg border border-brand-mint/30 text-brand-mint' : 'bg-brand-red/10 border border-brand-red/30 text-brand-red'}`}>
                            {trader.isCompliant ? 'Đạt' : 'Vi Phạm'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

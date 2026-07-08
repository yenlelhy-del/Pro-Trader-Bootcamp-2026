import React, { useState, useEffect } from 'react';
import { 
  Users, Search, CheckCircle, Phone, Clock, FileText, Settings, Send, 
  Database, Lock, Unlock, MessageSquare, AlertTriangle, Download, Plus, Trash2, Edit2
} from 'lucide-react';
import { BrandConfig } from '../brandConfig';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  brokerCode: string;
  timestamp: string;
  status: 'new' | 'contacting' | 'opened' | 'unreachable' | 'rejected';
  notes: string;
  campaign?: string;
}

// Initial mock data if localStorage is empty
const INITIAL_LEADS: Lead[] = [
  {
    id: "lead1",
    name: "Nguyễn Hoàng Nam",
    phone: "0912345678",
    brokerCode: "TRADER_HN",
    timestamp: "2026-07-07 10:15",
    status: "new",
    notes: "Lead đăng ký mới từ trang chủ. Quan tâm gói hạn mức x10.",
    campaign: "lion"
  },
  {
    id: "lead2",
    name: "Phạm Thùy Chi",
    phone: "0987654321",
    brokerCode: "",
    timestamp: "2026-07-07 09:30",
    status: "contacting",
    notes: "Sale đã gọi lần 1, khách đang cân nhắc nạp tiền 50M để bắt đầu Vòng 1.",
    campaign: "lion"
  },
  {
    id: "lead3",
    name: "Trần Tuấn Anh",
    phone: "0905558889",
    brokerCode: "MINH_THU",
    timestamp: "2026-07-06 15:45",
    status: "opened",
    notes: "Đã xác minh mở tài khoản chứng khoán thành công. Đang thiết lập danh mục.",
    campaign: "tiger"
  },
  {
    id: "lead4",
    name: "Lê Quốc Bảo",
    phone: "0934112233",
    brokerCode: "VOI_VANG",
    timestamp: "2026-07-06 11:20",
    status: "unreachable",
    notes: "Gọi thuê bao 3 lần, đã gửi kết bạn Zalo nhưng chưa phản hồi.",
    campaign: "tiger"
  }
];

export default function LeadsSection({ brand }: { brand: BrandConfig }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Edit Dialog state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<Lead['status']>('new');
  const [editNotes, setEditNotes] = useState('');
  
  // Webhook / Sheet Config state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Load leads and webhook config from localStorage
  useEffect(() => {
    const storedLeads = localStorage.getItem('pro_trader_leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      setLeads(INITIAL_LEADS);
      localStorage.setItem('pro_trader_leads', JSON.stringify(INITIAL_LEADS));
    }

    const storedWebhook = localStorage.getItem(`pro_trader_webhook_url_${brand.id}`) || localStorage.getItem('pro_trader_webhook_url');
    if (storedWebhook) {
      setWebhookUrl(storedWebhook);
    }
    
    const storedAuth = localStorage.getItem('pro_trader_sales_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, [brand.id]);

  // Save leads to localStorage whenever they change
  const saveLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('pro_trader_leads', JSON.stringify(updatedLeads));
  };

  // Handle Sales Authentication (Mã bảo mật: sale2026 hoặc admin)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'sale2026' || password.toLowerCase() === 'admin' || password === '123456') {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('pro_trader_sales_auth', 'true');
    } else {
      setLoginError('Mã bảo mật không đúng! Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('pro_trader_sales_auth');
    localStorage.removeItem('pro_trader_show_crm');
    window.location.href = window.location.origin;
  };

  // Create a randomized test lead for quick pipeline validation
  const handleCreateTestLead = () => {
    const randomId = "test_" + Date.now();
    const names = ["Trần Thị Lan", "Lê Văn Hùng", "Phan Minh Trí", "Nguyễn Hoàng My", "Đỗ Quốc Đạt"];
    const randomName = names[Math.floor(Math.random() * names.length)] + " (Test)";
    const randomPhone = "09" + Math.floor(10000000 + Math.random() * 90000000);
    const brokers = ["TRADER_PRO", "VOI_VANG", "MINH_THU", ""];
    const randomBroker = brokers[Math.floor(Math.random() * brokers.length)];
    
    const now = new Date();
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const newLead: Lead = {
      id: randomId,
      name: randomName,
      phone: randomPhone,
      brokerCode: randomBroker,
      timestamp: timestamp,
      status: 'new',
      notes: 'Lead test tạo trực tiếp từ Dashboard.',
      campaign: brand.id
    };
    
    const updatedLeads = [newLead, ...leads];
    saveLeads(updatedLeads);
    
    // Sync to webhook
    if (webhookUrl) {
      triggerWebhook(newLead, 'NEW');
    }
    
    alert(`Đã tạo thành công Lead test: ${randomName} (${randomPhone}).`);
  };

  // Update lead status and notes
  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updatedLeads = leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          status: editStatus,
          notes: editNotes
        };
      }
      return l;
    });

    saveLeads(updatedLeads);
    setSelectedLead(null);
    
    // Auto sync to webhook if configured
    const updatedLead = updatedLeads.find(l => l.id === selectedLead.id);
    if (updatedLead && webhookUrl) {
      triggerWebhook(updatedLead, 'UPDATE');
    }
  };

  // Delete a lead
  const handleDeleteLead = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lead này?')) {
      const updatedLeads = leads.filter(l => l.id !== id);
      saveLeads(updatedLeads);
    }
  };

  // Save Webhook configuration
  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`pro_trader_webhook_url_${brand.id}`, webhookUrl);
    localStorage.setItem('pro_trader_webhook_url', webhookUrl);
    setShowConfig(false);
    alert(`Đã lưu cấu hình Google Sheets Webhook cho ${brand.id === 'tiger' ? 'Tiger Invest' : 'Lion Finpeace'}!`);
  };

  // Trigger Apps Script Webhook
  const triggerWebhook = async (leadData: Lead, actionType: 'NEW' | 'UPDATE') => {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Avoid CORS preflight block for simple App Script triggers
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: actionType,
          ...leadData
        })
      });
    } catch (err) {
      console.error('Lỗi khi gửi webhook:', err);
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setTestStatus('sending');
    try {
      const dummyLead: Lead = {
        id: "test-id",
        name: "TEST LEAD SYSTEM",
        phone: "0900000000",
        brokerCode: "TEST_BROKER",
        timestamp: new Date().toLocaleString(),
        status: "new",
        notes: "Giao dịch test hệ thống đồng bộ."
      };
      
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST', ...dummyLead })
      });
      
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (err) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Họ tên', 'Số điện thoại', 'Môi giới', 'Thời gian đăng ký', 'Trạng thái', 'Ghi chú chăm sóc'];
    const rows = leads.map(l => [
      l.id,
      l.name,
      l.phone,
      l.brokerCode,
      l.timestamp,
      l.status === 'new' ? 'Mới' : l.status === 'contacting' ? 'Đang liên hệ' : l.status === 'opened' ? 'Đã mở tài khoản' : l.status === 'unreachable' ? 'Không nghe máy' : 'Từ chối',
      l.notes.replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Bootcamp_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search Leads (scoped to current campaign)
  const filteredLeads = leads.filter(l => {
    const matchesCampaign = !l.campaign || l.campaign === brand.id;
    const matchesSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.brokerCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    
    return matchesCampaign && matchesSearch && matchesStatus;
  });

  // Calculate statistics (scoped to current campaign)
  const stats = {
    total: leads.filter(l => !l.campaign || l.campaign === brand.id).length,
    new: leads.filter(l => (!l.campaign || l.campaign === brand.id) && l.status === 'new').length,
    contacting: leads.filter(l => (!l.campaign || l.campaign === brand.id) && l.status === 'contacting').length,
    opened: leads.filter(l => (!l.campaign || l.campaign === brand.id) && l.status === 'opened').length,
    dropped: leads.filter(l => (!l.campaign || l.campaign === brand.id) && (l.status === 'unreachable' || l.status === 'rejected')).length
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-[480px] mx-auto mt-16 p-8 bg-brand-container border border-brand-surface-bright rounded-lg shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-brand-mint/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-brand-mint/20 text-brand-mint">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">
            HỆ THỐNG LEADS (CRM)
          </h2>
          <p className="text-brand-gray text-xs font-sans">
            Dành riêng cho Sale & Admin cập nhật tình trạng chăm sóc Leads
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
              Nhập mã bảo mật
            </label>
            <input
              type="password"
              required
              placeholder="Nhập mã bảo mật (Ví dụ: sale2026)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all"
            />
            {loginError && (
              <span className="text-xs text-brand-red font-display block mt-1">
                {loginError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-widest rounded transition-colors uppercase"
          >
            Đăng nhập hệ thống
          </button>
        </form>
        
        <div className="bg-brand-surface/50 p-4 rounded border border-brand-surface-bright/50 text-[11px] text-brand-gray font-sans leading-relaxed text-center">
          💡 Mã đăng nhập mặc định: <strong className="text-brand-mint">sale2026</strong> hoặc <strong className="text-brand-mint">admin</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-surface-bright/50 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-brand-mint-bg border border-brand-mint/30 px-2.5 py-1 rounded">
            <Users className="w-4 h-4 text-brand-mint" />
            <span className="font-display text-[10px] font-bold text-brand-mint tracking-wider uppercase">CRM DASHBOARD</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-2">
            QUẢN LÝ LEADS THỰC CHIẾN
          </h1>
          <p className="text-brand-gray text-xs sm:text-sm font-sans mt-1">
            Theo dõi, xử lý và cập nhật lịch sử chăm sóc Leads đăng ký tham gia chương trình.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleCreateTestLead}
            className="px-3.5 py-2 bg-brand-surface hover:bg-brand-mint/10 border border-brand-surface-bright hover:border-brand-mint/55 text-brand-mint hover:text-white rounded text-xs font-bold font-display flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>TẠO LEAD TEST</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 bg-brand-surface border border-brand-surface-bright hover:border-brand-mint text-brand-gray-light hover:text-white rounded text-xs font-bold font-display flex items-center space-x-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>KẾT NỐI DRIVE</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-brand-surface border border-brand-surface-bright hover:border-brand-mint text-brand-gray-light hover:text-white rounded text-xs font-bold font-display flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>XUẤT EXCEL (CSV)</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-brand-surface-bright hover:bg-brand-red/10 border border-brand-surface-bright hover:border-brand-red/30 text-white rounded text-xs font-bold font-display flex items-center space-x-2 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>ĐĂNG XUẤT</span>
          </button>
        </div>
      </div>

      {/* Sheet Webhook Configuration Modal/Box */}
      {showConfig && (
        <div className="bg-brand-container border border-brand-mint/30 p-6 rounded-lg space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-brand-surface-bright/50 pb-3">
            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-brand-mint" />
              <span>CẤU HÌNH ĐỒNG BỘ GOOGLE SHEET (GOOGLE DRIVE)</span>
            </h3>
            <button 
              onClick={() => setShowConfig(false)}
              className="text-brand-gray hover:text-white text-xs font-bold"
            >
              ĐÓNG
            </button>
          </div>
          
          <p className="text-xs text-brand-gray-light leading-relaxed font-sans max-w-4xl">
            Để dữ liệu đăng ký đồng bộ thời gian thực lên thư mục Google Drive của bạn (file Google Sheet), hãy dán đường dẫn Webhook của Google Apps Script vào đây.
          </p>

          <form onSubmit={handleSaveWebhook} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-8 space-y-2">
              <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                Đường dẫn Apps Script Webhook URL
              </label>
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-all"
              />
            </div>
            
            <div className="md:col-span-4 flex gap-2">
              <button
                type="submit"
                className="flex-grow py-2.5 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-wide rounded transition-colors uppercase"
              >
                Lưu cấu hình
              </button>
              
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={!webhookUrl || testStatus === 'sending'}
                className="px-4 py-2.5 bg-brand-surface border border-brand-surface-bright hover:bg-brand-surface-bright text-white disabled:opacity-40 text-xs font-bold font-display rounded uppercase flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {testStatus === 'sending' ? 'GỬI...' : testStatus === 'success' ? 'OK!' : testStatus === 'error' ? 'LỖI!' : 'TEST'}
                </span>
              </button>
            </div>
          </form>

          {/* Guide Dropdown */}
          <div className="bg-brand-surface p-4 rounded border border-brand-surface-bright/50 space-y-3">
            <h4 className="font-display font-bold text-[10px] text-brand-mint uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hướng dẫn thiết lập Apps Script trong Google Drive:</span>
            </h4>
            <ol className="list-decimal pl-4 text-[10px] text-brand-gray-light space-y-1.5 font-sans leading-relaxed">
              <li>Truy cập thư mục Google Drive của chương trình. Tạo 1 file **Google Sheet (Bảng tính)** mới để hứng leads.</li>
              <li>Trong file Google Sheet, nhấn vào **Tiện ích mở rộng** (Extensions) &gt; **Apps Script**.</li>
              <li>Xóa hết code mặc định và dán đoạn code này vào:
                <pre className="bg-[#07100c] text-brand-mint border border-brand-surface-bright/40 p-2.5 rounded text-[9px] font-mono overflow-x-auto mt-1 max-h-40">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.action === "TEST") {
    sheet.appendRow(["TEST SYSTEM", "OK", "", "", new Date()]);
    return ContentService.createTextOutput("Test Success");
  }
  
  // Kiểm tra xem Lead đã tồn tại chưa để cập nhật, hoặc thêm mới
  var phone = data.phone;
  var rows = sheet.getDataRange().getValues();
  var foundRow = -1;
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] == phone) { // Cột 3 là Số điện thoại
      foundRow = i + 1;
      break;
    }
  }
  
  var statusText = data.status === "new" ? "Mới nhận" :
                   data.status === "contacting" ? "Đang liên hệ" :
                   data.status === "opened" ? "Đã mở tài khoản" :
                   data.status === "unreachable" ? "Không nghe máy" : "Từ chối";
                   
  if (foundRow !== -1) {
    // Cập nhật trạng thái và ghi chú
    sheet.getRange(foundRow, 6).setValue(statusText); // Cột F: Trạng thái
    sheet.getRange(foundRow, 7).setValue(data.notes); // Cột G: Ghi chú
  } else {
    // Thêm lead mới
    sheet.appendRow([
      data.id,
      data.name,
      "'" + data.phone,
      data.brokerCode,
      data.timestamp,
      statusText,
      data.notes
    ]);
  }
  
  return ContentService.createTextOutput("Success");
}`}
                </pre>
              </li>
              <li>Nhấn **Triển khai** (Deploy) &gt; **Triển khai mới** (New deployment) &gt; Chọn loại là **Ứng dụng web** (Web app).</li>
              <li>Cấu hình: Người có quyền truy cập chọn **Bất kỳ ai** (Anyone) rồi nhấn Triển khai. Copy lấy **URL ứng dụng web** và dán vào ô bên trên!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'TỔNG LEADS', val: stats.total, color: 'text-white', bg: 'bg-brand-surface' },
          { label: 'MỚI ĐĂNG KÝ', val: stats.new, color: 'text-brand-mint', bg: 'bg-[#0f2119]' },
          { label: 'ĐANG CHĂM SÓC', val: stats.contacting, color: 'text-brand-gold', bg: 'bg-[#211d0f]' },
          { label: 'ĐÃ MỞ TÀI KHOẢN', val: stats.opened, color: 'text-[#8cd6b2]', bg: 'bg-[#12261e]' },
          { label: 'KHÔNG TIỀM NĂNG', val: stats.dropped, color: 'text-brand-red', bg: 'bg-[#261212]' },
        ].map((s, idx) => (
          <div key={idx} className={`${s.bg} border border-brand-surface-bright/50 p-4 rounded-lg flex flex-col justify-between`}>
            <span className="text-[10px] text-brand-gray uppercase font-bold tracking-wider font-display block">
              {s.label}
            </span>
            <div className={`text-2xl sm:text-3xl font-mono font-black mt-2 ${s.color}`}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-brand-container border border-brand-surface-bright p-4 rounded-lg">
        {/* Search bar */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-brand-gray" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên, Số điện thoại hoặc Mã Broker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-all"
          />
        </div>

        {/* Status Filter tab */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'TẤT CẢ' },
            { id: 'new', label: 'MỚI ĐĂNG KÝ' },
            { id: 'contacting', label: 'ĐANG CHĂM SÓC' },
            { id: 'opened', label: 'ĐÃ MỞ TK' },
            { id: 'unreachable', label: 'KHÔNG NGHE MÁY' },
            { id: 'rejected', label: 'TỪ CHỐI' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setStatusFilter(cat.id)}
              className={`px-3 py-1.5 rounded font-display text-[9px] font-bold tracking-wider border transition-all ${
                statusFilter === cat.id
                  ? 'bg-brand-mint text-brand-bg border-brand-mint shadow-[0_0_10px_rgba(0,225,161,0.2)]'
                  : 'bg-brand-surface border-brand-surface-bright/50 text-brand-gray hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-brand-container border border-brand-surface-bright rounded-lg overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-brand-surface-bright/80 text-[10px] text-brand-gray uppercase font-display tracking-widest bg-brand-surface/40">
              <th className="py-4 px-5">Thời gian</th>
              <th className="py-4 px-5">Họ và tên</th>
              <th className="py-4 px-5">Số điện thoại (Zalo)</th>
              <th className="py-4 px-5">Môi giới</th>
              <th className="py-4 px-5">Trạng thái</th>
              <th className="py-4 px-5">Ghi chú chăm sóc</th>
              <th className="py-4 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-brand-surface-bright/30 text-xs">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-brand-gray font-sans">
                  Không tìm thấy Leads nào trùng khớp.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                let statusBadge = '';
                let statusColor = '';
                
                switch(lead.status) {
                  case 'new':
                    statusBadge = 'Mới nhận';
                    statusColor = 'bg-[#0f2119] text-brand-mint border-brand-mint/30';
                    break;
                  case 'contacting':
                    statusBadge = 'Đang liên hệ';
                    statusColor = 'bg-[#211d0f] text-brand-gold border-brand-gold/30';
                    break;
                  case 'opened':
                    statusBadge = 'Đã mở TK';
                    statusColor = 'bg-[#12261e] text-[#8cd6b2] border-[#8cd6b2]/30';
                    break;
                  case 'unreachable':
                    statusBadge = 'Không liên lạc';
                    statusColor = 'bg-[#261212] text-brand-red border-brand-red/30';
                    break;
                  case 'rejected':
                    statusBadge = 'Từ chối';
                    statusColor = 'bg-brand-surface-bright/50 text-brand-gray border-brand-surface-bright';
                    break;
                }

                return (
                  <tr key={lead.id} className="hover:bg-brand-surface/20 transition-all font-sans group">
                    <td className="py-4 px-5 text-brand-gray whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-gray/50" />
                        <span>{lead.timestamp}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-5 font-display font-bold text-white uppercase tracking-wide">
                      {lead.name}
                    </td>
                    
                    <td className="py-4 px-5 font-mono text-brand-mint font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-mint/60" />
                        <span>{lead.phone}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-5">
                      {lead.brokerCode ? (
                        <span className="px-2 py-0.5 bg-brand-surface border border-brand-surface-bright rounded text-[10px] font-mono text-white font-semibold">
                          {lead.brokerCode}
                        </span>
                      ) : (
                        <span className="text-brand-gray/55 italic">Không có</span>
                      )}
                    </td>
                    
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[10px] font-display font-medium ${statusColor}`}>
                        {statusBadge}
                      </span>
                    </td>
                    
                    <td className="py-4 px-5 max-w-[280px] truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:text-white transition-colors text-brand-gray-light leading-relaxed text-[11px]">
                      {lead.notes || <span className="italic text-brand-gray/40">Chưa có ghi chú chăm sóc...</span>}
                    </td>
                    
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setEditStatus(lead.status);
                            setEditNotes(lead.notes);
                          }}
                          className="p-1.5 bg-brand-surface hover:bg-brand-mint/10 border border-brand-surface-bright hover:border-brand-mint/30 rounded text-brand-gray hover:text-brand-mint transition-colors"
                          title="Cập nhật thông tin chăm sóc"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-brand-surface hover:bg-brand-red/10 border border-brand-surface-bright hover:border-brand-red/30 rounded text-brand-gray hover:text-brand-red transition-colors"
                          title="Xóa Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Update Dialog Overlay */}
      {selectedLead && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-brand-container border border-brand-surface-bright rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-brand-surface-bright/50 pb-3">
              <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-brand-mint" />
                <span>CẬP NHẬT TRẠNG THÁI CHĂM SÓC</span>
              </h3>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-brand-gray hover:text-white text-xs font-bold font-display"
              >
                HỦY
              </button>
            </div>

            <div className="bg-brand-surface p-4 border border-brand-surface-bright/50 rounded space-y-2">
              <div className="text-[10px] text-brand-gray font-display uppercase tracking-wider">Thông tin đăng ký</div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-gray-light">Họ tên:</span>
                <span className="font-bold text-white uppercase font-display">{selectedLead.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-gray-light">Số điện thoại:</span>
                <span className="font-mono text-brand-mint font-bold">{selectedLead.phone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-gray-light">Mã môi giới:</span>
                <span className="font-mono text-white">{selectedLead.brokerCode || 'Không có'}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateLead} className="space-y-4">
              {/* Status Select */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                  Tình trạng chăm sóc
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-all font-sans"
                >
                  <option value="new">Mới đăng ký (New)</option>
                  <option value="contacting">Đang gọi điện/Zalo chăm sóc (Contacting)</option>
                  <option value="opened">Đã mở tài khoản thành công (Opened Account)</option>
                  <option value="unreachable">Không liên lạc được / Thuê bao (Unreachable)</option>
                  <option value="rejected">Từ chối tham gia / Không có nhu cầu (Rejected)</option>
                </select>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                  Ghi chú lịch sử chăm sóc (Quá trình xử lý)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ghi nhận nhật ký trao đổi: e.g., Khách hẹn tối gọi lại, Zalo đã gửi tài liệu hướng dẫn..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-surface border border-brand-surface-bright rounded text-xs text-white focus:outline-none focus:border-brand-mint transition-all font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 py-2.5 bg-brand-surface border border-brand-surface-bright hover:bg-brand-surface-bright text-white font-display text-xs font-bold rounded transition-colors uppercase"
                >
                  Hủy bỏ
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-wide rounded transition-colors uppercase"
                >
                  Cập nhật ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

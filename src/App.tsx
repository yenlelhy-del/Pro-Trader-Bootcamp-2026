import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import DashboardSection from './components/DashboardSection';
import LeaderboardSection from './components/LeaderboardSection';
import RulesSection from './components/RulesSection';
import LeadsSection from './components/LeadsSection';
import { User, CheckCircle } from 'lucide-react';
import { getActiveBrand } from './brandConfig';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [registeredUser, setRegisteredUser] = useState<{ name: string; phone: string; brokerCode: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const brand = getActiveBrand();

  // Set page title and body theme class dynamically
  useEffect(() => {
    document.title = `${brand.name} ${brand.subName}`;
    document.body.className = brand.themeClass;
  }, [brand]);

  // Check URL parameters for secret admin mode access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('sale') === 'true') {
      localStorage.setItem('pro_trader_show_crm', 'true');
      // Clean up URL query parameters instantly to keep the URL neat
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [brand]);

  const handleRegisterSuccess = (name: string, phone: string, brokerCode: string) => {
    setRegisteredUser({ name, phone, brokerCode });
    setShowToast(true);

    // Save lead data locally
    try {
      const storedLeads = localStorage.getItem('pro_trader_leads');
      const leads = storedLeads ? JSON.parse(storedLeads) : [];
      
      // Determine Broker Name based on Broker Code
      let brokerName = 'Khác';
      if (brokerCode === '0011000306') brokerName = 'Trịnh Thị Anh Thư';
      else if (brokerCode === '0011000776') brokerName = 'Lê Vũ Tú Trinh';
      else if (brokerCode === '0011000297') brokerName = 'Nguyễn Minh Quang';

      const newLead = {
        id: "lead_" + Date.now(),
        name,
        phone,
        brokerCode,
        brokerName,
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'new' as const,
        notes: 'Lead đăng ký mới từ trang chủ.',
        campaign: brand.id
      };

      const updatedLeads = [newLead, ...leads];
      localStorage.setItem('pro_trader_leads', JSON.stringify(updatedLeads));

      // Get brand-specific or global webhook URL, fallback to hardcoded default
      const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwFTuZBCLk6FyM8jQtWd3PVL8XFzD5yvUDyd4oKf1LZm45hzhZlWwg1tzmk1FRXl5W5Pw/exec';
      const webhookUrl = localStorage.getItem(`pro_trader_webhook_url_${brand.id}`) || 
                         localStorage.getItem('pro_trader_webhook_url') || 
                         DEFAULT_WEBHOOK_URL;

      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'NEW',
            ...newLead,
            brokerId: brokerCode || 'Khác'
          }),
        })
          .then(() => console.log('Lead sent to Google Sheets successfully'))
          .catch(err => console.error('Error sending lead to Google Sheets:', err));
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleJoinChallengeCTA = () => {
    setActiveTab('home');
    // Allow the DOM to update, then scroll to the registration block
    setTimeout(() => {
      const section = document.getElementById('registration-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeSection
            onRegisterSuccess={handleRegisterSuccess}
            setActiveTab={setActiveTab}
            brand={brand}
          />
        );
      case 'dashboard':
        return <DashboardSection brand={brand} />;
      case 'leaderboard':
        return <LeaderboardSection brand={brand} />;
      case 'rules':
        return <RulesSection brand={brand} />;
      case 'leads':
        return <LeadsSection brand={brand} />;
      default:
        return (
          <HomeSection
            onRegisterSuccess={handleRegisterSuccess}
            setActiveTab={setActiveTab}
            brand={brand}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-brand-bg text-[#dbe5de] flex flex-col font-sans select-none overflow-x-hidden selection:bg-brand-mint selection:text-brand-bg ${brand.themeClass}`}>

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onJoinChallenge={handleJoinChallengeCTA}
        brand={brand}
      />

      {/* Floating welcome banner for registered traders */}
      {registeredUser && (
        <div className="bg-brand-mint py-2.5 px-4 text-center text-xs font-display flex items-center justify-center space-x-2 text-brand-bg font-bold animate-fade-in relative z-40 shadow-[0_4px_20px_rgba(0,225,161,0.2)]">
          <User className="w-4 h-4 text-brand-bg" />
          <span>
            Chào mừng thành viên <strong className="text-brand-bg uppercase font-black">{registeredUser.name}</strong> đã tham gia thử thách kỷ luật Pro Trader 2026!
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 bg-brand-bg text-brand-mint text-[9px] font-black rounded ml-2 uppercase tracking-wider">
            Đồng hành thực chiến
          </span>
        </div>
      )}

      {/* Main Tab View Content */}
      <main className="flex-grow py-8 md:py-12">
        {renderActiveSection()}
      </main>

      {/* Persistent Footer */}
      <Footer brand={brand} />

      {/* Toast notification overlay */}
      {showToast && registeredUser && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-container border border-brand-mint p-4 rounded-lg shadow-[0_0_25px_rgba(0,225,161,0.25)] flex items-start space-x-3 max-w-sm animate-slide-up">
          <div className="p-2 bg-brand-mint-bg text-brand-mint rounded-full">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-xs uppercase text-white tracking-wide">
              ĐÃ GHI NHẬN THỬ THÁCH!
            </h4>
            <p className="text-brand-gray text-[11px] font-sans leading-relaxed">
              Xin chào {registeredUser.name}. Link tải file Excel Quản trị rủi ro & Nhật ký giao dịch đã được hệ thống tự động chuẩn bị để gửi tới Zalo {registeredUser.phone}.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

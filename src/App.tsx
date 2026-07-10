import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import DashboardSection from './components/DashboardSection';
import LeaderboardSection from './components/LeaderboardSection';
import RulesSection from './components/RulesSection';
import AdminSection from './components/AdminSection';
import { User, CheckCircle } from 'lucide-react';
import { getActiveBrand } from './brandConfig';
import { auth } from './firebase';
import { 
  onAuthStateChanged, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  sendSignInLinkToEmail, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [registeredUser, setRegisteredUser] = useState<{ name: string; phone: string; brokerCode: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [loginError, setLoginError] = useState('');

  const brand = getActiveBrand();

  // Listen to Auth State and handle Email Magic Link redirects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Vui lòng nhập Email để hoàn tất xác minh đăng nhập:');
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            setToastMessage('Đăng nhập thành công! Hệ thống đã kích hoạt lưu trữ đám mây cho nhật ký giao dịch của bạn.');
            setShowToast(true);
            setActiveTab('dashboard');
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setTimeout(() => {
              setShowToast(false);
            }, 6000);
          })
          .catch((err) => {
            console.error('Email sign in error:', err);
            setToastMessage('Đăng nhập thất bại: Đường dẫn xác nhận đã hết hạn hoặc không hợp lệ.');
            setShowToast(true);
            
            setTimeout(() => {
              setShowToast(false);
            }, 6000);
          });
      }
    }

    return () => unsubscribe();
  }, []);

  // Set page title and body theme class dynamically
  useEffect(() => {
    document.title = `${brand.name} ${brand.subName}`;
    document.body.className = brand.themeClass;
  }, [brand]);

  const handleRegisterSuccess = (name: string, phone: string, brokerCode: string, email: string) => {
    setRegisteredUser({ name, phone, brokerCode });
    setToastMessage(`Đăng ký thành công! Một đường dẫn kích hoạt (Magic Link) đã được gửi tới email ${email}.`);
    setShowToast(true);

    // Save lead data locally and trigger sheet webhook if active
    try {
      // Determine Broker Name based on Broker Code
      let brokerName = 'Khác';
      if (brokerCode === '0011000306') brokerName = 'Trịnh Thị Anh Thư';
      else if (brokerCode === '0011000776') brokerName = 'Lê Vũ Tú Trinh';
      else if (brokerCode === '0011000297') brokerName = 'Nguyễn Minh Quang';
      else if (brokerCode === 'BK07206') brokerName = 'Đặng Minh Đức';

      const payload = {
        name,
        phone,
        email,
        brokerName,
        brokerId: brokerCode || 'Khác',
        timestamp: new Date().toLocaleString('vi-VN'),
        campaign: brand.id
      };

      // Post to hardcoded brand webhook directly (skipping local storage)
      if (brand.webhookUrl && !brand.webhookUrl.includes('YOUR_TIGER_WEBHOOK')) {
        fetch(brand.webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
          .then(() => console.log('Lead sent to Google Sheets successfully'))
          .catch(err => console.error('Error sending lead to Google Sheets:', err));
      }

      // Trigger Firebase Magic Link authentication
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
          window.localStorage.setItem('emailForSignIn', email);
          console.log('Firebase Sign-In link sent to email:', email);
        })
        .catch((error) => {
          console.error('Error sending sign-in link to email:', error);
        });

    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        setToastMessage('Đã đăng xuất tài khoản. Nhật ký giao dịch hiện tại được lưu tạm tại trình duyệt.');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      })
      .catch((err) => console.error('Sign out error:', err));
  };

  const handleTriggerLogin = () => {
    setShowLoginModal(true);
    setLoginStatus('idle');
    setLoginEmail('');
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoginStatus('sending');
    setLoginError('');

    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    sendSignInLinkToEmail(auth, loginEmail, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', loginEmail);
        setLoginStatus('sent');
      })
      .catch((err) => {
        console.error('Error sending sign in link:', err);
        setLoginStatus('error');
        setLoginError('Có lỗi xảy ra khi gửi email. Vui lòng kiểm tra lại địa chỉ email.');
      });
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
        return (
          <DashboardSection 
            brand={brand} 
            currentUser={currentUser} 
            onTriggerLogin={handleTriggerLogin} 
          />
        );
      case 'leaderboard':
        return <LeaderboardSection brand={brand} />;
      case 'rules':
        return <RulesSection brand={brand} />;
      case 'admin':
        return <AdminSection onBack={() => setActiveTab('home')} />;
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
        currentUser={currentUser}
        onLogOut={handleLogOut}
        onTriggerLogin={handleTriggerLogin}
      />

      {/* Floating welcome banner for registered/logged in traders */}
      {currentUser && (
        <div className="bg-brand-mint py-2.5 px-4 text-center text-xs font-display flex items-center justify-center space-x-2 text-brand-bg font-bold animate-fade-in relative z-40 shadow-[0_4px_20px_rgba(0,225,161,0.2)]">
          <User className="w-4 h-4 text-brand-bg" />
          <span>
            Chào mừng thành viên <strong className="text-brand-bg uppercase font-black">{currentUser.email}</strong> đang tham gia thử thách thực chiến Pro Trader 2026!
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 bg-brand-bg text-brand-mint text-[9px] font-black rounded ml-2 uppercase tracking-wider">
            ĐÃ KẾT NỐI CLOUD
          </span>
        </div>
      )}

      {/* Main Tab View Content */}
      <main className="flex-grow py-8 md:py-12">
        {renderActiveSection()}
      </main>

      {/* Persistent Footer */}
      <Footer brand={brand} onAdminClick={() => setActiveTab('admin')} />

      {/* Toast notification overlay */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-container border border-brand-mint p-4 rounded-lg shadow-[0_0_25px_rgba(0,225,161,0.25)] flex items-start space-x-3 max-w-sm animate-slide-up">
          <div className="p-2 bg-brand-mint-bg text-brand-mint rounded-full flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-xs uppercase text-white tracking-wide">
              THÔNG BÁO HỆ THỐNG
            </h4>
            <p className="text-brand-gray text-[11px] font-sans leading-relaxed">
              {toastMessage || (registeredUser ? `Xin chào ${registeredUser.name}. Link tải file Excel Quản trị rủi ro & Nhật ký giao dịch đã được hệ thống tự động chuẩn bị.` : '')}
            </p>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-brand-container border border-brand-mint/30 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(0,225,161,0.15)] relative">
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setLoginStatus('idle');
                setLoginEmail('');
                setLoginError('');
              }}
              className="absolute top-4 right-4 text-brand-gray hover:text-white transition-colors cursor-pointer text-sm font-sans"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <h3 className="font-display font-black text-lg text-white uppercase">ĐĂNG NHẬP</h3>
              <p className="text-brand-gray text-xs font-sans">
                Nhập email của bạn để nhận đường dẫn đăng nhập nhanh (Magic Link)
              </p>
            </div>
            {loginStatus === 'sent' ? (
              <div className="bg-brand-mint-bg/20 border border-brand-mint/20 text-brand-mint text-xs p-4 rounded text-center leading-relaxed font-sans font-light">
                Link đăng nhập đã được gửi tới <strong className="text-white">{loginEmail}</strong>. 
                Vui lòng kiểm tra hộp thư (bao gồm cả Thư rác/Spam) để xác thực!
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                {loginError && (
                  <div className="bg-brand-red-bg/20 border border-brand-red/20 text-brand-red text-xs p-3 rounded font-sans">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-brand-gray-light tracking-widest font-display">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-surface-bright rounded text-sm text-white focus:outline-none focus:border-brand-mint transition-all font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginStatus === 'sending'}
                  className="w-full py-3 bg-brand-mint text-brand-bg hover:bg-white font-display text-xs font-black tracking-widest rounded transition-all uppercase disabled:opacity-50 cursor-pointer"
                >
                  {loginStatus === 'sending' ? 'ĐANG GỬI LINK...' : 'GỬI LINK ĐĂNG NHẬP'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

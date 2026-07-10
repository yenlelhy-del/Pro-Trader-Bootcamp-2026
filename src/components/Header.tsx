import React, { useState } from 'react';
import { Menu, X, Terminal, Shield, Award, BookOpen, Layers } from 'lucide-react';
import { BrandConfig } from '../brandConfig';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onJoinChallenge: () => void;
  brand: BrandConfig;
  currentUser: any;
  onLogOut: () => void;
  onTriggerLogin: () => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onJoinChallenge, 
  brand,
  currentUser,
  onLogOut,
  onTriggerLogin
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'TRANG CHỦ', icon: Layers },
    { id: 'dashboard', label: 'BẢNG ĐIỀU KHIỂN', icon: Terminal },
    { id: 'leaderboard', label: 'BẢNG XẾP HẠNG', icon: Award },
    { id: 'rules', label: 'THỂ LỆ & HỎI ĐÁP', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-surface-bright/50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-brand-mint-bg p-2 rounded border border-brand-mint/30">
              <Shield className="w-6 h-6 text-brand-mint" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase leading-none">
                {brand.name}
              </span>
              <span className="font-display text-[9px] sm:text-[10px] text-brand-mint font-bold uppercase mt-1 leading-none">
                {brand.subName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded font-display text-xs font-bold tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-mint text-brand-bg shadow-[0_0_15px_rgba(0,225,161,0.2)]'
                      : 'text-brand-gray-light hover:text-white hover:bg-brand-surface'
                  }`}
                  id={`nav-tab-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Button / User profile */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-brand-gray font-sans font-bold leading-tight">TÀI KHOẢN</span>
                  <span className="text-xs text-white font-mono leading-none truncate max-w-[150px]" title={currentUser.email || ''}>
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onLogOut}
                  className="px-3.5 py-1.5 bg-brand-surface-bright hover:bg-brand-surface hover:text-brand-red border border-brand-surface-bright rounded font-display text-[10px] font-black tracking-wider text-white transition-all duration-200 uppercase"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onTriggerLogin}
                  className="px-4 py-2.5 hover:bg-brand-surface border border-brand-surface-bright rounded text-white font-display text-xs font-bold tracking-wider transition-all duration-200"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  onClick={onJoinChallenge}
                  className="px-5 py-2.5 bg-brand-mint-bg hover:bg-brand-mint/20 border border-brand-mint text-brand-mint font-display text-xs font-black tracking-wider rounded transition-all duration-300 transform hover:scale-[1.02]"
                  id="header-cta"
                >
                  JOIN CHALLENGE
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-gray-light hover:text-white p-2 rounded focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-surface-bright p-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded font-display text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-mint text-brand-bg'
                    : 'text-brand-gray-light hover:text-white hover:bg-brand-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="border-t border-brand-surface-bright/50 pt-4 mt-2">
            {currentUser ? (
              <div className="space-y-3">
                <div className="px-4">
                  <span className="text-[9px] text-brand-gray font-sans font-bold block uppercase tracking-wider">Đang đăng nhập:</span>
                  <span className="text-xs text-white font-mono break-all">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    onLogOut();
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 bg-brand-surface-bright text-brand-red font-display text-xs font-black tracking-wider rounded transition-all uppercase"
                >
                  ĐĂNG XUẤT
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onTriggerLogin();
                    setIsOpen(false);
                  }}
                  className="py-2.5 bg-brand-surface border border-brand-surface-bright text-white font-display text-xs font-black tracking-wider rounded transition-all text-center"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  onClick={() => {
                    onJoinChallenge();
                    setIsOpen(false);
                  }}
                  className="py-2.5 bg-brand-mint text-brand-bg hover:bg-brand-mint/90 font-display text-xs font-black tracking-wider rounded transition-all text-center"
                >
                  JOIN CHALLENGE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

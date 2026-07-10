/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Menu, X, Rocket } from "lucide-react";

interface NavbarProps {
  isBrokerMode: boolean;
}

export default function Navbar({ isBrokerMode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active link tracker on scroll
      const sections = ["stepper", "calculator", "leaderboard", "faq", "register"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    { label: "Lộ trình thăng tiến", target: "stepper" },
    { label: "Hạn mức & Rủi ro", target: "calculator" },
    { label: "Bảng xếp hạng", target: "leaderboard" },
    { label: "Hỏi đáp", target: "faq" },
  ];

  return (
    <header
      id="top-navbar"
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-outline-custom/60 py-3"
          : "bg-background/40 backdrop-blur-sm border-outline-custom/20 py-4"
      }`}
    >
      <div className="flex justify-between items-center px-4 md:px-8 max-w-[1320px] mx-auto">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-headline text-lg md:text-xl font-extrabold text-primary-neon tracking-wider cursor-pointer hover:brightness-110 transition-all uppercase flex items-center gap-2"
        >
          <span className={`w-2 h-2 bg-primary-neon rounded-full animate-pulse ${isBrokerMode ? "shadow-[0_0_8px_#FFB300]" : "shadow-[0_0_8px_#00E676]"}`}></span>
          {isBrokerMode ? "PRO BROKER BOOTCAMP 2026" : "PRO TRADER BOOTCAMP 2026"}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollToSection(item.target)}
              className={`font-headline text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer pb-1 border-b-2 hover:text-primary-neon ${
                activeSection === item.target
                  ? "text-primary-neon border-primary-neon"
                  : "text-on-surface-variant border-transparent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Call to Action Button */}
        <div className="hidden sm:flex items-center gap-4">
          <button
            onClick={() => scrollToSection("register")}
            className="bg-primary-neon text-[#002114] font-headline text-xs font-extrabold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all glow-green uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            Join Challenge
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-on-surface hover:text-primary-neon focus:outline-none p-1 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background/95 border-b border-outline-custom backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col p-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => scrollToSection(item.target)}
                className={`font-headline text-sm font-bold text-left tracking-wider uppercase py-2 border-l-2 pl-3 ${
                  activeSection === item.target
                    ? "text-primary-neon border-primary-neon bg-primary-neon/5"
                    : "text-on-surface-variant border-transparent hover:text-primary-neon"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("register")}
              className="w-full bg-primary-neon text-[#002114] font-headline text-xs font-extrabold py-3 rounded-lg hover:brightness-110 transition-all text-center glow-green uppercase tracking-widest mt-2"
            >
              Join Challenge
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

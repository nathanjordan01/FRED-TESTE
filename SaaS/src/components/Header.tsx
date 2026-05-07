"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [integrity, setIntegrity] = useState(100);
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Sincronização de Tema via LocalStorage e Preferência do Sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('fred-ia-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDark(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('fred-ia-theme', newDark ? 'dark' : 'light');
    if (newDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogoClick = () => {
    if (integrity <= 15) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Feedback tátil sutil
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);

    if (newCount >= 5) {
      setIntegrity(15);
      setTimeout(() => {
        setIntegrity(100);
        setClickCount(0);
      }, 5000);
    } else {
      setIntegrity(prev => Math.max(15, prev - 20));
    }
  };

  const isBroken = integrity < 50;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-8 py-5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Branding */}
        <div className="flex items-center gap-5 cursor-pointer group" onClick={handleLogoClick} title="Sistema Operacional Dynar">
          <div className={`relative w-12 h-12 flex items-center justify-center rounded-[14px] transition-all duration-500 overflow-hidden ${isBroken ? 'bg-red-600' : 'bg-[#00c07e]'} shadow-lg shadow-emerald-500/10 ${isShaking ? 'animate-logo-shake' : ''}`}>
            {/* Letra D com Animação via globals.css */}
            <span className={`text-white font-black text-2xl italic select-none ml-0.5 transition-all duration-300 ${isBroken ? 'animate-logo-fall' : 'group-hover:scale-110'}`}>
              D
            </span>
          </div>
          
          <div className="flex flex-col">
            <h1 className={`text-2xl font-black tracking-tighter transition-all duration-500 italic leading-none ${isBroken ? 'text-red-600' : 'text-neutral-900 dark:text-white'}`}>
              DYNAR
            </h1>
            <span className={`text-[9px] font-bold uppercase tracking-[0.4em] mt-1.5 transition-all duration-500 ${isBroken ? 'text-red-400 opacity-60' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {isBroken ? 'ENGINE FAILURE' : 'AUTOMAÇÃO INDUSTRIAL'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-3 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-all border border-neutral-100 dark:border-neutral-700 active:scale-90"
            aria-label="Alternar Tema"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {isBroken && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 animate-pulse"></div>
      )}
    </header>
  );
}

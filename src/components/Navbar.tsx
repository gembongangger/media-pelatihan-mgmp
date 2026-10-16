import React from 'react';
import { RotateCcw } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate, onReset }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            IntegralEdu <span className="text-indigo-600 font-semibold font-mono">· Riemann</span>
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('simulasi')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'simulasi' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5' : ''
            }`}
          >
            Simulasi Visual
          </button>
          <button
            onClick={() => onNavigate('konsep')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'konsep' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5' : ''
            }`}
          >
            Panduan Konsep
          </button>
          <button
            onClick={() => onNavigate('tabel')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'tabel' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5' : ''
            }`}
          >
            Tabel Partisi
          </button>
          <button
            onClick={() => onNavigate('kuis')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'kuis' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5' : ''
            }`}
          >
            Kuis & Latihan
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Reset simulasi ke nilai default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

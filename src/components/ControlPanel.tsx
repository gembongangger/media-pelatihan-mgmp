import React, { useState } from 'react';
import { RiemannMethod, FunctionPreset } from '../types/math';
import { FUNCTION_PRESETS, METHOD_LABELS } from '../utils/presets';
import { Play, Pause, RotateCcw, Sliders, Layers, Sparkles, Check, HelpCircle } from 'lucide-react';

interface ControlPanelProps {
  selectedPresetId: string;
  onSelectPreset: (preset: FunctionPreset) => void;
  customFormula: string;
  onCustomFormulaChange: (formula: string) => void;
  isCustomMode: boolean;
  setIsCustomMode: (val: boolean) => void;
  formulaError: string | null;

  a: number;
  b: number;
  onBoundsChange: (a: number, b: number) => void;

  n: number;
  onNChange: (n: number) => void;

  method: RiemannMethod;
  onMethodChange: (m: RiemannMethod) => void;

  isPlaying: boolean;
  onTogglePlay: () => void;

  showTrueArea: boolean;
  setShowTrueArea: (v: boolean) => void;
  showSamplePoints: boolean;
  setShowSamplePoints: (v: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedPresetId,
  onSelectPreset,
  customFormula,
  onCustomFormulaChange,
  isCustomMode,
  setIsCustomMode,
  formulaError,
  a,
  b,
  onBoundsChange,
  n,
  onNChange,
  method,
  onMethodChange,
  isPlaying,
  onTogglePlay,
  showTrueArea,
  setShowTrueArea,
  showSamplePoints,
  setShowSamplePoints,
  showGrid,
  setShowGrid
}) => {
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      {/* 1. Pemilihan Fungsi Matematika f(x) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Fungsi Matematika f(x)
          </label>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                !isCustomMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilihan Standar
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                isCustomMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ketik Rumus Sendiri
            </button>
          </div>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FUNCTION_PRESETS.map((p) => {
              const active = selectedPresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    active
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-indigo-700">{p.formula}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.name}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">f(x) =</span>
              <input
                type="text"
                value={customFormula}
                onChange={(e) => onCustomFormulaChange(e.target.value)}
                placeholder="misal: x^2 + 1, sin(x) + 2, 0.5*x^3"
                className="w-full pl-16 pr-20 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowFormulaHelp(!showFormulaHelp)}
                className="absolute right-2.5 top-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1"
                title="Panduan sintaks"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bantuan</span>
              </button>
            </div>

            {formulaError && (
              <div className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded border border-rose-200">
                {formulaError}
              </div>
            )}

            {showFormulaHelp && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Operator yang didukung:</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[11px] text-slate-700">
                  <div>· Penjumlahan/Perkalian: +, -, *, /</div>
                  <div>· Pangkat: x^2, x^3, (x+1)^2</div>
                  <div>· Trigonometri: sin(x), cos(x), tan(x)</div>
                  <div>· Lainnya: sqrt(x), exp(x), ln(x), abs(x)</div>
                  <div>· Konstanta: pi, e</div>
                  <div>· Contoh: 3*x^2 - 2*x + 1</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Pemilihan Metode Persegi Panjang Riemann */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Metode Titik Sampel Persegi Panjang (xᵢ*)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['left', 'right', 'midpoint', 'trapezoid', 'lower', 'upper'] as RiemannMethod[]).map((m) => {
            const active = method === m;
            const meta = METHOD_LABELS[m];
            return (
              <button
                key={m}
                onClick={() => onMethodChange(m)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{meta.name.split(' (')[0]}</span>
                  <span className={`font-mono text-xs ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {meta.symbol}
                  </span>
                </div>
                <div className={`text-[10px] line-clamp-1 mt-0.5 ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {meta.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pengaturan Jumlah Partisi n (Subinterval) */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Persegi Panjang (n)
            </label>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono font-bold text-xs rounded">
              n = {n}
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1">
            {[4, 10, 20, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => onNChange(val)}
                className={`px-2 py-0.5 text-xs rounded transition-colors font-mono ${
                  n === val
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={n}
            onChange={(e) => onNChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />

          {/* Animation Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Animasi penambahan partisi menuju limit n -> ∞"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda Animasi</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Animasi n → ∞</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Pengaturan Batas Integral [a, b] */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Batas Integrasi [a, b]
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 mb-1">Batas Bawah (a)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={a}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val < b) {
                    onBoundsChange(val, b);
                  }
                }}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 mb-1">Batas Atas (b)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={b}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > a) {
                    onBoundsChange(a, val);
                  }
                }}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tampilan & Visual Layer Toggles */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showTrueArea}
            onChange={(e) => setShowTrueArea(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>Luas Sejati ∫ f(x)dx</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showSamplePoints}
            onChange={(e) => setShowSamplePoints(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>Titik Sampel (xᵢ*, f(xᵢ*))</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>Grid Koordinat</span>
        </label>
      </div>
    </div>
  );
};

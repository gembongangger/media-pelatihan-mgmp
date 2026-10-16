import React from 'react';
import { RiemannMethod } from '../types/math';
import { METHOD_LABELS } from '../utils/presets';
import { Calculator, ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Sigma } from 'lucide-react';

interface MathSummaryCardProps {
  a: number;
  b: number;
  n: number;
  method: RiemannMethod;
  riemannSum: number;
  exactIntegral: number;
  displayFormula: string;
}

export const MathSummaryCard: React.FC<MathSummaryCardProps> = ({
  a,
  b,
  n,
  method,
  riemannSum,
  exactIntegral,
  displayFormula,
}) => {
  const dx = (b - a) / n;
  const errorAbs = Math.abs(exactIntegral - riemannSum);
  const errorPercent = Math.abs(exactIntegral) > 1e-6
    ? Math.min(100, (errorAbs / Math.abs(exactIntegral)) * 100)
    : 0;

  // Determine over/underestimation status
  let statusBadge = {
    text: 'Sangat Presisi (Mendekati Eksak)',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: CheckCircle2,
    explanation: 'Aproksimasi persegi panjang sudah sangat rapat dengan luas bidang integral sejati.'
  };

  if (errorAbs > 0.05) {
    if (riemannSum > exactIntegral) {
      statusBadge = {
        text: 'Kelebihan Luas (Overestimate)',
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: TrendingUp,
        explanation: 'Sebagian besar persegi panjang menjulang melebihi kurva f(x).'
      };
    } else {
      statusBadge = {
        text: 'Kekurangan Luas (Underestimate)',
        bg: 'bg-sky-50 border-sky-200 text-sky-800',
        icon: AlertCircle,
        explanation: 'Persegi panjang berada di bawah kurva, menyisakan rongga kosong yang belum terhitung.'
      };
    }
  }

  const accuracyScore = Math.max(0, 100 - errorPercent);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800">
            Perhitungan Matematis & Analisis Konvergensi
          </h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border font-medium ${statusBadge.bg}`}>
          <statusBadge.icon className="w-3.5 h-3.5 shrink-0" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* 1. Nilai Komparasi Luas: Riemann vs Integral Sejati */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Riemann Sum Result */}
        <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Aproksimasi Riemann ({METHOD_LABELS[method].symbol})</span>
            <span className="font-mono text-xs">n = {n}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-950 tabular-nums">
            {riemannSum.toFixed(4)}
          </div>
          <div className="text-[11px] text-indigo-700/80 mt-1 font-mono">
            ∑ f(xᵢ*) · Δx
          </div>
        </div>

        {/* Exact Integral Result */}
        <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Luas Eksak (Integral Tentu)</span>
            <span className="font-mono text-xs">∫ₐᵇ f(x)dx</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950 tabular-nums">
            {exactIntegral.toFixed(4)}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1 font-mono">
            ∫_{a}^{b} ({displayFormula}) dx
          </div>
        </div>

        {/* Absolute Error & Accuracy */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Galat / Error (|Δ|)</span>
            <span className="font-mono text-xs">{errorPercent.toFixed(2)}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {errorAbs.toFixed(4)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tingkat Akurasi: <span className="font-semibold text-slate-700">{accuracyScore.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Derivation Formulas */}
      <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-xs space-y-2 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 font-sans">1. Lebar Partisi:</span>
            <span>Δx = (b - a) / n</span>
            <span>= ({b} - {a}) / {n}</span>
            <span className="font-bold text-indigo-600">= {dx.toFixed(4)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-slate-700 pt-1 border-t border-slate-200">
          <span className="font-bold text-slate-900 font-sans">2. Notasi Sigma:</span>
          <span>{METHOD_LABELS[method].symbol} = ∑_{'{i=1}'}^{'{' + n + '}'} f(xᵢ*) · ({dx.toFixed(4)}) ≈ {riemannSum.toFixed(4)}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-sans pt-1">
          <span className="text-indigo-600 font-medium">💡 Pemahaman Konsep:</span>
          <span>{statusBadge.explanation}</span>
        </div>
      </div>

      {/* 3. Convergence Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Tingkat Kerapatan Partisi (Konvergensi ke Luas Eksak)</span>
          <span className="font-mono font-medium text-slate-900">{Math.round(accuracyScore)}% Konvergen</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(5, accuracyScore))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

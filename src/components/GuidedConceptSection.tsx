import React, { useState } from 'react';
import { GUIDED_STAGES } from '../utils/presets';
import { BookOpen, CheckCircle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { RiemannMethod } from '../types/math';

interface GuidedConceptSectionProps {
  onApplyStage: (params: {
    functionId: string;
    a: number;
    b: number;
    n: number;
    method: RiemannMethod;
  }) => void;
}

export const GuidedConceptSection: React.FC<GuidedConceptSectionProps> = ({ onApplyStage }) => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const currentStage = GUIDED_STAGES[activeStageIndex];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Panduan Konsep Bertahap: Dari Persegi Panjang ke Integral Tentu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pelajari konsep fundamental kalkulus secara runut melalui 4 tahapan interaktif.
          </p>
        </div>

        {/* Stage Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          {GUIDED_STAGES.map((s, idx) => (
            <button
              key={s.stage}
              onClick={() => setActiveStageIndex(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeStageIndex === idx
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahap {s.stage}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Tahap {currentStage.stage} dari 4
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {currentStage.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {currentStage.subtitle}
            </p>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {currentStage.description}
          </p>

          {/* Key Takeaway Callout */}
          <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                Poin Kunci (Key Takeaway)
              </div>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                {currentStage.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Action Card: Apply to Simulation */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulasi yang Disarankan</span>
          </div>

          <div className="text-xs space-y-2 font-mono text-slate-700">
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-sans">Fungsi:</span>
              <span className="font-semibold text-slate-900">f(x) = x²</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-sans">Interval [a, b]:</span>
              <span className="font-semibold text-slate-900">[{currentStage.suggestedParams.a}, {currentStage.suggestedParams.b}]</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-sans">Jumlah Partisi:</span>
              <span className="font-semibold text-indigo-600">n = {currentStage.suggestedParams.n}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Metode:</span>
              <span className="font-semibold text-slate-900 capitalize">{currentStage.suggestedParams.method}</span>
            </div>
          </div>

          <button
            onClick={() => onApplyStage(currentStage.suggestedParams)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>Terapkan ke Simulasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Next / Previous stage buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <button
              onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStageIndex === 0}
              className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              ← Tahap Sebelumnya
            </button>
            <button
              onClick={() => setActiveStageIndex((prev) => Math.min(GUIDED_STAGES.length - 1, prev + 1))}
              disabled={activeStageIndex === GUIDED_STAGES.length - 1}
              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              Tahap Selanjutnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

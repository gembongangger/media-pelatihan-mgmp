import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RiemannMethod, FunctionPreset, RectangleData } from './types/math';
import { FUNCTION_PRESETS } from './utils/presets';
import { compileExpression, calculateExactIntegral, computeRiemannRectangles } from './utils/mathParser';
import { Navbar } from './components/Navbar';
import { RiemannCanvas } from './components/RiemannCanvas';
import { ControlPanel } from './components/ControlPanel';
import { MathSummaryCard } from './components/MathSummaryCard';
import { GuidedConceptSection } from './components/GuidedConceptSection';
import { PartitionTable } from './components/PartitionTable';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { Info, Sparkles, BookOpen, Calculator, Award } from 'lucide-react';

export default function App() {
  // Navigation active tab / scroll section
  const [activeTab, setActiveTab] = useState<'simulasi' | 'konsep' | 'tabel' | 'kuis'>('simulasi');

  // Math State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('parabola');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customFormula, setCustomFormula] = useState<string>('x^2');
  const [formulaError, setFormulaError] = useState<string | null>(null);

  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(3);
  const [n, setN] = useState<number>(6);
  const [method, setMethod] = useState<RiemannMethod>('left');

  // Canvas visual toggles
  const [showTrueArea, setShowTrueArea] = useState<boolean>(true);
  const [showSamplePoints, setShowSamplePoints] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Hover sync between Canvas and Partition Table
  const [hoveredRectIndex, setHoveredRectIndex] = useState<number | null>(null);

  // Animation of n -> infinity
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationTimerRef = useRef<number | null>(null);

  // Preset lookup
  const currentPreset = useMemo(
    () => FUNCTION_PRESETS.find((p) => p.id === selectedPresetId) || FUNCTION_PRESETS[0],
    [selectedPresetId]
  );

  // Active mathematical function
  const activeFn = useMemo(() => {
    if (!isCustomMode) {
      setFormulaError(null);
      return currentPreset.fn;
    }
    try {
      const parsed = compileExpression(customFormula);
      setFormulaError(null);
      return parsed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Formula tidak valid';
      setFormulaError(msg);
      return () => 0;
    }
  }, [isCustomMode, customFormula, currentPreset]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: FunctionPreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setA(preset.defaultA);
    setB(preset.defaultB);
  };

  // Bounds change handler with validation
  const handleBoundsChange = (newA: number, newB: number) => {
    if (newA < newB) {
      setA(newA);
      setB(newB);
    }
  };

  // Compute Rectangles
  const rectangles: RectangleData[] = useMemo(() => {
    return computeRiemannRectangles(activeFn, a, b, n, method);
  }, [activeFn, a, b, n, method]);

  // Compute Riemann Sum
  const riemannSum: number = useMemo(() => {
    return rectangles.reduce((sum, r) => sum + r.area, 0);
  }, [rectangles]);

  // Compute Exact Definite Integral
  const exactIntegral: number = useMemo(() => {
    if (!isCustomMode && currentPreset.integralFn) {
      return currentPreset.integralFn(a, b);
    }
    return calculateExactIntegral(activeFn, a, b);
  }, [isCustomMode, currentPreset, activeFn, a, b]);

  // Animation loop: smoothly increments n from 1 to 80
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = window.setInterval(() => {
        setN((prevN) => {
          if (prevN >= 80) {
            setIsPlaying(false);
            return 80;
          }
          return prevN + 1;
        });
      }, 160);
    } else {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Reset to default standard state
  const handleReset = () => {
    setIsPlaying(false);
    setSelectedPresetId('parabola');
    setIsCustomMode(false);
    setCustomFormula('x^2');
    setA(0);
    setB(3);
    setN(6);
    setMethod('left');
    setShowTrueArea(true);
    setShowSamplePoints(true);
    setShowGrid(true);
    setHoveredRectIndex(null);
  };

  // Stage Application from Guided Walkthrough
  const handleApplyGuidedStage = (params: {
    functionId: string;
    a: number;
    b: number;
    n: number;
    method: RiemannMethod;
  }) => {
    const preset = FUNCTION_PRESETS.find((p) => p.id === params.functionId) || FUNCTION_PRESETS[0];
    handleSelectPreset(preset);
    setA(params.a);
    setB(params.b);
    setN(params.n);
    setMethod(params.method);
    setActiveTab('simulasi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayFormulaStr = isCustomMode ? customFormula : currentPreset.formula;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 3-Zone Navigation Top Bar */}
      <Navbar
        activeSection={activeTab}
        onNavigate={(tab) => setActiveTab(tab as typeof activeTab)}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Section & Context Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Laboratorium Matematika Interaktif Kalkulus
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Visualisasi Jumlah Persegi Panjang Riemann & Integral Tentu
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Eksplorasi bagaimana pembagian bidang melengkung menjadi persegi panjang berlebar{' '}
              <span className="font-mono font-medium text-slate-900">Δx = (b - a)/n</span>{' '}
              berkonvergensi menjadi luas integral eksak{' '}
              <span className="font-mono font-medium text-indigo-700">∫ₐᵇ f(x) dx</span> ketika{' '}
              <span className="font-mono font-medium text-slate-900">n → ∞</span>.
            </p>
          </div>

          {/* Clean Segmented Tab Navigation for Desktop */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg shrink-0 text-xs font-medium">
            <button
              onClick={() => setActiveTab('simulasi')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'simulasi' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulasi
            </button>
            <button
              onClick={() => setActiveTab('konsep')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'konsep' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahapan Konsep
            </button>
            <button
              onClick={() => setActiveTab('tabel')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'tabel' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Data
            </button>
            <button
              onClick={() => setActiveTab('kuis')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'kuis' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kuis
            </button>
          </div>
        </div>

        {/* View Tab: SIMULASI (Default Primary Workspace) */}
        {activeTab === 'simulasi' && (
          <div className="space-y-6">
            {/* Split 2-Zone Layout: Interactive Stage (Left) & Controls (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Zone: Interactive Coordinate Canvas (7 cols on large desktop) */}
              <div className="lg:col-span-7 flex flex-col">
                <RiemannCanvas
                  fn={activeFn}
                  a={a}
                  b={b}
                  n={n}
                  method={method}
                  rectangles={rectangles}
                  onBoundsChange={handleBoundsChange}
                  hoveredRectIndex={hoveredRectIndex}
                  onHoverRect={setHoveredRectIndex}
                  showTrueArea={showTrueArea}
                  showSamplePoints={showSamplePoints}
                  showGrid={showGrid}
                />
              </div>

              {/* Right Zone: Control Deck (5 cols on large desktop) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <ControlPanel
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                  customFormula={customFormula}
                  onCustomFormulaChange={setCustomFormula}
                  isCustomMode={isCustomMode}
                  setIsCustomMode={setIsCustomMode}
                  formulaError={formulaError}
                  a={a}
                  b={b}
                  onBoundsChange={handleBoundsChange}
                  n={n}
                  onNChange={setN}
                  method={method}
                  onMethodChange={setMethod}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  showTrueArea={showTrueArea}
                  setShowTrueArea={setShowTrueArea}
                  showSamplePoints={showSamplePoints}
                  setShowSamplePoints={setShowSamplePoints}
                  showGrid={showGrid}
                  setShowGrid={setShowGrid}
                />
              </div>
            </div>

            {/* Bottom Row: Mathematical Rigor & Live Summary Card */}
            <MathSummaryCard
              a={a}
              b={b}
              n={n}
              method={method}
              riemannSum={riemannSum}
              exactIntegral={exactIntegral}
              displayFormula={displayFormulaStr}
            />
          </div>
        )}

        {/* View Tab: PANDUAN KONSEP BERTAHAP */}
        {activeTab === 'konsep' && (
          <div className="space-y-6">
            <GuidedConceptSection onApplyStage={handleApplyGuidedStage} />
          </div>
        )}

        {/* View Tab: TABEL PARTISI */}
        {activeTab === 'tabel' && (
          <div className="space-y-6">
            <PartitionTable
              rectangles={rectangles}
              hoveredRectIndex={hoveredRectIndex}
              onHoverRect={setHoveredRectIndex}
              method={method}
              totalSum={riemannSum}
            />
          </div>
        )}

        {/* View Tab: KUIS & LATIHAN */}
        {activeTab === 'kuis' && (
          <div className="space-y-6">
            <InteractiveQuiz />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>Media Pembelajaran Kalkulus Integral</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Jumlah Riemann & Teorema Dasar Kalkulus</span>
          </div>
          <div>
            <span>Berdasarkan formulasi Georg Friedrich Bernhard Riemann (1854)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

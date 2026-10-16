import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../utils/presets';
import { Award, HelpCircle, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

export const InteractiveQuiz: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted[questionId]) return; // locked once checked
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleCheckAnswer = (questionId: string) => {
    setSubmitted((prev) => ({
      ...prev,
      [questionId]: true
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted({});
  };

  const totalAnswered = Object.keys(submitted).length;
  const totalCorrect = Object.entries(submitted).filter(([qId, isSub]) => {
    if (!isSub) return false;
    const q = QUIZ_QUESTIONS.find((item) => item.id === qId);
    return q && selectedAnswers[qId] === q.correctIndex;
  }).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Uji Pemahaman Konsep (Kuis Interaktif)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uji pemahaman kalkulus Anda tentang partisi Riemann, nilai galat, dan limit integral.
          </p>
        </div>

        {/* Score & Reset */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
            <span className="text-slate-500">Skor: </span>
            <span className="font-bold text-indigo-700">{totalCorrect}</span>
            <span className="text-slate-400"> / {QUIZ_QUESTIONS.length}</span>
          </div>

          <button
            onClick={handleResetQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulang Kuis</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {QUIZ_QUESTIONS.map((q, qIndex) => {
          const isAnswered = submitted[q.id];
          const chosen = selectedAnswers[q.id];
          const isCorrect = isAnswered && chosen === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                    {qIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500">
                    Tingkat: {q.difficulty}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-slate-900 mb-1">
                {q.question}
              </div>

              {q.context && (
                <div className="text-xs text-slate-500 mb-3 italic">
                  Petunjuk: {q.context}
                </div>
              )}

              {/* Options */}
              <div className="space-y-2 mt-3">
                {q.options.map((opt, optIndex) => {
                  const isSelected = chosen === optIndex;
                  let optStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                  if (isSelected) {
                    optStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-500';
                  }

                  if (isAnswered) {
                    if (optIndex === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-500';
                    } else {
                      optStyle = 'border-slate-200 bg-white opacity-60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      disabled={isAnswered}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIndex === q.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action & Explanation */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-2">
                {!isAnswered ? (
                  <button
                    onClick={() => handleCheckAnswer(q.id)}
                    disabled={chosen === undefined}
                    className="self-end px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Periksa Jawaban
                  </button>
                ) : (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <div className="font-bold mb-0.5">
                      {isCorrect ? '✓ Jawaban Anda Benar!' : '✕ Belum Tepat'}
                    </div>
                    <div>{q.explanation}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

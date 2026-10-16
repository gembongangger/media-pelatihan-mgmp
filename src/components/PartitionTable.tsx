import React, { useState } from 'react';
import { RectangleData, RiemannMethod } from '../types/math';
import { Table, Download, Copy, Check, Info } from 'lucide-react';

interface PartitionTableProps {
  rectangles: RectangleData[];
  hoveredRectIndex: number | null;
  onHoverRect: (index: number | null) => void;
  method: RiemannMethod;
  totalSum: number;
}

export const PartitionTable: React.FC<PartitionTableProps> = ({
  rectangles,
  hoveredRectIndex,
  onHoverRect,
  method,
  totalSum
}) => {
  const [copied, setCopied] = useState(false);
  const [maxDisplay, setMaxDisplay] = useState(25);

  const handleCopy = () => {
    const header = 'i,Interval_Kiri,Interval_Kanan,Titik_Sampel_x*,Tinggi_f(x*),Lebar_dx,Luas_Li\n';
    const rows = rectangles
      .map(
        (r) =>
          `${r.index},${r.xLeft.toFixed(4)},${r.xRight.toFixed(4)},${r.xSample.toFixed(4)},${r.height.toFixed(4)},${r.width.toFixed(4)},${r.area.toFixed(4)}`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedRectangles = rectangles.slice(0, maxDisplay);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Tabel Rincian Partisi & Luas Tiap Persegi Panjang
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lihat perhitungan tiap persegi panjang i = 1 s/d {rectangles.length}. Sorot baris untuk melihat posisinya di grafik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            title="Salin data tabel ke clipboard format CSV"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-3 w-12 text-center"># (i)</th>
              <th className="py-2.5 px-3">Subinterval [x_{'{i-1}'}, x_{'{i}'}]</th>
              <th className="py-2.5 px-3">Titik Sampel (xᵢ*)</th>
              <th className="py-2.5 px-3">Tinggi f(xᵢ*)</th>
              <th className="py-2.5 px-3">Lebar (Δx)</th>
              <th className="py-2.5 px-3 text-right">Luas Lᵢ = f(xᵢ*) · Δx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {displayedRectangles.map((r) => {
              const isHovered = hoveredRectIndex === r.index;
              return (
                <tr
                  key={r.index}
                  onMouseEnter={() => onHoverRect(r.index)}
                  onMouseLeave={() => onHoverRect(null)}
                  className={`cursor-pointer transition-colors ${
                    isHovered
                      ? 'bg-indigo-50 font-semibold text-indigo-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-sans">{r.index}</td>
                  <td className="py-2 px-3 text-slate-600">
                    [{r.xLeft.toFixed(3)}, {r.xRight.toFixed(3)}]
                  </td>
                  <td className="py-2 px-3 text-indigo-600 font-semibold">{r.xSample.toFixed(3)}</td>
                  <td className="py-2 px-3 text-slate-800">{r.height.toFixed(4)}</td>
                  <td className="py-2 px-3 text-slate-600">{r.width.toFixed(4)}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                    {r.area.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold text-xs text-slate-900 border-t-2 border-slate-200">
              <td colSpan={5} className="py-2.5 px-3 text-right font-sans">
                Total Jumlah Riemann (∑ Lᵢ):
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-indigo-700 text-sm tabular-nums">
                {totalSum.toFixed(4)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {rectangles.length > maxDisplay && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Menampilkan {maxDisplay} dari {rectangles.length} partisi
          </span>
          <button
            onClick={() => setMaxDisplay((prev) => prev + 25)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Muat 25 baris lagi ↓
          </button>
        </div>
      )}
    </div>
  );
};

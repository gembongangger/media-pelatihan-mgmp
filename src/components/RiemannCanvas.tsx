import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RectangleData, RiemannMethod } from '../types/math';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from 'lucide-react';

interface RiemannCanvasProps {
  fn: (x: number) => number;
  a: number;
  b: number;
  n: number;
  method: RiemannMethod;
  rectangles: RectangleData[];
  onBoundsChange: (newA: number, newB: number) => void;
  hoveredRectIndex: number | null;
  onHoverRect: (index: number | null) => void;
  showTrueArea: boolean;
  showSamplePoints: boolean;
  showGrid: boolean;
}

export const RiemannCanvas: React.FC<RiemannCanvasProps> = ({
  fn,
  a,
  b,
  n,
  method,
  rectangles,
  onBoundsChange,
  hoveredRectIndex,
  onHoverRect,
  showTrueArea,
  showSamplePoints,
  showGrid
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport transformation: math coordinates to screen pixels
  // Center and scale
  const [viewState, setViewState] = useState({
    xMin: -1,
    xMax: 5,
    yMin: -1,
    yMax: 10,
  });

  // Interaction state: dragging handle 'a', 'b', or canvas panning
  const [draggingTarget, setDraggingTarget] = useState<'a' | 'b' | 'pan' | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialViewState: typeof viewState; initialA: number; initialB: number }>({
    mouseX: 0,
    mouseY: 0,
    initialViewState: viewState,
    initialA: a,
    initialB: b
  });

  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);

  // Auto-fit function view to current interval [a, b]
  const fitToInterval = useCallback(() => {
    const marginX = Math.max(1, (b - a) * 0.25);
    const newXMin = Math.min(a - marginX, -0.5);
    const newXMax = Math.max(b + marginX, 2);

    // Sample function on interval [newXMin, newXMax] to find y range
    let minY = 0;
    let maxY = 1;
    const samples = 100;
    const step = (newXMax - newXMin) / samples;
    for (let i = 0; i <= samples; i++) {
      const curX = newXMin + i * step;
      const curY = fn(curX);
      if (isFinite(curY)) {
        minY = Math.min(minY, curY);
        maxY = Math.max(maxY, curY);
      }
    }
    const marginY = Math.max(1, (maxY - minY) * 0.25);
    setViewState({
      xMin: newXMin,
      xMax: newXMax,
      yMin: Math.min(-0.8, minY - marginY),
      yMax: Math.max(3, maxY + marginY)
    });
  }, [a, b, fn]);

  // Initial fit when bounds change drastically or user clicks reset
  useEffect(() => {
    fitToInterval();
  }, [a, b, fitToInterval]);

  // Mathematical Coordinate Mapping
  const toScreenX = (x: number, width: number) => {
    return ((x - viewState.xMin) / (viewState.xMax - viewState.xMin)) * width;
  };

  const toScreenY = (y: number, height: number) => {
    return height - ((y - viewState.yMin) / (viewState.yMax - viewState.yMin)) * height;
  };

  const toMathX = (screenX: number, width: number) => {
    return viewState.xMin + (screenX / width) * (viewState.xMax - viewState.xMin);
  };

  const toMathY = (screenY: number, height: number) => {
    return viewState.yMin + ((height - screenY) / height) * (viewState.yMax - viewState.yMin);
  };

  // Main Render Loop on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina Display scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Gridlines & Axes
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#f1f5f9';

      // Smart tick calculation
      const xRange = viewState.xMax - viewState.xMin;
      const yRange = viewState.yMax - viewState.yMin;

      // Determine nice step (e.g. 0.5, 1, 2, 5, 10)
      const getNiceStep = (range: number) => {
        const roughStep = range / 8;
        const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const norm = roughStep / mag;
        if (norm < 1.5) return 1 * mag;
        if (norm < 3.5) return 2 * mag;
        if (norm < 7.5) return 5 * mag;
        return 10 * mag;
      };

      const xStep = getNiceStep(xRange);
      const yStep = getNiceStep(yRange);

      // Vertical Gridlines
      const firstX = Math.floor(viewState.xMin / xStep) * xStep;
      for (let gx = firstX; gx <= viewState.xMax; gx += xStep) {
        const sx = toScreenX(gx, width);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();
      }

      // Horizontal Gridlines
      const firstY = Math.floor(viewState.yMin / yStep) * yStep;
      for (let gy = firstY; gy <= viewState.yMax; gy += yStep) {
        const sy = toScreenY(gy, height);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();
      }

      // Draw Axis numbers
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const originY = Math.max(15, Math.min(height - 18, toScreenY(0, height)));
      for (let gx = firstX; gx <= viewState.xMax; gx += xStep) {
        if (Math.abs(gx) < 0.0001) continue; // Skip 0 label on x axis to avoid clash
        const sx = toScreenX(gx, width);
        if (sx > 20 && sx < width - 20) {
          ctx.fillText(Number(gx.toFixed(2)).toString(), sx, originY + 5);
        }
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const originX = Math.max(30, Math.min(width - 15, toScreenX(0, width)));
      for (let gy = firstY; gy <= viewState.yMax; gy += yStep) {
        if (Math.abs(gy) < 0.0001) continue;
        const sy = toScreenY(gy, height);
        if (sy > 20 && sy < height - 20) {
          ctx.fillText(Number(gy.toFixed(2)).toString(), originX - 6, sy);
        }
      }
    }

    // 2. Draw Major Axes (X and Y)
    const axisY = toScreenY(0, height);
    const axisX = toScreenX(0, width);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#cbd5e1';

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, height);
    ctx.stroke();

    // Axis arrows & labels
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('x', width - 12, axisY - 8);
    ctx.fillText('y', axisX + 8, 14);

    // 3. Draw True Area Under the Curve (Definite Integral Region)
    if (showTrueArea && a < b) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)'; // Soft Emerald translucent
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);

      ctx.beginPath();
      const leftPx = toScreenX(a, width);
      const rightPx = toScreenX(b, width);
      const zeroY = toScreenY(0, height);

      ctx.moveTo(leftPx, zeroY);
      const curveSteps = Math.min(600, Math.max(100, Math.round(rightPx - leftPx)));
      const stepX = (b - a) / curveSteps;

      for (let i = 0; i <= curveSteps; i++) {
        const curX = a + i * stepX;
        const curY = fn(curX);
        ctx.lineTo(toScreenX(curX, width), toScreenY(curY, height));
      }
      ctx.lineTo(rightPx, zeroY);
      ctx.closePath();
      ctx.fill();

      // Border markers at x=a and x=b
      ctx.beginPath();
      ctx.moveTo(leftPx, zeroY);
      ctx.lineTo(leftPx, toScreenY(fn(a), height));
      ctx.moveTo(rightPx, zeroY);
      ctx.lineTo(rightPx, toScreenY(fn(b), height));
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Riemann Rectangles (or Trapezoids)
    const zeroY = toScreenY(0, height);

    rectangles.forEach((rectData) => {
      const isHovered = hoveredRectIndex === rectData.index;
      const x1Px = toScreenX(rectData.xLeft, width);
      const x2Px = toScreenX(rectData.xRight, width);
      const rectW = x2Px - x1Px;

      if (method === 'trapezoid') {
        // Draw Trapezoid polygon
        const y1Px = toScreenY(fn(rectData.xLeft), height);
        const y2Px = toScreenY(fn(rectData.xRight), height);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1Px, zeroY);
        ctx.lineTo(x1Px, y1Px);
        ctx.lineTo(x2Px, y2Px);
        ctx.lineTo(x2Px, zeroY);
        ctx.closePath();

        if (isHovered) {
          ctx.fillStyle = 'rgba(79, 70, 229, 0.45)';
          ctx.strokeStyle = '#4338ca';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(99, 102, 241, 0.22)';
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.65)';
          ctx.lineWidth = 1;
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // Standard Riemann Rectangles
        const yTopPx = toScreenY(rectData.height, height);
        const rectH = zeroY - yTopPx;

        ctx.save();
        if (isHovered) {
          ctx.fillStyle = 'rgba(79, 70, 229, 0.45)';
          ctx.strokeStyle = '#3730a3';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(99, 102, 241, 0.22)';
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.6)';
          ctx.lineWidth = 1;
        }

        // Handle positive vs negative areas
        if (rectH >= 0) {
          ctx.fillRect(x1Px, yTopPx, rectW, rectH);
          ctx.strokeRect(x1Px, yTopPx, rectW, rectH);
        } else {
          // Negative function height (below x-axis)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.6)';
          ctx.fillRect(x1Px, zeroY, rectW, -rectH);
          ctx.strokeRect(x1Px, zeroY, rectW, -rectH);
        }

        // Draw sample point pin & dot
        if (showSamplePoints && n <= 35) {
          const samplePx = toScreenX(rectData.xSample, width);
          const sampleYPx = toScreenY(rectData.height, height);

          // Thin marker line from x-axis to sample point
          ctx.beginPath();
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = isHovered ? '#312e81' : 'rgba(79, 70, 229, 0.7)';
          ctx.lineWidth = 1;
          ctx.moveTo(samplePx, zeroY);
          ctx.lineTo(samplePx, sampleYPx);
          ctx.stroke();
          ctx.setLineDash([]);

          // Circle dot on sample point
          ctx.beginPath();
          ctx.arc(samplePx, sampleYPx, isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#312e81' : '#4f46e5';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      }
    });

    // 5. Draw Continuous Function Curve f(x)
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;

    const curveResolution = Math.round(width * 1.2);
    let isDrawing = false;

    for (let px = 0; px <= width; px += 2) {
      const curX = toMathX(px, width);
      const curY = fn(curX);

      if (!isFinite(curY) || isNaN(curY)) {
        isDrawing = false;
        continue;
      }

      const py = toScreenY(curY, height);

      // Clamp excessively wild y values to prevent canvas rendering anomalies
      if (py < -height || py > height * 2) {
        isDrawing = false;
        continue;
      }

      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.restore();

    // 6. Draw Bounds Handles (a and b) on the X Axis
    const drawBoundHandle = (val: number, label: string, color: string, isDragging: boolean) => {
      const xPx = toScreenX(val, width);
      const baseY = zeroY;

      ctx.save();
      // Vertical guide line
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.moveTo(xPx, 0);
      ctx.lineTo(xPx, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flag / Handle indicator on x-axis
      const handleSize = 16;
      ctx.fillStyle = isDragging ? '#1e1b4b' : color;
      ctx.beginPath();
      // Diamond or arrow handle
      ctx.moveTo(xPx, baseY);
      ctx.lineTo(xPx - 7, baseY + 12);
      ctx.lineTo(xPx + 7, baseY + 12);
      ctx.closePath();
      ctx.fill();

      // Pill label below axis
      const pillY = baseY + 14;
      const text = `${label} = ${val.toFixed(2)}`;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(xPx - textWidth / 2 - 6, pillY, textWidth + 12, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, xPx, pillY + 9);

      ctx.restore();
    };

    drawBoundHandle(a, 'a', '#4338ca', draggingTarget === 'a');
    drawBoundHandle(b, 'b', '#047857', draggingTarget === 'b');

  }, [
    viewState,
    fn,
    a,
    b,
    n,
    method,
    rectangles,
    hoveredRectIndex,
    showTrueArea,
    showSamplePoints,
    showGrid,
    draggingTarget
  ]);

  // Handle Mouse Events for Dragging Bounds or Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mathX = toMathX(mouseX, rect.width);
    const zeroY = toScreenY(0, rect.height);

    // Check hit test for handle 'a'
    const aPx = toScreenX(a, rect.width);
    const bPx = toScreenX(b, rect.width);

    const hitDistA = Math.abs(mouseX - aPx);
    const hitDistB = Math.abs(mouseX - bPx);

    // Near the x-axis handles
    const isNearY = Math.abs(mouseY - zeroY) < 30;

    if (hitDistA < 16 && isNearY) {
      setDraggingTarget('a');
      dragStartRef.current = {
        mouseX,
        mouseY,
        initialViewState: viewState,
        initialA: a,
        initialB: b
      };
      return;
    }

    if (hitDistB < 16 && isNearY) {
      setDraggingTarget('b');
      dragStartRef.current = {
        mouseX,
        mouseY,
        initialViewState: viewState,
        initialA: a,
        initialB: b
      };
      return;
    }

    // Default: Pan Canvas
    setDraggingTarget('pan');
    dragStartRef.current = {
      mouseX,
      mouseY,
      initialViewState: viewState,
      initialA: a,
      initialB: b
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMouseCanvasPos({ x: mouseX, y: mouseY });

    if (draggingTarget === 'a') {
      const rawX = toMathX(mouseX, rect.width);
      // Snap to nearest 0.1 and ensure a < b
      const newA = Math.min(b - 0.2, Math.round(rawX * 10) / 10);
      onBoundsChange(newA, b);
      return;
    }

    if (draggingTarget === 'b') {
      const rawX = toMathX(mouseX, rect.width);
      // Snap to nearest 0.1 and ensure b > a
      const newB = Math.max(a + 0.2, Math.round(rawX * 10) / 10);
      onBoundsChange(a, newB);
      return;
    }

    if (draggingTarget === 'pan') {
      const dxPx = mouseX - dragStartRef.current.mouseX;
      const dyPx = mouseY - dragStartRef.current.mouseY;

      const xSpan = dragStartRef.current.initialViewState.xMax - dragStartRef.current.initialViewState.xMin;
      const ySpan = dragStartRef.current.initialViewState.yMax - dragStartRef.current.initialViewState.yMin;

      const dMathX = -(dxPx / rect.width) * xSpan;
      const dMathY = (dyPx / rect.height) * ySpan;

      setViewState({
        xMin: dragStartRef.current.initialViewState.xMin + dMathX,
        xMax: dragStartRef.current.initialViewState.xMax + dMathX,
        yMin: dragStartRef.current.initialViewState.yMin + dMathY,
        yMax: dragStartRef.current.initialViewState.yMax + dMathY,
      });
      return;
    }

    // Hover detection over rectangles
    const currentMathX = toMathX(mouseX, rect.width);
    if (currentMathX >= a && currentMathX <= b) {
      const found = rectangles.find(
        (r) => currentMathX >= r.xLeft && currentMathX <= r.xRight
      );
      if (found) {
        onHoverRect(found.index);
      } else {
        onHoverRect(null);
      }
    } else {
      onHoverRect(null);
    }
  };

  const handleMouseUp = () => {
    setDraggingTarget(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 1.12 : 0.88;
    const centerMathX = toMathX(mouseX, rect.width);
    const centerMathY = toMathY(mouseY, rect.height);

    const xSpan = (viewState.xMax - viewState.xMin) * zoomFactor;
    const ySpan = (viewState.yMax - viewState.yMin) * zoomFactor;

    const ratioX = mouseX / rect.width;
    const ratioY = (rect.height - mouseY) / rect.height;

    setViewState({
      xMin: centerMathX - ratioX * xSpan,
      xMax: centerMathX + (1 - ratioX) * xSpan,
      yMin: centerMathY - ratioY * ySpan,
      yMax: centerMathY + (1 - ratioY) * ySpan,
    });
  };

  // Zoom buttons
  const zoomIn = () => {
    const xSpan = (viewState.xMax - viewState.xMin) * 0.8;
    const ySpan = (viewState.yMax - viewState.yMin) * 0.8;
    const xMid = (viewState.xMin + viewState.xMax) / 2;
    const yMid = (viewState.yMin + viewState.yMax) / 2;
    setViewState({
      xMin: xMid - xSpan / 2,
      xMax: xMid + xSpan / 2,
      yMin: yMid - ySpan / 2,
      yMax: yMid + ySpan / 2,
    });
  };

  const zoomOut = () => {
    const xSpan = (viewState.xMax - viewState.xMin) * 1.25;
    const ySpan = (viewState.yMax - viewState.yMin) * 1.25;
    const xMid = (viewState.xMin + viewState.xMax) / 2;
    const yMid = (viewState.yMin + viewState.yMax) / 2;
    setViewState({
      xMin: xMid - xSpan / 2,
      xMax: xMid + xSpan / 2,
      yMin: yMid - ySpan / 2,
      yMax: yMid + ySpan / 2,
    });
  };

  const hoveredRect = hoveredRectIndex ? rectangles.find((r) => r.index === hoveredRectIndex) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[460px] bg-white rounded-xl border border-slate-200 overflow-hidden select-none flex flex-col">
      {/* Canvas Header / Stage Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Kanvas Koordinat Kartesius</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Geser handle panah [a, b] pada sumbu-x atau drag kanvas untuk memindahkan bidang</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomIn}
            title="Perbesar Tampilan"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            title="Perkecil Tampilan"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={fitToInterval}
            title="Paskan ke Interval [a, b]"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-medium text-[11px]">Pas Interval</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 w-full h-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setDraggingTarget(null);
            onHoverRect(null);
          }}
          onWheel={handleWheel}
        />

        {/* Live Hover Tooltip for hovered rectangle */}
        {hoveredRect && mouseCanvasPos && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs backdrop-blur-sm border border-slate-700 font-mono"
            style={{
              left: Math.min(mouseCanvasPos.x + 16, (canvasRef.current?.clientWidth || 500) - 230),
              top: Math.max(12, mouseCanvasPos.y - 120),
            }}
          >
            <div className="font-bold text-indigo-300 mb-1 font-sans text-xs flex items-center gap-1.5">
              <span>Persegi Panjang #{hoveredRect.index}</span>
              <span className="text-slate-400 font-normal">dari {n}</span>
            </div>
            <div className="space-y-0.5 text-slate-200 text-[11px]">
              <div>Subinterval: <span className="text-emerald-300">[{hoveredRect.xLeft.toFixed(3)}, {hoveredRect.xRight.toFixed(3)}]</span></div>
              <div>Titik Sampel x*: <span className="text-amber-300">{hoveredRect.xSample.toFixed(3)}</span></div>
              <div>Tinggi f(x*): <span className="text-sky-300">{hoveredRect.height.toFixed(4)}</span></div>
              <div>Lebar Δx: <span className="text-purple-300">{hoveredRect.width.toFixed(4)}</span></div>
              <div className="pt-1 mt-1 border-t border-slate-700 font-semibold text-white">
                Luas L_{hoveredRect.index}: <span className="text-yellow-300 font-bold">{hoveredRect.area.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-slate-900 rounded"></span>
            <span className="text-slate-700 font-medium">Kurva f(x)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3 bg-indigo-500/30 border border-indigo-600 rounded-sm"></span>
            <span className="text-slate-700 font-medium">Persegi Panjang Riemann</span>
          </div>
          {showTrueArea && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3 bg-emerald-500/20 border border-emerald-500/60 border-dashed rounded-sm"></span>
              <span className="text-slate-700 font-medium">Luas Integral Sejati ∫ f(x)dx</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

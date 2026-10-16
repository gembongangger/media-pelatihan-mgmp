export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid' | 'lower' | 'upper';

export interface FunctionPreset {
  id: string;
  name: string;
  formula: string;
  displayFormula: string;
  defaultA: number;
  defaultB: number;
  fn: (x: number) => number;
  integralFn?: (a: number, b: number) => number;
  description: string;
}

export interface RectangleData {
  index: number;
  xLeft: number;
  xRight: number;
  xSample: number;
  height: number;
  width: number;
  area: number;
}

export interface SimulationState {
  functionId: string;
  customFormula: string;
  a: number;
  b: number;
  n: number;
  method: RiemannMethod;
  isPlayingAnimation: boolean;
  activeHoverRectIndex: number | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Dasar' | 'Menengah' | 'Tantangan';
}

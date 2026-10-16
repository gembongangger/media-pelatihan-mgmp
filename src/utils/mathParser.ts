import { RectangleData, RiemannMethod } from '../types/math';

/**
 * Evaluates a user math formula safely with variable x.
 * Supports basic arithmetic, powers (^), and standard functions:
 * sin, cos, tan, sqrt, abs, exp, ln, log, and constants pi, e.
 */
export function compileExpression(expressionStr: string): (x: number) => number {
  const sanitized = expressionStr
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();

  if (!sanitized) {
    return () => 0;
  }

  // Convert common mathematical shorthand into valid JS Math syntax
  // e.g., 2x -> 2*x, 3(x) -> 3*(x), x(x) -> x*(x)
  let transformed = sanitized
    .replace(/(\d)(x)/g, '$1*$2')
    .replace(/(x)(\d)/g, '$1*$2')
    .replace(/(\d)(\()/g, '$1*$2')
    .replace(/(\))(\d)/g, '$1*$2')
    .replace(/(\))(x)/g, '$1*$2')
    .replace(/(x)(\()/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*$2');

  // Replace constants
  transformed = transformed.replace(/\bpi\b/g, 'Math.PI');
  transformed = transformed.replace(/\be\b/g, 'Math.E');

  // Replace functions
  transformed = transformed.replace(/\bsin\b/g, 'Math.sin');
  transformed = transformed.replace(/\bcos\b/g, 'Math.cos');
  transformed = transformed.replace(/\btan\b/g, 'Math.tan');
  transformed = transformed.replace(/\bsqrt\b/g, 'Math.sqrt');
  transformed = transformed.replace(/\babs\b/g, 'Math.abs');
  transformed = transformed.replace(/\bexp\b/g, 'Math.exp');
  transformed = transformed.replace(/\bln\b/g, 'Math.log');
  transformed = transformed.replace(/\blog\b/g, 'Math.log10');

  // Replace power notation x^2 -> Math.pow(x, 2)
  // Simple regex for basic powers like term^power
  let previous = '';
  while (previous !== transformed && transformed.includes('^')) {
    previous = transformed;
    transformed = transformed.replace(
      /([a-zA-Z0-9_\.]+|\([^\(\)]+\))\^([a-zA-Z0-9_\.]+|\([^\(\)]+\))/,
      'Math.pow($1,$2)'
    );
  }

  // Validate allowed characters for safety (no eval injection)
  const allowedPattern = /^[0-9x\+\-\*\/\(\)\.,Math\.PIEsincoztaqrbpelgpow_ ]+$/;
  if (!allowedPattern.test(transformed)) {
    throw new Error('Ekspresi mengandung karakter yang tidak diizinkan.');
  }

  try {
    const fn = new Function('x', `"use strict"; return (${transformed});`) as (x: number) => number;
    // Test evaluate at x = 1 to verify syntax
    const testVal = fn(1);
    if (typeof testVal !== 'number') {
      throw new Error('Hasil ekspresi bukan bilangan.');
    }
    return (x: number) => {
      try {
        const val = fn(x);
        return isFinite(val) ? val : 0;
      } catch {
        return 0;
      }
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ekspresi matematika tidak valid';
    throw new Error(message);
  }
}

/**
 * Calculates high-accuracy definite integral of f(x) over [a, b] using Composite Simpson's 3/8 Rule
 * with 2000 subdivisions.
 */
export function calculateExactIntegral(
  fn: (x: number) => number,
  a: number,
  b: number
): number {
  if (a === b) return 0;
  if (a > b) return -calculateExactIntegral(fn, b, a);

  const n = 2001; // Multiple of 3
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = fn(x);
    if (isNaN(fx) || !isFinite(fx)) continue;

    if (i % 3 === 0) {
      sum += 2 * fx;
    } else {
      sum += 3 * fx;
    }
  }

  return (3 * h / 8) * sum;
}

/**
 * Computes the Riemann partition rectangles for a given method and subintervals n
 */
export function computeRiemannRectangles(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): RectangleData[] {
  if (n <= 0 || a === b) return [];

  const dx = (b - a) / n;
  const rectangles: RectangleData[] = [];

  for (let i = 0; i < n; i++) {
    const xLeft = a + i * dx;
    const xRight = a + (i + 1) * dx;
    let xSample = xLeft;
    let height = 0;

    if (method === 'left') {
      xSample = xLeft;
      height = fn(xSample);
    } else if (method === 'right') {
      xSample = xRight;
      height = fn(xSample);
    } else if (method === 'midpoint') {
      xSample = (xLeft + xRight) / 2;
      height = fn(xSample);
    } else if (method === 'trapezoid') {
      // For trapezoid, average the left and right values
      xSample = (xLeft + xRight) / 2;
      const hLeft = fn(xLeft);
      const hRight = fn(xRight);
      height = (hLeft + hRight) / 2;
    } else if (method === 'lower' || method === 'upper') {
      // Sample 25 intermediate points in this subinterval to find min or max
      const subSamples = 25;
      const subStep = dx / subSamples;
      let targetX = xLeft;
      let targetY = fn(xLeft);

      for (let s = 1; s <= subSamples; s++) {
        const curX = xLeft + s * subStep;
        const curY = fn(curX);
        if (method === 'lower' ? curY < targetY : curY > targetY) {
          targetY = curY;
          targetX = curX;
        }
      }
      xSample = targetX;
      height = targetY;
    }

    if (!isFinite(height)) {
      height = 0;
    }

    const area = height * dx;

    rectangles.push({
      index: i + 1,
      xLeft,
      xRight,
      xSample,
      height,
      width: dx,
      area
    });
  }

  return rectangles;
}

/**
 * Formats a number to clean readable math representation
 */
export function formatMathNum(num: number, decimals: number = 4): string {
  if (Math.abs(num) < 1e-9) return '0';
  return Number(num.toFixed(decimals)).toString();
}

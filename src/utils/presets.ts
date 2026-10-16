import { FunctionPreset, QuizQuestion } from '../types/math';

export const FUNCTION_PRESETS: FunctionPreset[] = [
  {
    id: 'parabola',
    name: 'Parabola Monoton Naik',
    formula: 'x^2',
    displayFormula: 'f(x) = x²',
    defaultA: 0,
    defaultB: 3,
    fn: (x: number) => x * x,
    integralFn: (a: number, b: number) => (Math.pow(b, 3) - Math.pow(a, 3)) / 3,
    description: 'Fungsi kuadrat klasik. Perhatikan bagaimana jumlah ujung kiri selalu meremehkan (underestimate) dan ujung kanan melebih-lebihkan (overestimate) karena fungsi selalu naik.'
  },
  {
    id: 'inverted_parabola',
    name: 'Kubah Parabola Terbalik',
    formula: '4 - x^2',
    displayFormula: 'f(x) = 4 - x²',
    defaultA: -2,
    defaultB: 2,
    fn: (x: number) => 4 - x * x,
    integralFn: (a: number, b: number) => (4 * b - Math.pow(b, 3) / 3) - (4 * a - Math.pow(a, 3) / 3),
    description: 'Bentuk simetris kubah. Luas tepat di bawah kurva pada selang [-2, 2] adalah 32/3 ≈ 10.6667. Titik tengah memberikan aproksimasi yang sangat akurat.'
  },
  {
    id: 'sine',
    name: 'Gelombang Sinus Positif',
    formula: 'sin(x) + 1.5',
    displayFormula: 'f(x) = \\sin(x) + 1.5',
    defaultA: 0,
    defaultB: 6.28318, // 2*PI
    fn: (x: number) => Math.sin(x) + 1.5,
    integralFn: (a: number, b: number) => (-Math.cos(b) + 1.5 * b) - (-Math.cos(a) + 1.5 * a),
    description: 'Kurva periodik bergelombang yang digeser ke atas agar selalu bernilai positif. Cocok untuk mengamati pergantian area cekung ke atas dan ke bawah.'
  },
  {
    id: 'polynomial3',
    name: 'Polinomial Derajat Tiga',
    formula: '0.2*x^3 - x + 2',
    displayFormula: 'f(x) = 0.2x³ - x + 2',
    defaultA: -1,
    defaultB: 3,
    fn: (x: number) => 0.2 * Math.pow(x, 3) - x + 2,
    integralFn: (a: number, b: number) =>
      (0.2 * Math.pow(b, 4) / 4 - Math.pow(b, 2) / 2 + 2 * b) -
      (0.2 * Math.pow(a, 4) / 4 - Math.pow(a, 2) / 2 + 2 * a),
    description: 'Fungsi non-linear dengan titik belok. Menunjukkan bagaimana partisi Riemann dapat menangkap lekukan yang lebih kompleks.'
  },
  {
    id: 'linear',
    name: 'Garis Linear Bertahap',
    formula: '0.5*x + 1',
    displayFormula: 'f(x) = 0.5x + 1',
    defaultA: 0,
    defaultB: 4,
    fn: (x: number) => 0.5 * x + 1,
    integralFn: (a: number, b: number) => (0.25 * b * b + b) - (0.25 * a * a + a),
    description: 'Membentuk trapesium siku-siku geometri murni. Dapat diverifikasi langsung dengan rumus luas trapesium biasa.'
  },
  {
    id: 'exponential',
    name: 'Pertumbuhan Eksponensial',
    formula: 'exp(0.5*x)',
    displayFormula: 'f(x) = e^{0.5x}',
    defaultA: 0,
    defaultB: 3,
    fn: (x: number) => Math.exp(0.5 * x),
    integralFn: (a: number, b: number) => 2 * Math.exp(0.5 * b) - 2 * Math.exp(0.5 * a),
    description: 'Pertumbuhan sangat cepat. Menyoroti pentingnya menambah jumlah partisi n untuk daerah dengan gradien tajam.'
  }
];

export const METHOD_LABELS: Record<string, { name: string; symbol: string; desc: string }> = {
  left: {
    name: 'Jumlah Kiri (Left Sum)',
    symbol: 'L_n',
    desc: 'Tinggi setiap persegi panjang diambil dari nilai fungsi di ujung kiri subinterval: x_i* = x_{i-1}.'
  },
  right: {
    name: 'Jumlah Kanan (Right Sum)',
    symbol: 'R_n',
    desc: 'Tinggi setiap persegi panjang diambil dari nilai fungsi di ujung kanan subinterval: x_i* = x_i.'
  },
  midpoint: {
    name: 'Titik Tengah (Midpoint Sum)',
    symbol: 'M_n',
    desc: 'Tinggi setiap persegi panjang diambil dari nilai tengah subinterval: x_i* = (x_{i-1} + x_i) / 2.'
  },
  trapezoid: {
    name: 'Aturan Trapesium (Trapezoid)',
    symbol: 'T_n',
    desc: 'Menggabungkan rata-rata jumlah kiri dan kanan: T_n = (L_n + R_n) / 2 untuk membentuk sisi miring.'
  },
  lower: {
    name: 'Jumlah Darboux Bawah (Minimum)',
    symbol: 's_n',
    desc: 'Tinggi diambil dari nilai minimum fungsi pada subinterval tersebut (selalu underestimate atau sama).'
  },
  upper: {
    name: 'Jumlah Darboux Atas (Maksimum)',
    symbol: 'S_n',
    desc: 'Tinggi diambil dari nilai maksimum fungsi pada subinterval tersebut (selalu overestimate atau sama).'
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Jika suatu interval [0, 6] dibagi menjadi n = 3 subinterval dengan lebar sama, berapakah lebar tiap partisi (Δx)?',
    context: 'Gunakan rumus dasar lebar partisi seragam: Δx = (b - a) / n.',
    options: ['Δx = 1', 'Δx = 2', 'Δx = 3', 'Δx = 1.5'],
    correctIndex: 1,
    explanation: 'Δx = (b - a) / n = (6 - 0) / 3 = 6 / 3 = 2. Jadi setiap persegi panjang berjarak 2 satuan di sumbu-x ([0,2], [2,4], [4,6]).',
    difficulty: 'Dasar'
  },
  {
    id: 'q2',
    question: 'Untuk fungsi yang selalu NAIK secara monoton pada selang [a, b], bagaimanakah hubungan antara Jumlah Kiri (Ln), Jumlah Kanan (Rn), dan Luas Integral Eksak (I)?',
    context: 'Perhatikan posisi persegi panjang terhadap kurva yang terus menanjak.',
    options: [
      'Ln > I > Rn',
      'Rn > I > Ln (Ln selalu underestimate, Rn overestimate)',
      'Ln = Rn = I',
      'Ln > Rn > I'
    ],
    correctIndex: 1,
    explanation: 'Karena f(x) selalu naik, nilai f di ujung kiri selalu lebih kecil dari nilai di dalam selang (sehingga Ln berada di bawah kurva / underestimate), sedangkan f di ujung kanan selalu lebih tinggi (Rn melewati kurva / overestimate). Maka Ln ≤ I ≤ Rn.',
    difficulty: 'Dasar'
  },
  {
    id: 'q3',
    question: 'Diberikan fungsi f(x) = x² pada interval [0, 2] dengan n = 2 partisi seragam. Berapakah hasil Jumlah Riemann KANAN (R₂)?',
    context: 'Δx = (2 - 0)/2 = 1. Titik ujung kanan adalah x₁ = 1 dan x₂ = 2.',
    options: ['R₂ = 2.0', 'R₂ = 4.0', 'R₂ = 5.0', 'R₂ = 2.67'],
    correctIndex: 2,
    explanation: 'Δx = 1. Titik kanan adalah x₁ = 1 dan x₂ = 2. Nilai f(1) = 1² = 1 dan f(2) = 2² = 4. Jumlah luas = f(1)·Δx + f(2)·Δx = (1 · 1) + (4 · 1) = 5. (Bandingkan dengan integral eksak: ∫₀² x² dx = 8/3 ≈ 2.67).',
    difficulty: 'Menengah'
  },
  {
    id: 'q4',
    question: 'Apa yang terjadi pada galat (error) antara Jumlah Riemann dan Luas Eksak ketika jumlah partisi n mendekati tak hingga (n → ∞)?',
    context: 'Konsep dasar kalkulus: limit jumlah Riemann.',
    options: [
      'Galat akan semakin besar tak berhingga',
      'Galat akan mendekati nol (0) dan aproksimasi menjadi eksak',
      'Galat akan bernilai konstan 1',
      'Galat berosilasi tanpa batas'
    ],
    correctIndex: 1,
    explanation: 'Menurut definisi integral tentu Riemann, ∫ₐᵇ f(x) dx = lim_{n→∞} ∑ f(xᵢ*) Δx. Saat n bertambah besar, lebar persegi panjang Δx mendekati 0, sehingga celah selisih luas menghilang dan galat mendekati 0.',
    difficulty: 'Dasar'
  },
  {
    id: 'q5',
    question: 'Mengapa metode Titik Tengah (Midpoint) umumnya memberikan galat yang jauh lebih kecil dibandingkan metode Ujung Kiri atau Ujung Kanan untuk nilai n yang sama?',
    context: 'Amati bagian persegi panjang di atas kurva dan bagian kosong di bawah kurva.',
    options: [
      'Karena titik tengah selalu menghasilkan bilangan bulat',
      'Karena bagian persegi yang melebihi kurva sebagian terkompensasi (membatalkan) bagian yang kurang',
      'Karena rumus titik tengah tidak melibatkan pembagian Δx',
      'Karena titik tengah hanya berlaku untuk fungsi linear'
    ],
    correctIndex: 1,
    explanation: 'Pada metode titik tengah, separuh persegi panjang berada sedikit di atas kurva dan separuh lagi berada sedikit di bawah kurva. Kesalahan kelebihan dan kekurangan saling membatalkan (canceling error), sehingga laju konvergensinya lebih cepat (orde O(1/n²) dibanding O(1/n)).',
    difficulty: 'Menengah'
  },
  {
    id: 'q6',
    question: 'Notasi integral Leibniz ∫ₐᵇ f(x) dx memiliki kemiripan simbolis yang disengaja dengan notasi sigma ∑ f(xᵢ*) Δx. Manakah pasangan korespondensi yang benar?',
    context: 'Simbol ∫ diciptakan oleh Leibniz berasal dari huruf "S" memanjang (Summa).',
    options: [
      'Simbol ∫ mewakili batas partisi, f(x) mewakili lebar, dan dx mewakili tinggi',
      'Simbol ∫ mewakili penjumlahan kontinu (lim ∑), f(x) mewakili tinggi, dan dx mewakili lebar infinitesimal (lim Δx)',
      'Simbol ∫ adalah turunan, f(x) adalah konstanta, dan dx adalah limit',
      'Simbol ∫ hanya singkatan tanpa hubungan dengan persegi panjang'
    ],
    correctIndex: 1,
    explanation: 'Gottfried Wilhelm Leibniz merancang notasi ∫ sebagai huruf "S" (Summa / Penjumlahan). f(x) adalah tinggi kurva pada titik x, dan dx adalah perubahan variabel x yang sangat kecil (lebar persegi panjang infinitesimal yang menggantikan Δx saat n → ∞).',
    difficulty: 'Tantangan'
  }
];

export const GUIDED_STAGES = [
  {
    stage: 1,
    title: '1. Mengapa Menggunakan Persegi Panjang?',
    subtitle: 'Intuisi Dasar Menghitung Luas Bidang Tak Beraturan',
    description: 'Kita dapat dengan mudah menghitung luas bangun datar sederhana seperti persegi panjang (L = p × l). Namun, bagaimana cara menghitung luas daerah di bawah kurva lengkung f(x)? Ide brilian Bernhard Riemann adalah memotong daerah lengkung tersebut menjadi deretan persegi-persegi panjang tegak yang lebarnya kecil!',
    suggestedParams: {
      functionId: 'parabola',
      a: 0,
      b: 3,
      n: 4,
      method: 'left' as const
    },
    keyTakeaway: 'Dengan n = 4 partisi, luas kurva dihampiri oleh 4 balok persegi panjang. Terlihat ada celah kosong yang cukup besar di bawah kurva.'
  },
  {
    stage: 2,
    title: '2. Pemilihan Titik Sampel (Kiri vs Kanan)',
    subtitle: 'Overestimate vs Underestimate',
    description: 'Tinggi setiap persegi panjang ditentukan oleh nilai fungsi f(x*) pada titik sampel di dalam subinterval. Jika memilih ujung kiri (Left Sum), kurva yang naik akan menghasilkan balok di bawah kurva (underestimate). Sebaliknya jika memilih ujung kanan (Right Sum), balok akan menjulang melewati kurva (overestimate).',
    suggestedParams: {
      functionId: 'parabola',
      a: 0,
      b: 3,
      n: 6,
      method: 'right' as const
    },
    keyTakeaway: 'Ujung Kiri memberi batas bawah, Ujung Kanan memberi batas atas. Nilai luas sejati pasti berada di antara keduanya!'
  },
  {
    stage: 3,
    title: '3. Titik Tengah & Keseimbangan Galat',
    subtitle: 'Akurasi Lebih Tinggi dengan Titik Tengah',
    description: 'Bagaimana jika kita mengambil tinggi persegi panjang tepat di tengah-tengah setiap subinterval? Sebagian persegi akan berada di atas kurva dan sebagian lagi di bawah kurva. Area lebih dan kurang ini saling menyeimbangkan satu sama lain, menghasilkan perkiraan yang jauh lebih presisi meski dengan n yang sedikit.',
    suggestedParams: {
      functionId: 'parabola',
      a: 0,
      b: 3,
      n: 6,
      method: 'midpoint' as const
    },
    keyTakeaway: 'Metode Titik Tengah (Midpoint) memotong kurva tepat di tengah balok, menghasilkan galat yang jauh lebih kecil.'
  },
  {
    stage: 4,
    title: '4. Menuju Tak Hingga: Definisi Integral Tentu',
    subtitle: 'Keajaiban Limit: Persegi Panjang Berubah Menjadi Luas Sejati',
    description: 'Apa yang terjadi jika kita memperbanyak jumlah potongan menjadi n = 30, 60, hingga n → ∞? Lebar setiap persegi panjang (Δx) menjadi sangat tipis mendekati nol. Celah kelebihan atau kekurangan menjadi lenyap, dan jumlah seluruh persegi panjang berkonvergensi persis sama dengan luas integral tentu!',
    suggestedParams: {
      functionId: 'parabola',
      a: 0,
      b: 3,
      n: 50,
      method: 'midpoint' as const
    },
    keyTakeaway: '∫ₐᵇ f(x) dx didefinisikan sebagai limit n → ∞ dari ∑ f(xᵢ*) Δx. Inilah jembatan utama antara aljabar diskrit dan kalkulus kontinu.'
  }
];

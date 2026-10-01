/**
 * Utility Kalkulasi Otomatis Status Gizi Balita & Ibu Hamil
 * Berdasarkan Standar Antropometri Anak Kemenkes RI / WHO Child Growth Standards.
 */

export interface NutritionResult {
  umur_bulan: number;
  status_bbu: 'Gizi Buruk' | 'Gizi Kurang' | 'Normal' | 'Risiko Gizi Lebih';
  status_tbu: 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi';
  status_bbtb: 'Gizi Buruk' | 'Gizi Kurang' | 'Normal' | 'Berisiko Gizi Lebih' | 'Obesitas';
}

/**
 * Menghitung umur balita dalam bulan dari tanggal lahir dan tanggal ukur.
 */
export function calculateAgeInMonths(birthDateInput: Date | string, measureDateInput: Date | string): number {
  const birthDate = new Date(birthDateInput);
  const measureDate = new Date(measureDateInput);

  let months = (measureDate.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += measureDate.getMonth();

  if (measureDate.getDate() < birthDate.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

interface GrowthRef {
  weightMedian: number;
  weightSD: number;
  heightMedian: number;
  heightSD: number;
}

function getChildReference(ageMonths: number, gender: 'L' | 'P'): GrowthRef {
  const age = Math.min(60, Math.max(0, ageMonths));
  const isMale = gender === 'L';

  let baseW = isMale ? 3.3 : 3.2;
  let baseH = isMale ? 49.9 : 49.1;

  if (age <= 12) {
    const w = baseW + age * (isMale ? 0.55 : 0.50);
    const h = baseH + age * (isMale ? 2.1 : 2.0);
    const wSd = 0.8 + age * 0.05;
    const hSd = 2.0 + age * 0.05;
    return { weightMedian: w, weightSD: wSd, heightMedian: h, heightSD: hSd };
  } else {
    const w = (isMale ? 9.6 : 8.9) + (age - 12) * (isMale ? 0.18 : 0.17);
    const h = (isMale ? 75.7 : 74.0) + (age - 12) * (isMale ? 0.65 : 0.63);
    const wSd = 1.4 + (age - 12) * 0.03;
    const hSd = 3.0 + (age - 12) * 0.03;
    return { weightMedian: w, weightSD: wSd, heightMedian: h, heightSD: hSd };
  }
}

function calculateZScore(value: number, median: number, sd: number): number {
  if (sd === 0) return 0;
  return (value - median) / sd;
}

export function classifyNutritionStatus(
  weightKg: number,
  heightCm: number,
  ageMonths: number,
  genderInput: string
): NutritionResult {
  const gender = (genderInput === 'P' ? 'P' : 'L') as 'L' | 'P';
  const ref = getChildReference(ageMonths, gender);

  const zBbu = calculateZScore(weightKg, ref.weightMedian, ref.weightSD);
  const zTbu = calculateZScore(heightCm, ref.heightMedian, ref.heightSD);

  const heightRatio = heightCm / ref.heightMedian;
  const idealWeightForHeight = ref.weightMedian * Math.pow(heightRatio, 2);
  const zBbtb = calculateZScore(weightKg, idealWeightForHeight, ref.weightSD);

  let status_bbu: NutritionResult['status_bbu'] = 'Normal';
  if (zBbu < -3) {
    status_bbu = 'Gizi Buruk';
  } else if (zBbu < -2) {
    status_bbu = 'Gizi Kurang';
  } else if (zBbu > 2) {
    status_bbu = 'Risiko Gizi Lebih';
  }

  let status_tbu: NutritionResult['status_tbu'] = 'Normal';
  if (zTbu < -3) {
    status_tbu = 'Sangat Pendek';
  } else if (zTbu < -2) {
    status_tbu = 'Pendek';
  } else if (zTbu > 3) {
    status_tbu = 'Tinggi';
  }

  let status_bbtb: NutritionResult['status_bbtb'] = 'Normal';
  if (zBbtb < -3) {
    status_bbtb = 'Gizi Buruk';
  } else if (zBbtb < -2) {
    status_bbtb = 'Gizi Kurang';
  } else if (zBbtb > 2) {
    status_bbtb = 'Obesitas';
  } else if (zBbtb > 1) {
    status_bbtb = 'Berisiko Gizi Lebih';
  }

  return {
    umur_bulan: ageMonths,
    status_bbu,
    status_tbu,
    status_bbtb,
  };
}

export function classifyBumilStatus(lilaCm: number): 'Normal' | 'KEK' {
  if (lilaCm < 23.5) {
    return 'KEK';
  }
  return 'Normal';
}

export function getStatusBadgeColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Normal':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Pendek':
    case 'Gizi Kurang':
    case 'Berisiko Gizi Lebih':
    case 'Risiko Gizi Lebih':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Sangat Pendek':
    case 'Gizi Buruk':
    case 'Obesitas':
    case 'KEK':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

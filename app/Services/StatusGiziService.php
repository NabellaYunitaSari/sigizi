<?php

namespace App\Services;

use DateTime;

class StatusGiziService
{
    public static function calculateAgeInMonths($birthDateInput, $measureDateInput): int
    {
        $birthDate = new DateTime($birthDateInput);
        $measureDate = new DateTime($measureDateInput);

        $months = ($measureDate->format('Y') - $birthDate->format('Y')) * 12;
        $months -= (int)$birthDate->format('m');
        $months += (int)$measureDate->format('m');

        if ((int)$measureDate->format('d') < (int)$birthDate->format('d')) {
            $months--;
        }

        return max(0, $months);
    }

    private static function getChildReference(int $ageMonths, string $gender): array
    {
        $age = min(60, max(0, $ageMonths));
        $isMale = ($gender === 'L');

        $baseW = $isMale ? 3.3 : 3.2;
        $baseH = $isMale ? 49.9 : 49.1;

        if ($age <= 12) {
            $w = $baseW + $age * ($isMale ? 0.55 : 0.50);
            $h = $baseH + $age * ($isMale ? 2.1 : 2.0);
            $wSd = 0.8 + $age * 0.05;
            $hSd = 2.0 + $age * 0.05;
        } else {
            $w = ($isMale ? 9.6 : 8.9) + ($age - 12) * ($isMale ? 0.18 : 0.17);
            $h = ($isMale ? 75.7 : 74.0) + ($age - 12) * ($isMale ? 0.65 : 0.63);
            $wSd = 1.4 + ($age - 12) * 0.03;
            $hSd = 3.0 + ($age - 12) * 0.03;
        }

        return [
            'weightMedian' => $w,
            'weightSD' => $wSd,
            'heightMedian' => $h,
            'heightSD' => $hSd,
        ];
    }

    private static function calculateZScore(float $value, float $median, float $sd): float
    {
        if ($sd == 0) return 0;
        return ($value - $median) / $sd;
    }

    public static function classifyNutritionStatus(float $weightKg, float $heightCm, int $ageMonths, string $genderInput): array
    {
        $gender = ($genderInput === 'P') ? 'P' : 'L';
        $ref = self::getChildReference($ageMonths, $gender);

        $zBbu = self::calculateZScore($weightKg, $ref['weightMedian'], $ref['weightSD']);
        $zTbu = self::calculateZScore($heightCm, $ref['heightMedian'], $ref['heightSD']);

        $heightRatio = $heightCm / $ref['heightMedian'];
        $idealWeightForHeight = $ref['weightMedian'] * pow($heightRatio, 2);
        $zBbtb = self::calculateZScore($weightKg, $idealWeightForHeight, $ref['weightSD']);

        // 1. BB/U
        $statusBbu = 'Normal';
        if ($zBbu < -3) {
            $statusBbu = 'Gizi Buruk';
        } elseif ($zBbu < -2) {
            $statusBbu = 'Gizi Kurang';
        } elseif ($zBbu > 2) {
            $statusBbu = 'Risiko Gizi Lebih';
        }

        // 2. TB/U
        $statusTbu = 'Normal';
        if ($zTbu < -3) {
            $statusTbu = 'Sangat Pendek';
        } elseif ($zTbu < -2) {
            $statusTbu = 'Pendek';
        } elseif ($zTbu > 3) {
            $statusTbu = 'Tinggi';
        }

        // 3. BB/TB
        $statusBbtb = 'Normal';
        if ($zBbtb < -3) {
            $statusBbtb = 'Gizi Buruk';
        } elseif ($zBbtb < -2) {
            $statusBbtb = 'Gizi Kurang';
        } elseif ($zBbtb > 2) {
            $statusBbtb = 'Obesitas';
        } elseif ($zBbtb > 1) {
            $statusBbtb = 'Berisiko Gizi Lebih';
        }

        return [
            'umur_bulan' => $ageMonths,
            'status_bbu' => $statusBbu,
            'status_tbu' => $statusTbu,
            'status_bbtb' => $statusBbtb,
        ];
    }

    public static function classifyBumilStatus(float $lilaCm): string
    {
        return ($lilaCm < 23.5) ? 'KEK' : 'Normal';
    }
}

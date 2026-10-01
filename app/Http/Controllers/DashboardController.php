<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\PelatihanPrePost;
use App\Models\Posyandu;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) return redirect()->route('login');

        $currentPosId = $user->id_pos;

        $query = Anak::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_ukur', 'desc')->take(1);
        }])->orderBy('nama_anak', 'asc');

        if ($user->role === 'kader' && $currentPosId) {
            $query->where('id_pos', $currentPosId);
        }

        $childrenInPos = $query->get();
        $totalAnak = $childrenInPos->count();

        $currentMonth = (int) date('n') - 1; // 0-indexed month
        $currentYear = (int) date('Y');

        $measuredThisMonthList = [];
        $unmeasuredThisMonthList = [];

        $nutritionDistribution = [
            'Normal' => 0,
            'Gizi Kurang / Pendek' => 0,
            'Gizi Buruk / Sangat Pendek' => 0,
            'Risiko Gizi Lebih / Obesitas' => 0,
        ];

        foreach ($childrenInPos as $child) {
            $latest = $child->pengukuran->first();
            if ($latest) {
                $mDate = new DateTime($latest->tanggal_ukur);
                $mMonth = (int) $mDate->format('n') - 1;
                $mYear = (int) $mDate->format('Y');

                if ($mMonth === $currentMonth && $mYear === $currentYear) {
                    $measuredThisMonthList[] = $child;

                    $bbu = $latest->status_bbu;
                    $tbu = $latest->status_tbu;

                    if ($bbu === 'Gizi Buruk' || $tbu === 'Sangat Pendek') {
                        $nutritionDistribution['Gizi Buruk / Sangat Pendek']++;
                    } elseif ($bbu === 'Gizi Kurang' || $tbu === 'Pendek') {
                        $nutritionDistribution['Gizi Kurang / Pendek']++;
                    } elseif ($bbu === 'Risiko Gizi Lebih' || $latest->status_bbtb === 'Obesitas') {
                        $nutritionDistribution['Risiko Gizi Lebih / Obesitas']++;
                    } else {
                        $nutritionDistribution['Normal']++;
                    }
                    continue;
                }
            }
            $unmeasuredThisMonthList[] = $child;
        }

        $countMeasured = count($measuredThisMonthList);
        $progressPercent = $totalAnak > 0 ? (int) round(($countMeasured / $totalAnak) * 100) : 0;

        $donutData = [];
        foreach ($nutritionDistribution as $name => $value) {
            $donutData[] = ['name' => $name, 'value' => $value];
        }

        $monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        $currentMonthName = $monthNames[$currentMonth] . ' ' . $currentYear;

        return Inertia::render('Dashboard/Index', [
            'childrenInPos' => $childrenInPos,
            'totalAnak' => $totalAnak,
            'countMeasured' => $countMeasured,
            'progressPercent' => $progressPercent,
            'unmeasuredThisMonthList' => $unmeasuredThisMonthList,
            'donutData' => $donutData,
            'currentMonthName' => $currentMonthName,
        ]);
    }

    public function village(Request $request)
    {
        $user = Auth::user();
        if (!$user || ($user->role !== 'admin' && $user->role !== 'koordinator')) {
            return redirect()->route('dashboard');
        }

        $posyandus = Posyandu::with([
            'anak.pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'desc')->take(1);
            },
            'ibuHamil.pengukuran' => function ($q) {
                $q->orderBy('tanggal_periksa', 'desc')->take(1);
            },
            'users'
        ])->orderBy('nama_pos', 'asc')->get();

        $trainingResults = PelatihanPrePost::with('user.posyandu')
            ->orderBy('skor_posttest', 'desc')
            ->get();

        $currentMonth = (int) date('n') - 1;
        $currentYear = (int) date('Y');

        $totalVillageAnak = 0;
        $totalVillageMeasured = 0;
        $totalVillageStunting = 0;
        $totalVillageBumil = 0;
        $totalVillageBumilKek = 0;

        $barChartData = [];
        foreach ($posyandus as $pos) {
            $totalAnakPos = $pos->anak->count();
            $totalVillageAnak += $totalAnakPos;

            $measuredPos = 0;
            $stuntingPos = 0;

            foreach ($pos->anak as $a) {
                $lastM = $a->pengukuran->first();
                if ($lastM) {
                    $mDate = new DateTime($lastM->tanggal_ukur);
                    $mMonth = (int) $mDate->format('n') - 1;
                    $mYear = (int) $mDate->format('Y');

                    if ($mMonth === $currentMonth && $mYear === $currentYear) {
                        $measuredPos++;
                    }
                    if ($lastM->status_tbu === 'Pendek' || $lastM->status_tbu === 'Sangat Pendek') {
                        $stuntingPos++;
                    }
                }
            }

            $totalVillageMeasured += $measuredPos;
            $totalVillageStunting += $stuntingPos;

            $totalBumilPos = $pos->ibuHamil->count();
            $totalVillageBumil += $totalBumilPos;
            $kekPos = 0;

            foreach ($pos->ibuHamil as $b) {
                $lastP = $b->pengukuran->first();
                if ($lastP && $lastP->status_gizi_bumil === 'KEK') {
                    $kekPos++;
                }
            }
            $totalVillageBumilKek += $kekPos;

            $barChartData[] = [
                'name' => $pos->nama_pos,
                'dusun' => $pos->dusun,
                'totalAnak' => $totalAnakPos,
                'sudahDiukur' => $measuredPos,
                'stunting' => $stuntingPos,
                'totalBumil' => $totalBumilPos,
                'bumilKek' => $kekPos,
            ];
        }

        $overallCoverage = $totalVillageAnak > 0 ? (int) round(($totalVillageMeasured / $totalVillageAnak) * 100) : 0;
        $stuntingRate = $totalVillageAnak > 0 ? (int) round(($totalVillageStunting / $totalVillageAnak) * 100) : 0;

        return Inertia::render('Dashboard/Desa', [
            'barChartData' => $barChartData,
            'trainingResults' => $trainingResults,
            'overallCoverage' => $overallCoverage,
            'stuntingRate' => $stuntingRate,
            'totalVillageAnak' => $totalVillageAnak,
            'totalVillageMeasured' => $totalVillageMeasured,
            'totalVillageStunting' => $totalVillageStunting,
            'totalVillageBumil' => $totalVillageBumil,
            'totalVillageBumilKek' => $totalVillageBumilKek,
        ]);
    }
}

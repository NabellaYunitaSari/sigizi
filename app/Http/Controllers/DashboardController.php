<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\IbuHamil;
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
        if (! $user) {
            return redirect()->route('login');
        }

        $currentPosId = $user->id_pos;

        $query = Anak::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'desc');
            },
            'imunisasi',
        ])->orderBy('nama_anak', 'asc');

        if ($user->role === 'kader' && $currentPosId) {
            $query->where('id_pos', $currentPosId);
        }

        $childrenInPos = $query->get();
        $totalAnak = $childrenInPos->count();

        // 1. Gender Composition (Donut Chart)
        $countL = $childrenInPos->where('jenis_kelamin', 'L')->count();
        $countP = $childrenInPos->where('jenis_kelamin', 'P')->count();
        $pctL = $totalAnak > 0 ? (float) round(($countL / $totalAnak) * 100, 1) : 0;
        $pctP = $totalAnak > 0 ? (float) round(($countP / $totalAnak) * 100, 1) : 0;

        $genderCompositionData = [
            [
                'name' => 'Laki-laki',
                'value' => $countL,
                'percentage' => $pctL,
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Perempuan',
                'value' => $countP,
                'percentage' => $pctP,
                'color' => '#ec4899',
            ],
        ];

        // 2. Growth Status Data (Bar Chart + Clickable List)
        $growthCategories = [
            'Normal' => [],
            'Berat Badan Kurang' => [],
            'Berat Badan Sangat Kurang' => [],
            'Tinggi Badan Kurang' => [],
            'Tinggi Badan Sangat Kurang' => [],
            'Terindikasi Stunting' => [],
        ];

        $currentMonth = (int) date('n') - 1; // 0-indexed month
        $currentYear = (int) date('Y');

        $measuredThisMonthList = [];
        $unmeasuredThisMonthList = [];

        foreach ($childrenInPos as $child) {
            $latest = $child->pengukuran->first();
            $childSummary = [
                'id' => $child->id,
                'nama_anak' => $child->nama_anak,
                'jenis_kelamin' => $child->jenis_kelamin,
                'nama_ibu' => $child->nama_ibu,
                'tanggal_lahir' => $child->tanggal_lahir,
                'umur_bulan' => $latest ? $latest->umur_bulan : 0,
                'berat_kg' => $latest ? $latest->berat_kg : 0,
                'tinggi_cm' => $latest ? $latest->tinggi_cm : 0,
                'status_bbu' => $latest ? $latest->status_bbu : 'Belum Diukur',
                'status_tbu' => $latest ? $latest->status_tbu : 'Belum Diukur',
                'status_bbtb' => $latest ? $latest->status_bbtb : 'Belum Diukur',
                'tanggal_ukur' => $latest ? $latest->tanggal_ukur : '-',
            ];

            if ($latest) {
                $mDate = new DateTime($latest->tanggal_ukur);
                $mMonth = (int) $mDate->format('n') - 1;
                $mYear = (int) $mDate->format('Y');

                if ($mMonth === $currentMonth && $mYear === $currentYear) {
                    $measuredThisMonthList[] = $child;
                } else {
                    $unmeasuredThisMonthList[] = $child;
                }

                $bbu = $latest->status_bbu;
                $tbu = $latest->status_tbu;

                $isNormal = true;

                if ($bbu === 'Gizi Kurang' || $bbu === 'Berat Badan Kurang') {
                    $growthCategories['Berat Badan Kurang'][] = $childSummary;
                    $isNormal = false;
                }
                if ($bbu === 'Gizi Buruk' || $bbu === 'Berat Badan Sangat Kurang') {
                    $growthCategories['Berat Badan Sangat Kurang'][] = $childSummary;
                    $isNormal = false;
                }
                if ($tbu === 'Pendek') {
                    $growthCategories['Tinggi Badan Kurang'][] = $childSummary;
                    $isNormal = false;
                }
                if ($tbu === 'Sangat Pendek') {
                    $growthCategories['Tinggi Badan Sangat Kurang'][] = $childSummary;
                    $isNormal = false;
                }
                if ($tbu === 'Pendek' || $tbu === 'Sangat Pendek') {
                    $growthCategories['Terindikasi Stunting'][] = $childSummary;
                    $isNormal = false;
                }

                if ($isNormal) {
                    $growthCategories['Normal'][] = $childSummary;
                }
            } else {
                $unmeasuredThisMonthList[] = $child;
            }
        }

        $growthStatusChartData = [
            [
                'name' => 'Normal',
                'fullName' => 'Normal',
                'count' => count($growthCategories['Normal']),
                'children' => $growthCategories['Normal'],
                'color' => '#10b981',
            ],
            [
                'name' => 'BB Kurang',
                'fullName' => 'Berat Badan Kurang',
                'count' => count($growthCategories['Berat Badan Kurang']),
                'children' => $growthCategories['Berat Badan Kurang'],
                'color' => '#f59e0b',
            ],
            [
                'name' => 'BB Sangat Kurang',
                'fullName' => 'Berat Badan Sangat Kurang',
                'count' => count($growthCategories['Berat Badan Sangat Kurang']),
                'children' => $growthCategories['Berat Badan Sangat Kurang'],
                'color' => '#ef4444',
            ],
            [
                'name' => 'TB Kurang',
                'fullName' => 'Tinggi Badan Kurang',
                'count' => count($growthCategories['Tinggi Badan Kurang']),
                'children' => $growthCategories['Tinggi Badan Kurang'],
                'color' => '#fb923c',
            ],
            [
                'name' => 'TB Sangat Kurang',
                'fullName' => 'Tinggi Badan Sangat Kurang',
                'count' => count($growthCategories['Tinggi Badan Sangat Kurang']),
                'children' => $growthCategories['Tinggi Badan Sangat Kurang'],
                'color' => '#dc2626',
            ],
            [
                'name' => 'Stunting',
                'fullName' => 'Terindikasi Stunting',
                'count' => count($growthCategories['Terindikasi Stunting']),
                'children' => $growthCategories['Terindikasi Stunting'],
                'color' => '#b91c1c',
            ],
        ];

        // 3. Immunization Coverage Data (Horizontal Bar Chart)
        $standardImmunizations = [
            'HB-0',
            'BCG',
            'Polio 1',
            'DPT 1',
            'Polio 2',
            'Campak / MR',
        ];

        $immunizationChartData = [];
        foreach ($standardImmunizations as $vax) {
            $receivedCount = 0;
            foreach ($childrenInPos as $c) {
                $hasVax = $c->imunisasi->contains(function ($im) use ($vax) {
                    return stripos($im->jenis_imunisasi, $vax) !== false || stripos($vax, $im->jenis_imunisasi) !== false;
                });
                if ($hasVax) {
                    $receivedCount++;
                }
            }
            $unreceivedCount = max(0, $totalAnak - $receivedCount);
            $percentage = $totalAnak > 0 ? (int) round(($receivedCount / $totalAnak) * 100) : 0;

            $immunizationChartData[] = [
                'name' => $vax,
                'sudah' => $receivedCount,
                'belum' => $unreceivedCount,
                'percentage' => $percentage,
                'total' => $totalAnak,
            ];
        }

        // 4. Pregnant Women Trimester Distribution Data (Bar Chart)
        $bumilQuery = IbuHamil::with(['pengukuran' => function ($q) {
            $q->orderBy('tanggal_periksa', 'desc');
        }]);

        if ($user->role === 'kader' && $currentPosId) {
            $bumilQuery->where('id_pos', $currentPosId);
        }

        $bumilList = $bumilQuery->get();

        $trimesterCounts = [
            'Trimester 1' => 0,
            'Trimester 2' => 0,
            'Trimester 3' => 0,
        ];

        foreach ($bumilList as $b) {
            $lastP = $b->pengukuran->first();
            $weeks = 0;
            if ($lastP && $lastP->usia_kehamilan_minggu > 0) {
                $weeks = $lastP->usia_kehamilan_minggu;
            } elseif ($b->hpht) {
                $hphtDate = new DateTime($b->hpht);
                $now = new DateTime;
                $diffDays = $hphtDate->diff($now)->days;
                $weeks = (int) floor($diffDays / 7);
            }

            if ($weeks <= 13) {
                $trimesterCounts['Trimester 1']++;
            } elseif ($weeks <= 27) {
                $trimesterCounts['Trimester 2']++;
            } else {
                $trimesterCounts['Trimester 3']++;
            }
        }

        $trimesterChartData = [
            [
                'name' => 'Trimester 1',
                'desc' => 'Usia Kehamilan 1-13 Minggu',
                'count' => $trimesterCounts['Trimester 1'],
                'color' => '#8b5cf6',
            ],
            [
                'name' => 'Trimester 2',
                'desc' => 'Usia Kehamilan 14-27 Minggu',
                'count' => $trimesterCounts['Trimester 2'],
                'color' => '#ec4899',
            ],
            [
                'name' => 'Trimester 3',
                'desc' => 'Usia Kehamilan 28+ Minggu',
                'count' => $trimesterCounts['Trimester 3'],
                'color' => '#f43f5e',
            ],
        ];

        $countMeasured = count($measuredThisMonthList);
        $progressPercent = $totalAnak > 0 ? (int) round(($countMeasured / $totalAnak) * 100) : 0;

        $monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];
        $currentMonthName = $monthNames[$currentMonth].' '.$currentYear;

        // 5. PMT Target lists for Kader Posyandu
        $pmtAnakList = [];
        $pmtBumilList = [];

        foreach ($childrenInPos as $a) {
            $lastM = $a->pengukuran->first();
            if ($lastM) {
                $needsPmt = false;
                $reasons = [];

                if (in_array($lastM->status_bbu, ['Gizi Kurang', 'Gizi Buruk'])) {
                    $needsPmt = true;
                    $reasons[] = 'BB/U: '.$lastM->status_bbu;
                }
                if (in_array($lastM->status_tbu, ['Pendek', 'Sangat Pendek'])) {
                    $needsPmt = true;
                    $reasons[] = 'Stunting ('.$lastM->status_tbu.')';
                }
                if (in_array($lastM->status_bbtb, ['Gizi Kurang', 'Gizi Buruk', 'Kurus', 'Sangat Kurus'])) {
                    $needsPmt = true;
                    $reasons[] = 'BB/TB: '.$lastM->status_bbtb;
                }

                if ($needsPmt) {
                    $pmtAnakList[] = [
                        'id' => $a->id,
                        'nik' => $a->nik,
                        'nama_anak' => $a->nama_anak,
                        'jenis_kelamin' => $a->jenis_kelamin,
                        'posyandu' => 'Pos '.($a->posyandu ? $a->posyandu->nama_pos : ''),
                        'dusun' => $a->posyandu ? $a->posyandu->dusun : '',
                        'nama_ibu' => $a->nama_ibu,
                        'no_hp_ortu' => $a->no_hp_ortu,
                        'umur_bulan' => $lastM->umur_bulan,
                        'berat_kg' => $lastM->berat_kg,
                        'tinggi_cm' => $lastM->tinggi_cm,
                        'status_bbu' => $lastM->status_bbu,
                        'status_tbu' => $lastM->status_tbu,
                        'status_bbtb' => $lastM->status_bbtb,
                        'alasan_pmt' => implode(' • ', array_unique($reasons)),
                        'rekomendasi' => 'PMT Pemulihan 90 Hari (Makanan Tambahan Protein Tinggi & Biskuit Balita)',
                    ];
                }
            }
        }

        foreach ($bumilList as $b) {
            $lastP = $b->pengukuran->first();
            if ($lastP && ($lastP->status_gizi_bumil === 'KEK' || $lastP->lila_cm < 23.5)) {
                $pmtBumilList[] = [
                    'id' => $b->id,
                    'nik' => $b->nik,
                    'nama' => $b->nama,
                    'posyandu' => 'Pos '.($b->posyandu ? $b->posyandu->nama_pos : ''),
                    'dusun' => $b->posyandu ? $b->posyandu->dusun : '',
                    'nama_suami' => $b->nama_suami,
                    'usia_kehamilan_minggu' => $lastP->usia_kehamilan_minggu,
                    'lila_cm' => $lastP->lila_cm,
                    'status_gizi_bumil' => $lastP->status_gizi_bumil ?: 'KEK',
                    'alasan_pmt' => 'Risiko KEK (LiLA '.$lastP->lila_cm.' cm < 23.5 cm)',
                    'rekomendasi' => 'PMT Ibu Hamil KEK (Biskuit MT Ibu Hamil & Suplemen Makanan)',
                ];
            }
        }

        return Inertia::render('Dashboard/Index', [
            'childrenInPos' => $childrenInPos,
            'bumilList' => $bumilList,
            'totalAnak' => $totalAnak,
            'countMeasured' => $countMeasured,
            'progressPercent' => $progressPercent,
            'unmeasuredThisMonthList' => $unmeasuredThisMonthList,
            'genderCompositionData' => $genderCompositionData,
            'growthStatusChartData' => $growthStatusChartData,
            'immunizationChartData' => $immunizationChartData,
            'trimesterChartData' => $trimesterChartData,
            'totalBumil' => $bumilList->count(),
            'currentMonthName' => $currentMonthName,
            'pmtAnakList' => $pmtAnakList,
            'pmtBumilList' => $pmtBumilList,
        ]);
    }

    public function village(Request $request)
    {
        $user = Auth::user();
        if (! $user || ($user->role !== 'admin' && $user->role !== 'koordinator')) {
            return redirect()->route('dashboard');
        }

        $posyandus = Posyandu::with([
            'anak.pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'desc')->take(1);
            },
            'ibuHamil.pengukuran' => function ($q) {
                $q->orderBy('tanggal_periksa', 'desc')->take(1);
            },
            'users',
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

        $pmtAnakList = [];
        $pmtBumilList = [];

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

                    // Check PMT requirement for Balita
                    $needsPmt = false;
                    $reasons = [];

                    if (in_array($lastM->status_bbu, ['Gizi Kurang', 'Gizi Buruk'])) {
                        $needsPmt = true;
                        $reasons[] = 'BB/U: '.$lastM->status_bbu;
                    }
                    if (in_array($lastM->status_tbu, ['Pendek', 'Sangat Pendek'])) {
                        $needsPmt = true;
                        $reasons[] = 'Stunting ('.$lastM->status_tbu.')';
                    }
                    if (in_array($lastM->status_bbtb, ['Gizi Kurang', 'Gizi Buruk', 'Kurus', 'Sangat Kurus'])) {
                        $needsPmt = true;
                        $reasons[] = 'BB/TB: '.$lastM->status_bbtb;
                    }

                    if ($needsPmt) {
                        $pmtAnakList[] = [
                            'id' => $a->id,
                            'nik' => $a->nik,
                            'nama_anak' => $a->nama_anak,
                            'jenis_kelamin' => $a->jenis_kelamin,
                            'posyandu' => 'Pos '.$pos->nama_pos,
                            'dusun' => $pos->dusun,
                            'nama_ibu' => $a->nama_ibu,
                            'no_hp_ortu' => $a->no_hp_ortu,
                            'umur_bulan' => $lastM->umur_bulan,
                            'berat_kg' => $lastM->berat_kg,
                            'tinggi_cm' => $lastM->tinggi_cm,
                            'status_bbu' => $lastM->status_bbu,
                            'status_tbu' => $lastM->status_tbu,
                            'status_bbtb' => $lastM->status_bbtb,
                            'alasan_pmt' => implode(' • ', array_unique($reasons)),
                            'rekomendasi' => 'PMT Pemulihan 90 Hari (Makanan Tambahan Protein Tinggi & Biskuit Balita)',
                        ];
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
                if ($lastP) {
                    if ($lastP->status_gizi_bumil === 'KEK' || $lastP->lila_cm < 23.5) {
                        $kekPos++;

                        $pmtBumilList[] = [
                            'id' => $b->id,
                            'nik' => $b->nik,
                            'nama' => $b->nama,
                            'posyandu' => 'Pos '.$pos->nama_pos,
                            'dusun' => $pos->dusun,
                            'nama_suami' => $b->nama_suami,
                            'usia_kehamilan_minggu' => $lastP->usia_kehamilan_minggu,
                            'lila_cm' => $lastP->lila_cm,
                            'status_gizi_bumil' => $lastP->status_gizi_bumil ?: 'KEK',
                            'alasan_pmt' => 'Risiko KEK (LiLA '.$lastP->lila_cm.' cm < 23.5 cm)',
                            'rekomendasi' => 'PMT Ibu Hamil KEK (Biskuit MT Ibu Hamil & Suplemen Makanan)',
                        ];
                    }
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
            'pmtAnakList' => $pmtAnakList,
            'pmtBumilList' => $pmtBumilList,
        ]);
    }
}

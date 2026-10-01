<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\IbuHamil;
use App\Models\Posyandu;
use Illuminate\Http\Request;

use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        $children = Anak::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_ukur', 'desc');
        }])->orderBy('nama_anak', 'asc')->get();

        $bumilList = IbuHamil::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_periksa', 'desc');
        }])->orderBy('nama', 'asc')->get();

        return Inertia::render('Laporan/Index', [
            'posyandus' => $posyandus,
            'children' => $children,
            'bumilList' => $bumilList,
        ]);
    }
}

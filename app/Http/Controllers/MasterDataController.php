<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\IbuHamil;
use App\Models\Posyandu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user || $user->role === 'kader') {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak. Master data hanya dapat dikelola oleh Koordinator dan Admin.');
        }

        $children = Anak::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'desc')->take(1);
            },
        ])->orderBy('nama_anak', 'asc')->get();

        $bumilList = IbuHamil::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_periksa', 'desc')->take(1);
            },
        ])->orderBy('nama', 'asc')->get();

        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        return Inertia::render('MasterData/Index', [
            'initialChildren' => $children,
            'initialBumilList' => $bumilList,
            'posyandus' => $posyandus,
        ]);
    }
}

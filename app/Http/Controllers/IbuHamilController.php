<?php

namespace App\Http\Controllers;

use App\Models\IbuHamil;
use App\Models\PengukuranBumil;
use App\Models\Posyandu;
use App\Services\StatusGiziService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class IbuHamilController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search', '');
        $posyanduId = $request->query('posyanduId', '');

        $query = IbuHamil::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_periksa', 'desc');
        }])->orderBy('nama', 'asc');

        if ($user && $user->role === 'kader' && $user->id_pos) {
            $query->where('id_pos', $user->id_pos);
        } elseif (! empty($posyanduId)) {
            $query->where('id_pos', $posyanduId);
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('nama_suami', 'like', "%{$search}%");
            });
        }

        $bumilList = $query->get();

        if ($request->wantsJson()) {
            return response()->json($bumilList);
        }

        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        return Inertia::render('IbuHamil/Index', [
            'initialBumilList' => $bumilList,
            'posyandus' => $posyandus,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = Auth::user();
        $bumil = IbuHamil::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_periksa', 'desc')->with('userInput');
        }])->find($id);

        if (! $bumil) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Ibu hamil tidak ditemukan'], 404);
            }

            return redirect()->route('ibu-hamil.index');
        }

        if ($user && $user->role === 'kader' && $bumil->id_pos !== $user->id_pos) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Akses ditolak'], 403);
            }

            return redirect()->route('ibu-hamil.index');
        }

        if ($request->wantsJson()) {
            return response()->json($bumil);
        }

        return Inertia::render('IbuHamil/Show', [
            'bumil' => $bumil,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user && $user->role === 'kader') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Akses ditolak. Hanya Koordinator dan Admin yang dapat menambahkan data sasaran.'], 403);
            }
            abort(403, 'Akses ditolak. Hanya Koordinator dan Admin yang dapat menambahkan data sasaran.');
        }

        $request->validate([
            'nik' => 'required|string|unique:ibu_hamils,nik',
            'nama' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'nama_suami' => 'required|string',
            'alamat' => 'required|string',
            'hpht' => 'required|date',
        ]);

        $idPos = $user && $user->role === 'kader' ? $user->id_pos : $request->input('id_pos');
        if (empty($idPos)) {
            $firstPos = Posyandu::first();
            $idPos = $firstPos ? $firstPos->id : null;
        }

        $bumil = IbuHamil::create([
            'id' => (string) Str::uuid(),
            'id_pos' => $idPos,
            'nik' => trim($request->nik),
            'nama' => trim($request->nama),
            'tanggal_lahir' => $request->tanggal_lahir,
            'nama_suami' => trim($request->nama_suami),
            'alamat' => trim($request->alamat),
            'kehamilan_ke' => (int) ($request->input('kehamilan_ke') ?? 1),
            'hpht' => $request->hpht,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $bumil], 201);
        }

        return redirect()->route('ibu-hamil.index');
    }

    public function update(Request $request, string $id)
    {
        $bumil = IbuHamil::findOrFail($id);

        $request->validate([
            'nik' => 'required|string|unique:ibu_hamils,nik,'.$id,
            'nama' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'nama_suami' => 'required|string',
            'alamat' => 'required|string',
            'hpht' => 'required|date',
        ]);

        $bumil->update([
            'nik' => trim($request->nik),
            'nama' => trim($request->nama),
            'tanggal_lahir' => $request->tanggal_lahir,
            'nama_suami' => trim($request->nama_suami),
            'alamat' => trim($request->alamat),
            'kehamilan_ke' => (int) ($request->input('kehamilan_ke') ?? $bumil->kehamilan_ke),
            'hpht' => $request->hpht,
            'id_pos' => $request->input('id_pos', $bumil->id_pos),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $bumil]);
        }

        return redirect()->back()->with('message', 'Data ibu hamil berhasil diperbarui');
    }

    public function inputPage(Request $request, string $id)
    {
        $user = Auth::user();
        $bumil = IbuHamil::with('posyandu')->find($id);

        if (! $bumil) {
            return redirect()->route('ibu-hamil.index');
        }

        if ($user && $user->role === 'kader' && $bumil->id_pos !== $user->id_pos) {
            return redirect()->route('ibu-hamil.index');
        }

        return Inertia::render('IbuHamil/Input', [
            'bumil' => $bumil,
        ]);
    }

    public function storePengukuran(Request $request, string $id)
    {
        $user = Auth::user();
        $bumil = IbuHamil::find($id);

        if (! $bumil) {
            return response()->json(['error' => 'Ibu hamil tidak ditemukan'], 404);
        }

        $request->validate([
            'tanggal_periksa' => 'required|date',
            'usia_kehamilan_minggu' => 'required|integer',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'lila_cm' => 'required|numeric',
            'tekanan_darah' => 'required|string',
        ]);

        $lilaCm = (float) $request->lila_cm;
        $statusKek = StatusGiziService::classifyBumilStatus($lilaCm);

        $pengukuran = PengukuranBumil::create([
            'id' => (string) Str::uuid(),
            'id_bumil' => $bumil->id,
            'id_user_input' => $user->id,
            'tanggal_periksa' => $request->tanggal_periksa,
            'usia_kehamilan_minggu' => (int) $request->usia_kehamilan_minggu,
            'berat_kg' => (float) $request->berat_kg,
            'tinggi_cm' => (float) $request->tinggi_cm,
            'lila_cm' => $lilaCm,
            'tekanan_darah' => trim($request->tekanan_darah),
            'status_gizi_bumil' => $statusKek,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->route('ibu-hamil.show', $bumil->id);
    }
}

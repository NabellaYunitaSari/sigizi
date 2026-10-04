<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\MasterStandard;
use App\Models\PengukuranAnak;
use App\Models\Posyandu;
use App\Services\StatusGiziService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AnakController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search', '');
        $posyanduId = $request->query('posyanduId', '');

        $query = Anak::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_ukur', 'desc');
        }])->orderBy('nama_anak', 'asc');

        if ($user && $user->role === 'kader' && $user->id_pos) {
            $query->where('id_pos', $user->id_pos);
        } elseif (! empty($posyanduId)) {
            $query->where('id_pos', $posyanduId);
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_anak', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('nama_ibu', 'like', "%{$search}%");
            });
        }

        $children = $query->get();

        if ($request->wantsJson()) {
            return response()->json($children);
        }

        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        return Inertia::render('Anak/Index', [
            'initialChildren' => $children,
            'posyandus' => $posyandus,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = Auth::user();
        $child = Anak::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'asc')->with('userInput');
            },
            'imunisasi' => function ($q) {
                $q->orderBy('tanggal', 'desc');
            },
            'vitamin' => function ($q) {
                $q->orderBy('tanggal', 'desc')->with('user');
            },
        ])->find($id);

        if (! $child) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Anak tidak ditemukan'], 404);
            }

            return redirect()->route('anak.index');
        }

        if ($user && $user->role === 'kader' && $child->id_pos !== $user->id_pos) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Akses ditolak'], 403);
            }

            return redirect()->route('anak.index');
        }

        if ($request->wantsJson()) {
            return response()->json($child);
        }

        return Inertia::render('Anak/Show', [
            'child' => $child,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'nik' => 'required|string|unique:anaks,nik',
            'nama_anak' => 'required|string',
            'jenis_kelamin' => 'required|string|in:L,P',
            'tanggal_lahir' => 'required|date',
            'nama_ibu' => 'required|string',
            'alamat' => 'required|string',
            'berat_lahir_gram' => 'required|numeric',
            'panjang_lahir_cm' => 'required|numeric',
        ]);

        $idPos = $user && $user->role === 'kader' ? $user->id_pos : $request->input('id_pos');
        if (empty($idPos)) {
            $firstPos = Posyandu::first();
            $idPos = $firstPos ? $firstPos->id : null;
        }

        $child = Anak::create([
            'id' => (string) Str::uuid(),
            'id_pos' => $idPos,
            'nik' => trim($request->nik),
            'no_kk' => $request->input('no_kk'),
            'nama_anak' => trim($request->nama_anak),
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'nama_ayah' => $request->input('nama_ayah'),
            'nama_ibu' => trim($request->nama_ibu),
            'no_hp_ortu' => $request->input('no_hp_ortu'),
            'alamat' => trim($request->alamat),
            'berat_lahir_gram' => (float) $request->berat_lahir_gram,
            'panjang_lahir_cm' => (float) $request->panjang_lahir_cm,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $child], 201);
        }

        return redirect()->route('anak.index');
    }

    public function inputPage(Request $request, string $id)
    {
        $user = Auth::user();
        $child = Anak::with('posyandu')->find($id);

        if (! $child) {
            return redirect()->route('anak.index');
        }

        if ($user && $user->role === 'kader' && $child->id_pos !== $user->id_pos) {
            return redirect()->route('anak.index');
        }

        // Find next unmeasured child in same posyandu for quick next button
        $currentMonth = (int) date('n') - 1;
        $currentYear = (int) date('Y');

        $allChildren = Anak::where('id_pos', $child->id_pos)
            ->where('id', '!=', $child->id)
            ->with(['pengukuran' => function ($q) {
                $q->orderBy('tanggal_ukur', 'desc')->take(1);
            }])
            ->get();

        $nextChild = null;
        foreach ($allChildren as $c) {
            $lastM = $c->pengukuran->first();
            if (! $lastM) {
                $nextChild = $c;
                break;
            }
            $mDate = new \DateTime($lastM->tanggal_ukur);
            if ((int) $mDate->format('n') - 1 !== $currentMonth || (int) $mDate->format('Y') !== $currentYear) {
                $nextChild = $c;
                break;
            }
        }

        return Inertia::render('Anak/Input', [
            'child' => $child,
            'nextChildId' => $nextChild ? $nextChild->id : null,
        ]);
    }

    public function storePengukuran(Request $request, string $id)
    {
        $user = Auth::user();
        $child = Anak::find($id);

        if (! $child) {
            return response()->json(['error' => 'Anak tidak ditemukan'], 404);
        }

        $request->validate([
            'tanggal_ukur' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'cara_ukur' => 'required|string|in:berdiri,telentang',
        ]);

        $tanggalUkur = $request->tanggal_ukur;
        $beratKg = (float) $request->berat_kg;
        $tinggiCm = (float) $request->tinggi_cm;
        $caraUkur = $request->cara_ukur;
        $lilaCm = $request->input('lila_cm') ? (float) $request->lila_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        $pengukuran = PengukuranAnak::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $child->id,
            'id_user_input' => $user->id,
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'lila_cm' => $lilaCm,
            'umur_bulan' => $nut['umur_bulan'],
            'status_bbu' => $nut['status_bbu'],
            'status_tbu' => $nut['status_tbu'],
            'status_bbtb' => $nut['status_bbtb'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->route('anak.show', $child->id);
    }

    public function pengukuranPage(Request $request)
    {
        $user = Auth::user();
        $queryChildren = Anak::with(['posyandu', 'pengukuran' => function ($q) {
            $q->orderBy('tanggal_ukur', 'desc')->take(1);
        }])->orderBy('nama_anak', 'asc');

        $queryPengukuran = PengukuranAnak::with(['anak.posyandu', 'userInput'])
            ->orderBy('tanggal_ukur', 'desc')
            ->orderBy('created_at', 'desc');

        if ($user && $user->role === 'kader' && $user->id_pos) {
            $queryChildren->where('id_pos', $user->id_pos);
            $queryPengukuran->whereHas('anak', function ($q) use ($user) {
                $q->where('id_pos', $user->id_pos);
            });
        }

        $childrenList = $queryChildren->get();
        $pengukuranList = $queryPengukuran->get();

        $masterOptions = MasterStandard::where('kategori', 'pengukuran')->get();

        return Inertia::render('Pengukuran/Index', [
            'childrenList' => $childrenList,
            'pengukuranList' => $pengukuranList,
            'masterOptions' => $masterOptions,
        ]);
    }

    public function storePengukuranDirect(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'tanggal_ukur' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'cara_ukur' => 'required|string|in:berdiri,telentang',
            'lila_cm' => 'nullable|numeric',
        ]);

        $child = Anak::findOrFail($request->id_anak);

        $tanggalUkur = $request->tanggal_ukur;
        $beratKg = (float) $request->berat_kg;
        $tinggiCm = (float) $request->tinggi_cm;
        $caraUkur = $request->cara_ukur;
        $lilaCm = $request->input('lila_cm') ? (float) $request->lila_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        $pengukuran = PengukuranAnak::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $child->id,
            'id_user_input' => $user->id,
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'lila_cm' => $lilaCm,
            'umur_bulan' => $nut['umur_bulan'],
            'status_bbu' => $nut['status_bbu'],
            'status_tbu' => $nut['status_tbu'],
            'status_bbtb' => $nut['status_bbtb'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->route('pengukuran.index')->with('message', 'Hasil pengukuran balita berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $child = Anak::findOrFail($id);

        $request->validate([
            'nik' => 'required|string|unique:anaks,nik,'.$id,
            'nama_anak' => 'required|string',
            'jenis_kelamin' => 'required|string|in:L,P',
            'tanggal_lahir' => 'required|date',
            'nama_ibu' => 'required|string',
            'alamat' => 'required|string',
            'berat_lahir_gram' => 'required|numeric',
            'panjang_lahir_cm' => 'required|numeric',
        ]);

        $child->update([
            'nik' => trim($request->nik),
            'no_kk' => $request->input('no_kk'),
            'nama_anak' => trim($request->nama_anak),
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'nama_ayah' => $request->input('nama_ayah'),
            'nama_ibu' => trim($request->nama_ibu),
            'no_hp_ortu' => $request->input('no_hp_ortu'),
            'alamat' => trim($request->alamat),
            'berat_lahir_gram' => (float) $request->berat_lahir_gram,
            'panjang_lahir_cm' => (float) $request->panjang_lahir_cm,
            'id_pos' => $request->input('id_pos', $child->id_pos),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $child]);
        }

        return redirect()->back()->with('message', 'Data balita berhasil diperbarui');
    }

    public function updatePengukuranDirect(Request $request, string $id)
    {
        $pengukuran = PengukuranAnak::findOrFail($id);

        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'tanggal_ukur' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'cara_ukur' => 'required|string|in:berdiri,telentang',
            'lila_cm' => 'nullable|numeric',
        ]);

        $child = Anak::findOrFail($request->id_anak);

        $tanggalUkur = $request->tanggal_ukur;
        $beratKg = (float) $request->berat_kg;
        $tinggiCm = (float) $request->tinggi_cm;
        $caraUkur = $request->cara_ukur;
        $lilaCm = $request->input('lila_cm') ? (float) $request->lila_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        $pengukuran->update([
            'id_anak' => $child->id,
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'lila_cm' => $lilaCm,
            'umur_bulan' => $nut['umur_bulan'],
            'status_bbu' => $nut['status_bbu'],
            'status_tbu' => $nut['status_tbu'],
            'status_bbtb' => $nut['status_bbtb'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran]);
        }

        return redirect()->back()->with('message', 'Data pengukuran berhasil diperbarui');
    }

    public function destroyPengukuran(string $id)
    {
        $pengukuran = PengukuranAnak::findOrFail($id);
        $pengukuran->delete();

        return redirect()->route('pengukuran.index')->with('message', 'Catatan pengukuran berhasil dihapus');
    }
}

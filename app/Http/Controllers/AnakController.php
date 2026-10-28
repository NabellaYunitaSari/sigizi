<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\MasterStandard;
use App\Models\OrangTua;
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
        $activeTab = $request->query('tab', 'balita'); // 'balita', 'prasekolah', 'orangtua', 'recycle'

        $query = Anak::with(['posyandu', 'orangTua', 'pengukuran' => function ($q) {
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

        // Data Recycle Bin (soft deleted children)
        $trashedChildren = [];
        if ($user && ($user->role === 'koordinator' || $user->role === 'admin')) {
            $trashedChildren = Anak::onlyTrashed()->with('posyandu')->orderBy('deleted_at', 'desc')->get();
        }

        // Data Orang Tua
        $parentsList = OrangTua::withCount('anaks')->orderBy('nama', 'asc')->get();

        $masterImunisasi = MasterStandard::where('kategori', 'imunisasi')->pluck('nama')->toArray();
        if (empty($masterImunisasi)) {
            $masterImunisasi = ['HB-0', 'BCG', 'Polio 1', 'DPT-HB-Hib 1', 'Polio 2', 'DPT-HB-Hib 2', 'Polio 3', 'DPT-HB-Hib 3', 'Polio 4', 'IPV', 'Campak / MR', 'DPT-HB-Hib Lanjutan', 'Campak / MR Lanjutan'];
        }

        $masterVitamin = MasterStandard::where('kategori', 'vitamin')->pluck('nama')->toArray();
        if (empty($masterVitamin)) {
            $masterVitamin = ['Vitamin A Biru (100.000 IU)', 'Vitamin A Merah (200.000 IU)'];
        }

        return Inertia::render('Anak/Index', [
            'initialChildren' => $children,
            'trashedChildren' => $trashedChildren,
            'parentsList' => $parentsList,
            'posyandus' => $posyandus,
            'masterImunisasi' => $masterImunisasi,
            'masterVitamin' => $masterVitamin,
            'activeTab' => $activeTab,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = Auth::user();
        $child = Anak::with([
            'posyandu',
            'orangTua',
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

    // ==========================================
    // PROFIL ANAK (Hanya Bidan & Admin)
    // ==========================================
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user && $user->role === 'kader') {
            $msg = 'Akses Ditolak: Hanya Bidan (Koordinator) atau Admin yang berwenang mendaftarkan Profil Anak.';
            if ($request->wantsJson()) {
                return response()->json(['error' => $msg], 403);
            }
            abort(403, $msg);
        }

        $request->validate([
            'nama_anak' => 'required|string|max:150',
            'jenis_kelamin' => 'required|string|in:L,P',
            'tanggal_lahir' => 'required|date',
            'nama_ibu' => 'required|string|max:150',
            'alamat' => 'required|string',
            'berat_lahir_gram' => 'required|numeric',
            'panjang_lahir_cm' => 'required|numeric',
        ]);

        $nikTidakTersedia = $request->boolean('nik_tidak_tersedia');
        $nik = trim((string) $request->nik);

        if (! $nikTidakTersedia && empty($nik)) {
            return back()->withErrors(['nik' => 'NIK wajib diisi jika belum dicentang "Belum Ada NIK"']);
        }

        if (! empty($nik)) {
            $existing = Anak::where('nik', $nik)->first();
            if ($existing) {
                return back()->withErrors(['nik' => 'NIK ini sudah terdaftar']);
            }
        } else {
            $nik = 'TEMP-ANAK-' . time() . '-' . rand(100, 999);
        }

        $idPos = $request->input('id_pos');
        if (empty($idPos)) {
            $firstPos = Posyandu::first();
            $idPos = $firstPos ? $firstPos->id : null;
        }

        // Simpan / sambungkan Orang Tua jika data orang tua diisi
        $idOrangTua = $request->input('id_orang_tua');
        if (empty($idOrangTua) && ! empty($request->input('nama_ibu'))) {
            $ortu = OrangTua::create([
                'id' => (string) Str::uuid(),
                'nama' => trim($request->nama_ibu),
                'nik' => $request->input('nik_ortu'),
                'no_hp' => $request->input('no_hp_ortu'),
                'alamat' => $request->input('alamat'),
                'rt' => $request->input('rt'),
                'rw' => $request->input('rw'),
            ]);
            $idOrangTua = $ortu->id;
        }

        $child = Anak::create([
            'id' => (string) Str::uuid(),
            'id_pos' => $idPos,
            'nik' => $nik,
            'nik_tidak_tersedia' => $nikTidakTersedia,
            'no_kk' => $request->input('no_kk'),
            'nama_anak' => trim($request->nama_anak),
            'anak_ke' => $request->input('anak_ke') ? (int) $request->input('anak_ke') : null,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'usia_kehamilan_lahir' => $request->input('usia_kehamilan_lahir') ? (int) $request->input('usia_kehamilan_lahir') : null,
            'nama_ayah' => $request->input('nama_ayah'),
            'nama_ibu' => trim($request->nama_ibu),
            'no_hp_ortu' => $request->input('no_hp_ortu'),
            'alamat' => trim($request->alamat),
            'rt' => $request->input('rt'),
            'rw' => $request->input('rw'),
            'berat_lahir_gram' => (float) $request->berat_lahir_gram,
            'panjang_lahir_cm' => (float) $request->panjang_lahir_cm,
            'lingkar_kepala_lahir' => $request->input('lingkar_kepala_lahir') ? (float) $request->input('lingkar_kepala_lahir') : null,
            'buku_kia' => $request->boolean('buku_kia', true),
            'buku_kia_bayi_kecil' => $request->boolean('buku_kia_bayi_kecil'),
            'mendapat_tatalaksana_bblr' => $request->boolean('mendapat_tatalaksana_bblr'),
            'imd' => $request->boolean('imd'),
            'id_orang_tua' => $idOrangTua,
            'paud' => $request->input('paud'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $child], 201);
        }

        return redirect()->route('anak.index')->with('message', 'Data balita berhasil didaftarkan');
    }

    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        if ($user && $user->role === 'kader') {
            $msg = 'Akses Ditolak: Hanya Bidan (Koordinator) atau Admin yang berwenang mengedit Profil Anak.';
            if ($request->wantsJson()) {
                return response()->json(['error' => $msg], 403);
            }
            abort(403, $msg);
        }

        $child = Anak::findOrFail($id);

        $request->validate([
            'nama_anak' => 'required|string|max:150',
            'jenis_kelamin' => 'required|string|in:L,P',
            'tanggal_lahir' => 'required|date',
            'nama_ibu' => 'required|string|max:150',
            'alamat' => 'required|string',
        ]);

        $nikTidakTersedia = $request->boolean('nik_tidak_tersedia');
        $nik = trim((string) $request->input('nik', $child->nik));

        $child->update([
            'nik' => $nik,
            'nik_tidak_tersedia' => $nikTidakTersedia,
            'no_kk' => $request->input('no_kk', $child->no_kk),
            'nama_anak' => trim($request->nama_anak),
            'anak_ke' => $request->input('anak_ke') ? (int) $request->input('anak_ke') : $child->anak_ke,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'usia_kehamilan_lahir' => $request->input('usia_kehamilan_lahir') ? (int) $request->input('usia_kehamilan_lahir') : $child->usia_kehamilan_lahir,
            'nama_ayah' => $request->input('nama_ayah', $child->nama_ayah),
            'nama_ibu' => trim($request->nama_ibu),
            'no_hp_ortu' => $request->input('no_hp_ortu', $child->no_hp_ortu),
            'alamat' => trim($request->alamat),
            'rt' => $request->input('rt', $child->rt),
            'rw' => $request->input('rw', $child->rw),
            'berat_lahir_gram' => $request->input('berat_lahir_gram') ? (float) $request->berat_lahir_gram : $child->berat_lahir_gram,
            'panjang_lahir_cm' => $request->input('panjang_lahir_cm') ? (float) $request->panjang_lahir_cm : $child->panjang_lahir_cm,
            'lingkar_kepala_lahir' => $request->input('lingkar_kepala_lahir') ? (float) $request->lingkar_kepala_lahir : $child->lingkar_kepala_lahir,
            'buku_kia' => $request->boolean('buku_kia', $child->buku_kia),
            'buku_kia_bayi_kecil' => $request->boolean('buku_kia_bayi_kecil', $child->buku_kia_bayi_kecil),
            'mendapat_tatalaksana_bblr' => $request->boolean('mendapat_tatalaksana_bblr', $child->mendapat_tatalaksana_bblr),
            'imd' => $request->boolean('imd', $child->imd),
            'id_orang_tua' => $request->input('id_orang_tua', $child->id_orang_tua),
            'paud' => $request->input('paud', $child->paud),
            'id_pos' => $request->input('id_pos', $child->id_pos),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $child]);
        }

        return redirect()->back()->with('message', 'Profil balita berhasil diperbarui');
    }

    public function destroy(Request $request, string $id)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Akses Ditolak: Hanya Bidan atau Admin yang dapat menghapus data profil anak.');
        }

        $child = Anak::findOrFail($id);
        $child->delete(); // Soft delete

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('anak.index')->with('message', 'Data balita dipindahkan ke Keranjang Sampah (Recycle)');
    }

    public function restore(Request $request, string $id)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Akses Ditolak: Hanya Bidan atau Admin yang dapat memulihkan data.');
        }

        $child = Anak::onlyTrashed()->findOrFail($id);
        $child->restore();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('message', 'Data balita berhasil dipulihkan');
    }

    // ==========================================
    // ORANG TUA CRUD (Hanya Bidan & Admin)
    // ==========================================
    public function storeOrangTua(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Hanya Bidan atau Admin yang berwenang mengelola data orang tua.');
        }

        $request->validate([
            'nama' => 'required|string|max:150',
        ]);

        $ortu = OrangTua::create([
            'id' => (string) Str::uuid(),
            'nama' => trim($request->nama),
            'nik' => $request->input('nik'),
            'no_hp' => $request->input('no_hp'),
            'alamat' => $request->input('alamat'),
            'rt' => $request->input('rt'),
            'rw' => $request->input('rw'),
        ]);

        return response()->json(['success' => true, 'data' => $ortu], 201);
    }

    public function updateOrangTua(Request $request, string $id)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Hanya Bidan atau Admin yang berwenang mengelola data orang tua.');
        }

        $ortu = OrangTua::findOrFail($id);
        $ortu->update($request->only(['nama', 'nik', 'no_hp', 'alamat', 'rt', 'rw']));

        return response()->json(['success' => true, 'data' => $ortu]);
    }

    public function destroyOrangTua(string $id)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Hanya Bidan atau Admin yang berwenang mengelola data orang tua.');
        }

        $ortu = OrangTua::findOrFail($id);
        $ortu->delete();

        return response()->json(['success' => true]);
    }

    // ==========================================
    // PENGUKURAN BALITA (Kader & Bidan BISA INPUT)
    // ==========================================
    public function inputPage(Request $request, string $id)
    {
        $child = Anak::with('posyandu')->find($id);

        if (! $child) {
            return redirect()->route('anak.index');
        }

        return Inertia::render('Anak/Input', [
            'child' => $child,
        ]);
    }

    public function storePengukuran(Request $request, string $id)
    {
        $user = Auth::user();
        $child = Anak::findOrFail($id);

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
        $lkCm = $request->input('lingkar_kepala_cm') ? (float) $request->lingkar_kepala_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        // Cari riwayat pengukuran sebelumnya untuk deteksi Naik Berat Badan (T/N)
        $prevMeasure = PengukuranAnak::where('id_anak', $child->id)
            ->where('tanggal_ukur', '<', $tanggalUkur)
            ->orderBy('tanggal_ukur', 'desc')
            ->first();

        $naikBb = $request->input('naik_berat_badan');
        $ketNaik = $request->input('keterangan_naik_bb');

        if (empty($naikBb)) {
            if (! $prevMeasure) {
                $naikBb = 'N';
                $ketNaik = 'TIDAK ADA PENIMBANGAN BULAN LALU';
            } elseif ($beratKg > $prevMeasure->berat_kg) {
                $naikBb = 'N';
                $ketNaik = 'ZSCORE NAIK';
            } else {
                $naikBb = 'T';
                $ketNaik = 'ZSCORE TIDAK NAIK';
            }
        }

        $pengukuran = PengukuranAnak::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $child->id,
            'id_user_input' => $user->id,
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'cara_ukur_berat' => $request->input('cara_ukur_berat', 'digital'),
            'lila_cm' => $lilaCm,
            'lingkar_kepala_cm' => $lkCm,
            'umur_bulan' => $ageMonths,
            'pitting_edema_bilateral' => $request->boolean('pitting_edema_bilateral'),
            'status_bbu' => $nut['bbu'],
            'zs_bbu' => $request->input('zs_bbu') ? (float) $request->zs_bbu : null,
            'status_tbu' => $nut['tbu'],
            'zs_tbu' => $request->input('zs_tbu') ? (float) $request->zs_tbu : null,
            'status_bbtb' => $nut['bbtb'],
            'zs_bbtb' => $request->input('zs_bbtb') ? (float) $request->zs_bbtb : null,
            'naik_berat_badan' => $naikBb,
            'keterangan_naik_bb' => $ketNaik,
            'kelas_balita' => $request->boolean('kelas_balita'),
            'menerima_mbg' => $request->boolean('menerima_mbg'),
            'vitamin_a' => $request->boolean('vitamin_a'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->route('anak.show', $child->id)->with('message', 'Pengukuran berhasil dicatat');
    }

    public function pengukuranPage(Request $request)
    {
        $user = Auth::user();
        $posyanduId = $request->query('posyanduId', '');

        $queryChildren = Anak::with('posyandu')->orderBy('nama_anak', 'asc');
        $queryPengukuran = PengukuranAnak::with(['anak.posyandu', 'userInput'])->orderBy('tanggal_ukur', 'desc');

        $queryBumil = \App\Models\IbuHamil::with('posyandu')->orderBy('nama', 'asc');
        $queryAnc = \App\Models\PengukuranBumil::with(['ibuHamil.posyandu', 'userInput'])->orderBy('tanggal_periksa', 'desc');
        $queryNifas = \App\Models\KunjunganNifas::with(['bumil.posyandu', 'userInput'])->orderBy('tanggal_kunjungan', 'desc');
        $queryMenyusui = \App\Models\PemantauanMenyusui::with(['bumil.posyandu', 'userInput'])->orderBy('tanggal_pemantauan', 'desc');

        if ($user && $user->role === 'kader' && $user->id_pos) {
            $queryChildren->where('id_pos', $user->id_pos);
            $queryPengukuran->whereHas('anak', function ($q) use ($user) {
                $q->where('id_pos', $user->id_pos);
            });
            $queryBumil->where('id_pos', $user->id_pos);
            $queryAnc->whereHas('ibuHamil', function ($q) use ($user) {
                $q->where('id_pos', $user->id_pos);
            });
            $queryNifas->whereHas('bumil', function ($q) use ($user) {
                $q->where('id_pos', $user->id_pos);
            });
            $queryMenyusui->whereHas('bumil', function ($q) use ($user) {
                $q->where('id_pos', $user->id_pos);
            });
        } elseif (! empty($posyanduId)) {
            $queryChildren->where('id_pos', $posyanduId);
            $queryPengukuran->whereHas('anak', function ($q) use ($posyanduId) {
                $q->where('id_pos', $posyanduId);
            });
            $queryBumil->where('id_pos', $posyanduId);
            $queryAnc->whereHas('ibuHamil', function ($q) use ($posyanduId) {
                $q->where('id_pos', $posyanduId);
            });
            $queryNifas->whereHas('bumil', function ($q) use ($posyanduId) {
                $q->where('id_pos', $posyanduId);
            });
            $queryMenyusui->whereHas('bumil', function ($q) use ($posyanduId) {
                $q->where('id_pos', $posyanduId);
            });
        }

        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        return Inertia::render('Pengukuran/Index', [
            'childrenList' => $queryChildren->get(),
            'pengukuranList' => $queryPengukuran->take(200)->get(),
            'bumilList' => $queryBumil->get(),
            'ancList' => $queryAnc->take(200)->get(),
            'nifasList' => $queryNifas->take(200)->get(),
            'menyusuiList' => $queryMenyusui->take(200)->get(),
            'posyandus' => $posyandus,
        ]);
    }

    public function storePengukuranDirect(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_anak' => 'required|uuid',
            'tanggal_ukur' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'cara_ukur' => 'required|string|in:berdiri,telentang',
        ]);

        $child = Anak::findOrFail($request->id_anak);

        $tanggalUkur = $request->tanggal_ukur;
        $beratKg = (float) $request->berat_kg;
        $tinggiCm = (float) $request->tinggi_cm;
        $caraUkur = $request->cara_ukur;
        $lilaCm = $request->input('lila_cm') ? (float) $request->lila_cm : null;
        $lkCm = $request->input('lingkar_kepala_cm') ? (float) $request->lingkar_kepala_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        $prevMeasure = PengukuranAnak::where('id_anak', $child->id)
            ->where('tanggal_ukur', '<', $tanggalUkur)
            ->orderBy('tanggal_ukur', 'desc')
            ->first();

        $naikBb = $request->input('naik_berat_badan');
        $ketNaik = $request->input('keterangan_naik_bb');

        if (empty($naikBb)) {
            if (! $prevMeasure) {
                $naikBb = 'N';
                $ketNaik = 'TIDAK ADA PENIMBANGAN BULAN LALU';
            } elseif ($beratKg > $prevMeasure->berat_kg) {
                $naikBb = 'N';
                $ketNaik = 'ZSCORE NAIK';
            } else {
                $naikBb = 'T';
                $ketNaik = 'ZSCORE TIDAK NAIK';
            }
        }

        $pengukuran = PengukuranAnak::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $child->id,
            'id_user_input' => $user->id,
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'cara_ukur_berat' => $request->input('cara_ukur_berat', 'digital'),
            'lila_cm' => $lilaCm,
            'lingkar_kepala_cm' => $lkCm,
            'umur_bulan' => $ageMonths,
            'pitting_edema_bilateral' => $request->boolean('pitting_edema_bilateral'),
            'status_bbu' => $nut['status_bbu'] ?? $nut['bbu'] ?? 'Normal',
            'zs_bbu' => $request->input('zs_bbu') ? (float) $request->zs_bbu : ($nut['zs_bbu'] ?? null),
            'status_tbu' => $nut['status_tbu'] ?? $nut['tbu'] ?? 'Normal',
            'zs_tbu' => $request->input('zs_tbu') ? (float) $request->zs_tbu : ($nut['zs_tbu'] ?? null),
            'status_bbtb' => $nut['status_bbtb'] ?? $nut['bbtb'] ?? 'Normal',
            'zs_bbtb' => $request->input('zs_bbtb') ? (float) $request->zs_bbtb : ($nut['zs_bbtb'] ?? null),
            'naik_berat_badan' => $naikBb,
            'keterangan_naik_bb' => $ketNaik,
            'kelas_balita' => $request->boolean('kelas_balita'),
            'menerima_mbg' => $request->boolean('menerima_mbg'),
            'vitamin_a' => $request->boolean('vitamin_a'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->back()->with('message', 'Pengukuran berhasil disimpan');
    }

    public function updatePengukuranDirect(Request $request, string $id)
    {
        $pengukuran = PengukuranAnak::findOrFail($id);

        $request->validate([
            'tanggal_ukur' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'cara_ukur' => 'required|string|in:berdiri,telentang',
        ]);

        $child = Anak::findOrFail($pengukuran->id_anak);
        $tanggalUkur = $request->tanggal_ukur;
        $beratKg = (float) $request->berat_kg;
        $tinggiCm = (float) $request->tinggi_cm;
        $caraUkur = $request->cara_ukur;
        $lilaCm = $request->input('lila_cm') ? (float) $request->lila_cm : null;
        $lkCm = $request->input('lingkar_kepala_cm') ? (float) $request->lingkar_kepala_cm : null;

        $ageMonths = StatusGiziService::calculateAgeInMonths($child->tanggal_lahir, $tanggalUkur);
        $nut = StatusGiziService::classifyNutritionStatus($beratKg, $tinggiCm, $ageMonths, $child->jenis_kelamin);

        $naikBb = $request->input('naik_berat_badan') ?: $pengukuran->naik_berat_badan;
        $ketNaik = $request->input('keterangan_naik_bb') ?: $pengukuran->keterangan_naik_bb;

        $pengukuran->update([
            'tanggal_ukur' => $tanggalUkur,
            'berat_kg' => $beratKg,
            'tinggi_cm' => $tinggiCm,
            'cara_ukur' => $caraUkur,
            'cara_ukur_berat' => $request->input('cara_ukur_berat', $pengukuran->cara_ukur_berat ?? 'digital'),
            'lila_cm' => $lilaCm,
            'lingkar_kepala_cm' => $lkCm,
            'umur_bulan' => $ageMonths,
            'pitting_edema_bilateral' => $request->boolean('pitting_edema_bilateral'),
            'status_bbu' => $nut['status_bbu'] ?? $nut['bbu'] ?? 'Normal',
            'zs_bbu' => $request->input('zs_bbu') ? (float) $request->zs_bbu : ($nut['zs_bbu'] ?? null),
            'status_tbu' => $nut['status_tbu'] ?? $nut['tbu'] ?? 'Normal',
            'zs_tbu' => $request->input('zs_tbu') ? (float) $request->zs_tbu : ($nut['zs_tbu'] ?? null),
            'status_bbtb' => $nut['status_bbtb'] ?? $nut['bbtb'] ?? 'Normal',
            'zs_bbtb' => $request->input('zs_bbtb') ? (float) $request->zs_bbtb : ($nut['zs_bbtb'] ?? null),
            'naik_berat_badan' => $naikBb,
            'keterangan_naik_bb' => $ketNaik,
            'kelas_balita' => $request->boolean('kelas_balita'),
            'menerima_mbg' => $request->boolean('menerima_mbg'),
            'vitamin_a' => $request->boolean('vitamin_a'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran]);
        }

        return redirect()->back()->with('message', 'Pengukuran berhasil diperbarui');
    }

    public function destroyPengukuran(string $id)
    {
        $p = PengukuranAnak::findOrFail($id);
        $p->delete();

        return response()->json(['success' => true]);
    }
}

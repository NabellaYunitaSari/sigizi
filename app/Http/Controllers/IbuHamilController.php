<?php

namespace App\Http\Controllers;

use App\Models\IbuHamil;
use App\Models\KunjunganNifas;
use App\Models\PemantauanMenyusui;
use App\Models\PengukuranBumil;
use App\Models\Posyandu;
use App\Services\StatusGiziService;
use DateTime;
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
        $statusTab = $request->query('tab', 'kehamilan'); // 'kehamilan', 'nifas', 'menyusui', 'profil'

        $query = IbuHamil::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_periksa', 'desc')->with('userInput');
            },
            'kunjunganNifas' => function ($q) {
                $q->orderBy('tanggal_kunjungan', 'desc')->with('userInput');
            },
            'pemantauanMenyusui' => function ($q) {
                $q->orderBy('tanggal_pemantauan', 'desc')->with('userInput');
            },
        ])->orderBy('nama', 'asc');

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
            'activeTab' => $statusTab,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = Auth::user();
        $bumil = IbuHamil::with([
            'posyandu',
            'pengukuran' => function ($q) {
                $q->orderBy('tanggal_periksa', 'desc')->with('userInput');
            },
            'kunjunganNifas' => function ($q) {
                $q->orderBy('tanggal_kunjungan', 'desc')->with('userInput');
            },
            'pemantauanMenyusui' => function ($q) {
                $q->orderBy('tanggal_pemantauan', 'desc')->with('userInput');
            },
        ])->find($id);

        if (! $bumil) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Data ibu tidak ditemukan'], 404);
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

    // Hanya Bidan (koordinator) dan Admin yang dapat menambahkan Profil Ibu
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user && $user->role === 'kader') {
            $msg = 'Akses Ditolak: Hanya Bidan (Koordinator) atau Admin yang berwenang mendaftarkan Profil Ibu.';
            if ($request->wantsJson()) {
                return response()->json(['error' => $msg], 403);
            }
            abort(403, $msg);
        }

        $request->validate([
            'nama' => 'required|string|max:150',
            'tanggal_lahir' => 'required|date',
            'nama_suami' => 'required|string|max:150',
            'alamat' => 'required|string',
            'hpht' => 'nullable|date',
        ]);

        $nikBelumTersedia = $request->boolean('nik_belum_tersedia');
        $nik = trim((string) $request->nik);

        if (! $nikBelumTersedia && empty($nik)) {
            return back()->withErrors(['nik' => 'NIK wajib diisi jika belum dicentang "Belum Ada NIK"']);
        }

        if (! empty($nik)) {
            $existing = IbuHamil::where('nik', $nik)->first();
            if ($existing) {
                return back()->withErrors(['nik' => 'NIK ini sudah terdaftar']);
            }
        } else {
            $nik = 'TEMP-IBU-' . time() . '-' . rand(100, 999);
        }

        // Hitung HPL otomatis dari HPHT jika tidak diisi manual (+280 hari)
        $hpl = $request->hpl;
        if (empty($hpl) && ! empty($request->hpht)) {
            $hDate = new DateTime($request->hpht);
            $hDate->modify('+280 days');
            $hpl = $hDate->format('Y-m-d');
        }

        // Hitung IMT awal jika BB dan TB ada
        $bbAwal = $request->input('bb_sebelum_hamil') ? (float) $request->input('bb_sebelum_hamil') : null;
        $tbAwal = $request->input('tb_sebelum_hamil') ? (float) $request->input('tb_sebelum_hamil') : null;
        $imtAwal = null;
        if ($bbAwal && $tbAwal && $tbAwal > 0) {
            $tbMeter = $tbAwal / 100;
            $imtAwal = round($bbAwal / ($tbMeter * $tbMeter), 2);
        }

        $lilaAwal = $request->input('lila_sebelum_hamil') ? (float) $request->input('lila_sebelum_hamil') : null;
        $statusKekAwal = $lilaAwal ? StatusGiziService::classifyBumilStatus($lilaAwal) : null;

        $idPos = $request->input('id_pos');
        if (empty($idPos)) {
            $firstPos = Posyandu::first();
            $idPos = $firstPos ? $firstPos->id : null;
        }

        $bumil = IbuHamil::create([
            'id' => (string) Str::uuid(),
            'id_pos' => $idPos,
            'nik' => $nik,
            'nik_belum_tersedia' => $nikBelumTersedia,
            'no_kk' => $request->input('no_kk'),
            'nama' => trim($request->nama),
            'tanggal_lahir' => $request->tanggal_lahir,
            'no_hp' => $request->input('no_hp'),
            'nama_suami' => trim($request->nama_suami),
            'nik_suami' => $request->input('nik_suami'),
            'no_hp_suami' => $request->input('no_hp_suami'),
            'alamat' => trim($request->alamat),
            'rt' => $request->input('rt'),
            'rw' => $request->input('rw'),
            'kehamilan_ke' => (int) ($request->input('kehamilan_ke') ?? 1),
            'jumlah_persalinan' => (int) ($request->input('jumlah_persalinan') ?? 0),
            'jumlah_keguguran' => (int) ($request->input('jumlah_keguguran') ?? 0),
            'hpht' => $request->hpht,
            'hpl' => $hpl,
            'bb_sebelum_hamil' => $bbAwal,
            'tb_sebelum_hamil' => $tbAwal,
            'lila_sebelum_hamil' => $lilaAwal,
            'imt_sebelum_hamil' => $imtAwal,
            'status_kek_awal' => $statusKekAwal,
            'jarak_kehamilan' => $request->input('jarak_kehamilan'),
            'golongan_darah' => $request->input('golongan_darah'),
            'lab_rhesus' => $request->input('lab_rhesus'),
            'riwayat_penyakit' => $request->input('riwayat_penyakit'),
            'riwayat_alergi' => $request->input('riwayat_alergi'),
            'buku_kia' => $request->boolean('buku_kia', true),
            'jaminan_kesehatan' => $request->input('jaminan_kesehatan'),
            'no_jaminan' => $request->input('no_jaminan'),
            'faskes_tk1' => $request->input('faskes_tk1'),
            'faskes_rujukan' => $request->input('faskes_rujukan'),
            'pendidikan' => $request->input('pendidikan'),
            'pekerjaan' => $request->input('pekerjaan'),
            'status_kehamilan' => $request->input('status_kehamilan', 'Hamil'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $bumil], 201);
        }

        return redirect()->route('ibu-hamil.index')->with('message', 'Profil ibu berhasil ditambahkan');
    }

    // Hanya Bidan & Admin yang dapat mengedit Profil Ibu
    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        if ($user && $user->role === 'kader') {
            $msg = 'Akses Ditolak: Hanya Bidan (Koordinator) atau Admin yang berwenang mengedit Profil Ibu.';
            if ($request->wantsJson()) {
                return response()->json(['error' => $msg], 403);
            }
            abort(403, $msg);
        }

        $bumil = IbuHamil::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:150',
            'tanggal_lahir' => 'required|date',
            'nama_suami' => 'required|string|max:150',
            'alamat' => 'required|string',
        ]);

        $nikBelumTersedia = $request->boolean('nik_belum_tersedia');
        $nik = trim((string) $request->input('nik', $bumil->nik));

        if (! $nikBelumTersedia && empty($nik)) {
            return back()->withErrors(['nik' => 'NIK wajib diisi']);
        }

        $bbAwal = $request->input('bb_sebelum_hamil') ? (float) $request->input('bb_sebelum_hamil') : $bumil->bb_sebelum_hamil;
        $tbAwal = $request->input('tb_sebelum_hamil') ? (float) $request->input('tb_sebelum_hamil') : $bumil->tb_sebelum_hamil;
        $imtAwal = $bumil->imt_sebelum_hamil;
        if ($bbAwal && $tbAwal && $tbAwal > 0) {
            $tbMeter = $tbAwal / 100;
            $imtAwal = round($bbAwal / ($tbMeter * $tbMeter), 2);
        }

        $lilaAwal = $request->input('lila_sebelum_hamil') ? (float) $request->input('lila_sebelum_hamil') : $bumil->lila_sebelum_hamil;
        $statusKekAwal = $lilaAwal ? StatusGiziService::classifyBumilStatus($lilaAwal) : $bumil->status_kek_awal;

        $bumil->update([
            'nik' => $nik,
            'nik_belum_tersedia' => $nikBelumTersedia,
            'no_kk' => $request->input('no_kk', $bumil->no_kk),
            'nama' => trim($request->nama),
            'tanggal_lahir' => $request->tanggal_lahir,
            'no_hp' => $request->input('no_hp', $bumil->no_hp),
            'nama_suami' => trim($request->nama_suami),
            'nik_suami' => $request->input('nik_suami', $bumil->nik_suami),
            'no_hp_suami' => $request->input('no_hp_suami', $bumil->no_hp_suami),
            'alamat' => trim($request->alamat),
            'rt' => $request->input('rt', $bumil->rt),
            'rw' => $request->input('rw', $bumil->rw),
            'id_pos' => $request->input('id_pos', $bumil->id_pos),
            'kehamilan_ke' => (int) ($request->input('kehamilan_ke') ?? $bumil->kehamilan_ke),
            'jumlah_persalinan' => (int) ($request->input('jumlah_persalinan') ?? $bumil->jumlah_persalinan),
            'jumlah_keguguran' => (int) ($request->input('jumlah_keguguran') ?? $bumil->jumlah_keguguran),
            'hpht' => $request->input('hpht', $bumil->hpht),
            'hpl' => $request->input('hpl', $bumil->hpl),
            'bb_sebelum_hamil' => $bbAwal,
            'tb_sebelum_hamil' => $tbAwal,
            'lila_sebelum_hamil' => $lilaAwal,
            'imt_sebelum_hamil' => $imtAwal,
            'status_kek_awal' => $statusKekAwal,
            'jarak_kehamilan' => $request->input('jarak_kehamilan', $bumil->jarak_kehamilan),
            'golongan_darah' => $request->input('golongan_darah', $bumil->golongan_darah),
            'lab_rhesus' => $request->input('lab_rhesus', $bumil->lab_rhesus),
            'riwayat_penyakit' => $request->input('riwayat_penyakit', $bumil->riwayat_penyakit),
            'riwayat_alergi' => $request->input('riwayat_alergi', $bumil->riwayat_alergi),
            'buku_kia' => $request->boolean('buku_kia', $bumil->buku_kia),
            'jaminan_kesehatan' => $request->input('jaminan_kesehatan', $bumil->jaminan_kesehatan),
            'no_jaminan' => $request->input('no_jaminan', $bumil->no_jaminan),
            'faskes_tk1' => $request->input('faskes_tk1', $bumil->faskes_tk1),
            'faskes_rujukan' => $request->input('faskes_rujukan', $bumil->faskes_rujukan),
            'pendidikan' => $request->input('pendidikan', $bumil->pendidikan),
            'pekerjaan' => $request->input('pekerjaan', $bumil->pekerjaan),
            'status_kehamilan' => $request->input('status_kehamilan', $bumil->status_kehamilan),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $bumil]);
        }

        return redirect()->back()->with('message', 'Profil ibu berhasil diperbarui');
    }

    public function destroy(Request $request, string $id)
    {
        $user = Auth::user();
        if ($user && $user->role === 'kader') {
            abort(403, 'Akses Ditolak: Hanya Bidan atau Admin yang dapat menghapus data ibu.');
        }

        $bumil = IbuHamil::findOrFail($id);
        $bumil->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('ibu-hamil.index')->with('message', 'Data ibu berhasil dihapus');
    }

    // ==========================================
    // 1. INPUT PEMERIKSAAN KEHAMILAN (ANC)
    // Bisa dilakukan oleh Kader maupun Bidan
    // ==========================================
    public function storePengukuran(Request $request, string $id)
    {
        $user = Auth::user();
        $bumil = IbuHamil::findOrFail($id);

        $request->validate([
            'tanggal_periksa' => 'required|date',
            'berat_kg' => 'required|numeric',
            'tinggi_cm' => 'required|numeric',
            'lila_cm' => 'required|numeric',
            'tekanan_darah' => 'required|string',
        ]);

        $lilaCm = (float) $request->lila_cm;
        $statusKek = StatusGiziService::classifyBumilStatus($lilaCm);

        // Hitung usia kehamilan otomatis jika tidak diisi manual
        $usiaMinggu = $request->input('usia_kehamilan_minggu');
        if (empty($usiaMinggu) && ! empty($bumil->hpht)) {
            $hphtDate = new DateTime($bumil->hpht);
            $periksaDate = new DateTime($request->tanggal_periksa);
            $diffDays = $hphtDate->diff($periksaDate)->days;
            $usiaMinggu = max(1, (int) round($diffDays / 7));
        } else {
            $usiaMinggu = (int) ($usiaMinggu ?? 16);
        }

        $pengukuran = PengukuranBumil::create([
            'id' => (string) Str::uuid(),
            'id_bumil' => $bumil->id,
            'id_user_input' => $user->id,
            'tanggal_periksa' => $request->tanggal_periksa,
            'faskes_anc' => $request->input('faskes_anc', 'Posyandu ' . ($bumil->posyandu ? $bumil->posyandu->nama_pos : '')),
            'tenaga_pemeriksa' => $request->input('tenaga_pemeriksa', 'Bidan'),
            'usia_kehamilan_minggu' => $usiaMinggu,
            'imunisasi_tt_terakhir' => $request->input('imunisasi_tt_terakhir'),
            'suplementasi' => $request->input('suplementasi'),
            'berat_kg' => (float) $request->berat_kg,
            'tinggi_cm' => (float) $request->tinggi_cm,
            'lila_cm' => $lilaCm,
            'tekanan_darah' => trim($request->tekanan_darah),
            'tfu_cm' => $request->input('tfu_cm') ? (float) $request->input('tfu_cm') : null,
            'presentasi_janin' => $request->input('presentasi_janin'),
            'djj' => $request->input('djj') ? (int) $request->input('djj') : null,
            'usg' => $request->boolean('usg'),
            'status_gizi_bumil' => $statusKek,
            'lab_hb' => $request->input('lab_hb') ? (float) $request->input('lab_hb') : null,
            'lab_protein_urine' => $request->input('lab_protein_urine'),
            'lab_gula_sewaktu' => $request->input('lab_gula_sewaktu') ? (float) $request->input('lab_gula_sewaktu') : null,
            'lab_hiv' => $request->input('lab_hiv'),
            'lab_hepatitis' => $request->input('lab_hepatitis'),
            'lab_sifilis' => $request->input('lab_sifilis'),
            'lab_lainnya' => $request->input('lab_lainnya'),
            'tatalaksana_anemia' => $request->boolean('tatalaksana_anemia'),
            'pre_eklampsia' => $request->boolean('pre_eklampsia'),
            'tatalaksana_pre_eklampsia' => $request->boolean('tatalaksana_pre_eklampsia'),
            'tatalaksana_kek' => $request->boolean('tatalaksana_kek'),
            'risiko_masalah_lain' => $request->input('risiko_masalah_lain'),
            'tatalaksana_risiko_lain' => $request->boolean('tatalaksana_risiko_lain'),
            'konseling' => $request->boolean('konseling'),
            'skrining_keswa' => $request->boolean('skrining_keswa'),
            'menerima_mbg' => $request->boolean('menerima_mbg'),
            'keluhan' => $request->input('keluhan'),
            'keterangan' => $request->input('keterangan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $pengukuran], 201);
        }

        return redirect()->back()->with('message', 'Pemeriksaan kehamilan berhasil disimpan');
    }

    // ==========================================
    // 2. INPUT KUNJUNGAN NIFAS (KF1-KF4)
    // Bisa dilakukan oleh Kader maupun Bidan
    // ==========================================
    public function storeNifas(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_bumil' => 'required|uuid',
            'tanggal_melahirkan' => 'required|date',
            'tanggal_kunjungan' => 'required|date',
            'jenis_tenaga' => 'required|string',
            'kesadaran' => 'required|string',
            'tekanan_darah' => 'required|string',
        ]);

        $bumil = IbuHamil::findOrFail($request->id_bumil);

        // Update status ibu menjadi nifas jika masih hamil
        if ($bumil->status_kehamilan === 'Hamil') {
            $bumil->update(['status_kehamilan' => 'Nifas']);
        }

        // Kalkulasi otomatis periode KF1 s.d KF4
        $tMelahirkan = new DateTime($request->tanggal_melahirkan);
        $tKunjungan = new DateTime($request->tanggal_kunjungan);
        $diffDays = $tMelahirkan->diff($tKunjungan)->days;

        if ($diffDays <= 2) {
            $periodeKf = 'KF1 (6 Jam - 2 Hari)';
        } elseif ($diffDays <= 7) {
            $periodeKf = 'KF2 (Hari ke 3 - 7)';
        } elseif ($diffDays <= 28) {
            $periodeKf = 'KF3 (Hari ke 8 - 28)';
        } else {
            $periodeKf = 'KF4 (Hari ke 29 - 42)';
        }

        $nifas = KunjunganNifas::create([
            'id' => (string) Str::uuid(),
            'id_bumil' => $bumil->id,
            'id_user_input' => $user->id,
            'tanggal_melahirkan' => $request->tanggal_melahirkan,
            'tanggal_kunjungan' => $request->tanggal_kunjungan,
            'periode_kf' => $periodeKf,
            'jenis_tenaga' => $request->jenis_tenaga,
            'kesadaran' => $request->kesadaran,
            'perdarahan_masif' => $request->boolean('perdarahan_masif'),
            'kejang' => $request->boolean('kejang'),
            'syok' => $request->boolean('syok'),
            'frekuensi_pernafasan' => $request->input('frekuensi_pernafasan', 'Normal (16-20x/menit)'),
            'frekuensi_nadi' => $request->input('frekuensi_nadi', 'Normal (60-100x/menit)'),
            'tekanan_darah' => $request->tekanan_darah,
            'suhu_tubuh' => $request->input('suhu_tubuh', 'Normal (36-37,5 C)'),
            'tanda_infeksi_perineum' => $request->boolean('tanda_infeksi_perineum'),
            'tanda_infeksi_jahitan_sc' => $request->boolean('tanda_infeksi_jahitan_sc'),
            'kondisi_payudara' => $request->input('kondisi_payudara', 'Normal'),
            'kontraksi_uterus' => $request->input('kontraksi_uterus', 'Baik'),
            'warna_lokhia' => $request->input('warna_lokhia', 'Merah'),
            'lokhia_berbau' => $request->boolean('lokhia_berbau'),
            'produksi_asi' => $request->input('produksi_asi', 'Ada, Banyak'),
            'buang_air_kecil' => $request->boolean('buang_air_kecil', true),
            'buang_air_besar' => $request->boolean('buang_air_besar', true),
            'konseling_perawatan_bbl' => $request->input('konseling_perawatan_bbl', 'Lengkap'),
            'mood' => $request->input('mood', 'Tidak Depresif'),
            'wajah_bengkak' => $request->boolean('wajah_bengkak'),
            'kaki_bengkak' => $request->boolean('kaki_bengkak'),
            'tangan_bengkak' => $request->boolean('tangan_bengkak'),
            'diberikan_ttd' => $request->boolean('diberikan_ttd'),
            'diberikan_mms' => $request->boolean('diberikan_mms'),
            'diberikan_vit_a' => $request->boolean('diberikan_vit_a'),
            'dicatat_buku_kia' => $request->boolean('dicatat_buku_kia', true),
            'terapi_tindakan' => $request->boolean('terapi_tindakan'),
            'dirujuk' => $request->boolean('dirujuk'),
            'tempat' => $request->input('tempat', 'Puskesmas Sukomalo'),
            'keterangan' => $request->input('keterangan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $nifas], 201);
        }

        return redirect()->back()->with('message', 'Data kunjungan nifas berhasil dicatat');
    }

    public function destroyNifas(string $id)
    {
        $nifas = KunjunganNifas::findOrFail($id);
        $nifas->delete();

        return response()->json(['success' => true]);
    }

    // ==========================================
    // 3. INPUT PEMANTAUAN MENYUSUI (ASI)
    // Bisa dilakukan oleh Kader maupun Bidan
    // ==========================================
    public function storeMenyusui(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_bumil' => 'required|uuid',
            'tanggal_pemantauan' => 'required|date',
            'status_asi' => 'required|string',
            'produksi_asi' => 'required|string',
        ]);

        $bumil = IbuHamil::findOrFail($request->id_bumil);

        $monitoring = PemantauanMenyusui::create([
            'id' => (string) Str::uuid(),
            'id_bumil' => $bumil->id,
            'id_user_input' => $user->id,
            'tanggal_pemantauan' => $request->tanggal_pemantauan,
            'status_asi' => $request->status_asi,
            'produksi_asi' => $request->produksi_asi,
            'masalah_menyusui' => $request->input('masalah_menyusui'),
            'konseling_asi' => $request->boolean('konseling_asi', true),
            'asi_eksklusif' => $request->boolean('asi_eksklusif', true),
            'keterangan' => $request->input('keterangan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $monitoring], 201);
        }

        return redirect()->back()->with('message', 'Pemantauan menyusui berhasil dicatat');
    }

    public function updateMenyusui(Request $request, string $id)
    {
        $m = PemantauanMenyusui::findOrFail($id);
        $request->validate([
            'tanggal_pemantauan' => 'required|date',
            'status_asi' => 'required|string',
            'produksi_asi' => 'required|string',
        ]);

        $m->update([
            'tanggal_pemantauan' => $request->tanggal_pemantauan,
            'status_asi' => $request->status_asi,
            'produksi_asi' => $request->produksi_asi,
            'masalah_menyusui' => $request->input('masalah_menyusui'),
            'konseling_asi' => $request->boolean('konseling_asi', true),
            'asi_eksklusif' => $request->boolean('asi_eksklusif', true),
            'keterangan' => $request->input('keterangan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $m]);
        }

        return redirect()->back()->with('message', 'Pemantauan menyusui berhasil diperbarui');
    }

    public function destroyMenyusui(string $id)
    {
        $m = PemantauanMenyusui::findOrFail($id);
        $m->delete();

        return response()->json(['success' => true]);
    }

    public function updatePengukuranDirect(Request $request, string $id)
    {
        $p = PengukuranBumil::findOrFail($id);
        $request->validate([
            'tanggal_periksa' => 'required|date',
            'berat_kg' => 'required|numeric',
            'lila_cm' => 'required|numeric',
            'tekanan_darah' => 'required|string',
        ]);

        $lilaCm = (float) $request->lila_cm;
        $statusKek = StatusGiziService::classifyBumilStatus($lilaCm);

        $p->update([
            'tanggal_periksa' => $request->tanggal_periksa,
            'faskes_anc' => $request->input('faskes_anc', $p->faskes_anc),
            'tenaga_pemeriksa' => $request->input('tenaga_pemeriksa', $p->tenaga_pemeriksa),
            'usia_kehamilan_minggu' => $request->input('usia_kehamilan_minggu') ? (int) $request->usia_kehamilan_minggu : $p->usia_kehamilan_minggu,
            'imunisasi_tt_terakhir' => $request->input('imunisasi_tt_terakhir', $p->imunisasi_tt_terakhir),
            'suplementasi' => $request->input('suplementasi', $p->suplementasi),
            'berat_kg' => (float) $request->berat_kg,
            'tinggi_cm' => $request->input('tinggi_cm') ? (float) $request->tinggi_cm : $p->tinggi_cm,
            'lila_cm' => $lilaCm,
            'tekanan_darah' => trim($request->tekanan_darah),
            'tfu_cm' => $request->input('tfu_cm') ? (float) $request->tfu_cm : null,
            'presentasi_janin' => $request->input('presentasi_janin', $p->presentasi_janin),
            'djj' => $request->input('djj') ? (int) $request->djj : null,
            'usg' => $request->boolean('usg', $p->usg),
            'status_gizi_bumil' => $statusKek,
            'lab_hb' => $request->input('lab_hb') ? (float) $request->lab_hb : null,
            'lab_protein_urine' => $request->input('lab_protein_urine'),
            'lab_gula_sewaktu' => $request->input('lab_gula_sewaktu') ? (float) $request->lab_gula_sewaktu : null,
            'lab_hiv' => $request->input('lab_hiv'),
            'lab_hepatitis' => $request->input('lab_hepatitis'),
            'lab_sifilis' => $request->input('lab_sifilis'),
            'lab_lainnya' => $request->input('lab_lainnya'),
            'tatalaksana_anemia' => $request->boolean('tatalaksana_anemia'),
            'pre_eklampsia' => $request->boolean('pre_eklampsia'),
            'tatalaksana_pre_eklampsia' => $request->boolean('tatalaksana_pre_eklampsia'),
            'tatalaksana_kek' => $request->boolean('tatalaksana_kek'),
            'risiko_masalah_lain' => $request->input('risiko_masalah_lain'),
            'tatalaksana_risiko_lain' => $request->boolean('tatalaksana_risiko_lain'),
            'konseling' => $request->boolean('konseling'),
            'skrining_keswa' => $request->boolean('skrining_keswa'),
            'menerima_mbg' => $request->boolean('menerima_mbg'),
            'keluhan' => $request->input('keluhan'),
            'keterangan' => $request->input('keterangan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $p]);
        }

        return redirect()->back()->with('message', 'Pemeriksaan kehamilan berhasil diperbarui');
    }

    public function destroyPengukuranDirect(string $id)
    {
        $p = PengukuranBumil::findOrFail($id);
        $p->delete();

        return response()->json(['success' => true]);
    }

    public function updateNifas(Request $request, string $id)
    {
        $nifas = KunjunganNifas::findOrFail($id);
        $request->validate([
            'tanggal_melahirkan' => 'required|date',
            'tanggal_kunjungan' => 'required|date',
            'jenis_tenaga' => 'required|string',
            'kesadaran' => 'required|string',
            'tekanan_darah' => 'required|string',
        ]);

        $nifas->update([
            'tanggal_melahirkan' => $request->tanggal_melahirkan,
            'tanggal_kunjungan' => $request->tanggal_kunjungan,
            'periode_kf' => $request->input('periode_kf', $nifas->periode_kf),
            'jenis_tenaga' => $request->jenis_tenaga,
            'kesadaran' => $request->kesadaran,
            'perdarahan_masif' => $request->boolean('perdarahan_masif'),
            'kejang' => $request->boolean('kejang'),
            'syok' => $request->boolean('syok'),
            'frekuensi_pernafasan' => $request->input('frekuensi_pernafasan', $nifas->frekuensi_pernafasan),
            'tekanan_darah' => trim($request->tekanan_darah),
            'suhu_tubuh' => $request->input('suhu_tubuh', $nifas->suhu_tubuh),
            'kondisi_payudara' => $request->input('kondisi_payudara', $nifas->kondisi_payudara),
            'kontraksi_uterus' => $request->input('kontraksi_uterus', $nifas->kontraksi_uterus),
            'warna_lokhia' => $request->input('warna_lokhia', $nifas->warna_lokhia),
            'bau_lokhia' => $request->input('bau_lokhia', $nifas->bau_lokhia),
            'perineum' => $request->input('perineum', $nifas->perineum),
            'produksi_asi' => $request->input('produksi_asi', $nifas->produksi_asi),
            'vitamin_a_nifas' => $request->boolean('vitamin_a_nifas', $nifas->vitamin_a_nifas),
            'rencana_kb' => $request->input('rencana_kb', $nifas->rencana_kb),
            'keluhan' => $request->input('keluhan'),
            'tindakan' => $request->input('tindakan'),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $nifas]);
        }

        return redirect()->back()->with('message', 'Data kunjungan nifas berhasil diperbarui');
    }
}

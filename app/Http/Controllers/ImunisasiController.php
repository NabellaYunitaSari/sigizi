<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\Imunisasi;
use App\Models\MasterStandard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ImunisasiController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login');
        }

        $currentPosId = $user->id_pos;

        $anakQuery = Anak::orderBy('nama_anak', 'asc');
        if ($user->role === 'kader' && $currentPosId) {
            $anakQuery->where('id_pos', $currentPosId);
        }
        $childrenList = $anakQuery->get(['id', 'nama_anak', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'nama_ibu', 'id_pos']);

        $imunisasiQuery = Imunisasi::with(['anak.posyandu'])->orderBy('tanggal', 'desc');

        if ($user->role === 'kader' && $currentPosId) {
            $imunisasiQuery->whereHas('anak', function ($q) use ($currentPosId) {
                $q->where('id_pos', $currentPosId);
            });
        }

        $imunisasiList = $imunisasiQuery->get();
        $masterOptions = MasterStandard::where('kategori', 'imunisasi')->pluck('nama')->toArray();

        return Inertia::render('Imunisasi/Index', [
            'imunisasiList' => $imunisasiList,
            'childrenList' => $childrenList,
            'masterOptions' => $masterOptions,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'jenis_imunisasi' => 'required|string|max:255',
            'tanggal' => 'required|date',
        ]);

        Imunisasi::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $request->id_anak,
            'jenis_imunisasi' => $request->jenis_imunisasi,
            'tanggal' => $request->tanggal,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Pencatatan imunisasi berhasil disimpan']);
        }

        return redirect()->back()->with('message', 'Pencatatan imunisasi berhasil disimpan');
    }

    public function update(Request $request, $id)
    {
        $imunisasi = Imunisasi::findOrFail($id);

        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'jenis_imunisasi' => 'required|string|max:255',
            'tanggal' => 'required|date',
        ]);

        $imunisasi->update([
            'id_anak' => $request->id_anak,
            'jenis_imunisasi' => $request->jenis_imunisasi,
            'tanggal' => $request->tanggal,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Data imunisasi berhasil diperbarui']);
        }

        return redirect()->back()->with('message', 'Data imunisasi berhasil diperbarui');
    }

    public function destroy($id)
    {
        $imunisasi = Imunisasi::findOrFail($id);
        $imunisasi->delete();

        return redirect()->back()->with('message', 'Data imunisasi berhasil dihapus');
    }
}

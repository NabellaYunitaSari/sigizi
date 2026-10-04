<?php

namespace App\Http\Controllers;

use App\Models\Anak;
use App\Models\MasterStandard;
use App\Models\Vitamin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VitaminController extends Controller
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

        $vitaminQuery = Vitamin::with(['anak.posyandu', 'user'])->orderBy('tanggal', 'desc');

        if ($user->role === 'kader' && $currentPosId) {
            $vitaminQuery->whereHas('anak', function ($q) use ($currentPosId) {
                $q->where('id_pos', $currentPosId);
            });
        }

        $vitaminList = $vitaminQuery->get();
        $masterOptions = MasterStandard::where('kategori', 'vitamin')->pluck('nama')->toArray();

        return Inertia::render('Vitamin/Index', [
            'vitaminList' => $vitaminList,
            'childrenList' => $childrenList,
            'masterOptions' => $masterOptions,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'jenis_vitamin' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        Vitamin::create([
            'id' => (string) Str::uuid(),
            'id_anak' => $request->id_anak,
            'id_user_input' => $user ? $user->id : null,
            'jenis_vitamin' => $request->jenis_vitamin,
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Pencatatan vitamin berhasil disimpan']);
        }

        return redirect()->back()->with('message', 'Pencatatan vitamin berhasil disimpan');
    }

    public function update(Request $request, $id)
    {
        $vitamin = Vitamin::findOrFail($id);

        $request->validate([
            'id_anak' => 'required|exists:anaks,id',
            'jenis_vitamin' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        $vitamin->update([
            'id_anak' => $request->id_anak,
            'jenis_vitamin' => $request->jenis_vitamin,
            'tanggal' => $request->tanggal,
            'keterangan' => $request->keterangan,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Data vitamin berhasil diperbarui']);
        }

        return redirect()->back()->with('message', 'Data vitamin berhasil diperbarui');
    }

    public function destroy($id)
    {
        $vitamin = Vitamin::findOrFail($id);
        $vitamin->delete();

        return redirect()->back()->with('message', 'Data pemberian vitamin berhasil dihapus');
    }
}

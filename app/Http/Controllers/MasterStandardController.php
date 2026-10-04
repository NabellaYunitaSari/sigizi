<?php

namespace App\Http\Controllers;

use App\Models\MasterStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterStandardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->role !== 'koordinator' && $user->role !== 'admin') {
            return redirect()->route('dashboard')->with('error', 'Akses khusus untuk Koordinator dan Administrator');
        }

        $standards = MasterStandard::with('creator:id,nama,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('KelolaStandar/Index', [
            'standards' => $standards,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'koordinator' && $user->role !== 'admin') {
            return response()->json(['error' => 'Akses tidak diizinkan.'], 403);
        }

        $request->validate([
            'kategori' => 'required|in:imunisasi,vitamin,pengukuran',
            'nama' => 'required|string|max:255',
            'satuan_atau_dosis' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        MasterStandard::create([
            'kategori' => $request->kategori,
            'nama' => $request->nama,
            'satuan_atau_dosis' => $request->satuan_atau_dosis,
            'keterangan' => $request->keterangan,
            'created_by' => $user->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Standar baru berhasil ditambahkan!']);
        }

        return redirect()->back()->with('success', 'Standar baru berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        if ($user->role !== 'koordinator' && $user->role !== 'admin') {
            return response()->json(['error' => 'Akses tidak diizinkan.'], 403);
        }

        $request->validate([
            'kategori' => 'required|in:imunisasi,vitamin,pengukuran',
            'nama' => 'required|string|max:255',
            'satuan_atau_dosis' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $standard = MasterStandard::findOrFail($id);
        $standard->update([
            'kategori' => $request->kategori,
            'nama' => $request->nama,
            'satuan_atau_dosis' => $request->satuan_atau_dosis,
            'keterangan' => $request->keterangan,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Standar berhasil diperbarui!']);
        }

        return redirect()->back()->with('success', 'Standar berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if ($user->role !== 'koordinator' && $user->role !== 'admin') {
            return response()->json(['error' => 'Akses tidak diizinkan.'], 403);
        }

        $standard = MasterStandard::findOrFail($id);
        $standard->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Standar berhasil dihapus!']);
        }

        return redirect()->back()->with('success', 'Standar berhasil dihapus!');
    }
}

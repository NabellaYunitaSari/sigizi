<?php

namespace App\Http\Controllers;

use App\Models\Posyandu;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser || ($currentUser->role !== 'admin' && $currentUser->role !== 'koordinator')) {
            return redirect()->route('dashboard');
        }

        $users = User::with('posyandu')->orderBy('nama', 'asc')->get();
        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json($users);
        }

        return Inertia::render('KelolaUser/Index', [
            'usersList' => $users,
            'posyandus' => $posyandus,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:kader,koordinator,admin',
        ]);

        $noHp = $request->input('no_hp');
        if (!empty($noHp)) {
            $formattedPhone = WhatsAppService::formatPhoneForWhatsApp($noHp);
            $existing = User::where('no_hp', $noHp)->orWhere('no_hp', $formattedPhone)->first();
            if ($existing) {
                return response()->json(['error' => 'Nomor HP sudah terdaftar pada akun lain'], 400);
            }
            $noHp = $formattedPhone;
        }

        $user = User::create([
            'id' => (string) Str::uuid(),
            'nama' => trim($request->nama),
            'username' => trim($request->username),
            'no_hp' => $noHp ?: null,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'id_pos' => $request->role === 'kader' ? $request->input('id_pos') : null,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $user], 201);
        }

        return redirect()->route('kelola-user.index');
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'required|string',
            'username' => 'required|string|unique:users,username,' . $id,
            'role' => 'required|string|in:kader,koordinator,admin',
        ]);

        $noHp = $request->input('no_hp');
        if (!empty($noHp)) {
            $formattedPhone = WhatsAppService::formatPhoneForWhatsApp($noHp);
            $existing = User::where('id', '!=', $id)
                ->where(function ($q) use ($noHp, $formattedPhone) {
                    $q->where('no_hp', $noHp)->orWhere('no_hp', $formattedPhone);
                })->first();
            if ($existing) {
                return response()->json(['error' => 'Nomor HP sudah terdaftar pada akun lain'], 400);
            }
            $noHp = $formattedPhone;
        }

        $user->nama = trim($request->nama);
        $user->username = trim($request->username);
        $user->no_hp = $noHp ?: null;
        $user->role = $request->role;
        $user->id_pos = $request->role === 'kader' ? $request->input('id_pos') : null;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'data' => $user]);
        }

        return redirect()->route('kelola-user.index');
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan'], 404);
        }

        $user->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('kelola-user.index');
    }
}

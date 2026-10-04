<?php

namespace App\Http\Controllers;

use App\Models\OtpVerification;
use App\Models\User;
use App\Services\WhatsAppService;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin' || $user->role === 'koordinator') {
                return redirect()->route('dashboard.desa');
            }

            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $usernameInput = trim($request->username);
        $formattedPhone = WhatsAppService::formatPhoneForWhatsApp($usernameInput);

        // Find by username or no_hp
        $user = User::where('username', $usernameInput)
            ->orWhere('no_hp', $usernameInput)
            ->orWhere('no_hp', $formattedPhone)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Nomor HP / Username atau kata sandi salah'], 401);
            }

            return back()->withErrors(['error' => 'Nomor HP / Username atau kata sandi salah']);
        }

        Auth::login($user, true);

        $userSession = [
            'id' => $user->id,
            'nama' => $user->nama,
            'username' => $user->username,
            'no_hp' => $user->no_hp,
            'role' => $user->role,
            'id_pos' => $user->id_pos,
            'nama_pos' => $user->posyandu ? $user->posyandu->nama_pos : null,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'user' => $userSession,
            ]);
        }

        if ($user->role === 'admin' || $user->role === 'koordinator') {
            return redirect()->route('dashboard.desa');
        }

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('login');
    }

    public function me(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();

            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'username' => $user->username,
                    'no_hp' => $user->no_hp,
                    'role' => $user->role,
                    'id_pos' => $user->id_pos,
                    'nama_pos' => $user->posyandu ? $user->posyandu->nama_pos : null,
                ],
            ]);
        }

        return response()->json(['authenticated' => false, 'user' => null]);
    }

    public function showLupaPassword()
    {
        return Inertia::render('Auth/LupaPassword');
    }

    public function resetPassword(Request $request)
    {
        $action = $request->input('action');

        if ($action === 'request_otp') {
            $request->validate(['no_hp' => 'required|string']);
            $rawPhone = trim($request->no_hp);
            $formattedPhone = WhatsAppService::formatPhoneForWhatsApp($rawPhone);

            $user = User::where('no_hp', $rawPhone)
                ->orWhere('no_hp', $formattedPhone)
                ->first();

            if (! $user) {
                return response()->json(['error' => 'Nomor WhatsApp tidak terdaftar di sistem SIGIZI'], 404);
            }

            $otpCode = (string) rand(100000, 999999);
            $expiresAt = new DateTime('+10 minutes');

            OtpVerification::create([
                'id' => (string) Str::uuid(),
                'no_hp' => $formattedPhone,
                'code' => $otpCode,
                'expires_at' => $expiresAt->format('Y-m-d H:i:s'),
            ]);

            $waResult = WhatsAppService::sendWhatsAppOtp($formattedPhone, $otpCode, $user->nama);

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP verifikasi telah terkirim via WhatsApp',
                'no_hp' => $formattedPhone,
                'waResult' => $waResult,
            ]);
        }

        if ($action === 'reset_password') {
            $request->validate([
                'no_hp' => 'required|string',
                'otp' => 'required|string',
                'new_password' => 'required|string|min:6',
            ]);

            $formattedPhone = WhatsAppService::formatPhoneForWhatsApp(trim($request->no_hp));

            $otpRecord = OtpVerification::where('no_hp', $formattedPhone)
                ->where('code', trim($request->otp))
                ->where('expires_at', '>', date('Y-m-d H:i:s'))
                ->orderBy('created_at', 'desc')
                ->first();

            if (! $otpRecord) {
                return response()->json(['error' => 'Kode OTP verifikasi tidak valid atau telah kadaluarsa'], 400);
            }

            $user = User::where('no_hp', $formattedPhone)->first();
            if (! $user) {
                return response()->json(['error' => 'User tidak ditemukan'], 404);
            }

            $user->password = Hash::make($request->new_password);
            $user->save();

            OtpVerification::where('no_hp', $formattedPhone)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kata sandi berhasil diperbarui. Silakan login kembali.',
            ]);
        }

        return response()->json(['error' => 'Invalid action'], 400);
    }
}

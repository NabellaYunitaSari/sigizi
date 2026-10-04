<?php

use App\Http\Controllers\AnakController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IbuHamilController;
use App\Http\Controllers\ImunisasiController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\MasterStandardController;
use App\Http\Controllers\PosyanduController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VitaminController;
use App\Models\MasterStandard;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Landing Page
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/lupa-password', [AuthController::class, 'showLupaPassword'])->name('lupa-password');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public / API JSON compatibility routes
Route::get('/api/auth/me', [AuthController::class, 'me']);
Route::post('/api/auth/login', [AuthController::class, 'login']);
Route::post('/api/auth/logout', [AuthController::class, 'logout']);
Route::post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/api/posyandu', [PosyanduController::class, 'index']);

// Protected Web Routes
Route::middleware(['auth'])->group(function () {
    // Dashboards
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard-desa', [DashboardController::class, 'village'])->name('dashboard.desa');

    // Anak Balita
    Route::get('/anak', [AnakController::class, 'index'])->name('anak.index');
    Route::post('/anak', [AnakController::class, 'store'])->name('anak.store');
    Route::put('/anak/{id}', [AnakController::class, 'update'])->name('anak.update');
    Route::get('/anak/{id}', [AnakController::class, 'show'])->name('anak.show');
    Route::get('/anak/{id}/input', [AnakController::class, 'inputPage'])->name('anak.input');
    Route::post('/anak/{id}/pengukuran', [AnakController::class, 'storePengukuran'])->name('anak.pengukuran.store');

    // Pengukuran Balita Direct Input
    Route::get('/pengukuran', [AnakController::class, 'pengukuranPage'])->name('pengukuran.index');
    Route::post('/pengukuran', [AnakController::class, 'storePengukuranDirect'])->name('pengukuran.store');
    Route::put('/pengukuran/{id}', [AnakController::class, 'updatePengukuranDirect'])->name('pengukuran.update');
    Route::delete('/pengukuran/{id}', [AnakController::class, 'destroyPengukuran'])->name('pengukuran.destroy');

    // Ibu Hamil
    Route::get('/ibu-hamil', [IbuHamilController::class, 'index'])->name('ibu-hamil.index');
    Route::post('/ibu-hamil', [IbuHamilController::class, 'store'])->name('ibu-hamil.store');
    Route::put('/ibu-hamil/{id}', [IbuHamilController::class, 'update'])->name('ibu-hamil.update');
    Route::get('/ibu-hamil/{id}', [IbuHamilController::class, 'show'])->name('ibu-hamil.show');
    Route::get('/ibu-hamil/{id}/input', [IbuHamilController::class, 'inputPage'])->name('ibu-hamil.input');
    Route::post('/ibu-hamil/{id}/pengukuran', [IbuHamilController::class, 'storePengukuran'])->name('ibu-hamil.pengukuran.store');

    // Imunisasi Balita
    Route::get('/imunisasi', [ImunisasiController::class, 'index'])->name('imunisasi.index');
    Route::post('/imunisasi', [ImunisasiController::class, 'store'])->name('imunisasi.store');
    Route::put('/imunisasi/{id}', [ImunisasiController::class, 'update'])->name('imunisasi.update');
    Route::delete('/imunisasi/{id}', [ImunisasiController::class, 'destroy'])->name('imunisasi.destroy');

    // Vitamin Balita
    Route::get('/vitamin', [VitaminController::class, 'index'])->name('vitamin.index');
    Route::post('/vitamin', [VitaminController::class, 'store'])->name('vitamin.store');
    Route::put('/vitamin/{id}', [VitaminController::class, 'update'])->name('vitamin.update');
    Route::delete('/vitamin/{id}', [VitaminController::class, 'destroy'])->name('vitamin.destroy');

    // Kelola User
    Route::get('/kelola-user', [UserController::class, 'index'])->name('kelola-user.index');
    Route::post('/kelola-user', [UserController::class, 'store'])->name('kelola-user.store');
    Route::put('/kelola-user/{id}', [UserController::class, 'update'])->name('kelola-user.update');
    Route::delete('/kelola-user/{id}', [UserController::class, 'destroy'])->name('kelola-user.destroy');

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');

    // Kelola Standar / Master Data (Bu Bidan & Admin)
    Route::get('/kelola-standar', [MasterStandardController::class, 'index'])->name('kelola-standar.index');
    Route::post('/kelola-standar', [MasterStandardController::class, 'store'])->name('kelola-standar.store');
    Route::put('/kelola-standar/{id}', [MasterStandardController::class, 'update'])->name('kelola-standar.update');
    Route::delete('/kelola-standar/{id}', [MasterStandardController::class, 'destroy'])->name('kelola-standar.destroy');

    // API JSON Endpoints (used by React fetch calls)
    Route::get('/api/master-standards', function () {
        return response()->json(MasterStandard::orderBy('nama', 'asc')->get());
    });
    Route::post('/api/master-standards', [MasterStandardController::class, 'store']);

    Route::get('/api/anak', [AnakController::class, 'index']);
    Route::post('/api/anak', [AnakController::class, 'store']);
    Route::get('/api/anak/{id}', [AnakController::class, 'show']);
    Route::post('/api/anak/{id}/pengukuran', [AnakController::class, 'storePengukuran']);

    Route::get('/api/ibu-hamil', [IbuHamilController::class, 'index']);
    Route::post('/api/ibu-hamil', [IbuHamilController::class, 'store']);
    Route::get('/api/ibu-hamil/{id}', [IbuHamilController::class, 'show']);
    Route::post('/api/ibu-hamil/{id}/pengukuran', [IbuHamilController::class, 'storePengukuran']);

    Route::get('/api/users', [UserController::class, 'index']);
    Route::post('/api/users', [UserController::class, 'store']);
    Route::put('/api/users/{id}', [UserController::class, 'update']);
    Route::delete('/api/users/{id}', [UserController::class, 'destroy']);
});

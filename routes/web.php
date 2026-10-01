<?php

use App\Http\Controllers\AnakController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IbuHamilController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\PosyanduController;
use App\Http\Controllers\UserController;
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
    Route::get('/anak/{id}', [AnakController::class, 'show'])->name('anak.show');
    Route::get('/anak/{id}/input', [AnakController::class, 'inputPage'])->name('anak.input');
    Route::post('/anak/{id}/pengukuran', [AnakController::class, 'storePengukuran'])->name('anak.pengukuran.store');

    // Ibu Hamil
    Route::get('/ibu-hamil', [IbuHamilController::class, 'index'])->name('ibu-hamil.index');
    Route::post('/ibu-hamil', [IbuHamilController::class, 'store'])->name('ibu-hamil.store');
    Route::get('/ibu-hamil/{id}', [IbuHamilController::class, 'show'])->name('ibu-hamil.show');
    Route::get('/ibu-hamil/{id}/input', [IbuHamilController::class, 'inputPage'])->name('ibu-hamil.input');
    Route::post('/ibu-hamil/{id}/pengukuran', [IbuHamilController::class, 'storePengukuran'])->name('ibu-hamil.pengukuran.store');

    // Kelola User
    Route::get('/kelola-user', [UserController::class, 'index'])->name('kelola-user.index');
    Route::post('/kelola-user', [UserController::class, 'store'])->name('kelola-user.store');
    Route::put('/kelola-user/{id}', [UserController::class, 'update'])->name('kelola-user.update');
    Route::delete('/kelola-user/{id}', [UserController::class, 'destroy'])->name('kelola-user.destroy');

    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');

    // API JSON Endpoints (used by React fetch calls)
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

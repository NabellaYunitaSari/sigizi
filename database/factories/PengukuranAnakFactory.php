<?php

namespace Database\Factories;

use App\Models\Anak;
use App\Models\PengukuranAnak;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PengukuranAnak>
 */
class PengukuranAnakFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_anak' => Anak::factory(),
            'id_user_input' => User::factory(),
            'tanggal_ukur' => now()->toDateString(),
            'berat_kg' => 10,
            'tinggi_cm' => 80,
            'umur_bulan' => 18,
            'status_bbu' => 'Normal',
            'status_tbu' => 'Normal',
            'status_bbtb' => 'Normal',
        ];
    }
}

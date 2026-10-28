<?php

namespace Database\Factories;

use App\Models\IbuHamil;
use App\Models\PengukuranBumil;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PengukuranBumil>
 */
class PengukuranBumilFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_bumil' => IbuHamil::factory(),
            'id_user_input' => User::factory(),
            'tanggal_periksa' => now()->toDateString(),
            'usia_kehamilan_minggu' => 10,
            'berat_kg' => 55,
            'tinggi_cm' => 155,
            'lila_cm' => 25,
            'tekanan_darah' => '110/70',
            'status_gizi_bumil' => 'Normal',
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Anak;
use App\Models\Imunisasi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Imunisasi>
 */
class ImunisasiFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_anak' => Anak::factory(),
            'jenis_imunisasi' => 'BCG',
            'tanggal' => now()->toDateString(),
        ];
    }
}

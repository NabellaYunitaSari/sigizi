<?php

namespace Database\Factories;

use App\Models\Anak;
use App\Models\Posyandu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Anak>
 */
class AnakFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_pos' => Posyandu::factory(),
            'nik' => fake()->unique()->numerify('################'),
            'nama_anak' => fake()->name(),
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => now()->subMonths(18)->toDateString(),
            'nama_ibu' => fake()->name(),
            'alamat' => fake()->address(),
            'berat_lahir_gram' => 3200,
            'panjang_lahir_cm' => 49,
        ];
    }
}

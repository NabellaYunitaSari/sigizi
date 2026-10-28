<?php

namespace Database\Factories;

use App\Models\IbuHamil;
use App\Models\Posyandu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IbuHamil>
 */
class IbuHamilFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_pos' => Posyandu::factory(),
            'nik' => fake()->unique()->numerify('################'),
            'nama' => fake()->name(),
            'tanggal_lahir' => now()->subYears(28)->toDateString(),
            'nama_suami' => fake()->name(),
            'alamat' => fake()->address(),
            'kehamilan_ke' => 1,
            'hpht' => now()->subWeeks(10)->toDateString(),
        ];
    }
}

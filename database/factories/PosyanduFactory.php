<?php

namespace Database\Factories;

use App\Models\Posyandu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Posyandu>
 */
class PosyanduFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_pos' => fake()->unique()->word(),
            'dusun' => fake()->streetName(),
            'alamat' => fake()->address(),
        ];
    }
}

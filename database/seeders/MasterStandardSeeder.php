<?php

namespace Database\Seeders;

use App\Models\MasterStandard;
use Illuminate\Database\Seeder;

class MasterStandardSeeder extends Seeder
{
    public function run(): void
    {
        $imunisasiDefaults = [
            'HB-0 (0-7 Hari)',
            'BCG',
            'Polio 1',
            'DPT-HB-Hib 1',
            'Polio 2',
            'DPT-HB-Hib 2',
            'Polio 3',
            'DPT-HB-Hib 3',
            'Polio 4',
            'IPV',
            'Campak / MR 1',
            'PCV 1',
            'PCV 2',
            'PCV 3',
            'Booster DPT-HB-Hib',
            'Booster Campak / MR 2',
        ];

        foreach ($imunisasiDefaults as $name) {
            MasterStandard::firstOrCreate(
                ['kategori' => 'imunisasi', 'nama' => $name],
                ['keterangan' => 'Standar Program Imunisasi Nasional Kemenkes RI']
            );
        }

        $vitaminDefaults = [
            'Vitamin A Biru (100.000 IU) - Bayi 6-11 Bulan',
            'Vitamin A Merah (200.000 IU) - Balita 12-59 Bulan',
            'Obat Cacing (Pirantel Pamoat) - Balita 12-59 Bulan',
            'Vitamin & Suplemen Nutrisi Tambahan',
        ];

        foreach ($vitaminDefaults as $name) {
            MasterStandard::firstOrCreate(
                ['kategori' => 'vitamin', 'nama' => $name],
                ['keterangan' => 'Suplementasi Gizi Mikro & Vitamin Balita']
            );
        }

        $pengukuranDefaults = [
            'Berat Badan (BB)',
            'Tinggi / Panjang Badan (TB/PB)',
            'Lingkar Lengan Atas (LiLA)',
            'Lingkar Kepala (LK)',
            'Pemeriksaan Hemoglobin (Hb Balita/Bumil)',
        ];

        foreach ($pengukuranDefaults as $name) {
            MasterStandard::firstOrCreate(
                ['kategori' => 'pengukuran', 'nama' => $name],
                ['keterangan' => 'Standar Parameter Antropometri & Indikator Gizi']
            );
        }
    }
}

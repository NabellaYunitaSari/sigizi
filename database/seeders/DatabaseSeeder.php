<?php

namespace Database\Seeders;

use App\Models\Anak;
use App\Models\IbuHamil;
use App\Models\PelatihanPrePost;
use App\Models\PengukuranAnak;
use App\Models\PengukuranBumil;
use App\Models\Posyandu;
use App\Models\User;
use App\Services\StatusGiziService;
use DateTime;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Posyandus
        $posyanduData = [
            ['nama_pos' => 'Anggrek', 'dusun' => 'Dusun Krajan', 'alamat' => 'RT 02 RW 01 Dusun Krajan, Sukomalo'],
            ['nama_pos' => 'Bougenfil', 'dusun' => 'Dusun Sukomaju', 'alamat' => 'RT 04 RW 02 Dusun Sukomaju, Sukomalo'],
            ['nama_pos' => 'Dahlia', 'dusun' => 'Dusun Karanganyar', 'alamat' => 'RT 01 RW 03 Dusun Karanganyar, Sukomalo'],
            ['nama_pos' => 'Lily', 'dusun' => 'Dusun Wonosari', 'alamat' => 'RT 03 RW 04 Dusun Wonosari, Sukomalo'],
            ['nama_pos' => 'Mawar', 'dusun' => 'Dusun Sukahening', 'alamat' => 'RT 02 RW 05 Dusun Sukahening, Sukomalo'],
            ['nama_pos' => 'Melati', 'dusun' => 'Dusun Sumberrejo', 'alamat' => 'RT 05 RW 06 Dusun Sumberrejo, Sukomalo'],
        ];

        $posMap = [];
        foreach ($posyanduData as $pos) {
            $created = Posyandu::create([
                'id' => (string) Str::uuid(),
                'nama_pos' => $pos['nama_pos'],
                'dusun' => $pos['dusun'],
                'alamat' => $pos['alamat'],
            ]);
            $posMap[$pos['nama_pos']] = $created->id;
        }

        // 2. Create Users
        $defaultPassword = Hash::make('kader123');
        $adminPassword = Hash::make('admin123');
        $koordinatorPassword = Hash::make('koordinator123');

        User::create([
            'id' => (string) Str::uuid(),
            'nama' => 'Admin Utama Sukomalo',
            'username' => 'admin',
            'no_hp' => '081200000001',
            'password' => $adminPassword,
            'role' => 'admin',
        ]);

        User::create([
            'id' => (string) Str::uuid(),
            'nama' => 'Bd. Siti Rahayu, A.Md.Keb',
            'username' => 'koordinator',
            'no_hp' => '081200000002',
            'password' => $koordinatorPassword,
            'role' => 'koordinator',
        ]);

        $kaderPhoneList = [
            'Anggrek' => '081200000003',
            'Bougenfil' => '081200000004',
            'Dahlia' => '081200000005',
            'Lily' => '081200000006',
            'Mawar' => '081200000007',
            'Melati' => '081200000008',
        ];

        $kaders = [];
        foreach ($posyanduData as $pos) {
            $namaPos = $pos['nama_pos'];
            $username = 'kader_'.strtolower($namaPos);
            $user = User::create([
                'id' => (string) Str::uuid(),
                'nama' => "Kader {$namaPos}",
                'username' => $username,
                'no_hp' => $kaderPhoneList[$namaPos],
                'password' => $defaultPassword,
                'role' => 'kader',
                'id_pos' => $posMap[$namaPos],
            ]);
            $kaders[$namaPos] = $user;
        }

        // 3. Create Anak & Pengukuran
        $currentMonth = (int) date('n') - 1; // 0-indexed
        $currentYear = (int) date('Y');

        $anakSeedList = [
            ['nama' => 'Arka Putra Pratama', 'jk' => 'L', 'pos' => 'Anggrek', 'ageM' => 14, 'weight' => 9.8, 'height' => 77.0, 'measuredThisMonth' => true],
            ['nama' => 'Aisyah Humaira', 'jk' => 'P', 'pos' => 'Anggrek', 'ageM' => 22, 'weight' => 10.2, 'height' => 82.5, 'measuredThisMonth' => true],
            ['nama' => 'Muhammad Bilal', 'jk' => 'L', 'pos' => 'Anggrek', 'ageM' => 10, 'weight' => 7.2, 'height' => 68.0, 'measuredThisMonth' => false],
            ['nama' => 'Nisa Sabyan', 'jk' => 'P', 'pos' => 'Anggrek', 'ageM' => 30, 'weight' => 11.5, 'height' => 86.0, 'measuredThisMonth' => false],
            ['nama' => 'Bintang Ramadhan', 'jk' => 'L', 'pos' => 'Bougenfil', 'ageM' => 18, 'weight' => 10.5, 'height' => 81.0, 'measuredThisMonth' => true],
            ['nama' => 'Bayu Samudra', 'jk' => 'L', 'pos' => 'Bougenfil', 'ageM' => 28, 'weight' => 10.1, 'height' => 82.0, 'measuredThisMonth' => true],
            ['nama' => 'Bella Safira', 'jk' => 'P', 'pos' => 'Bougenfil', 'ageM' => 8, 'weight' => 7.8, 'height' => 67.5, 'measuredThisMonth' => false],
            ['nama' => 'Callysta Putri', 'jk' => 'P', 'pos' => 'Dahlia', 'ageM' => 24, 'weight' => 11.8, 'height' => 85.5, 'measuredThisMonth' => true],
            ['nama' => 'Candra Wijaya', 'jk' => 'L', 'pos' => 'Dahlia', 'ageM' => 12, 'weight' => 7.5, 'height' => 71.0, 'measuredThisMonth' => true],
            ['nama' => 'Daniel Rizky', 'jk' => 'L', 'pos' => 'Lily', 'ageM' => 36, 'weight' => 14.2, 'height' => 95.0, 'measuredThisMonth' => true],
            ['nama' => 'Dara Puspita', 'jk' => 'P', 'pos' => 'Lily', 'ageM' => 16, 'weight' => 9.0, 'height' => 74.0, 'measuredThisMonth' => false],
            ['nama' => 'Elang Perkasa', 'jk' => 'L', 'pos' => 'Mawar', 'ageM' => 20, 'weight' => 11.0, 'height' => 83.0, 'measuredThisMonth' => true],
            ['nama' => 'Eva Kartika', 'jk' => 'P', 'pos' => 'Mawar', 'ageM' => 14, 'weight' => 8.4, 'height' => 72.0, 'measuredThisMonth' => false],
            ['nama' => 'Fajar Nugraha', 'jk' => 'L', 'pos' => 'Melati', 'ageM' => 26, 'weight' => 12.0, 'height' => 87.0, 'measuredThisMonth' => true],
            ['nama' => 'Fiona Azahra', 'jk' => 'P', 'pos' => 'Melati', 'ageM' => 6, 'weight' => 6.8, 'height' => 63.0, 'measuredThisMonth' => true],
        ];

        $nikCounter = 3515010101000001;
        $kkCounter = 3515010101009999;

        foreach ($anakSeedList as $item) {
            $birthDate = new DateTime;
            $birthDate->modify("-{$item['ageM']} months");

            $posId = $posMap[$item['pos']];
            $kaderUser = $kaders[$item['pos']];

            $child = Anak::create([
                'id' => (string) Str::uuid(),
                'id_pos' => $posId,
                'nik' => (string) $nikCounter++,
                'no_kk' => (string) $kkCounter--,
                'nama_anak' => $item['nama'],
                'jenis_kelamin' => $item['jk'],
                'tanggal_lahir' => $birthDate->format('Y-m-d'),
                'nama_ayah' => 'Bpk. '.explode(' ', $item['nama'])[0],
                'nama_ibu' => 'Ibu '.(explode(' ', $item['nama'])[1] ?? 'Siti'),
                'no_hp_ortu' => '081234567'.rand(100, 999),
                'alamat' => "Dusun {$item['pos']}, RT 01 RW 02 Sukomalo",
                'berat_lahir_gram' => 3100 + rand(0, 400),
                'panjang_lahir_cm' => 49.0 + rand(0, 3),
            ]);

            // Historical measurements (3, 2, 1 month ago)
            for ($m = 3; $m >= 1; $m--) {
                $measureDate = new DateTime;
                $measureDate->setDate($currentYear, $currentMonth - $m + 1, 15);
                $ageAtM = StatusGiziService::calculateAgeInMonths($birthDate->format('Y-m-d'), $measureDate->format('Y-m-d'));
                $pastWeight = max(3.0, $item['weight'] - $m * 0.4);
                $pastHeight = max(50.0, $item['height'] - $m * 0.8);
                $nut = StatusGiziService::classifyNutritionStatus($pastWeight, $pastHeight, $ageAtM, $item['jk']);

                PengukuranAnak::create([
                    'id' => (string) Str::uuid(),
                    'id_anak' => $child->id,
                    'id_user_input' => $kaderUser->id,
                    'tanggal_ukur' => $measureDate->format('Y-m-d'),
                    'berat_kg' => round($pastWeight, 1),
                    'tinggi_cm' => round($pastHeight, 1),
                    'cara_ukur' => ($ageAtM < 24) ? 'telentang' : 'berdiri',
                    'lila_cm' => 14.5,
                    'umur_bulan' => $nut['umur_bulan'],
                    'status_bbu' => $nut['status_bbu'],
                    'status_tbu' => $nut['status_tbu'],
                    'status_bbtb' => $nut['status_bbtb'],
                ]);
            }

            if ($item['measuredThisMonth']) {
                $measureDate = new DateTime;
                $measureDate->setDate($currentYear, $currentMonth + 1, 5);
                $ageAtM = StatusGiziService::calculateAgeInMonths($birthDate->format('Y-m-d'), $measureDate->format('Y-m-d'));
                $nut = StatusGiziService::classifyNutritionStatus($item['weight'], $item['height'], $ageAtM, $item['jk']);

                PengukuranAnak::create([
                    'id' => (string) Str::uuid(),
                    'id_anak' => $child->id,
                    'id_user_input' => $kaderUser->id,
                    'tanggal_ukur' => $measureDate->format('Y-m-d'),
                    'berat_kg' => $item['weight'],
                    'tinggi_cm' => $item['height'],
                    'cara_ukur' => ($ageAtM < 24) ? 'telentang' : 'berdiri',
                    'lila_cm' => 15.0,
                    'umur_bulan' => $nut['umur_bulan'],
                    'status_bbu' => $nut['status_bbu'],
                    'status_tbu' => $nut['status_tbu'],
                    'status_bbtb' => $nut['status_bbtb'],
                ]);
            }
        }

        // 4. Seed Ibu Hamil
        $bumilSeedList = [
            ['nama' => 'Ibu Ratna Dewi', 'pos' => 'Anggrek', 'lila' => 24.5, 'hphtWeeks' => 24, 'weight' => 62.0],
            ['nama' => 'Ibu Maryam', 'pos' => 'Anggrek', 'lila' => 22.0, 'hphtWeeks' => 16, 'weight' => 51.5],
            ['nama' => 'Ibu Nurhayati', 'pos' => 'Bougenfil', 'lila' => 25.0, 'hphtWeeks' => 32, 'weight' => 68.0],
            ['nama' => 'Ibu Siska Utami', 'pos' => 'Dahlia', 'lila' => 21.8, 'hphtWeeks' => 12, 'weight' => 48.0],
            ['nama' => 'Ibu Tri Wahyuni', 'pos' => 'Lily', 'lila' => 26.2, 'hphtWeeks' => 28, 'weight' => 64.5],
            ['nama' => 'Ibu Yulianti', 'pos' => 'Melati', 'lila' => 23.8, 'hphtWeeks' => 20, 'weight' => 58.0],
        ];

        $bumilNikCounter = 3515014401880001;

        foreach ($bumilSeedList as $b) {
            $posId = $posMap[$b['pos']];
            $kaderUser = $kaders[$b['pos']];

            $hphtDate = new DateTime;
            $hphtDate->modify("-{$b['hphtWeeks']} weeks");

            $bumil = IbuHamil::create([
                'id' => (string) Str::uuid(),
                'id_pos' => $posId,
                'nik' => (string) $bumilNikCounter++,
                'nama' => $b['nama'],
                'tanggal_lahir' => '1995-05-12',
                'nama_suami' => 'Bpk. '.(explode(' ', $b['nama'])[1] ?? 'Suryo'),
                'alamat' => "Dusun {$b['pos']}, Sukomalo",
                'kehamilan_ke' => 1,
                'hpht' => $hphtDate->format('Y-m-d'),
            ]);

            $statusBumil = StatusGiziService::classifyBumilStatus($b['lila']);

            $measureDate = new DateTime;
            $measureDate->setDate($currentYear, $currentMonth + 1, 10);

            PengukuranBumil::create([
                'id' => (string) Str::uuid(),
                'id_bumil' => $bumil->id,
                'id_user_input' => $kaderUser->id,
                'tanggal_periksa' => $measureDate->format('Y-m-d'),
                'usia_kehamilan_minggu' => $b['hphtWeeks'],
                'berat_kg' => $b['weight'],
                'tinggi_cm' => 156.0,
                'lila_cm' => $b['lila'],
                'tekanan_darah' => '120/80',
                'status_gizi_bumil' => $statusBumil,
            ]);
        }

        // 5. Seed Pelatihan PrePost
        $prepostData = [
            ['user' => $kaders['Anggrek'], 'pre' => 65, 'post' => 90, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
            ['user' => $kaders['Bougenfil'], 'pre' => 60, 'post' => 85, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
            ['user' => $kaders['Dahlia'], 'pre' => 70, 'post' => 95, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
            ['user' => $kaders['Lily'], 'pre' => 55, 'post' => 88, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
            ['user' => $kaders['Mawar'], 'pre' => 65, 'post' => 92, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
            ['user' => $kaders['Melati'], 'pre' => 70, 'post' => 96, 'title' => 'Pelatihan Standar Antropometri Kemenkes 2026'],
        ];

        foreach ($prepostData as $item) {
            PelatihanPrePost::create([
                'id' => (string) Str::uuid(),
                'id_user' => $item['user']->id,
                'jenis_pelatihan' => $item['title'],
                'skor_pretest' => $item['pre'],
                'skor_posttest' => $item['post'],
                'tanggal' => date('Y-m-d H:i:s'),
            ]);
        }
    }
}

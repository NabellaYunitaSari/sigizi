<?php

namespace Database\Seeders;

use App\Models\Anak;
use App\Models\IbuHamil;
use App\Models\Imunisasi;
use App\Models\KunjunganNifas;
use App\Models\OrangTua;
use App\Models\PelatihanPrePost;
use App\Models\PemantauanMenyusui;
use App\Models\PengukuranAnak;
use App\Models\PengukuranBumil;
use App\Models\Posyandu;
use App\Models\User;
use App\Models\Vitamin;
use App\Services\StatusGiziService;
use DateTime;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Nonaktifkan foreign key checks sementara untuk membersihkan tabel
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PemantauanMenyusui::truncate();
        KunjunganNifas::truncate();
        PengukuranBumil::truncate();
        PengukuranAnak::truncate();
        Imunisasi::truncate();
        Vitamin::truncate();
        OrangTua::truncate();
        IbuHamil::truncate();
        Anak::truncate();
        PelatihanPrePost::truncate();
        User::truncate();
        Posyandu::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

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

        $admin = User::create([
            'id' => (string) Str::uuid(),
            'nama' => 'Admin Utama Sukomalo',
            'username' => 'admin',
            'no_hp' => '081200000001',
            'password' => $adminPassword,
            'role' => 'admin',
        ]);

        $koordinator = User::create([
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

        // 3. Create Anak, Orang Tua, & Pengukuran Balita
        $currentMonth = (int) date('n'); // 1-12
        $currentYear = (int) date('Y');

        $anakSeedList = [
            [
                'nama' => 'Arka Putra Pratama', 'jk' => 'L', 'pos' => 'Anggrek', 'ageM' => 14,
                'weight' => 9.8, 'height' => 77.0, 'lila' => 14.5, 'lk' => 46.0,
                'ibu' => 'Siti Aminah', 'ayah' => 'Budi Santoso', 'hp' => '08123456701',
                'alamat' => 'RT 02 RW 01 Dusun Krajan', 'rt' => '02', 'rw' => '01',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Aisyah Humaira', 'jk' => 'P', 'pos' => 'Anggrek', 'ageM' => 22,
                'weight' => 10.2, 'height' => 82.5, 'lila' => 15.0, 'lk' => 47.0,
                'ibu' => 'Fitriani Rahmawati', 'ayah' => 'Rian Hidayat', 'hp' => '08123456702',
                'alamat' => 'RT 01 RW 01 Dusun Krajan', 'rt' => '01', 'rw' => '01',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Muhammad Bilal', 'jk' => 'L', 'pos' => 'Anggrek', 'ageM' => 10,
                'weight' => 7.2, 'height' => 68.0, 'lila' => 13.5, 'lk' => 44.5,
                'ibu' => 'Dewi Lestari', 'ayah' => 'Fajar Ramadhan', 'hp' => '08123456703',
                'alamat' => 'RT 03 RW 01 Dusun Krajan', 'rt' => '03', 'rw' => '01',
                'mbg' => false, 'vit' => false, 'naik' => 'T',
            ],
            [
                'nama' => 'Nisa Sabyan', 'jk' => 'P', 'pos' => 'Anggrek', 'ageM' => 30,
                'weight' => 11.5, 'height' => 86.0, 'lila' => 15.5, 'lk' => 48.0,
                'ibu' => 'Khadijah', 'ayah' => 'Rusli Ansori', 'hp' => '08123456704',
                'alamat' => 'RT 02 RW 01 Dusun Krajan', 'rt' => '02', 'rw' => '01',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Bintang Ramadhan', 'jk' => 'L', 'pos' => 'Bougenfil', 'ageM' => 18,
                'weight' => 10.5, 'height' => 81.0, 'lila' => 15.0, 'lk' => 46.5,
                'ibu' => 'Endang Sulastri', 'ayah' => 'Agus Priyono', 'hp' => '08123456705',
                'alamat' => 'RT 04 RW 02 Dusun Sukomaju', 'rt' => '04', 'rw' => '02',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Bayu Samudra', 'jk' => 'L', 'pos' => 'Bougenfil', 'ageM' => 28,
                'weight' => 10.1, 'height' => 82.0, 'lila' => 14.0, 'lk' => 47.5,
                'ibu' => 'Sri Wahyuningsih', 'ayah' => 'Bambang Irawan', 'hp' => '08123456706',
                'alamat' => 'RT 01 RW 02 Dusun Sukomaju', 'rt' => '01', 'rw' => '02',
                'mbg' => false, 'vit' => false, 'naik' => 'T',
            ],
            [
                'nama' => 'Bella Safira', 'jk' => 'P', 'pos' => 'Bougenfil', 'ageM' => 8,
                'weight' => 7.8, 'height' => 67.5, 'lila' => 13.8, 'lk' => 43.5,
                'ibu' => 'Yuliana Sari', 'ayah' => 'Hendra Kusuma', 'hp' => '08123456707',
                'alamat' => 'RT 03 RW 02 Dusun Sukomaju', 'rt' => '03', 'rw' => '02',
                'mbg' => false, 'vit' => true, 'naik' => 'B',
            ],
            [
                'nama' => 'Callysta Putri', 'jk' => 'P', 'pos' => 'Dahlia', 'ageM' => 24,
                'weight' => 11.8, 'height' => 85.5, 'lila' => 15.2, 'lk' => 47.8,
                'ibu' => 'Rina Marlina', 'ayah' => 'Denny Pratama', 'hp' => '08123456708',
                'alamat' => 'RT 01 RW 03 Dusun Karanganyar', 'rt' => '01', 'rw' => '03',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Candra Wijaya', 'jk' => 'L', 'pos' => 'Dahlia', 'ageM' => 12,
                'weight' => 7.5, 'height' => 71.0, 'lila' => 13.2, 'lk' => 44.0,
                'ibu' => 'Nur Halimah', 'ayah' => 'Wahyu Hidayat', 'hp' => '08123456709',
                'alamat' => 'RT 02 RW 03 Dusun Karanganyar', 'rt' => '02', 'rw' => '03',
                'mbg' => false, 'vit' => false, 'naik' => 'T',
            ],
            [
                'nama' => 'Daniel Rizky', 'jk' => 'L', 'pos' => 'Lily', 'ageM' => 36,
                'weight' => 14.2, 'height' => 95.0, 'lila' => 16.0, 'lk' => 49.0,
                'ibu' => 'Maria Ulfa', 'ayah' => 'Surya Saputra', 'hp' => '08123456710',
                'alamat' => 'RT 03 RW 04 Dusun Wonosari', 'rt' => '03', 'rw' => '04',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Dara Puspita', 'jk' => 'P', 'pos' => 'Lily', 'ageM' => 16,
                'weight' => 9.0, 'height' => 74.0, 'lila' => 14.0, 'lk' => 45.0,
                'ibu' => 'Anisa Triastuti', 'ayah' => 'Gunawan Wibisono', 'hp' => '08123456711',
                'alamat' => 'RT 02 RW 04 Dusun Wonosari', 'rt' => '02', 'rw' => '04',
                'mbg' => false, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Elang Perkasa', 'jk' => 'L', 'pos' => 'Mawar', 'ageM' => 20,
                'weight' => 11.0, 'height' => 83.0, 'lila' => 15.0, 'lk' => 46.5,
                'ibu' => 'Kartika Sari', 'ayah' => 'Danang Prasetyo', 'hp' => '08123456712',
                'alamat' => 'RT 02 RW 05 Dusun Sukahening', 'rt' => '02', 'rw' => '05',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Fajar Nugraha', 'jk' => 'L', 'pos' => 'Melati', 'ageM' => 26,
                'weight' => 12.0, 'height' => 87.0, 'lila' => 15.5, 'lk' => 47.5,
                'ibu' => 'Lina Susanti', 'ayah' => 'Ahmad Suhendra', 'hp' => '08123456713',
                'alamat' => 'RT 05 RW 06 Dusun Sumberrejo', 'rt' => '05', 'rw' => '06',
                'mbg' => true, 'vit' => true, 'naik' => 'N',
            ],
            [
                'nama' => 'Fiona Azahra', 'jk' => 'P', 'pos' => 'Melati', 'ageM' => 6,
                'weight' => 6.8, 'height' => 63.0, 'lila' => 13.0, 'lk' => 42.0,
                'ibu' => 'Novita Anggraini', 'ayah' => 'Taufik Rahman', 'hp' => '08123456714',
                'alamat' => 'RT 01 RW 06 Dusun Sumberrejo', 'rt' => '01', 'rw' => '06',
                'mbg' => false, 'vit' => true, 'naik' => 'B',
            ],
        ];

        $nikCounter = 3515010101000001;
        $kkCounter = 3515010101009999;
        $ortuNikCounter = 3515017001800001;

        $createdChildren = [];

        foreach ($anakSeedList as $item) {
            $birthDate = new DateTime;
            $birthDate->modify("-{$item['ageM']} months");

            $posId = $posMap[$item['pos']];
            $kaderUser = $kaders[$item['pos']];

            // 1. Buat Orang Tua
            $ortu = OrangTua::create([
                'id' => (string) Str::uuid(),
                'nama' => 'Ibu '.$item['ibu'],
                'nik' => (string) $ortuNikCounter++,
                'no_hp' => $item['hp'],
                'alamat' => $item['alamat'].', Sukomalo',
                'rt' => $item['rt'],
                'rw' => $item['rw'],
            ]);

            // 2. Buat Anak Balita
            $child = Anak::create([
                'id' => (string) Str::uuid(),
                'id_pos' => $posId,
                'id_orang_tua' => $ortu->id,
                'nik' => (string) $nikCounter++,
                'nik_tidak_tersedia' => false,
                'no_kk' => (string) $kkCounter--,
                'nama_anak' => $item['nama'],
                'anak_ke' => rand(1, 3),
                'jenis_kelamin' => $item['jk'],
                'tanggal_lahir' => $birthDate->format('Y-m-d'),
                'nama_ayah' => 'Bpk. '.$item['ayah'],
                'nama_ibu' => 'Ibu '.$item['ibu'],
                'no_hp_ortu' => $item['hp'],
                'alamat' => $item['alamat'].', Sukomalo',
                'rt' => $item['rt'],
                'rw' => $item['rw'],
                'berat_lahir_gram' => 3100 + rand(0, 400),
                'panjang_lahir_cm' => 49.0 + rand(0, 3),
                'lingkar_kepala_lahir' => 34.0,
                'buku_kia' => true,
                'imd' => true,
                'paud' => ($item['ageM'] >= 24) ? 'PAUD Tunas Harapan' : null,
            ]);

            $createdChildren[] = $child;

            // 3. Catat Pengukuran Bulan Ini
            $measureDate = new DateTime;
            $nut = StatusGiziService::classifyNutritionStatus($item['weight'], $item['height'], $item['ageM'], $item['jk']);

            PengukuranAnak::create([
                'id' => (string) Str::uuid(),
                'id_anak' => $child->id,
                'id_user_input' => $kaderUser->id,
                'tanggal_ukur' => $measureDate->format('Y-m-d'),
                'berat_kg' => $item['weight'],
                'tinggi_cm' => $item['height'],
                'cara_ukur' => ($item['ageM'] < 24) ? 'telentang' : 'berdiri',
                'cara_ukur_berat' => 'digital',
                'lila_cm' => $item['lila'],
                'lingkar_kepala_cm' => $item['lk'],
                'umur_bulan' => $item['ageM'],
                'status_bbu' => $nut['status_bbu'],
                'zs_bbu' => $nut['zs_bbu'],
                'status_tbu' => $nut['status_tbu'],
                'zs_tbu' => $nut['zs_tbu'],
                'status_bbtb' => $nut['status_bbtb'],
                'zs_bbtb' => $nut['zs_bbtb'],
                'naik_berat_badan' => $item['naik'],
                'keterangan_naik_bb' => ($item['naik'] === 'N') ? 'ZSCORE NAIK' : (($item['naik'] === 'T') ? 'ZSCORE TIDAK NAIK' : 'BARU DITIMBANG'),
                'kelas_balita' => rand(0, 1) === 1,
                'menerima_mbg' => $item['mbg'],
                'vitamin_a' => $item['vit'],
            ]);

            // 4. Catat Imunisasi untuk beberapa anak
            if ($item['ageM'] >= 2) {
                Imunisasi::create([
                    'id' => (string) Str::uuid(),
                    'id_anak' => $child->id,
                    'jenis_imunisasi' => 'BCG',
                    'tanggal' => $birthDate->modify('+1 month')->format('Y-m-d'),
                ]);
            }
            if ($item['ageM'] >= 4) {
                Imunisasi::create([
                    'id' => (string) Str::uuid(),
                    'id_anak' => $child->id,
                    'jenis_imunisasi' => 'DPT-HB-Hib 1',
                    'tanggal' => $birthDate->modify('+1 month')->format('Y-m-d'),
                ]);
            }

            // 5. Catat Vitamin A
            if ($item['vit']) {
                Vitamin::create([
                    'id' => (string) Str::uuid(),
                    'id_anak' => $child->id,
                    'id_user_input' => $kaderUser->id,
                    'jenis_vitamin' => ($item['ageM'] < 12) ? 'Vitamin A Biru (100.000 IU)' : 'Vitamin A Merah (200.000 IU)',
                    'tanggal' => date('Y-08-15'),
                    'keterangan' => 'Pemberian serentak Bulan Vitamin A',
                ]);
            }
        }

        // 4. Create Ibu Hamil, ANC, Nifas, & Menyusui
        $bumilSeedList = [
            [
                'nama' => 'Ibu Ratna Dewi', 'suami' => 'Bpk. Ahmad Fauzi', 'nik_suami' => '3515011001880001',
                'pos' => 'Anggrek', 'lila' => 24.5, 'hphtWeeks' => 24, 'weight' => 62.0, 'height' => 156.0,
                'status' => 'Hamil', 'hp' => '081300000001', 'alamat' => 'RT 02 RW 01 Dusun Krajan',
            ],
            [
                'nama' => 'Ibu Maryam', 'suami' => 'Bpk. Hendra Saputra', 'nik_suami' => '3515011001880002',
                'pos' => 'Anggrek', 'lila' => 22.0, 'hphtWeeks' => 16, 'weight' => 51.5, 'height' => 154.0,
                'status' => 'Hamil', 'hp' => '081300000002', 'alamat' => 'RT 01 RW 01 Dusun Krajan',
            ],
            [
                'nama' => 'Ibu Nurhayati', 'suami' => 'Bpk. Bambang Supriyadi', 'nik_suami' => '3515011001880003',
                'pos' => 'Bougenfil', 'lila' => 25.0, 'hphtWeeks' => 32, 'weight' => 68.0, 'height' => 158.0,
                'status' => 'Hamil', 'hp' => '081300000003', 'alamat' => 'RT 04 RW 02 Dusun Sukomaju',
            ],
            [
                'nama' => 'Ibu Siska Utami', 'suami' => 'Bpk. Agus Setiawan', 'nik_suami' => '3515011001880004',
                'pos' => 'Dahlia', 'lila' => 21.8, 'hphtWeeks' => 12, 'weight' => 48.0, 'height' => 152.0,
                'status' => 'Hamil', 'hp' => '081300000004', 'alamat' => 'RT 01 RW 03 Dusun Karanganyar',
            ],
            [
                'nama' => 'Ibu Tri Wahyuni', 'suami' => 'Bpk. Joko Wibowo', 'nik_suami' => '3515011001880005',
                'pos' => 'Lily', 'lila' => 26.2, 'hphtWeeks' => 28, 'weight' => 64.5, 'height' => 157.0,
                'status' => 'Hamil', 'hp' => '081300000005', 'alamat' => 'RT 03 RW 04 Dusun Wonosari',
            ],
            [
                'nama' => 'Ibu Yulianti', 'suami' => 'Bpk. Dedi Kurniawan', 'nik_suami' => '3515011001880006',
                'pos' => 'Melati', 'lila' => 23.8, 'hphtWeeks' => 20, 'weight' => 58.0, 'height' => 155.0,
                'status' => 'Hamil', 'hp' => '081300000006', 'alamat' => 'RT 05 RW 06 Dusun Sumberrejo',
            ],
            [
                'nama' => 'Ibu Siti Khotimah', 'suami' => 'Bpk. Rudi Hartono', 'nik_suami' => '3515011001880007',
                'pos' => 'Anggrek', 'lila' => 24.0, 'hphtWeeks' => 40, 'weight' => 60.0, 'height' => 155.0,
                'status' => 'Nifas', 'hp' => '081300000007', 'alamat' => 'RT 02 RW 01 Dusun Krajan',
            ],
            [
                'nama' => 'Ibu Diana Puspitasari', 'suami' => 'Bpk. Anton Nugroho', 'nik_suami' => '3515011001880008',
                'pos' => 'Mawar', 'lila' => 25.5, 'hphtWeeks' => 40, 'weight' => 63.0, 'height' => 156.0,
                'status' => 'Menyusui', 'hp' => '081300000008', 'alamat' => 'RT 02 RW 05 Dusun Sukahening',
            ],
        ];

        $bumilNikCounter = 3515014401880001;
        $bumilKkCounter = 3515014401889999;

        foreach ($bumilSeedList as $b) {
            $posId = $posMap[$b['pos']];
            $kaderUser = $kaders[$b['pos']];

            $hphtDate = new DateTime;
            $hphtDate->modify("-{$b['hphtWeeks']} weeks");

            $hplDate = clone $hphtDate;
            $hplDate->modify('+280 days');

            $statusBumil = StatusGiziService::classifyBumilStatus($b['lila']);

            $bumil = IbuHamil::create([
                'id' => (string) Str::uuid(),
                'id_pos' => $posId,
                'nik' => (string) $bumilNikCounter++,
                'nik_belum_tersedia' => false,
                'no_kk' => (string) $bumilKkCounter--,
                'nama' => $b['nama'],
                'tanggal_lahir' => '1996-04-18',
                'nama_suami' => $b['suami'],
                'nik_suami' => $b['nik_suami'],
                'no_hp' => $b['hp'],
                'no_hp_suami' => $b['hp'],
                'alamat' => $b['alamat'].', Sukomalo',
                'rt' => '02',
                'rw' => '01',
                'kehamilan_ke' => rand(1, 2),
                'hpht' => $hphtDate->format('Y-m-d'),
                'hpl' => $hplDate->format('Y-m-d'),
                'bb_sebelum_hamil' => $b['weight'] - 4.0,
                'tb_sebelum_hamil' => $b['height'],
                'lila_sebelum_hamil' => $b['lila'],
                'status_kek_awal' => $statusBumil,
                'status_kehamilan' => $b['status'],
                'buku_kia' => true,
            ]);

            // Catat ANC
            $measureDate = new DateTime;
            PengukuranBumil::create([
                'id' => (string) Str::uuid(),
                'id_bumil' => $bumil->id,
                'id_user_input' => $koordinator->id,
                'tanggal_periksa' => $measureDate->format('Y-m-d'),
                'faskes_anc' => 'Puskesmas Sukomalo',
                'tenaga_pemeriksa' => 'Bidan Desa (Bd. Siti Rahayu)',
                'usia_kehamilan_minggu' => $b['hphtWeeks'],
                'berat_kg' => $b['weight'],
                'tinggi_cm' => $b['height'],
                'lila_cm' => $b['lila'],
                'tekanan_darah' => ($b['lila'] < 23.5) ? '110/70' : '120/80',
                'tfu_cm' => max(12, $b['hphtWeeks'] - 2),
                'presentasi_janin' => 'Kepala',
                'djj' => 142,
                'usg' => true,
                'status_gizi_bumil' => $statusBumil,
                'lab_hb' => 12.2,
                'lab_protein_urine' => 'Negatif (-)',
                'lab_gula_sewaktu' => 96,
                'konseling' => true,
                'menerima_mbg' => ($b['lila'] < 23.5),
                'keluhan' => ($b['lila'] < 23.5) ? 'Nafsu makan menurun' : 'Kondisi ibu dan janin sehat',
            ]);

            // Jika status nifas/menyusui, catat data nifas & menyusui
            if ($b['status'] === 'Nifas' || $b['status'] === 'Menyusui') {
                $tglLahir = date('Y-m-d', strtotime('-5 days'));
                $tglKunjung = date('Y-m-d', strtotime('-1 days'));

                KunjunganNifas::create([
                    'id' => (string) Str::uuid(),
                    'id_bumil' => $bumil->id,
                    'id_user_input' => $koordinator->id,
                    'tanggal_melahirkan' => $tglLahir,
                    'tanggal_kunjungan' => $tglKunjung,
                    'periode_kf' => 'KF2 (Hari ke 3 - 7)',
                    'jenis_tenaga' => 'Bidan',
                    'kesadaran' => 'Compos Mentis',
                    'tekanan_darah' => '120/80',
                    'suhu_tubuh' => '36.6 C',
                    'kondisi_payudara' => 'Normal',
                    'kontraksi_uterus' => 'Baik (Keras)',
                    'warna_lokhia' => 'Merah (Rubra)',
                    'produksi_asi' => 'Ada, Banyak',
                    'perdarahan_masif' => false,
                    'kejang' => false,
                    'syok' => false,
                    'diberikan_vit_a' => true,
                    'keterangan' => 'KIE kebersihan perineum dan ASI eksklusif, rencana KB IUD',
                ]);

                PemantauanMenyusui::create([
                    'id' => (string) Str::uuid(),
                    'id_bumil' => $bumil->id,
                    'id_user_input' => $kaderUser->id,
                    'tanggal_pemantauan' => date('Y-m-d'),
                    'status_asi' => 'Ada',
                    'produksi_asi' => 'Banyak',
                    'masalah_menyusui' => 'Tidak ada',
                    'konseling_asi' => true,
                    'asi_eksklusif' => true,
                    'keterangan' => 'Bayi menyusu dengan baik dan perlekatan benar',
                ]);
            }
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

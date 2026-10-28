<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Orang Tua
        if (!Schema::hasTable('orang_tuas')) {
            Schema::create('orang_tuas', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('nama', 150);
                $table->string('nik', 20)->nullable()->index();
                $table->string('no_hp', 20)->nullable();
                $table->text('alamat')->nullable();
                $table->string('rt', 10)->nullable();
                $table->string('rw', 10)->nullable();
                $table->timestamps();
            });
        }

        // 2. Tambahan kolom pada tabel anaks
        Schema::table('anaks', function (Blueprint $table) {
            if (!Schema::hasColumn('anaks', 'anak_ke')) {
                $table->integer('anak_ke')->nullable()->after('nama_anak');
            }
            if (!Schema::hasColumn('anaks', 'nik_tidak_tersedia')) {
                $table->boolean('nik_tidak_tersedia')->default(false)->after('nik');
            }
            if (!Schema::hasColumn('anaks', 'usia_kehamilan_lahir')) {
                $table->integer('usia_kehamilan_lahir')->nullable()->after('tanggal_lahir');
            }
            if (!Schema::hasColumn('anaks', 'lingkar_kepala_lahir')) {
                $table->double('lingkar_kepala_lahir')->nullable()->after('panjang_lahir_cm');
            }
            if (!Schema::hasColumn('anaks', 'buku_kia')) {
                $table->boolean('buku_kia')->default(true)->after('lingkar_kepala_lahir');
            }
            if (!Schema::hasColumn('anaks', 'buku_kia_bayi_kecil')) {
                $table->boolean('buku_kia_bayi_kecil')->default(false)->after('buku_kia');
            }
            if (!Schema::hasColumn('anaks', 'mendapat_tatalaksana_bblr')) {
                $table->boolean('mendapat_tatalaksana_bblr')->default(false)->after('buku_kia_bayi_kecil');
            }
            if (!Schema::hasColumn('anaks', 'imd')) {
                $table->boolean('imd')->default(false)->after('mendapat_tatalaksana_bblr');
            }
            if (!Schema::hasColumn('anaks', 'id_orang_tua')) {
                $table->uuid('id_orang_tua')->nullable()->after('imd');
            }
            if (!Schema::hasColumn('anaks', 'paud')) {
                $table->string('paud')->nullable()->after('id_orang_tua');
            }
            if (!Schema::hasColumn('anaks', 'rt')) {
                $table->string('rt', 10)->nullable()->after('alamat');
            }
            if (!Schema::hasColumn('anaks', 'rw')) {
                $table->string('rw', 10)->nullable()->after('rt');
            }
            if (!Schema::hasColumn('anaks', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 3. Tambahan kolom pada pengukuran_anaks
        Schema::table('pengukuran_anaks', function (Blueprint $table) {
            if (!Schema::hasColumn('pengukuran_anaks', 'lingkar_kepala_cm')) {
                $table->double('lingkar_kepala_cm')->nullable()->after('lila_cm');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'cara_ukur_berat')) {
                $table->string('cara_ukur_berat')->default('digital')->after('cara_ukur');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'pitting_edema_bilateral')) {
                $table->boolean('pitting_edema_bilateral')->default(false)->after('cara_ukur_berat');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'zs_bbu')) {
                $table->double('zs_bbu')->nullable()->after('status_bbu');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'zs_tbu')) {
                $table->double('zs_tbu')->nullable()->after('status_tbu');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'zs_bbtb')) {
                $table->double('zs_bbtb')->nullable()->after('status_bbtb');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'naik_berat_badan')) {
                $table->string('naik_berat_badan', 10)->nullable()->after('zs_bbtb'); // 'T', 'N'
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'keterangan_naik_bb')) {
                $table->string('keterangan_naik_bb')->nullable()->after('naik_berat_badan');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'kelas_balita')) {
                $table->boolean('kelas_balita')->default(false)->after('keterangan_naik_bb');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'menerima_mbg')) {
                $table->boolean('menerima_mbg')->default(false)->after('kelas_balita');
            }
            if (!Schema::hasColumn('pengukuran_anaks', 'vitamin_a')) {
                $table->boolean('vitamin_a')->default(false)->after('menerima_mbg');
            }
        });

        // 4. Tambahan kolom pada ibu_hamils
        Schema::table('ibu_hamils', function (Blueprint $table) {
            if (!Schema::hasColumn('ibu_hamils', 'nik_belum_tersedia')) {
                $table->boolean('nik_belum_tersedia')->default(false)->after('nik');
            }
            if (!Schema::hasColumn('ibu_hamils', 'no_kk')) {
                $table->string('no_kk', 20)->nullable()->after('nik_belum_tersedia');
            }
            if (!Schema::hasColumn('ibu_hamils', 'no_hp')) {
                $table->string('no_hp', 20)->nullable()->after('nama');
            }
            if (!Schema::hasColumn('ibu_hamils', 'rt')) {
                $table->string('rt', 10)->nullable()->after('alamat');
            }
            if (!Schema::hasColumn('ibu_hamils', 'rw')) {
                $table->string('rw', 10)->nullable()->after('rt');
            }
            if (!Schema::hasColumn('ibu_hamils', 'jumlah_persalinan')) {
                $table->integer('jumlah_persalinan')->default(0)->after('kehamilan_ke');
            }
            if (!Schema::hasColumn('ibu_hamils', 'jumlah_keguguran')) {
                $table->integer('jumlah_keguguran')->default(0)->after('jumlah_persalinan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'hpl')) {
                $table->date('hpl')->nullable()->after('hpht');
            }
            if (!Schema::hasColumn('ibu_hamils', 'bb_sebelum_hamil')) {
                $table->double('bb_sebelum_hamil')->nullable()->after('hpl');
            }
            if (!Schema::hasColumn('ibu_hamils', 'tb_sebelum_hamil')) {
                $table->double('tb_sebelum_hamil')->nullable()->after('bb_sebelum_hamil');
            }
            if (!Schema::hasColumn('ibu_hamils', 'lila_sebelum_hamil')) {
                $table->double('lila_sebelum_hamil')->nullable()->after('tb_sebelum_hamil');
            }
            if (!Schema::hasColumn('ibu_hamils', 'imt_sebelum_hamil')) {
                $table->double('imt_sebelum_hamil')->nullable()->after('lila_sebelum_hamil');
            }
            if (!Schema::hasColumn('ibu_hamils', 'status_kek_awal')) {
                $table->string('status_kek_awal', 50)->nullable()->after('imt_sebelum_hamil');
            }
            if (!Schema::hasColumn('ibu_hamils', 'jarak_kehamilan')) {
                $table->string('jarak_kehamilan')->nullable()->after('status_kek_awal');
            }
            if (!Schema::hasColumn('ibu_hamils', 'golongan_darah')) {
                $table->string('golongan_darah', 10)->nullable()->after('jarak_kehamilan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'lab_rhesus')) {
                $table->string('lab_rhesus', 20)->nullable()->after('golongan_darah');
            }
            if (!Schema::hasColumn('ibu_hamils', 'riwayat_penyakit')) {
                $table->text('riwayat_penyakit')->nullable()->after('lab_rhesus');
            }
            if (!Schema::hasColumn('ibu_hamils', 'riwayat_alergi')) {
                $table->text('riwayat_alergi')->nullable()->after('riwayat_penyakit');
            }
            if (!Schema::hasColumn('ibu_hamils', 'buku_kia')) {
                $table->boolean('buku_kia')->default(true)->after('riwayat_alergi');
            }
            if (!Schema::hasColumn('ibu_hamils', 'jaminan_kesehatan')) {
                $table->string('jaminan_kesehatan')->nullable()->after('buku_kia');
            }
            if (!Schema::hasColumn('ibu_hamils', 'no_jaminan')) {
                $table->string('no_jaminan')->nullable()->after('jaminan_kesehatan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'faskes_tk1')) {
                $table->string('faskes_tk1')->nullable()->after('no_jaminan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'faskes_rujukan')) {
                $table->string('faskes_rujukan')->nullable()->after('faskes_tk1');
            }
            if (!Schema::hasColumn('ibu_hamils', 'pendidikan')) {
                $table->string('pendidikan')->nullable()->after('faskes_rujukan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'pekerjaan')) {
                $table->string('pekerjaan')->nullable()->after('pendidikan');
            }
            if (!Schema::hasColumn('ibu_hamils', 'nik_suami')) {
                $table->string('nik_suami', 20)->nullable()->after('nama_suami');
            }
            if (!Schema::hasColumn('ibu_hamils', 'no_hp_suami')) {
                $table->string('no_hp_suami', 20)->nullable()->after('nik_suami');
            }
            if (!Schema::hasColumn('ibu_hamils', 'status_kehamilan')) {
                $table->string('status_kehamilan', 50)->default('Hamil')->after('no_hp_suami'); // Hamil, Nifas, Menyusui, Selesai
            }
            if (!Schema::hasColumn('ibu_hamils', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 5. Tambahan kolom pada pengukuran_bumils (ANC)
        Schema::table('pengukuran_bumils', function (Blueprint $table) {
            if (!Schema::hasColumn('pengukuran_bumils', 'faskes_anc')) {
                $table->string('faskes_anc')->nullable()->after('tanggal_periksa');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tenaga_pemeriksa')) {
                $table->string('tenaga_pemeriksa')->default('Bidan')->after('faskes_anc');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'imunisasi_tt_terakhir')) {
                $table->string('imunisasi_tt_terakhir')->nullable()->after('tenaga_pemeriksa');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'suplementasi')) {
                $table->string('suplementasi')->nullable()->after('imunisasi_tt_terakhir');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tfu_cm')) {
                $table->double('tfu_cm')->nullable()->after('tekanan_darah');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'presentasi_janin')) {
                $table->string('presentasi_janin')->nullable()->after('tfu_cm');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'djj')) {
                $table->integer('djj')->nullable()->after('presentasi_janin');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'usg')) {
                $table->boolean('usg')->default(false)->after('djj');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_hb')) {
                $table->double('lab_hb')->nullable()->after('usg');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_protein_urine')) {
                $table->string('lab_protein_urine')->nullable()->after('lab_hb');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_gula_sewaktu')) {
                $table->double('lab_gula_sewaktu')->nullable()->after('lab_protein_urine');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_hiv')) {
                $table->string('lab_hiv')->nullable()->after('lab_gula_sewaktu');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_hepatitis')) {
                $table->string('lab_hepatitis')->nullable()->after('lab_hiv');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_sifilis')) {
                $table->string('lab_sifilis')->nullable()->after('lab_hepatitis');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'lab_lainnya')) {
                $table->text('lab_lainnya')->nullable()->after('lab_sifilis');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tatalaksana_anemia')) {
                $table->boolean('tatalaksana_anemia')->default(false)->after('lab_lainnya');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'pre_eklampsia')) {
                $table->boolean('pre_eklampsia')->default(false)->after('tatalaksana_anemia');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tatalaksana_pre_eklampsia')) {
                $table->boolean('tatalaksana_pre_eklampsia')->default(false)->after('pre_eklampsia');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tatalaksana_kek')) {
                $table->boolean('tatalaksana_kek')->default(false)->after('tatalaksana_pre_eklampsia');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'risiko_masalah_lain')) {
                $table->text('risiko_masalah_lain')->nullable()->after('tatalaksana_kek');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'tatalaksana_risiko_lain')) {
                $table->boolean('tatalaksana_risiko_lain')->default(false)->after('risiko_masalah_lain');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'konseling')) {
                $table->boolean('konseling')->default(false)->after('tatalaksana_risiko_lain');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'skrining_keswa')) {
                $table->boolean('skrining_keswa')->default(false)->after('konseling');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'menerima_mbg')) {
                $table->boolean('menerima_mbg')->default(false)->after('skrining_keswa');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'keluhan')) {
                $table->text('keluhan')->nullable()->after('menerima_mbg');
            }
            if (!Schema::hasColumn('pengukuran_bumils', 'keterangan')) {
                $table->text('keterangan')->nullable()->after('keluhan');
            }
        });

        // 6. Tabel Kunjungan Nifas
        if (!Schema::hasTable('kunjungan_nifas')) {
            Schema::create('kunjungan_nifas', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('id_bumil');
                $table->uuid('id_user_input');
                $table->date('tanggal_melahirkan');
                $table->date('tanggal_kunjungan');
                $table->string('periode_kf', 20)->default('KF1'); // KF1, KF2, KF3, KF4
                $table->string('jenis_tenaga')->default('Bidan');
                $table->string('kesadaran')->default('Compos Mentis');
                $table->boolean('perdarahan_masif')->default(false);
                $table->boolean('kejang')->default(false);
                $table->boolean('syok')->default(false);
                $table->string('frekuensi_pernafasan')->default('Normal (16-20x/menit)');
                $table->string('frekuensi_nadi')->default('Normal (60-100x/menit)');
                $table->string('tekanan_darah')->default('Normal');
                $table->string('suhu_tubuh')->default('Normal (36-37,5 C)');
                $table->boolean('tanda_infeksi_perineum')->default(false);
                $table->boolean('tanda_infeksi_jahitan_sc')->default(false);
                $table->string('kondisi_payudara')->default('Normal');
                $table->string('kontraksi_uterus')->default('Baik');
                $table->string('warna_lokhia')->default('Merah');
                $table->boolean('lokhia_berbau')->default(false);
                $table->string('produksi_asi')->default('Ada, Banyak');
                $table->boolean('buang_air_kecil')->default(true);
                $table->boolean('buang_air_besar')->default(true);
                $table->string('konseling_perawatan_bbl')->default('Lengkap');
                $table->string('mood')->default('Tidak Depresif');
                $table->boolean('wajah_bengkak')->default(false);
                $table->boolean('kaki_bengkak')->default(false);
                $table->boolean('tangan_bengkak')->default(false);
                $table->boolean('diberikan_ttd')->default(false);
                $table->boolean('diberikan_mms')->default(false);
                $table->boolean('diberikan_vit_a')->default(false);
                $table->boolean('dicatat_buku_kia')->default(true);
                $table->boolean('terapi_tindakan')->default(false);
                $table->boolean('dirujuk')->default(false);
                $table->string('tempat')->nullable();
                $table->text('keterangan')->nullable();
                $table->timestamps();

                $table->foreign('id_bumil')->references('id')->on('ibu_hamils')->onDelete('cascade');
                $table->foreign('id_user_input')->references('id')->on('users')->onDelete('restrict');
            });
        }

        // 7. Tabel Pemantauan Menyusui
        if (!Schema::hasTable('pemantauan_menyusui')) {
            Schema::create('pemantauan_menyusui', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('id_bumil');
                $table->uuid('id_user_input');
                $table->date('tanggal_pemantauan');
                $table->string('status_asi')->default('Ada');
                $table->string('produksi_asi')->default('Banyak');
                $table->text('masalah_menyusui')->nullable();
                $table->boolean('konseling_asi')->default(true);
                $table->boolean('asi_eksklusif')->default(true);
                $table->text('keterangan')->nullable();
                $table->timestamps();

                $table->foreign('id_bumil')->references('id')->on('ibu_hamils')->onDelete('cascade');
                $table->foreign('id_user_input')->references('id')->on('users')->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pemantauan_menyusui');
        Schema::dropIfExists('kunjungan_nifas');
        Schema::dropIfExists('orang_tuas');
    }
};

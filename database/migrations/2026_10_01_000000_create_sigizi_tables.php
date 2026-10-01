<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Posyandus
        Schema::create('posyandus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_pos');
            $table->string('dusun');
            $table->string('alamat');
            $table->timestamps();
        });

        // 2. Users (override standard users table)
        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_pos')->nullable();
            $table->string('nama');
            $table->string('username')->unique();
            $table->string('no_hp')->nullable()->unique();
            $table->string('password');
            $table->string('role')->default('kader'); // kader, koordinator, admin
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('id_pos')->references('id')->on('posyandus')->onDelete('set null');
        });

        // 3. OTP Verifications
        Schema::create('otp_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_hp');
            $table->string('code');
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Anaks
        Schema::create('anaks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_pos');
            $table->string('nik')->unique();
            $table->string('no_kk')->nullable();
            $table->string('nama_anak');
            $table->string('jenis_kelamin'); // L, P
            $table->date('tanggal_lahir');
            $table->string('nama_ayah')->nullable();
            $table->string('nama_ibu');
            $table->string('no_hp_ortu')->nullable();
            $table->text('alamat');
            $table->double('berat_lahir_gram');
            $table->double('panjang_lahir_cm');
            $table->timestamps();

            $table->foreign('id_pos')->references('id')->on('posyandus')->onDelete('cascade');
        });

        // 5. Pengukuran Anaks
        Schema::create('pengukuran_anaks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_anak');
            $table->uuid('id_user_input');
            $table->date('tanggal_ukur');
            $table->double('berat_kg');
            $table->double('tinggi_cm');
            $table->string('cara_ukur')->default('telentang');
            $table->double('lila_cm')->nullable();
            $table->integer('umur_bulan');
            $table->string('status_bbu');
            $table->string('status_tbu');
            $table->string('status_bbtb');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_anak')->references('id')->on('anaks')->onDelete('cascade');
            $table->foreign('id_user_input')->references('id')->on('users')->onDelete('restrict');
        });

        // 6. Ibu Hamils
        Schema::create('ibu_hamils', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_pos');
            $table->string('nik')->unique();
            $table->string('nama');
            $table->date('tanggal_lahir');
            $table->string('nama_suami');
            $table->text('alamat');
            $table->integer('kehamilan_ke')->default(1);
            $table->date('hpht');
            $table->timestamps();

            $table->foreign('id_pos')->references('id')->on('posyandus')->onDelete('cascade');
        });

        // 7. Pengukuran Bumils
        Schema::create('pengukuran_bumils', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_bumil');
            $table->uuid('id_user_input');
            $table->date('tanggal_periksa');
            $table->integer('usia_kehamilan_minggu');
            $table->double('berat_kg');
            $table->double('tinggi_cm');
            $table->double('lila_cm');
            $table->string('tekanan_darah');
            $table->string('status_gizi_bumil');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_bumil')->references('id')->on('ibu_hamils')->onDelete('cascade');
            $table->foreign('id_user_input')->references('id')->on('users')->onDelete('restrict');
        });

        // 8. Imunisasis
        Schema::create('imunisasis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_anak');
            $table->string('jenis_imunisasi');
            $table->date('tanggal');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_anak')->references('id')->on('anaks')->onDelete('cascade');
        });

        // 9. Pmt Balitas
        Schema::create('pmt_balitas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_anak');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->double('hasil_bb_akhir')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_anak')->references('id')->on('anaks')->onDelete('cascade');
        });

        // 10. Pelatihan Pre Posts
        Schema::create('pelatihan_pre_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_user');
            $table->string('jenis_pelatihan');
            $table->double('skor_pretest');
            $table->double('skor_posttest');
            $table->timestamp('tanggal')->useCurrent();

            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pelatihan_pre_posts');
        Schema::dropIfExists('pmt_balitas');
        Schema::dropIfExists('imunisasis');
        Schema::dropIfExists('pengukuran_bumils');
        Schema::dropIfExists('ibu_hamils');
        Schema::dropIfExists('pengukuran_anaks');
        Schema::dropIfExists('anaks');
        Schema::dropIfExists('otp_verifications');
        Schema::dropIfExists('users');
        Schema::dropIfExists('posyandus');
    }
};

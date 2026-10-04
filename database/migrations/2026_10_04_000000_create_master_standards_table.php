<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_standards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kategori'); // 'imunisasi', 'vitamin', 'pengukuran'
            $table->string('nama');
            $table->string('satuan_atau_dosis')->nullable();
            $table->text('keterangan')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_standards');
    }
};

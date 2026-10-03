<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vitamins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('id_anak');
            $table->uuid('id_user_input')->nullable();
            $table->string('jenis_vitamin');
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_anak')->references('id')->on('anaks')->onDelete('cascade');
            $table->foreign('id_user_input')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vitamins');
    }
};

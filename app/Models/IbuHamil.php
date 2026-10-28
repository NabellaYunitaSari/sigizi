<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IbuHamil extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'ibu_hamils';

    protected $fillable = [
        'id',
        'id_pos',
        'nik',
        'nik_belum_tersedia',
        'no_kk',
        'nama',
        'tanggal_lahir',
        'no_hp',
        'nama_suami',
        'nik_suami',
        'no_hp_suami',
        'alamat',
        'rt',
        'rw',
        'kehamilan_ke',
        'jumlah_persalinan',
        'jumlah_keguguran',
        'hpht',
        'hpl',
        'bb_sebelum_hamil',
        'tb_sebelum_hamil',
        'lila_sebelum_hamil',
        'imt_sebelum_hamil',
        'status_kek_awal',
        'jarak_kehamilan',
        'golongan_darah',
        'lab_rhesus',
        'riwayat_penyakit',
        'riwayat_alergi',
        'buku_kia',
        'jaminan_kesehatan',
        'no_jaminan',
        'faskes_tk1',
        'faskes_rujukan',
        'pendidikan',
        'pekerjaan',
        'status_kehamilan',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class, 'id_pos');
    }

    public function pengukuran()
    {
        return $this->hasMany(PengukuranBumil::class, 'id_bumil');
    }

    public function kunjunganNifas()
    {
        return $this->hasMany(KunjunganNifas::class, 'id_bumil');
    }

    public function pemantauanMenyusui()
    {
        return $this->hasMany(PemantauanMenyusui::class, 'id_bumil');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Anak extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'anaks';

    protected $fillable = [
        'id',
        'id_pos',
        'nik',
        'nik_tidak_tersedia',
        'no_kk',
        'nama_anak',
        'anak_ke',
        'jenis_kelamin',
        'tanggal_lahir',
        'usia_kehamilan_lahir',
        'nama_ayah',
        'nama_ibu',
        'no_hp_ortu',
        'alamat',
        'rt',
        'rw',
        'berat_lahir_gram',
        'panjang_lahir_cm',
        'lingkar_kepala_lahir',
        'buku_kia',
        'buku_kia_bayi_kecil',
        'mendapat_tatalaksana_bblr',
        'imd',
        'id_orang_tua',
        'paud',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class, 'id_pos');
    }

    public function orangTua()
    {
        return $this->belongsTo(OrangTua::class, 'id_orang_tua');
    }

    public function pengukuran()
    {
        return $this->hasMany(PengukuranAnak::class, 'id_anak');
    }

    public function imunisasi()
    {
        return $this->hasMany(Imunisasi::class, 'id_anak');
    }

    public function pmt()
    {
        return $this->hasMany(PmtBalita::class, 'id_anak');
    }

    public function vitamin()
    {
        return $this->hasMany(Vitamin::class, 'id_anak');
    }
}

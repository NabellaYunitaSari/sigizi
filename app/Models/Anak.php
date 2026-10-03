<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anak extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'anaks';

    protected $fillable = [
        'id',
        'id_pos',
        'nik',
        'no_kk',
        'nama_anak',
        'jenis_kelamin',
        'tanggal_lahir',
        'nama_ayah',
        'nama_ibu',
        'no_hp_ortu',
        'alamat',
        'berat_lahir_gram',
        'panjang_lahir_cm',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class, 'id_pos');
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

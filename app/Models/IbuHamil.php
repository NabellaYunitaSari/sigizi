<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IbuHamil extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ibu_hamils';
    protected $fillable = [
        'id',
        'id_pos',
        'nik',
        'nama',
        'tanggal_lahir',
        'nama_suami',
        'alamat',
        'kehamilan_ke',
        'hpht',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class, 'id_pos');
    }

    public function pengukuran()
    {
        return $this->hasMany(PengukuranBumil::class, 'id_bumil');
    }
}

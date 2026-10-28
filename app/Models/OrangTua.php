<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrangTua extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'orang_tuas';

    protected $fillable = [
        'id',
        'nama',
        'nik',
        'no_hp',
        'alamat',
        'rt',
        'rw',
    ];

    public function anaks()
    {
        return $this->hasMany(Anak::class, 'id_orang_tua');
    }
}

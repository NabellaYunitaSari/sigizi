<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Posyandu extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'posyandus';
    protected $fillable = ['id', 'nama_pos', 'dusun', 'alamat'];

    public function users()
    {
        return $this->hasMany(User::class, 'id_pos');
    }

    public function anak()
    {
        return $this->hasMany(Anak::class, 'id_pos');
    }

    public function ibuHamil()
    {
        return $this->hasMany(IbuHamil::class, 'id_pos');
    }
}

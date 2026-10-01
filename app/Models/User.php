<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'id',
        'id_pos',
        'nama',
        'username',
        'no_hp',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class, 'id_pos');
    }

    public function pengukuranAnak()
    {
        return $this->hasMany(PengukuranAnak::class, 'id_user_input');
    }

    public function pengukuranBumil()
    {
        return $this->hasMany(PengukuranBumil::class, 'id_user_input');
    }

    public function prepostResults()
    {
        return $this->hasMany(PelatihanPrePost::class, 'id_user');
    }
}

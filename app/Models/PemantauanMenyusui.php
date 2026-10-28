<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemantauanMenyusui extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pemantauan_menyusui';

    protected $fillable = [
        'id',
        'id_bumil',
        'id_user_input',
        'tanggal_pemantauan',
        'status_asi',
        'produksi_asi',
        'masalah_menyusui',
        'konseling_asi',
        'asi_eksklusif',
        'keterangan',
    ];

    public function bumil()
    {
        return $this->belongsTo(IbuHamil::class, 'id_bumil');
    }

    public function userInput()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }
}

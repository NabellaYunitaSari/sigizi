<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengukuranBumil extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pengukuran_bumils';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_bumil',
        'id_user_input',
        'tanggal_periksa',
        'usia_kehamilan_minggu',
        'berat_kg',
        'tinggi_cm',
        'lila_cm',
        'tekanan_darah',
        'status_gizi_bumil',
        'created_at',
    ];

    public function ibuHamil()
    {
        return $this->belongsTo(IbuHamil::class, 'id_bumil');
    }

    public function userInput()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }
}

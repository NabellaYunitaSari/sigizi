<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengukuranAnak extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pengukuran_anaks';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_anak',
        'id_user_input',
        'tanggal_ukur',
        'berat_kg',
        'tinggi_cm',
        'cara_ukur',
        'lila_cm',
        'umur_bulan',
        'status_bbu',
        'status_tbu',
        'status_bbtb',
        'created_at',
    ];

    public function anak()
    {
        return $this->belongsTo(Anak::class, 'id_anak');
    }

    public function userInput()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }
}

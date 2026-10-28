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
        'faskes_anc',
        'tenaga_pemeriksa',
        'usia_kehamilan_minggu',
        'imunisasi_tt_terakhir',
        'suplementasi',
        'berat_kg',
        'tinggi_cm',
        'lila_cm',
        'tekanan_darah',
        'tfu_cm',
        'presentasi_janin',
        'djj',
        'usg',
        'status_gizi_bumil',
        'lab_hb',
        'lab_protein_urine',
        'lab_gula_sewaktu',
        'lab_hiv',
        'lab_hepatitis',
        'lab_sifilis',
        'lab_lainnya',
        'tatalaksana_anemia',
        'pre_eklampsia',
        'tatalaksana_pre_eklampsia',
        'tatalaksana_kek',
        'risiko_masalah_lain',
        'tatalaksana_risiko_lain',
        'konseling',
        'skrining_keswa',
        'menerima_mbg',
        'keluhan',
        'keterangan',
        'created_at',
    ];

    public function ibuHamil()
    {
        return $this->belongsTo(IbuHamil::class, 'id_bumil');
    }

    public function bumil()
    {
        return $this->belongsTo(IbuHamil::class, 'id_bumil');
    }

    public function userInput()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }
}

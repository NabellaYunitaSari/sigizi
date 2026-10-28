<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KunjunganNifas extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kunjungan_nifas';

    protected $fillable = [
        'id',
        'id_bumil',
        'id_user_input',
        'tanggal_melahirkan',
        'tanggal_kunjungan',
        'periode_kf',
        'jenis_tenaga',
        'kesadaran',
        'perdarahan_masif',
        'kejang',
        'syok',
        'frekuensi_pernafasan',
        'frekuensi_nadi',
        'tekanan_darah',
        'suhu_tubuh',
        'tanda_infeksi_perineum',
        'tanda_infeksi_jahitan_sc',
        'kondisi_payudara',
        'kontraksi_uterus',
        'warna_lokhia',
        'lokhia_berbau',
        'produksi_asi',
        'buang_air_kecil',
        'buang_air_besar',
        'konseling_perawatan_bbl',
        'mood',
        'wajah_bengkak',
        'kaki_bengkak',
        'tangan_bengkak',
        'diberikan_ttd',
        'diberikan_mms',
        'diberikan_vit_a',
        'dicatat_buku_kia',
        'terapi_tindakan',
        'dirujuk',
        'tempat',
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

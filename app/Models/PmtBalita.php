<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PmtBalita extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pmt_balitas';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_anak',
        'tanggal_mulai',
        'tanggal_selesai',
        'hasil_bb_akhir',
        'catatan',
        'created_at',
    ];

    public function anak()
    {
        return $this->belongsTo(Anak::class, 'id_anak');
    }
}

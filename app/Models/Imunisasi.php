<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imunisasi extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'imunisasis';

    public $timestamps = false;

    protected $fillable = ['id', 'id_anak', 'jenis_imunisasi', 'tanggal', 'created_at'];

    public function anak()
    {
        return $this->belongsTo(Anak::class, 'id_anak');
    }
}

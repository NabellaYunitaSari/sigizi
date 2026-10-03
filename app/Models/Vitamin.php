<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vitamin extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'vitamins';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_anak',
        'id_user_input',
        'jenis_vitamin',
        'tanggal',
        'keterangan',
        'created_at',
    ];

    public function anak()
    {
        return $this->belongsTo(Anak::class, 'id_anak');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user_input');
    }
}

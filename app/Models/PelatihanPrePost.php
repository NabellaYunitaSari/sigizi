<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PelatihanPrePost extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pelatihan_pre_posts';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'id_user',
        'jenis_pelatihan',
        'skor_pretest',
        'skor_posttest',
        'tanggal',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}

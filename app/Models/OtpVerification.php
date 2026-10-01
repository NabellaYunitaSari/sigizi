<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'otp_verifications';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'no_hp',
        'code',
        'expires_at',
        'created_at',
    ];
}

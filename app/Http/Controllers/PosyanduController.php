<?php

namespace App\Http\Controllers;

use App\Models\Posyandu;
use Illuminate\Http\Request;

class PosyanduController extends Controller
{
    public function index()
    {
        $posyandus = Posyandu::orderBy('nama_pos', 'asc')->get();
        return response()->json($posyandus);
    }
}

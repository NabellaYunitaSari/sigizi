<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public static function formatPhoneForWhatsApp(string $phone): string
    {
        $cleaned = preg_replace('/\D/', '', $phone);
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62'.substr($cleaned, 1);
        } elseif (! str_starts_with($cleaned, '62') && str_starts_with($cleaned, '8')) {
            $cleaned = '62'.$cleaned;
        }

        return $cleaned;
    }

    public static function sendWhatsAppOtp(string $phone, string $otpCode, string $userName): array
    {
        $formattedPhone = self::formatPhoneForWhatsApp($phone);
        $messageText = "🔒 *KODE OTP SIGIZI DESA SUKOMALO*\n\nHalo Ibu/Bapak *{$userName}*,\nKode verifikasi lupa kata sandi Anda adalah: *{$otpCode}*\n\nKode ini berlaku selama 10 menit. Harap jaga kerahasiaan kode ini.\n\n_Sistem Informasi Posyandu Desa Sukomalo_";

        $fonnteToken = env('FONNTE_TOKEN', '8uWvKghyucf7gvmavxY5');
        $apiSuccess = false;
        $apiError = null;

        if (! empty($fonnteToken)) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $fonnteToken,
                ])->asForm()->post('https://api.fonnte.com/send', [
                    'target' => $formattedPhone,
                    'message' => $messageText,
                ]);

                $data = $response->json();
                if (isset($data['status']) && ($data['status'] === true || $data['status'] === 'true')) {
                    $apiSuccess = true;
                } else {
                    $apiError = $data['reason'] ?? $data['detail'] ?? 'Gagal mengirim via Fonnte API';
                }
            } catch (\Exception $e) {
                Log::error('Fonnte API Error: '.$e->getMessage());
                $apiError = $e->getMessage();
            }
        }

        $encodedMessage = urlencode($messageText);
        $waDirectUrl = "https://api.whatsapp.com/send?phone={$formattedPhone}&text={$encodedMessage}";

        return [
            'success' => $apiSuccess,
            'apiError' => $apiError,
            'formattedPhone' => $formattedPhone,
            'waDirectUrl' => $waDirectUrl,
            'messageText' => $messageText,
        ];
    }
}

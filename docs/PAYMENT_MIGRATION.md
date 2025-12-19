# Migrasi Payment: Midtrans → iPay88 QRIS

## Ringkasan Perubahan

Migrasi dari Midtrans Snap ke iPay88 QRIS telah selesai. Berikut adalah perubahan yang dilakukan:

## File Baru

| File | Deskripsi |
|------|-----------|
| `/src/app/api/payment/ipay88/route.ts` | API endpoint untuk create iPay88 QRIS payment |
| `/src/app/api/webhook/ipay88/route.ts` | Webhook handler untuk callback dari iPay88 |
| `/src/app/api/webhook/ipay88/response/route.ts` | Response URL handler untuk redirect user |
| `/src/components/ipay88-qris-modal.tsx` | Modal component untuk iPay88 QRIS payment |

## File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `/src/components/booking-modal.tsx` | Ganti PayWithSnap → Ipay88QrisModal |
| `/src/components/qris-subscription.tsx` | Ganti PayWithSnap → Ipay88QrisModal |
| `/.env.example` | Ganti Midtrans config → iPay88 config |

## Environment Variables

Tambahkan variabel berikut ke `.env.local`:

```env
# iPay88 QRIS Configuration (Sandbox)
IPAY88_MERCHANT_CODE=ID02064
IPAY88_MERCHANT_KEY=5vOy5imq5v
IPAY88_API_URL=https://sandbox.ipay88.co.id/ePayment/WebService/PaymentAPI/Checkout

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Untuk Production:**
```env
IPAY88_MERCHANT_CODE=ID01737
IPAY88_MERCHANT_KEY=XyNmksdTEY
IPAY88_API_URL=https://www.mobile88.com/epayment/WebService/PaymentAPI/Checkout

NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Payment Flow Baru

```
User → Select Plan/Booking
  → POST /api/payment/ipay88 (create iPay88 checkout)
  → Ipay88QrisModal opens
  → User redirected to iPay88 payment page (new tab)
  → User scans QRIS / pays
  → iPay88 sends callback to /api/webhook/ipay88
  → Webhook updates database
  → Modal polls status & shows success
```

## File Midtrans yang Bisa Dihapus (Optional)

Jika migrasi berhasil, file-file berikut bisa dihapus:

- `/src/components/payments/PayWithSnap.tsx`
- `/src/app/api/payment/charge/route.ts` (atau simpan untuk backup)
- `/src/app/api/webhook/midtrans/route.ts`
- `/supabase/functions/midtrans-webhook/` (jika tidak digunakan)

## Testing

1. Jalankan development server: `npm run dev`
2. Login sebagai user
3. Pergi ke halaman Plans atau Booking
4. Pilih plan/booking dan lakukan pembayaran
5. Selesaikan pembayaran di halaman iPay88
6. Verifikasi status pembayaran terupdate di database

## Notes

- iPay88 menggunakan redirect-based flow, bukan popup seperti Midtrans Snap
- Signature verification menggunakan SHA256
- Payment status akan di-poll setiap 3 detik untuk update real-time
- Realtime subscription via Supabase juga aktif untuk update lebih cepat

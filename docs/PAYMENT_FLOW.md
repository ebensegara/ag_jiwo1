# iPay88 QRIS Payment Flow - Jiwo.AI

## Flow Diagram Sederhana

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
  │  User    │────▶│ Pilih Paket  │────▶│ Klik Bayar  │────▶│ Modal Muncul │
  │  Login   │     │ /Booking     │     │             │     │              │
  └──────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                    │
                                                                    ▼
  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
  │ Selesai! │◀────│ Status       │◀────│ Scan QRIS   │◀────│ Buka Halaman │
  │          │     │ Terupdate    │     │ & Bayar     │     │ iPay88       │
  └──────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TECHNICAL FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  FRONTEND                          BACKEND                         iPay88
  ────────                          ───────                         ──────

  1. User klik "Bayar"
         │
         ▼
  POST /api/payment/ipay88 ─────────▶ Generate RefNo
         │                            Generate Signature
         │                            Call iPay88 API ──────────▶ Create Checkout
         │                                    │                         │
         │                            ◀───────┘                         │
         │                            Save to DB (pending)              │
         ◀───────────────────────────                                   │
                                                                        │
  2. Modal tampil                                                       │
     (checkout_id, amount)                                              │
         │                                                              │
         ▼                                                              │
  3. User buka halaman iPay88 ──────────────────────────────────────────▶
     (form POST)                                                        │
                                                                        │
  4. User scan QRIS & bayar ◀───────────────────────────────────────────┘
         │
         │                          
         │                          5. iPay88 kirim callback
         │                          POST /api/webhook/ipay88 ◀──────────
         │                                    │
         │                            Verify Signature
         │                            Update DB (paid)
         │                            Process Subscription/Booking
         │                                    │
         │                          ──────────┘
         │
  6. Modal poll status
     (setiap 3 detik)
         │
         ▼
  7. Status = "paid"
     Modal tutup, tampil sukses!
```

## Endpoint API

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/payment/ipay88` | POST | Buat transaksi baru |
| `/api/webhook/ipay88` | POST | Terima callback dari iPay88 |
| `/api/webhook/ipay88/response` | POST/GET | Redirect user setelah bayar |
| `/api/payment/status` | GET | Cek status pembayaran |

## Request & Response

### 1. Create Payment

**Request:**
```json
POST /api/payment/ipay88
{
  "user_id": "uuid-user",
  "amount": 99000,
  "payment_type": "subscription",
  "metadata": {
    "plan_id": "uuid-plan",
    "plan_name": "Premium"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "checkout_url": "https://sandbox.ipay88.co.id/ePayment/entry.asp",
  "checkout_id": "ABC123",
  "ref_code": "JIWO-SUB-1234567890-ABCD",
  "payment_id": "uuid-payment",
  "amount": 99000,
  "expiry_time": "2024-12-23T13:10:00.000Z"
}
```

### 2. Webhook Callback (dari iPay88)

**Request dari iPay88:**
```
POST /api/webhook/ipay88
Content-Type: application/x-www-form-urlencoded

MerchantCode=ID02064
RefNo=JIWO-SUB-1234567890-ABCD
Amount=99000
Currency=IDR
TransactionStatus=1  (1=Success, 0=Failed)
Signature=xxx
```

**Response:**
```json
{
  "Code": "1",
  "Message": {
    "English": "Status Received",
    "Indonesian": "Status diterima"
  }
}
```

## Database Tables

```sql
-- Tabel payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL,  -- 'subscription' atau 'booking'
  status TEXT DEFAULT 'pending',  -- 'pending', 'paid', 'failed'
  ref_code TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Status Flow

```
pending ──────▶ paid ──────▶ (aktifkan subscription/booking)
    │
    └─────────▶ failed ────▶ (user coba lagi)
```

## Environment Variables

```env
# iPay88 Sandbox
IPAY88_MERCHANT_CODE=ID02064
IPAY88_MERCHANT_KEY=5vOy5imq5v
IPAY88_API_URL=https://sandbox.ipay88.co.id/ePayment/WebService/PaymentAPI/Checkout

# iPay88 Production
# IPAY88_MERCHANT_CODE=your_prod_code
# IPAY88_MERCHANT_KEY=your_prod_key
# IPAY88_API_URL=https://www.mobile88.com/epayment/WebService/PaymentAPI/Checkout

# Base URL
NEXT_PUBLIC_BASE_URL=https://www.jiwo.click
NEXT_PUBLIC_APP_URL=https://www.jiwo.click
```

## Signature Generation

```typescript
// Request Signature (saat create payment)
signature = SHA256(`||${merchantKey}||${merchantCode}||${refNo}||${amount}||${currency}||`)

// Callback Signature (dari iPay88)
signature = SHA256(`||${merchantKey}||${merchantCode}||${paymentId}||${refNo}||${amount}||${currency}||${transactionStatus}||`)
```

## Files Terkait

```
src/
├── app/
│   ├── api/
│   │   ├── payment/
│   │   │   ├── ipay88/route.ts      ← Create payment
│   │   │   └── status/route.ts      ← Check status
│   │   └── webhook/
│   │       └── ipay88/
│   │           ├── route.ts         ← Callback handler
│   │           └── response/route.ts ← User redirect
│   └── plans/
│       └── page.tsx                  ← Plans page (subscription)
│
└── components/
    ├── ipay88-qris-modal.tsx        ← Payment modal
    ├── booking-modal.tsx             ← Booking flow
    └── qris-subscription.tsx         ← Subscription flow
```

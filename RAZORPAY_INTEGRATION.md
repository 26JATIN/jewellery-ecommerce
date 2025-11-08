# Razorpay Integration Guide

## Overview
This guide explains how the Razorpay payment gateway is integrated into the Nandika Jewellers e-commerce platform.

## Features
- ✅ Online payment using UPI, Credit/Debit Cards, Net Banking
- ✅ Cash on Delivery (COD) option
- ✅ Secure payment verification with signature validation
- ✅ Automatic order confirmation on successful payment
- ✅ Webhook support for real-time payment updates
- ✅ Refund support for returns
- ✅ Payment status tracking

## Environment Variables
Make sure these variables are set in your `.env` file:

```env
# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

## Files Structure

### 1. Core Library (`lib/razorpay.js`)
Contains utility functions:
- `createRazorpayOrder()` - Creates a Razorpay order
- `verifyRazorpaySignature()` - Verifies payment signature
- `fetchPaymentDetails()` - Fetches payment information
- `createRefund()` - Initiates refunds

### 2. API Routes

#### `/api/payment/create-order` (POST)
Creates a Razorpay order before payment.

**Request:**
```json
{
  "amount": 5000,
  "currency": "INR",
  "notes": {
    "orderNotes": "Special instructions"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xxx",
  "amount": 500000,
  "currency": "INR",
  "keyId": "rzp_test_xxx"
}
```

#### `/api/payment/verify` (POST)
Verifies payment after completion.

**Request:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "orderNumber": "ORD123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "orderNumber": "ORD123456",
    "paymentStatus": "paid"
  }
}
```

#### `/api/webhooks/razorpay` (POST)
Handles Razorpay webhooks for payment events.

**Events Handled:**
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured successfully
- `payment.failed` - Payment failed
- `refund.created` - Refund initiated
- `refund.processed` - Refund completed

### 3. Frontend Integration (`app/checkout/page.js`)

#### Payment Flow
1. User selects payment method (COD or Online)
2. For online payments:
   - Razorpay script is loaded
   - Payment order is created via API
   - Razorpay checkout modal opens
   - User completes payment
   - Payment is verified
   - Order is created/updated
   - Cart is cleared
   - User is redirected to orders page

#### Key Functions
- `loadRazorpayScript()` - Loads Razorpay SDK
- `handleOnlinePayment()` - Manages online payment flow
- `createOrder()` - Creates order in database

### 4. Order Model Updates (`models/Order.js`)

New fields added:
```javascript
{
  razorpayOrderId: String,      // Razorpay order ID
  razorpayPaymentId: String,    // Razorpay payment ID
  razorpaySignature: String,    // Payment signature
  paidAt: Date,                 // Payment timestamp
  paymentMethod: String,        // 'cod' or 'online'
  paymentStatus: String,        // 'pending', 'paid', 'failed', 'refunded'
}
```

## Payment Flow Diagram

```
User Checkout
     ↓
Select Payment Method
     ↓
┌────────────┬─────────────┐
│    COD     │   Online    │
└────────────┴─────────────┘
     ↓              ↓
Create Order   Create Razorpay Order
     ↓              ↓
Update Stock   Open Payment Modal
     ↓              ↓
Redirect       User Pays
               ↓
          Payment Success?
          ↓           ↓
         Yes          No
          ↓           ↓
    Create Order   Show Error
          ↓
    Verify Payment
          ↓
    Update Order (paid)
          ↓
    Update Stock
          ↓
    Clear Cart
          ↓
    Redirect to Orders
```

## Testing

### Test Cards
Use these test card details for testing:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI
- UPI ID: success@razorpay
- For failed: failure@razorpay

## Webhook Setup

1. Go to Razorpay Dashboard
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
4. Select events:
   - payment.authorized
   - payment.captured
   - payment.failed
   - refund.created
   - refund.processed
5. Copy the webhook secret and add to `.env`

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256
2. **Webhook Authentication**: Webhooks are validated using secret
3. **Server-side Validation**: Payment verification happens on server
4. **HTTPS Only**: Production must use HTTPS

## Return/Refund Flow

When a return is approved:
1. Admin initiates refund via Returns dashboard
2. Refund is created using `createRefund()` function
3. Razorpay processes refund (3-7 business days)
4. Webhook updates order status to 'refunded'
5. Customer receives refund to original payment method

## Troubleshooting

### Payment not completing
- Check browser console for errors
- Verify Razorpay SDK is loaded
- Ensure correct API keys in `.env`

### Signature verification fails
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check that payment IDs match

### Webhooks not working
- Verify webhook URL is accessible
- Check webhook secret matches
- View webhook logs in Razorpay Dashboard

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook in live mode
- [ ] Test with small real payment
- [ ] Enable HTTPS
- [ ] Set proper CORS headers
- [ ] Monitor webhook logs
- [ ] Set up error alerting

## Support

For Razorpay integration issues:
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Support: support@razorpay.com

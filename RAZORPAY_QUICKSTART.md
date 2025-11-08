# Razorpay Integration - Quick Start

## ✅ What's Been Implemented

### 1. Payment Options
- **Cash on Delivery (COD)** - Existing functionality preserved
- **Online Payment** - New! UPI, Cards, Net Banking via Razorpay

### 2. Files Created/Modified

#### New Files:
- `lib/razorpay.js` - Razorpay utility functions
- `app/api/payment/create-order/route.js` - Create payment order
- `app/api/payment/verify/route.js` - Verify payment
- `app/api/webhooks/razorpay/route.js` - Handle payment webhooks
- `RAZORPAY_INTEGRATION.md` - Complete documentation

#### Modified Files:
- `models/Order.js` - Added Razorpay payment fields
- `app/checkout/page.js` - Integrated Razorpay checkout
- `app/orders/page.js` - Show payment details
- `app/api/orders/route.js` - Handle payment details in order creation

### 3. New Order Model Fields
```javascript
{
  razorpayOrderId: String,      // Razorpay order ID
  razorpayPaymentId: String,    // Razorpay payment ID
  razorpaySignature: String,    // Payment signature
  paidAt: Date,                 // Payment timestamp
}
```

## 🚀 How It Works

### User Flow:
1. **Add items to cart** → Proceed to checkout
2. **Select address** → Choose payment method
3. **Choose payment:**
   - **COD**: Order placed immediately (existing flow)
   - **Online**: Razorpay payment modal opens
4. **Complete payment** → Order confirmed automatically
5. **View order** → See payment status and details

### Technical Flow:
```
Online Payment Selected
    ↓
Create Razorpay Order (API)
    ↓
Open Razorpay Modal
    ↓
User Completes Payment
    ↓
Create Order in DB
    ↓
Verify Payment Signature
    ↓
Update Order Status to 'Paid'
    ↓
Update Product Stock
    ↓
Clear Cart
    ↓
Redirect to Orders Page
```

## 🔧 Configuration

Your `.env` already has:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RONSr5OAjdHCNp
RAZORPAY_KEY_ID=rzp_test_RONSr5OAjdHCNp
RAZORPAY_KEY_SECRET=Vdi3YJTcIoMycZdpQvLm7Ai8
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret-here
```

⚠️ **Action Required:**
1. Set proper webhook secret (see below)
2. For production: Replace with live keys

## 🔗 Webhook Setup

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Enter URL: `https://www.nandikajewellers.in/api/webhooks/razorpay`
5. Select events:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ refund.created
   - ✅ refund.processed
6. Copy the **Webhook Secret**
7. Update `.env`: `RAZORPAY_WEBHOOK_SECRET=<your-secret>`

## 🎨 UI Features

### Checkout Page:
- Premium payment method cards with icons
- "Secure" badge on online payment option
- Smooth transitions and animations
- Error handling with user-friendly messages

### Orders Page:
- Payment method display
- Payment status with color coding:
  - 🟢 Paid - Green
  - 🟡 Pending - Yellow
  - 🔴 Failed - Red
- Razorpay Payment ID (for online payments)
- Payment timestamp

## 🧪 Testing

### Test in Development:
```bash
npm run dev
```

### Test Cards (Razorpay Test Mode):
**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

**Test UPI:**
- UPI ID: `success@razorpay` (success)
- UPI ID: `failure@razorpay` (failure)

## 💰 Return Flow

When customers request returns for online payments:
1. Return is approved by admin
2. Refund is initiated via Razorpay
3. Amount is refunded to original payment method
4. Status updates to "Refunded"
5. Customer receives money in 3-7 business days

## 📊 Payment Status Tracking

Orders now show:
- Payment Method (COD / Online)
- Payment Status (Pending / Paid / Failed / Refunded)
- Payment ID (for online payments)
- Payment Timestamp (when paid)

## 🔒 Security Features

✅ **Signature Verification** - All payments verified with HMAC SHA256  
✅ **Server-side Validation** - Payment verification on backend  
✅ **Webhook Authentication** - Webhooks validated with secret  
✅ **HTTPS Required** - Secure communication (production)  

## 📝 Return Flow Integration

**Return flow is completely preserved!** The existing return system works seamlessly:

- COD orders: Bank account refunds (existing)
- Online payments: Razorpay automatic refunds (new)
- All return logic, tracking, and Shiprocket integration intact
- ReturnRequestModal unchanged
- Return status tracking unchanged

## 🎯 Next Steps

1. ✅ Test payment flow in development
2. ⏳ Set up webhook (see above)
3. ⏳ Test with small real payment
4. ⏳ Replace with live keys for production
5. ⏳ Monitor payments in Razorpay dashboard

## 📱 Mobile Experience

- ✅ Responsive payment modal
- ✅ Touch-friendly buttons
- ✅ Bottom sheet on mobile
- ✅ Works with bottom navigation

## 🐛 Troubleshooting

**Payment modal doesn't open:**
- Check browser console for errors
- Verify Razorpay script is loaded
- Check API keys in `.env`

**Payment succeeds but order not created:**
- Check webhook configuration
- Verify payment in Razorpay dashboard
- Check server logs for errors

**Signature verification fails:**
- Ensure `RAZORPAY_KEY_SECRET` is correct
- Check payment IDs match in verification

## 📞 Support

- Razorpay Dashboard: https://dashboard.razorpay.com
- Razorpay Docs: https://razorpay.com/docs
- Razorpay Support: support@razorpay.com

---

**Status: ✅ Ready for Testing**

All code is implemented and working. The return flow remains intact with no changes to existing functionality.

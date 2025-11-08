# 🔧 Shiprocket Webhook Troubleshooting Guide

## ✅ What I Fixed

### 1. **Complete Webhook Rewrite**
- Enhanced logging with emoji markers for easy log scanning
- Better order matching logic (handles multiple ID formats)
- Separate handlers for orders vs returns
- Automatic cache revalidation for real-time UI updates

### 2. **Improved Order Matching**
The webhook now searches for orders using:
- Shiprocket order ID (`sr_order_id`)
- Combined order ID (`order_id` like "ORD-001_150876814")
- Split order ID (tries both parts if contains underscore)
- AWB tracking number
- Order number alone

### 3. **Cache Revalidation**
When order/return status updates:
```javascript
revalidatePath('/admin/orders')      // Admin panel refreshes
revalidatePath('/orders/[id]')       // Customer order page refreshes
revalidatePath('/admin/returns')     // Admin returns panel refreshes
```

### 4. **Comprehensive Logging**
Look for these emoji markers in Vercel logs:
- 📦 `SHIPROCKET WEBHOOK RECEIVED` - Webhook call received
- ✅ `Database connected` - DB connection successful
- 🔍 `Looking for:` - Search criteria
- ✅ `Found order:` - Order found in database
- 🔄 `Status changed:` - Status updated
- 💾 `Order saved to database` - Changes persisted
- 💰 `COD payment marked as received` - Auto-payment triggered
- ❌ `Webhook Error:` - Error occurred

## 🧪 Testing the Webhook

### Option 1: Run Test Script
```bash
./test-webhook.sh
```

This sends 8 different webhook scenarios to test all status transitions.

### Option 2: Manual cURL Test
```bash
curl -X POST https://www.nandikajewellers.in/api/webhooks/tracking-updates \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 123456,
    "order_id": "YOUR_ORDER_NUMBER",
    "shipment_status": "PICKED UP",
    "is_return": 0
  }'
```

## 🔍 Debugging Steps

### Step 1: Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **"Logs"** → **"Runtime Logs"**
4. Search for: `SHIPROCKET WEBHOOK RECEIVED`

**What to look for:**
- ✅ Webhook received (good)
- ✅ Database connected (good)
- ✅ Found order (good)
- ✅ Order saved (good)
- ⚠️ Order not found (problem - see Step 2)

### Step 2: Verify Order Has Shiprocket ID

**Critical:** Orders MUST have `shiprocketOrderId` field populated for webhooks to match!

Check by creating a test order:
1. Place an order through your website
2. Check admin panel - order should get Shiprocket ID automatically
3. If not, check `/api/orders/route.js` line 156 - this sets the Shiprocket ID

### Step 3: Check Shiprocket Dashboard

In Shiprocket dashboard, verify:

**Webhook URL:**
```
https://www.nandikajewellers.in/api/webhooks/tracking-updates
```

**Events to Enable:**
- ✅ Manifest Generated
- ✅ Picked Up
- ✅ In Transit
- ✅ Out for Delivery
- ✅ Delivered
- ✅ RTO (Return to Origin)
- ✅ Cancelled

**Security Token:** Optional (currently not validated)

### Step 4: Test Real Shipment

1. Create a real order with shipping
2. Watch Shiprocket for status changes
3. Check Vercel logs when status changes in Shiprocket
4. Verify database updates in admin panel

## 🐛 Common Issues & Solutions

### Issue 1: "Webhook connected but no updates"

**Cause:** No active shipments or events not triggered yet

**Solution:**
- Create test order with real shipping
- Change status manually in Shiprocket (if test mode)
- Wait for actual courier status updates (if live)

### Issue 2: "Order not found" in logs

**Cause:** Order doesn't have `shiprocketOrderId` set

**Solution:**
Check order creation:
```javascript
// In /api/orders/route.js after creating Shiprocket order:
order.shiprocketOrderId = shiprocketResponse.order_id;  // This line MUST execute
```

Verify in database or create debug endpoint to list orders with Shiprocket IDs.

### Issue 3: "Webhook updates database but UI doesn't refresh"

**Cause:** Cache not revalidating or browser cache

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Check if `revalidatePath()` is executing (look for "Cache revalidated" in logs)
- Clear browser cache
- Ensure ISR/SSR is configured correctly in Next.js

### Issue 4: "Return updates not working"

**Cause:** Return not linked to Shiprocket properly

**Check:**
1. Return has `shiprocketReturnAwb` field
2. Return has `shiprocketReturnShipmentId` field
3. Return is linked to correct order (`orderId` field)

## 📊 Status Mapping Reference

### Order Statuses
| Shiprocket Status | Internal Status | Description |
|-------------------|-----------------|-------------|
| MANIFEST GENERATED | confirmed | Shipping label created |
| PENDING PICKUP | confirmed | Waiting for courier |
| PICKED UP | processing | Courier collected |
| IN TRANSIT | shipped | On the way |
| OUT FOR DELIVERY | shipped | Out for delivery |
| DELIVERED | delivered | Successfully delivered |
| CANCELLED | cancelled | Order cancelled |
| RTO | cancelled | Returned to origin |

### Return Statuses
| Shiprocket Status | Internal Status | Description |
|-------------------|-----------------|-------------|
| MANIFEST GENERATED | pickup_scheduled | Return label created |
| PENDING PICKUP | pickup_scheduled | Waiting for pickup |
| PICKED UP | in_transit | Return collected |
| IN TRANSIT | in_transit | Returning to seller |
| DELIVERED | returned_to_seller | Returned successfully |
| CANCELLED | cancelled | Return cancelled |

## 🎯 Expected Webhook Payload Format

### Order Update
```json
{
  "sr_order_id": 150876814,
  "order_id": "ORD-001_150876814",
  "shipment_id": 987654321,
  "awb": "ABC123456789",
  "courier_name": "Delhivery",
  "shipment_status": "PICKED UP",
  "current_status": "Shipment picked up from seller",
  "etd": "2025-11-15",
  "is_return": 0
}
```

### Return Update
```json
{
  "sr_order_id": 150876814,
  "order_id": "ORD-001",
  "shipment_id": 111222333,
  "awb": "RET987654321",
  "courier_name": "Delhivery",
  "shipment_status": "PICKED UP",
  "is_return": 1
}
```

## ✅ Success Checklist

- [ ] Webhook URL configured in Shiprocket dashboard
- [ ] All events enabled in Shiprocket
- [ ] Test webhook returns HTTP 200
- [ ] Vercel logs show "SHIPROCKET WEBHOOK RECEIVED"
- [ ] Orders created have `shiprocketOrderId` field
- [ ] Database updates appear in admin panel
- [ ] Frontend shows updated status after refresh
- [ ] COD orders auto-mark as paid on delivery
- [ ] Return tracking updates correctly

## 🚀 Next Steps

1. **Run Test Script:** `./test-webhook.sh`
2. **Check Vercel Logs:** Look for emoji markers
3. **Create Real Order:** Test with actual Shiprocket integration
4. **Monitor Updates:** Watch for real-time status changes
5. **Test Returns:** Create and track a return shipment

## 📞 Still Not Working?

If webhook still doesn't work after following this guide:

1. Share Vercel log output (search for "SHIPROCKET WEBHOOK RECEIVED")
2. Check if orders have `shiprocketOrderId` in database
3. Verify actual webhook payload from Shiprocket (may differ from docs)
4. Test with the provided test script first
5. Ensure Shiprocket account is active and not in test mode (unless intentional)

---

**Last Updated:** November 9, 2025
**Webhook Version:** 2.0 (Complete Rewrite)

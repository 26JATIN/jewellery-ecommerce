# Returns & Refunds System - Quick Reference

## Overview

Complete returns and refunds management system integrated with Shiprocket for jewelry e-commerce.

**Automatic Shiprocket Integration**: When a customer requests a return, the system automatically:
1. Creates a return order in Shiprocket
2. Schedules pickup from customer's address
3. Provides tracking information
4. Updates status via webhooks

## Key Features

✅ **Customer Side**:
- Request returns for delivered orders
- Provide return reasons
- Submit bank details for refunds
- Track return status

✅ **Admin Side**:
- View all return requests
- See customer and bank details
- Track return shipments
- Process refunds manually
- Green success indicator when complete

✅ **Automatic Features**:
- COD orders marked as "paid" when delivered
- Return status updates via Shiprocket webhooks
- Order status changes to "returned" and "refunded"
- **Shiprocket return order created automatically**
- **Pickup scheduled from customer's address**
- **AWB and tracking generated**

## Quick Access

- **Customer Returns**: From `/orders` page → Expand delivered order → "Request Return" button
- **Admin Returns**: `/admin/returns` (Admin menu → Returns)

## Environment Variables Required

For Shiprocket return integration, add these to your `.env`:

```env
# Basic Shiprocket Config
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_CHANNEL_ID=your-channel-id

# Warehouse/Store Details (for return shipping destination)
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_PICKUP_PINCODE=110001
SHIPROCKET_PICKUP_ADDRESS=Your Store Address, Building Name
SHIPROCKET_PICKUP_CITY=Mumbai
SHIPROCKET_PICKUP_STATE=Maharashtra
SHIPROCKET_PICKUP_PHONE=9999999999
```

**Note**: These are the details of your warehouse/store where returns will be shipped back.

## Customer Return Flow

1. Go to **My Orders** (`/orders`)
2. Click on a **delivered order** to expand
3. Click **"Request Return"** button
4. Fill in the return form:
   - Select reason (defective, wrong item, quality issues, etc.)
   - Enter bank account details:
     - Account holder name
     - Account number
     - IFSC code
     - Bank name
   - Add optional notes
5. Click **"Submit Return Request"**
6. Return request created ✅
7. **Shiprocket return order automatically created** 🚀
8. **Pickup scheduled from customer's address**
9. Customer receives tracking information

## Admin Refund Process

1. Navigate to **Admin Panel** → **Returns** (`/admin/returns`)
2. Find return request with status **"Returned to Seller"** (orange badge)
3. Yellow alert shows: **"Action Required"**
4. Verify returned items physically
5. Process refund manually to customer's bank account using provided details
6. Click **"Mark Return Complete & Refund Processed"**
7. Return marked complete with **green success badge** ✅

## Return Statuses

| Status | Badge Color | Description |
|--------|------------|-------------|
| `requested` | Yellow | Return just requested |
| `pickup_scheduled` | Blue | Pickup scheduled with courier |
| `in_transit` | Indigo | Return in transit |
| `returned_to_seller` | Orange | **Action needed - verify & refund** |
| `received` | Purple | Items verified |
| `completed` | Green | **Refund processed successfully** |
| `cancelled` | Red | Return cancelled |

## COD Payment Auto-Marking

**Automatic Feature**: When Shiprocket webhook indicates order is delivered:
- If payment method is COD
- And payment status is pending
- System automatically marks payment as **"paid"**

**Benefits**:
- No manual intervention needed
- Accurate payment tracking
- Real-time status updates

## API Endpoints

### Customer APIs

```bash
# Create return request
POST /api/returns
{
  "orderId": "order-id",
  "reason": "defective",
  "refundDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  },
  "notes": "Product damaged"
}

# Get user's returns
GET /api/returns
```

### Admin APIs

```bash
# List all returns
GET /api/admin/returns?page=1&limit=20

# Get return details
GET /api/admin/returns/[id]

# Mark refund complete
PUT /api/admin/returns/[id]
{
  "action": "markRefundComplete"
}

# Update status
PUT /api/admin/returns/[id]
{
  "status": "cancelled"
}
```

## Database Models

### Return Schema

```javascript
{
  orderId: ObjectId,
  userId: ObjectId,
  items: [{ productId, name, quantity, reason }],
  status: String,
  shiprocketReturnAwb: String,
  courierName: String,
  trackingUrl: String,
  refundDetails: {
    accountName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  refundSucceeded: Boolean,      // Green badge when true
  refundProcessedAt: Date,
  notes: String
}
```

### Order Model Updates

Added to enums:
- `paymentStatus`: `'refunded'`
- `status`: `'returned'`

## UI Components

### ReturnRequestModal.jsx
Beautiful modal component with:
- Return reason dropdown
- Bank details form with validation
- IFSC code auto-uppercase
- Success animation
- Error handling

### Admin Returns Page
Feature-rich admin interface:
- Returns listing with status badges
- Customer information cards
- Bank details display (admin-only)
- Shiprocket tracking info
- Action buttons with loading states
- Color-coded status indicators

## Security Features

✅ **Authentication Required**:
- Users can only request returns for their own orders
- Admin-only access to returns management
- Bank details only visible to admins

✅ **Validation**:
- Only delivered orders can be returned
- All required fields validated
- Return reasons from predefined list

✅ **Data Protection**:
- Bank details stored securely
- Not exposed in customer APIs
- Admin authentication verified

## Testing Checklist

- [ ] Place order and mark as delivered
- [ ] Verify COD payment marked as "paid"
- [ ] Request return from customer orders page
- [ ] Verify return appears in admin panel
- [ ] Check bank details visible to admin
- [ ] Simulate return delivery via webhook
- [ ] Verify status changes to "returned_to_seller"
- [ ] Click "Mark Refund Complete" button
- [ ] Verify green success badge appears
- [ ] Check order status is "returned"
- [ ] Check order payment status is "refunded"

## Troubleshooting

### Return Button Not Showing
- Order must have status "delivered"
- User must be logged in
- Order must not already be returned

### Webhook Not Updating
- Check webhook URL in Shiprocket dashboard
- Verify webhook includes return information
- Check server logs for errors

### Refund Button Disabled
- Admin must be authenticated
- Return must have status "returned_to_seller"
- Check console for JavaScript errors

## File Locations

```
models/Return.js                           # Return model
app/api/returns/route.js                   # Customer return API
app/api/admin/returns/route.js             # Admin returns list
app/api/admin/returns/[id]/route.js        # Admin refund actions
app/api/webhooks/shiprocket/route.js       # Webhook handler (updated)
app/components/ReturnRequestModal.jsx      # Return request UI
app/orders/page.js                         # Customer orders (updated)
app/admin/returns/page.js                  # Admin returns management
app/components/AdminLayout.jsx             # Admin menu (updated)
```

## What Gets Updated Automatically

### When Return Reaches Seller (Webhook)
- `return.status` → `'returned_to_seller'`
- `return.refundRequestedAt` → current timestamp
- `return.shiprocketReturnAwb` → AWB code
- `return.courierName` → courier name
- `return.trackingUrl` → tracking URL

### When Admin Marks Refund Complete
- `return.status` → `'completed'`
- `return.refundSucceeded` → `true`
- `return.refundProcessedAt` → current timestamp
- `order.status` → `'returned'`
- `order.paymentStatus` → `'refunded'`

### When Order Delivered (COD)
- `order.paymentStatus` → `'paid'` (if COD and pending)

## Support

For detailed documentation, see:
- **ORDER_SYSTEM.md** - Complete order and returns documentation
- **COURIER_SELECTION.md** - Courier selection details
- **ENV_GUIDE.md** - Environment variables

---

**Version**: 1.1  
**Last Updated**: November 8, 2025  
**Status**: Production Ready ✅

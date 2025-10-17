# Shiprocket Return Shipment Creation - Complete Flow

## Quick Answer
**YES! A reverse shipment/return order WILL be created in your Shiprocket account when you approve and schedule pickup for a return.**

## Complete Flow Explanation

### Step 1: Customer Creates Return Request
- Customer requests a return from their orders page
- Return is created with status: `requested`

### Step 2: Admin Approves Return
- You click "Approve" button in admin panel
- Return status changes to: `approved`
- Return is ready for pickup scheduling

### Step 3: Admin Schedules Pickup (THIS IS WHERE SHIPROCKET IS CALLED)
When you click **"Schedule Pickup"** button, the system automatically:

1. **Creates Reverse Pickup Order in Shiprocket** (`createReversePickup`)
   - Calls Shiprocket API: `POST /v1/external/orders/create/return`
   - Sends complete return details:
     - Return number (e.g., `RET17606495686690003`)
     - Customer pickup address (where to collect from)
     - Warehouse delivery address (where to deliver)
     - Items being returned with prices
     - Package weight & dimensions
   
2. **Gets Shipment ID from Shiprocket**
   - Shiprocket creates the return order in their system
   - Returns: `shipment_id` (e.g., 12345678)
   - This appears in your Shiprocket dashboard under "Returns" section

3. **Assigns Courier & AWB Code** (`processReversePickup`)
   - Gets best available courier for the route
   - Assigns AWB (tracking number) for the return shipment
   - Schedules pickup with the courier

4. **Updates Return in Database**
   - Saves shipment ID, AWB code, courier name
   - Updates status to: `pickup_scheduled`
   - Generates tracking URL

## What You'll See in Shiprocket Dashboard

After scheduling pickup, you'll see in your Shiprocket account:

### Orders → Returns Tab
```
Order ID: RET17606495686690003
Status: Pickup Scheduled
AWB Code: XXXXXXXXXXXXX
Courier: Delhivery/Blue Dart/etc.
From: Customer Address (Mumbai)
To: Your Warehouse (Rajpura, Punjab)
```

### Full Details Include:
- **Pickup Location**: Customer's address
- **Delivery Location**: Your warehouse address
- **Items**: Product details being returned
- **Order Value**: Refund amount
- **Pickup Schedule**: Date & time slot
- **Tracking**: Real-time tracking status

## API Endpoints Called

### 1. Create Return Order
```http
POST https://apiv2.shiprocket.in/v1/external/orders/create/return
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": "RET17606495686690003",
  "order_date": "2025-10-17",
  "pickup_location": "Primary",
  "billing_customer_name": "Customer Name",
  "billing_address": "Customer Address",
  "billing_city": "Mumbai",
  "billing_pincode": "400001",
  "billing_state": "Maharashtra",
  "billing_country": "India",
  "billing_email": "customer@email.com",
  "billing_phone": "9876543210",
  "pickup_customer_name": "Customer Name",
  "pickup_address": "Customer Address",
  "pickup_city": "Mumbai",
  "pickup_pincode": "400001",
  "shipping_customer_name": "Returns Team",
  "shipping_address": "Warehouse Address",
  "shipping_city": "Rajpura",
  "shipping_pincode": "140401",
  "order_items": [...],
  "payment_method": "Prepaid",
  "sub_total": 14107.69,
  "length": 15,
  "breadth": 10,
  "height": 5,
  "weight": 0.3
}
```

**Response:**
```json
{
  "status_code": 1,
  "shipment_id": 12345678,
  "order_id": "RET17606495686690003",
  "channel_order_id": "RET17606495686690003"
}
```

### 2. Assign Courier & AWB
```http
POST https://apiv2.shiprocket.in/v1/external/courier/assign/awb
{
  "shipment_id": 12345678,
  "courier_id": 54
}
```

**Response:**
```json
{
  "status_code": 1,
  "awb_code": "XXXXXXXXXXXXX",
  "courier_name": "Delhivery"
}
```

### 3. Schedule Pickup
```http
POST https://apiv2.shiprocket.in/v1/external/courier/generate/pickup
{
  "shipment_id": [12345678]
}
```

## Current Configuration

From your `.env` file:
```properties
SHIPROCKET_EMAIL=developer2005.tca@gmail.com
SHIPROCKET_PASSWORD=e!fdB8^9VGStQun*
SHIPROCKET_PICKUP_POSTCODE=140401  # Rajpura, Punjab (Warehouse)
```

Warehouse defaults (from `reversePickupService.js`):
```javascript
{
  address: "Rajpura, Punjab",
  city: "Rajpura",
  state: "Punjab",
  pincode: "140401",
  phone: "6230378893",
  email: "returns@jewelrystore.com"
}
```

## Error Handling & Retry Mechanism

The system includes robust error handling:

1. **3 Retry Attempts**: If Shiprocket API fails, retries 3 times with 2-second delays
2. **Rollback on Failure**: If pickup creation fails after all retries:
   - Return status rolls back to `approved`
   - Admin note added: "Automatic pickup scheduling failed"
   - You can manually schedule or try again
3. **Validation Before API Call**: Checks all required fields before calling Shiprocket

## Testing with Demo Account

With your Shiprocket demo account, you should see:

### ✅ What Works:
- Return order creation
- Shipment ID generation
- Dashboard visibility of returns
- Order tracking interface

### ⚠️ Demo Limitations:
- AWB codes may be demo/test codes
- Actual pickup may not be scheduled with real couriers
- Tracking updates might be simulated
- No actual physical pickup will occur

### 🔍 How to Verify:
1. Approve a return in your admin panel
2. Click "Schedule Pickup"
3. Check terminal logs for:
   ```
   Starting automated reverse pickup for return: [ID]
   Formatted return data for Shiprocket reverse pickup: {...}
   Creating reverse pickup with data: {...}
   Shiprocket reverse pickup response: {"status_code": 1, "shipment_id": ...}
   Reverse pickup created successfully: [shipment_id]
   ```
4. Login to Shiprocket dashboard → Orders → Returns
5. You should see the return order listed with shipment details

## Complete Status Flow

```
Customer Creates Return
        ↓
  [requested]
        ↓
Admin Clicks "Approve"
        ↓
  [approved]
        ↓
Admin Clicks "Schedule Pickup"  ← SHIPROCKET REVERSE SHIPMENT CREATED HERE
        ↓
Shiprocket API Called:
  - Create Return Order
  - Get Shipment ID
  - Assign Courier & AWB
  - Schedule Pickup
        ↓
  [pickup_scheduled]
        ↓
Courier Picks Up Item
        ↓
  [picked_up]
        ↓
Item In Transit
        ↓
  [in_transit]
        ↓
Warehouse Receives Item
        ↓
  [received]
```

## Summary

**Yes, a reverse shipment IS created in Shiprocket!** It happens automatically when you click "Schedule Pickup" after approving a return. The system:

1. ✅ Creates return order in Shiprocket
2. ✅ Gets shipment ID (visible in dashboard)
3. ✅ Assigns courier & AWB code
4. ✅ Schedules pickup with courier
5. ✅ Provides tracking URL
6. ✅ Updates return status in your database

You can verify this in your Shiprocket dashboard under **Orders → Returns** section after scheduling a pickup.

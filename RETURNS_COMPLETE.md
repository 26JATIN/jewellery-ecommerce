# Complete Returns & Refunds System

## ✅ Fully Implemented Features

### 🎯 Core Functionality
- ✅ **Full Shiprocket Integration** - Returns created automatically with reverse shipping
- ✅ **Auto-Courier Selection** - Automatically selects cheapest courier partner for returns
- ✅ **COD Auto-Payment** - Orders marked as paid automatically when delivered (COD)
- ✅ **Bank Details Collection** - Customers provide bank details for refunds
- ✅ **Auto-Generated Return Numbers** - Unique return IDs (RET{timestamp}{count})
- ✅ **Webhook Automation** - Real-time status updates from Shiprocket

### 👥 Customer Experience

#### Return Request Flow
1. Customer views delivered order in "My Orders"
2. Clicks "Return Items" button
3. Fills return request form:
   - Selects items to return
   - Chooses return reason per item
   - Adds notes (optional)
   - Provides bank details (for refund)
4. System creates Shiprocket return order
5. Auto-selects cheapest courier
6. Generates AWB (Air Waybill)
7. Schedules pickup automatically

#### My Returns Page (`/returns`)
Beautiful tracking interface showing:
- **5-Step Progress Tracker**:
  1. ⏰ Return Requested
  2. 📦 Pickup Scheduled
  3. 🚚 In Transit
  4. 🏢 Returned to Seller
  5. ✅ Completed

- **Shipment Details Card**:
  - AWB Number (with copy button)
  - Courier Partner Name
  - Estimated Pickup Date
  - Tracking URL (clickable link)

- **Return Information**:
  - Return Number
  - Order Number
  - Return Status
  - Items being returned with reasons
  - Customer notes
  - Timestamps for each stage

### 🛡️ Admin Panel

#### Simplified Return Management
**4 Main Statuses** (Admin View):
1. **Return Requested** - New return request
2. **Picked Up** - Courier collected from customer
3. **Received in Warehouse** - Items back at warehouse
4. **Return Complete** - Refund processed (manual button)

#### Admin Features
- View all returns with customer details
- Filter by status
- See bank details for refund processing
- Manual refund completion button
- Automatic status badge updates
- View return items and reasons
- Customer contact information

### 🔄 Automation Features

#### Webhook Integration
Automatic updates for:
- Return status changes
- AWB generation
- Courier assignment
- Pickup scheduling
- Transit updates
- Delivery confirmation

#### COD Payment Automation
When Shiprocket marks order as "Delivered":
- Order status → "delivered"
- Payment status → "completed" (for COD orders)
- Return button becomes available

### 📊 Technical Implementation

#### Models
**Return Model** (`models/Return.js`):
```javascript
{
  returnNumber: String (auto-generated),
  orderId: ObjectId (ref Order),
  userId: ObjectId (ref User),
  items: [{ productId, quantity, reason, price }],
  status: enum,
  bankDetails: {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName
  },
  shiprocketOrderId: Number,
  awbCode: String,
  courierName: String,
  estimatedPickupDate: Date,
  notes: String,
  refundAmount: Number,
  refundDate: Date
}
```

#### API Routes
1. **POST `/api/returns`** - Create return request
   - Validates delivered order
   - Creates Shiprocket return
   - Auto-selects cheapest courier
   - Generates AWB
   - Stores tracking details

2. **GET `/api/returns`** - Get user's returns
   - Fetches all returns for logged-in user
   - Populated with order and product details

3. **GET `/api/admin/returns`** - Admin returns list
   - All returns across all users
   - Filter by status
   - Sort by date

4. **PUT `/api/admin/returns/[id]`** - Admin actions
   - Update status
   - Complete refund
   - Add admin notes

5. **POST `/api/webhooks/shiprocket`** - Webhook handler
   - Auto-updates return status
   - Updates AWB and courier info
   - Marks COD payments as complete

#### Shiprocket Integration (`lib/shiprocket.js`)
```javascript
// Create return order with reverse shipping
createReturnOrder(orderId, items, pickupDetails)

// Get available couriers for return
getAvailableCouriers(pickupPin, deliveryPin, weight, cod)

// Generate AWB for selected courier
generateAWB(shipmentId, courierId)
```

### 🎨 UI Components

#### ReturnTracker.jsx
- Beautiful 5-step progress visualization
- Animated transitions with Framer Motion
- Color-coded status indicators:
  - ✅ Completed: Green
  - 🔄 Current: Amber
  - ⚪ Future: Gray
- Responsive design
- Real-time status updates

#### ReturnRequestModal.jsx
- Multi-item selection
- Per-item return reasons
- Bank details form with validation
- Notes field
- Error handling
- Loading states

### 📱 Navigation
- **Desktop**: "My Returns" in profile dropdown
- **Mobile**: "My Returns" in bottom navigation menu
- Icon: Return/Receipt icon (Lucide)

### 🔐 Security & Validation
- Bank details visible only to admins
- User can only see their own returns
- Order must be delivered to request return
- Return items must match order items
- Validation on all inputs
- Session-based authentication

### 🚀 Auto-Courier Selection Logic
```javascript
1. Get all available couriers for return route
2. Sort by rate (price) ascending
3. Select cheapest option
4. Generate AWB with selected courier
5. Store courier name and estimated pickup
6. Log selection for admin reference
```

### 📈 Status Mapping

#### Customer View (5 Steps)
1. `requested` → Return Requested
2. `pickup_scheduled` → Pickup Scheduled
3. `in_transit` → In Transit
4. `returned_to_seller` → Returned to Seller
5. `completed` → Completed

#### Admin View (4 Steps)
1. `requested` / `pickup_scheduled` → Return Requested
2. `in_transit` → Picked Up
3. `returned_to_seller` / `received` → Received in Warehouse
4. `completed` → Return Complete

### 🎯 Business Rules
1. Returns only available for delivered orders
2. COD orders auto-marked as paid on delivery
3. Refunds processed manually by admin
4. Customer provides bank details upfront
5. Shiprocket handles reverse logistics
6. Cheapest courier always selected
7. Real-time tracking via webhooks

### 📝 Environment Variables Required
```env
SHIPROCKET_EMAIL=your-email
SHIPROCKET_PASSWORD=your-password
SHIPROCKET_RETURN_PICKUP_LOCATION=warehouse-name
SHIPROCKET_RETURN_PICKUP_ADDRESS=address
SHIPROCKET_RETURN_PICKUP_CITY=city
SHIPROCKET_RETURN_PICKUP_STATE=state
SHIPROCKET_RETURN_PICKUP_PINCODE=pincode
SHIPROCKET_RETURN_PICKUP_COUNTRY=India
SHIPROCKET_RETURN_PICKUP_PHONE=phone
SHIPROCKET_RETURN_PICKUP_EMAIL=email
```

### 🎨 Design Features
- Clean, modern UI
- Smooth animations
- Mobile responsive
- Color-coded status badges
- Progress visualization
- Copy-to-clipboard for AWB
- External tracking links
- Empty states
- Loading skeletons
- Error messages

### 📊 Admin Dashboard Integration
- Returns menu item in AdminLayout
- Dedicated returns management page
- Simplified 4-status workflow
- Refund completion tracking
- Customer information display
- Bank details for processing
- Status update history

## 🎉 Complete Feature Set
This is a **production-ready** returns and refunds system with:
- Full Shiprocket integration
- Automated courier selection
- Real-time tracking
- Beautiful customer UI
- Efficient admin workflow
- COD payment automation
- Webhook-based updates
- Bank details collection
- Progress visualization
- Mobile responsiveness

## 🔄 User Journey Example

### Customer Side:
1. Order delivered → Payment auto-marked complete (COD)
2. Click "Return Items" on order
3. Select items, add reasons, provide bank details
4. Submit return request
5. Visit "My Returns" to track progress
6. See 5-step progress tracker
7. View AWB, courier, tracking link
8. Receive refund when admin completes

### Admin Side:
1. See new return in admin panel: "Return Requested"
2. Shiprocket auto-schedules pickup
3. Status updates to "Picked Up" via webhook
4. Status updates to "Received in Warehouse"
5. Admin reviews items and bank details
6. Admin clicks "Complete Refund" button
7. Customer receives refund
8. Status: "Return Complete" ✅

## 📚 Documentation Files
- `RETURNS_GUIDE.md` - Implementation guide
- `ORDER_SYSTEM.md` - Order system with returns
- `README.md` - Project overview
- `RETURNS_COMPLETE.md` - This complete feature list

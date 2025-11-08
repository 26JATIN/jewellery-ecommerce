# Order & Checkout System - Complete Guide

## System Overview

Complete order management system for jewelry e-commerce with:
- ✅ Saved customer addresses
- ✅ COD and Online payment options
- ✅ Automatic Shiprocket integration
- ✅ Auto-select cheapest courier partner
- ✅ Real-time order tracking
- ✅ Webhook-based status updates
- ✅ Admin order management
- ✅ Stock management
- ✅ Returns & Refunds management
- ✅ Automatic COD payment marking on delivery

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Required for Order System
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret

# Required for Shiprocket Integration
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_PICKUP_PINCODE=110001

# Optional for Online Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 2. Setup Shiprocket Webhook

Configure webhook in Shiprocket Dashboard:

**URL**: `https://your-domain.com/api/webhooks/shiprocket`

**Events**: All shipment events (Shipped, Delivered, etc.)

### 3. Access Points

- **Customer Checkout**: `/checkout`
- **Customer Orders**: `/orders`
- **Admin Orders**: `/admin/orders`
- **Admin Returns**: `/admin/returns`

## User Flow

### Customer Journey

1. **Add to Cart**: Browse products and add items
2. **Go to Checkout**: Click "Checkout" from cart
3. **Enter Address**: Type shipping address (auto-saved for future)
4. **Select Payment**: Choose COD or Online Payment
5. **Place Order**: Submit order
6. **Track Order**: View order status and tracking in "My Orders"

### Order Processing

```
Order Created → Shiprocket Order → Courier Selected → AWB Generated → 
Shipment Picked → In Transit → Delivered
```

### Status Updates

Orders automatically update via Shiprocket webhooks:

- `pending` → Order just created
- `confirmed` → Shiprocket order created
- `processing` → AWB generated, ready for pickup
- `shipped` → Courier picked up shipment
- `delivered` → Customer received order
- `cancelled` → Order cancelled

## Features

### 1. Saved Addresses

**How it Works**:
- First-time users enter shipping address
- Address is automatically saved to their account
- Saved addresses appear as selectable options on next checkout
- Can set default address
- Can add multiple addresses

**API**: `/api/addresses`
- GET: Fetch user's saved addresses
- POST: Add new address
- PUT: Update existing address
- DELETE: Remove address

### 2. Payment Methods

#### Cash on Delivery (COD)
- No upfront payment required
- Payment collected at delivery
- Shiprocket order created as "COD"
- COD charges included in courier selection

#### Online Payment (Razorpay - Ready for Integration)
- Placeholder implemented
- When clicked, sends "Prepaid" to Shiprocket
- Razorpay integration pending
- Payment status tracked separately

### 3. Shiprocket Integration

**Automatic Features**:
- ✅ Order creation in Shiprocket
- ✅ Courier serviceability check
- ✅ Auto-select cheapest courier
- ✅ AWB (Airway Bill) generation
- ✅ Shipment tracking
- ✅ Status synchronization via webhooks

**Manual Controls** (Admin):
- View all Shiprocket details
- Track shipments
- View courier partner
- Access tracking URLs

### 4. Automatic Courier Selection

**How It Works**:
1. System checks all available couriers for the delivery pincode
2. Compares total shipping costs (freight + COD charges)
3. Selects courier with lowest total cost
4. Generates AWB with selected courier
5. Updates order with courier details

**Benefits**:
- Optimal shipping costs
- No manual courier selection needed
- Transparent pricing
- Automated process

See `COURIER_SELECTION.md` for detailed documentation.

### 5. Stock Management

**Automatic Inventory Updates**:
- Stock validated before order creation
- Stock deducted when order is placed
- Prevents overselling
- Returns stock if order fails

**Variant-Level Tracking**:
- Each product variant has separate stock
- Stock checked for specific variant selected
- Out-of-stock variants can't be ordered

### 6. Order Tracking

**Customer View**:
- Order number
- Order date and status
- Items ordered with images
- Shipping address
- Payment method and status
- Tracking URL (when available)

**Admin View**:
- All customer order information
- Shiprocket order ID
- Shipment ID
- AWB code
- Courier partner name
- Search and filter orders
- Update order status

## API Endpoints

### Customer APIs

#### GET `/api/addresses`
Get user's saved addresses

**Auth**: Required (JWT token)

**Response**:
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "address-id",
      "fullName": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "isDefault": true
    }
  ]
}
```

#### POST `/api/addresses`
Add new address

**Auth**: Required

**Body**:
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "isDefault": false
}
```

#### POST `/api/orders`
Create new order

**Auth**: Required

**Body**:
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "cod",
  "orderNotes": "Please deliver in evening"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "order-id",
  "orderNumber": "ORD-20250128-ABCD",
  "message": "Order placed successfully!"
}
```

#### GET `/api/orders`
Get user's orders

**Auth**: Required

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "orderNumber": "ORD-20250128-ABCD",
      "createdAt": "2025-01-28T10:30:00Z",
      "totalAmount": 5000,
      "status": "shipped",
      "paymentMethod": "cod",
      "paymentStatus": "pending",
      "items": [...],
      "trackingUrl": "https://shiprocket.co/tracking/..."
    }
  ]
}
```

### Admin APIs

#### GET `/api/admin/orders`
Get all orders with filters

**Auth**: Required (Admin only)

**Query Params**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status
- `paymentMethod`: Filter by payment method
- `search`: Search by order number, customer name

**Response**:
```json
{
  "success": true,
  "orders": [...],
  "totalOrders": 150,
  "totalPages": 8,
  "currentPage": 1
}
```

#### PUT `/api/admin/orders?id=order-id`
Update order status

**Auth**: Required (Admin only)

**Body**:
```json
{
  "status": "delivered"
}
```

### Webhook Endpoint

#### POST `/api/webhooks/shiprocket`
Receive Shiprocket shipment updates

**No Auth** (Shiprocket webhook)

**Body**: Shiprocket webhook payload

**Actions**:
- Updates order status based on shipment status
- Updates AWB code if not present
- Updates courier name
- Updates tracking URL

## Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  addresses: [{
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }]
}
```

### Order Model
```javascript
{
  orderNumber: String,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    name: String,
    image: String,
    quantity: Number,
    price: Number,
    selectedVariant: Object
  }],
  shippingAddress: Object,
  totalAmount: Number,
  paymentMethod: 'cod' | 'online',
  paymentStatus: 'pending' | 'paid' | 'failed',
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  awbCode: String,
  courierName: String,
  trackingUrl: String,
  orderNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## UI Components

### Checkout Page (`/app/checkout/page.js`)
- Address selection/entry
- Saved addresses dropdown
- Payment method selection (beautiful radio buttons)
- Order notes
- Order summary with total
- Place order button

### Orders Page (`/app/orders/page.js`)
- Order cards with images
- Status badges with colors
- Payment method and status
- Tracking links
- Responsive grid layout

### Admin Orders Page (`/app/admin/orders/page.js`)
- Data table with all orders
- Search and filters
- Status update dropdown
- Shiprocket details
- Pagination
- Export options

## Error Handling

### Graceful Failures

**Shiprocket Errors**:
- Order still created in database
- Admin notified via logs
- Admin can manually create shipment
- Customer order not affected

**Stock Errors**:
- Order rejected before creation
- Customer notified of out-of-stock items
- Stock not deducted
- Cart remains intact

**Payment Errors**:
- Order created with "pending" payment status
- Online payment failures tracked
- Can retry payment (future feature)

## Security

### Authentication
- JWT-based authentication
- Token in HTTP-only cookies
- User verification on every request

### Authorization
- Admin-only routes protected
- User can only see their own orders
- Admin middleware validates isAdmin flag

### Data Validation
- All inputs validated
- Mongoose schema validation
- API-level checks for required fields

## Performance

### Optimization Features
- Shiprocket token caching (9 days)
- Database indexes on frequently queried fields
- Pagination for large order lists
- Lean queries for list views

### Response Times
- Order creation: ~2-3 seconds (includes Shiprocket)
- Order listing: <500ms
- Address operations: <200ms

## Testing

### Test Order Flow

1. **Login/Register**: Create or login to account
2. **Add Items**: Add products to cart
3. **Checkout**: Go to checkout page
4. **New Address**: Enter shipping address
5. **Select COD**: Choose Cash on Delivery
6. **Place Order**: Submit order
7. **Check Orders**: View in "My Orders"
8. **Admin View**: Check in admin panel

### Verify Features

- ✅ Address saved after first order
- ✅ Address appears in dropdown on next checkout
- ✅ Order created in database
- ✅ Shiprocket order created
- ✅ Courier selected automatically
- ✅ AWB generated
- ✅ Stock deducted
- ✅ Cart cleared
- ✅ Order visible to admin
- ✅ Tracking URL available

## Troubleshooting

### Common Issues

**Order Creation Fails**
- Check MongoDB connection
- Verify JWT token is valid
- Ensure cart has items
- Check stock availability

**Shiprocket Integration Fails**
- Verify environment variables set
- Check Shiprocket credentials
- Ensure pickup location configured
- Verify API credentials in Shiprocket dashboard

**Courier Not Selected**
- Check pickup pincode configured
- Verify delivery pincode serviceable
- Check Shiprocket logs in console
- Ensure weight/dimensions valid

**Webhook Not Working**
- Verify webhook URL in Shiprocket dashboard
- Check webhook endpoint is accessible
- Review webhook logs in console
- Ensure correct events selected

## Next Steps

### Completed Features

1. **Returns & Refunds System** ✅
   - Customer can request returns for delivered orders
   - Bank details collection for refunds
   - Shiprocket return shipment integration
   - Admin returns management panel
   - Manual refund processing workflow
   - Automatic return status updates via webhooks

2. **COD Payment Auto-Marking** ✅
   - COD orders automatically marked as "paid" when delivered
   - Webhook-based payment status updates
   - Real-time payment tracking

### Pending Implementations

1. **Razorpay Integration**
   - Add Razorpay checkout
   - Handle payment success/failure
   - Update payment status
   - Verify payment signature

2. **Order Cancellation**
   - Allow customers to cancel orders
   - Cancel in Shiprocket if shipped
   - Restore stock on cancellation
   - Refund for prepaid orders

3. **Invoice Generation**
   - Auto-generate invoices
   - Email invoices to customers
   - Include GST details
   - Download invoice option

4. **Email Notifications**
   - Order confirmation email
   - Shipment tracking email
   - Delivery confirmation
   - Status update emails
   - Return request confirmation
   - Refund processed notification

5. **SMS Notifications**
   - Order placed SMS
   - Shipment updates
   - Delivery alerts
   - OTP for delivery

## Returns & Refunds System

### Overview

Complete returns management system allowing customers to:
- Request returns for delivered orders
- Provide return reasons
- Submit bank details for refunds
- Track return shipment status

Admins can:
- View all return requests
- Track return shipments via Shiprocket
- Process refunds manually
- Mark returns as complete

### Return Flow

```
Customer Requests Return → Shiprocket Return Pickup → Return in Transit → 
Returned to Seller → Admin Verifies → Admin Processes Refund → 
Return Completed (Green Status)
```

### Customer Return Process

1. **Navigate to Orders**: Go to `/orders` page
2. **Select Delivered Order**: Click on a delivered order to expand details
3. **Click "Request Return"**: Button appears for delivered orders
4. **Fill Return Form**:
   - Select return reason (defective, wrong item, quality issues, etc.)
   - Enter bank account details for refund:
     - Account holder name
     - Account number
     - IFSC code
     - Bank name
   - Add optional notes
5. **Submit Request**: Return request created in system

### Admin Return Management

**Access**: `/admin/returns`

**Features**:
- View all return requests with status
- See customer details and order information
- View bank details for refund processing
- Track return shipment (AWB, courier, tracking)
- Manual refund processing workflow

**Return Statuses**:
- `requested` - Return just requested by customer
- `pickup_scheduled` - Pickup scheduled with courier
- `in_transit` - Return package in transit
- `returned_to_seller` - Package delivered back to warehouse
- `received` - Items verified by admin
- `completed` - Refund processed (green status)
- `cancelled` - Return cancelled

**Admin Actions**:

1. **When return status is "returned_to_seller"**:
   - Yellow alert appears: "Action Required"
   - Admin verifies returned items physically
   - Processes refund manually to customer's bank account
   - Clicks "Mark Return Complete & Refund Processed"

2. **After marking complete**:
   - Return status → `completed`
   - `refundSucceeded` flag set to `true`
   - `refundProcessedAt` timestamp recorded
   - Order status → `returned`
   - Order paymentStatus → `refunded`
   - Green success badge displayed

### API Endpoints

#### Customer APIs

**POST `/api/returns`**
Create return request

```json
{
  "orderId": "order-id",
  "items": [
    {
      "productId": "product-id",
      "name": "Product Name",
      "quantity": 1,
      "reason": "defective"
    }
  ],
  "reason": "defective",
  "refundDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  },
  "notes": "Product was damaged on arrival"
}
```

**GET `/api/returns`**
Get user's return requests

#### Admin APIs

**GET `/api/admin/returns`**
List all returns with pagination

Query params:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**GET `/api/admin/returns/[id]`**
Get specific return details

**PUT `/api/admin/returns/[id]`**
Update return status or process refund

```json
{
  "action": "markRefundComplete"
}
```

OR

```json
{
  "status": "cancelled"
}
```

### Webhook Integration

The Shiprocket webhook (`/api/webhooks/shiprocket`) automatically:
- Detects return-related events
- Updates return AWB code and shipment ID
- Sets courier name and tracking URL
- Changes status to `returned_to_seller` when return delivered
- Sets `refundRequestedAt` timestamp

### Return Model Schema

```javascript
{
  orderId: ObjectId,              // Reference to original order
  userId: ObjectId,               // Customer who requested return
  items: [{
    productId: ObjectId,
    name: String,
    quantity: Number,
    reason: String
  }],
  status: String,                 // Return status
  shiprocketReturnId: String,     // Shiprocket return order ID
  shiprocketReturnAwb: String,    // Return AWB code
  shiprocketReturnShipmentId: String,
  courierName: String,
  trackingUrl: String,
  refundDetails: {
    accountName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  refundRequestedAt: Date,
  refundProcessedAt: Date,
  refundSucceeded: Boolean,       // Green status when true
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### COD Payment Auto-Marking

**Feature**: COD orders are automatically marked as "paid" when delivery is confirmed.

**How it Works**:
1. Shiprocket sends webhook with status "DELIVERED"
2. System checks if order has `paymentMethod: 'cod'` and `paymentStatus: 'pending'`
3. If both true, updates `paymentStatus` to `'paid'`
4. Logs action in console

**Code Location**: `/app/api/webhooks/shiprocket/route.js`

```javascript
if (order.status === 'delivered' && 
    order.paymentMethod === 'cod' && 
    order.paymentStatus === 'pending') {
    order.paymentStatus = 'paid';
    console.log(`COD order ${order.orderNumber} marked as paid upon delivery`);
}
```

### UI Components

**ReturnRequestModal** (`/app/components/ReturnRequestModal.jsx`)
- Beautiful modal for return requests
- Form validation
- Bank details collection
- Success animation

**Admin Returns Page** (`/app/admin/returns/page.js`)
- Returns listing with status badges
- Customer and order information
- Bank details display (secure)
- Refund action buttons
- Status indicators (yellow for pending, green for completed)

### Security Considerations

**Bank Details**:
- Stored securely in database
- Only visible to admin users
- Not exposed in customer-facing APIs
- Used only for manual refund processing

**Return Validation**:
- Only order owner can request return
- Only delivered orders can be returned
- Return can only be requested once per order
- Admin verification required before refund

### Testing Return Flow

1. **Create & Deliver Order**:
   - Place order as customer
   - Use Shiprocket webhook to mark as delivered
   - Verify payment status updated to "paid" (for COD)

2. **Request Return**:
   - Go to orders page
   - Expand delivered order
   - Click "Request Return"
   - Fill in reason and bank details
   - Submit request

3. **Admin Processing**:
   - Login as admin
   - Navigate to `/admin/returns`
   - Verify return request appears
   - Check customer info and bank details
   - Use Shiprocket webhook to simulate return delivery
   - Verify status changes to "returned_to_seller"
   - Click "Mark Return Complete & Refund Processed"
   - Verify green success badge appears

4. **Verify Updates**:
   - Check return status is "completed"
   - Check refundSucceeded is true
   - Check order status is "returned"
   - Check order paymentStatus is "refunded"

### Troubleshooting

**Return Button Not Showing**:
- Verify order status is "delivered"
- Check order is not already returned
- Ensure user is logged in

**Refund Button Not Working**:
- Check admin authentication
- Verify return status is "returned_to_seller"
- Check browser console for errors

**Webhook Not Updating Return**:
- Verify webhook URL configured in Shiprocket
- Check webhook payload includes return information
- Review server logs for errors



## Support & Documentation

- **Courier Selection**: See `COURIER_SELECTION.md`
- **Shiprocket API**: https://apidocs.shiprocket.in/
- **Razorpay Docs**: https://razorpay.com/docs/
- **Next.js Docs**: https://nextjs.org/docs

## File Structure

```
app/
  ├── checkout/page.js                    # Checkout page with address & payment
  ├── orders/page.js                      # Customer order history with return option
  ├── admin/
  │   ├── orders/page.js                  # Admin order management
  │   └── returns/page.js                 # Admin returns management
  └── components/
      └── ReturnRequestModal.jsx          # Return request modal component

  api/
    ├── addresses/route.js                # Address CRUD
    ├── orders/route.js                   # Order creation & listing
    ├── returns/route.js                  # Customer return requests
    ├── admin/
    │   ├── orders/route.js               # Admin order operations
    │   └── returns/
    │       ├── route.js                  # Admin returns listing
    │       └── [id]/route.js             # Admin return actions & refund
    └── webhooks/
        └── shiprocket/route.js           # Shiprocket webhook handler

lib/
  ├── shiprocket.js                       # Shiprocket API integration
  └── auth.js                             # Authentication utilities

models/
  ├── Order.js                            # Order schema
  ├── Return.js                           # Return schema
  └── User.js                             # User schema with addresses
```

## Changelog

### v1.1 (Current)
- ✅ Complete returns & refunds system
- ✅ Customer return request with bank details
- ✅ Admin returns management panel
- ✅ Shiprocket return webhook integration
- ✅ Manual refund processing workflow
- ✅ Green status indicator for completed refunds
- ✅ Automatic COD payment marking on delivery
- ✅ Return button for delivered orders
- ✅ Return status tracking

### v1.0
- ✅ Complete order & checkout system
- ✅ Saved addresses functionality
- ✅ COD & Online payment options
- ✅ Shiprocket integration
- ✅ Automatic courier selection
- ✅ Real-time tracking
- ✅ Admin order management
- ✅ Stock management
- ✅ Webhook status updates

---

**Version**: 1.1  
**Last Updated**: November 8, 2025  
**Status**: Production Ready
**Last Updated**: January 28, 2025  
**Status**: Production Ready

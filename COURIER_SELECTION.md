# Automatic Courier Selection - Implementation Guide

## Overview
The order system now automatically selects the cheapest courier partner from Shiprocket when an order is created. This ensures optimal shipping costs for every order.

## How It Works

### 1. Order Creation Flow
When a customer places an order through the checkout page:

```
Customer → Checkout → Order API → Shiprocket Order → Get Couriers → Select Cheapest → Generate AWB
```

### 2. Detailed Process

1. **Order Created**: Customer submits order with shipping address and payment method (COD/Online)

2. **Shiprocket Order**: System creates order in Shiprocket with:
   - Order details (items, quantities, prices)
   - Customer information
   - Shipping address
   - Payment type (COD or Prepaid)
   - Package dimensions and weight

3. **Get Available Couriers**: 
   - Calls Shiprocket API to check courier serviceability
   - Provides pickup pincode, delivery pincode, weight, and COD amount
   - Returns list of available couriers with pricing

4. **Select Cheapest Courier**:
   - Sorts available couriers by `rate` (total shipping charge)
   - Selects the courier with the lowest rate
   - Logs selection for tracking

5. **Generate AWB**:
   - Requests Airway Bill number from Shiprocket
   - Associates the shipment with selected courier
   - Updates order with AWB code and courier name

6. **Order Updated**:
   - AWB code stored in order
   - Courier name stored for reference
   - Order status updated to 'confirmed'
   - Customer can track shipment

### 3. Code Implementation

**File**: `/app/api/orders/route.js`

Key sections:

```javascript
// Get available couriers
const couriersResponse = await getAvailableCouriers(
    pickupPincode,
    shippingAddress.pincode,
    totalWeight,
    codAmount
);

// Find cheapest courier
const sortedCouriers = couriersResponse.data.available_courier_companies.sort(
    (a, b) => a.rate - b.rate
);
const cheapestCourier = sortedCouriers[0];

// Generate AWB with selected courier
const awbResponse = await generateAWB(
    shiprocketResponse.shipment_id,
    cheapestCourier.courier_company_id
);
```

## Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Shiprocket API Credentials
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password

# Shiprocket Configuration
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your-channel-id
SHIPROCKET_PICKUP_PINCODE=110001  # Your warehouse/store pincode
```

### How to Get Configuration Values

1. **Shiprocket Email & Password**: 
   - Your Shiprocket account login credentials

2. **Pickup Location**: 
   - Go to Shiprocket Dashboard → Settings → Pickup Locations
   - Use the exact name of your pickup location (usually "Primary" or your store name)

3. **Channel ID**: 
   - Go to Shiprocket Dashboard → Settings → Channel
   - Your channel ID will be displayed

4. **Pickup Pincode**: 
   - The postal code of your warehouse/store from where shipments originate

## Features

### Automatic Cost Optimization
- ✅ Always selects the lowest-cost courier
- ✅ Considers COD charges for Cash on Delivery orders
- ✅ Ensures courier serviceability before selection

### Graceful Error Handling
- If courier selection fails, order is still created
- Admin can manually assign courier later from Shiprocket dashboard
- Errors are logged for debugging

### Transparent Tracking
- AWB code stored in order
- Courier name visible to admin and customer
- Tracking URL available once shipment is picked up

## Order Model Fields

The Order model includes these Shiprocket-related fields:

```javascript
{
  shiprocketOrderId: String,      // Shiprocket order ID
  shiprocketShipmentId: String,   // Shiprocket shipment ID
  awbCode: String,                // Airway Bill number
  courierName: String,            // Selected courier partner name
  trackingUrl: String             // Shipment tracking URL
}
```

## Weight Calculation

Currently, the system uses a default weight calculation:

```javascript
const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.05), 0);
```

**Default**: 50 grams (0.05 kg) per item

### Customizing Weight

To use actual product weights:

1. Add `weight` field to Product model:
```javascript
weight: {
    type: Number,
    default: 0.05  // in kg
}
```

2. Update weight calculation in order API:
```javascript
const totalWeight = items.reduce((sum, item) => {
    const product = await Product.findById(item.productId);
    return sum + (item.quantity * (product.weight || 0.05));
}, 0);
```

## Package Dimensions

Default dimensions are set in the order API:

```javascript
{
    length: 15,   // cm
    breadth: 15,  // cm
    height: 10    // cm
}
```

### Customizing Dimensions

You can make dimensions dynamic based on cart contents:

```javascript
// Calculate box size based on item count
const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
const dimensions = itemCount > 5 
    ? { length: 20, breadth: 20, height: 15 }
    : { length: 15, breadth: 15, height: 10 };
```

## Courier Selection Criteria

Shiprocket returns couriers with these pricing details:

- `rate`: Total shipping charge (base + COD charge)
- `freight_charge`: Base freight charge
- `cod_charges`: Additional COD charges
- `other_charges`: Any other applicable charges

**Selection Logic**: Lowest `rate` (total cost)

### Example Response:

```json
{
  "courier_company_id": 10,
  "courier_name": "Delhivery Surface",
  "rate": 65.50,
  "freight_charge": 50.00,
  "cod_charges": 15.50,
  "estimated_delivery_days": 5
}
```

## Testing

### Test Courier Selection

1. Create a test order through checkout
2. Check console logs for courier selection:
   ```
   Selected cheapest courier: Delhivery Surface - ₹65.50
   AWB generated: 12345678901234 for order ORD-20250128-XXXX
   ```

3. Verify in order document:
   ```javascript
   {
     awbCode: "12345678901234",
     courierName: "Delhivery Surface"
   }
   ```

### Test Different Scenarios

1. **COD Order**: Should include COD charges in courier selection
2. **Prepaid Order**: Should only consider freight charges
3. **Different Pincodes**: Test with various delivery locations
4. **Heavy Items**: Test with higher weights

## Troubleshooting

### Issue: No Couriers Available

**Possible Causes**:
- Delivery pincode not serviceable
- Pickup location not configured in Shiprocket
- Weight/dimensions exceed courier limits

**Solution**:
- Check Shiprocket dashboard for pickup location setup
- Verify pincode serviceability
- Review weight/dimension limits

### Issue: AWB Not Generated

**Possible Causes**:
- Courier company ID invalid
- Shiprocket API error
- Insufficient wallet balance

**Solution**:
- Check Shiprocket logs in console
- Verify Shiprocket account is active
- Ensure sufficient wallet balance

### Issue: Wrong Courier Selected

**Possible Causes**:
- Pricing not updated in Shiprocket
- COD charges not calculated correctly

**Solution**:
- Review courier pricing in Shiprocket dashboard
- Verify COD amount is passed correctly

## Admin Controls

Admins can view courier information in:

1. **Admin Orders Page**: Shows courier name and AWB code
2. **Order Details**: Displays tracking URL when available

Admins can also:
- View all order shipment details
- Track shipments
- Cancel shipments if needed

## Future Enhancements

Potential improvements:

1. **Delivery Speed Priority**: Option to select fastest courier instead of cheapest
2. **Courier Preferences**: Allow admins to prefer certain couriers
3. **Dynamic Weight**: Calculate weight from product specifications
4. **Smart Packaging**: Auto-select box size based on items
5. **Rate Caching**: Cache courier rates to reduce API calls
6. **Courier Performance**: Track and prefer couriers with better delivery rates

## Support

For issues related to:

- **Courier Selection**: Check console logs and Shiprocket API response
- **AWB Generation**: Verify Shiprocket configuration and account status
- **Tracking**: Ensure webhook is configured for status updates

## Related Files

- `/app/api/orders/route.js` - Order creation with courier selection
- `/lib/shiprocket.js` - Shiprocket API integration
- `/models/Order.js` - Order schema with Shiprocket fields
- `/app/api/webhooks/shiprocket/route.js` - Shipment status updates
- `.env.example` - Required environment variables

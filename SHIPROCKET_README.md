# Shiprocket Integration Documentation

## Overview

This project includes a comprehensive, fully automated Shiprocket integration for order tracking and shipment management. The system automatically handles the entire shipping workflow from order creation to delivery tracking.

## Features

### 🚀 Automated Shipping Workflow
- **Automatic Shipment Creation**: Creates Shiprocket shipments immediately after payment confirmation
- **AWB Assignment**: Automatically assigns Air Waybill numbers with best courier selection
- **Pickup Generation**: Schedules pickup requests automatically
- **Real-time Tracking**: Continuous tracking updates via webhooks and periodic checks

### 📦 Order Management
- **Status Synchronization**: Order status updates automatically based on shipping status
- **Delivery Confirmation**: Automatic order completion when delivered
- **Failed Shipment Retry**: Automatic retry mechanism for failed shipments
- **Bulk Operations**: Admin tools for bulk tracking updates

### 🔔 Notifications & Tracking
- **Customer Notifications**: Automatic shipping notifications (ready for email/SMS integration)
- **Tracking Timeline**: Visual tracking interface for customers
- **Admin Dashboard**: Complete shipment management for administrators
- **Webhook Integration**: Real-time updates from Shiprocket

## Environment Setup

Add these environment variables to your `.env.local` file:

```bash
# Shiprocket Configuration
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_PICKUP_POSTCODE=110001

# Automation Settings
AUTO_SHIP_ENABLED=true
AUTO_SHIP_DELAY_MINUTES=30

# Webhook Security (optional)
SHIPROCKET_WEBHOOK_SECRET=your-webhook-secret
```

## API Endpoints

### Shipping Management

#### Create Shipment
```
POST /api/shipping/create
Body: { orderId: "order_id", automate: true }
```

#### Track Order
```
GET /api/shipping/track/{orderId}
POST /api/shipping/track/{orderId} (force update)
```

#### Bulk Operations (Admin only)
```
POST /api/shipping/bulk (bulk tracking update)
DELETE /api/shipping/bulk (cancel shipment)
```

### Webhooks

#### Shiprocket Webhook Handler
```
POST /api/webhooks/shiprocket
```
Configure this URL in your Shiprocket dashboard for automatic tracking updates.

## Automation Workflow

### 1. Order Placement
```
Order Created → Payment Verification → Automatic Shipping Initiation
```

### 2. Shipping Process
```
Create Shipment → Assign AWB → Generate Pickup → Track Updates
```

### 3. Status Updates
```
Webhook Received → Order Status Updated → Customer Notified
```

## Usage Examples

### Manual Shipment Creation
```javascript
import { shippingService } from '@/lib/shippingService';

// Create and process shipment automatically
const result = await shippingService.automateShipping(orderId);
console.log(result); // { shipmentId, awbCode, courier, trackingUrl }
```

### Manual Tracking Update
```javascript
// Update tracking for specific order
const tracking = await shippingService.updateTrackingInfo(orderId);

// Bulk update all active shipments
const results = await shippingService.bulkUpdateTracking();
```

### Order Automation
```javascript
import { orderAutomationService } from '@/lib/orderAutomationService';

// Process new order (automatically called after payment)
await orderAutomationService.processNewOrder(orderId);

// Manual processing
await orderAutomationService.manualProcessOrder(orderId);
```

## Frontend Components

### Tracking Timeline
```jsx
import TrackingTimeline from '@/app/components/tracking/TrackingTimeline';

<TrackingTimeline orderId={orderId} order={order} />
```

### Admin Integration
The admin panel automatically includes shipping management features:
- View all shipments
- Create shipments manually
- Track orders
- Cancel shipments
- Bulk operations

## Cron Jobs & Automation

### Periodic Updates
Run the cron job script for automated maintenance:

```bash
# Update tracking for all active shipments
node scripts/cron-jobs.mjs track-update

# Retry failed shipments
node scripts/cron-jobs.mjs retry-failed

# Check delivered orders
node scripts/cron-jobs.mjs check-delivered

# Run all operations
node scripts/cron-jobs.mjs all
```

### Crontab Setup
Add to your crontab for automatic execution:
```bash
# Update tracking every 10 minutes
*/10 * * * * /usr/bin/node /path/to/your/project/scripts/cron-jobs.mjs track-update

# Retry failed shipments every hour
0 * * * * /usr/bin/node /path/to/your/project/scripts/cron-jobs.mjs retry-failed

# Check delivered orders every 6 hours
0 */6 * * * /usr/bin/node /path/to/your/project/scripts/cron-jobs.mjs check-delivered
```

## Webhook Configuration

1. **Login to Shiprocket Dashboard**
2. **Go to Settings → Webhooks**
3. **Add Webhook URL**: `https://yourdomain.com/api/webhooks/shiprocket`
4. **Select Events**: All shipment events
5. **Save Configuration**

## Error Handling

The system includes comprehensive error handling:

- **Authentication Failures**: Automatic token refresh
- **API Rate Limits**: Retry mechanisms with exponential backoff
- **Network Issues**: Timeout handling and retries
- **Shipment Failures**: Automatic retry queue
- **Data Validation**: Input validation and sanitization

## Monitoring & Logs

Monitor the integration through:

- **Console Logs**: Detailed logging for all operations
- **Database Records**: Tracking history stored in MongoDB
- **Order Status**: Real-time status updates
- **Admin Dashboard**: Visual monitoring interface

## Status Mapping

| Shiprocket Status | Order Status | Description |
|------------------|--------------|-------------|
| Order Confirmed | processing | Order confirmed in system |
| Pickup Scheduled | processing | Pickup scheduled |
| Picked Up | shipped | Package picked up |
| In Transit | shipped | Package in transit |
| Out for Delivery | shipped | Out for delivery |
| Delivered | delivered | Successfully delivered |
| RTO Initiated | cancelled | Return to origin |
| Cancelled | cancelled | Shipment cancelled |

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
   - Check if Shiprocket account is active

2. **Shipment Creation Failures**
   - Verify pickup location is configured in Shiprocket
   - Check if all required order fields are present
   - Ensure pickup postcode is correct

3. **Tracking Updates Not Working**
   - Verify webhook URL is correctly configured
   - Check if cron jobs are running
   - Ensure database connection is working

4. **AWB Assignment Failures**
   - Check courier serviceability for delivery location
   - Verify package dimensions and weight
   - Ensure sufficient wallet balance in Shiprocket

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API endpoints manually using tools like Postman
4. Check Shiprocket dashboard for shipment status

## Contributing

When contributing to the shipping integration:
1. Test with Shiprocket sandbox environment first
2. Add appropriate error handling
3. Update documentation for new features
4. Include unit tests for new functions
5. Follow existing code patterns and conventions
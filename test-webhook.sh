#!/bin/bash

# Shiprocket Webhook Testing Script
# This script tests various webhook scenarios

WEBHOOK_URL="https://www.nandikajewellers.in/api/webhooks/tracking-updates"
# For local testing, use: WEBHOOK_URL="http://localhost:3000/api/webhooks/tracking-updates"

echo "=================================================="
echo "🧪 SHIPROCKET WEBHOOK TESTER"
echo "=================================================="
echo "Endpoint: $WEBHOOK_URL"
echo ""

# Test 1: Order Picked Up
echo "Test 1: Order Shipment - PICKED UP"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "anx-api-key: test-key" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001_150876814",
    "shipment_id": 987654321,
    "awb": "TEST123456789",
    "courier_name": "Delhivery",
    "shipment_status": "PICKED UP",
    "current_status": "Shipment picked up from seller",
    "etd": "2025-11-15",
    "is_return": 0,
    "scans": [
      {
        "status": "PICKED UP",
        "location": "Mumbai",
        "timestamp": "2025-11-09T10:30:00Z"
      }
    ]
  }'
echo -e "\n"

sleep 2

# Test 2: Order In Transit
echo "Test 2: Order Shipment - IN TRANSIT"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 987654321,
    "awb": "TEST123456789",
    "courier_name": "Delhivery",
    "shipment_status": "IN TRANSIT",
    "current_status": "Shipment in transit",
    "is_return": 0
  }'
echo -e "\n"

sleep 2

# Test 3: Order Delivered
echo "Test 3: Order Shipment - DELIVERED (COD)"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 987654321,
    "awb": "TEST123456789",
    "courier_name": "Delhivery",
    "shipment_status": "DELIVERED",
    "current_status": "Shipment delivered",
    "pod": "DELIVERED",
    "pod_status": "Received by customer",
    "is_return": 0
  }'
echo -e "\n"

sleep 2

# Test 4: Return Pickup Scheduled
echo "Test 4: Return Shipment - PENDING PICKUP"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 111222333,
    "awb": "RET987654321",
    "courier_name": "Delhivery",
    "shipment_status": "PENDING PICKUP",
    "current_status": "Pickup scheduled",
    "etd": "2025-11-10",
    "is_return": 1
  }'
echo -e "\n"

sleep 2

# Test 5: Return Picked Up
echo "Test 5: Return Shipment - PICKED UP"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 111222333,
    "awb": "RET987654321",
    "courier_name": "Delhivery",
    "shipment_status": "PICKED UP",
    "current_status": "Return picked up from customer",
    "is_return": 1
  }'
echo -e "\n"

sleep 2

# Test 6: Return Delivered to Seller
echo "Test 6: Return Shipment - DELIVERED to Seller"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 111222333,
    "awb": "RET987654321",
    "courier_name": "Delhivery",
    "shipment_status": "DELIVERED",
    "current_status": "Returned to seller",
    "is_return": 1
  }'
echo -e "\n"

sleep 2

# Test 7: Order Cancelled
echo "Test 7: Order Shipment - CANCELLED"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876815,
    "order_id": "ORD-002",
    "shipment_id": 987654322,
    "awb": "TEST123456790",
    "courier_name": "Delhivery",
    "shipment_status": "CANCELLED",
    "current_status": "Shipment cancelled",
    "is_return": 0
  }'
echo -e "\n"

sleep 2

# Test 8: Return Cancelled
echo "Test 8: Return Shipment - CANCELLED"
echo "--------------------------------------------------"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sr_order_id": 150876814,
    "order_id": "ORD-001",
    "shipment_id": 111222333,
    "awb": "RET987654321",
    "courier_name": "Delhivery",
    "shipment_status": "CANCELLED",
    "current_status": "Return cancelled",
    "is_return": 1
  }'
echo -e "\n"

echo "=================================================="
echo "✅ All tests completed!"
echo "=================================================="
echo ""
echo "📊 Next Steps:"
echo "1. Check Vercel logs for webhook processing details"
echo "2. Look for emoji-decorated log entries (📦, ✅, 🔄, etc.)"
echo "3. Verify database updates in admin panel"
echo "4. Test frontend refresh to see if updates appear"
echo ""
echo "🔍 To view logs:"
echo "   - Vercel Dashboard → Your Project → Logs"
echo "   - Filter: Runtime Logs"
echo "   - Search: 'SHIPROCKET WEBHOOK RECEIVED'"
echo ""

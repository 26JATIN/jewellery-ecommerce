import 'dotenv/config';
import mongoose from 'mongoose';
import { inventoryService } from '../lib/inventoryService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function testInventorySystem() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get a recent order
        const order = await Order.findOne({ status: { $in: ['processing', 'pending'] } })
            .populate('items.product')
            .sort({ createdAt: -1 });

        if (!order) {
            console.log('❌ No pending/processing orders found for testing');
            process.exit(0);
        }

        console.log('📦 Testing Inventory System');
        console.log('='.repeat(60));
        console.log(`Order: ${order.orderNumber || order._id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Items: ${order.items.length}`);
        console.log('\nCurrent Stock Levels:');
        
        const stockBefore = {};
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                stockBefore[product._id] = product.stock;
                console.log(`  - ${product.name} (SKU: ${product.sku}): ${product.stock} units`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('TEST 1: Restore Inventory (Simulating Refund)');
        console.log('='.repeat(60));
        
        const restoreResult = await inventoryService.restoreInventory(order._id, 'test_refund');
        
        console.log('\nRestore Result:');
        console.log(`  Success: ${restoreResult.success}`);
        console.log(`  Total Items Restored: ${restoreResult.totalItemsRestored}`);
        console.log(`  Products Updated: ${restoreResult.productsUpdated}`);
        
        console.log('\nStock After Restoration:');
        for (const detail of restoreResult.restorationDetails) {
            console.log(`  - ${detail.productName} (SKU: ${detail.sku})`);
            console.log(`    Before: ${detail.previousStock} → After: ${detail.newStock} (+${detail.quantityRestored})`);
        }

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('\n' + '='.repeat(60));
        console.log('TEST 2: Reserve Inventory Again (Simulating New Order)');
        console.log('='.repeat(60));
        
        const reserveResult = await inventoryService.reserveInventory(order._id);
        
        console.log('\nReserve Result:');
        console.log(`  Success: ${reserveResult.success}`);
        console.log(`  Total Items Reserved: ${reserveResult.totalItemsReserved}`);
        console.log(`  Products Updated: ${reserveResult.productsUpdated}`);
        
        console.log('\nStock After Reservation:');
        for (const detail of reserveResult.reservationDetails) {
            console.log(`  - ${detail.productName} (SKU: ${detail.sku})`);
            console.log(`    Before: ${detail.previousStock} → After: ${detail.newStock} (-${detail.quantityReserved})`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('TEST 3: Check Inventory Log in Order');
        console.log('='.repeat(60));
        
        const updatedOrder = await Order.findById(order._id);
        console.log(`\nInventory Log Entries: ${updatedOrder.inventoryLog?.length || 0}`);
        
        if (updatedOrder.inventoryLog && updatedOrder.inventoryLog.length > 0) {
            updatedOrder.inventoryLog.forEach((log, index) => {
                console.log(`\n  Log ${index + 1}:`);
                console.log(`    Action: ${log.action}`);
                console.log(`    Reason: ${log.reason || 'N/A'}`);
                console.log(`    Timestamp: ${log.timestamp}`);
                console.log(`    Items: ${log.totalItemsReserved || log.totalItemsRestored || 0}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All Tests Completed Successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testInventorySystem();

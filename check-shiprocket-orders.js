/**
 * Script to check orders with Shiprocket integration
 * Run: node check-shiprocket-orders.js
 */

import mongoose from 'mongoose';
import Order from './models/Order.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewellery-ecommerce';

async function checkOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find orders with shiprocketOrderId
        const ordersWithShiprocket = await Order.find({
            shiprocketOrderId: { $exists: true, $ne: null }
        }).select('orderNumber shiprocketOrderId status createdAt').limit(10);

        console.log('=== Orders with Shiprocket IDs ===');
        console.log(`Found ${ordersWithShiprocket.length} orders with Shiprocket integration:\n`);
        
        ordersWithShiprocket.forEach(order => {
            console.log(`Order Number: ${order.orderNumber}`);
            console.log(`Shiprocket Order ID: ${order.shiprocketOrderId}`);
            console.log(`Status: ${order.status}`);
            console.log(`Created: ${order.createdAt}`);
            console.log('---');
        });

        // Check total orders
        const totalOrders = await Order.countDocuments();
        console.log(`\nTotal orders in database: ${totalOrders}`);

        // Check recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber shiprocketOrderId status createdAt');

        console.log('\n=== 5 Most Recent Orders ===');
        recentOrders.forEach(order => {
            console.log(`${order.orderNumber} - Shiprocket: ${order.shiprocketOrderId || 'NOT SET'} - Status: ${order.status}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkOrders();

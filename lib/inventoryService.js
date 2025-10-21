import connectDB from './mongodb.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Inventory Management Service
 * Handles stock restoration for failed payments and successful refunds
 */
class InventoryService {
    /**
     * Restore inventory for order items
     * @param {string} orderId - Order ID
     * @param {string} reason - Reason for restoration (refund/payment_failed)
     * @returns {Promise<Object>} - Restoration result
     */
    async restoreInventory(orderId, reason = 'refund') {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            const restorationResults = [];
            let totalRestored = 0;
            let errors = [];

            // Restore stock for each item in the order
            for (const item of order.items) {
                try {
                    const product = await Product.findById(item.product);
                    
                    if (!product) {
                        errors.push({
                            productId: item.product,
                            error: 'Product not found',
                            quantity: item.quantity
                        });
                        continue;
                    }

                    // Restore the quantity to stock
                    const previousStock = product.stock;
                    product.stock += item.quantity;
                    await product.save();

                    restorationResults.push({
                        productId: product._id,
                        productName: product.name,
                        sku: product.sku,
                        quantityRestored: item.quantity,
                        previousStock: previousStock,
                        newStock: product.stock
                    });

                    totalRestored += item.quantity;

                    console.log(`✅ Restored ${item.quantity} units of ${product.name} (SKU: ${product.sku})`);
                    console.log(`   Stock: ${previousStock} → ${product.stock}`);
                    
                } catch (productError) {
                    console.error(`❌ Failed to restore stock for product ${item.product}:`, productError);
                    errors.push({
                        productId: item.product,
                        error: productError.message,
                        quantity: item.quantity
                    });
                }
            }

            // Log the restoration
            await Order.findByIdAndUpdate(orderId, {
                $push: {
                    'inventoryLog': {
                        action: 'restore',
                        reason: reason,
                        totalItemsRestored: totalRestored,
                        timestamp: new Date(),
                        details: restorationResults,
                        errors: errors.length > 0 ? errors : undefined
                    }
                }
            });

            console.log(`\n📦 Inventory Restoration Summary for Order ${order.orderNumber}:`);
            console.log(`   Reason: ${reason}`);
            console.log(`   Total items restored: ${totalRestored}`);
            console.log(`   Products updated: ${restorationResults.length}`);
            if (errors.length > 0) {
                console.log(`   ⚠️  Errors: ${errors.length}`);
            }

            return {
                success: true,
                orderId: orderId,
                orderNumber: order.orderNumber,
                reason: reason,
                totalItemsRestored: totalRestored,
                productsUpdated: restorationResults.length,
                restorationDetails: restorationResults,
                errors: errors.length > 0 ? errors : undefined,
                partialRestore: errors.length > 0 && restorationResults.length > 0
            };

        } catch (error) {
            console.error('❌ Inventory restoration failed:', error);
            throw error;
        }
    }

    /**
     * Reserve inventory when order is placed
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Reservation result
     */
    async reserveInventory(orderId) {
        try {
            await connectDB();
            
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            const reservationResults = [];
            let totalReserved = 0;
            let errors = [];

            // Reserve stock for each item
            for (const item of order.items) {
                try {
                    const product = await Product.findById(item.product);
                    
                    if (!product) {
                        errors.push({
                            productId: item.product,
                            error: 'Product not found',
                            quantity: item.quantity
                        });
                        continue;
                    }

                    // Check if enough stock is available
                    if (product.stock < item.quantity) {
                        errors.push({
                            productId: product._id,
                            productName: product.name,
                            error: 'Insufficient stock',
                            requested: item.quantity,
                            available: product.stock
                        });
                        continue;
                    }

                    // Deduct from stock
                    const previousStock = product.stock;
                    product.stock -= item.quantity;
                    await product.save();

                    reservationResults.push({
                        productId: product._id,
                        productName: product.name,
                        sku: product.sku,
                        quantityReserved: item.quantity,
                        previousStock: previousStock,
                        newStock: product.stock
                    });

                    totalReserved += item.quantity;

                    console.log(`✅ Reserved ${item.quantity} units of ${product.name} (SKU: ${product.sku})`);
                    console.log(`   Stock: ${previousStock} → ${product.stock}`);
                    
                } catch (productError) {
                    console.error(`❌ Failed to reserve stock for product ${item.product}:`, productError);
                    errors.push({
                        productId: item.product,
                        error: productError.message,
                        quantity: item.quantity
                    });
                }
            }

            // Log the reservation
            await Order.findByIdAndUpdate(orderId, {
                $push: {
                    'inventoryLog': {
                        action: 'reserve',
                        totalItemsReserved: totalReserved,
                        timestamp: new Date(),
                        details: reservationResults,
                        errors: errors.length > 0 ? errors : undefined
                    }
                }
            });

            return {
                success: errors.length === 0,
                orderId: orderId,
                orderNumber: order.orderNumber,
                totalItemsReserved: totalReserved,
                productsUpdated: reservationResults.length,
                reservationDetails: reservationResults,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            console.error('❌ Inventory reservation failed:', error);
            throw error;
        }
    }
}

const inventoryService = new InventoryService();
export { inventoryService };

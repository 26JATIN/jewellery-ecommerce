#!/usr/bin/env node

/**
 * Cron job script for automated Shiprocket operations
 * This script should be run periodically to:
 * 1. Update tracking information for all active shipments
 * 2. Retry failed shipments
 * 3. Check for delivered orders
 * 
 * Usage:
 * - Add to crontab: 0,10,20,30,40,50 * * * * /path/to/node /path/to/cron-jobs.mjs
 * - Or use a service like node-cron for scheduling
 */

import { orderAutomationService } from '../lib/orderAutomationService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OPERATIONS = {
    TRACK_UPDATE: 'track-update',
    RETRY_FAILED: 'retry-failed',
    CHECK_DELIVERED: 'check-delivered',
    ALL: 'all'
};

class CronJobRunner {
    constructor() {
        this.operation = process.argv[2] || OPERATIONS.ALL;
        this.startTime = new Date();
    }

    async run() {
        console.log(`\n🚀 Starting cron job: ${this.operation} at ${this.startTime.toISOString()}`);
        
        try {
            switch (this.operation) {
                case OPERATIONS.TRACK_UPDATE:
                    await this.runTrackingUpdate();
                    break;
                    
                case OPERATIONS.RETRY_FAILED:
                    await this.retryFailedShipments();
                    break;
                    
                case OPERATIONS.CHECK_DELIVERED:
                    await this.checkDeliveredOrders();
                    break;
                    
                case OPERATIONS.ALL:
                    await this.runAll();
                    break;
                    
                default:
                    throw new Error(`Unknown operation: ${this.operation}`);
            }
            
            const duration = new Date() - this.startTime;
            console.log(`✅ Cron job completed successfully in ${duration}ms`);
            process.exit(0);
            
        } catch (error) {
            console.error(`❌ Cron job failed:`, error);
            process.exit(1);
        }
    }

    async runTrackingUpdate() {
        console.log('📦 Running periodic tracking update...');
        const result = await orderAutomationService.runPeriodicTrackingUpdate();
        console.log(`📊 Tracking update results:`, result);
    }

    async retryFailedShipments() {
        console.log('🔄 Retrying failed shipments...');
        const result = await orderAutomationService.retryFailedShipments();
        console.log(`📊 Retry results:`, result);
    }

    async checkDeliveredOrders() {
        console.log('✅ Checking delivered orders...');
        const result = await orderAutomationService.checkDeliveredOrders();
        console.log(`📊 Delivery check results:`, result);
    }

    async runAll() {
        console.log('🔄 Running all automated operations...');
        
        const results = {
            trackingUpdate: null,
            retryFailed: null,
            checkDelivered: null
        };

        try {
            results.trackingUpdate = await orderAutomationService.runPeriodicTrackingUpdate();
            console.log('✅ Tracking update completed');
        } catch (error) {
            console.error('❌ Tracking update failed:', error);
        }

        try {
            results.retryFailed = await orderAutomationService.retryFailedShipments();
            console.log('✅ Retry failed completed');
        } catch (error) {
            console.error('❌ Retry failed operations failed:', error);
        }

        try {
            results.checkDelivered = await orderAutomationService.checkDeliveredOrders();
            console.log('✅ Delivered check completed');
        } catch (error) {
            console.error('❌ Delivered check failed:', error);
        }

        console.log('📊 All operations completed with results:', results);
    }
}

// Run the cron job
const cronJob = new CronJobRunner();
cronJob.run();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Cron job terminated');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Cron job interrupted');
    process.exit(0);
});
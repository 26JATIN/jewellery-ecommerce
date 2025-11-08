import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const WEBHOOK_LOG_FILE = '/tmp/shiprocket-webhooks.json';
const MAX_LOGS = 50;

export async function GET(request) {
    try {
        const data = await fs.readFile(WEBHOOK_LOG_FILE, 'utf-8');
        const logs = JSON.parse(data);
        
        return NextResponse.json({
            success: true,
            count: logs.length,
            webhooks: logs
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return NextResponse.json({
                success: true,
                count: 0,
                webhooks: [],
                message: 'No webhooks received yet'
            });
        }
        
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Read existing logs
        let logs = [];
        try {
            const data = await fs.readFile(WEBHOOK_LOG_FILE, 'utf-8');
            logs = JSON.parse(data);
        } catch (err) {
            // File doesn't exist yet
        }
        
        // Add new log
        logs.unshift({
            timestamp: new Date().toISOString(),
            payload: body,
            headers: Object.fromEntries(request.headers.entries())
        });
        
        // Keep only last MAX_LOGS
        logs = logs.slice(0, MAX_LOGS);
        
        // Save to file
        await fs.writeFile(WEBHOOK_LOG_FILE, JSON.stringify(logs, null, 2));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

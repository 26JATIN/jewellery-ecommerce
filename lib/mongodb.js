import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env file'
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Add connection event listeners (only once)
if (!global.mongooseListenersAdded) {
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Will attempt to reconnect on next request.');
        // Clear cached connection on disconnect
        cached.conn = null;
        cached.promise = null;
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
        // Clear cached connection on error
        cached.conn = null;
        cached.promise = null;
    });

    global.mongooseListenersAdded = true;
}

async function connectDB() {
    if (cached.conn) {
        // Check if connection is still alive
        if (mongoose.connection.readyState === 1) {
            return cached.conn;
        }
        // Connection dropped, clear cache
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Limit connection pool size
            minPoolSize: 2,  // Maintain minimum connections
            socketTimeoutMS: 30000, // 30s socket timeout
            serverSelectionTimeoutMS: 5000, // 5s for faster failure
            connectTimeoutMS: 10000, // 10s connection timeout
            heartbeatFrequencyMS: 10000, // Check connection health every 10s
            retryWrites: true, // Auto-retry writes
            retryReads: true, // Auto-retry reads
            maxIdleTimeMS: 30000, // Close idle connections after 30s
            compressors: ['zlib'], // Enable compression for network efficiency
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                const dbName = mongoose.connection.db.databaseName;
                console.log('✅ MongoDB connected successfully');
                console.log(`📦 Database: ${dbName}`);
                console.log(`🔗 Host: ${mongoose.connection.host}`);
                
                // Verify we're using the correct database
                if (dbName !== 'nandikajewellers') {
                    console.warn(`⚠️  Warning: Expected database 'nandikajewellers' but connected to '${dbName}'`);
                }
                
                return mongoose;
            })
            .catch((error) => {
                // Clear the failed promise so next attempt can retry
                cached.promise = null;
                cached.conn = null;
                console.error('❌ MongoDB connection failed:', error.message);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Clear promise and connection on error
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
    
    return cached.conn;
}

export default connectDB;

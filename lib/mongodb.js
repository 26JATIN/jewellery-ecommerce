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

async function connectDB() {
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
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
                console.error('❌ MongoDB connection failed:', error.message);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Clear promise on error
        cached.promise = null;
        throw error;
    }
    
    return cached.conn;
}

export default connectDB;

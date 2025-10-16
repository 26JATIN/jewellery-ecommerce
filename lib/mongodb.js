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
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
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

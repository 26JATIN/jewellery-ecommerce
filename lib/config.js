/**
 * Centralized Application Configuration
 * Single source of truth for all app configuration
 */

const config = {
    // Database Configuration
    mongodb: {
        uri: process.env.MONGODB_URI
    },
    
    // Authentication Configuration
    jwt: {
        secret: process.env.JWT_SECRET
    },
    
    // API Keys
    gemini: {
        apiKey: process.env.GEMINI_API_KEY
    },
    
    // Cloudinary Configuration
    cloudinary: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    
    // Application URLs
    app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    },
    
    // Cron Job Security
    cron: {
        secret: process.env.CRON_SECRET
    }
};

// Validate critical configurations
export function validateConfig() {
    const errors = [];
    
    if (!config.mongodb.uri) {
        errors.push('MONGODB_URI is not configured');
    }
    
    if (!config.jwt.secret) {
        errors.push('JWT_SECRET is not configured');
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }
}

export default config;
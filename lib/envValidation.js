/**
 * Environment Variable Validation
 * Validates all required environment variables at application startup
 * Prevents runtime errors by catching missing configuration early
 */

const requiredEnvVars = {
    // Database
    MONGODB_URI: {
        description: 'MongoDB connection string',
        required: true,
        example: 'mongodb://localhost:27017/jewellery-ecommerce'
    },
    
    // Authentication
    JWT_SECRET: {
        description: 'Secret key for JWT token signing',
        required: true,
        example: 'your-super-secret-jwt-key-at-least-32-characters'
    },
    
    // Payment Gateway (Razorpay)
    RAZORPAY_KEY_ID: {
        description: 'Razorpay API Key ID',
        required: true,
        example: 'rzp_test_xxxxxxxxxxxxx'
    },
    RAZORPAY_KEY_SECRET: {
        description: 'Razorpay API Key Secret',
        required: true,
        example: 'xxxxxxxxxxxxxxxxxxxxx'
    },
    NEXT_PUBLIC_RAZORPAY_KEY_ID: {
        description: 'Razorpay Key ID for client-side',
        required: true,
        example: 'rzp_test_xxxxxxxxxxxxx'
    },
    
    // Cloudinary (Image Management)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {
        description: 'Cloudinary cloud name',
        required: true,
        example: 'your-cloud-name'
    },
    CLOUDINARY_API_KEY: {
        description: 'Cloudinary API Key',
        required: true,
        example: '123456789012345'
    },
    CLOUDINARY_API_SECRET: {
        description: 'Cloudinary API Secret',
        required: true,
        example: 'abcdefghijklmnopqrstuvwxyz'
    },
    
    // Shipping (Shiprocket)
    SHIPROCKET_EMAIL: {
        description: 'Shiprocket account email',
        required: true,
        example: 'your-email@example.com'
    },
    SHIPROCKET_PASSWORD: {
        description: 'Shiprocket account password',
        required: true,
        example: 'your-password'
    },
    
    // Optional but recommended
    NODE_ENV: {
        description: 'Node environment',
        required: false,
        default: 'development',
        example: 'development | production'
    },
    GEMINI_API_KEY: {
        description: 'Google Gemini AI API key for metal price scraping',
        required: false,
        example: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    SHIPROCKET_WEBHOOK_SECRET: {
        description: 'Webhook secret for Shiprocket signature verification',
        required: false,
        example: 'your-webhook-secret'
    },
    AUTO_SHIP_ENABLED: {
        description: 'Enable automatic shipping after payment',
        required: false,
        default: 'false',
        example: 'true | false'
    },
    AUTO_SHIP_DELAY_MINUTES: {
        description: 'Delay before automatic shipping (in minutes)',
        required: false,
        default: '30',
        example: '30'
    },
    CRON_SECRET: {
        description: 'Secret key for cron job endpoints',
        required: false,
        example: 'your-cron-secret-key'
    }
};

class EnvironmentValidationError extends Error {
    constructor(message, missingVars) {
        super(message);
        this.name = 'EnvironmentValidationError';
        this.missingVars = missingVars;
    }
}

/**
 * Validate environment variables
 * @param {boolean} throwOnMissing - Whether to throw error on missing vars
 * @returns {Object} Validation result
 */
export function validateEnvVariables(throwOnMissing = true) {
    const missing = [];
    const warnings = [];
    const validated = {};

    for (const [key, config] of Object.entries(requiredEnvVars)) {
        const value = process.env[key];
        
        if (!value || value.trim() === '') {
            if (config.required) {
                missing.push({
                    key,
                    description: config.description,
                    example: config.example
                });
            } else {
                warnings.push({
                    key,
                    description: config.description,
                    default: config.default,
                    example: config.example
                });
                // Set default if available
                if (config.default) {
                    validated[key] = config.default;
                }
            }
        } else {
            validated[key] = value;
        }
    }

    // Log warnings for optional missing vars
    if (warnings.length > 0) {
        console.warn('\n⚠️  Optional environment variables not set:');
        warnings.forEach(({ key, description, default: defaultVal }) => {
            console.warn(`  - ${key}: ${description}`);
            if (defaultVal) {
                console.warn(`    Using default: ${defaultVal}`);
            }
        });
        console.warn('');
    }

    // Handle missing required vars
    if (missing.length > 0) {
        const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║           MISSING REQUIRED ENVIRONMENT VARIABLES               ║
╚════════════════════════════════════════════════════════════════╝

The following required environment variables are not set:

${missing.map(({ key, description, example }) => `
  ❌ ${key}
     Description: ${description}
     Example: ${example}
`).join('\n')}

Please add these variables to your .env file.

For help, see: .env.example
`;

        console.error(errorMessage);

        if (throwOnMissing) {
            throw new EnvironmentValidationError(
                'Missing required environment variables',
                missing
            );
        }

        return {
            valid: false,
            missing,
            warnings,
            validated
        };
    }

    console.log('✅ All required environment variables are set');
    
    return {
        valid: true,
        missing: [],
        warnings,
        validated
    };
}

/**
 * Generate .env.example file content
 * @returns {string} Example .env file content
 */
export function generateEnvExample() {
    let content = '# Environment Variables Configuration\n\n';
    
    const categories = {
        'Database': ['MONGODB_URI'],
        'Authentication': ['JWT_SECRET'],
        'Payment Gateway (Razorpay)': ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'NEXT_PUBLIC_RAZORPAY_KEY_ID'],
        'Image Management (Cloudinary)': ['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
        'Shipping (Shiprocket)': ['SHIPROCKET_EMAIL', 'SHIPROCKET_PASSWORD', 'SHIPROCKET_WEBHOOK_SECRET'],
        'Optional Configuration': ['NODE_ENV', 'GEMINI_API_KEY', 'AUTO_SHIP_ENABLED', 'AUTO_SHIP_DELAY_MINUTES', 'CRON_SECRET']
    };

    for (const [category, keys] of Object.entries(categories)) {
        content += `# ${category}\n`;
        keys.forEach(key => {
            const config = requiredEnvVars[key];
            if (config) {
                content += `# ${config.description}\n`;
                if (config.required) {
                    content += `${key}=${config.example}\n\n`;
                } else {
                    content += `# ${key}=${config.example}\n\n`;
                }
            }
        });
        content += '\n';
    }

    return content;
}

/**
 * Validate a single environment variable
 * @param {string} key - Environment variable name
 * @param {*} value - Value to validate (defaults to process.env[key])
 * @returns {boolean} Whether the variable is valid
 */
export function validateEnvVar(key, value = null) {
    const config = requiredEnvVars[key];
    if (!config) {
        console.warn(`Warning: ${key} is not a recognized environment variable`);
        return false;
    }

    const actualValue = value !== null ? value : process.env[key];
    
    if (!actualValue || actualValue.trim() === '') {
        if (config.required) {
            console.error(`❌ Required environment variable ${key} is not set`);
            return false;
        } else {
            console.warn(`⚠️  Optional environment variable ${key} is not set`);
            return true; // Optional vars are "valid" even if not set
        }
    }

    return true;
}

// Export for use in tests
export { requiredEnvVars };

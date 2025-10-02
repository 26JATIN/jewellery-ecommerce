import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define the updated Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function migrateProducts() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find products that need migration (missing new fields)
        const productsToMigrate = await Product.find({
            $or: [
                { mrp: { $exists: false } },
                { costPrice: { $exists: false } },
                { sellingPrice: { $exists: false } },
                { sku: { $exists: false } },
                { isActive: { $exists: false } }
            ]
        });

        console.log(`Found ${productsToMigrate.length} products to migrate`);

        if (productsToMigrate.length === 0) {
            console.log('No products need migration');
            return;
        }

        for (const product of productsToMigrate) {
            const updateData = {};
            
            // Set MRP (assume MRP is 20% higher than current price)
            if (!product.mrp) {
                updateData.mrp = Math.round(product.price * 1.2);
            }
            
            // Set cost price (assume 30% margin)
            if (!product.costPrice) {
                updateData.costPrice = Math.round(product.price * 0.7);
            }
            
            // Set selling price (use current price)
            if (!product.sellingPrice) {
                updateData.sellingPrice = product.price;
            }
            
            // Generate SKU if missing
            if (!product.sku) {
                const sku = product.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) + Date.now().toString().slice(-4);
                updateData.sku = sku;
            }
            
            // Set active status
            if (product.isActive === undefined) {
                updateData.isActive = true;
            }

            await Product.findByIdAndUpdate(product._id, updateData);
            console.log(`Migrated product: ${product.name}`);
        }

        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the migration
migrateProducts();
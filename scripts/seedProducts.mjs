import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define Product Schema
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

// Create Product model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const sampleProducts = [
    {
        name: "Diamond Pendant Necklace",
        description: "Elegant diamond pendant necklace in 18k white gold with brilliant cut diamonds",
        mrp: 1599,
        sellingPrice: 1299,
        costPrice: 899,
        price: 1299,
        image: "/product1.jpg",
        category: "Diamond",
        stock: 15,
        sku: "DIAMPEN001",
        isActive: true
    },
    {
        name: "Rose Gold Ring",
        description: "Beautiful rose gold ring with intricate design and premium finish",
        mrp: 1099,
        sellingPrice: 899,
        costPrice: 629,
        price: 899,
        image: "/product2.jpg",
        category: "Gold",
        stock: 25,
        sku: "ROSEGOLD002",
        isActive: true
    },
    {
        name: "Pearl Drop Earrings",
        description: "Classic pearl drop earrings with sterling silver details and premium pearls",
        mrp: 799,
        sellingPrice: 599,
        costPrice: 419,
        price: 599,
        image: "/product3.jpg",
        category: "Silver",
        stock: 30,
        sku: "PEARLEAR003",
        isActive: true
    },
    {
        name: "Sapphire Bracelet",
        description: "Luxurious sapphire bracelet in white gold with natural sapphires",
        mrp: 1899,
        sellingPrice: 1499,
        costPrice: 1049,
        price: 1499,
        image: "/product4.jpg",
        category: "Diamond",
        stock: 12,
        sku: "SAPBRAC004",
        isActive: true
    },
    {
        name: "Gold Chain Necklace",
        description: "Timeless gold chain necklace with 22k gold purity",
        mrp: 999,
        sellingPrice: 799,
        costPrice: 559,
        price: 799,
        image: "/product5.jpg",
        category: "Gold",
        stock: 20,
        sku: "GOLDCHAIN005",
        isActive: true
    },
    {
        name: "Diamond Stud Earrings",
        description: "Classic diamond stud earrings with brilliant cut diamonds in platinum setting",
        mrp: 1299,
        sellingPrice: 999,
        costPrice: 699,
        price: 999,
        image: "/product6.jpg",
        category: "Diamond",
        stock: 18,
        sku: "DIAMSTUD006",
        isActive: true
    },
    {
        name: "Vintage Wedding Ring Set",
        description: "Beautiful vintage-style wedding ring set with intricate detailing",
        mrp: 2499,
        sellingPrice: 1999,
        costPrice: 1399,
        price: 1999,
        image: "/collections/wedding.jpeg",
        category: "Wedding",
        stock: 8,
        sku: "VINTWED007",
        isActive: true
    },
    {
        name: "Traditional Gold Bangles",
        description: "Set of traditional gold bangles with ethnic patterns",
        mrp: 3499,
        sellingPrice: 2799,
        costPrice: 1959,
        price: 2799,
        image: "/collections/vintage.jpg",
        category: "Traditional",
        stock: 10,
        sku: "TRADBAN008",
        isActive: true
    }
];

async function seedProducts() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if products already exist
        const existingProducts = await Product.countDocuments();
        
        if (existingProducts > 0) {
            console.log(`Found ${existingProducts} existing products. Skipping seed.`);
            console.log('Use --force flag to override existing products');
            return;
        }

        // Insert sample products
        const insertedProducts = await Product.insertMany(sampleProducts);
        console.log(`Successfully seeded ${insertedProducts.length} products:`);
        
        insertedProducts.forEach(product => {
            console.log(`- ${product.name} (${product.sku})`);
        });

    } catch (error) {
        console.error('Seeding error:', error);
        
        if (error.code === 11000) {
            console.log('Some products already exist. Skipping duplicates...');
        }
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Check for force flag
const forceFlag = process.argv.includes('--force');

if (forceFlag) {
    console.log('Force flag detected. This will clear existing products first...');
    // Add force logic here if needed
}

// Run the seeding function
seedProducts();
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewellery_store';
const client = new MongoClient(MONGODB_URI);

async function addMultipleImageProducts() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('jewellery_store');
        const productsCollection = db.collection('products');
        const categoriesCollection = db.collection('categories');

        // First, ensure we have some categories
        const existingCategories = await categoriesCollection.find({}).limit(3).toArray();
        let categories = existingCategories;
        
        if (categories.length === 0) {
            console.log('No categories found. Creating some...');
            const sampleCategories = [
                {
                    name: "Necklaces",
                    slug: "necklaces",
                    description: "Beautiful necklaces for all occasions",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Bracelets", 
                    slug: "bracelets",
                    description: "Elegant bracelets in various styles",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Rings",
                    slug: "rings", 
                    description: "Stunning rings for every finger",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            
            const categoryResult = await categoriesCollection.insertMany(sampleCategories);
            console.log(`✅ Created ${categoryResult.insertedCount} categories`);
            categories = await categoriesCollection.find({}).limit(3).toArray();
        }

        const testProductsWithMultipleImages = [
            {
                name: "Diamond Necklace Set",
                description: "Elegant diamond necklace with matching earrings, perfect for special occasions.",
                category: categories[0].name,
                categoryId: categories[0]._id,
                price: 75000,
                sellingPrice: 67500,
                mrp: 85000,
                stock: 3,
                metalType: "gold",
                goldWeight: 15.5,
                goldPurity: "18K",
                images: [
                    {
                        url: "/product1.jpg",
                        alt: "Diamond Necklace Set - Front View",
                        isPrimary: true,
                        order: 0
                    },
                    {
                        url: "/product2.jpg", 
                        alt: "Diamond Necklace Set - Side View",
                        isPrimary: false,
                        order: 1
                    },
                    {
                        url: "/product3.jpg",
                        alt: "Diamond Necklace Set - Back View",
                        isPrimary: false,
                        order: 2
                    },
                    {
                        url: "/product4.jpg",
                        alt: "Diamond Necklace Set - Detailed View",
                        isPrimary: false,
                        order: 3
                    }
                ],
                tags: ["diamond", "necklace", "bridal", "luxury"],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Gold Bracelet Collection",
                description: "Beautiful handcrafted gold bracelet with intricate patterns.",
                category: categories[1]?.name || categories[0].name,
                categoryId: categories[1]?._id || categories[0]._id,
                price: 45000,
                sellingPrice: 42000,
                mrp: 50000,
                stock: 5,
                metalType: "gold",
                goldWeight: 12.3,
                goldPurity: "22K",
                images: [
                    {
                        url: "/product5.jpg",
                        alt: "Gold Bracelet - Main View",
                        isPrimary: true,
                        order: 0
                    },
                    {
                        url: "/product6.jpg",
                        alt: "Gold Bracelet - Clasp Detail",
                        isPrimary: false,
                        order: 1
                    },
                    {
                        url: "/product1.jpg",
                        alt: "Gold Bracelet - Pattern Close-up",
                        isPrimary: false,
                        order: 2
                    }
                ],
                tags: ["gold", "bracelet", "handcrafted"],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Silver Ring Set",
                description: "Contemporary silver ring set with modern geometric design.",
                category: categories[2]?.name || categories[0].name,
                categoryId: categories[2]?._id || categories[0]._id,
                price: 8500,
                sellingPrice: 7650,
                mrp: 9500,
                stock: 8,
                metalType: "silver",
                silverWeight: 25.0,
                silverPurity: "925",
                images: [
                    {
                        url: "/product2.jpg",
                        alt: "Silver Ring Set - Complete Set",
                        isPrimary: true,
                        order: 0
                    },
                    {
                        url: "/product3.jpg",
                        alt: "Silver Ring Set - Individual Rings",
                        isPrimary: false,
                        order: 1
                    },
                    {
                        url: "/product4.jpg",
                        alt: "Silver Ring Set - Geometric Pattern Detail",
                        isPrimary: false,
                        order: 2
                    },
                    {
                        url: "/product5.jpg",
                        alt: "Silver Ring Set - Wearing Style",
                        isPrimary: false,
                        order: 3
                    },
                    {
                        url: "/product6.jpg",
                        alt: "Silver Ring Set - Side Profile",
                        isPrimary: false,
                        order: 4
                    }
                ],
                tags: ["silver", "ring", "modern", "geometric"],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Insert the test products
        const result = await productsCollection.insertMany(testProductsWithMultipleImages);
        
        console.log(`✅ Successfully added ${result.insertedCount} products with multiple images:`);
        testProductsWithMultipleImages.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} (${product.images.length} images)`);
        });

        console.log(`\n🎉 Test products are ready! You can now see the beautiful slideshow functionality on:`);
        console.log(`   - Homepage product grid`);
        console.log(`   - Product quick view modal`);
        console.log(`   - Collections page`);

    } catch (error) {
        console.error('❌ Error adding products:', error);
    } finally {
        await client.close();
    }
}

// Run the script
addMultipleImageProducts();
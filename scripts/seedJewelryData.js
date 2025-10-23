import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Verify MongoDB URI is loaded
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    process.exit(1);
}

// Direct MongoDB connection function
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Product from '../models/Product.js';

// Helper function to generate SKU
function generateSKU(categoryCode, subcategoryCode, productIndex, variantIndex = null) {
    const base = `${categoryCode}${subcategoryCode}${String(productIndex).padStart(3, '0')}`;
    return variantIndex !== null ? `${base}-V${String(variantIndex).padStart(2, '0')}` : base;
}

// Categories data
const categoriesData = [
    {
        name: "Rings",
        description: "Beautiful collection of rings for all occasions",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/rings.jpg",
        sortOrder: 1
    },
    {
        name: "Necklaces",
        description: "Elegant necklaces and chains for every style",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/necklaces.jpg",
        sortOrder: 2
    },
    {
        name: "Earrings",
        description: "Stunning earrings to complement your look",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/earrings.jpg",
        sortOrder: 3
    },
    {
        name: "Bracelets",
        description: "Fashionable bracelets and bangles",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/bracelets.jpg",
        sortOrder: 4
    },
    {
        name: "Pendants",
        description: "Beautiful pendants and lockets",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/pendants.jpg",
        sortOrder: 5
    },
    {
        name: "Mangalsutras",
        description: "Traditional and modern mangalsutras",
        image: "https://res.cloudinary.com/jewelry-store/image/upload/v1/categories/mangalsutras.jpg",
        sortOrder: 6
    }
];

// Subcategories data (will be populated with category references)
const subcategoriesData = [
    // Rings subcategories
    { name: "Wedding Rings", categoryName: "Rings", description: "Perfect rings for your special day", order: 1 },
    { name: "Engagement Rings", categoryName: "Rings", description: "Diamond and precious stone engagement rings", order: 2 },
    { name: "Fashion Rings", categoryName: "Rings", description: "Trendy rings for everyday wear", order: 3 },
    { name: "Couple Rings", categoryName: "Rings", description: "Matching rings for couples", order: 4 },
    
    // Necklaces subcategories
    { name: "Gold Chains", categoryName: "Necklaces", description: "Pure gold chains in various designs", order: 1 },
    { name: "Pearl Necklaces", categoryName: "Necklaces", description: "Elegant pearl necklaces", order: 2 },
    { name: "Diamond Necklaces", categoryName: "Necklaces", description: "Luxury diamond necklaces", order: 3 },
    { name: "Temple Jewelry", categoryName: "Necklaces", description: "Traditional temple style necklaces", order: 4 },
    
    // Earrings subcategories
    { name: "Stud Earrings", categoryName: "Earrings", description: "Classic stud earrings", order: 1 },
    { name: "Drop Earrings", categoryName: "Earrings", description: "Elegant drop earrings", order: 2 },
    { name: "Hoop Earrings", categoryName: "Earrings", description: "Modern hoop earrings", order: 3 },
    { name: "Chandbali", categoryName: "Earrings", description: "Traditional chandbali earrings", order: 4 },
    
    // Bracelets subcategories
    { name: "Gold Bracelets", categoryName: "Bracelets", description: "Elegant gold bracelets", order: 1 },
    { name: "Silver Bracelets", categoryName: "Bracelets", description: "Stylish silver bracelets", order: 2 },
    { name: "Diamond Bracelets", categoryName: "Bracelets", description: "Luxury diamond bracelets", order: 3 },
    { name: "Bangles", categoryName: "Bracelets", description: "Traditional and modern bangles", order: 4 },
    
    // Pendants subcategories
    { name: "Religious Pendants", categoryName: "Pendants", description: "Sacred religious pendants", order: 1 },
    { name: "Heart Pendants", categoryName: "Pendants", description: "Romantic heart-shaped pendants", order: 2 },
    { name: "Stone Pendants", categoryName: "Pendants", description: "Precious stone pendants", order: 3 },
    { name: "Lockets", categoryName: "Pendants", description: "Photo lockets and memory pendants", order: 4 },
    
    // Mangalsutras subcategories
    { name: "Traditional Mangalsutras", categoryName: "Mangalsutras", description: "Classic traditional designs", order: 1 },
    { name: "Modern Mangalsutras", categoryName: "Mangalsutras", description: "Contemporary mangalsutra designs", order: 2 },
    { name: "Diamond Mangalsutras", categoryName: "Mangalsutras", description: "Diamond studded mangalsutras", order: 3 }
];

// Products data with variants
const productsData = [
    // Wedding Rings with Size Variants
    {
        name: "Classic Gold Wedding Band",
        description: "Timeless 22K gold wedding band with smooth finish. Perfect for everyday wear with comfortable fit.",
        categoryName: "Rings",
        subcategoryName: "Wedding Rings",
        mrp: 25000,
        costPrice: 20000,
        sellingPrice: 23000,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/wedding-ring-1.jpg", alt: "Classic Gold Wedding Band", isPrimary: true, order: 1 },
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/wedding-ring-1-side.jpg", alt: "Side view", isPrimary: false, order: 2 }
        ],
        goldWeight: 4.5,
        goldPurity: 22,
        makingChargePercent: 12,
        isDynamicPricing: true,
        metalType: 'gold',
        tags: ['Men', 'Women'],
        pricingMethod: 'dynamic',
        hasVariants: true,
        variantOptions: [
            {
                name: "Size",
                displayName: "Ring Size",
                type: "size",
                required: true,
                values: [
                    { name: "6", displayName: "Size 6", priceAdjustment: -500, isAvailable: true },
                    { name: "7", displayName: "Size 7", priceAdjustment: 0, isAvailable: true },
                    { name: "8", displayName: "Size 8", priceAdjustment: 0, isAvailable: true },
                    { name: "9", displayName: "Size 9", priceAdjustment: 500, isAvailable: true },
                    { name: "10", displayName: "Size 10", priceAdjustment: 1000, isAvailable: true }
                ]
            }
        ]
    },
    
    // Diamond Engagement Ring with Size and Stone Color Variants
    {
        name: "Solitaire Diamond Engagement Ring",
        description: "Stunning 1 carat solitaire diamond ring in 18K white gold. Certified VS1 diamond with excellent cut.",
        categoryName: "Rings",
        subcategoryName: "Engagement Rings",
        mrp: 185000,
        costPrice: 150000,
        sellingPrice: 175000,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/solitaire-ring-1.jpg", alt: "Solitaire Diamond Ring", isPrimary: true, order: 1 }
        ],
        goldWeight: 3.2,
        goldPurity: 18,
        makingChargePercent: 15,
        stoneValue: 120000,
        metalType: 'gold',
        tags: ['Women'],
        stones: [{
            type: 'Diamond',
            quality: 'VS1',
            weight: 1.0,
            pricePerUnit: 120000,
            totalValue: 120000,
            color: 'Colorless',
            cut: 'Round',
            setting: 'Prong'
        }],
        pricingMethod: 'fixed',
        hasVariants: true,
        variantOptions: [
            {
                name: "Size",
                displayName: "Ring Size",
                type: "size",
                required: true,
                values: [
                    { name: "6", displayName: "Size 6", priceAdjustment: 0, isAvailable: true },
                    { name: "7", displayName: "Size 7", priceAdjustment: 0, isAvailable: true },
                    { name: "8", displayName: "Size 8", priceAdjustment: 0, isAvailable: true }
                ]
            },
            {
                name: "Metal",
                displayName: "Metal Type",
                type: "select",
                required: true,
                values: [
                    { name: "White Gold", displayName: "18K White Gold", priceAdjustment: 0, isAvailable: true },
                    { name: "Yellow Gold", displayName: "18K Yellow Gold", priceAdjustment: -2000, isAvailable: true },
                    { name: "Rose Gold", displayName: "18K Rose Gold", priceAdjustment: 1000, isAvailable: true }
                ]
            }
        ]
    },
    
    // Gold Chain without variants (traditional product)
    {
        name: "Traditional Gold Chain",
        description: "Beautiful 22K gold chain with intricate rope design. Perfect for pendants or standalone wear.",
        categoryName: "Necklaces",
        subcategoryName: "Gold Chains",
        mrp: 45000,
        costPrice: 38000,
        sellingPrice: 42000,
        stock: 15,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/gold-chain-1.jpg", alt: "Traditional Gold Chain", isPrimary: true, order: 1 }
        ],
        goldWeight: 8.5,
        goldPurity: 22,
        makingChargePercent: 10,
        isDynamicPricing: true,
        metalType: 'gold',
        tags: ['Men', 'Women'],
        pricingMethod: 'dynamic',
        hasVariants: false
    },
    
    // Pearl Necklace with Color Variants
    {
        name: "Fresh Water Pearl Necklace",
        description: "Elegant freshwater pearl necklace with silver clasp. Natural pearls with beautiful luster.",
        categoryName: "Necklaces",
        subcategoryName: "Pearl Necklaces",
        mrp: 12000,
        costPrice: 8000,
        sellingPrice: 10500,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/pearl-necklace-1.jpg", alt: "Pearl Necklace", isPrimary: true, order: 1 }
        ],
        silverWeight: 15.0,
        silverPurity: 999,
        makingChargePercent: 20,
        metalType: 'silver',
        tags: ['Women'],
        stones: [{
            type: 'Pearl',
            quality: 'AAA',
            weight: 50, // 50 pieces
            pricePerUnit: 150,
            totalValue: 7500,
            color: 'White',
            setting: 'Other'
        }],
        pricingMethod: 'fixed',
        hasVariants: true,
        variantOptions: [
            {
                name: "Color",
                displayName: "Pearl Color",
                type: "color",
                required: true,
                values: [
                    { name: "White", displayName: "Classic White", colorCode: "#FFFFFF", priceAdjustment: 0, isAvailable: true },
                    { name: "Cream", displayName: "Elegant Cream", colorCode: "#F5F5DC", priceAdjustment: 500, isAvailable: true },
                    { name: "Pink", displayName: "Soft Pink", colorCode: "#FFB6C1", priceAdjustment: 1000, isAvailable: true },
                    { name: "Black", displayName: "Tahitian Black", colorCode: "#2F2F2F", priceAdjustment: 2500, isAvailable: true }
                ]
            },
            {
                name: "Length",
                displayName: "Necklace Length",
                type: "select",
                required: true,
                values: [
                    { name: "16", displayName: "16 inches (Choker)", priceAdjustment: -1000, isAvailable: true },
                    { name: "18", displayName: "18 inches (Princess)", priceAdjustment: 0, isAvailable: true },
                    { name: "20", displayName: "20 inches (Matinee)", priceAdjustment: 1500, isAvailable: true }
                ]
            }
        ]
    },
    
    // Diamond Stud Earrings with Color and Size variants
    {
        name: "Diamond Stud Earrings",
        description: "Classic diamond stud earrings in 18K gold. Perfect for everyday elegance.",
        categoryName: "Earrings",
        subcategoryName: "Stud Earrings",
        mrp: 55000,
        costPrice: 45000,
        sellingPrice: 52000,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/diamond-studs-1.jpg", alt: "Diamond Stud Earrings", isPrimary: true, order: 1 }
        ],
        goldWeight: 2.1,
        goldPurity: 18,
        makingChargePercent: 18,
        stoneValue: 35000,
        metalType: 'gold',
        tags: ['Women'],
        stones: [{
            type: 'Diamond',
            quality: 'VS2',
            weight: 0.5,
            pricePerUnit: 70000,
            totalValue: 35000,
            color: 'Colorless',
            cut: 'Round',
            setting: 'Prong'
        }],
        pricingMethod: 'fixed',
        hasVariants: true,
        variantOptions: [
            {
                name: "Carat",
                displayName: "Diamond Size",
                type: "select",
                required: true,
                values: [
                    { name: "0.25", displayName: "0.25 Carat Total", priceAdjustment: -15000, isAvailable: true },
                    { name: "0.5", displayName: "0.5 Carat Total", priceAdjustment: 0, isAvailable: true },
                    { name: "0.75", displayName: "0.75 Carat Total", priceAdjustment: 20000, isAvailable: true },
                    { name: "1.0", displayName: "1.0 Carat Total", priceAdjustment: 45000, isAvailable: true }
                ]
            },
            {
                name: "Metal",
                displayName: "Metal Color",
                type: "select",
                required: true,
                values: [
                    { name: "White Gold", displayName: "18K White Gold", priceAdjustment: 0, isAvailable: true },
                    { name: "Yellow Gold", displayName: "18K Yellow Gold", priceAdjustment: -1000, isAvailable: true },
                    { name: "Rose Gold", displayName: "18K Rose Gold", priceAdjustment: 500, isAvailable: true }
                ]
            }
        ]
    },
    
    // Silver Bracelet without variants
    {
        name: "Sterling Silver Bracelet",
        description: "Elegant sterling silver bracelet with intricate design. Comfortable daily wear jewelry.",
        categoryName: "Bracelets",
        subcategoryName: "Silver Bracelets",
        mrp: 3500,
        costPrice: 2500,
        sellingPrice: 3200,
        stock: 25,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/silver-bracelet-1.jpg", alt: "Sterling Silver Bracelet", isPrimary: true, order: 1 }
        ],
        silverWeight: 12.0,
        silverPurity: 999,
        makingChargePercent: 25,
        isDynamicPricing: true,
        metalType: 'silver',
        tags: ['Women', 'Men'],
        pricingMethod: 'dynamic',
        hasVariants: false
    },
    
    // Religious Pendant with Material Variants
    {
        name: "Om Pendant",
        description: "Sacred Om symbol pendant available in gold and silver. Spiritual jewelry for daily wear.",
        categoryName: "Pendants",
        subcategoryName: "Religious Pendants",
        mrp: 8500,
        costPrice: 6500,
        sellingPrice: 7800,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/om-pendant-1.jpg", alt: "Om Pendant", isPrimary: true, order: 1 }
        ],
        goldWeight: 2.5,
        goldPurity: 22,
        makingChargePercent: 20,
        metalType: 'gold',
        tags: ['Men', 'Women'],
        pricingMethod: 'fixed',
        hasVariants: true,
        variantOptions: [
            {
                name: "Material",
                displayName: "Metal Type",
                type: "select",
                required: true,
                values: [
                    { name: "Gold", displayName: "22K Gold", priceAdjustment: 0, isAvailable: true },
                    { name: "Silver", displayName: "Pure Silver", priceAdjustment: -5000, isAvailable: true }
                ]
            },
            {
                name: "Size",
                displayName: "Pendant Size",
                type: "select",
                required: true,
                values: [
                    { name: "Small", displayName: "Small (15mm)", priceAdjustment: -1000, isAvailable: true },
                    { name: "Medium", displayName: "Medium (20mm)", priceAdjustment: 0, isAvailable: true },
                    { name: "Large", displayName: "Large (25mm)", priceAdjustment: 1500, isAvailable: true }
                ]
            }
        ]
    },
    
    // Traditional Mangalsutra without variants
    {
        name: "Classic Black Bead Mangalsutra",
        description: "Traditional mangalsutra with black beads and gold pendant. Sacred jewelry for married women.",
        categoryName: "Mangalsutras",
        subcategoryName: "Traditional Mangalsutras",
        mrp: 35000,
        costPrice: 28000,
        sellingPrice: 32000,
        stock: 8,
        images: [
            { url: "https://res.cloudinary.com/jewelry-store/image/upload/v1/products/mangalsutra-1.jpg", alt: "Traditional Mangalsutra", isPrimary: true, order: 1 }
        ],
        goldWeight: 6.5,
        goldPurity: 22,
        makingChargePercent: 15,
        isDynamicPricing: true,
        metalType: 'gold',
        tags: ['Women'],
        pricingMethod: 'dynamic',
        hasVariants: false
    }
];

async function generateVariants(product, categoryCode, subcategoryCode, productIndex) {
    if (!product.hasVariants || !product.variantOptions || product.variantOptions.length === 0) {
        return [];
    }

    const variants = [];
    const options = product.variantOptions;
    
    // Generate all combinations of variant options
    function generateCombinations(optionIndex, currentCombination, currentPrice) {
        if (optionIndex >= options.length) {
            // Create variant for this combination
            const combinationMap = new Map();
            let sku = generateSKU(categoryCode, subcategoryCode, productIndex, variants.length + 1);
            let totalPriceAdjustment = 0;
            
            currentCombination.forEach((value, index) => {
                const option = options[index];
                combinationMap.set(option.name, value.name);
                totalPriceAdjustment += value.priceAdjustment || 0;
            });
            
            const variant = {
                sku: sku,
                optionCombination: combinationMap,
                price: {
                    mrp: product.mrp + totalPriceAdjustment,
                    costPrice: product.costPrice + Math.round(totalPriceAdjustment * 0.8),
                    sellingPrice: product.sellingPrice + totalPriceAdjustment
                },
                stock: Math.floor(Math.random() * 15) + 5, // Random stock between 5-20
                isActive: true,
                images: [], // Will inherit from main product
                weightAdjustment: {
                    gold: 0,
                    silver: 0
                }
            };
            
            variants.push(variant);
            return;
        }
        
        // Try each value for current option
        const currentOption = options[optionIndex];
        currentOption.values.forEach(value => {
            if (value.isAvailable) {
                const newCombination = [...currentCombination, value];
                generateCombinations(optionIndex + 1, newCombination, currentPrice);
            }
        });
    }
    
    generateCombinations(0, [], product.sellingPrice);
    return variants;
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting jewelry database seeding...');
        
        // Connect to database
        await connectDB();
        
        // Drop problematic index if it exists
        try {
            console.log('🔧 Dropping existing variant SKU index...');
            await mongoose.connection.db.collection('products').dropIndex('variants.sku_1');
            console.log('   ✅ Index dropped');
        } catch (error) {
            console.log('   ℹ️  Index not found (this is normal for first run)');
        }
        
        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Product.deleteMany({});
        await Subcategory.deleteMany({});
        await Category.deleteMany({});
        
        // Create categories
        console.log('📁 Creating categories...');
        const createdCategories = [];
        for (const categoryData of categoriesData) {
            const category = new Category(categoryData);
            await category.save();
            createdCategories.push(category);
            console.log(`   ✅ Created category: ${category.name}`);
        }
        
        // Create subcategories
        console.log('📂 Creating subcategories...');
        const createdSubcategories = [];
        for (const subcatData of subcategoriesData) {
            const category = createdCategories.find(cat => cat.name === subcatData.categoryName);
            if (category) {
                const subcategory = new Subcategory({
                    name: subcatData.name,
                    category: category._id,
                    description: subcatData.description,
                    order: subcatData.order
                });
                await subcategory.save();
                createdSubcategories.push(subcategory);
                console.log(`   ✅ Created subcategory: ${subcategory.name} under ${category.name}`);
            }
        }
        
        // Create products with variants
        console.log('💍 Creating products with variants...');
        let productIndex = 1;
        
        for (const productData of productsData) {
            const category = createdCategories.find(cat => cat.name === productData.categoryName);
            const subcategory = createdSubcategories.find(sub => sub.name === productData.subcategoryName);
            
            if (!category) {
                console.error(`❌ Category ${productData.categoryName} not found for product ${productData.name}`);
                continue;
            }
            
            const categoryCode = category.name.substring(0, 2).toUpperCase();
            const subcategoryCode = subcategory ? subcategory.name.substring(0, 2).toUpperCase() : 'XX';
            
            // Generate base SKU for product
            const baseSku = generateSKU(categoryCode, subcategoryCode, productIndex);
            
            // Generate variants if product has variants
            const variants = await generateVariants(productData, categoryCode, subcategoryCode, productIndex);
            
            const product = new Product({
                ...productData,
                category: category.name, // Store as string as per schema
                subcategory: subcategory ? subcategory._id : null,
                sku: baseSku,
                variants: variants,
                // Remove helper fields that aren't in schema
                categoryName: undefined,
                subcategoryName: undefined
            });
            
            await product.save();
            console.log(`   ✅ Created product: ${product.name}`);
            
            if (variants.length > 0) {
                console.log(`      🎨 Generated ${variants.length} variants:`);
                variants.forEach(variant => {
                    const combinations = Array.from(variant.optionCombination.entries())
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    console.log(`         - ${variant.sku}: ${combinations} (₹${variant.price.sellingPrice}, Stock: ${variant.stock})`);
                });
            } else {
                console.log(`      📦 Stock: ${product.stock}`);
            }
            
            productIndex++;
        }
        
        // Update category product counts
        console.log('🔢 Updating category product counts...');
        for (const category of createdCategories) {
            const count = await Product.countDocuments({ category: category.name });
            await Category.findByIdAndUpdate(category._id, { productsCount: count });
            console.log(`   ✅ Updated ${category.name}: ${count} products`);
        }
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   Categories: ${createdCategories.length}`);
        console.log(`   Subcategories: ${createdSubcategories.length}`);
        console.log(`   Products: ${productIndex - 1}`);
        
        // Calculate total variants
        const allProducts = await Product.find({ hasVariants: true });
        const totalVariants = allProducts.reduce((sum, product) => sum + product.variants.length, 0);
        console.log(`   Total Variants: ${totalVariants}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding script
seedDatabase();
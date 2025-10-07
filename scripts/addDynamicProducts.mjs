import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the Product model
import('../models/Product.js').then(async ({ default: Product }) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create additional products with dynamic pricing
    const dynamicProducts = [
      {
        name: "Premium 22K Gold Chain",
        description: "Premium 22K gold chain necklace with traditional design, perfect for daily wear",
        mrp: 85000,
        sellingPrice: 75000,
        costPrice: 65000,
        price: 75000,
        image: "/product5.jpg",
        category: "Gold",
        stock: 15,
        sku: "GOLD22KCHAIN001",
        isActive: true,
        isDynamicPricing: true,
        goldWeight: 12.5, // grams
        goldPurity: 22,
        makingChargePercent: 12,
        pricingMethod: 'dynamic'
      },
      {
        name: "Traditional Gold Bangles",
        description: "Set of 2 traditional 22K gold bangles with ethnic patterns and premium finish",
        mrp: 125000,
        sellingPrice: 110000,
        costPrice: 95000,
        price: 110000,
        image: "/collections/vintage.jpg",
        category: "Traditional",
        stock: 8,
        sku: "GOLDBAN22K001",
        isActive: true,
        isDynamicPricing: true,
        goldWeight: 18.2, // grams
        goldPurity: 22,
        makingChargePercent: 15,
        pricingMethod: 'dynamic'
      },
      {
        name: "18K Gold Diamond Ring",
        description: "18K gold ring with 0.5 carat diamond and intricate gold setting",
        mrp: 95000,
        sellingPrice: 85000,
        costPrice: 70000,
        price: 85000,
        image: "/product2.jpg",
        category: "Diamond",
        stock: 12,
        sku: "DIAMGOLD18K001",
        isActive: true,
        isDynamicPricing: true,
        goldWeight: 6.8, // grams
        goldPurity: 18,
        makingChargePercent: 18,
        stoneValue: 25000, // Diamond value separate from gold
        pricingMethod: 'dynamic'
      },
      {
        name: "Wedding Gold Ring Set",
        description: "Matching wedding ring set in 18K gold with premium finish and elegant design",
        mrp: 65000,
        sellingPrice: 55000,
        costPrice: 45000,
        price: 55000,
        image: "/collections/wedding.jpeg",
        category: "Wedding",
        stock: 10,
        sku: "WEDGOLD18K001",
        isActive: true,
        isDynamicPricing: true,
        goldWeight: 8.5, // grams
        goldPurity: 18,
        makingChargePercent: 20,
        pricingMethod: 'dynamic'
      },
      {
        name: "Classic Gold Earrings",
        description: "Classic 22K gold earrings with traditional Indian design",
        mrp: 45000,
        sellingPrice: 38000,
        costPrice: 30000,
        price: 38000,
        image: "/product3.jpg",
        category: "Gold",
        stock: 20,
        sku: "GOLDEAR22K001",
        isActive: true,
        isDynamicPricing: true,
        goldWeight: 5.2, // grams
        goldPurity: 22,
        makingChargePercent: 16,
        pricingMethod: 'dynamic'
      }
    ];

    // Check which products already exist
    const existingSKUs = await Product.find({ 
      sku: { $in: dynamicProducts.map(p => p.sku) } 
    }).select('sku');
    
    const existingSKUSet = new Set(existingSKUs.map(p => p.sku));
    const newProducts = dynamicProducts.filter(p => !existingSKUSet.has(p.sku));

    if (newProducts.length > 0) {
      const insertedProducts = await Product.insertMany(newProducts);
      console.log(`Created ${insertedProducts.length} new products with dynamic pricing:`);
      insertedProducts.forEach(product => {
        console.log(`- ${product.name} (${product.goldWeight}g, ${product.goldPurity}K, SKU: ${product.sku})`);
      });
    } else {
      console.log('All dynamic pricing products already exist');
    }

    // Show final summary
    const totalDynamicProducts = await Product.countDocuments({ isDynamicPricing: true });
    const totalProductsWithGoldWeight = await Product.countDocuments({ 
      goldWeight: { $exists: true, $gt: 0 } 
    });

    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total products with dynamic pricing: ${totalDynamicProducts}`);
    console.log(`Total products with gold weight: ${totalProductsWithGoldWeight}`);
    
    const eligibleForUpdate = await Product.find({ 
      isDynamicPricing: true,
      goldWeight: { $exists: true, $gt: 0 }
    });
    
    console.log(`Products eligible for price updates: ${eligibleForUpdate.length}`);
    
    if (eligibleForUpdate.length > 0) {
      console.log('\nAll eligible products:');
      eligibleForUpdate.forEach(product => {
        console.log(`- ${product.name}: ${product.goldWeight}g, ${product.goldPurity}K, ${product.makingChargePercent}% making charge`);
      });
    }

  } catch (error) {
    console.error('Error adding dynamic pricing products:', error);
    if (error.code === 11000) {
      console.log('Some products with duplicate SKUs already exist');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}).catch(error => {
  console.error('Error importing Product model:', error);
  process.exit(1);
});
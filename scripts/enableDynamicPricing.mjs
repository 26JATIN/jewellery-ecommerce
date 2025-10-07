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

    // Find products that could have dynamic pricing (gold/diamond jewelry)
    const eligibleProducts = await Product.find({
      $or: [
        { category: 'Gold' },
        { category: 'Diamond' },
        { category: 'Wedding' },
        { category: 'Traditional' },
        { name: { $regex: 'gold', $options: 'i' } },
        { name: { $regex: 'diamond', $options: 'i' } }
      ]
    });

    console.log(`Found ${eligibleProducts.length} products eligible for dynamic pricing`);

    if (eligibleProducts.length === 0) {
      console.log('No eligible products found. Creating sample products with dynamic pricing...');
      
      // Create sample products with dynamic pricing
      const dynamicProducts = [
        {
          name: "22K Gold Chain Necklace",
          description: "Premium 22K gold chain necklace with traditional design",
          mrp: 85000,
          sellingPrice: 75000,
          costPrice: 65000,
          price: 75000,
          image: "/product5.jpg",
          category: "Gold",
          stock: 15,
          sku: "GOLD22K001",
          isActive: true,
          isDynamicPricing: true,
          goldWeight: 10.5, // grams
          goldPurity: 22,
          makingChargePercent: 12,
          pricingMethod: 'dynamic'
        },
        {
          name: "Traditional Gold Bangles Set",
          description: "Set of 2 traditional 22K gold bangles with ethnic patterns",
          mrp: 125000,
          sellingPrice: 110000,
          costPrice: 95000,
          price: 110000,
          image: "/collections/vintage.jpg",
          category: "Traditional",
          stock: 8,
          sku: "GOLDBAN001",
          isActive: true,
          isDynamicPricing: true,
          goldWeight: 18.2, // grams
          goldPurity: 22,
          makingChargePercent: 15,
          pricingMethod: 'dynamic'
        },
        {
          name: "Diamond Gold Ring",
          description: "18K gold ring with 0.5 carat diamond and gold setting",
          mrp: 95000,
          sellingPrice: 85000,
          costPrice: 70000,
          price: 85000,
          image: "/product2.jpg",
          category: "Diamond",
          stock: 12,
          sku: "DIAMGOLD001",
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
          description: "Matching wedding ring set in 18K gold with premium finish",
          mrp: 65000,
          sellingPrice: 55000,
          costPrice: 45000,
          price: 55000,
          image: "/collections/wedding.jpeg",
          category: "Wedding",
          stock: 10,
          sku: "WEDGOLD001",
          isActive: true,
          isDynamicPricing: true,
          goldWeight: 8.5, // grams
          goldPurity: 18,
          makingChargePercent: 20,
          pricingMethod: 'dynamic'
        }
      ];

      const insertedProducts = await Product.insertMany(dynamicProducts);
      console.log(`Created ${insertedProducts.length} new products with dynamic pricing:`);
      insertedProducts.forEach(product => {
        console.log(`- ${product.name} (${product.goldWeight}g, ${product.goldPurity}K)`);
      });
    } else {
      // Update existing products to enable dynamic pricing
      let updateCount = 0;
      
      for (const product of eligibleProducts) {
        // Determine gold weight based on product type and price
        let goldWeight, goldPurity, makingChargePercent;
        
        if (product.category === 'Gold' || product.name.toLowerCase().includes('gold')) {
          goldWeight = Math.round((product.price / 6000) * 100) / 100; // Estimate based on price
          goldPurity = product.name.includes('22') ? 22 : 18;
          makingChargePercent = 15;
        } else if (product.category === 'Diamond') {
          goldWeight = Math.round((product.price * 0.3 / 6000) * 100) / 100; // 30% of price for gold
          goldPurity = 18;
          makingChargePercent = 20;
        } else if (product.category === 'Wedding' || product.category === 'Traditional') {
          goldWeight = Math.round((product.price / 6500) * 100) / 100;
          goldPurity = 22;
          makingChargePercent = 18;
        } else {
          continue; // Skip products that don't clearly contain gold
        }

        // Skip if gold weight would be too small
        if (goldWeight < 1) continue;

        await Product.findByIdAndUpdate(product._id, {
          isDynamicPricing: true,
          goldWeight: goldWeight,
          goldPurity: goldPurity,
          makingChargePercent: makingChargePercent,
          pricingMethod: 'dynamic',
          stoneValue: product.category === 'Diamond' ? product.price * 0.4 : 0
        });

        console.log(`Updated: ${product.name} - ${goldWeight}g, ${goldPurity}K gold`);
        updateCount++;
      }

      console.log(`Updated ${updateCount} existing products with dynamic pricing`);
    }

    // Show final summary
    const totalDynamicProducts = await Product.countDocuments({ isDynamicPricing: true });
    const totalProductsWithGoldWeight = await Product.countDocuments({ 
      goldWeight: { $exists: true, $gt: 0 } 
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total products with dynamic pricing: ${totalDynamicProducts}`);
    console.log(`Total products with gold weight: ${totalProductsWithGoldWeight}`);
    
    const eligibleForUpdate = await Product.find({ 
      isDynamicPricing: true,
      goldWeight: { $exists: true, $gt: 0 }
    });
    
    console.log(`Products eligible for price updates: ${eligibleForUpdate.length}`);
    
    if (eligibleForUpdate.length > 0) {
      console.log('\nEligible products:');
      eligibleForUpdate.forEach(product => {
        console.log(`- ${product.name}: ${product.goldWeight}g, ${product.goldPurity}K, ${product.makingChargePercent}% making charge`);
      });
    }

  } catch (error) {
    console.error('Error enabling dynamic pricing:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}).catch(error => {
  console.error('Error importing Product model:', error);
  process.exit(1);
});
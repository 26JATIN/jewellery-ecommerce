import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the Coupon model
import('../models/Coupon.js').then(async ({ default: Coupon }) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample coupons
    const sampleCoupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome discount for new customers - 10% off',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderValue: 5000,
        maximumDiscountAmount: 2000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        userUsageLimit: 1,
        firstTimeUserOnly: true,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        code: 'SAVE20',
        description: 'Save 20% on orders above ₹10,000',
        discountType: 'percentage',
        discountValue: 20,
        minimumOrderValue: 10000,
        maximumDiscountAmount: 5000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 50,
        userUsageLimit: 2,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        code: 'GOLD15',
        description: 'Special 15% discount on Gold jewelry',
        discountType: 'percentage',
        discountValue: 15,
        minimumOrderValue: 8000,
        maximumDiscountAmount: 3000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        usageLimit: 75,
        userUsageLimit: 1,
        applicableCategories: ['Gold', 'Traditional', 'Wedding'],
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        code: 'FLAT1000',
        description: 'Flat ₹1000 off on orders above ₹15,000',
        discountType: 'fixed',
        discountValue: 1000,
        minimumOrderValue: 15000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        usageLimit: 200,
        userUsageLimit: 3,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        code: 'DIAMOND25',
        description: 'Exclusive 25% off on Diamond jewelry',
        discountType: 'percentage',
        discountValue: 25,
        minimumOrderValue: 20000,
        maximumDiscountAmount: 8000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        usageLimit: 25,
        userUsageLimit: 1,
        applicableCategories: ['Diamond'],
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        code: 'EXPIRED10',
        description: 'Expired coupon for testing - 10% off',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderValue: 5000,
        validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        validUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        usageLimit: 100,
        userUsageLimit: 1,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      }
    ];

    // Check which coupons already exist
    const existingCodes = await Coupon.find({ 
      code: { $in: sampleCoupons.map(c => c.code) } 
    }).select('code');
    
    const existingCodeSet = new Set(existingCodes.map(c => c.code));
    const newCoupons = sampleCoupons.filter(c => !existingCodeSet.has(c.code));

    if (newCoupons.length > 0) {
      const insertedCoupons = await Coupon.insertMany(newCoupons);
      console.log(`Created ${insertedCoupons.length} new coupons:`);
      insertedCoupons.forEach(coupon => {
        console.log(`- ${coupon.code}: ${coupon.description}`);
      });
    } else {
      console.log('All sample coupons already exist');
    }

    // Show final summary
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    console.log('\n=== COUPON SUMMARY ===');
    console.log(`Total coupons: ${totalCoupons}`);
    console.log(`Active coupons: ${activeCoupons}`);
    
    const allCoupons = await Coupon.find({}, 'code description discountType discountValue validUntil isActive');
    console.log('\nAll coupons:');
    allCoupons.forEach(coupon => {
      const status = !coupon.isActive ? 'INACTIVE' : 
                    coupon.validUntil < new Date() ? 'EXPIRED' : 'ACTIVE';
      console.log(`- ${coupon.code}: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} off - ${status}`);
    });

  } catch (error) {
    console.error('Error seeding coupons:', error);
    if (error.code === 11000) {
      console.log('Some coupons with duplicate codes already exist');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}).catch(error => {
  console.error('Error importing Coupon model:', error);
  process.exit(1);
});
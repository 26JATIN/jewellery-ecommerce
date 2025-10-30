// Script to link a product to a hero video
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nandika-jewellers';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Import models
    const HeroVideo = require('./models/HeroVideo').default || require('./models/HeroVideo');
    const Product = require('./models/Product').default || require('./models/Product');

    // Get first video
    const video = await HeroVideo.findOne();
    if (!video) {
      console.log('No videos found!');
      process.exit(1);
    }
    console.log('Found video:', video.title);

    // Get first active product
    const product = await Product.findOne({ isActive: true });
    if (!product) {
      console.log('No products found!');
      process.exit(1);
    }
    console.log('Found product:', product.name, 'Slug:', product.slug);

    // Link product to video
    video.linkedProductId = product._id;
    video.linkedProductSlug = product.slug;
    await video.save();

    console.log('✅ Successfully linked product to video!');
    console.log('Video:', video.title);
    console.log('Product:', product.name);
    console.log('Product Slug:', product.slug);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

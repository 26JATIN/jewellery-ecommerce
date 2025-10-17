import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const EXPECTED_DB_NAME = 'nandikajewellers';

async function verifyDatabase() {
    try {
        console.log('🔍 Verifying MongoDB Database Configuration...\n');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        
        const db = mongoose.connection.db;
        const actualDbName = db.databaseName;
        
        console.log('📊 Connection Information:');
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Database: ${actualDbName}`);
        console.log(`   Expected: ${EXPECTED_DB_NAME}\n`);

        // Check if we're connected to the correct database
        if (actualDbName !== EXPECTED_DB_NAME) {
            console.error(`❌ ERROR: Connected to wrong database!`);
            console.error(`   Current: ${actualDbName}`);
            console.error(`   Expected: ${EXPECTED_DB_NAME}\n`);
            console.error('⚠️  Please update your MONGODB_URI in .env file to include the database name:');
            console.error(`   mongodb+srv://username:password@host/${EXPECTED_DB_NAME}?options\n`);
            process.exit(1);
        }

        console.log('✅ Connected to correct database!\n');

        // List all collections in the database
        const collections = await db.listCollections().toArray();
        
        console.log('📦 Collections in database:');
        if (collections.length === 0) {
            console.log('   (No collections found - database is empty)\n');
        } else {
            console.log(`   Total collections: ${collections.length}\n`);
            
            for (const collection of collections) {
                const stats = await db.collection(collection.name).stats();
                console.log(`   📁 ${collection.name}`);
                console.log(`      Documents: ${stats.count}`);
                console.log(`      Size: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`      Indexes: ${stats.nindexes}`);
                console.log('');
            }
        }

        // Expected collections for this application
        const expectedCollections = [
            'users',
            'products',
            'categories',
            'orders',
            'carts',
            'returns',
            'coupons',
            'gallery',
            'herovideos'
        ];

        console.log('📋 Expected Collections Status:');
        for (const expectedColl of expectedCollections) {
            const exists = collections.some(c => c.name === expectedColl);
            if (exists) {
                console.log(`   ✅ ${expectedColl}`);
            } else {
                console.log(`   ⚪ ${expectedColl} (will be created when first document is inserted)`);
            }
        }

        console.log('\n✅ Database verification complete!');
        console.log(`\n💡 All data will be stored in: ${EXPECTED_DB_NAME}`);
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed.');
    }
}

// Run verification
verifyDatabase();

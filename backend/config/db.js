import mongoose from 'mongoose';

// Connect to MongoDB Atlas
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is missing in your .env file!');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Atlas Connection Notice: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.log('👉 Quick fix: Log in to your MongoDB Atlas dashboard -> Network Access -> Add IP Address -> Choose "Allow Access from Anywhere" (0.0.0.0/0).');
    }
  }
};

export default connectDB;

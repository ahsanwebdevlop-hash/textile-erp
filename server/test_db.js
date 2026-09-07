import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing MongoDB Connection...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

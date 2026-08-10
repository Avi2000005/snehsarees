import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const api_key = (process.env.CLOUDINARY_API_KEY || '').trim();
const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

console.log('Testing Cloudinary Credentials with 1x1 PNG:');
// 1x1 transparent PNG
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const uploadStream = cloudinary.uploader.upload_stream(
  { folder: 'test_connection' },
  (error, result) => {
    if (error) {
      console.error('Test Upload Failed:', error);
      process.exit(1);
    } else {
      console.log('Test Upload Success! Image URL:', result?.secure_url);
      process.exit(0);
    }
  }
);

uploadStream.end(pngBuffer);

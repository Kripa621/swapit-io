import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

// Optional debug (temporary)
console.log("ENV CHECK:", {
  MONGO_URI: !!process.env.MONGO_URI,
  CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY
});

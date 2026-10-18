const cloudinaryLib = require('cloudinary');
const cloudinary = cloudinaryLib.v2;

// Uploads go to Cloudinary when credentials are present, and fall back to the
// local disk otherwise (so `npm run dev` still works with no cloud account).
// The Cloudinary SDK also auto-reads the CLOUDINARY_URL env var, so either the
// single URL or the three discrete vars are supported.
const hasDiscrete = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);
const enabled = !!(process.env.CLOUDINARY_URL || hasDiscrete);

if (enabled) {
  cloudinary.config(
    hasDiscrete
      ? {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        }
      : { secure: true }
  );
}

module.exports = { cloudinary, enabled };

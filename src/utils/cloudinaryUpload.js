const cloudinary = require("cloudinary").v2;
const stream = require("stream");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer image to Cloudinary and return secure URL
 * @param {Buffer} fileBuffer - image buffer
 * @param {String} folder - cloudinary folder name
 * @returns Promise<string> - uploaded image secure_url
 */
const uploadImageToCloudinary = (fileBuffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url); // return URL only
      }
    );

    // convert buffer to stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

module.exports = uploadImageToCloudinary;











// const uploadImageToCloudinary = require("../utils/cloudinaryUpload");

// if (req.file) {
//   user.avatarUrl = await uploadImageToCloudinary(req.file.buffer, "avatars");
// }

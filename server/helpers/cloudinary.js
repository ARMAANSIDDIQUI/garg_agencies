const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dad0u4dez",
  api_key: "382741467717813",
  api_secret: "bK_nAAW0E0mW4P37kDWKa8kO-Jk",
  secure: true // Ensures the returned URL is HTTPS
});
//
const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto", // Automatically determines the resource type
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Resize to a maximum of 800x600
      { quality: "auto", fetch_format: "auto" } // Automatic quality and format
    ],
    secure: true // Ensures the returned URL is HTTPS
  });

   // Debugging: Log the result to check the URL
   console.log("Cloudinary upload result:", result);

  return result;
}


const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };

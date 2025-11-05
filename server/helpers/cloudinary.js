const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dywlgg8ve",
  api_key: "814344168926352",
  api_secret: "eX3sH1CZzkb2ThqhAiV_ACbEM_M",
  secure: true // Ensures the returned URL is HTTPS
});

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

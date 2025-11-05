const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    subcategories: [
      {
        type: String, // Assuming subcategories are just strings
      }
    ]
  },
  { timestamps: true }
);

const Brands = mongoose.model("Brands", BrandSchema);
module.exports = Brands;

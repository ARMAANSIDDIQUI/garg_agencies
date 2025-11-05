const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  fetchAllOutOfStockProducts,
  searchProduct, // Import the searchProduct controller function
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);
router.get("/outOfStock", fetchAllOutOfStockProducts);

// Add the searchProduct route
router.get("/search/:searchQuery", searchProduct); // Search route to handle product search

module.exports = router;

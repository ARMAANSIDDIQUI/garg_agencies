const express = require("express");
const { verifyToken, authorizeRoles } = require("../../middleware/auth"); // Assuming auth middleware exists

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  fetchAllOutOfStockProducts,
  searchProduct,
  fetchProductsForBulkEdit, // New controller function
  bulkUpdateProducts, // New controller function
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);
router.get("/outOfStock", fetchAllOutOfStockProducts);
router.get("/search/:searchQuery", searchProduct);

// New routes for bulk product editing
router.get("/bulk-edit", verifyToken, authorizeRoles("admin"), fetchProductsForBulkEdit);
router.put("/bulk-update", verifyToken, authorizeRoles("admin"), bulkUpdateProducts);

module.exports = router;

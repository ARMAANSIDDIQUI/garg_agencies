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

router.post("/upload-image", verifyToken, authorizeRoles("admin"), upload.single("my_file"), handleImageUpload);
router.post("/add", verifyToken, authorizeRoles("admin"), addProduct);
router.put("/edit/:id", verifyToken, authorizeRoles("admin"), editProduct);
router.delete("/delete/:id", verifyToken, authorizeRoles("admin"), deleteProduct);
router.get("/get", verifyToken, authorizeRoles("admin"), fetchAllProducts);
router.get("/outOfStock", verifyToken, authorizeRoles("admin"), fetchAllOutOfStockProducts);
router.get("/search/:searchQuery", verifyToken, authorizeRoles("admin"), searchProduct);

// New routes for bulk product editing
router.get("/bulk-edit", verifyToken, authorizeRoles("admin"), fetchProductsForBulkEdit);
router.put("/bulk-update", verifyToken, authorizeRoles("admin"), bulkUpdateProducts);

module.exports = router;

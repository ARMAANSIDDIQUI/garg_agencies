const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getBestReviewProducts,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.get("/bestProducts", getBestReviewProducts);

module.exports = router;

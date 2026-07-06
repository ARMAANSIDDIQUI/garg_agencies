const express = require("express");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", verifyToken, authorizeRoles("admin"), getAllOrdersOfAllUsers);
router.get("/details/:id", verifyToken, authorizeRoles("admin"), getOrderDetailsForAdmin);
router.put("/update/:id", verifyToken, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;

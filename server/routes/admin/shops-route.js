const express = require("express")
const { getShops, editShop, deleteShop } = require("../../controllers/admin/shops-controller")
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router()

router.get("/get", verifyToken, authorizeRoles("admin"), getShops)
router.put("/:shopId", verifyToken, authorizeRoles("admin"), editShop)
router.delete("/:shopId", verifyToken, authorizeRoles("admin"), deleteShop)

module.exports = router;
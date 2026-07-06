const express = require("express")
const { addBrand,editBrand, deleteBrand,getBrands } = require("../../controllers/admin/brands-controller")
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router()

router.post("/add", verifyToken, authorizeRoles("admin"), addBrand)
router.get("/get", getBrands)
router.put("/:brandId", verifyToken, authorizeRoles("admin"), editBrand)
router.delete("/:brandId", verifyToken, authorizeRoles("admin"), deleteBrand)

module.exports = router;
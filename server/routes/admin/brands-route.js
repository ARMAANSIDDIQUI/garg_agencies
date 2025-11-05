const express = require("express")
const { addBrand,editBrand, deleteBrand,getBrands } = require("../../controllers/admin/brands-controller")


const router = express.Router()

router.post("/add", addBrand)
router.get("/get", getBrands)
router.put("/:brandId",editBrand)
router.delete("/:brandId",deleteBrand)

module.exports = router;
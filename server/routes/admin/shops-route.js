const express = require("express")
const { getShops, editShop, deleteShop } = require("../../controllers/admin/shops-controller")



const router = express.Router()

router.get("/get", getShops)
router.put("/:shopId",editShop)
router.delete("/:shopId",deleteShop)

module.exports = router;
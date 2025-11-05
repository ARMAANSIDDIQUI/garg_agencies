const express = require("express")
const { addCategory,editCategory,getCategories,deleteCategory} = require("../../controllers/admin/categories-controller")


const router = express.Router()

router.post("/add", addCategory)
router.get("/get", getCategories)
router.put("/:categoryId",editCategory)
router.delete("/:categoryId", deleteCategory)

module.exports = router;
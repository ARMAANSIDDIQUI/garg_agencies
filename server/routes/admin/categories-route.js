const express = require("express")
const { addCategory,editCategory,getCategories,deleteCategory} = require("../../controllers/admin/categories-controller")
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router()

router.post("/add", verifyToken, authorizeRoles("admin"), addCategory)
router.get("/get", getCategories)
router.put("/:categoryId", verifyToken, authorizeRoles("admin"), editCategory)
router.delete("/:categoryId", verifyToken, authorizeRoles("admin"), deleteCategory)

module.exports = router;
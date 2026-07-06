const express = require("express")
const { addBeat,getBeats, editBeat, deleteBeat } = require("../../controllers/admin/beats-controller")
const { verifyToken, authorizeRoles } = require("../../middleware/auth");

const router = express.Router()

router.post("/add", verifyToken, authorizeRoles("admin"), addBeat)
router.get("/get", getBeats)
router.put("/:beatId", verifyToken, authorizeRoles("admin"), editBeat)
router.delete("/:beatId", verifyToken, authorizeRoles("admin"), deleteBeat)

module.exports = router;
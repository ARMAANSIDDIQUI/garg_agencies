const express = require("express")
const { addBeat,getBeats, editBeat, deleteBeat } = require("../../controllers/admin/beats-controller")


const router = express.Router()

router.post("/add", addBeat)
router.get("/get", getBeats)
router.put("/:beatId",editBeat)
router.delete("/:beatId",deleteBeat)

module.exports = router;
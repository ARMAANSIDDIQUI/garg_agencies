const express = require("express");
const { sendEnquiry } = require("../../controllers/shop/enquiry-controller");

const router = express.Router();

router.post("/enquire", sendEnquiry);

module.exports = router;

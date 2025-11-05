const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Otp", OtpSchema);

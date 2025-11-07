const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    address: String,
    phone: Number,
    email: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);

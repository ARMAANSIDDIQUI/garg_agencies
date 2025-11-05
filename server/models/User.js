const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    userAddress: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
      unique: true,
    },
    beatName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true } // This will add createdAt and updatedAt fields
);

const User = mongoose.model("User", UserSchema);
module.exports = User;

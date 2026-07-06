const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  requestOtp,
  verifyOtp,
  changePassword,
  updateEmail,
} = require("../../controllers/auth/auth-controller");
const User = require("../../models/User");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/change-password", changePassword);
router.post("/update-email", authMiddleware, updateEmail);
router.get("/check-auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user: {
        id: user._id,
        role: user.role,
        phoneNo: user.phoneNo,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in check-auth database query:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;

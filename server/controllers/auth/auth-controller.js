const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Cart = require("../../models/Cart")
const unirest = require("unirest");
const Otp = require("../../models/Otp")
const Address = require("../../models/Address")

const fast2smsApiKey = "nKnWsfTWXZcASRNn4YZgDoEOw1MDMeFbXc6lOqEoSBYMFk2ejuozZOacsOSz";


//register
const registerUser = async (req, res) => {
  const { userName, userAddress, phoneNo, beatName, password, email } = req.body;

  try {
    const checkUser = await User.findOne({ phoneNo });
    if (checkUser)
      return res.json({
        success: false,
        message: "Shop Already exists with the same phone no! Please try again",
      });

    // const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      userAddress,
      phoneNo,
      beatName,
      password: password,
      email,
    });
   

    await newUser.save();

    // Create a new cart for the user
    const newCart = new Cart({
      userId: newUser._id,
      items: [], // Start with an empty cart
    });
    await newCart.save();

    const newAddress = new Address({
      userId : newUser._id ,
      address : userAddress,
      phone : phoneNo,
      email : email,

    })
    await newAddress.save();

    res.status(200).json({
      success: true,
      message: "Shop Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { phoneNo, password } = req.body;

  try {
    const checkUser = await User.findOne({ phoneNo });
    if (!checkUser)
      return res.json({
        success: false,
        message: "Shop doesn't exists! Please register first",
      });

      const checkPasswordMatch = password === checkUser.password;

    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        phoneNo: checkUser.phoneNo,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "30d" }
    );

    res.cookie("token", token, { httpOnly: false, secure: false }).json({ 
      success: true,
      message: "Logged in successfully",
      user: {
        token:token,
        phoneNo: checkUser.phoneNo,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// Request OTP and store in MongoDB
const requestOtp = async (req, res) => {
  const { phoneNo } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP expiration time (5 minutes from now)
  const expirationTime = new Date(Date.now() + 5 * 60000);

  // Create or update OTP record in the database
  try {
    // Check if there's already an OTP for this phoneNo, then update it
    let existingOtp = await Otp.findOne({ phoneNo });
    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.expirationTime = expirationTime;
      await existingOtp.save();
    } else {
      // Create a new OTP document
      const newOtp = new Otp({
        phoneNo,
        otp,
        expirationTime,
      });
      await newOtp.save();
    }

    // Define the message with the custom business name (Shashwat Enterprises) and phone number format (+51)
    const message = `Your OTP for Shashwat Enterprises is: ${otp}`;

    // Send the OTP via Fast2SMS API
    const reqSms = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
    reqSms.headers({
      authorization: fast2smsApiKey, // Ensure API key is loaded from environment variables
    });
    reqSms.form({
      message: message,
      language: "english",
      route: "q",
      numbers: phoneNo, // Send OTP to the provided phone number
    });

    reqSms.end(function (response) {
      if (response.error) {
        console.error(response.error);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
      }

      console.log(response.body);
      res.json({ success: true, message: "OTP sent successfully!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to store OTP" });
  }
};

// Verify OTP and update passwor
const verifyOtp = async (req, res) => {
  const { phoneNo, otp, newPassword } = req.body;

  try {
    // Fetch OTP record from MongoDB
    const otpRecord = await Otp.findOne({ phoneNo });

    // Check if OTP exists and is still valid
    if (!otpRecord || String(otpRecord.otp) !== String(otp) || otpRecord.expirationTime < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // Find the user by phone number and update password
    const user = await User.findOne({ phoneNo });
    if (!user) return res.json({ success: false, message: "User not found" });
     user.password = newPassword; // Ensure to hash the password in production
     await user.save();

    // Remove the OTP from the database after successful verification
    await Otp.deleteOne({ phoneNo });

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
};


//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

// Add this new controller function
const changePassword = async (req, res) => {
  const { phoneNo, oldPassword, newPassword } = req.body;

  try {
    // Find user
    const user = await User.findOne({ phoneNo });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    if (user.password !== oldPassword) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    try {
      // Update password using findOneAndUpdate
      const updatedUser = await User.findOneAndUpdate(
        { phoneNo },
        { password: newPassword },
        { new: true } // This option returns the updated document
      );

      if (!updatedUser) {
        return res.json({
          success: false,
          message: "Failed to update password",
        });
      }

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (updateError) {
      console.error("Error updating password:", updateError);
      res.status(500).json({
        success: false,
        message: "Error updating password in database",
      });
    }
  } catch (error) {
    console.error("Error in change password:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware,requestOtp,
  verifyOtp, changePassword, };

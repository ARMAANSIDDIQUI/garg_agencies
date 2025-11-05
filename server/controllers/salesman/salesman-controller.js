const User = require("../../models/User"); // Assuming this model is already defined
const jwt = require("jsonwebtoken");
const Order = require("../../models/Order")
const getAllSalesmen = async (req, res) => {
  try {
    const salesmen = await User.find({ role: 'salesman' }); // Get all users with the 'salesman' role
    res.status(200).json({
      success: true,
      salesmen,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching salesmen.",
    });
  }
};

// Get orders by salesman ID
const getOrdersBySalesmanId = async (req, res) => {
  const { salesmanId } = req.params;

  try {
    const orders = await Order.find({salesmanId}).sort({ createdAt: -1 }); // Adjust this if your order model uses a different reference
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders for the salesman.",
    });
  }
};

const getSalesmanDetails = async (req, res) => {
  try {
    const salesman = await User.findById(req.params.salesmanId).where({ role: 'salesman' });
    if (!salesman) {
      return res.status(404).json({ message: "Salesman not found" });
    }
    res.json({ salesmanName: salesman.userName, phoneNo:salesman.phoneNo });
  } catch (error) {
    res.status(500).json({ message: "Error fetching salesman data" });
  }
};

// Get all users (shops)
const getAllUsers = async (req, res) => {
  try {
    // Use aggregation to sort user names in a case-insensitive manner
    const users = await User.aggregate([
      { $match: { role: "user" } }, // Match users with the 'user' role
      { $addFields: { lowerUserName: { $toLower: "$userName" } } }, // Add a field for case-insensitive sorting
      { $sort: { lowerUserName: 1 } }, // Sort by the new lowerUserName field
      { $project: { lowerUserName: 0 } } // Exclude the lowerUserName field from the results
    ]);
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
};


// Add a new user (shop)
const addUser = async (req, res) => {
  const { userName, userAddress, phoneNo, password } = req.body;

  try {
    const checkUser = await User.findOne({ phoneNo });
    if (checkUser)
      return res.json({
        success: false,
        message: "User already exists with the same phone number! Please try again.",
      });

    const newUser = new User({
      userName,
      userAddress,
      phoneNo,
      password, // Ensure password is hashed in production
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User (shop) added successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding a new user.",
    });
  }
};

// Impersonate a user
const impersonateUser = async (req, res) => {
  const { userId, salesmanId } = req.params;

  try {
    const userToImpersonate = await User.findById(userId);
    if (!userToImpersonate) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate a new token for the impersonated user
    const token = jwt.sign(
        {
          id: userToImpersonate._id,
          role: userToImpersonate.role,
          phoneNo: userToImpersonate.phoneNo,
          userName: userToImpersonate.userName,
        },
        "CLIENT_SECRET_KEY", // Use environment variable for secret key
        { expiresIn: "30d" }
    );

    // Set the new token in an httpOnly cookie
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: 'Lax' })
       .json({
         success: true,
         message: "Impersonation successful.",
         token,
         salesmanId,
         user: {
           phoneNo: userToImpersonate.phoneNo,
           role: userToImpersonate.role,
           id: userToImpersonate._id,
           userName: userToImpersonate.userName,
         },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while impersonating the user.",
    });
  }
};


module.exports = {
  getSalesmanDetails,
  getAllSalesmen,
  getOrdersBySalesmanId,
  getAllUsers,
  addUser,
  impersonateUser,
  getOrdersBySalesmanId,
};

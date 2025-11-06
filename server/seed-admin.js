const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

//We are storing a plain-text password. This is a major security risk.
//Anyone with database access can see this password.
const createAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("MONGO_URI not found in .env file. Exiting.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding...");

    const adminPhone = "9456222022";

    const existingAdmin = await User.findOne({ phoneNo: adminPhone });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      mongoose.disconnect();
      return;
    }

    const adminUser = new User({
      userName: "Admin",
      userAddress: "Office",
      phoneNo: adminPhone,
      beatName: "ALL",
      password: "admin_password_123",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

createAdmin();
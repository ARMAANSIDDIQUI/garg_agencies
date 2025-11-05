const User = require("../../models/User");

// Get all shops (users with the "shop" or "salesman" role)
const getShops = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['salesman', 'user'] } })
        .sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

// Edit a shop's role (change from user to salesman or vice versa)
const editShop = async (req, res) => {
    const { shopId } = req.params;
  const { role } = req.body;

  try {
    // Check if the role is valid
    if (!['user', 'salesman'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find the shop/user by ID and update the role
    const updatedUser = await User.findByIdAndUpdate(
      shopId,
      { role: role },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser); // Return updated user object
  } catch (error) {
    console.error(error); // Log server-side error
    res.status(500).json({
      message: 'Error updating user role',
      error: error.message || 'Unknown error',
    });
  }
};

// Delete a shop (remove a user)
const deleteShop = async (req, res) => {
    const { shopId } = req.params;

    try {
        // Check if the current user has admin rights (you might implement this based on req.user)
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: "You do not have permission to delete users" });
        // }

        const deletedUser = await User.findByIdAndDelete(shopId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted", deletedUser });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

module.exports = { getShops, editShop, deleteShop };

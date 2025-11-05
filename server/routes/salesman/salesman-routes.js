const express = require("express");
const {
  addUser,
  getSalesmanDetails,
  getAllUsers,
  getAllSalesmen,
  getOrdersBySalesmanId,
  impersonateUser
} = require("../../controllers/salesman/salesman-controller");

const router = express.Router();


// Route to get all users (shops)
router.get("/users", getAllUsers);

// Add a new user (shop)
router.post("/users",  addUser);

// Route to impersonate a user
router.post("/impersonate/:userId/:salesmanId", impersonateUser);

router.get("/:salesmanId", getSalesmanDetails);
router.get("/", getAllSalesmen);
router.get("/orders/:salesmanId", getOrdersBySalesmanId);

module.exports = router;

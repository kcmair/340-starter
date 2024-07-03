// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accContorler = require("../controllers/accountControler")

// Route to build inventory by classification view
router.get("/login", accountController.buildAccountDetail);

module.exports = router;

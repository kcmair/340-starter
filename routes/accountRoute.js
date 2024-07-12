// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login request
router.post(
  "/login",
  // regValidate.loginRules(),
  // regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegistrationDetail))

// Route to process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to build the account view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountDetail))

module.exports = router

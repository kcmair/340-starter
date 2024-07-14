// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login request
router.post("/login", utilities.handleErrors(accountController.accountLogin)
)

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegistrationDetail))

// Route to process the registration data
router.post(
  "/register",
  regValidate.registrationRules,
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to build the account view
router.get("/manage", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementDetail))

// Route to build update account view
router.get("/update-user", utilities.handleErrors(accountController.updateAccountView))

// Route to update the user info
router.post("/update-user",
  regValidate.updateAccountRules,
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to update the password
router.post("/update-password",
  regValidate.updatePasswordRules,
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updatePassword))

// Route to log out
router.get("/logout", utilities.handleErrors(accountController.logoutUser))

module.exports = router

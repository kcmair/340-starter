const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const res = require("express/lib/response");
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistrationDetail(req, res) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.flash("notice", "Success! You're logged in.")
      return res.redirect("/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

async function buildAccountManagementDetail(req, res) {
  let nav = await utilities.getNav()
  let manageAccount = await utilities.buildAccountManagementView(res.locals.accountData)
  res.render("account/management", {
    title: "Account Management",
    nav,
    manageAccount
  })
}

async function buildAccountDetail(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "My Account",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function updateAccountView(req, res) {
  let nav = await utilities.getNav()
  const a = res.locals.accountData
  res.render("account/update", {
    title: "Update Your Account",
    nav,
    account_id: a.account_id,
    account_firstname: a.account_firstname,
    account_lastname: a.account_lastname,
    account_email: a.account_email,
    errors: null,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const manageAccount = await utilities.buildAccountManagementView(res.locals.accountData)

  const regResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, ${account_firstname} you\'ve updated your account.`
    )
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      manageAccount
    })
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update-user", {
      title: "Update Your Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (regResult) {
    res.clearCookie("jwt")
    res.locals.accountData = null
    req.flash(
      "notice",
      `Congratulations, you\'ve updated your password. Please log in with your new password.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_id
    })
  }
}

async function logoutUser() {
  if (process.env.NODE_ENV === 'development') {
    res.clearCookie("jwt", { httpOnly: true })
  } else {
    res.clearCookie("jwt", { httpOnly: true, secure: true })
  }
  req.session.destroy((err) => {
    if(err) {
      console.error(err)
    }
  })
  res.locals.accountData = null
  let nav = await utilities.getNav()
  res.flash("notice", "Successfully logged out.")
  res.render("index", {
    nav
  })
}

module.exports = {
  buildLogin,
  buildRegistrationDetail,
  registerAccount,
  accountLogin,
  buildAccountManagementDetail,
  updateAccountView,
  updateAccount,
  updatePassword,
  logoutUser
}

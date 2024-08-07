const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul class='menu'>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    if (row.classification_approval) {
      list += "<li>"
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
      list += "</li>"
    }
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display" class="grid">'
    data.forEach(vehicle => {
      if (vehicle.inv_approval) {
        grid += '<li>'
        grid += '<a href="../../inv/detail/'+ vehicle.inv_id
          + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model
          + 'details"><img src="' + vehicle.inv_thumbnail
          +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model
          +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View '
          + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
          + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$'
          + new Intl.NumberFormat('en-US').format(vehicle.inv_price)
          + '</span>'
        grid += '</div>'
        grid += '</li>'
      }
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ***************************************
 * Build the inventory view HTML
 * ************************************* */
Util.displayInventory = async function(data){
  let display
  if(data){
    display = '<ul id="vehicle" class="vehicle">'
    display += '<li>'
    display += '<img src="' + data.inv_image
      +'" alt="Image of'+ data.inv_make + ' ' + data.inv_model
      +' on CSE Motors" />'
    display += '<div class="namePrice">'
    display += '<hr />'
    display += '<h2>'
      + data.inv_year + ' '
      + data.inv_make + ' '
      + data.inv_model
      + '</h2>'
    display += '<p>' + data.inv_description + '</p>'
    display += '<span>$'
      + new Intl.NumberFormat('en-US').format(data.inv_price)
      + '</span>'
    display += '<p>Milage: '
      + data.inv_miles.toLocaleString('en-US')
      + '<br>'
      + 'Color: ' + data.inv_color
      + '</p>'
    display += '</div>'
    display += '</li>'
    display += '</ul>'
  } else {
    display = '<p class="notice">Sorry, we can\'t seem to find that vehicle.<p/>'
  }
  return display
}

/* ***************************************
 * Build the classification list HTML for classification selector
 * ************************************* */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required value="<%= locals.classification_id %>">'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    if (row.classification_approval) {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id === classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    }
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please login.")
    return res.redirect("/account/login")
  }
}

Util.buildHeader = (req, res) => {
  let accountHeader
  if (res.locals.loggedin) {
    accountHeader = '<a href="/account/manage" title="Click to update account">'
    accountHeader += 'Welcome '
    accountHeader += res.locals.accountData.account_firstname
    accountHeader += '</a>'
    accountHeader += '<a href="/account/logout" title="Click to logout">Logout</a>'
  } else {
    accountHeader = '<a href="/account/login" title="Click to login">Login</a>'
  }
  return accountHeader
}

Util.buildAccountManagementView = async function (data) {
  let manageAccount
  if (data) {
    manageAccount = '<div class="account-management">'
    manageAccount += '<h2>Welcome ' + data.account_firstname + '</h2>'
    manageAccount += '<a href="/account/update-user" title="Click to update account">'
    manageAccount += '<h3>Update Account</h3>'
    manageAccount += '</a>'
    if (data.account_type === "Employee" || data.account_type === "Admin") {
      manageAccount += '<a href="/inv/management" title="Click to manage inventory">'
      manageAccount += '<h3>Manage Inventory</h3>'
      manageAccount += '</a>'
    }
    if (data.account_type === "Admin") {
      manageAccount += '<a href="/inv/approval" title="Click to approve new inventory/classifications">'
      manageAccount += '<h3>Approve new inventory/classifications</h3>'
      manageAccount += '</a>'
    }
    manageAccount += '</div>'
  }
  return manageAccount
}

Util.buildInventoryApprovalView = async function (req, res) {
  let data = await invModel.getNeedsApproval()
  let needsApproval = '<div>' +
    '<p>The following inventory/classifications will not appear on the website until they have been approved by an administrator.</p>' +
    '<hr/>'
  if (res.locals.accountData && res.locals.accountData.account_type === "Admin") {
    if (data.invData) {
      needsApproval += '<h3><u>New Inventory</u></h3>'
      needsApproval += '<ul id="inv-display" class="grid">'
      data.invData.forEach(vehicle => {
        needsApproval += '<li>'
        needsApproval += '<img src="' + vehicle.inv_thumbnail +
          '" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model +
          ' on CSE Motors" />'
        needsApproval += '<div class="namePrice">'
        needsApproval += '<hr/>'
        needsApproval += '<h3>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h3>'
        needsApproval += '<span>$' +
          new Intl.NumberFormat('en-US').format(vehicle.inv_price) +
          '</span>'
        needsApproval += '</div>'
        needsApproval += '<span class="approval">' +
          '<form action="/inv/approve-inv/' +
          vehicle.inv_id +
          '" method="post">' +
          '<button type="submit">Approve</button>' +
          '</form>' +
          '<form action="/inv/delete-inv/' +
          vehicle.inv_id +
          '" method="post">' +
          '<button type="submit">Delete</button>' +
          '</form>' +
          '</span>'
        needsApproval += '</li>'
      })
      needsApproval += '</ul>'
    } else {
      needsApproval += '<h3 class="notice">No New Inventory</h3>'
    }
    needsApproval += '<hr/>'
    if(data.classData) {
      needsApproval += '<h3><u>New Classifications</u></h3>'
      needsApproval += '<div class="classification">'
      needsApproval += '<ul>'
      data.classData.forEach(classification => {
        needsApproval += '<li>'
        needsApproval += '<h3>'+classification.classification_name+'</h3>'
        needsApproval += '<span class="approval">' +
          '<form action="/inv/approve-class/' +
          classification.classification_id +
          '" method="post">' +
          '<button type="submit">Approve</button>' +
          '</form>' +
          '<form action="/inv/delete-class/' +
          classification.classification_id +
          '" method="post">' +
          '<button type="submit">Delete</button>' +
          '</form>' +
          '</span>'
        needsApproval += '</li>'
      })
      needsApproval += '</ul>'
      needsApproval += '</div>'
    }
  } else {
    needsApproval += '<h2>Please log in as an administrator to view this page.</h2>'
  }
  needsApproval += '</div>'
  return needsApproval
}

/* ***************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

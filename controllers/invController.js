const utilities = require("../utilities/")
const invModel = require("../models/inventory-model");
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  if (data.length) {
    const className = data[0].classification_name
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } else {
    res.render("inventory/classification", {
      title: "No vehicles",
      nav,
      grid
    })
  }
}

invCont.buildByInventoryId = async function (req, res) {
  const inventoryId = req.params.inventoryId
  const data = await invModel.getInventoryByInventoryId(inventoryId)
  const display = await utilities.displayInventory(data)
  let nav = await utilities.getNav()
  const inventoryName = data.inv_make + ' ' + data.inv_model
  res.render("inventory/vehicle", {
    title: inventoryName,
    nav,
    display,
  })
}

invCont.buildManagementView = async function (req, res) {
  let nav = await utilities.getNav()
  const accountType = res.locals.accountData.account_type
  if ((accountType === "Employee") || (accountType === "Admin")) {
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: 'Inventory Management',
      nav,
      classificationList,
      errors: null
    })
  } else {
    req.flash("notice", "Please log in with an employee or admin account to access that page.")
    res.render("account/login", {
      title: 'Login',
      nav,
      errors: null
    })
  }
}

invCont.addClassView = async function (req, res) {
  let nav = await utilities.getNav()
  const accountType = res.locals.accountData.account_type
  if ((accountType === "Employee") || (accountType === "Admin")) {
    res.render("inventory/add-classification", {
      title: 'Add Classification',
      nav,
      errors: null,
    })
  } else {
    const message = "Please log in with an employee or admin account to access that page."
    res.render("account/login", {
      title: 'Login',
      nav,
      message,
      errors: null
    })
  }
}

/* ****************************************
*  Add New Classification
* *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const regResult = await invModel.addClassification(
    classification_name
  )

  if (regResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification has been submitted to management for approval.`
    )
    const classificationList = await utilities.buildClassificationList()
    res.status(201).render("inventory/management", {
      title: "Manage Inventory",
      nav,
      classificationList
    })
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
    })
  }
}

invCont.addInventoryView = async function (req, res) {
  let nav = await utilities.getNav()
  const accountType = res.locals.accountData.account_type
  if ((accountType === "Employee") || (accountType === "Admin")) {
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    })
  } else {
    const message = "Please log in with an employee or admin account to access that page."
    res.render("account/login", {
      title: 'Login',
      nav,
      message,
      errors: null
    })
  }
}

invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const regResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (regResult) {
    req.flash (
      "notice",
      `The ${inv_color} ${inv_year} ${inv_make} ${inv_model} has been submitted to management for approval.`
    )
    const classificationList = await utilities.buildClassificationList()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList
    })
  } else {
    req.flash ("notice", "Something went wrong. Please try again")
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classificationList
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res) {
  const inventoryId = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inventoryId)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_color} ${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/edit-inventory", {
    title: "Update " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body
  const classificationList = await utilities.buildClassificationList(classification_id)

  const regResult = await invModel.updateInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
  )

  if (regResult) {
    req.flash (
      "notice",
      `The ${inv_color} ${inv_year} ${inv_make} ${inv_model} was successfully updated.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList
    })
  } else {
    req.flash ("notice", "Something went wrong. Please try again")
    const itemName = `${inv_color} ${inv_year} ${inv_make} ${inv_model}`
    res.status(501).render("inventory/edit-inventory", {
      title: "Update " + itemName,
      nav,
      classificationList,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res) {
  const inventoryId = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inventoryId)
  res.render("inventory/delete-confirm", {
    title: "Delete Confirmation",
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

invCont.deleteInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const  {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price
  } = req.body
  const classificationList = await utilities.buildClassificationList()

  const regResult = await invModel.deleteInventory(inv_id)

  if (regResult) {
    req.flash (
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} was successfully removed.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList
    })
  } else {
    req.flash ("notice", "Something went wrong. Please try again")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete Confirmation",
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    })
  }
}

invCont.buildInventoryApprovalView = async function (req, res) {
  const needsApproval = await utilities.buildInventoryApprovalView(req, res)
  let nav = await utilities.getNav()
  res.render("inventory/approval", {
    title: "Management Approval",
    nav,
    needsApproval,
    errors: null
  })
}

invCont.approveInventory = async function (req, res) {
  const inventoryId = parseInt(req.params.inventoryId)
  const regResult = await invModel.approveInventory(inventoryId)
  if (regResult) {
    req.flash("notice", "Inventory approved successfully.")
    res.redirect("/inv/approval")
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.redirect("/inv/approval")
  }
}

invCont.deleteUnapprovedInv = async function (req, res) {
  const inventoryId = parseInt(req.params.inventoryId)
  const regResult = await invModel.deleteInventory(inventoryId)
  if (regResult) {
    req.flash("notice", "Inventory successfully removed.")
    res.redirect("/inv/approval")
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.redirect("/inv/approval")
  }
}

invCont.approveClassification = async function (req, res) {
  const classId = parseInt(req.params.classId)
  const regResult = await invModel.approveClassification(classId)
  if (regResult) {
    req.flash("notice", "Classification approved successfully.")
    res.redirect("/inv/approval")
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.redirect("/inv/approval")
  }
}

invCont.deleteUnapprovedClass = async function (req, res) {
  const classification_id = parseInt(req.params.classificationId)
  const regResult = await invModel.deleteClassification(classification_id)
  if (regResult) {
    req.flash("notice", "Classification successfully removed.")
    res.redirect("/inv/approval")
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.redirect("/inv/approval")
  }
}

module.exports = invCont

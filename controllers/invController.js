const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  if (data.length) {
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } else {
    res.render("./inventory/classification", {
      title: "No vehicles",
      nav,
      grid
    })
  }
}

invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryByInventoryId(inventory_id)
  const display = await utilities.displayInventory(data)
  let nav = await utilities.getNav()
  const inventoryName = data.inv_make + ' ' + data.inv_model
  res.render("./inventory/vehicle", {
    title: inventoryName,
    nav,
    display,
  })
}

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: 'Inventory Management',
    nav,
    classificationList
  })
}

invCont.addClassView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: 'Add Classification',
    nav,
  })
}

/* ****************************************
*  Add New Classification
* *************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const regResult = await invModel.addClassification(
    classification_name
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you've added ${classification_name} to the list of classifications.`
    )
    res.status(201).render("inventory/management", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Something went wrong. Please try again.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
    })
  }
}

invCont.addInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
  })
}

invCont.addInventory = async function (req, res, next) {
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
      `A ${inv_color} ${inv_year} ${inv_make} ${inv_model} has been added to the inventory.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav
    })
  } else {
    req.flash ("notice", "Something went wrong. Please try again")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
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
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)
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

invCont.updateInventory = async function (req, res, next) {
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
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)
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

invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const  {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
  } = req.body
  const classificationList = await utilities.buildClassificationList(classification_id)

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

module.exports = invCont

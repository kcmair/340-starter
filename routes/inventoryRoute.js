// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const regValidate = require("../utilities/validation")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

// Route to inventory management view
router.get("/management", utilities.handleErrors(invController.buildManagementView))

// Route to add classification view
router.get("/add-classification", utilities.handleErrors(invController.addClassView))

// Route to create a new classification
router.post(
  "/add-classification",
  regValidate.classificationRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// Route to add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.addInventoryView))

// Route to add new inventory
router.post(
  "/add-inventory",
  regValidate.inventoryRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to get inventory by classification id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to edit inventory view
router.get("/edit/:inventoryId", (invController.editInventoryView))

// Route to update inventory data
router.post("/update/",
  regValidate.inventoryRules(),
  regValidate.checkUpdateData,
  invController.updateInventory)


module.exports = router

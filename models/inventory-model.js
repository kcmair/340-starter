const pool = require("../database/")
const pool = require("../database");
const console = require("node:console");
const pool = require("../database");
const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
  }
}

/* **************************
 *  Get inventory item and inventory_name by inventory_id
 * ************************* */
async function getInventoryByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.inv_id = $1`,
      [inventory_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryByInventoryId error: " + error)
  }
}

/* *****************************
*   Add new classification
* *************************** */
async function addClassification (classification_name){
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function addInventory (
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
){
  try {
    const sql = "INSERT INTO public.inventory (inv_make, inv_model,inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '/images/vehicles/no-image.png', '/images/vehicles/no-image-tn.png') RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id])
  } catch (error) {
    return error.message
  }
}

async function updateInventory (
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
){
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    return await pool.query(sql, [
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
    ])
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1'
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error("Delete error: ", error)
    return error
  }
}

async function deleteClassification(classification_id) {
  try{
    const sql = 'DELETE FROM public.classification WHERE classification_id = $1'
    return await pool.query(sql, [classification_id])
  } catch (error) {
    console.error("Delete Classification error: ", error)
    return error
  }
}

async function getNeedsApproval() {
  try {
    let sql = 'SELECT * FROM public.inventory WHERE inv_approval = false';
    const invData = await pool.query(sql);

    sql = 'SELECT * FROM public.classification WHERE classification_approval = false';
    const classData = await pool.query(sql);

    return {
      invData: invData.rows,
      classData: classData.rows
    };
  } catch (error){
    console.error("getNeedsApproval error: ", error);
    return error;
  }
}

async function approveInventory(inv_id) {
  try {
    const sql = 'UPDATE public.inventory SET inv_approval = true WHERE inv_id = $1'
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error("Inventory Approval error: ", error)
  }
}

async function approveClassification(classification_id) {
  try {
    const sql = 'UPDATE public.classification SET classification_approval = true WHERE classification_id = $1'
    return await pool.query(sql, [classification_id])
  } catch (error) {
    console.error("Classification Approval error: ", error)
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInventoryId,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory,
  approveInventory,
  approveClassification,
  getNeedsApproval,
  deleteClassification
}

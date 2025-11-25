const express = require("express");
const router = express.Router();

// Import controller
const {
  addContact,
  getContacts,
  editContact,
  deleteContact,
} = require("../controllers/contactController");

// Import JWT middleware
const isAuthenticated  = require("../middlewares/isAuthenticated");

// ----------------------------
// Contact Routes
// ----------------------------

// Add new contact
router.post("/", isAuthenticated, addContact);

// Get all contacts for logged-in user
router.get("/", isAuthenticated, getContacts);

// Edit contact by ID
router.put("/:contactId", isAuthenticated, editContact);

// Delete contact by ID
router.delete("/:contactId", isAuthenticated, deleteContact);

module.exports = router;

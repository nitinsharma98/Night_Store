const Contact = require("../models/Contact");

// ----------------------------
// Add a new contact
// ----------------------------
async function addContact(req, res) {
  try {
    const userId = req.user.id; // from isAuthenticated middleware
    const { name, phone, note } = req.body;

    const newContact = await Contact.create({
      owner: userId,
      name,
      phone,
      note,
    });

    res.status(201).json({ success: true, contact: newContact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------------------
// Get all contacts for the user
// ----------------------------
async function getContacts(req, res) {
  try {
    const userId = req.user.id;

    const contacts = await Contact.find({ owner: userId }).sort({ createdAt: -1 });

    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------------------
// Edit a contact
// ----------------------------
async function editContact(req, res) {
  try {
    const userId = req.user.id;
    const { contactId } = req.params;
    const { name, phone, note } = req.body;

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: userId }, // ensure user owns this contact
      { name, phone, note },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ success: true, contact: updatedContact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------------------
// Delete a contact
// ----------------------------
async function deleteContact(req, res) {
  try {
    const userId = req.user.id;
    const { contactId } = req.params;

    const deleted = await Contact.findOneAndDelete({ _id: contactId, owner: userId });

    if (!deleted) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ success: true, message: "Contact deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ----------------------------
// Export all functions
// ----------------------------
module.exports = {
  addContact,
  getContacts,
  editContact,
  deleteContact,
};

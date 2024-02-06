const express = require("express");
const router = express.Router();
const contactsModel = require("../../models/contacts");
const contactValidation = require("../../validation/joi");

// GET /api/contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsModel.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:id
router.get("/:id", async (req, res, next) => {
  try {
    const contact = await contactsModel.getContactById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Not found" });
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:id
router.put("/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  const contactId = req.params.id;

  // Validation
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updatedContact = {
    name,
    email,
    phone,
  };

  try {
    const result = await contactsModel.updateContact(contactId, updatedContact);
    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Generate random Id
const { v4: uuidv4 } = require('uuid');

function generateRandomId() {
  return uuidv4().replace(/-/g, "").substr(0, 21);
}

// POST /api/contacts
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;

  // Validation
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newContact = {
    id: generateRandomId(),
    name,
    email,
    phone,
  };

  try {
    await contactsModel.addContact(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/contacts/:id
router.delete("/:id", async (req, res) => {
  const deletedContact = await contactsModel.removeContact(req.params.id);
  if (!deletedContact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json({ message: "contact deleted" });
});

module.exports = router;

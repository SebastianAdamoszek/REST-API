const express = require("express");
const router = express.Router();
const contactValidation = require("../../validation/joi");
const contactsModel = require("../../models/contacts");
const Contacts = require("../../mongodb/contactsSchema");

// GET /api/contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await contactsModel.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error:", error);
    if (error.message === "Db_err_connection") {
      return res.status(500).json({ message: "Database connection error" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// GET /api/contacts/:contactId
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await contactsModel.getContactById(req.params.contactId);
    if (!contact) return res.status(404).json({ message: "Not found" });
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId
router.put("/:contactId", async (req, res) => {
  const { name, email, phone, favorite } = req.body;
  const contactId = req.params.contactId;

  // Validation
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updatedContact = {
    name,
    email,
    phone,
    favorite,
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

// POST /api/contacts
router.post("/", async (req, res) => {
  const { name, email, phone, favorite } = req.body;

  // Validation
  const { error } = contactValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newContact = {
    name,
    email,
    phone,
    favorite,
  };

  try {
    await contactsModel.addContact(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/contacts/:contactId
router.delete("/:contactId", async (req, res) => {
  try {
    const deletedContact = await contactsModel.removeContact(req.params.contactId);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PATCH /api/contacts/:contactId/favorite
router.patch("/:contactId/favorite", async (req, res) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  try {
    // Validation
    if (typeof favorite !== "boolean") {
      return res.status(400).json({ message: "Favorite field must be a boolean" });
    }

    // Update contact's favorite field
    const updatedContact = await Contacts.findByIdAndUpdate(contactId, { favorite }, { new: true });

    // Check if contact was updated
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

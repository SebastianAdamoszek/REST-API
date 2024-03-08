const express = require("express");
const router = express.Router();
const { userSchema } = require("../../validation/joi");
const contactsModel = require("../../models/contactsModels");
const Contacts = require("../../mongodb/contactsSchema");
const verifyToken = require("../../middlewares/auth");

// GET /api/contacts
router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const contacts = await contactsModel.listContacts(req.user._id);
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
router.get("/:contactId", verifyToken, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const ownerId = req.user._id;
    const contact = await contactsModel.getContactById(
      req.params.contactId,
      ownerId
    );
    if (!contact) return res.status(404).json({ message: "Not found" });
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId
router.put("/:contactId", verifyToken, async (req, res) => {
  const { name, email, phone, favorite } = req.body;
  const contactId = req.params.contactId;
  const ownerId = req.user._id;
  // Validation
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updatedContact = {
    name,
    email,
    phone,
    favorite,
    owner: ownerId,
  };

  try {
    const result = await contactsModel.updateContact(
      contactId,
      updatedContact,
      ownerId
    );
    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/contacts
router.post("/", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, phone, favorite } = req.body;
    const ownerId = req.user._id;

    // Validation
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const newContact = {
      name,
      email,
      phone,
      favorite,
      ownerId
    };

    // Dodanie kontaktu do bazy danych
    await contactsModel.addContact(newContact, ownerId);

    res.status(201).json({ newContact});
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/contacts/:contactId
router.delete("/:contactId", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user._id;
    const deletedContact = await contactsModel.removeContact(
      req.params.contactId,
      ownerId
    );
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/:contactId/favorite", verifyToken, async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  try {
    // Validation
    if (typeof favorite !== "boolean") {
      return res
        .status(400)
        .json({ message: "Favorite field must be a boolean" });
    }

    // Update contact's favorite field
    const updatedContact = await Contacts.findOneAndUpdate(
      { _id: contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );

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

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const contactValidation = require("../../validation/joi");
const contactsModel = require("../../models/contacts");

// GET /api/contacts
router.get("/", async (res, next) => {
  try {
    const contacts = await contactsModel.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:contactId
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await contactsModel.getContactById(req.params.contactId);
    console.log(req.params.contactId);
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
  const deletedContact = await contactsModel.removeContact(
    req.params.contactId
  );
  if (!deletedContact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json({ message: "contact deleted" });
});

// Funkcja aktualizująca status kontaktu w bazie danych
async function updateStatusContact(contactId, favorite) {
  try {
    console.log("Updating contact with ID:", contactId);
    console.log("New favorite value:", favorite);
    const updatedContact = await mongoose
      .model("Contact")
      .findByIdAndUpdate(contactId, { favorite: favorite }, { new: true });
    console.log("Updated contact:", updatedContact);
    return updatedContact;
  } catch (error) {
    console.error("Error updating contact:", error.message);
    return null;
  }
}



// PATCH /api/contacts/:contactId/favorite
router.patch("/:contactId/favorite", async (req, res) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  console.log("Received body:", req.body);

  try {
    // Sprawdzenie, czy body zawiera wymagane pole favorite
    if (typeof favorite === 'undefined') {
      return res.status(400).json({ message: "missing field favorite" });
    }

    // Wywołanie funkcji updateStatusContact z aktualizacją pola favorite
    const updatedContact = await updateStatusContact(contactId, favorite);

    // Obsługa przypadku, gdy kontakt został zaktualizowany
    if (updatedContact) {
      return res.status(200).json(updatedContact);
    } else {
      // Obsługa przypadku, gdy kontakt nie został znaleziony
      return res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

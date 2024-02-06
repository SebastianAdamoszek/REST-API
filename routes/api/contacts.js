const express = require("express");
const router = express.Router();
const contactsModel = require("../../models/contacts");

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

const { v4: uuidv4 } = require("uuid");

function generateUniqueId() {
  return uuidv4().replace(/-/g, "").substr(0, 21);
}

// POST /api/contacts
router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "missing required name, email, or phone field" });
    }

    const newContact = {
      id: generateUniqueId(),
      name,
      email,
      phone,
    };

    await contactsModel.addContact(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
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

// PUT /api/contacts/:id
router.put("/:id", async (req, res, next) => {
  try {
    const contactId = req.params.id;
    const body = req.body;

    if (!body) {
      return res.status(400).json({ message: "missing fields" });
    }

    const updatedContact = await contactsModel.updateContact(contactId, body);
    console.log("Updated contact:", updatedContact);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

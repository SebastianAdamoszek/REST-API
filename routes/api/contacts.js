const express = require('express');
const router = express.Router();
const contactsModel = require('../../models/contacts');

// GET /api/contacts
router.get('/', async (req, res) => {
  const contacts = await contactsModel.listContacts();
  res.json(contacts);
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  const contact = await contactsModel.getContactById(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Not found' });
  res.json(contact);
});

const { v4: uuidv4 } = require("uuid");

function generateUniqueId() {
  return uuidv4().replace(/-/g, "").substr(0, 21);
}

// POST /api/contacts
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'missing required name, email, or phone field' });
  }

  const newContact = {
    id:generateUniqueId(),
    name,
    email,
    phone,
  };

  await contactsModel.addContact(newContact);
  res.status(201).json(newContact);
});


// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  const deletedContact = await contactsModel.removeContact(req.params.id);
  if (!deletedContact) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({ message: 'contact deleted' });
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res) => {
  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    return res.status(400).json({ message: 'missing fields' });
  }

  const updatedContact = await contactsModel.updateContact(contactId, { name, email, phone });
  if (!updatedContact) {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json(updatedContact);
});

module.exports = router;

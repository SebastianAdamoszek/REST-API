const fs = require('fs/promises');

const listContacts = async () => {
  try {
    const contactsData = await fs.readFile('./models/contacts.json', 'utf-8');
    return JSON.parse(contactsData);
  } catch (error) {
    console.error('Error reading contacts file:', error.message);
    return [];
  }
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find(c => c.id === contactId);
};


const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const indexToRemove = contacts.findIndex(c => c.id === parseInt(contactId));

  if (indexToRemove === -1) {
    return null;
  }

  const deletedContact = contacts.splice(indexToRemove, 1)[0];
  await writeContactsToFile(contacts);
  return deletedContact;
};

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = { id: contacts.length + 1, ...body };
  contacts.push(newContact);
  await writeContactsToFile(contacts);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const existingContact = contacts.find(c => c.id === parseInt(contactId));

  if (!existingContact) {
    return null;
  }

  const updatedContact = { ...existingContact, ...body };
  const updatedContacts = contacts.map(c => (c.id === parseInt(contactId) ? updatedContact : c));
  await writeContactsToFile(updatedContacts);
  return updatedContact;
};

const writeContactsToFile = async (data) => {
  try {
    await fs.writeFile('./models/contacts.json', JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing contacts file:', error.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

const Contact = require("../mongodb/contactsSchema"); // Importuj model danych z Mongoose

const listContacts = async () => {
  try {
    const contacts = await Contact.find(); // Pobierz wszystkie kontakty z bazy danych MongoDB
    return contacts; // Zwróć kontakty
  } catch (error) {
    console.error("Error reading contacts:", error.message);
    return [];
  }
};

const getContactById = async (contactId) => {
  try {
    return await Contact.findById(contactId); // Pobierz kontakt o podanym ID z bazy danych MongoDB
  } catch (error) {
    console.error("Error reading contact:", error.message);
    return null;
  }
};

const removeContact = async (contactId) => {
  try {
    return await Contact.findByIdAndDelete(contactId); // Usuń kontakt o podanym ID z bazy danych MongoDB
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    return null;
  }
};

const addContact = async (body) => {
  try {
    return await Contact.create(body); // Dodaj nowy kontakt do bazy danych MongoDB
  } catch (error) {
    console.error("Error creating contact:", error.message);
    return null;
  }
};

const updateContact = async (contactId, body) => {
  try {
    return await Contact.findByIdAndUpdate(contactId, body, { new: true }); // Zaktualizuj kontakt o podanym ID w bazie danych MongoDB
  } catch (error) {
    console.error("Error updating contact:", error.message);
    return null;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

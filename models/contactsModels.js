const Contact = require("../mongodb/contactsSchema"); // Importuj model danych z Mongoose

const listContacts = async () => {
  try {
    const contacts = await Contact.find(); // Pobierz wszystkie kontakty z bazy danych MongoDB
    return contacts; // Zwróć kontakty
  } catch (error) {
    console.error("Error reading contacts:", error.message);
    throw new Error("Db_err_connection");
  }
};

const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId); // Pobierz kontakt o podanym ID z bazy danych MongoDB
    if (!contact) throw new Error("Contact not found");
    return contact;
  } catch (error) {
    console.error("Error reading contact:", error.message);
    throw new Error("Db_err_reading_contact");
  }
};

const removeContact = async (contactId) => {
  try {
    const contact = await Contact.findByIdAndDelete(contactId); // Usuń kontakt o podanym ID z bazy danych MongoDB
    if (!contact) throw new Error("Contact not found");
    return contact;
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    throw new Error("Db_err_deleting_contact");
  }
};

const addContact = async (body) => {
  try {
    return await Contact.create(body); // Dodaj nowy kontakt do bazy danych MongoDB
  } catch (error) {
    console.error("Error creating contact:", error.message);
    throw new Error("Db_err_creating_contact");
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    }); // Zaktualizuj kontakt o podanym ID w bazie danych MongoDB
    if (!contact) throw new Error("Contact not found");
    return contact;
  } catch (error) {
    console.error("Error updating contact:", error.message);
    throw new Error("Db_err_updating_contact");
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

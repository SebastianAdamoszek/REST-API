const Contact = require("../mongodb/contactsSchema"); // Importuj model danych z Mongoose

const listContacts = async (ownerId) => {
  try {
    const contacts = await Contact.find({ owner: ownerId }); // Pobierz wszystkie kontakty z bazy danych MongoDB
    return contacts; // Zwróć kontakty
  } catch (error) {
    console.error("Error reading contacts:", error.message);
    throw new Error("Db_err_connection");
  }
};

const getContactById = async (contactId, ownerId) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, owner: ownerId }); // Pobierz kontakt o podanym ID z bazy danych MongoDB
    if (!contact) throw new Error("Contact not found");
    return contact;
  } catch (error) {
    console.error("Error reading contact:", error.message);
    throw new Error("Db_err_reading_contact");
  }
};

const removeContact = async (contactId, ownerId) => {
  try {
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) throw new Error("Contact not found");
    return contact;
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    throw new Error("Db_err_deleting_contact");
  }
};


const addContact = async (body, ownerId) => {
  try {
    const contact = await Contact.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      favorite: body.favorite,
      owner: ownerId,
    }); // Dodaj nowy kontakt do bazy danych MongoDB
    return contact;
  } catch (error) {
    console.error("Error creating contact:", error.message);
    throw new Error("Db_err_creating_contact");
  }
};

const updateContact = async (contactId, body, ownerId) => {
  try {
    const contact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
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

const mongoose = require("mongoose");

// Definiowanie schematu kontaktu
const  contactSchema  = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: String,
  phone: String,
  favorite: {
    type: Boolean,
    default: false,
  },
});

// Tworzenie kontaktu  wg schematu
const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
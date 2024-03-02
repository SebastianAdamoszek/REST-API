const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Definiowanie schematu kontaktu
const contactSchema = new mongoose.Schema(
  {
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

// Tworzenie kontaktu  wg schematu
const Contact = mongoose.model("contacts", contactSchema);
module.exports = Contact;

const mongoose = require("mongoose");

// Definiowanie schematu kontaktu
const contactSchema = new mongoose.Schema({
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

// Adres URI bazy danych MongoDB
const uri = "mongodb://127.0.0.1:27017";

// Połączenie z bazą danych MongoDB przy użyciu Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Obsługa połączenia z bazą danych
const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Database connection error:", error);
  process.exit(1); // Zakończenie procesu z kodem błędu 1
});
db.once("open", () => {
  console.log("Database connection successful.");

  // Pobieranie wszystkich kontaktów
  Contact.find({}, (err, contacts) => {
    if (err) return console.error("Error retrieving contacts:", err);
    console.log("Lista kontaktów:", contacts);
  });
});

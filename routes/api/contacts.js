const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");



// PATCH /api/contacts/:contactId/favorite
router.patch("/:contactId/favorite", async (req, res) => {
  const contactId = req.params.contactId;
  const body = req.body;

  try {
    // Sprawdzenie, czy body zawiera wymagane pole favorite
    if (!body || !body.favorite) {
      return res.status(400).json({ message: "Missing field favorite" });
    }

    // Wywołanie funkcji updateStatusContact z aktualizacją pola favorite
    const updatedContact = await updateStatusContact(contactId, body.favorite);

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

// Funkcja aktualizująca status kontaktu w bazie danych
async function updateStatusContact(contactId, favorite) {
  // Znajdź kontakt o podanym ID i zaktualizuj pole favorite
  const updatedContact = await mongoose.model("Contact").findByIdAndUpdate(
    contactId,
    { favorite: favorite },
    { new: true }
  );
  return updatedContact;
}

module.exports = router;

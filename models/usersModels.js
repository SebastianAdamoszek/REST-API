const { User } = require("./schema/userSchema");

const signup = async (userData, ownerId) => {
  try {
    const newUser = new User(userData);
    if (ownerId) {
      // Sprawdź, czy ownerId nie jest nullem
      newUser.owner = ownerId; // Ustaw ownerId jako wartość pola owner
    }
    newUser.setPassword(userData.password);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.log("Adding user error:", error.message);
    throw error;
  }
};

const login = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.log("Finding user error:", error.message);
    throw error;
  }
};

module.exports = {
  signup,
  login,
};

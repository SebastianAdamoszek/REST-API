const { User } = require("./schema/userSchema");
const { sendVerifyEmail } = require("../middlewares/emailVerification");
const { v4: uuidv4 } = require("uuid");

const signup = async (userData, ownerId) => {
  try {
    const newUser = new User(userData);

    if (ownerId) {
      newUser.owner = ownerId;
    }

    const verificationToken = uuidv4();
    newUser.verificationToken = verificationToken;

    await newUser.setPassword(userData.password);
    await newUser.save();

    await sendVerifyEmail( newUser.email, verificationToken );

    return {
      email: newUser.email,
      subscription: newUser.subscription,
    };
  } catch (error) {
    console.log("Error during signup:", error);
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

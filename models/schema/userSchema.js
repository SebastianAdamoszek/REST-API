const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bCrypt = require("bcryptjs");
const gravatar = require("gravatar");


const user = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verification token is required"],
  },
});

user.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

user.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

user.pre("save", async function (next) {
  try {
    if (!this.avatarURL) {
      const avatar = gravatar.url(this.email, {
        s: "200",
        r: "pg",
        d: "identicon",
      });
      this.avatarURL = avatar;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("user", user);

module.exports = { User };

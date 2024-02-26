const express = require("express");
const { User } = require("../../models/schema/userSchema");
const verifyToken = require("../../middlewares/auth");
const router = express.Router();
const { signup, login } = require("../../models/usersModels");
const { signupAndLoginSchema } = require("../../validation/joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, subscription } = req.body;

    const { error } = signupAndLoginSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const ownerId = req.user ? req.user._id : null;

    const newUser = await signup({
      email,
      password,
      subscription,
      owner: ownerId,
    });

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    console.log("Error during signup:", error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userToLogin = signupAndLoginSchema.validate({ email, password });
    if (userToLogin.error) {
      return res
        .status(400)
        .json({ message: userToLogin.error.details[0].message });
    }
    const user = await login(email, password);

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordValid = user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    return res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", verifyToken, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = null;
    await user.save();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/current", verifyToken, async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;

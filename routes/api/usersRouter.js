const express = require("express");
const { User } = require("../../models/schema/userSchema");
const accessToken = require("../../middlewares/auth");
const router = express.Router();
const { signup, login } = require("../../models/usersModels");
const { signupAndLoginSchema, emailSchema } = require("../../validation/joi");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jimp = require("jimp");
require("dotenv").config();
const sendVerifyEmail = require("../../middlewares/emailVerification");

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

    const newUser = await signup({
      email,
      password,
      subscription,
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

router.get("/logout", accessToken, async (req, res, next) => {
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

router.get("/current", accessToken, async (req, res, next) => {
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

const upload = multer({
  dest: path.join(__dirname, "../../tmp"),
});

router.patch(
  "/avatars",
  accessToken,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const avatar = req.file;
      if (!avatar) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const image = await jimp.read(avatar.path);
      await image.resize(250, 250);
      await image.writeAsync(avatar.path);

      const targetPath = path.join(
        __dirname,
        "../../public/avatars",
        `${userId}${path.extname(avatar.originalname)}`
      );
      fs.renameSync(avatar.path, targetPath);

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatarURL: `/avatars/${path.basename(targetPath)}` },
        { new: true }
      );

      res.status(200).json({ avatarURL: updatedUser.avatarURL });
    } catch (error) {
      console.error("Error updating user avatar:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
});
router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    const correctEmail = emailSchema.validate({ email });
    if (correctEmail.error) {
      return res
        .status(400)
        .json({ message: correctEmail.error.details[0].message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "missing required field email" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    await sendVerifyEmail({
      email,
      verificationToken: user.verificationToken,
    });

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

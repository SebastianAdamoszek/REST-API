const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendVerifyEmail(email, verificationToken) {
  try {
    // Utwórz transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Ustaw na true, jeśli używasz SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
    });

    // Treść wiadomości e-mail
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: "Please verify your email address",
      html: `<h2>${email}</h2>
        <p>Click here <a href="https://users/verify/${verificationToken}" target="_blank">here</a> to verify your email address.</p>
      `,
    };

    // Wysyłanie wiadomości email
    await transporter.sendMail(mailOptions);
    console.log("The verification email has been sent.");
  } catch (error) {
    console.error("An error occurred while sending the email:", error);
    throw new Error("An error occurred while sending the email");
  }
}

module.exports = {
  sendVerifyEmail,
};

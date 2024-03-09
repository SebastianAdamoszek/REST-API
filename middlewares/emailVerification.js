// Use Mailgun

const mailgun = require("mailgun-js");
require("dotenv").config();

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

async function sendVerifyEmail( email, verificationToken) {
  try {
    const data = {
      from: process.env.MAILGUN_EMAIL_USERNAME,
      to: email,
      subject: "Please verify your email address",
      html: `<h2>${email}</h2>
        <p>Click <a href="https://yourdomain.com/users/verify/${verificationToken}" target="_blank">here</a> to verify your email address.</p>
        <p>Copy the link <span style="color: red;">/users/verify/${verificationToken}</span>, Use the GET method in Postman to verify your email address.</p>
      `,
    };

    await mg.messages().send(data);
    console.log("The verification email has been sent.");
  } catch (error) {
    console.error("An error occurred while sending the email:", error);
    throw new Error("An error occurred while sending the email");
  }
}

module.exports = {
  sendVerifyEmail,
};

// Use nademailer
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// async function sendVerifyEmail(email, verificationToken) {
//   try {
//     // Utwórz transporter
//     const transporter = nodemailer.createTransport({
//       host: "smtp.poczta.onet.pl",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//       debug: true,
//     });

//     // Treść wiadomości e-mail
//     const mailOptions = {
//       from: process.env.EMAIL_USERNAME,
//       to: email,
//       subject: "Please verify your email address",
//       html: `<h2>${email}</h2>
//         <p>Click <a href="https://users/verify/${verificationToken}" target="_blank">here</a> to verify your email address.</p>
//         <p>Copy the link <span style="color: red;">/users/verify/${verificationToken}</span>, Use the GET method in Postman to verify your email address.</p>
//       `,
//     };

//     // Wysyłanie wiadomości email
//     await transporter.sendMail(mailOptions);
//     console.log("The verification email has been sent.");
//   } catch (error) {
//     console.error("An error occurred while sending the email:", error);
//     throw new Error("An error occurred while sending the email");
//   }
// }

// module.exports = {
//   sendVerifyEmail,
// };

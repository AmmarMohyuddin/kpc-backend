const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mfw.babtain.com",
  port: 587,
  secure: false,
  auth: {
    user: "noreply.oci@babtain.com",
    pass: "$$SuperOci@007",
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: "noreply.oci@babtain.com",
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", to);
    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

module.exports = sendMail;

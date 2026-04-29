const nodemailer = require("nodemailer");
const Logger = require("../logger/logger");



const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // 1. Create transporter
    // Note: In a production environment, use a service like SendGrid, AWS SES, or GMail.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // 2. Define mail options
    const mailOptions = {
      from: `"Siasa Hub" <${process.env.SMTP_USER || "noreply@siasahub.co.ke"}>`,
      to,
      subject,
      text,
      html,
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    Logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    Logger.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };

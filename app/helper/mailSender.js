const nodemailer = require('nodemailer');

/**
 * Sends an email with the given options.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Text content of the email.
 * @returns {Promise} - Resolves if email is sent successfully, rejects otherwise.
 */
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendEmail,
};

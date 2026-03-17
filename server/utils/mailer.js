const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server .env");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
};

const sendOtpEmail = async (toEmail, otp) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const t = getTransporter();
  await t.sendMail({
    from,
    to: toEmail,
    subject: "Campus Crush OTP Verification",
    text: `Your Campus Crush OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,
    html: `<p>Your Campus Crush OTP is:</p><h2>${otp}</h2><p>This OTP expires in <b>10 minutes</b>.</p>`
  });
};

module.exports = { sendOtpEmail };


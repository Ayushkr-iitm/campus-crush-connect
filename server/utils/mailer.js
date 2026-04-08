const nodemailer = require("nodemailer");

let transporter;
let backupTransporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 8000);

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server .env");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs
  });

  return transporter;
};

const getBackupTransporter = () => {
  if (backupTransporter) return backupTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 8000);

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server .env");
  }

  // Gmail often works on one port while the other may timeout from cloud hosts.
  const defaultPort = Number(process.env.SMTP_PORT || 587);
  const backupPort = Number(process.env.SMTP_BACKUP_PORT || (defaultPort === 587 ? 465 : 587));

  backupTransporter = nodemailer.createTransport({
    host,
    port: backupPort,
    secure: backupPort === 465,
    auth: { user, pass },
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs
  });

  return backupTransporter;
};

const sendOtpEmail = async (toEmail, otp) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const maxAttempts = Number(process.env.SMTP_RETRY_ATTEMPTS || 2);
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const t = getTransporter();
      await t.sendMail({
        from,
        to: toEmail,
        subject: "Campus Crush OTP Verification",
        text: `Your Campus Crush OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,
        html: `<p>Your Campus Crush OTP is:</p><h2>${otp}</h2><p>This OTP expires in <b>10 minutes</b>.</p>`
      });
      return;
    } catch (err) {
      lastErr = err;
      // eslint-disable-next-line no-console
      console.error(`OTP email attempt ${attempt}/${maxAttempts} failed:`, err.message);
      try {
        const backup = getBackupTransporter();
        await backup.sendMail({
          from,
          to: toEmail,
          subject: "Campus Crush OTP Verification",
          text: `Your Campus Crush OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,
          html: `<p>Your Campus Crush OTP is:</p><h2>${otp}</h2><p>This OTP expires in <b>10 minutes</b>.</p>`
        });
        return;
      } catch (backupErr) {
        lastErr = backupErr;
        // eslint-disable-next-line no-console
        console.error(`OTP email backup attempt ${attempt}/${maxAttempts} failed:`, backupErr.message);
      }
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw lastErr || new Error("OTP email failed");
};

module.exports = { sendOtpEmail };


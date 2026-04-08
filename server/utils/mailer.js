const nodemailer = require("nodemailer");

let transporter;
let backupTransporter;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

const getMailPayload = (toEmail, otp) => ({
  to: toEmail,
  subject: "Campus Crush OTP Verification",
  text: `Your Campus Crush OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,
  html: `<p>Your Campus Crush OTP is:</p><h2>${otp}</h2><p>This OTP expires in <b>10 minutes</b>.</p>`
});

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
  const resendApiKey = process.env.RESEND_API_KEY;
  const preferResend = process.env.EMAIL_PROVIDER === "resend";
  let lastErr;

  if (preferResend || resendApiKey) {
    try {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY missing while EMAIL_PROVIDER=resend");
      }
      if (!from) {
        throw new Error("SMTP_FROM is required for RESEND sender identity");
      }
      const payload = getMailPayload(toEmail, otp);
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          html: payload.html
        })
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Resend API ${response.status}: ${body || "unknown error"}`);
      }
      return;
    } catch (err) {
      lastErr = err;
      // eslint-disable-next-line no-console
      console.error("OTP email via Resend failed:", err.message);
      if (preferResend) {
        throw lastErr;
      }
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const t = getTransporter();
      const payload = getMailPayload(toEmail, otp);
      await t.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      });
      return;
    } catch (err) {
      lastErr = err;
      // eslint-disable-next-line no-console
      console.error(`OTP email attempt ${attempt}/${maxAttempts} failed:`, err.message);
      try {
        const backup = getBackupTransporter();
        const payload = getMailPayload(toEmail, otp);
        await backup.sendMail({
          from,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html
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


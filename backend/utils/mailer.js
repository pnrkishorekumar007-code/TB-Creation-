const nodemailer = require('nodemailer');

// SMTP creds come from any provider (Gmail app password, Brevo, SendGrid, SES...),
// so no vendor SDK is needed. Without them the app stays in dev mode and the
// forgot-password route falls back to returning the reset link in the response.
let transporter = null;

const getTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Bounded waits: a dead SMTP host must not hang the API request (and on
      // Vercel, the whole serverless invocation) until the platform timeout.
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
};

const isMailConfigured = () => Boolean(getTransport());

const sendMail = async ({ to, subject, text, html }) => {
  const transport = getTransport();
  if (!transport) return false;
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return true;
};

module.exports = { sendMail, isMailConfigured };

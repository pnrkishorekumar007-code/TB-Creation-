const { Resend } = require('resend');

// Transactional email via Resend. When RESEND_API_KEY is unset the mailer is
// simply disabled: password-reset falls back to logging the link in non-prod
// (the previous behaviour) so local development keeps working with no account.
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM = process.env.RESEND_FROM_EMAIL || 'TB Creation <onboarding@resend.dev>';

const emailEnabled = () => !!resend;

const resetEmailHtml = (resetUrl) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0b0b0f">
    <h2 style="font-size:22px;margin:0 0 12px">Reset your TB Creation password</h2>
    <p style="line-height:1.5;color:#333">
      We received a request to reset your password. This link expires in 1 hour.
    </p>
    <p style="margin:24px 0">
      <a href="${resetUrl}" style="background:#e11d2a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">
        Reset password
      </a>
    </p>
    <p style="line-height:1.5;color:#666;font-size:13px">
      If the button doesn't work, paste this link into your browser:<br>
      <span style="word-break:break-all">${resetUrl}</span>
    </p>
    <p style="line-height:1.5;color:#999;font-size:12px">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>`;

const sendPasswordReset = async ({ to, resetUrl }) => {
  if (!resend) throw new Error('Email is not configured');
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your TB Creation password',
    html: resetEmailHtml(resetUrl),
  });
  if (error) throw new Error(error.message || 'Failed to send email');
};

module.exports = { emailEnabled, sendPasswordReset, FROM };

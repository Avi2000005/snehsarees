/**
 * brevo.service.ts — Brevo (Sendinblue) transactional email service for OTP delivery
 * Uses Brevo REST API directly via fetch to avoid CommonJS/ESM conflicts.
 */
import { ENV } from '../config/env';

type OtpPurpose = 'verify' | 'reset';

function getEmailTemplate(otp: string, purpose: OtpPurpose) {
  const isVerify = purpose === 'verify';
  const subject = isVerify
    ? '🔐 Verify your Sneh Sarees account'
    : '🔑 Reset your Sneh Sarees password';

  const heading = isVerify ? 'Verify Your Email' : 'Reset Your Password';
  const bodyText = isVerify
    ? 'Use the OTP below to verify your email and complete your registration.'
    : 'Use the OTP below to reset your password. If you did not request this, please ignore this email.';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#C4601A,#E8920E);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">Sneh Sarees</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Premium Handloom Silks &amp; Bridal Swatches</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#1A1A1A;font-size:20px;">${heading}</h2>
              <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.6;">${bodyText}</p>
              
              <!-- OTP Box -->
              <div style="background:#FAF6F0;border:2px dashed #C4601A;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your One-Time Password</p>
                <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#C4601A;font-family:monospace;">${otp}</div>
                <p style="margin:12px 0 0;color:#999;font-size:11px;">Valid for <strong>10 minutes</strong> · Do not share this with anyone</p>
              </div>
              
              <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
                If you didn't request this, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Sneh Sarees · All rights reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Send an OTP email via Brevo Transactional Email API
 * @param toEmail — recipient email
 * @param otp     — 6-digit OTP string
 * @param purpose — 'verify' for registration, 'reset' for forgot-password
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  purpose: OtpPurpose
): Promise<void> {
  if (!ENV.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured. Please add it to your .env file.');
  }

  const { subject, html } = getEmailTemplate(otp, purpose);

  const payload = {
    sender: {
      name: ENV.BREVO_SENDER_NAME,
      email: ENV.BREVO_SENDER_EMAIL,
    },
    to: [{ email: toEmail }],
    subject,
    htmlContent: html,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': ENV.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Brevo API error:', response.status, errorBody);
    throw new Error(`Failed to send OTP email: ${response.status} ${errorBody}`);
  }

  console.log(`[Brevo] OTP email sent to ${toEmail} (purpose: ${purpose})`);
}

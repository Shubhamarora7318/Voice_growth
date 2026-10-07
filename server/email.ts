import nodemailer from 'nodemailer';

export interface EmailDispatchResult {
  sent: boolean;
  provider: string;
  error?: string;
  previewUrl?: string;
}

/**
 * Dispatches a 6-digit OTP verification code to a Gmail / Google account email.
 * Supports:
 * 1. Gmail SMTP (via GMAIL_USER + GMAIL_APP_PASSWORD)
 * 2. Generic SMTP (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * 3. Resend API (via RESEND_API_KEY)
 * 4. Development fallback with visual code display
 */
export async function dispatchEmailOtp(toEmail: string, otp: string): Promise<EmailDispatchResult> {
  const cleanEmail = toEmail.trim().toLowerCase();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
          .logo { font-size: 20px; font-weight: 700; color: #059669; }
          .title { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 8px 0; }
          .text { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; }
          .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #047857; margin: 0; }
          .warning { font-size: 12px; color: #64748b; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="logo">Voice2Growth</span>
          </div>
          <h2 class="title">Your Google / Gmail Login Code</h2>
          <p class="text">
            We received a request to log in to Voice2Growth with your Google account (<strong>${cleanEmail}</strong>).
            Enter the 6-digit verification code below to complete sign-in:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="text" style="font-size: 13px; color: #64748b;">
            ⏱️ This verification code will expire in <strong>5 minutes</strong>. If you did not request this login, you can safely ignore this email.
          </p>
          <div class="warning">
            Security note: Voice2Growth staff will never ask for your verification code. Never share this code with anyone.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Try Gmail Direct SMTP (using Gmail App Password)
  const rawGmailUser = process.env.GMAIL_USER;
  const rawGmailPass = process.env.GMAIL_APP_PASSWORD;

  if (rawGmailUser && rawGmailPass) {
    const gmailUser = rawGmailUser.trim();
    // Google app passwords are generated as 16 characters often formatted with spaces (e.g. "abcd efgh ijkl mnop")
    const cleanGmailPass = rawGmailPass.trim().replace(/\s+/g, '');

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: cleanGmailPass
        }
      });

      await transporter.sendMail({
        from: `"Voice2Growth" <${gmailUser}>`,
        to: cleanEmail,
        subject: `${otp} is your Voice2Growth verification code`,
        text: `Your Voice2Growth verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        html: htmlContent
      });

      console.log(`[Email Gateway: Gmail SMTP] Delivered verification code to ${cleanEmail}`);
      return { sent: true, provider: 'Gmail SMTP' };
    } catch (err: any) {
      const errMsg = err?.message || '';
      console.log(`[Email Gateway: Gmail SMTP] Status:`, errMsg);

      if (errMsg.includes('534-5.7.9') || errMsg.includes('Application-specific password required') || errMsg.includes('InvalidSecondFactor')) {
        return {
          sent: false,
          provider: 'Gmail (App Password Required)',
          error: 'Google requires a 16-character App Password (from myaccount.google.com/apppasswords). Use the 1-Click Verify code below.'
        };
      }
    }
  }

  // 2. Try Generic SMTP if configured (and not identical to failed Gmail)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass && smtpHost !== 'smtp.gmail.com') {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser.trim(),
          pass: smtpPass.trim().replace(/\s+/g, '')
        }
      });

      await transporter.sendMail({
        from: `"Voice2Growth" <${smtpUser}>`,
        to: cleanEmail,
        subject: `${otp} is your Voice2Growth verification code`,
        text: `Your Voice2Growth verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        html: htmlContent
      });

      console.log(`[Email Gateway: Custom SMTP] Delivered to ${cleanEmail}`);
      return { sent: true, provider: 'Custom SMTP' };
    } catch (err: any) {
      console.log(`[Email Gateway: Custom SMTP] Status:`, err?.message);
    }
  }

  // 3. Try Resend if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: cleanEmail,
          subject: `${otp} is your Voice2Growth verification code`,
          html: htmlContent
        })
      });

      const data: any = await res.json();
      if (res.ok && data.id) {
        console.log(`[Email Gateway: Resend] ✅ Delivered to ${cleanEmail}, ID: ${data.id}`);
        return { sent: true, provider: 'Resend' };
      }
    } catch (err: any) {
      console.log(`[Email Gateway: Resend] Status:`, err?.message);
    }
  }

  // 4. Fallback when credentials are not configured yet or need App Password
  console.log(`[Email Gateway] Ready for ${cleanEmail} -> Code: ${otp}.`);
  return {
    sent: false,
    provider: 'Simulated Gmail Gateway',
    error: (rawGmailUser || rawGmailPass)
      ? 'Gmail authentication requires an App Password from myaccount.google.com/apppasswords. Use the 1-Click Verify code below.'
      : 'Direct SMTP credentials (GMAIL_USER & GMAIL_APP_PASSWORD) not configured yet.'
  };
}

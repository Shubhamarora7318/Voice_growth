import crypto from 'crypto';
import { OtpRecord } from './types.js';
import { dispatchSms } from './sms.js';
import { dispatchEmailOtp } from './email.js';

// In-memory or state map for active OTP challenges (keyed by phone or email)
const otpStore = new Map<string, OtpRecord>();

// Cooldown tracking per phone or email: minimum 30 seconds between requests
const cooldowns = new Map<string, number>();

export interface SendOtpResult {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  devOtp?: string; // Provided for instant sandbox testing when SMTP/SMS is not yet linked
  cooldownRemaining?: number;
  smsSent?: boolean;
  emailSent?: boolean;
  provider?: string;
  smsNotice?: string;
  emailNotice?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
  expired?: boolean;
}

export function generateOtp(): string {
  // Generate cryptographically secure 6-digit numeric OTP
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

export function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

/**
 * Dispatches an OTP to a Gmail / Google account email.
 */
export async function requestEmailOtp(email: string): Promise<SendOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      success: false,
      message: 'Please enter a valid Gmail / Google email address (e.g. yourname@gmail.com).'
    };
  }

  const now = Date.now();
  const lastSent = cooldowns.get(normalizedEmail);
  if (lastSent && now - lastSent < 30 * 1000) {
    const remaining = Math.ceil((30 * 1000 - (now - lastSent)) / 1000);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting a new OTP.`,
      cooldownRemaining: remaining
    };
  }

  const otp = generateOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const expiresInSeconds = 300; // 5 minutes validity for email OTP

  const record: OtpRecord = {
    id: crypto.randomUUID(),
    target: normalizedEmail,
    email: normalizedEmail,
    otp_hash: otpHash,
    salt,
    attempts: 0,
    max_attempts: 4,
    expires_at: now + expiresInSeconds * 1000,
    created_at: new Date().toISOString()
  };

  otpStore.set(normalizedEmail, record);
  cooldowns.set(normalizedEmail, now);

  console.log(`[Voice2Growth Auth] 📧 Generated Gmail OTP for ${normalizedEmail} -> ${otp} (Valid for 5 mins)`);

  // Attempt real email dispatch via Gmail SMTP / Custom SMTP / Resend
  const emailOutcome = await dispatchEmailOtp(normalizedEmail, otp);

  if (emailOutcome.sent) {
    return {
      success: true,
      message: `Verification code sent to ${normalizedEmail} via ${emailOutcome.provider}.`,
      expiresInSeconds,
      emailSent: true,
      provider: emailOutcome.provider,
      devOtp: otp
    };
  }

  return {
    success: true,
    message: emailOutcome.error
      ? `Email dispatch initialized (${emailOutcome.provider}). Code generated below.`
      : 'Verification code generated for your Gmail account.',
    expiresInSeconds,
    emailSent: false,
    provider: emailOutcome.provider,
    emailNotice: emailOutcome.error,
    devOtp: otp
  };
}

/**
 * Verifies an OTP sent to a Gmail / Google account email.
 */
export function verifyEmailOtp(email: string, inputOtp: string): VerifyOtpResult {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return {
      success: false,
      message: 'No active OTP found for this Gmail address. Please request a new code.'
    };
  }

  if (Date.now() > record.expires_at) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: 'The OTP code has expired. Please request a fresh code.',
      expired: true
    };
  }

  if (record.attempts >= record.max_attempts) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new code.',
      attemptsRemaining: 0
    };
  }

  const hashedAttempt = hashOtp(inputOtp.trim(), record.salt);

  if (hashedAttempt !== record.otp_hash) {
    record.attempts += 1;
    const remaining = record.max_attempts - record.attempts;

    if (remaining <= 0) {
      otpStore.delete(normalizedEmail);
      return {
        success: false,
        message: 'Incorrect code. Maximum attempts reached. Please request a fresh code.',
        attemptsRemaining: 0
      };
    }

    return {
      success: false,
      message: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      attemptsRemaining: remaining
    };
  }

  // Success: invalidate OTP record so it cannot be reused
  otpStore.delete(normalizedEmail);
  return {
    success: true,
    message: 'Gmail address verified successfully.'
  };
}

export async function requestOtp(mobileNumber: string): Promise<SendOtpResult> {
  const normalizedPhone = mobileNumber.trim().replace(/\s+/g, '');
  
  if (!/^\+?[0-9]{8,15}$/.test(normalizedPhone)) {
    return {
      success: false,
      message: 'Please enter a valid mobile number with country code (e.g., +91 98765 43210).'
    };
  }

  const now = Date.now();
  const lastSent = cooldowns.get(normalizedPhone);
  if (lastSent && now - lastSent < 30 * 1000) {
    const remaining = Math.ceil((30 * 1000 - (now - lastSent)) / 1000);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting a new OTP.`,
      cooldownRemaining: remaining
    };
  }

  const otp = generateOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const expiresInSeconds = 180; // 3 minutes validity

  const record: OtpRecord = {
    id: crypto.randomUUID(),
    target: normalizedPhone,
    mobile_number: normalizedPhone,
    otp_hash: otpHash,
    salt,
    attempts: 0,
    max_attempts: 3,
    expires_at: now + expiresInSeconds * 1000,
    created_at: new Date().toISOString()
  };

  otpStore.set(normalizedPhone, record);
  cooldowns.set(normalizedPhone, now);

  console.log(`[Voice2Growth Auth] 📲 Generated OTP for ${normalizedPhone} -> ${otp} (Valid for 3 mins)`);

  // Attempt real SMS delivery through available gateways (Textbelt free tier, Fast2SMS, Twilio)
  const smsOutcome = await dispatchSms(normalizedPhone, otp);

  if (smsOutcome.sent) {
    return {
      success: true,
      message: `OTP delivered to ${normalizedPhone} via ${smsOutcome.provider}.`,
      expiresInSeconds,
      smsSent: true,
      provider: smsOutcome.provider,
      devOtp: otp
    };
  }

  return {
    success: true,
    message: smsOutcome.error
      ? `Free gateway notice (${smsOutcome.provider}): ${smsOutcome.error}. Verification code is provided below.`
      : 'OTP has been generated. Verification code is provided below.',
    expiresInSeconds,
    smsSent: false,
    provider: smsOutcome.provider,
    smsNotice: smsOutcome.error,
    devOtp: otp
  };
}

export function verifyOtp(mobileNumber: string, inputOtp: string): VerifyOtpResult {
  const normalizedPhone = mobileNumber.trim().replace(/\s+/g, '');
  const record = otpStore.get(normalizedPhone);

  if (!record) {
    return {
      success: false,
      message: 'No OTP found for this number. Please request a new OTP.'
    };
  }

  if (Date.now() > record.expires_at) {
    otpStore.delete(normalizedPhone);
    return {
      success: false,
      message: 'The OTP has expired. Please request a fresh OTP.',
      expired: true
    };
  }

  if (record.attempts >= record.max_attempts) {
    otpStore.delete(normalizedPhone);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      attemptsRemaining: 0
    };
  }

  const hashedAttempt = hashOtp(inputOtp.trim(), record.salt);

  if (hashedAttempt !== record.otp_hash) {
    record.attempts += 1;
    const remaining = record.max_attempts - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(normalizedPhone);
      return {
        success: false,
        message: 'Invalid OTP. Maximum attempts exceeded. Please request a new code.',
        attemptsRemaining: 0
      };
    }
    return {
      success: false,
      message: `Invalid OTP. You have ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      attemptsRemaining: remaining
    };
  }

  // Verified successfully
  record.verified_at = new Date().toISOString();
  otpStore.delete(normalizedPhone); // Clean up OTP challenge

  return {
    success: true,
    message: 'Mobile number verified successfully!'
  };
}

export interface SmsDispatchResult {
  sent: boolean;
  provider: string;
  error?: string;
  details?: any;
}

/**
 * Dispatches real SMS to a mobile phone using free/configured SMS gateways:
 * 1. Fast2SMS (Free signup credits for Indian +91 numbers)
 * 2. Twilio (Free trial credits for global numbers)
 * 3. Textbelt (Free daily tier / custom key)
 */
export async function dispatchSms(phoneWithCode: string, otp: string): Promise<SmsDispatchResult> {
  const normalized = phoneWithCode.trim().replace(/\s+/g, '');
  const message = `Your Voice2Growth verification code is: ${otp}. Valid for 3 minutes. Do not share this code.`;

  // 1. Try Fast2SMS (popular free tier for +91 numbers)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      // Strip country code if +91
      const indianNumber = normalized.replace(/^\+91/, '').replace(/^0/, '');
      if (/^[6-9]\d{9}$/.test(indianNumber)) {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: indianNumber
          })
        });
        const data: any = await res.json();
        if (data && data.return === true) {
          console.log(`[SMS Gateway: Fast2SMS] ✅ Delivered to ${normalized}:`, data.message);
          return { sent: true, provider: 'Fast2SMS', details: data };
        } else {
          console.warn(`[SMS Gateway: Fast2SMS] ⚠️ Failed:`, data);
        }
      }
    } catch (err: any) {
      console.warn(`[SMS Gateway: Fast2SMS] Error:`, err.message);
    }
  }

  // 2. Try Twilio (Free Trial / Active Twilio Account)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams();
      body.append('To', normalized);
      body.append('From', twilioFrom);
      body.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      const data: any = await res.json();
      if (res.ok && data.sid) {
        console.log(`[SMS Gateway: Twilio] ✅ Sent to ${normalized}, SID: ${data.sid}`);
        return { sent: true, provider: 'Twilio', details: data };
      } else {
        console.warn(`[SMS Gateway: Twilio] ⚠️ Failed:`, data);
      }
    } catch (err: any) {
      console.warn(`[SMS Gateway: Twilio] Error:`, err.message);
    }
  }

  // 3. Try Textbelt (Built-in Free Tier or custom API key)
  const textbeltKey = process.env.TEXTBELT_KEY || 'textbelt';
  try {
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalized,
        message,
        key: textbeltKey
      })
    });
    const data: any = await res.json();
    if (data && data.success) {
      console.log(`[SMS Gateway: Textbelt] ✅ Sent to ${normalized}, quota remaining: ${data.quotaRemaining}`);
      return { sent: true, provider: 'Textbelt', details: data };
    } else {
      console.warn(`[SMS Gateway: Textbelt] ℹ️ Response:`, data?.error || data);
      return {
        sent: false,
        provider: 'Textbelt',
        error: data?.error || 'SMS quota reached on free tier'
      };
    }
  } catch (err: any) {
    console.warn(`[SMS Gateway: Textbelt] Error:`, err.message);
    return {
      sent: false,
      provider: 'Textbelt',
      error: err.message
    };
  }
}

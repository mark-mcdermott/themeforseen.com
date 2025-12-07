import { Resend } from 'resend';

export function createResend(apiKey: string) {
	return new Resend(apiKey);
}

interface SendLicenseEmailParams {
	to: string;
	licenseKey: string;
	userName?: string | null;
}

export async function sendLicenseEmail(
	resend: Resend,
	{ to, licenseKey, userName }: SendLicenseEmailParams
) {
	const greeting = userName ? `Hi ${userName}` : 'Hi there';

	const { data, error } = await resend.emails.send({
		from: 'ThemeForseen <noreply@themeforseen.com>',
		to,
		subject: 'Your ThemeForseen Premium License Key',
		html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #51c5f4; margin: 0;">ThemeForseen</h1>
    <p style="color: #666; margin-top: 5px;">Premium License</p>
  </div>

  <p>${greeting},</p>

  <p>Thank you for purchasing ThemeForseen Premium! Your support means a lot.</p>

  <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your License Key</p>
    <code style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${licenseKey}</code>
  </div>

  <p>This is a one-time purchase - you own it forever. No subscriptions, no renewals.</p>

  <h3 style="margin-top: 30px;">What's included:</h3>
  <ul style="color: #555;">
    <li>Save unlimited favorites</li>
    <li>Create custom palettes</li>
    <li>All export formats (CSS, Sass, Tailwind, JSON)</li>
    <li>Accessibility checker (WCAG)</li>
    <li>Color blindness simulator</li>
  </ul>

  <p style="margin-top: 30px;">
    <a href="https://themeforseen.com/account" style="display: inline-block; background: #51c5f4; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Your Account</a>
  </p>

  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    Keep this email for your records. If you have any questions, just reply to this email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ThemeForseen - Beautiful themes for your web projects<br>
    <a href="https://themeforseen.com" style="color: #51c5f4;">themeforseen.com</a>
  </p>
</body>
</html>
		`.trim(),
		text: `
${greeting},

Thank you for purchasing ThemeForseen Premium! Your support means a lot.

Your License Key: ${licenseKey}

This is a one-time purchase - you own it forever. No subscriptions, no renewals.

What's included:
- Save unlimited favorites
- Create custom palettes
- All export formats (CSS, Sass, Tailwind, JSON)
- Accessibility checker (WCAG)
- Color blindness simulator

View your account: https://themeforseen.com/account

Keep this email for your records. If you have any questions, just reply to this email.

---
ThemeForseen - Beautiful themes for your web projects
https://themeforseen.com
		`.trim()
	});

	if (error) {
		console.error('Failed to send license email:', error);
		throw error;
	}

	return data;
}

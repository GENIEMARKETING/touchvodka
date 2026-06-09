/**
 * Email delivery — OSS migration (S8 / T26).
 *
 * The Vite build sent transactional mail with nodemailer over Office 365 SMTP.
 * The platform standard is the self-hosted OSS stack (Postal on an off-AWS,
 * port-25-capable box). This module sends via the **Postal HTTP API** by default
 * and FALLS BACK to the legacy SMTP path when `EMAIL_PROVIDER=office365` or when
 * Postal isn't configured yet.
 *
 * CUTOVER RULE (do not break transactional email): keep the legacy path live
 * until the Postal path is verified delivering for this domain (SPF/DKIM/DMARC
 * green). Flip `EMAIL_PROVIDER=postal` only after a verified test send. See
 * LEARNINGS: email-cutover-keep-old-path-live.
 *
 * Note: nodemailer is intentionally imported lazily so it is only pulled in when
 * the legacy fallback is actually used (keeps it out of the default bundle path).
 */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailResult = { success: boolean; provider: 'postal' | 'office365'; message: string };

const FROM = process.env.CONTACT_RECIPIENT_EMAIL ?? 'info@touchvodka.com';

async function sendViaPostal(msg: EmailMessage): Promise<EmailResult> {
  const url = process.env.POSTAL_API_URL;
  const key = process.env.POSTAL_API_KEY;
  if (!url || !key) throw new Error('postal-not-configured');

  const res = await fetch(`${url.replace(/\/$/, '')}/send/message`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Server-API-Key': key },
    body: JSON.stringify({
      from: FROM,
      to: [msg.to],
      reply_to: msg.replyTo,
      subject: msg.subject,
      html_body: msg.html,
      plain_body: msg.text,
    }),
  });
  if (!res.ok) throw new Error(`postal ${res.status}`);
  return { success: true, provider: 'postal', message: 'sent via Postal' };
}

async function sendViaOffice365(msg: EmailMessage): Promise<EmailResult> {
  const user = process.env.OFFICE365_EMAIL;
  const pass = process.env.OFFICE365_APP_PASSWORD;
  if (!user || !pass) throw new Error('office365-not-configured');

  // Lazy import so the legacy transport never enters the hot path / bundle.
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { ciphers: 'SSLv3' },
  });
  await transporter.sendMail({
    from: user,
    to: msg.to,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
  return { success: true, provider: 'office365', message: 'sent via Office 365 (legacy fallback)' };
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const preferred = process.env.EMAIL_PROVIDER ?? 'postal';
  try {
    if (preferred === 'office365') return await sendViaOffice365(msg);
    return await sendViaPostal(msg);
  } catch (err) {
    // New path failed — fall back to the legacy sender so mail still goes out
    // during the migration window. Surfaces in logs for the cutover checklist.
    console.warn('[email] primary provider failed, falling back:', err);
    try {
      return await sendViaOffice365(msg);
    } catch (fallbackErr) {
      console.error('[email] all providers failed:', fallbackErr);
      return { success: false, provider: 'postal', message: 'delivery failed' };
    }
  }
}

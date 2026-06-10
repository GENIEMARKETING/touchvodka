/**
 * Email delivery — migration (S8 / T26).
 *
 * The Vite build sent transactional mail with nodemailer over Office 365 SMTP.
 * The platform standard is now **SMTP2GO** (a hosted relay; replaces the earlier
 * self-hosted Postal MTA — AWS blocks port 25, SMTP2GO owns the egress + IP
 * reputation). This module sends via SMTP2GO over SMTP (`mail.smtp2go.com:587`,
 * STARTTLS) by default and FALLS BACK to the legacy Office 365 SMTP path when
 * `EMAIL_PROVIDER=office365` or when SMTP2GO isn't configured yet.
 *
 * CUTOVER RULE (do not break transactional email): keep the legacy path live
 * until the SMTP2GO path is verified delivering for this domain (SPF/DKIM/DMARC
 * green). Flip `EMAIL_PROVIDER=smtp2go` only after a verified test send. See
 * LEARNINGS: email-cutover-keep-old-path-live.
 *
 * Note: nodemailer is imported lazily so it's only pulled in when a transport is
 * actually used (keeps it off the default bundle hot path).
 */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailResult = { success: boolean; provider: 'smtp2go' | 'office365'; message: string };

const FROM = process.env.CONTACT_RECIPIENT_EMAIL ?? 'info@touchvodka.com';

async function sendViaSmtp2go(msg: EmailMessage): Promise<EmailResult> {
  const user = process.env.SMTP2GO_SMTP_USER;
  const pass = process.env.SMTP2GO_SMTP_PASSWORD;
  if (!user || !pass) throw new Error('smtp2go-not-configured');

  const host = process.env.SMTP2GO_SMTP_HOST ?? 'mail.smtp2go.com';
  const port = Number(process.env.SMTP2GO_SMTP_PORT ?? 587);

  // Lazy import keeps nodemailer off the default bundle hot path.
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 587 = STARTTLS (secure:false); 465 = implicit TLS
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: FROM,
    to: msg.to,
    replyTo: msg.replyTo,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
  return { success: true, provider: 'smtp2go', message: 'sent via SMTP2GO' };
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
  const preferred = process.env.EMAIL_PROVIDER ?? 'smtp2go';
  try {
    if (preferred === 'office365') return await sendViaOffice365(msg);
    return await sendViaSmtp2go(msg);
  } catch (err) {
    // New path failed — fall back to the legacy sender so mail still goes out
    // during the migration window. Surfaces in logs for the cutover checklist.
    console.warn('[email] primary provider failed, falling back:', err);
    try {
      return await sendViaOffice365(msg);
    } catch (fallbackErr) {
      console.error('[email] all providers failed:', fallbackErr);
      return { success: false, provider: 'smtp2go', message: 'delivery failed' };
    }
  }
}

import { sendEmail } from '@/lib/email';
/**
 * POST /api/contact — LEGACY transactional contact path, ported from the Vite
 * build's Express `server/routes/contact.ts`.
 *
 * MIGRATION (S8 / T26): the email transport is migrated off the legacy Office365
 * nodemailer path to **SMTP2GO** via `lib/email.ts`, but this endpoint is KEPT
 * LIVE as a safety net during cutover so transactional mail never breaks. The
 * primary capture form now posts to /api/lead (CRM + Mautic). Retire this route
 * once the SMTP2GO path is verified delivering. See LEARNINGS: email-cutover-keep-old-path-live.
 */
import { type NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'invalid json' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  const errors: string[] = [];
  if (name.length < 2) errors.push('name');
  if (!EMAIL_RE.test(email)) errors.push('email');
  if (subject.length < 5) errors.push('subject');
  if (message.length < 10) errors.push('message');
  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors },
      { status: 400 },
    );
  }

  const html = `<html><body style="font-family:Arial,sans-serif;color:#333">
    <h2 style="color:#0055FF;border-bottom:2px solid #0055FF;padding-bottom:10px">New Contact Form Submission</h2>
    <div style="margin:20px 0;background:#f5f5f5;padding:15px;border-left:4px solid #0055FF">
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    </div>
    <div style="margin:20px 0"><h3>Message:</h3><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p></div>
  </body></html>`;

  const result = await sendEmail({
    to: process.env.CONTACT_RECIPIENT_EMAIL ?? 'info@touchvodka.com',
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    html,
    text: `New contact from ${name} (${email}):\n\nSubject: ${subject}\n\n${message}`,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 502 },
    );
  }
  return NextResponse.json({
    success: true,
    message: 'Your message has been sent.',
    via: result.provider,
  });
}

// Gmail SMTP via nodemailer. Only used by the notify-waitlist script right now —
// not part of any live request path — so a missing config only breaks that script,
// not the server.
import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    if (!env.gmailUser || !env.gmailAppPassword) {
      throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD not set — add them to apps/api/.env');
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.gmailUser, pass: env.gmailAppPassword },
    });
  }
  return transporter;
}

const SITE_URL = 'https://vaani-4a691.web.app';
const SUPPORT_EMAIL = 'ghoshabhijeet778@gmail.com';

function launchEmailHtml(): string {
  return `<div style="background:#0C0E0D;color:#E8EAE7;font-family:Georgia,'Times New Roman',serif;padding:48px 24px;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="height:3px;width:40px;background:#A8E06B;border-radius:2px;margin:0 0 28px;"></div>
    <p style="font-size:22px;margin:0 0 4px;">vaani</p>
    <p style="font-size:12px;letter-spacing:0.04em;color:#7C837A;margin:0 0 28px;">the voice that speaks all of India</p>

    <p style="font-size:20px;line-height:1.4;margin:0 0 16px;">vaani is live!</p>
    <p style="font-size:15px;line-height:1.7;color:#B7BDB6;margin:0 0 28px;">
      Thanks so much for waiting — it means a lot. You can check it out right here:
    </p>
    <p style="margin:0 0 32px;">
      <a href="${SITE_URL}" style="background:#A8E06B;color:#0C0E0D;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Open vaani</a>
    </p>
    <p style="font-size:14px;line-height:1.7;color:#B7BDB6;margin:0 0 28px;">
      This is a solo, early build, so if you run into a bug or anything feels off, I'd genuinely
      love to hear about it — just reply to this email or write to
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#A8E06B;">${SUPPORT_EMAIL}</a>.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 4px;">Thanks again,</p>
    <p style="font-size:15px;line-height:1.6;color:#B7BDB6;margin:0;">Abhijeet</p>
  </div>
</div>`;
}

function launchEmailText(): string {
  return [
    'vaani is live!',
    '',
    "Thanks so much for waiting — it means a lot. You can check it out here:",
    SITE_URL,
    '',
    "This is a solo, early build, so if you run into a bug or anything feels off, I'd genuinely love to hear about it — just reply to this email or write to " +
      SUPPORT_EMAIL +
      '.',
    '',
    'Thanks again,',
    'Abhijeet',
  ].join('\n');
}

export async function sendWaitlistLaunchEmail(to: string): Promise<void> {
  await getTransporter().sendMail({
    from: `vaani <${env.gmailUser}>`,
    to,
    subject: 'vaani is live',
    text: launchEmailText(),
    html: launchEmailHtml(),
  });
}

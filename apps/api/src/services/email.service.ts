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

function launchEmailHtml(): string {
  return `<div style="background:#0C0E0D;color:#E8EAE7;font-family:Georgia,'Times New Roman',serif;padding:40px 24px;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="font-size:22px;margin:0 0 24px;">vaani</p>
    <p style="font-size:17px;line-height:1.6;margin:0 0 16px;">vaani is live.</p>
    <p style="font-size:15px;line-height:1.6;color:#B7BDB6;margin:0 0 28px;">
      Thanks for waiting. vaani is a live speech-translation app across 14 Indian languages —
      speak, and the person in front of you reads (and hears) it in their language.
    </p>
    <p style="margin:0 0 28px;">
      <a href="${SITE_URL}" style="background:#A8E06B;color:#0C0E0D;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Open vaani</a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#7C837A;margin:0;">
      vaani is a solo build by Abhijeet Ghosh — a hands-on trial of what Sarvam AI's speech and
      translation models can do.
    </p>
  </div>
</div>`;
}

function launchEmailText(): string {
  return [
    'vaani is live.',
    '',
    "Thanks for waiting. vaani is a live speech-translation app across 14 Indian languages — speak, and the person in front of you reads (and hears) it in their language.",
    '',
    `Open vaani: ${SITE_URL}`,
    '',
    "vaani is a solo build by Abhijeet Ghosh — a hands-on trial of what Sarvam AI's speech and translation models can do.",
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

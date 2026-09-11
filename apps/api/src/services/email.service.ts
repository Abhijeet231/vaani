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
const PERSONAL_SITE_URL = 'https://abhijeetghosh.site';

function launchEmailHtml(): string {
  return `<div style="background:#0C0E0D;color:#E8EAE7;font-family:Georgia,'Times New Roman',serif;padding:48px 24px;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="height:3px;width:40px;background:#A8E06B;border-radius:2px;margin:0 0 28px;"></div>
    <p style="font-size:22px;margin:0 0 4px;">vaani</p>
    <p style="font-size:12px;letter-spacing:0.04em;color:#7C837A;margin:0 0 28px;">the voice that speaks all of India</p>

    <p style="font-size:20px;line-height:1.4;margin:0 0 16px;">vaani is live.</p>
    <p style="font-size:15px;line-height:1.7;color:#B7BDB6;margin:0 0 28px;">
      Thanks so much for waiting, genuinely appreciate it. Do check it out here:
    </p>
    <p style="margin:0 0 32px;">
      <a href="${SITE_URL}" style="background:#A8E06B;color:#0C0E0D;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Open vaani</a>
    </p>
    <p style="font-size:14px;line-height:1.7;color:#B7BDB6;margin:0 0 20px;">
      Quick honest context on what this actually is — vaani is a fun side-project I built to
      understand how Sarvam AI's speech models actually perform in a real product:
      speech-to-text, translation, and text-to-speech, all chained together, and what the
      quality and latency genuinely feel like end to end.
    </p>
    <p style="font-size:14px;line-height:1.7;color:#B7BDB6;margin:0 0 20px;">
      You have 10 free translations to try it with, no card needed. Honestly, I won't even
      encourage you to pay for this unless it becomes something you actually end up using in
      daily life — the recharge packs are mainly there so nobody loops the free tier all night
      and quietly sends me bankrupt on Sarvam's API bill. (Genuine fear, and genuinely why that
      feature exists.)
    </p>
    <p style="font-size:14px;line-height:1.7;color:#B7BDB6;margin:0 0 28px;">
      If you do try it out, do let me know what you think — what worked, what didn't, any bugs,
      any feature you feel is missing. Just reply to this email or write to
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#A8E06B;">${SUPPORT_EMAIL}</a>.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 4px;">Thanks again,</p>
    <p style="font-size:15px;line-height:1.6;color:#B7BDB6;margin:0 0 28px;">Abhijeet</p>

    <p style="font-size:13px;line-height:1.6;color:#7C837A;margin:0;">
      More about me → <a href="${PERSONAL_SITE_URL}" style="color:#A8E06B;">abhijeetghosh.site</a>
    </p>
  </div>
</div>`;
}

function launchEmailText(): string {
  return [
    'vaani is live.',
    '',
    'Thanks so much for waiting, genuinely appreciate it. Do check it out here:',
    SITE_URL,
    '',
    "Quick honest context on what this actually is — vaani is a fun side-project I built to understand how Sarvam AI's speech models actually perform in a real product: speech-to-text, translation, and text-to-speech, all chained together, and what the quality and latency genuinely feel like end to end.",
    '',
    "You have 10 free translations to try it with, no card needed. Honestly, I won't even encourage you to pay for this unless it becomes something you actually end up using in daily life — the recharge packs are mainly there so nobody loops the free tier all night and quietly sends me bankrupt on Sarvam's API bill. (Genuine fear, and genuinely why that feature exists.)",
    '',
    "If you do try it out, do let me know what you think — what worked, what didn't, any bugs, any feature you feel is missing. Just reply to this email or write to " +
      SUPPORT_EMAIL +
      '.',
    '',
    'Thanks again,',
    'Abhijeet',
    '',
    `More about me → ${PERSONAL_SITE_URL}`,
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

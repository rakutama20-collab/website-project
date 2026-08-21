import nodemailer from "nodemailer";

type MailSettings = {
  adminEmail?: string | null;
  smtpAppPassword?: string | null;
};

export function createMailer(settings: MailSettings) {
  const user = process.env.SMTP_USER || settings.adminEmail || "";
  const password = settings.smtpAppPassword || process.env.SMTP_PASSWORD || "";
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  if (!user || !password) throw new Error("SMTPの認証情報が設定されていません");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

export async function sendConfiguredMail(settings: MailSettings, message: { to: string; subject: string; text: string }) {
  const transporter = createMailer(settings);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || settings.adminEmail || "";
  if (!from) throw new Error("SMTPの送信元が設定されていません");
  await transporter.sendMail({
    from,
    ...message,
  });
}
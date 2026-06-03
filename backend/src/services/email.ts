import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? "Smart Step Academy <noreply@localhost>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendCredentialsEmail(params: {
  to: string;
  name: string;
  username: string;
  password: string;
  role: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.to,
    subject: `Smart Step Academy – ${params.role} Login Credentials`,
    html: `
      <h2>Smart Step Academy</h2>
      <p>Dear ${params.name},</p>
      <p>Your portal credentials:</p>
      <ul>
        <li><strong>Username:</strong> ${params.username}</li>
        <li><strong>Password:</strong> ${params.password}</li>
      </ul>
      <p>Please change your password after first login.</p>
    `,
  });
}

import { SendEmailCommand } from "@aws-sdk/client-ses";

import { sesClient } from "@/lib/aws/ses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

const MAX_FIELD_LENGTHS = {
  name: 200,
  email: 320,
  subject: 250,
  message: 5000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background-color:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e6e2d8;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px;border-bottom:1px solid #ece8de;">
                <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7464;">Tellian Capital</p>
                <h1 style="margin:8px 0 0 0;font-size:22px;font-weight:500;color:#1a1a1a;">${safeSubject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#7a7464;width:120px;">Name</td>
                    <td style="padding:8px 0;font-size:14px;color:#1a1a1a;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:13px;color:#7a7464;">E-Mail</td>
                    <td style="padding:8px 0;font-size:14px;color:#1a1a1a;"><a href="mailto:${safeEmail}" style="color:#1a1a1a;text-decoration:none;">${safeEmail}</a></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a7464;">Nachricht</p>
                <div style="margin-top:8px;padding:16px;background-color:#f8f6f1;border-radius:8px;font-size:14px;line-height:1.65;color:#1a1a1a;white-space:pre-wrap;">${safeMessage}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return [
    `Subject: ${subject}`,
    `Name: ${name}`,
    `E-Mail: ${email}`,
    "",
    "Nachricht:",
    message,
  ].join("\n");
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = asTrimmedString(body.name, MAX_FIELD_LENGTHS.name);
  const email = asTrimmedString(body.email, MAX_FIELD_LENGTHS.email);
  const subject = asTrimmedString(body.subject, MAX_FIELD_LENGTHS.subject);
  const message = asTrimmedString(body.message, MAX_FIELD_LENGTHS.message);

  if (!name || !email || !subject || !message) {
    return Response.json(
      { ok: false, error: "Missing or invalid fields. Required: name, email, subject, message." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Invalid email address." }, { status: 400 });
  }

  const fromAddress = process.env.SES_FROM_EMAIL;
  const toAddress = process.env.SES_TO_EMAIL;

  if (!fromAddress || !toAddress) {
    console.error("[contact] SES_FROM_EMAIL or SES_TO_EMAIL is not configured.");
    return Response.json({ ok: false, error: "Email service is not configured." }, { status: 500 });
  }

  const payload = { name, email, subject, message };

  const command = new SendEmailCommand({
    Source: fromAddress,
    Destination: { ToAddresses: [toAddress] },
    ReplyToAddresses: [email],
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: renderHtml(payload), Charset: "UTF-8" },
        Text: { Data: renderText(payload), Charset: "UTF-8" },
      },
    },
  });

  try {
    const result = await sesClient.send(command);
    return Response.json({ ok: true, messageId: result.MessageId }, { status: 200 });
  } catch (error) {
    console.error("[contact] SES send failed:", error);
    return Response.json(
      { ok: false, error: "Failed to send email. Please try again later." },
      { status: 502 },
    );
  }
}

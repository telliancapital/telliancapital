import "server-only";

/* Transactional email via Brevo (https://developers.brevo.com).
   Env (server-side only): BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME. */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_FROM_NAME = "Tellian Capital";

export type SendResult =
  | { sent: true; messageId?: string }
  | { sent: false; error: "not_configured" | string };

interface SendEmailInput {
  to: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  if (!apiKey || !fromEmail) return { sent: false, error: "not_configured" };

  const sender = {
    email: fromEmail,
    name: process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME,
  };

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [input.to],
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Brevo send failed", { status: res.status, detail });
      return { sent: false, error: `brevo_${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { sent: true, messageId: data.messageId };
  } catch (err) {
    console.error("[email] Brevo send error", err);
    return { sent: false, error: (err as Error)?.message || "network_error" };
  }
}

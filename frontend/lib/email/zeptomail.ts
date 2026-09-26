import "server-only";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailOptions) {
  const apiKey = process.env.ZEPTOMAIL_API_KEY;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "Bencord Ltd";

  if (!apiKey || !fromEmail) {
    throw new Error(
      "ZeptoMail is not configured (ZEPTOMAIL_API_KEY / ZEPTOMAIL_FROM_EMAIL)"
    );
  }

  const payload: Record<string, unknown> = {
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: to,
        },
      },
    ],
    subject,
    htmlbody: html,
  };

  if (replyTo) {
    payload.reply_to = [
      {
        address: replyTo,
      },
    ];
  }

  const response = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("ZeptoMail error:", data);
    throw new Error(data?.message ?? "Failed to send email");
  }

  return data;
}
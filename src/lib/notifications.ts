import { Resend } from "resend";

const FROM_EMAIL = "PreambleHomes <notifications@preamblehomes.com>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendMatchNotification(to: string, data: {
  recipientName: string;
  matchScore: number;
  listingCity: string;
  listingPrice: number;
  matchUrl: string;
}) {
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(data.listingPrice);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New match in ${data.listingCity} — ${priceFormatted} (${data.matchScore}% match)`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">New Pre-Market Match</h2>
        <p>Hi ${data.recipientName},</p>
        <p>We found a <strong>${data.matchScore}% match</strong> for you in <strong>${data.listingCity}</strong> at <strong>${priceFormatted}</strong>.</p>
        <a href="${data.matchUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          View Match
        </a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">
          This is a pre-market intent profile and does not constitute a property listing.
          No listing agreement exists between any parties through this platform.
        </p>
      </div>
    `,
  });
}

export async function sendInquiryNotification(to: string, data: {
  agentName: string;
  buyerName: string;
  listingAddress: string;
  inquiryType: string;
  message: string;
  dashboardUrl: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New inquiry from ${data.buyerName} — ${data.listingAddress}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">New Inquiry</h2>
        <p>Hi ${data.agentName},</p>
        <p><strong>${data.buyerName}</strong> sent a <strong>${data.inquiryType.replace("_", " ")}</strong> about the property at <strong>${data.listingAddress}</strong>.</p>
        ${data.message ? `<blockquote style="border-left: 3px solid #2563eb; padding-left: 12px; color: #374151;">${data.message}</blockquote>` : ""}
        <a href="${data.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          View in Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, data: {
  name: string;
  role: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to PreambleHomes`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">Welcome to PreambleHomes</h2>
        <p>Hi ${data.name},</p>
        <p>Your ${data.role} account is ready. Start exploring pre-market opportunities today.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}

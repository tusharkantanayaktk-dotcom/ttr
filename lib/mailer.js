import nodemailer from "nodemailer";

const accounts = [
  { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  { user: process.env.GMAIL_USER1, pass: process.env.GMAIL_APP_PASSWORD1 },
];

let currentAccountIndex = 0;

function getTransporter() {
  const account = accounts[currentAccountIndex];
  currentAccountIndex = (currentAccountIndex + 1) % accounts.length;

  return {
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: account.user,
        pass: account.pass,
      },
    }),
    user: account.user,
  };
}

export async function sendPromotionalMail({ to, subject, headerTitle, bannerUrl, body }) {
  const { transporter, user } = getTransporter();

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 20px;">
      ${bannerUrl ? `<img src="${bannerUrl}" style="width: 100%; border-radius: 15px; margin-bottom: 20px;" alt="Banner" />` : ""}
      <div style="background-color: #ffffff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        ${headerTitle ? `<h1 style="color: #333; margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${headerTitle}</h1>` : ""}
        <div style="color: #555; font-size: 16px; line-height: 1.6;">
          ${body}
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #eee; pt: 20px; text-align: center;">
          <p style="font-size: 12px; color: #999;">
            This is a promotional message from ${process.env.NEXT_PUBLIC_BRAND_NAME || "Our Store"}.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.NEXT_PUBLIC_BRAND_NAME || "Support"}" <${user}>`,
    to,
    subject,
    html,
  });
}

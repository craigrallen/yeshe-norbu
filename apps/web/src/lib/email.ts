import nodemailer from 'nodemailer';

// Same Gmail OAuth2 setup WP was using
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_FROM_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

const FROM = `"${process.env.GMAIL_FROM_NAME || 'Yeshin Norbu'}" <${process.env.GMAIL_FROM_EMAIL || 'hello@yeshinnorbu.se'}>`;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yeshinnorbu.se';

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#f7f7f7; font-family:Helvetica,Arial,sans-serif; color:#3c3c3c; }
  .wrap { max-width:600px; margin:0 auto; background:#fff; }
  .header { background:#2C2C2C; padding:24px 32px; }
  .header img { height:48px; }
  .header-text { color:#F5A623; font-size:20px; font-weight:bold; }
  .body { padding:32px; }
  .footer { background:#f7f7f7; padding:24px 32px; font-size:12px; color:#888; border-top:1px solid #eee; }
  .btn { display:inline-block; background:#F5A623; color:#fff !important; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; font-size:16px; margin:16px 0; }
  h1 { font-size:24px; color:#2C2C2C; margin:0 0 16px; }
  p { line-height:1.6; margin:0 0 16px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-text">🙏 Yeshin Norbu Mind Training Centre</div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>Yeshin Norbu Mind Training Centre<br>
    Roslagsgatan 62, 113 54 Stockholm<br>
    <a href="tel:+46855008575">+46 855 008 575</a> · <a href="mailto:hello@yeshinnorbu.se">hello@yeshinnorbu.se</a></p>
    <p>Org nr: 802512-5629 · Bankgiro: 649-6137</p>
    <p><a href="${BASE_URL}/sv">yeshinnorbu.se</a></p>
  </div>
</div>
</body>
</html>`;
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string) {
  const resetUrl = `${BASE_URL}/sv/aterstall-losenord?token=${token}`;
  const html = baseTemplate(`
    <h1>Återställ ditt lösenord</h1>
    <p>Hej ${firstName},</p>
    <p>Vi fick en begäran om att återställa lösenordet för ditt konto på Yeshin Norbu.</p>
    <p>Klicka på knappen nedan för att skapa ett nytt lösenord. Länken är giltig i <strong>1 timme</strong>.</p>
    <p><a href="${resetUrl}" class="btn">Återställ lösenord</a></p>
    <p>Om du inte begärde detta kan du ignorera det här e-postmeddelandet. Ditt lösenord ändras inte.</p>
    <p>Med vänliga hälsningar,<br>Yeshin Norbu</p>
  `);

  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: 'Återställ ditt lösenord – Yeshin Norbu',
    html,
  });
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = baseTemplate(`
    <h1>Välkommen till Yeshin Norbu! 🙏</h1>
    <p>Hej ${firstName},</p>
    <p>Ditt konto har skapats. Du kan nu logga in och boka evenemang, hantera ditt medlemskap och ta del av våra kurser.</p>
    <p><a href="${BASE_URL}/sv/logga-in" class="btn">Logga in</a></p>
    <p>Om du har frågor är du alltid välkommen att höra av dig till <a href="mailto:hello@yeshinnorbu.se">hello@yeshinnorbu.se</a>.</p>
    <p>Med vänliga hälsningar,<br>Yeshin Norbu Mind Training Centre</p>
  `);

  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: 'Välkommen till Yeshin Norbu',
    html,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  firstName: string,
  orderDetails: { item: string; amount: number; ref: string }
) {
  const html = baseTemplate(`
    <h1>Tack för din betalning!</h1>
    <p>Hej ${firstName},</p>
    <p>Vi har tagit emot din betalning. Här är en sammanfattning:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f9f7f4;">
        <td style="padding:12px;border:1px solid #eee;font-weight:bold;">Artikel</td>
        <td style="padding:12px;border:1px solid #eee;">${orderDetails.item}</td>
      </tr>
      <tr>
        <td style="padding:12px;border:1px solid #eee;font-weight:bold;">Belopp</td>
        <td style="padding:12px;border:1px solid #eee;">${orderDetails.amount.toLocaleString('sv-SE')} kr</td>
      </tr>
      <tr style="background:#f9f7f4;">
        <td style="padding:12px;border:1px solid #eee;font-weight:bold;">Referens</td>
        <td style="padding:12px;border:1px solid #eee;">${orderDetails.ref}</td>
      </tr>
    </table>
    <p>Har du frågor? Kontakta oss på <a href="mailto:hello@yeshinnorbu.se">hello@yeshinnorbu.se</a>.</p>
    <p>Vi ser fram emot att träffa dig!</p>
    <p>Med vänliga hälsningar,<br>Yeshin Norbu Mind Training Centre</p>
  `);

  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: `Bokningsbekräftelse – ${orderDetails.item}`,
    html,
  });
}

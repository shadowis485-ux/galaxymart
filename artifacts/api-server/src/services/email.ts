import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function sendOrderDelivery(email: string, order: any, stockItems: string[][]) {
  const transporter = getTransporter();
  if (!transporter) { console.log(`[EMAIL SKIPPED] Would deliver to ${email}`); return; }

  const itemsList = order.items.map((item: any, i: number) => {
    const keys = stockItems[i] || [];
    return `
      <div style="margin:12px 0; padding:12px; background:#111; border:1px solid #00ff4133; border-radius:8px;">
        <strong style="color:#00ff41">${item.name}</strong><br/>
        ${keys.map((k: string) => `<code style="color:#fff; display:block; font-size:14px; margin-top:6px">${k}</code>`).join('')}
      </div>
    `;
  }).join('');

  await transporter.sendMail({
    from: `DragonzStore <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your DragonzStore Order — ${order.id.slice(0,8)}`,
    html: `
      <div style="font-family:Inter,sans-serif; background:#050505; color:#fff; padding:32px; max-width:600px; margin:0 auto; border-radius:12px; border:1px solid #00ff4120;">
        <div style="text-align:center; margin-bottom:24px">
          <span style="font-size:40px">🐉</span>
          <h1 style="color:#00ff41; font-size:24px; margin:8px 0">Order Delivered!</h1>
          <p style="color:#888; margin:0">Your digital products are ready below</p>
        </div>
        <div style="background:#111; border:1px solid #00ff4115; border-radius:8px; padding:16px; margin-bottom:20px">
          <p style="color:#888; font-size:12px; margin:0 0 4px 0; text-transform:uppercase; letter-spacing:0.1em">Order ID</p>
          <p style="color:#fff; font-family:monospace; margin:0; font-size:13px">${order.id}</p>
        </div>
        ${itemsList}
        <p style="color:#555; font-size:12px; text-align:center; margin-top:24px">Thank you for shopping at DragonzStore · Powered by LTC</p>
      </div>
    `,
  });
}

export async function sendAdminNotification(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const transporter = getTransporter();
  if (!transporter || !adminEmail) return;

  await transporter.sendMail({
    from: `DragonzStore <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Order: $${order.total_amount?.toFixed(2)} — ${order.customer_email}`,
    text: `New confirmed order:\nID: ${order.id}\nCustomer: ${order.customer_email}\nAmount: $${order.total_amount?.toFixed(2)}\nItems: ${JSON.stringify(order.items)}`,
  });
}

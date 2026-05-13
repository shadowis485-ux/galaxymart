const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendOrderDelivery(customerEmail, order, stockItems) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email not configured, skipping delivery email');
    return;
  }

  const transporter = createTransporter();

  const itemsHtml = order.items.map((item, i) => `
    <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:8px;padding:16px;margin-bottom:12px;">
      <h3 style="color:#d4af37;margin:0 0 8px">${item.name}</h3>
      <p style="color:#aaa;margin:0">Quantity: ${item.quantity}</p>
      <p style="color:#aaa;margin:0">Price: $${item.price}</p>
      ${stockItems[i] ? `<div style="background:#0d0d0d;border:1px solid #d4af37;border-radius:4px;padding:12px;margin-top:8px;">
        <p style="color:#d4af37;font-weight:bold;margin:0">Your License Key:</p>
        ${stockItems[i].map(k => `<p style="color:#fff;font-family:monospace;margin:4px 0;">${k}</p>`).join('')}
      </div>` : ''}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="background:#0a0a0a;font-family:Arial,sans-serif;color:#fff;padding:32px;">
      <div style="max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#d4af37;font-size:28px;margin:0;">🐉 DragonzStore</h1>
          <p style="color:#aaa;margin:8px 0;">Order Confirmation & Delivery</p>
        </div>
        <div style="background:#111;border:1px solid #d4af37;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="color:#d4af37;margin:0 0 16px;">✅ Payment Confirmed!</h2>
          <p style="color:#ccc;">Thank you for your purchase. Here are your digital products:</p>
          <p style="color:#aaa;font-size:14px;">Order ID: <span style="color:#d4af37;">${order.id}</span></p>
        </div>
        ${itemsHtml}
        <div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;margin-top:24px;">
          <h3 style="color:#d4af37;margin:0 0 12px;">Order Summary</h3>
          <p style="color:#aaa;margin:4px 0;">Total Paid: <span style="color:#fff;font-weight:bold;">$${order.total_amount.toFixed(2)}</span></p>
          <p style="color:#aaa;margin:4px 0;">Payment Method: <span style="color:#fff;">Litecoin (LTC)</span></p>
        </div>
        <div style="text-align:center;margin-top:32px;color:#555;font-size:12px;">
          <p>DragonzStore — Premium Digital Products</p>
          <p>Having issues? Keep your order ID for support.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"DragonzStore" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `✅ Order Delivered - DragonzStore #${order.id.slice(0, 8)}`,
    html,
  });
}

async function sendAdminNotification(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"DragonzStore System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🐉 New Order - $${order.total_amount} - ${order.customer_email}`,
    html: `<pre style="background:#111;color:#d4af37;padding:16px;border-radius:8px;">${JSON.stringify(order, null, 2)}</pre>`,
  });
}

module.exports = { sendOrderDelivery, sendAdminNotification };

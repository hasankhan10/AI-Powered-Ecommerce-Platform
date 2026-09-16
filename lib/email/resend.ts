import { brandConfig } from '@/config/brand.config';

export interface OrderEmailItem {
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderEmailItem[];
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  } | null;
}

/**
 * Send luxury transactional order confirmation email via Resend API
 */
export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload
): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || `orders@${brandConfig.name.toLowerCase().replace(/\s+/g, '')}.in`;
  const formattedHtml = generateOrderConfirmationHtml(payload);

  if (apiKey && !apiKey.includes('placeholder') && !apiKey.includes('your-resend-api-key') && apiKey.trim().length > 10) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          from: `${brandConfig.name} <${fromEmail}>`,
          to: [payload.customerEmail],
          subject: `Your ${brandConfig.name} order ${payload.orderNumber} is confirmed`,
          html: formattedHtml,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Resend] Order confirmation email sent to ${payload.customerEmail} (ID: ${data.id})`);
        return { success: true, messageId: data.id };
      } else {
        console.warn('[Resend] API returned error:', data);
        return { success: false, error: data.message || 'Resend API error' };
      }
    } catch (err: any) {
      console.error('[Resend] Error dispatching email:', err);
      return { success: false, error: err.message };
    }
  }

  // Dev / Simulation mode when API key is not yet set in .env.local
  console.log(`\n============================================================`);
  console.log(`[RESEND SIMULATION] Order Confirmation Email`);
  console.log(`To: ${payload.customerEmail} (${payload.customerName})`);
  console.log(`Subject: Your ${brandConfig.name} order ${payload.orderNumber} is confirmed`);
  console.log(`Order Total: ${brandConfig.currency.symbol}${payload.total.toLocaleString()}`);
  console.log(`Items (${payload.items.length}):`);
  payload.items.forEach((it) => {
    console.log(`  • ${it.quantity}x ${it.name} (${it.size || 'OS'}, ${it.color || 'Natural'}) - ${brandConfig.currency.symbol}${it.price}`);
  });
  console.log(`============================================================\n`);

  return { success: true, simulated: true };
}

/**
 * Send a sample verification test email to verify credentials
 */
export async function sendTestEmail(recipientEmail: string): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  return sendOrderConfirmationEmail({
    orderNumber: 'MV-TEST-' + Math.floor(1000 + Math.random() * 9000),
    customerName: 'Valued Client',
    customerEmail: recipientEmail,
    subtotal: 7200,
    shipping: 0,
    tax: 0,
    total: 7200,
    items: [
      {
        name: 'Linen Cocoon Shirt',
        size: 'M',
        color: 'Natural',
        quantity: 1,
        price: 7200,
      },
    ],
    shippingAddress: {
      line1: '12 Alwarpet High Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600018',
      country: 'India',
    },
  });
}

function generateOrderConfirmationHtml(payload: OrderEmailPayload): string {
  const currencySymbol = brandConfig.currency.symbol;
  const itemsHtml = payload.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(27,21,18,0.1); font-family: 'Helvetica Neue', Arial, sans-serif;">
          <div style="font-weight: 500; color: #1B1512; font-size: 14px;">${item.name}</div>
          <div style="font-size: 12px; color: #7A7268; margin-top: 2px;">
            Size: ${item.size || 'OS'} · Color: ${item.color || 'Natural'} · Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid rgba(27,21,18,0.1); text-align: right; font-weight: 500; color: #1B1512; font-size: 14px; font-family: 'Helvetica Neue', Arial, sans-serif;">
          ${currencySymbol}${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  const addressHtml = payload.shippingAddress
    ? `
      <div style="margin-top: 24px; padding: 18px; background-color: #F8F5EE; border-left: 2px solid #B08D57;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #B08D57; font-weight: 600; margin-bottom: 6px;">Delivery Destination</div>
        <div style="font-size: 13px; color: #1B1512; line-height: 1.5; font-family: 'Helvetica Neue', Arial, sans-serif;">
          ${payload.shippingAddress.line1}${payload.shippingAddress.line2 ? ', ' + payload.shippingAddress.line2 : ''}<br/>
          ${payload.shippingAddress.city}, ${payload.shippingAddress.state} — ${payload.shippingAddress.pincode}<br/>
          ${payload.shippingAddress.country || 'India'}
        </div>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmed — ${brandConfig.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1B1512; font-family: 'Georgia', serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1B1512; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #EDE6D8; max-width: 600px; width: 100%; border: 1px solid rgba(242,236,224,0.14);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px; text-align: center; border-bottom: 1px solid rgba(27,21,18,0.1); background-color: #EDE6D8;">
              <div style="font-size: 24px; font-weight: 400; letter-spacing: 0.2em; color: #1B1512; text-transform: uppercase;">
                ${brandConfig.name}
              </div>
              <div style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #B08D57; margin-top: 6px; font-family: 'Helvetica Neue', Arial, sans-serif;">
                Order Confirmation
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <div style="font-size: 18px; color: #1B1512; font-weight: 400; margin-bottom: 12px;">
                Thank you for your order, ${payload.customerName}.
              </div>
              <div style="font-size: 13px; color: #5C554E; line-height: 1.6; font-family: 'Helvetica Neue', Arial, sans-serif; margin-bottom: 24px;">
                We are preparing your piece with mindful craft at our atelier. Your order reference is <strong style="color: #1B1512;">${payload.orderNumber}</strong>.
              </div>

              <!-- Items Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th align="left" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #7A7268; border-bottom: 2px solid rgba(27,21,18,0.15); font-family: 'Helvetica Neue', Arial, sans-serif;">Item</th>
                    <th align="right" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #7A7268; border-bottom: 2px solid rgba(27,21,18,0.15); font-family: 'Helvetica Neue', Arial, sans-serif;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Summary -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #5C554E;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; color: #1B1512;">${currencySymbol}${payload.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Complimentary Shipping</td>
                  <td align="right" style="padding: 4px 0; color: #1B1512;">${currencySymbol}0</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: 600; color: #1B1512; border-top: 1px solid rgba(27,21,18,0.15);">Total</td>
                  <td align="right" style="padding: 10px 0 0 0; font-size: 15px; font-weight: 600; color: #1B1512; border-top: 1px solid rgba(27,21,18,0.15);">${currencySymbol}${payload.total.toLocaleString()}</td>
                </tr>
              </table>

              ${addressHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #14100D; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #A39B8F; line-height: 1.6;">
              ${brandConfig.name} · ${brandConfig.contact.address}<br/>
              Questions? Contact our concierge at <a href="mailto:${brandConfig.contact.email}" style="color: #B08D57; text-decoration: none;">${brandConfig.contact.email}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

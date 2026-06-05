import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = 'contactus@iwrapny.com';
const BRAND_ORANGE = '#f27024';
const BRAND_DARK = '#0f172a';

function buildEmailHtml({ name, phone, email, contact_pref, quote_summary, quote_breakdown }) {
  // Parse breakdown lines: "Label | $X–$Y | Label2 | +$Z | Total | $X–$Y"
  const breakdownRows = quote_breakdown
    ? quote_breakdown.split(' | ').reduce((rows, val, i, arr) => {
        if (i % 2 === 0) rows.push({ label: val.trim(), amount: (arr[i + 1] || '').trim() });
        return rows;
      }, [])
    : [];

  // Parse summary: "Year Make Model Variant — coverage — $X–$Y"
  const summaryParts = quote_summary ? quote_summary.split(' — ') : [];
  const vehicleStr = summaryParts[0] || '';
  const coverageStr = summaryParts[1] || '';
  const priceStr = summaryParts[2] || '';

  const contactPrefLabel = {
    phone: '📞 Phone call',
    email: '✉️ Email',
    either: 'Either works',
  }[contact_pref] || contact_pref || '—';

  const breakdownTableRows = breakdownRows.map(({ label, amount }, i) => {
    const isTotal = label.toLowerCase().includes('total');
    const bg = isTotal ? '#f4f5f7' : '#ffffff';
    const fw = isTotal ? '700' : '400';
    const border = isTotal ? `border-top: 2px solid #e5e7eb;` : '';
    return `
      <tr style="background:${bg}; ${border}">
        <td style="padding:10px 16px; font-weight:${fw}; color:${BRAND_DARK}; font-size:14px;">${label}</td>
        <td style="padding:10px 16px; font-weight:${fw}; color:${BRAND_DARK}; font-size:14px; text-align:right;">${amount}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Wrap Quote — iWrap NY</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND_ORANGE};border-radius:12px 12px 0 0;padding:28px 32px;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.8);">New quote request</p>
            <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">iWrap NY</h1>
          </td>
        </tr>

        <!-- Vehicle + price hero -->
        <tr>
          <td style="background:#ffffff;padding:28px 32px 20px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${coverageStr}</p>
            <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:${BRAND_DARK};">${vehicleStr}</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;border-radius:10px;">
              <tr>
                <td style="padding:20px 24px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Estimated price range</p>
                  <p style="margin:0;font-size:32px;font-weight:800;color:${BRAND_DARK};letter-spacing:-0.02em;">${priceStr}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Breakdown table -->
        ${breakdownTableRows ? `
        <tr>
          <td style="background:#ffffff;padding:0 32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              ${breakdownTableRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- Divider -->
        <tr>
          <td style="background:#ffffff;padding:0 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:4px 0 24px;"/>
          </td>
        </tr>

        <!-- Customer details -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 14px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;">Customer</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 16px 4px 0;font-size:13px;color:#94a3b8;font-weight:600;white-space:nowrap;">Name</td>
                <td style="padding:4px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">${name || '—'}</td>
              </tr>
              <tr>
                <td style="padding:4px 16px 4px 0;font-size:13px;color:#94a3b8;font-weight:600;white-space:nowrap;">Email</td>
                <td style="padding:4px 0;font-size:14px;color:${BRAND_DARK};">
                  <a href="mailto:${email}" style="color:${BRAND_ORANGE};text-decoration:none;">${email || '—'}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 16px 4px 0;font-size:13px;color:#94a3b8;font-weight:600;white-space:nowrap;">Phone</td>
                <td style="padding:4px 0;font-size:14px;color:${BRAND_DARK};">
                  ${phone ? `<a href="tel:${phone}" style="color:${BRAND_ORANGE};text-decoration:none;">${phone}</a>` : '—'}
                </td>
              </tr>
              <tr>
                <td style="padding:4px 16px 4px 0;font-size:13px;color:#94a3b8;font-weight:600;white-space:nowrap;">Follow up by</td>
                <td style="padding:4px 0;font-size:14px;color:${BRAND_DARK};">${contactPrefLabel}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BRAND_DARK};border-radius:0 0 12px 12px;padding:18px 32px;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);text-align:center;">
              Submitted via the iWrap NY quote tool · <a href="https://iwrapny.com" style="color:${BRAND_ORANGE};text-decoration:none;">iwrapny.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, contact_pref, quote_summary, quote_breakdown } = req.body;

  if (!email || !quote_summary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'iWrap NY Quotes <quotes@iwrapny.com>',
      to: [RECIPIENT],
      reply_to: email,
      subject: `New wrap quote — ${quote_summary.split(' — ')[0]}`,
      html: buildEmailHtml({ name, phone, email, contact_pref, quote_summary, quote_breakdown }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

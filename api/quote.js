import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = 'contactus@iwrapny.com';
const BRAND_ORANGE = '#f27024';
const BRAND_DARK = '#0f172a';
const LOGO_URL = 'https://iwrap-calculator.vercel.app/logo.png';

function parseQuote(quote_summary, quote_breakdown) {
  const summaryParts = quote_summary ? quote_summary.split(' — ') : [];
  const vehicleStr = summaryParts[0] || '';
  const coverageStr = summaryParts[1] || '';
  const priceStr = summaryParts[2] || '';
  const breakdownRows = quote_breakdown
    ? quote_breakdown.split(' | ').reduce((rows, val, i, arr) => {
        if (i % 2 === 0) rows.push({ label: val.trim(), amount: (arr[i + 1] || '').trim() });
        return rows;
      }, [])
    : [];
  return { vehicleStr, coverageStr, priceStr, breakdownRows };
}

function breakdownTable(breakdownRows) {
  return breakdownRows.map(({ label, amount }) => {
    const isTotal = label.toLowerCase().includes('total');
    const bg = isTotal ? '#f4f5f7' : '#ffffff';
    const fw = isTotal ? '700' : '400';
    const border = isTotal ? 'border-top:2px solid #e5e7eb;' : '';
    return `<tr style="background:${bg};${border}">
      <td style="padding:10px 16px;font-weight:${fw};color:${BRAND_DARK};font-size:14px;">${label}</td>
      <td style="padding:10px 16px;font-weight:${fw};color:${BRAND_DARK};font-size:14px;text-align:right;">${amount}</td>
    </tr>`;
  }).join('');
}

// Email to iWrap NY (full details including customer info)
function buildBusinessEmail({ name, phone, email, contact_pref, quote_summary, quote_breakdown }) {
  const { vehicleStr, coverageStr, priceStr, breakdownRows } = parseQuote(quote_summary, quote_breakdown);
  const contactPrefLabel = { phone: '📞 Phone call', email: '✉️ Email', either: 'Either works' }[contact_pref] || contact_pref || '—';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Quote Request — iWrap NY</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- Header -->
    <tr><td style="background:${BRAND_DARK};padding:28px 36px 24px;text-align:center;">
      <img src="${LOGO_URL}" alt="iWrap NY" width="130" style="display:block;margin:0 auto 16px;height:auto;"/>
      <span style="display:inline-block;background:${BRAND_ORANGE};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:5px 14px;border-radius:20px;">New Quote Request</span>
    </td></tr>

    <!-- Vehicle + price hero -->
    <tr><td style="background:#ffffff;padding:32px 36px 24px;">
      ${coverageStr ? `<p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">${coverageStr}</p>` : ''}
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${BRAND_DARK};letter-spacing:-0.01em;">${vehicleStr}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
        <tr><td style="padding:22px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Estimated Total (incl. tax)</p>
          <p style="margin:0;font-size:36px;font-weight:900;color:${BRAND_ORANGE};letter-spacing:-0.02em;">${priceStr}</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Breakdown -->
    ${breakdownRows.length ? `<tr><td style="background:#ffffff;padding:0 36px 28px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Price Breakdown</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">${breakdownTable(breakdownRows)}</table>
    </td></tr>` : ''}

    <!-- Divider -->
    <tr><td style="background:#ffffff;padding:0 36px;">
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 24px;"/>
    </td></tr>

    <!-- Customer info -->
    <tr><td style="background:#ffffff;padding:0 36px 36px;">
      <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Customer Details</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:7px 14px 7px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Name</td>
          <td style="padding:7px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">${name || '—'}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 14px 7px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Email</td>
          <td style="padding:7px 0;font-size:14px;"><a href="mailto:${email}" style="color:${BRAND_ORANGE};text-decoration:none;font-weight:600;">${email || '—'}</a></td>
        </tr>
        <tr>
          <td style="padding:7px 14px 7px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Phone</td>
          <td style="padding:7px 0;font-size:14px;">${phone ? `<a href="tel:${phone}" style="color:${BRAND_ORANGE};text-decoration:none;font-weight:600;">${phone}</a>` : '—'}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:7px 14px 7px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Follow-up</td>
          <td style="padding:7px 0;font-size:14px;color:${BRAND_DARK};">${contactPrefLabel}</td>
        </tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:${BRAND_DARK};padding:24px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:center;padding-bottom:10px;">
          <a href="https://iwrapny.com" style="color:${BRAND_ORANGE};text-decoration:none;font-size:13px;font-weight:700;">iwrapny.com</a>
          &nbsp;<span style="color:rgba(255,255,255,0.2);">|</span>&nbsp;
          <a href="tel:+16312122329" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;">+1 (631) 212-2329</a>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:10px;">
          <a href="https://maps.google.com/?q=657+Old+Willets+Path,+Hauppauge,+NY+11788" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:12px;">
            📍 657 Old Willets Path, Hauppauge, NY 11788
          </a>
        </td></tr>
        <tr><td style="text-align:center;">
          <a href="https://share.google/zlBaKDD6WTBxsieMd" style="color:rgba(255,255,255,0.4);text-decoration:none;font-size:12px;">⭐ See our Google reviews</a>
        </td></tr>
      </table>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;
}

// Confirmation email to the customer
function buildCustomerEmail({ name, quote_summary, quote_breakdown }) {
  const { vehicleStr, coverageStr, priceStr, breakdownRows } = parseQuote(quote_summary, quote_breakdown);
  const firstName = (name || 'there').split(' ')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your iWrap NY Wrap Estimate</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- Header with logo -->
    <tr><td style="background:${BRAND_DARK};padding:32px 36px 28px;text-align:center;">
      <img src="${LOGO_URL}" alt="iWrap NY" width="140" style="display:block;margin:0 auto 18px;height:auto;"/>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);font-weight:500;letter-spacing:0.02em;">Your Wrap Estimate</p>
    </td></tr>

    <!-- Greeting -->
    <tr><td style="background:#ffffff;padding:32px 36px 8px;">
      <p style="margin:0;font-size:16px;color:${BRAND_DARK};line-height:1.7;">
        Hi <strong>${firstName}</strong>,<br><br>
        Thanks for reaching out to iWrap NY! Here's a summary of your wrap estimate based on the details you provided. One of our team members will be in touch shortly to discuss next steps.
      </p>
    </td></tr>

    <!-- Vehicle + price hero -->
    <tr><td style="background:#ffffff;padding:24px 36px;">
      ${coverageStr ? `<p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">${coverageStr}</p>` : ''}
      <h2 style="margin:0 0 18px;font-size:22px;font-weight:800;color:${BRAND_DARK};letter-spacing:-0.01em;">${vehicleStr}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${BRAND_ORANGE} 0%,#d65a18 100%);border-radius:12px;">
        <tr><td style="padding:26px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Your Estimated Total (incl. tax)</p>
          <p style="margin:0;font-size:38px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${priceStr}</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Breakdown -->
    ${breakdownRows.length ? `<tr><td style="background:#ffffff;padding:0 36px 28px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Price Breakdown</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">${breakdownTable(breakdownRows)}</table>
    </td></tr>` : ''}

    <!-- Fine print -->
    <tr><td style="background:#f8fafc;padding:22px 36px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
        📋 &nbsp;This is an <strong style="color:${BRAND_DARK};">estimate</strong> — final pricing is confirmed after a quick in-person vehicle walk-through.
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
        💬 &nbsp;Questions? Reply to this email or call us directly — we're happy to help.
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:${BRAND_DARK};padding:24px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:center;padding-bottom:10px;">
          <a href="https://iwrapny.com" style="color:${BRAND_ORANGE};text-decoration:none;font-size:13px;font-weight:700;">iwrapny.com</a>
          &nbsp;<span style="color:rgba(255,255,255,0.2);">|</span>&nbsp;
          <a href="tel:+16312122329" style="color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;">+1 (631) 212-2329</a>
        </td></tr>
        <tr><td style="text-align:center;padding-bottom:10px;">
          <a href="https://maps.google.com/?q=657+Old+Willets+Path,+Hauppauge,+NY+11788" style="color:rgba(255,255,255,0.5);text-decoration:none;font-size:12px;">
            📍 657 Old Willets Path, Hauppauge, NY 11788
          </a>
        </td></tr>
        <tr><td style="text-align:center;">
          <a href="https://share.google/zlBaKDD6WTBxsieMd" style="color:rgba(255,255,255,0.4);text-decoration:none;font-size:12px;">⭐ See our Google reviews</a>
        </td></tr>
      </table>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, contact_pref, quote_summary, quote_breakdown, marketing_consent } = req.body;
  const hasConsent = marketing_consent === 'on' || marketing_consent === 'true' || marketing_consent === true;

  if (!email || !quote_summary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Add to Klaviyo
  async function syncToKlaviyo() {
    if (!process.env.KLAVIYO_API_KEY) return;
    const { vehicleStr, coverageStr, priceStr } = parseQuote(quote_summary, quote_breakdown);
    const [firstName, ...rest] = (name || '').trim().split(' ');

    // Normalize phone to E.164 format (+1XXXXXXXXXX)
    let formattedPhone;
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) formattedPhone = `+1${digits}`;
      else if (digits.length === 11 && digits.startsWith('1')) formattedPhone = `+${digits}`;
      else formattedPhone = `+${digits}`;
    }

    const headers = {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
      'Content-Type': 'application/json',
      'revision': '2024-02-15',
    };
    try {
      // 1. Create or update the profile
      const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: {
              email,
              first_name: firstName || '',
              last_name: rest.join(' ') || '',
              phone_number: formattedPhone || undefined,
              properties: {
                vehicle: vehicleStr,
                coverage: coverageStr,
                quote_range: priceStr,
                contact_preference: contact_pref,
                source: 'iWrap NY Quote Calculator',
              },
            },
          },
        }),
      });
      const profileData = await profileRes.json();
      const profileId = profileData?.data?.id;

      // 2. Add profile to Quote Leads list only if they consented
      if (profileId && hasConsent) {
        await fetch(`https://a.klaviyo.com/api/lists/UguvA9/relationships/profiles/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: [{ type: 'profile', id: profileId }],
          }),
        });
      }
    } catch (e) {
      console.error('Klaviyo sync error:', e);
    }
  }

  try {
    // Send emails + sync to Klaviyo in parallel
    await Promise.all([
      syncToKlaviyo(),
      // 1. Business notification to iWrap NY
      resend.emails.send({
        from: 'iWrap NY Quotes <contactus@iwrapny.com>',
        to: [RECIPIENT],
        reply_to: email,
        subject: `New wrap quote — ${quote_summary.split(' — ')[0]}`,
        html: buildBusinessEmail({ name, phone, email, contact_pref, quote_summary, quote_breakdown }),
      }),
      // 2. Confirmation to the customer
      resend.emails.send({
        from: 'iWrap NY <contactus@iwrapny.com>',
        to: [email],
        subject: `Your iWrap NY wrap estimate — ${quote_summary.split(' — ')[0]}`,
        html: buildCustomerEmail({ name, quote_summary, quote_breakdown }),
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

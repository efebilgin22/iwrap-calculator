import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = 'contactus@iwrapny.com';
const BRAND_ORANGE = '#f27024';
const BRAND_DARK = '#0f172a';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, project_type, message, photo_urls } = req.body;

  if (!email || !name || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const photoSection = photo_urls && photo_urls.length > 0
    ? `<tr><td style="background:#ffffff;padding:0 36px 28px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Vehicle Photos (${photo_urls.length})</p>
        <table cellpadding="0" cellspacing="0"><tr>
          ${photo_urls.map(url => `<td style="padding:0 8px 0 0;">
            <img src="${url}" width="150" style="border-radius:8px;border:1px solid #e5e7eb;display:block;" />
          </td>`).join('')}
        </tr></table>
      </td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Contact Request — iWrap NY</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <tr><td style="background:${BRAND_DARK};padding:28px 36px 24px;text-align:center;">
      <span style="display:inline-block;background:${BRAND_ORANGE};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:5px 14px;border-radius:20px;">New Contact Request</span>
    </td></tr>

    <tr><td style="background:#ffffff;padding:28px 36px 20px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:8px 14px 8px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;width:110px;">Name</td>
          <td style="padding:8px 0;font-size:14px;color:${BRAND_DARK};font-weight:600;">${name}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:8px 14px 8px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Email</td>
          <td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:${BRAND_ORANGE};text-decoration:none;font-weight:600;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 14px 8px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Phone</td>
          <td style="padding:8px 0;font-size:14px;">${phone ? `<a href="tel:${phone}" style="color:${BRAND_ORANGE};text-decoration:none;font-weight:600;">${phone}</a>` : '—'}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:8px 14px 8px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Project Type</td>
          <td style="padding:8px 0;font-size:14px;color:${BRAND_DARK};">${project_type || '—'}</td>
        </tr>
        <tr>
          <td style="padding:8px 14px 8px 0;font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;vertical-align:top;">Message</td>
          <td style="padding:8px 0;font-size:14px;color:${BRAND_DARK};line-height:1.6;">${message.replace(/\n/g, '<br/>')}</td>
        </tr>
      </table>
    </td></tr>

    ${photoSection}

    <tr><td style="background:${BRAND_DARK};padding:20px 36px;text-align:center;">
      <a href="mailto:${email}" style="color:${BRAND_ORANGE};text-decoration:none;font-size:13px;font-weight:700;">Reply to ${name}</a>
      &nbsp;<span style="color:rgba(255,255,255,0.2);">|</span>&nbsp;
      <a href="tel:+16312122329" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;">+1 (631) 212-2329</a>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  async function syncToKlaviyo() {
    if (!process.env.KLAVIYO_API_KEY) return;
    const [firstName, ...rest] = (name || '').trim().split(' ');
    let formattedPhone;
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 10) formattedPhone = `+1${digits}`;
      else if (digits.length === 11 && digits.startsWith('1')) formattedPhone = `+${digits}`;
    }
    const headers = {
      'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
      'Content-Type': 'application/json',
      'revision': '2024-02-15',
    };
    const profileAttributes = {
      email,
      first_name: firstName || '',
      last_name: rest.join(' ') || '',
      ...(formattedPhone && { phone_number: formattedPhone }),
      properties: {
        source: 'iWrap NY Contact Form',
        project_type: project_type || '',
        message: message,
      },
    };
    try {
      let profileId;
      const createRes = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST', headers,
        body: JSON.stringify({ data: { type: 'profile', attributes: profileAttributes } }),
      });
      if (createRes.status === 201) {
        profileId = (await createRes.json())?.data?.id;
      } else if (createRes.status === 409) {
        const conflict = await createRes.json();
        profileId = conflict?.errors?.[0]?.meta?.duplicate_profile_id;
        if (profileId) {
          await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
            method: 'PATCH', headers,
            body: JSON.stringify({ data: { type: 'profile', id: profileId, attributes: profileAttributes } }),
          });
        }
      }
      // Add to Quote Leads list
      if (profileId) {
        await fetch(`https://a.klaviyo.com/api/lists/UguvA9/relationships/profiles/`, {
          method: 'POST', headers,
          body: JSON.stringify({ data: [{ type: 'profile', id: profileId }] }),
        });
      }
    } catch (e) {
      console.error('Klaviyo sync error:', e);
    }
  }

  try {
    await Promise.all([
      syncToKlaviyo(),
      resend.emails.send({
        from: 'iWrap NY Contact <contactus@iwrapny.com>',
        to: [RECIPIENT],
        reply_to: email,
        subject: `New contact request from ${name}${project_type ? ' — ' + project_type : ''}`,
        html,
      }),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

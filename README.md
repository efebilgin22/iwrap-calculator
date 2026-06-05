# iWrap NY — Vehicle Wrap Quote Tool

Single-page price calculator. Customer picks year/make/model + coverage and gets an instant price range based on per-sq-ft pricing. Email lead capture after pricing shows.

## Files

- `index.html` — the whole app (HTML/CSS/JS in one file)
- `vehicles.js` — vehicle database with sq-ft per vehicle (6,000+ vehicles, includes variants for Sprinter/Transit/ProMaster body configs)

That's it. No build step, no dependencies.

## Pricing formula

Each coverage type uses its own formula.

**Full wrap**
```
sqft       = vehicle.vinyl (minus Panel F roof if "no roof" toggled)
design_fee = $400 if "I need design" else $0
low_price  = sqft × $10 + design_fee
high_price = sqft × $12 + design_fee
```

**Partial / half wrap**
```
sqft       = (vehicle.vinyl − Panel F roof) × 0.5
design_fee = $400 if "I need design" else $0
low_price  = sqft × $10 + design_fee
high_price = sqft × $12 + design_fee
```

**Lettering / decals**
```
logo_fee   = $0 (vector) | $100 (raster, needs vectorizing) | $250 (no logo, needs design)
low_price  = $499 + logo_fee
high_price = $1,499 + logo_fee
```
Lettering is a flat range regardless of vehicle size (small jobs vs full commercial lettering package). No $400 design fee — replaced by the per-logo fee.

## Tunable constants in `index.html`

```js
const RATE_LOW = 10;
const RATE_HIGH = 12;
const DESIGN_FEE = 400;
const LETTERING_LOW = 499;
const LETTERING_HIGH = 1499;
const LOGO_FEES = { vector: 0, raster: 100, none: 250 };
const PARTIAL_MULT = 0.5;
```

Roof toggle: only appears for full wrap; subtracts "Panel F" sq ft when "No" is selected. Partial implicitly excludes roof in its formula. Lettering never includes roof.

## Wire up email capture

Right now the form is stubbed — it logs to the browser console and shows a fake "Thanks" message. Pick one option below to actually receive leads.

### Option A — Formspree (easiest, no code)
1. Sign up at formspree.io, create a new form, copy the form ID.
2. In `index.html`, find the `leadForm` submit handler. Replace the stub `await new Promise(...)` block with:
   ```js
   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     method: 'POST',
     headers: { 'Accept': 'application/json' },
     body: new FormData(e.target),
   });
   if (!res.ok) throw new Error('failed');
   ```

### Option B — Web3Forms (no signup, free)
1. Get an access key at web3forms.com.
2. Add `<input type="hidden" name="access_key" value="YOUR_KEY" />` inside the `<form>`.
3. Replace the stub with:
   ```js
   const res = await fetch('https://api.web3forms.com/submit', {
     method: 'POST', body: new FormData(e.target),
   });
   if (!res.ok) throw new Error('failed');
   ```

### Option C — Your own backend (Resend, SendGrid, etc.)
POST the form data to your endpoint and call your email API server-side.

## Deploy

Any static host works since there's no backend.

- **Vercel / Netlify** — drag-and-drop the folder. Free tier is plenty.
- **GitHub Pages** — push the folder to a repo, enable Pages.
- **Your existing host** — upload `index.html` + `vehicles.js` via FTP to a `/quote/` directory.

## Embed in WordPress (iwrapny.com)

After deploying to a URL like `https://quote.iwrapny.com` or `https://iwrap-quote.vercel.app`:

1. Create a new page in WordPress (e.g. `/quote`).
2. Add a Custom HTML block with:
   ```html
   <iframe
     src="https://YOUR-DEPLOYED-URL"
     style="width:100%; height:1100px; border:0;"
     loading="lazy">
   </iframe>
   ```
3. Adjust the height if the form gets cut off.

For a tighter integration (auto-resize iframe), use a postMessage handler — ask if you want me to add it.

## Updating vehicle data

`vehicles.js` is auto-generated from the PrintWise PDF. If you need to add vehicles or tweak sq-ft figures, edit the `vinyl` field on a vehicle entry. Schema per entry:

```
{ year, make, model, variant, vinyl, ... }
```

Only `vinyl` is used for pricing.

## Brand colors

Defined as CSS variables at the top of `index.html`:

- `--accent: #ff4a2b` (orange-red) — change this to your iWrap NY brand color.
- `--bg`, `--surface`, `--surface-2`, `--border` — dark theme palette.

For a light theme, swap `--bg` to white, `--text` to dark, etc.

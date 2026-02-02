'use client';

import React, { useEffect, useState } from 'react';

export default function SetupWizardPage() {
  const [preflight, setPreflight] = useState<any>(null);
  const [stripeInfo, setStripeInfo] = useState<any>(null);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await fetch('/admin/setup/preflight');
        if (p.status === 401) {
          setAuthRequired(true);
        } else if (p.ok) {
          setPreflight(await p.json());
        }
      } catch (e) {
        // ignore network errors
      }

      try {
        const s = await fetch('/admin/setup/stripe');
        if (s.status === 401) {
          setAuthRequired(true);
        } else if (s.ok) {
          setStripeInfo(await s.json());
        }
      } catch (e) {
        // ignore
      }
    }

    load();
  }, []);

  const envTemplate = `# Care2system environment template (fill values locally)
STRIPE_SECRET_KEY=REPLACE_WITH_SK_xxx
STRIPE_PUBLISHABLE_KEY=REPLACE_WITH_PK_xxx
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_WHSEC_xxx

# Server settings
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email (example)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASSWORD=your-smtp-password
`;

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate);
      alert('Template copied to clipboard');
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = envTemplate;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Template copied to clipboard');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Credential Setup Wizard (No Secrets Stored)</h1>

      {authRequired && (
        <div style={{ marginBottom: 16, color: '#a00' }}>
          This page can show live checks only when you are authenticated as a system admin.
          Use the system admin panel to generate a short-lived token.
        </div>
      )}

      <section style={{ marginBottom: 20 }}>
        <h2>Preflight</h2>
        {preflight ? (
          <pre style={{ background: '#f7f7f7', padding: 12 }}>{JSON.stringify(preflight, null, 2)}</pre>
        ) : (
          <div>Preflight info unavailable (requires admin auth or server offline)</div>
        )}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Stripe Check</h2>
        {stripeInfo ? (
          <pre style={{ background: '#f7f7f7', padding: 12 }}>{JSON.stringify(stripeInfo, null, 2)}</pre>
        ) : (
          <div>Stripe presence info unavailable (requires admin auth)</div>
        )}
      </section>

      <section>
        <h2>Copyable `.env` Template</h2>
        <p>This generator never reads or returns secrets — it only provides a fill-in template you can copy into your local `.env`.</p>
        <textarea readOnly value={envTemplate} cols={80} rows={12} style={{ display: 'block', marginBottom: 8 }} />
        <button onClick={copyTemplate}>Copy Template</button>
      </section>
    </div>
  );
}

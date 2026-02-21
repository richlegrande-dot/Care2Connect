import { execSync, spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

function checkStripeCli(): boolean {
  try {
    execSync('stripe --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function promptYesNo(question: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<boolean>((resolve) => {
    rl.question(question + ' (y/N): ', (ans) => {
      rl.close();
      resolve(/^y(es)?$/i.test(ans));
    });
  });
}

function writeEnvLocal(key: string, value: string) {
  const envPath = path.resolve(process.cwd(), '../.env');
  if (!fs.existsSync(envPath)) return false;
  let content = fs.readFileSync(envPath, 'utf-8');
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf-8');
  return true;
}

async function run() {
  console.log('Stripe webhook bootstrap helper');
  if (!checkStripeCli()) {
    console.error('\nstripe CLI not found. Install: https://stripe.com/docs/stripe-cli\n');
    console.error('After install, run: npm run stripe:webhook:bootstrap');
    process.exit(2);
  }

  console.log('Starting `stripe listen --forward-to http://localhost:3001/api/payments/stripe-webhook`');
  const proc = spawn('stripe', ['listen', '--forward-to', 'http://localhost:3001/api/payments/stripe-webhook'], { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.stdout.on('data', (chunk) => {
    const s = String(chunk);
    process.stdout.write(s);
    // Try to capture whsec_ line
    const m = s.match(/Your webhook signing secret is:\s*(whsec_[0-9a-zA-Z_\-]+)/i);
    if (m && m[1]) {
      console.log('\nCaptured webhook secret:', m[1]);
      (async () => {
        const ok = await promptYesNo('Write STRIPE_WEBHOOK_SECRET to backend/.env now?');
        if (ok) {
          const wrote = writeEnvLocal('STRIPE_WEBHOOK_SECRET', m[1]);
          console.log(wrote ? 'Updated backend/.env' : 'Could not update backend/.env');
          process.exit(0);
        } else {
          console.log('Not writing to .env. You can copy the secret manually.');
          process.exit(0);
        }
      })();
    }
  });

  proc.stderr.on('data', (d) => process.stderr.write(String(d)));
  proc.on('close', (code) => process.exit(code ?? 0));
}

run().catch((e) => { console.error(e); process.exit(1); });

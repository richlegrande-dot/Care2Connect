# Go-Live: No DB / No SMTP Mode

This repository supports running the core product flow without a database or SMTP server.

Key points:
- FileStore mode persists records under `backend/data/` as JSONL or individual JSON files.
- Stripe checkout and webhook flows work independently of DB/SMTP. Webhooks are persisted to disk.
- Admin/system panel supports session tokens when `JWT_SECRET` is not configured.

Follow the README and `backend/.env.example` to set local values. Do NOT commit secrets.

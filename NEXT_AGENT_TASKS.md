Deliverable for Next Agent
=================================

Care2system: Exit “degraded” state by resolving EVTS model + Stripe config (local-only, no secrets)

Problem recap

Local backend is reachable at http://localhost:3002/health/status and reports ok:true but “degraded” with:

EVTS_MODEL_MISSING

STRIPE_KEYS_MISSING

An EVTS installer script exists (install-evts-model.ts) supporting disabled | local_path | url. Repo now has a root .gitignore and .env.example guidance. ALLOW_SYSTEM_COMMANDS=false by default.

Constraints

Do not commit, print, or paste any real secrets (Stripe keys/webhook secrets) or model binaries into the repo or chat/logs.

Do not enable ALLOW_SYSTEM_COMMANDS=true without explicit user permission.

Keep changes local developer-targeted (e.g., .env local only).

This plan is tasks + verification only (no commands/scripts/implementation details).

A) Task List (what the next agent must do)
1) Confirm current health + determine what “configured” means in code

Inspect /health/status JSON structure and confirm where:

degradedReasons is produced

services.evtsModel.available is computed

services.stripe.configured is computed

Identify which environment variables (or config files) the server uses to decide:

EVTS model presence/availability

Stripe configured state (what keys/values are required in this repo’s current implementation)

Output of this task: a short map of “required inputs → health fields affected” (no secrets).

2) EVTS model: align configuration with an actual model present on disk

Determine expected EVTS mode (disabled/local_path/url) and how it is read.

Determine expected model path/filename(s) used by the server to mark available=true.

Ensure a model file is present and readable at the expected location or ensure EVTS is pointed to a user-supplied local file path.

Validate that the server detects it at runtime (without requiring system-level downloads unless the user explicitly approves).

Output of this task: EVTS becomes recognized by the server and health reflects availability.

3) Stripe configuration: mark Stripe as “configured” using local env only

Determine which Stripe settings are required by this repo to flip services.stripe.configured=true

(e.g., secret key only vs secret+publishable vs webhook secret too)

Implement a strictly local configuration workflow:

.env is used locally

.env.example remains placeholders/guidance only

ensure nothing is committed or logged

Output of this task: Stripe status flips to configured without leaking secrets.

4) Guardrails: ensure no secrets can accidentally enter version control

Confirm repo-level .gitignore blocks .env and any local secret files.

Confirm docs instruct users to store keys in environment variable stores (not committed).

Add/verify a lightweight check that prevents common secret patterns from being written into tracked files (documentation-level or local-only checks are acceptable; do not add heavy CI changes unless requested).

Output of this task: working tree stays clean; no secrets in git.

5) Restart/refresh behavior verification (no silent caching issues)

Ensure configuration changes are applied after restart (some systems load env only once).

Confirm that health status changes immediately reflect EVTS and Stripe being configured.

Output of this task: consistent results across restarts.

B) Verification Checklist (how to confirm success)
Health endpoint checks (primary)

Visit: http://localhost:3002/health/status

Confirm:

degradedReasons does not include EVTS_MODEL_MISSING

degradedReasons does not include STRIPE_KEYS_MISSING

services.evtsModel.available === true

services.stripe.configured === true

Confirm server still reachable at:

http://localhost:3002/health/status

“No secrets in repo” checks (required)

git status shows no tracked secret additions (especially .env)

Verify .env is untracked and ignored

Search repository (tracked files only) for common Stripe secret prefixes (do not print results containing secrets; only report “found/not found”):

sk_, pk_, whsec_

Confirm .env.example contains placeholders only and never includes real key values.

Runtime behavior check (secondary)

Confirm EVTS is recognized by the service (health shows available)

Confirm Stripe-dependent routes/features report as configured (but do not require a live payment to prove it unless user requests)

C) Explicit Human Prompt (required inputs/approvals)

To the human developer (you):

EVTS model

Do you want to:

Option A: Provide a local EVTS model file you already have (recommended), or

Option B: Approve the project downloading the model from a URL (requires your explicit approval; may also require enabling downloads for local dev)?

Stripe configuration

Please provide your Stripe test/developer keyset via your local environment variable store (not committed).

Confirm whether you want Stripe configured as “checkout enabled” (may require publishable key) or server-only configured (may only require secret key depending on code).

System commands

Keep ALLOW_SYSTEM_COMMANDS=false (safe default), or do you explicitly approve temporarily enabling it for local dev only to run helper checks/downloads?

Important: Do not paste secrets into chat; provide them locally in your .env or platform env store.

D) Completion Criteria (what “done” means)

The agent is finished only when:

/health/status no longer lists EVTS/Stripe missing reasons

EVTS model is detected (available:true)

Stripe shows configured (configured:true)

No secrets are committed or printed

Server remains reachable on http://localhost:3002/health/status

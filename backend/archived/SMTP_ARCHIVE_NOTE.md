This archive contains removed SMTP-related configuration and validation logic.

Files and logic removed from the active codebase:
- SMTP environment variable checks from health monitoring and integrity validation
- Mailto fallback paths and UI guidance

If you need to restore SMTP support, review the git history or this archive and reintroduce
the previously removed checks and templates.

NOTE: SMTP functionality has been intentionally removed. Support tickets are handled via
the support log under `data/support-tickets` and surfaced in the admin health pages.

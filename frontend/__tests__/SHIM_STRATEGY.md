## Why these shims exist

Tests under `__tests__` were written using relative imports like `../lib/api-client` or `../features/...` but Jest resolves relative imports from the test file's location. That caused imports to point into `frontend/__tests__/lib/...` and `frontend/__tests__/features/...`, which did not exist and produced "Cannot find module" errors.

## Quick fix

To unblock the Jest suite quickly we add minimal CommonJS shim files under the paths the tests are mistakenly importing from. Each shim simply re-exports the real module from `frontend/lib` or `frontend/features`.

## Created shims

- `__tests__/lib/api-client.js` → `module.exports = require('../../lib/api-client')`
- `__tests__/features/profile/ProfileCard.js` → `module.exports = require('../../../features/profile/ProfileCard')`
- `__tests__/features/audio/AudioRecorder.js` → `module.exports = require('../../../features/audio/AudioRecorder')`

## How to remove these later (recommended cleanup)

1. Prefer updating tests to use absolute aliases (e.g., `@/lib/api-client` or `@/features/profile/ProfileCard`).
2. Ensure `jest.config.js` has `moduleNameMapper` entries for `@/` aliases (Next/Jest usually configures this).
3. Replace relative imports in tests to use the alias and remove the shims.

## Generator

`scripts/create-test-shims.js` creates the above shims from a hardcoded mapping. Run `npm run test:shims` to regenerate or add new mappings.

## Notes

- These shims are intentionally simple re-exports (no logic). They are temporary and should be removed after tests are migrated to canonical imports.
- We intentionally did not touch Stripe or SMTP configuration as requested.

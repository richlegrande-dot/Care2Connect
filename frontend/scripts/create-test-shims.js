const fs = require('fs')
const path = require('path')

// Hardcoded mapping of missing import -> real module path (relative from shim file)
// Edit this list if you need to add more shims later.
const mappings = [
  { missing: '__tests__/lib/api-client.js', target: '../../lib/api-client' },
  { missing: '__tests__/features/profile/ProfileCard.js', target: '../../../features/profile/ProfileCard' },
  { missing: '__tests__/features/audio/AudioRecorder.js', target: '../../../features/audio/AudioRecorder' },
]

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
}

for (const m of mappings) {
  const shimPath = path.join(process.cwd(), m.missing)
  ensureDir(shimPath)
  const content = `// Auto-generated shim for tests\nmodule.exports = require('${m.target}')\n`
  fs.writeFileSync(shimPath, content, 'utf8')
  console.log('Created shim:', shimPath)
}

console.log('Shims created.')

/**
 * Root postinstall: generate Prisma client when backend tooling is present.
 * Cloudflare Pages / production installs may omit devDependencies — skip cleanly.
 */
const { spawnSync } = require('child_process')

const result = spawnSync(
  'npm',
  ['run', 'prisma:generate', '-w', 'backend'],
  { stdio: 'inherit', shell: true },
)

if (result.status !== 0) {
  console.warn(
    'postinstall: prisma generate skipped (install Nest/Prisma for API builds, or set Pages Root Directory to frontend).',
  )
}

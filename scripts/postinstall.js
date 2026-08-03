/**
 * Root postinstall: generate Prisma client when backend tooling is present.
 * Skip entirely on frontend-only hosts (Vercel / Cloudflare Pages).
 */
const { spawnSync } = require('child_process')

if (process.env.VERCEL || process.env.CF_PAGES) {
  console.log('postinstall: skipped on frontend host (VERCEL/CF_PAGES).')
  process.exit(0)
}

const result = spawnSync(
  'npm',
  ['run', 'prisma:generate', '-w', 'backend'],
  { stdio: 'inherit', shell: true },
)

if (result.status !== 0) {
  console.warn(
    'postinstall: prisma generate skipped (devDependencies missing or Prisma not installed).',
  )
}

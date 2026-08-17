/**
 * Root postinstall: generate Prisma client when backend tooling is present.
 * Skip entirely on frontend-only hosts (Vercel / Cloudflare Pages).
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

if (process.env.VERCEL || process.env.CF_PAGES) {
  console.log('postinstall: skipped on frontend host (VERCEL/CF_PAGES).')
  process.exit(0)
}

const gitDir = path.join(__dirname, '..', '.git')
const hooksPath = path.join(__dirname, '..', '.githooks')
if (fs.existsSync(gitDir) && fs.existsSync(hooksPath)) {
  const hook = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
    stdio: 'ignore',
    shell: true,
  })
  if (hook.status === 0) {
    console.log('postinstall: git hooksPath set to .githooks')
  }
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

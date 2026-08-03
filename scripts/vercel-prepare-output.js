/**
 * Vercel looks for a root `dist/` folder. Vite may emit to `frontend/dist`
 * or `dist` depending on cwd — normalize to root `dist`.
 */
const fs = require('fs')
const path = require('path')

const candidates = ['frontend/dist', 'dist'].map((p) => path.resolve(p))
const src = candidates.find((p) => fs.existsSync(path.join(p, 'index.html')))

if (!src) {
  console.error(
    'vercel-prepare-output: no index.html in frontend/dist or dist',
  )
  console.error('cwd=', process.cwd())
  try {
    console.error('listing=', fs.readdirSync(process.cwd()))
    if (fs.existsSync('frontend')) {
      console.error('frontend/=', fs.readdirSync('frontend'))
    }
  } catch {
    /* ignore */
  }
  process.exit(1)
}

const dest = path.resolve('dist')
if (src === dest) {
  console.log('vercel-prepare-output: already at dist/')
  process.exit(0)
}

fs.rmSync(dest, { recursive: true, force: true })
fs.cpSync(src, dest, { recursive: true })
console.log(`vercel-prepare-output: copied ${src} -> ${dest}`)

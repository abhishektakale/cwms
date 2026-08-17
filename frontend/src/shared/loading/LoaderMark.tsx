import markSvg from '../../assets/brand/cwms-mark.svg?raw'

type Group = 'base' | 'frame' | 'city' | 'crane'

function classify(d: string): Group {
  if (d.startsWith('M211 3 L19')) return 'frame'
  if (d.startsWith('M3 336 L13')) return 'base'
  if (d.startsWith('M347.67 140') || d.startsWith('M360.67 211')) return 'crane'
  return 'city'
}

/** Group the live brand mark so the loader animates site, frame, skyline, and crane. */
export function groupBrandMark(svg: string): string {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 435.67 488.67'
  const paths = svg.match(/<path\b[^>]*\/>/g) ?? []
  const groups: Record<Group, string[]> = {
    base: [],
    frame: [],
    city: [],
    crane: [],
  }
  for (const path of paths) {
    const d = path.match(/\bd="([^"]*)"/)?.[1] ?? ''
    groups[classify(d)].push(path)
  }
  const body = (['base', 'frame', 'city', 'crane'] as const)
    .map((key) => `<g class="loader-mark__${key}">${groups[key].join('')}</g>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" class="loader-scene" aria-hidden="true">${body}</svg>`
}

export function LoaderMark() {
  return (
    <span
      className="loader-scene-wrap"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: groupBrandMark(markSvg) }}
    />
  )
}

import markSvg from './cwms-mark-loader.svg?raw'

/** Inlined brand mark so the skyline, crane, and site can animate. */
export function LoaderMark() {
  return (
    <span
      className="loader-scene-wrap"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markSvg }}
    />
  )
}

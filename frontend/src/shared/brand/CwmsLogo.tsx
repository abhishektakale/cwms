import type { ImgHTMLAttributes } from 'react'
import logoColor from '../../assets/brand/cwms-logo.svg'
import logoReverse from '../../assets/brand/cwms-logo-reverse.svg'
import logoHorizontal from '../../assets/brand/cwms-logo-horizontal.svg'
import logoHorizontalReverse from '../../assets/brand/cwms-logo-horizontal-reverse.svg'
import markColor from '../../assets/brand/cwms-mark.svg'
import markReverse from '../../assets/brand/cwms-mark-reverse.svg'

type Variant = 'color' | 'reverse'
type Layout = 'mark' | 'horizontal' | 'stacked'

type CwmsLogoProps = ImgHTMLAttributes<HTMLImageElement> & {
  variant?: Variant
  layout?: Layout
}

const ASSETS: Record<Layout, Record<Variant, string>> = {
  stacked: {
    color: logoColor,
    reverse: logoReverse,
  },
  horizontal: {
    color: logoHorizontal,
    reverse: logoHorizontalReverse,
  },
  mark: {
    color: markColor,
    reverse: markReverse,
  },
}

const ALT: Record<Layout, string> = {
  stacked: 'CWMS — Construction Work Management System',
  horizontal: 'CWMS — Construction Work Management System',
  mark: 'CWMS',
}

export function CwmsLogo({
  variant = 'color',
  layout = 'horizontal',
  className,
  alt,
  ...rest
}: CwmsLogoProps) {
  const hidden = rest['aria-hidden'] === true || rest['aria-hidden'] === 'true'
  return (
    <img
      src={ASSETS[layout][variant]}
      alt={alt ?? (hidden ? '' : ALT[layout])}
      className={className}
      draggable={false}
      {...rest}
    />
  )
}

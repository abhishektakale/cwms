import type { ImgHTMLAttributes } from 'react'
import { CwmsLogo } from './CwmsLogo'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  variant?: 'color' | 'reverse'
}

export function CwmsMark({ variant = 'color', ...rest }: Props) {
  return <CwmsLogo variant={variant} layout="mark" {...rest} />
}

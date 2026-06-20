import { useTheme } from 'next-themes'
import { useMounted } from '@/shared/lib/use-mounted'
import { cn } from '@/shared/lib/cn'

const LOGO_SRC = {
  'on-light': '/logo/tintolab_Logo_Black_72dpi.jpg',
  'on-dark': '/logo/tintolab_Logo_White_72dpi.png',
} as const

export type BrandLogoVariant = keyof typeof LOGO_SRC
export type BrandLogoSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<BrandLogoSize, string> = {
  sm: 'h-5',
  md: 'h-7',
  lg: 'h-9',
}

interface BrandLogoProps {
  variant?: BrandLogoVariant
  size?: BrandLogoSize
  className?: string
}

export function BrandLogo({ variant, size = 'md', className }: BrandLogoProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()

  const resolvedVariant = variant ?? (mounted && resolvedTheme === 'dark' ? 'on-dark' : 'on-light')

  return (
    <img
      src={LOGO_SRC[resolvedVariant]}
      alt="tinto lab"
      className={cn('w-auto max-w-full object-contain object-left', SIZE_CLASSES[size], className)}
    />
  )
}

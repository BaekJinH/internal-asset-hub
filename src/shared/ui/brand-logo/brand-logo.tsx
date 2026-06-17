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

export function BrandLogo({ variant = 'on-light', size = 'md', className }: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC[variant]}
      alt="tinto lab"
      className={cn('w-auto max-w-full object-contain object-left', SIZE_CLASSES[size], className)}
    />
  )
}

import {
  Bot,
  ClipboardList,
  Code2,
  Image,
  MessageSquare,
  Package,
  Palette,
} from 'lucide-react'
import type { AssetCategory } from '@/entities/asset/model/asset-types'
import { cn } from '@/shared/lib/cn'

interface AssetCategoryIconProps {
  category: AssetCategory
  className?: string
}

export function AssetCategoryIcon({ category, className }: AssetCategoryIconProps) {
  const iconClassName = cn('h-4 w-4', className)

  switch (category) {
    case 'planning':
      return <ClipboardList className={iconClassName} aria-hidden />
    case 'design':
      return <Palette className={iconClassName} aria-hidden />
    case 'development':
      return <Code2 className={iconClassName} aria-hidden />
    case 'meeting':
      return <MessageSquare className={iconClassName} aria-hidden />
    case 'media':
      return <Image className={iconClassName} aria-hidden />
    case 'ai-output':
      return <Bot className={iconClassName} aria-hidden />
    case 'delivery':
      return <Package className={iconClassName} aria-hidden />
    default:
      return <ClipboardList className={iconClassName} aria-hidden />
  }
}

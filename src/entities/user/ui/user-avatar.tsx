import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

interface UserAvatarProps {
  name: string
  avatarUrl?: string
  className?: string
}

function getInitials(name: string) {
  return name.trim().slice(0, 1)
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const showImage = Boolean(avatarUrl) && !hasImageError

  return (
    <Avatar className={cn('size-9', className)}>
      {showImage ? (
        <AvatarImage
          src={avatarUrl}
          alt={name}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      )}
    </Avatar>
  )
}

interface UserAvatarProps {
  name: string
  avatarUrl?: string
}

export function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full" />
  }

  return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">{name.slice(0, 1)}</span>
}

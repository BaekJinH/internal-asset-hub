import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Search } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { AssetCategoryIcon } from '@/entities/asset/ui/asset-category-icon'
import { AssetStatusBadge } from '@/entities/asset'
import type { Project } from '@/entities/project'
import { APP_ROUTES } from '@/shared/config/routes'
import { useKeyboardShortcut } from '@/shared/lib/use-keyboard-shortcut'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/command'
import { Kbd } from '@/shared/ui/tooltip'

interface SearchCommandPaletteProps {
  assets: Asset[]
  projects: Project[]
  onSelectAsset?: (assetId: string) => void
}

export function SearchCommandPalette({ assets, projects, onSelectAsset }: SearchCommandPaletteProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const sortedAssets = useMemo(
    () => [...assets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12),
    [assets],
  )
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8),
    [projects],
  )

  useKeyboardShortcut('k', () => setOpen(true))

  const handleAssetSelect = (assetId: string) => {
    setOpen(false)
    if (onSelectAsset) {
      onSelectAsset(assetId)
      return
    }

    navigate(APP_ROUTES.assetDetail.replace(':assetId', assetId))
  }

  const handleProjectSelect = (projectId: string) => {
    setOpen(false)
    navigate(APP_ROUTES.projectDetail.replace(':projectId', projectId))
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden h-9 gap-2 text-muted-foreground sm:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden md:inline">빠른 검색</span>
        <span className="inline md:hidden">검색</span>
        <Kbd className="hidden lg:inline-flex">⌘K</Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="자산, 프로젝트, 태그로 검색…" />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
          <CommandGroup heading="자산">
            {sortedAssets.map((asset) => (
              <CommandItem
                key={asset.id}
                value={`${asset.name} ${asset.projectName} ${asset.tags.join(' ')}`}
                onSelect={() => handleAssetSelect(asset.id)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <AssetCategoryIcon category={asset.category} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{asset.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{asset.projectName}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {asset.extension ? (
                    <Badge tone="default" className="font-mono text-[10px] uppercase">
                      {asset.extension}
                    </Badge>
                  ) : null}
                  <AssetStatusBadge status={asset.status} />
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="프로젝트">
            {sortedProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.name} ${project.description}`}
                onSelect={() => handleProjectSelect(project.id)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                  <FolderKanban className="size-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{project.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{project.owner}</span>
                </span>
                <CommandShortcut>프로젝트</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

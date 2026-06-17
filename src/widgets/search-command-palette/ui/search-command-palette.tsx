import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Search } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { AssetCategoryIcon } from '@/entities/asset/ui/asset-category-icon'
import type { Project } from '@/entities/project'
import { APP_ROUTES } from '@/shared/config/routes'
import { useKeyboardShortcut } from '@/shared/lib/use-keyboard-shortcut'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-border/80 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        빠른 검색
        <Kbd>⌘K</Kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="자산, 프로젝트 검색…" />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
          <CommandGroup heading="자산">
            {sortedAssets.map((asset) => (
              <CommandItem key={asset.id} value={`${asset.name} ${asset.projectName} ${asset.tags.join(' ')}`} onSelect={() => handleAssetSelect(asset.id)}>
                <AssetCategoryIcon category={asset.category} className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{asset.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{asset.projectName}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="프로젝트">
            {sortedProjects.map((project) => (
              <CommandItem key={project.id} value={`${project.name} ${project.description}`} onSelect={() => handleProjectSelect(project.id)}>
                <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{project.owner}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

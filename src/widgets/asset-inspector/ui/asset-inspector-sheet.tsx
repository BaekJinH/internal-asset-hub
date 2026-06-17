import type { Asset } from '@/entities/asset'
import { AssetInspectorContent } from '@/widgets/asset-inspector/ui/asset-inspector-content'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet'

interface AssetInspectorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset
  relatedAssets?: Asset[]
}

export function AssetInspectorSheet({ open, onOpenChange, asset, relatedAssets = [] }: AssetInspectorSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] gap-0 p-0 [&>button]:top-3.5">
        <SheetTitle className="sr-only">{asset ? `${asset.name} 상세 정보` : '자산 상세 정보'}</SheetTitle>
        <SheetDescription className="sr-only">선택한 자산의 메타데이터와 빠른 작업</SheetDescription>
        <div className="flex justify-center border-b border-border/80 py-3 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-border" aria-hidden />
        </div>
        {asset ? (
          <AssetInspectorContent asset={asset} relatedAssets={relatedAssets} scrollClassName="max-h-[75vh]" />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">선택된 자산이 없습니다.</p>
        )}
      </SheetContent>
    </Sheet>
  )
}

import { useState } from 'react'
import { X } from 'lucide-react'
import { useTagInput } from '@/features/tag-input/model/use-tag-input'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Tag } from '@/shared/ui/tag'

interface TagInputProps {
  initialTags?: string[]
  onChange?: (tags: string[]) => void
}

export function TagInput({ initialTags, onChange }: TagInputProps) {
  const [value, setValue] = useState('')
  const { tags, addTag, removeTag } = useTagInput(initialTags)

  const handleAddTag = () => {
    addTag(value.trim())
    onChange?.([...tags, value.trim()].filter(Boolean))
    setValue('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="태그 입력" />
        <Button type="button" variant="secondary" onClick={handleAddTag}>
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="inline-flex items-center gap-1"
          >
            <Tag>
              #{tag}
              <X size={12} />
            </Tag>
          </button>
        ))}
      </div>
    </div>
  )
}

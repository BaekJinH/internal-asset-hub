import { useState } from 'react'

export function useTagInput(initialTags: string[] = []) {
  const [tags, setTags] = useState(initialTags)

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags((currentTags) => [...currentTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setTags((currentTags) => currentTags.filter((item) => item !== tag))
  }

  return { tags, addTag, removeTag }
}

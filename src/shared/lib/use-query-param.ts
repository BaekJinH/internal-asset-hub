import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAllowedQueryValue } from '@/shared/lib/query-param-validators'

type SetQueryParamOptions = {
  replace?: boolean
}

export function useQueryParam(
  key: string,
  defaultValue = '',
): [string, (value: string, options?: SetQueryParamOptions) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const value = searchParams.get(key) ?? defaultValue

  const setValue = useCallback(
    (next: string, options?: SetQueryParamOptions) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          const normalized = next.trim()
          if (!normalized || normalized === defaultValue) {
            params.delete(key)
          } else {
            params.set(key, normalized)
          }
          return params
        },
        { replace: options?.replace ?? true },
      )
    },
    [key, defaultValue, setSearchParams],
  )

  return [value, setValue]
}

export function useQueryParamEnum<T extends string>(
  key: string,
  defaultValue: T,
  allowed: readonly T[],
): [T, (value: T) => void] {
  const [raw, setRaw] = useQueryParam(key, defaultValue)

  const value = useMemo(() => {
    if (isAllowedQueryValue(raw, allowed)) return raw
    return defaultValue
  }, [raw, allowed, defaultValue])

  const setValue = useCallback(
    (next: T) => {
      setRaw(next === defaultValue ? '' : next)
    },
    [setRaw, defaultValue],
  )

  return [value, setValue]
}

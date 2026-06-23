import type { NotionProjectRow, NotionVerifyResult } from '../types.js'
import { parseGithubFullName } from './parse-github-url.js'

const NOTION_VERSION = '2022-06-28'

interface NotionRichText {
  plain_text: string
}

interface NotionProperty {
  id: string
  type: string
  title?: Array<NotionRichText>
  url?: string | null
  rich_text?: Array<NotionRichText>
}

interface NotionDatabase {
  title: Array<NotionRichText>
  properties: Record<string, NotionProperty>
}

interface NotionPage {
  id: string
  properties: Record<string, NotionProperty>
}

function notionHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

function getPlainTitle(properties: Record<string, NotionProperty>): string {
  for (const prop of Object.values(properties)) {
    if (prop.type === 'title' && prop.title?.length) {
      return prop.title.map((t) => t.plain_text).join('')
    }
  }
  return 'Untitled'
}

function getGithubRepoUrl(properties: Record<string, NotionProperty>): string | undefined {
  for (const [name, prop] of Object.entries(properties)) {
    const lower = name.toLowerCase()
    if (prop.type === 'url' && prop.url && (lower.includes('github') || lower.includes('repo'))) {
      return prop.url
    }
  }

  for (const prop of Object.values(properties)) {
    if (prop.type === 'url' && prop.url && parseGithubFullName(prop.url)) {
      return prop.url
    }
  }

  return undefined
}

function toNotionPageUrl(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`
}

async function notionFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      ...notionHeaders(token),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string }
    throw new Error(body.message ?? body.code ?? `Notion API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function verifyNotionConnection(
  token: string,
  databaseId: string,
): Promise<NotionVerifyResult> {
  if (!token) {
    return { ok: false, error: 'NOTION_TOKEN이 설정되지 않았습니다.', step: 'token' }
  }

  if (!databaseId) {
    return { ok: false, error: 'NOTION_PROJECTS_DATABASE_ID가 필요합니다.', step: 'databaseId' }
  }

  try {
    const me = await notionFetch<{ name?: string; type?: string }>(token, '/users/me')

    const database = await notionFetch<NotionDatabase>(
      token,
      `/databases/${databaseId.replace(/-/g, '')}`,
    )

    const databaseTitle = database.title.map((t) => t.plain_text).join('') || 'Untitled'
    const propertyNames = Object.keys(database.properties)

    const query = await notionFetch<{ results: NotionPage[]; has_more: boolean }>(
      token,
      `/databases/${databaseId.replace(/-/g, '')}/query`,
      {
        method: 'POST',
        body: JSON.stringify({ page_size: 100 }),
      },
    )

    const rows = query.results.map((page) => {
      const title = getPlainTitle(page.properties)
      const githubRepoUrl = getGithubRepoUrl(page.properties)
      return {
        pageId: page.id,
        title,
        githubRepoUrl,
        notionUrl: toNotionPageUrl(page.id),
      }
    })

    return {
      ok: true,
      integrationName: me.name ?? me.type,
      databaseTitle,
      propertyNames,
      rowCount: rows.length,
      sampleRow: rows[0],
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Notion 연결 확인 실패',
      step: 'api',
    }
  }
}

export async function fetchNotionProjectRows(
  token: string,
  databaseId: string,
): Promise<NotionProjectRow[]> {
  const normalizedId = databaseId.replace(/-/g, '')
  const rows: NotionProjectRow[] = []
  let cursor: string | undefined

  do {
    const body: { page_size: number; start_cursor?: string } = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const query = await notionFetch<{
      results: NotionPage[]
      has_more: boolean
      next_cursor: string | null
    }>(token, `/databases/${normalizedId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    for (const page of query.results) {
      rows.push({
        pageId: page.id,
        title: getPlainTitle(page.properties),
        notionUrl: toNotionPageUrl(page.id),
        githubRepoUrl: getGithubRepoUrl(page.properties),
      })
    }

    cursor = query.has_more ? (query.next_cursor ?? undefined) : undefined
  } while (cursor)

  return rows
}

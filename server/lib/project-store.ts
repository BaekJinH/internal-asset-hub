import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Project } from '../types.js'
import { seedProjects } from './seed-projects.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DATA_FILE = join(DATA_DIR, 'projects.json')

let cache: Project[] | null = null

function ensureDataFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seedProjects, null, 2), 'utf-8')
  }
}

function loadFromDisk(): Project[] {
  ensureDataFile()
  const raw = readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as Project[]
}

function persist(projects: Project[]): void {
  ensureDataFile()
  writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
  cache = projects
}

export const projectStore = {
  getAll(): Project[] {
    if (!cache) {
      cache = loadFromDisk()
    }
    return [...cache]
  },

  saveAll(projects: Project[]): Project[] {
    persist(projects)
    return [...projects]
  },

  saveOne(project: Project): Project {
    const projects = this.getAll()
    const idx = projects.findIndex((p) => p.id === project.id)
    const saved = { ...project, updatedAt: project.updatedAt ?? new Date().toISOString() }
    if (idx >= 0) projects[idx] = saved
    else projects.push(saved)
    persist(projects)
    return saved
  },

  findByGithubFullName(fullName: string): Project | undefined {
    const normalized = fullName.toLowerCase()
    return this.getAll().find(
      (p) => p.externalIds?.githubRepoFullName?.toLowerCase() === normalized,
    )
  },
}

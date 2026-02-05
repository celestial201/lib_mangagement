import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface Member {
  id: string
  name: string
  email: string
  cardNumber: string
  tier: 'standard' | 'premium'
  joinedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json')

function generateCardNumber(): string {
  const prefix = 'LIB'
  const random = Math.floor(100000000 + Math.random() * 900000000).toString()
  return `${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8)}`
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

async function loadMembers(): Promise<Member[]> {
  try {
    await ensureDataDir()
    if (existsSync(MEMBERS_FILE)) {
      const data = await readFile(MEMBERS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return []
}

async function saveMembers(members: Member[]) {
  await ensureDataDir()
  await writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2))
}

export async function createMember(data: { name: string; email: string }): Promise<Member> {
  const members = await loadMembers()
  const existing = members.find((m) => m.email.toLowerCase() === data.email.toLowerCase())
  if (existing) {
    throw new Error('A membership already exists with this email address.')
  }

  const member: Member = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    cardNumber: generateCardNumber(),
    tier: 'standard',
    joinedAt: new Date().toISOString(),
  }

  members.push(member)
  await saveMembers(members)
  return member
}

export async function getMemberByCardNumber(cardNumber: string): Promise<Member | null> {
  const members = await loadMembers()
  const normalized = cardNumber.replace(/\s/g, '').toUpperCase()
  return members.find((m) => m.cardNumber.replace(/-/g, '') === normalized.replace(/-/g, '')) ?? null
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const members = await loadMembers()
  return members.find((m) => m.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function deleteMemberByEmail(email: string): Promise<boolean> {
  const members = await loadMembers()
  const normalized = email.toLowerCase()
  const remaining = members.filter((m) => m.email.toLowerCase() !== normalized)

  if (remaining.length === members.length) {
    return false
  }

  await saveMembers(remaining)
  return true
}

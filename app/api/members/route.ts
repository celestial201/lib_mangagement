import { createMember, getMemberByCardNumber } from '@/lib/members'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const member = await createMember({ name: name.trim(), email: email.trim() })
    return NextResponse.json(member)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create membership'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cardNumber = searchParams.get('cardNumber')

  if (!cardNumber) {
    return NextResponse.json(
      { error: 'cardNumber query parameter is required' },
      { status: 400 }
    )
  }

  const member = await getMemberByCardNumber(cardNumber)
  if (!member) {
    return NextResponse.json(
      { error: 'Library card not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(member)
}

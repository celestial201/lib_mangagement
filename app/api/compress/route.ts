import { compressContext } from '@/lib/scaledown'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { context, prompt, rate = 'auto' } = body

    if (!context || !prompt) {
      return NextResponse.json(
        { error: 'context and prompt are required' },
        { status: 400 }
      )
    }

    const compressed = await compressContext(context, prompt, rate)
    return NextResponse.json({ compressed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compression failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

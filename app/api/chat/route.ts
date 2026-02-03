import { convertToModelMessages, UIMessage } from 'ai'
import { compressContext } from '@/lib/scaledown'

export const maxDuration = 30

const systemPrompt = `You are a knowledgeable and friendly library assistant. Your expertise includes:

- Book recommendations across all genres (fiction, non-fiction, classics, contemporary, etc.)
- Author information and their notable works
- Literary analysis and book summaries
- Reading suggestions based on user preferences, mood, or interests
- Library services and general reading guidance
- Book club discussion questions
- Information about literary awards and bestsellers

Guidelines:
- Be warm, welcoming, and enthusiastic about books and reading
- Provide thoughtful, personalized recommendations
- Ask clarifying questions to better understand user preferences
- Share interesting facts about books and authors when relevant
- Suggest similar books or authors when making recommendations
- Be helpful with research and finding specific information
- Keep responses concise but informative

Remember: You're here to help readers discover their next great book and foster a love of reading!`

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY is not configured. Add it to your .env file.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let messages: UIMessage[]
  try {
    const body = await req.json()
    messages = body.messages ?? body
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required and must not be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let convertedMessages
  try {
    convertedMessages = await convertToModelMessages(messages)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to convert messages'
    return new Response(
      JSON.stringify({ error: `Message conversion failed: ${msg}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const formatContent = (m: (typeof convertedMessages)[0]) =>
    typeof m.content === 'string'
      ? m.content
      : m.content.map((p) => ('text' in p ? p.text : '')).join('')

  let groqMessages: { role: string; content: string }[]

  // Use ScaleDown to compress context when we have conversation history
  if (
    process.env.SCALEDOWN_API_KEY &&
    convertedMessages.length > 2
  ) {
    const lastMessage = convertedMessages[convertedMessages.length - 1]
    const lastContent = formatContent(lastMessage)
    const contextMessages = [
      { role: 'system', content: systemPrompt },
      ...convertedMessages.slice(0, -1),
    ]
    const context = contextMessages
      .map((m) => `${m.role}: ${formatContent(m)}`)
      .join('\n\n')

    try {
      const compressedContext = await compressContext(context, lastContent)
      groqMessages = [
        { role: 'system', content: compressedContext },
        { role: lastMessage.role, content: lastContent },
      ]
    } catch {
      // Fallback to full context if ScaleDown fails
      groqMessages = [
        { role: 'system', content: systemPrompt },
        ...convertedMessages.map((m) => ({ role: m.role, content: formatContent(m) })),
      ]
    }
  } else {
    groqMessages = [
      { role: 'system', content: systemPrompt },
      ...convertedMessages.map((m) => ({ role: m.role, content: formatContent(m) })),
    ]
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return new Response(JSON.stringify({ error }), { status: response.status })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''
      let messageId = crypto.randomUUID()

      // Send initial message start
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'start', messageId })}\n\n`)
      )

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n\n`)
              )
              continue
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', textDelta: content })}\n\n`)
                )
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

const SCALEDOWN_API_URL = 'https://api.scaledown.xyz/compress/raw/'

export interface CompressRequest {
  context: string
  prompt: string
  scaledown: {
    rate: string
  }
}

export interface CompressResponse {
  compressed?: string
  result?: string
  output?: string
  content?: string
  [key: string]: unknown
}

/**
 * Compresses context using the ScaleDown API for token optimization
 */
export async function compressContext(
  context: string,
  prompt: string,
  rate: 'auto' | string = 'auto'
): Promise<string> {
  const apiKey = process.env.SCALEDOWN_API_KEY
  if (!apiKey) {
    throw new Error('SCALEDOWN_API_KEY is not configured')
  }

  const payload: CompressRequest = {
    context,
    prompt,
    scaledown: { rate },
  }

  const response = await fetch(SCALEDOWN_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ScaleDown API error (${response.status}): ${error}`)
  }

  const result: CompressResponse = await response.json()

  // Handle various response formats
  const compressed =
    result.compressed ?? result.result ?? result.output ?? result.content
  if (typeof compressed === 'string') {
    return compressed
  }

  throw new Error('ScaleDown API returned unexpected response format')
}

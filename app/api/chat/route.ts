import { groq } from '@ai-sdk/groq'
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai'
import type { UIMessage } from 'ai'
import { buildEventContext } from '@/lib/ai/context'

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()
    const instructions = await buildEventContext()

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      instructions,
      messages: await convertToModelMessages(messages),
    })

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar mensagem' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

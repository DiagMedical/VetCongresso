import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { buildEventContext } from '@/lib/ai/context'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const system = await buildEventContext()

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system,
      messages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar mensagem' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

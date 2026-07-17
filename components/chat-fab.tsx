'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageCircle, Send, Bot, X, Sparkles } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PERGUNTAS_SUGERIDAS = [
  'Como cadastrar um novo lead?',
  'Como criar um deal no pipeline?',
  'O que significa pipeline ponderado?',
  'Como enviar WhatsApp para um lead?',
]

export function ChatFab() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestion = useCallback((text: string) => {
    sendMessage({ text })
  }, [sendMessage])

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 animate-glow"
            aria-label="Abrir chat de ajuda"
          >
            <MessageCircle className="size-6" />
          </button>
        }
      />
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <span className="text-sm font-medium">Assistente DiagnosticCRM</span>
          </div>
          <SheetClose
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Fechar chat">
                <X className="size-4" />
              </Button>
            }
          />
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
          role="log"
          aria-label="Mensagens do chat"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-4">
              <div>
                <Bot className="mb-3 size-12 text-primary/40" />
                <p className="text-sm">
                  Pergunte sobre as palestras, horários, ou como se inscrever!
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {PERGUNTAS_SUGERIDAS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted hover:border-primary/30 hover:text-foreground transition-all disabled:opacity-50"
                  >
                    <Sparkles className="size-3 text-primary/60" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 text-foreground'
                  )}
                >
                  {m.parts?.map((p, i) => (
                    <span key={i}>{p.type === 'text' ? p.text : ''}</span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="animate-pulse rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    Pensando...
                  </div>
                </div>
              )}
            {status === 'error' && error && (
              <div className="flex justify-center">
                <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                  Assistente temporariamente indisponível. Tente novamente mais tarde.
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-border p-4"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre o evento..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensagem"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

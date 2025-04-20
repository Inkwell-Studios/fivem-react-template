import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react'
import { useNui } from './providers/NuiProvider'
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { useEventListener } from './hooks/useEventListener'
import { makeElementDraggable } from './hooks/useDraggable'
import { useRateLimit } from './hooks/useRateLimit'
import { selectVisible, useNuiSelector } from './stores/nui'

interface Action {
  id: string
  label: string
  variant: 'primary' | 'secondary' | 'danger'
  shortcut: string
}

const ACTIONS: Action[] = [
  { id: 'action1', label: 'Primary Action', variant: 'primary', shortcut: 'P' },
  { id: 'action2', label: 'Secondary Action', variant: 'secondary', shortcut: 'S' },
  { id: 'action3', label: 'Danger Action', variant: 'danger', shortcut: 'D' }
]

export default function App() {
  const { sendMessage, hideFrame } = useNui()
  const visible = useNuiSelector(selectVisible)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Rate limit setup for primary action (2 seconds)
  const {
    isRateLimited: isPrimaryActionLimited,
    performAction: performPrimaryAction,
    rateLimitMessage: primaryActionMessage
  } = useRateLimit('primaryAction', 2000)

  // Make the card draggable once it's mounted
  useEffect(() => {
    if (visible && cardRef.current) {
      // Make the card draggable by its header
      const cleanup = makeElementDraggable(cardRef.current, '.card-header')
      return cleanup
    }
  }, [visible])

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent | KeyboardEventInit) => {
    const key = 'key' in e ? e.key : (e as any).key
    const action = ACTIONS.find(a => a.shortcut.toLowerCase() === key?.toLowerCase())
    if (action) {
      const message = `${action.label} was triggered by keyboard (${action.shortcut})`
      setLastAction(message)
      sendMessage('buttonClicked', { message })
    }
  }, [sendMessage])

  // Register keyboard event listener
  useEventListener('keypress', handleKeyPress)

  // Register ESC key listener
  useEventListener('keydown', (e: KeyboardEvent | KeyboardEventInit) => {
    const key = 'key' in e ? e.key : (e as any).key
    if (key === 'Escape') {
      hideFrame()
    }
  })

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/25">
      <Card
        ref={cardRef}
        className="w-full max-w-md animate-in fade-in-0 zoom-in-95"
      >
        <CardHeader className="card-header cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              FiveM React UI
            </h1>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-white/80">
            <p className="text-sm">
              This is a sophisticated example of a FiveM NUI using React and Tailwind CSS.
              Try the different actions below or use keyboard shortcuts.
            </p>
          </div>

          <div className="grid gap-3">
            {ACTIONS.map(({ id, label, variant, shortcut }) => {
              // Special handling for primary action to apply rate limit
              if (id === 'action1') {
                return (
                  <Button
                    key={id}
                    variant={variant}
                    disabled={isPrimaryActionLimited}
                    onClick={() => {
                      // Use the performAction wrapper from the hook
                      performPrimaryAction(() => {
                        const message = `${label} was clicked!`
                        setLastAction(message)
                      })
                    }}
                  >
                    <span>{label}</span>
                    <span className="ml-2 text-xs opacity-50">
                      {isPrimaryActionLimited ? 'On Cooldown' : `[${shortcut}]`}
                    </span>
                  </Button>
                )
              }

              // Default rendering for other buttons
              return (
                <Button
                  key={id}
                  variant={variant}
                  onClick={() => {
                    const message = `${label} was clicked!`
                    setLastAction(message)
                    sendMessage('buttonClicked', { message })
                  }}
                >
                  <span>{label}</span>
                  <span className="ml-2 text-xs opacity-50">[{shortcut}]</span>
                </Button>
              )
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 min-h-[44px] flex items-center">
            <p className="text-sm text-white/80">
              {primaryActionMessage ? (
                <span className="text-yellow-400">{primaryActionMessage}</span>
              ) : lastAction ? (
                `Last Action: ${lastAction}`
              ) : (
                <span className="opacity-60">No actions performed yet.</span>
              )}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={hideFrame}
          >
            Close UI
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-xs text-white/50">
              Press ESC to exit
            </p>
            <p className="text-xs text-white/50">
              Drag header to move
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 
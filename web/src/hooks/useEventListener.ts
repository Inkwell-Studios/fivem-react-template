import { useEffect, useRef } from 'react'

/**
 * Custom hook for handling event listeners
 * @param {string} eventName - The name of the event to listen for
 * @param {Function} handler - The callback function to handle the event
 * @param {Element | Window | Document | null} element - The element to attach the listener to (defaults to window)
 * @param {boolean} [passive=false] - Whether the event listener should be passive
 */
export function useEventListener<T extends Event = Event>(
  eventName: string,
  handler: (event: T) => void,
  element: Element | Window | Document | null = window,
  passive = false
): void {
  // Create a ref that stores handler
  const savedHandler = useRef<(event: T) => void>(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Define the listening target
    const targetElement = (element && 'current' in element) ? (element as any).current ?? element : element

    if (!targetElement?.addEventListener) return

    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => savedHandler.current(event as T)

    // Add event listener
    const options = passive ? { passive } : undefined
    targetElement.addEventListener(eventName, eventListener, options)

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element, passive])
}

/**
 * Custom hook for handling multiple event listeners
 * @param {Array<{ name: string, handler: Function }>} events - Array of event objects
 * @param {Element | Window | Document | null} element - The element to attach the listeners to
 * @param {boolean} [passive=false] - Whether the event listeners should be passive
 */
export function useEventListeners<T extends Event = Event>(
  events: { name: string; handler: (event: T) => void }[],
  element: Element | Window | Document | null = window,
  passive = false
): void {
  useEffect(() => {
    const targetElement = (element && 'current' in element) ? (element as any).current ?? element : element
    if (!targetElement?.addEventListener) return

    // Add all event listeners
    const listeners = events.map(({ name, handler }) => {
      const eventListener = (event: Event) => handler(event as T)
      const options = passive ? { passive } : undefined
      targetElement.addEventListener(name, eventListener, options)
      return { name, eventListener }
    })

    // Remove all event listeners on cleanup
    return () => {
      listeners.forEach(({ name, eventListener }) => {
        targetElement.removeEventListener(name, eventListener)
      })
    }
  }, [events, element, passive])
} 
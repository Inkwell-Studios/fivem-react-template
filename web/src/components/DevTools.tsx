import { useState, useEffect, useCallback, useRef } from 'react'
import { useNuiState, useNuiSelector } from '../stores/nui'
import { useNui } from '../providers/NuiProvider'
import { Button } from './ui/Button'
import { useEventListener } from '../hooks/useEventListener'
import { makeElementDraggable } from '../hooks/useDraggable'

// Modern Icons
const DevIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004.447-.097.989-.366 1.641-1.016 1.354-1.353 3.146-1.487 4.934-.294.214.144.331.386.331.63v3.23a.75.75 0 01-.18.485l-.564.602z" />
    <path fillRule="evenodd" d="M19.75 12A7.75 7.75 0 0112 19.75 7.75 7.75 0 014.25 12 7.75 7.75 0 0112 4.25c.37 0 .73.027 1.085.078.146.023.25.143.267.292l.188 1.685a.75.75 0 01-.834.805 5.25 5.25 0 106.293 6.293.75.75 0 01.805-.834l1.685.188c.15.017.269.121.292.267.051.355.078.715.078 1.085A7.75 7.75 0 0119.75 12z" clipRule="evenodd" />
  </svg>
)

const CloseIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
)

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [outgoingEventType, setOutgoingEventType] = useState('myCustomEvent')
  const [outgoingEventData, setOutgoingEventData] = useState('{ "key": "value" }')
  const [incomingEventType, setIncomingEventType] = useState('testIncoming')
  const [incomingEventData, setIncomingEventData] = useState('{ "message": "Hello from DevTools" }')
  const [sendError, setSendError] = useState('')
  const [simulateError, setSimulateError] = useState('')
  const [activeTab, setActiveTab] = useState('send') // Tab state
  
  // Reference to the panel element
  const panelRef = useRef(null)

  const setVisible = useNuiState((state) => state.setVisible)
  const lastMessage = useNuiSelector((state) => state.lastMessage)
  const { sendMessage, handleNuiMessage } = useNui()

  const devToolsId = 'dev-tools-panel'

  // Make the panel draggable once it's mounted
  useEffect(() => {
    if (isOpen && panelRef.current) {
      // Make the panel draggable by its header
      const cleanup = makeElementDraggable(panelRef.current, '#dev-tools-drag-handle')
      return cleanup
    }
  }, [isOpen])

  const toggleMainUIVisibility = useCallback(() => {
    setVisible(!useNuiState.getState().visible)
  }, [setVisible])

  const handleSendCustomMessage = useCallback(() => {
    setSendError('')
    try {
      const data = JSON.parse(outgoingEventData)
      if (!outgoingEventType.trim()) {
        setSendError('Event type cannot be empty.')
        return
      }
      sendMessage(outgoingEventType, data)
    } catch (e) {
      setSendError('Invalid JSON data: ' + e.message)
    }
  }, [sendMessage, outgoingEventType, outgoingEventData])

  const handleSimulateIncomingMessage = useCallback(() => {
    setSimulateError('')
    try {
      const data = JSON.parse(incomingEventData)
      if (!incomingEventType.trim()) {
        setSimulateError('Event type cannot be empty.')
        return
      }
      handleNuiMessage({ data: { type: incomingEventType, data } })
    } catch (e) {
      setSimulateError('Invalid JSON data: ' + e.message)
    }
  }, [handleNuiMessage, incomingEventType, incomingEventData])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] p-2.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        aria-label="Open DevTools"
      >
        <DevIcon />
      </button>
    )
  }

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'text-indigo-400 border-b-2 border-indigo-400'
          : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div
      ref={panelRef}
      id={devToolsId}
      className="fixed z-[9999] flex flex-col bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-800 w-[420px] text-sm"
    >
      {/* Header */}
      <div
        id="dev-tools-drag-handle"
        className="cursor-grab bg-gray-800 px-4 py-3 rounded-t-lg border-b border-gray-700 flex justify-between items-center flex-shrink-0"
      >
        <h3 className="font-medium text-sm flex items-center gap-2">
          <DevIcon className="text-indigo-400" />
          <span>Developer Tools</span>
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close DevTools"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 bg-gray-900/95">
        <TabButton id="send" label="Send Message" active={activeTab === 'send'} />
        <TabButton id="simulate" label="Simulate" active={activeTab === 'simulate'} />
        <TabButton id="monitor" label="Monitor" active={activeTab === 'monitor'} />
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4 overflow-y-auto flex-grow bg-gray-900/95">
        {/* UI Control - Always visible */}
        <div className="space-y-2">
          <Button size="sm" variant="secondary" onClick={toggleMainUIVisibility} className="w-full">
            Toggle Main UI Visibility
          </Button>
        </div>

        {/* Send Message Tab */}
        {activeTab === 'send' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400">Event Type</label>
              <input
                type="text"
                value={outgoingEventType}
                onChange={(e) => setOutgoingEventType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Enter event type..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400">JSON Data</label>
              <textarea
                value={outgoingEventData}
                onChange={(e) => setOutgoingEventData(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder='{ "key": "value" }'
              />
            </div>
            {sendError && (
              <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-md">{sendError}</p>
            )}
            <Button size="sm" variant="primary" onClick={handleSendCustomMessage} className="w-full">
              Send Message
            </Button>
          </div>
        )}

        {/* Simulate Tab */}
        {activeTab === 'simulate' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400">Event Type</label>
              <input
                type="text"
                value={incomingEventType}
                onChange={(e) => setIncomingEventType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Enter event type..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400">JSON Data</label>
              <textarea
                value={incomingEventData}
                onChange={(e) => setIncomingEventData(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder='{ "message": "Hello!" }'
              />
            </div>
            {simulateError && (
              <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-md">{simulateError}</p>
            )}
            <Button size="sm" variant="primary" onClick={handleSimulateIncomingMessage} className="w-full">
              Simulate Message
            </Button>
          </div>
        )}

        {/* Monitor Tab */}
        {activeTab === 'monitor' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400">Last Received Message</h4>
              {lastMessage ? (
                <pre className="bg-gray-800 p-3 rounded-md text-xs overflow-auto max-h-[300px] border border-gray-700">
                  {JSON.stringify(lastMessage, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic text-xs bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
                  No messages received yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
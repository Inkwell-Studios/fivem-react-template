// Example of receiving data from client
onNet('inkwell-react-template:buttonClicked', (message: any) => {
  const source = global.source
  console.log(`Player ${source} clicked button with message: ${message}`)
 
  // Example of sending data back to client
  emitNet('inkwell-react-template:updateFromServer', source, {
    receivedAt: new Date().toISOString()
  })
})

// Rate limit storage - tracks cooldowns per user
const rateLimits = new Map<any, any>()

// Helper to clean up expired rate limits
const cleanupRateLimits = () => {
  const now = Date.now()
  for (const [userId, limits] of rateLimits.entries()) {
    for (const [actionId, timestamp] of Object.entries(limits as any)) {
      if (now - (timestamp as any).lastAction >= (timestamp as any).cooldown) {
        delete (limits as any)[actionId]
      }
    }
    if (Object.keys(limits).length === 0) {
      rateLimits.delete(userId)
    }
  }
}

// Run cleanup every minute
setInterval(cleanupRateLimits, 60000)

// Check if an action is rate limited
const isRateLimited = (userId: any, actionId: any) => {
  const userLimits = rateLimits.get(userId)
  if (!userLimits || !userLimits[actionId]) return false

  const { lastAction, cooldown } = userLimits[actionId]
  const now = Date.now()
  return now - lastAction < cooldown
}

// Set rate limit for a user's action
const setRateLimit = (userId: any, actionId: any, cooldown: any) => {
  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, {})
  }
  
  const userLimits = rateLimits.get(userId)
  userLimits[actionId] = {
    lastAction: Date.now(),
    cooldown
  }
}

// Handle rate limit check requests from clients
onNet('inkwell-react-template:checkRateLimit', (actionId: any, cooldown: any) => {
  const src = source
  // Use the player's source as their ID since it's unique per session
  const userId = src.toString()

  if (isRateLimited(userId, actionId)) {
    emitNet('inkwell-react-template:rateLimitResponse', src, {
      actionId,
      allowed: false
    })
    return
  }

  setRateLimit(userId, actionId, cooldown)
  emitNet('inkwell-react-template:rateLimitResponse', src, {
    actionId,
    allowed: true
  })
})

export {} 
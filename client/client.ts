let nuiReady = false

// Add typings for FiveM exports

declare global {
  interface CitizenExports {
    // Example: Replace 'myResource' and 'myExport' with your actual resource and export names
    // myResource: {
    //   myExport(parameter: unknown): void;
    // }
  }
}

// Handle NUI Ready event
RegisterNuiCallback('uiReady', (data: any, cb: any) => {
  nuiReady = true
  // Initially hide the UI
  SendNuiMessage(JSON.stringify({
    type: 'setVisible',
    data: false
  }))
  cb({})
})

// Handle button click from NUI
RegisterNuiCallback('buttonClicked', (data: any, cb: any) => {
  emitNet('inkwell-react-template:buttonClicked', data.message)
  cb({})
})

// Handle hide frame request from NUI
RegisterNuiCallback('hideFrame', (_: any, cb: any) => {
  SetNuiFocus(false, false)
  // Also tell the UI its visibility state changed
  SendNuiMessage(JSON.stringify({
    type: 'setVisible',
    data: false
  }))
  cb({})
})

// Handle DevTools test message
RegisterNuiCallback('devTestMessage', (data: any, cb: any) => {
  cb({ received: true, timestamp: data.timestamp })
})

// Handle rate limit responses from server
onNet('inkwell-react-template:rateLimitResponse', (response: any) => {
  // Ensure response is properly formatted before sending to NUI
  const message = {
    type: 'rateLimitResponse',
    data: {
      actionId: response.actionId,
      allowed: response.allowed
    }
  }
  SendNuiMessage(JSON.stringify(message))
})

// Handle rate limit check requests from NUI
RegisterNuiCallback('checkRateLimit', (data: any, cb: any) => {
  const { actionId, cooldown } = data
  emitNet('inkwell-react-template:checkRateLimit', actionId, cooldown)
  cb({})
})

// Example command to toggle UI
RegisterCommand('toggleui', () => {
  if (!nuiReady) {
    return
  }
  SetNuiFocus(true, true)
  SendNuiMessage(JSON.stringify({
    type: 'setVisible',
    data: true
  }))
}, false)

// Example command to hide UI
RegisterCommand('hideui', () => {
  SetNuiFocus(false, false)
  SendNuiMessage(JSON.stringify({
    type: 'setVisible',
    data: false
  }))
}, false)

// Example of receiving data from server
onNet('inkwell-react-template:updateFromServer', (data: any) => {
  if (!nuiReady) {
    return
  }

  SendNuiMessage(JSON.stringify({
    type: 'updateFromServer',
    data
  }))
})

export {} 
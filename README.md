# FiveM React NUI Template

A sophisticated, type-safe template for crafting exceptional FiveM user interfaces. Built with React and Tailwind CSS, this template delivers a premium foundation for creating responsive in-game experiences with robust state management and seamless FiveM integration.

## Overview

Transform your FiveM UI development with:

- **React 18** - Leverage the latest React features with Vite for exceptional development velocity
- **Tailwind CSS** - Create stunning, responsive interfaces with modern styling primitives
- **Zustand** - Implement elegant state management with minimal boilerplate
- **FiveM Integration** - Purpose-built components and hooks for optimal game integration
- **Type Safety** - Ensure reliable communication between game and interface layers
- **Developer Experience** - Refined tooling for rapid iteration and deployment
- **Component System** - Thoughtfully designed, FiveM-compatible UI components
- **Rate Limiting** - Built-in hook for managing action cooldowns

## Getting Started

### Installation

1. Initialize your project:
   ```bash
   cd resources
   git clone https://github.com/Inkwell-Studios/fivem-react-template
   cd fivem-react-template
   ```

2. Set up dependencies:
   ```bash
   yarn install
   ```

### Development

Start the development environment:
```bash
yarn dev
```

Create a production build:
```bash
yarn build
```

## Architecture

The template follows a carefully considered structure:

```
resources/[resource-name]/
├── client/                 # Game client integration
│   └── client.js          # Core client functionality
├── server/                # Game server logic
│   └── server.js         # Server operations
├── web/                  # Interface layer
│   ├── src/
│   │   ├── components/   # UI component system
│   │   ├── providers/    # React context layer
│   │   ├── stores/      # State management
│   │   └── App.jsx      # Root application
│   └── build/           # Production assets
└── fxmanifest.lua       # Resource configuration
```

## Integration

### Game-to-Interface Communication

Implement seamless communication from your game client:

```js
// client.js
SendNuiMessage(JSON.stringify({
  type: 'setVisible',
  data: true
}))
```

### Interface-to-Game Communication

Handle interface events with precision:

```jsx
// React Component
const { sendMessage } = useNui()

// Dispatch game events
await sendMessage('eventName', { data: 'example' })
```

### Interface Controls

The template provides refined control commands:

- `toggleui` - Toggle interface visibility
- `hideui` - Dismiss interface

## Component System

### Button

A versatile button system with thoughtful variants:

```jsx
<Button
  variant="primary"    // Options: primary, secondary, danger
  size="md"           // Options: sm, md, lg
  onClick={handleAction}
>
  Action
</Button>
```

### Card

Structured content presentation:

```jsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Primary Content</CardContent>
  <CardFooter>Supporting Content</CardFooter>
</Card>
```

## State Management

The template implements a sophisticated state management solution using Zustand with a custom NUI provider. It also includes a store (`useRateLimitStore`) and hook (`useRateLimit`) for managing action cooldowns.

```jsx
const { visible, sendMessage, hideFrame } = useNui()

// State observation
console.log('Interface State:', visible)

// Event dispatch
await sendMessage('eventName', { data: 'example' })

// Interface control
hideFrame()
```

## Development Guidelines

### Workflow

1. Development Mode:
   ```bash
   yarn dev
   ```
   Initiates the development server and script watching.

2. Production Build:
   ```bash
   yarn build
   ```

3. FiveM Integration:
   ```
   refresh
   restart [resource-name]
   ```

### Best Practices

#### State Management
- Utilize `useNui` for game communication
- Centralize shared state in Zustand stores (e.g., `useNuiState`, `useRateLimitStore`)
- Maintain local state for component-specific logic
- Use provided hooks for common patterns (e.g., `useRateLimit`)

#### Interface Design
- Implement consistent styling through Tailwind CSS
- Avoid unsupported features (e.g., backdrop filters)
- Leverage the provided component system

#### Performance
- Optimize state updates during animations
- Implement proper hook dependency management
- Ensure proper cleanup in effect hooks
- Apply rate limiting to frequent actions using `useRateLimit`

### Custom Hooks

The template provides helpful custom hooks:

- `useNui`: Core hook for interacting with the FiveM NUI system.
- `useEventListener`: Safely add and remove global event listeners.
- `useDraggable`: Make elements draggable within the UI.
- `useRateLimit`: Implement cooldowns for user actions. Requires a unique ID and cooldown duration (ms). Returns `isRateLimited` (boolean) and `performAction` (function wrapper).

  ```jsx
  const { isRateLimited, performAction } = useRateLimit('myActionId', 5000) // 5s cooldown

  const handleClick = () => {
    performAction(() => {
      // Code to run if not rate limited
      console.log('Action performed!')
      sendMessage('actionPerformed', { id: 'myActionId' })
    })
  }
  ```

## Configuration

### Tailwind CSS

Customize your design system in `web/tailwind.config.js`:

```js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Design system configuration
    }
  }
}
```

### Build System

Configure build settings in `web/vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    // Build optimization settings
  }
})
```

## Technical Details

### Troubleshooting

Interface Visibility
1. Verify resource activation
2. Confirm build artifact presence
3. Validate interface toggle state
4. Review console output

Development Environment
1. Reset dependency tree
2. Verify Node.js environment
3. Resolve port conflicts

## Legal

This template is provided under the MIT License.

## Support

### Documentation
- [FiveM Development Guide](https://docs.fivem.net/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand State Management](https://github.com/pmndrs/zustand)

### Contributing

We welcome contributions that align with our vision for exceptional UI development:

1. Fork the repository
2. Create a feature branch
3. Implement your enhancement
4. Submit a pull request

---

Designed and maintained with precision. For technical inquiries and contributions, please refer to our [repository](https://github.com/yourusername/fivem-react-nui-template). 

# Contributing to Type to Death

Thank you for your interest in contributing to Type to Death! This document provides guidelines and standards for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Feature Development](#feature-development)

## Getting Started

Type to Death is a typing game that combines skill-building with horror-inspired gameplay mechanics. Players must improve their typing speed and accuracy while managing a monster that teleports closer every time they blink.

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **3D Game**: Unity 6.1 (WebGL)
- **Blink Detection**: Google MediaPipe
- **Styling**: Tailwind CSS v4

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Unity 6.1 (for Unity development)
- Modern browser with webcam support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd type-to-death
```

2. Install React app dependencies:
```bash
cd app-next
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

### Unity Setup

1. Open Unity Hub
2. Open the project at `unity/kiroween/`
3. Ensure Unity 6.1 is installed
4. Open the main scene and press Play to test

## Project Structure

```
type-to-death/
├── app-next/              # React frontend application
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── stores/          # Zustand state management
│   ├── lib/             # Utility functions
│   └── public/          # Static assets
├── unity/kiroween/       # Unity game project
│   └── Assets/
│       └── Scripts/     # C# game scripts
├── .kiro/
│   ├── specs/          # Feature specifications
│   └── steering/       # Development guidelines
├── docs-ai/            # AI-generated documentation
└── assets/             # Project assets
```

## Coding Standards

### React/TypeScript Standards

#### Import Aliases

Always use `@/` aliases for internal imports:

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";

// ❌ Wrong
import { Button } from "../ui/button";
import { useAppStore } from "../../stores/appStore";
```

#### Component Structure

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";

export function MyComponent() {
  // Hooks first
  const [localState, setLocalState] = useState(false);
  const globalState = useAppStore((state) => state.value);

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

#### State Management with Zustand

- Use Zustand for global state only
- Use `useState` for component-local state
- Always use selectors for optimal performance

```typescript
// ✅ Correct - Using selector
const showMainMenu = useAppStore((state) => state.showMainMenu);

// ❌ Wrong - Accessing entire store
const store = useAppStore();
```

#### UI Components

Always use shadcn/ui components as the foundation:

```bash
# Add new components from app-next directory
cd app-next
pnpm dlx shadcn@latest add [component-name]
```

Never create custom buttons, inputs, dialogs, etc. when shadcn provides them.

### Unity C# Standards

#### File Organization

All Unity scripts must be placed in:
```
unity/kiroween/Assets/Scripts/
```

#### Naming Conventions

```csharp
// Classes: PascalCase
public class PlayerController : MonoBehaviour

// Private fields: camelCase
private float moveSpeed = 5f;

// Serialized fields: camelCase with [SerializeField]
[SerializeField] private float jumpForce = 10f;

// Public properties: PascalCase
public float MaxHealth { get; private set; }

// Methods: PascalCase
public void TakeDamage(float amount)

// Constants: UPPER_SNAKE_CASE
private const float MAX_SPEED = 10f;
```

#### Unity 6.1 Best Practices

```csharp
// ✅ Cache component references
private Rigidbody rb;

void Awake()
{
    if (!TryGetComponent(out rb))
    {
        Debug.LogError("Rigidbody not found!");
    }
}

// ✅ Use Awaitable for async operations
private async Awaitable DelayedAction()
{
    await Awaitable.WaitForSecondsAsync(2f);
    Debug.Log("Action completed");
}

// ✅ Use New Input System
private InputAction jumpAction;

void Awake()
{
    playerInput = GetComponent<PlayerInput>();
    jumpAction = playerInput.actions["Jump"];
}
```

## Commit Guidelines

Follow Conventional Commits specification:

```
<type>(<scope>): <subject>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
feat(ui): add costume selection menu
fix(animation): resolve idle animation loop issue
chore: update Unity to 6.1
docs: update README with setup instructions
```

### Rules

- Use lowercase for type and subject
- Keep subject line under 50 characters
- Use imperative mood ("add" not "added")
- Don't end subject with a period
- Scope is optional but recommended

## Pull Request Process

1. **Create a feature branch**:
```bash
git checkout -b feat/your-feature-name
```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   - React: Run `pnpm dev` and test in browser
   - Unity: Test in Unity Editor

4. **Commit your changes** using conventional commits:
```bash
git add .
git commit -m "feat(scope): add new feature"
```

5. **Push to your fork**:
```bash
git push origin feat/your-feature-name
```

6. **Create a Pull Request**:
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots/videos for UI changes
   - Ensure all checks pass

### PR Checklist

- [ ] Code follows project coding standards
- [ ] Imports use `@/` aliases (no relative paths)
- [ ] UI components use shadcn/ui
- [ ] Commit messages follow conventional commits
- [ ] Changes have been tested locally
- [ ] Documentation updated if needed
- [ ] No console errors or warnings

## Feature Development

### Using Specs

For complex features, create a spec in `.kiro/specs/`:

1. **Create feature directory**:
```
.kiro/specs/your-feature-name/
├── requirements.md  # What needs to be built
├── design.md       # How it will be built
└── tasks.md        # Implementation steps
```

2. **Follow spec conventions**:
   - Use EARS patterns for requirements
   - Define correctness properties in design
   - Create traceable tasks

3. **Prefix Unity specs** with `unity-`:
```
.kiro/specs/unity-player-movement/
```

See `.kiro/steering/spec-conventions.md` for detailed guidelines.

### Documentation

- **AI-generated docs**: Store in `docs-ai/`
- **User-facing docs**: Update README.md
- **Code comments**: Explain WHY, not WHAT

## Questions or Issues?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed reproduction steps for bugs
- Include screenshots/videos when helpful

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Type to Death! 🎮👻

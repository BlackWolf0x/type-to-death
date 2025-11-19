# Agent Hooks Guide

## Overview

Agent hooks are automated workflows that trigger AI agent executions based on specific events in your development workflow. They enable proactive automation without manual intervention.

## What Are Agent Hooks?

Agent hooks allow you to:
- Automatically run tasks when specific events occur (file saves, git commits, etc.)
- Create custom workflows that respond to your development patterns
- Maintain code quality and consistency automatically
- Reduce repetitive manual tasks

## Accessing Agent Hooks

### Via Explorer View
1. Open the Kiro sidebar
2. Look for the "Agent Hooks" section
3. View, edit, or create hooks directly

### Via Command Palette
1. Press `Cmd/Ctrl + Shift + P`
2. Type "Open Kiro Hook UI"
3. Select the command to open the hook builder

## Hook Types

### 1. Event-Triggered Hooks

Hooks that run automatically when specific events occur:

#### On File Save
```yaml
trigger: onFileSave
filePattern: "**/*.ts"
action: sendMessage
message: "Check this TypeScript file for type errors and suggest improvements"
```

**Use Cases:**
- Auto-format code on save
- Run linters automatically
- Update related documentation
- Validate code against project standards

#### On Message Sent
```yaml
trigger: onMessageSent
action: sendMessage
message: "Remember to follow our coding standards in .kiro/steering/"
```

**Use Cases:**
- Remind about project conventions
- Load context automatically
- Enforce workflow steps

#### On Agent Execution Complete
```yaml
trigger: onExecutionComplete
action: sendMessage
message: "Run tests to verify the changes"
```

**Use Cases:**
- Chain multiple tasks together
- Verify changes after implementation
- Update documentation after code changes

#### On New Session
```yaml
trigger: onNewSession
action: sendMessage
message: "Load the current sprint goals from docs/sprint.md"
```

**Use Cases:**
- Load project context at session start
- Remind about current priorities
- Initialize workspace state

### 2. Manual Hooks

Hooks that run when you click a button:

```yaml
trigger: manual
name: "Spell Check README"
action: sendMessage
message: "Review README.md for grammar and spelling errors, then fix them"
```

**Use Cases:**
- On-demand code reviews
- Generate documentation
- Run specific analysis tasks
- Custom workflows you trigger manually

## Hook Actions

### Send Message Action

Sends a message to the AI agent:

```yaml
action: sendMessage
message: "Your instruction here"
```

The message can reference:
- Specific files: `"Review app/src/App.tsx"`
- Context variables: `"Check the file that was just saved"`
- Project patterns: `"Follow our TypeScript conventions"`

### Execute Command Action

Runs a shell command:

```yaml
action: executeCommand
command: "pnpm run lint"
```

**Use Cases:**
- Run tests automatically
- Execute build scripts
- Run formatters or linters
- Custom shell scripts

## Practical Examples for This Project

### Example 1: Auto-Check TypeScript on Save

```yaml
name: "TypeScript Type Check"
trigger: onFileSave
filePattern: "app/src/**/*.{ts,tsx}"
action: sendMessage
message: "Check this TypeScript file for type errors and ensure all imports use @/ aliases"
```

**Benefits:**
- Catches type errors immediately
- Enforces import alias standards
- Provides instant feedback

### Example 2: Verify shadcn Component Usage

```yaml
name: "Verify shadcn Usage"
trigger: onFileSave
filePattern: "app/src/components/**/*.tsx"
action: sendMessage
message: "Review this component file and ensure it uses shadcn/ui components where appropriate. Check if any custom UI elements should be replaced with shadcn components."
```

**Benefits:**
- Enforces shadcn-first approach
- Prevents reinventing the wheel
- Maintains UI consistency

### Example 3: Update Tests After Code Changes

```yaml
name: "Update Tests"
trigger: onFileSave
filePattern: "app/src/**/*.{ts,tsx}"
excludePattern: "**/*.test.{ts,tsx}"
action: sendMessage
message: "Check if this code change requires test updates. If tests exist for this file, review and update them."
```

**Benefits:**
- Keeps tests in sync with code
- Reduces test debt
- Catches breaking changes early

### Example 4: Zustand Store Validation

```yaml
name: "Validate Zustand Store"
trigger: onFileSave
filePattern: "app/src/stores/**/*.ts"
action: sendMessage
message: "Review this Zustand store and ensure it follows our state management patterns: proper TypeScript types, localStorage error handling, and selector-based access patterns."
```

**Benefits:**
- Enforces state management standards
- Catches common mistakes
- Maintains consistency

### Example 5: Manual Documentation Generator

```yaml
name: "Generate Component Docs"
trigger: manual
action: sendMessage
message: "Generate documentation for the currently open component file, including props, usage examples, and any important notes."
```

**Benefits:**
- On-demand documentation
- Consistent doc format
- Saves time writing docs

### Example 6: Pre-Commit Quality Check

```yaml
name: "Pre-Commit Check"
trigger: manual
action: sendMessage
message: "Review all staged changes and check for: 1) TypeScript errors, 2) Import alias usage, 3) shadcn component usage, 4) Zustand best practices, 5) Missing tests"
```

**Benefits:**
- Comprehensive quality gate
- Catches issues before commit
- Maintains code quality

### Example 7: Unity-React Integration Check

```yaml
name: "Unity Integration Check"
trigger: onFileSave
filePattern: "app/src/components/unity/**/*.tsx"
action: sendMessage
message: "Review this Unity integration component for proper event handling, memory management, and React lifecycle integration."
```

**Benefits:**
- Catches Unity-specific issues
- Ensures proper cleanup
- Prevents memory leaks

### Example 8: Auto-Update Spec Tasks

```yaml
name: "Update Spec Progress"
trigger: onExecutionComplete
action: sendMessage
message: "If we just completed a task from a spec, update the task status in the corresponding tasks.md file"
```

**Benefits:**
- Keeps specs up to date
- Tracks progress automatically
- Reduces manual bookkeeping

## Best Practices

### 1. Start Small
Begin with one or two hooks for your most common workflows, then expand.

### 2. Be Specific with File Patterns
```yaml
# ✅ Good - Specific pattern
filePattern: "app/src/components/**/*.tsx"

# ❌ Too broad - Triggers on everything
filePattern: "**/*"
```

### 3. Use Descriptive Names
```yaml
# ✅ Good - Clear purpose
name: "TypeScript Type Check on Save"

# ❌ Vague
name: "Check File"
```

### 4. Combine with Steering Rules
Hooks work best when combined with steering documents:

```yaml
message: "Review this file and ensure it follows our conventions in .kiro/steering/"
```

### 5. Test Hooks Incrementally
- Create a hook
- Test it on a few files
- Refine the message/pattern
- Enable for broader use

### 6. Use Manual Hooks for Expensive Operations
Don't auto-trigger heavy operations on every save:

```yaml
# ✅ Good - Manual trigger for expensive task
trigger: manual
name: "Full Codebase Analysis"

# ❌ Bad - Runs on every save
trigger: onFileSave
filePattern: "**/*"
message: "Analyze entire codebase..."
```

### 7. Provide Context in Messages
```yaml
# ✅ Good - Specific context
message: "Check this Zustand store for proper TypeScript types and localStorage error handling"

# ❌ Vague
message: "Check this file"
```

## Hook Patterns for This Project

### Pattern 1: Quality Gates
Hooks that enforce code quality standards automatically.

### Pattern 2: Documentation Automation
Hooks that generate or update documentation based on code changes.

### Pattern 3: Test Maintenance
Hooks that keep tests in sync with implementation.

### Pattern 4: Convention Enforcement
Hooks that ensure project conventions are followed (imports, component usage, etc.).

### Pattern 5: Workflow Automation
Hooks that chain tasks together for common workflows.

## Troubleshooting

### Hook Not Triggering
1. Check the file pattern matches your file
2. Verify the hook is enabled
3. Check the Kiro output panel for errors

### Hook Triggering Too Often
1. Make file patterns more specific
2. Add exclude patterns
3. Consider using manual trigger instead

### Hook Message Not Clear
1. Be more specific in the message
2. Reference specific files or patterns
3. Include context about what to check

## Advanced Patterns

### Conditional Logic in Messages
```yaml
message: "If this file has tests, update them. If not, suggest creating tests."
```

### Multi-Step Workflows
```yaml
# Hook 1: On save, check code
trigger: onFileSave
action: sendMessage
message: "Check for errors"

# Hook 2: After execution, run tests
trigger: onExecutionComplete
action: executeCommand
command: "pnpm test"
```

### Context-Aware Hooks
```yaml
message: "Review this file in the context of the current spec in .kiro/specs/app-flow/"
```

## Recommended Hooks for This Project

Based on your project structure, here are recommended hooks to create:

1. **TypeScript Import Checker** - Enforce `@/` aliases
2. **shadcn Component Validator** - Ensure shadcn usage
3. **Zustand Store Validator** - Check state management patterns
4. **Unity Component Checker** - Validate Unity integration
5. **Spec Task Updater** - Auto-update task progress
6. **Pre-Commit Quality Gate** - Manual comprehensive check
7. **Documentation Generator** - Manual doc creation

## Resources

- Kiro Documentation: Check the Kiro docs for latest hook features
- Command Palette: `Cmd/Ctrl + Shift + P` → "Kiro Hook"
- Explorer View: Look for "Agent Hooks" section

## Quick Reference

```yaml
# Basic Hook Structure
name: "Hook Name"
trigger: onFileSave | onMessageSent | onExecutionComplete | onNewSession | manual
filePattern: "**/*.ts"  # Optional, for file-based triggers
excludePattern: "**/*.test.ts"  # Optional
action: sendMessage | executeCommand
message: "Your instruction"  # For sendMessage
command: "your-command"  # For executeCommand
```

## Getting Started

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type "Open Kiro Hook UI"
3. Create your first hook using one of the examples above
4. Test it on a file
5. Refine and expand

Start with manual hooks to test workflows, then convert successful patterns to automatic triggers.

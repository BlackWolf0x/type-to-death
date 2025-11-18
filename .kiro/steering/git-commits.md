# Git Commit Standards

Follow Conventional Commits specification for all commit messages.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates, build changes
- **ci**: CI/CD configuration changes
- **build**: Build system or external dependency changes
- **revert**: Reverting a previous commit

## Rules

- Use lowercase for type and subject
- Subject line should be concise (50 chars or less)
- Do not end subject line with a period
- Use imperative mood ("add feature" not "added feature")
- Scope is optional but recommended (e.g., `feat(player): add jump mechanic`)
- Body is optional, use for detailed explanations
- Reference issues in footer when applicable

## Examples

```
feat(ui): add costume selection menu

fix(animation): resolve idle animation loop issue

chore: update Unity to 2022.3.15f1

docs: update README with setup instructions
```

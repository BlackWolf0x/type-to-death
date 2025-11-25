# Spec Conventions and Standards

## Overview

This document defines the conventions and standards for creating feature specifications in this project. All new specs MUST follow these conventions to maintain consistency and quality.

---

## Spec Structure

Every spec MUST consist of three documents in `.kiro/specs/{feature-name}/`:

1. **requirements.md** - What needs to be built
2. **design.md** - How it will be built
3. **tasks.md** - Step-by-step implementation plan

---

## Naming Conventions

### Feature Names
- Use **kebab-case** for feature directory names
- Be descriptive but concise
- Prefix Unity-specific features with `unity-`
- Examples: `unity-monster`, `unity-monster-movelist`, `user-authentication`

### File Names
- Always use: `requirements.md`, `design.md`, `tasks.md`
- Never deviate from these names

---

## Requirements Document (requirements.md)

### Required Sections

#### 1. Title
```markdown
# {Feature Name} - Requirements
```

#### 2. Introduction
- Brief overview of the feature
- 2-3 sentences explaining what it does

#### 3. Context (Optional but Recommended)
- Background information
- How this feature fits into the larger system
- Why it's needed

#### 4. Glossary (If Needed)
- Define all technical terms
- Define system names
- Use bullet list format:
```markdown
## Glossary

- **Term**: Definition
- **Another Term**: Definition
```

#### 5. Requirements

**Format:**
```markdown
### Requirement {N}: {Requirement Name}

**User Story:** As a {role}, I want {feature}, so that {benefit}

#### Acceptance Criteria

1. {EARS-compliant criterion}
2. {EARS-compliant criterion}
...
```

**EARS Patterns to Use:**
- Ubiquitous: `THE {system} SHALL {response}`
- Event-driven: `WHEN {trigger}, THE {system} SHALL {response}`
- State-driven: `WHILE {condition}, THE {system} SHALL {response}`
- Unwanted event: `IF {condition}, THEN THE {system} SHALL {response}`
- Optional feature: `WHERE {option}, THE {system} SHALL {response}`

**Acceptance Criteria Naming:**
- Use short IDs: `AC1`, `AC2`, `AC3`, etc.
- Or use numbered format: `1.1`, `1.2`, `2.1`, etc.

#### 6. Non-Functional Requirements

```markdown
## Non-Functional Requirements

### NFR1: {Category}
{Description}

### NFR2: {Category}
{Description}
```

Common categories: Performance, Security, Usability, Compatibility, Maintainability

#### 7. Constraints
- Technical limitations
- Design constraints
- Platform requirements
- Bullet list format

#### 8. Dependencies
- External systems
- Other features
- Libraries or frameworks
- Bullet list format

#### 9. Success Metrics
- How to measure success
- What "done" looks like
- Bullet list format

#### 10. Out of Scope
- What is explicitly NOT included
- Future enhancements
- Deferred features
- Bullet list format

---

## Design Document (design.md)

### Required Sections

#### 1. Title
```markdown
# {Feature Name} - Design
```

#### 2. Architecture Overview
- High-level system description
- Main components
- How they interact
- Numbered list of responsibilities

#### 3. Component Structure
For each major component:
```markdown
### {Component Name}

**Responsibilities:**
- Bullet list of what it does

**Dependencies:**
- What it depends on
```

#### 4. Data Model
Show configuration and runtime state:
```markdown
### Configuration Variables
\```csharp
[SerializeField] private Type variableName = defaultValue;
\```

### Runtime State
\```csharp
private Type variableName;
\```
```

#### 5. Core Algorithms
For each major algorithm:
```markdown
### {N}. {Algorithm Name}

\```
Pseudocode or step-by-step description:
1. Step one
2. Step two
...
\```
```

#### 6. Correctness Properties

**Format:**
```markdown
### P{N}: {Property Name}
**Property:** {Universal statement about behavior}
**Verification:** {How to verify it}
**Covers:** {Requirements it validates}
```

**Rules:**
- Number properties: P1, P2, P3, etc.
- Each property MUST have "for any" or "for all" quantification
- Reference specific requirements (AC1, AC2, etc.)
- Properties should be testable

#### 7. Integration Points (If Extending Existing Code)
```markdown
## Integration with Existing {Component}

### Modified Methods
- List methods that will be changed
- Show before/after pseudocode
```

#### 8. Edge Cases
```markdown
### E{N}: {Edge Case Name}
**Scenario:** {Description}
**Handling:** {How it's handled}
```

#### 9. Performance Considerations
- Bullet list of performance notes
- Optimization strategies
- Complexity analysis if relevant

#### 10. Testing Strategy
```markdown
### Manual Testing
1. Test case
2. Test case

### Edge Case Testing
1. Test case
2. Test case
```

#### 11. Future Enhancements (Out of Scope)
- Bullet list of potential improvements
- Deferred features
- Nice-to-haves

---

## Tasks Document (tasks.md)

### Required Sections

#### 1. Title
```markdown
# {Feature Name} - Implementation Plan
```

#### 2. Tasks Overview

**Format:**
```markdown
## Tasks Overview

- [ ] {N}. {Task Name}
  - Subtask detail
  - Subtask detail
  - _Properties: P1, P2_
  - _Requirements: AC1, AC2_
```

**Rules:**
- Number tasks sequentially: 1, 2, 3, etc.
- Use checkbox format: `- [ ]` for incomplete, `- [x]` for complete
- Include subtask details as nested bullets
- Reference properties from design.md
- Reference requirements from requirements.md
- Keep tasks focused and atomic

**Task Naming:**
- Use imperative verbs: "Implement", "Create", "Add", "Update"
- Be specific about what's being done
- Examples: "Implement Pose Validation", "Add Configuration Fields"

#### 3. Implementation Notes
```markdown
## Implementation Notes

- Note about task dependencies
- Note about implementation approach
- Note about testing strategy
```

#### 4. Manual Setup Tasks (If Applicable)
For Unity or other manual work:
```markdown
## Unity Setup Tasks (Manual)

### Setup Task A: {Task Name}
1. Step
2. Step
```

#### 5. Estimated Effort
```markdown
## Estimated Effort

- Total Tasks: {N}
- Estimated Time: {X-Y hours}
- Complexity: Low/Medium/High
- Risk Level: Low/Medium/High
```

#### 6. Dependencies
- List dependencies on other specs
- List external dependencies

---

## Cross-Document Consistency

### Requirement IDs
- Use consistent IDs across all three documents
- Format: `AC1`, `AC2`, etc. OR `1.1`, `1.2`, etc.
- Reference these IDs in design properties and tasks

### Property IDs
- Format: `P1`, `P2`, `P3`, etc.
- Defined in design.md
- Referenced in tasks.md

### Edge Case IDs
- Format: `E1`, `E2`, `E3`, etc.
- Defined in design.md
- May be referenced in tasks.md

### Traceability
Every task MUST reference:
- `_Properties: P1, P2_` (which properties it validates)
- `_Requirements: AC1, AC2_` (which requirements it implements)

---

## Code Examples

### In Requirements
- Avoid code examples
- Focus on WHAT, not HOW
- Use plain language

### In Design
- Use code examples liberally
- Show data structures
- Show pseudocode for algorithms
- Use proper markdown code blocks with language tags

### In Tasks
- Minimal code examples
- Focus on what needs to be done
- Reference design.md for implementation details

---

## Language and Style

### Requirements
- Use EARS patterns (SHALL, WHEN, THE, etc.)
- Be precise and unambiguous
- Use active voice
- Avoid implementation details

### Design
- Use technical language
- Be detailed and specific
- Include diagrams if helpful (Mermaid)
- Explain WHY, not just WHAT

### Tasks
- Use imperative mood
- Be actionable
- Be specific about files and methods
- Keep it concise

---

## Unity-Specific Conventions

### Unity Spec Naming
- Prefix with `unity-`: `unity-monster`, `unity-player-movement`
- Store in `.kiro/specs/unity-{feature-name}/`

### Unity Requirements
- Include Unity version compatibility (e.g., "Unity 6.1 Compatibility")
- Specify component dependencies (Animator, Rigidbody, etc.)
- Include Editor testing requirements if applicable

### Unity Design
- Show C# code examples
- Reference Unity lifecycle methods (Awake, Start, Update)
- Include Animator setup requirements
- Show Inspector configuration

### Unity Tasks
- Separate coding tasks from manual Unity Editor tasks
- Include "Unity Setup Tasks (Manual)" section
- Reference specific Unity components and methods

---

## Documentation Standards

### AI-Generated Documentation
- Store in `docs-ai/` folder
- Prefix Unity docs with `unity-`: `unity-monster-implementation.md`
- Include date and status
- Create after implementation is complete

### Setup Guides
- Create for complex features
- Store in `docs-ai/`
- Include step-by-step instructions
- Add troubleshooting section

### Testing Checklists
- Create for features with many test cases
- Store in `docs-ai/`
- Use checkbox format
- Include expected results

---

## Quality Checklist

Before considering a spec complete, verify:

### Requirements
- [ ] All sections present
- [ ] User stories for each requirement
- [ ] EARS-compliant acceptance criteria
- [ ] Glossary defines all terms
- [ ] Out of scope is clearly defined

### Design
- [ ] Architecture overview is clear
- [ ] All components documented
- [ ] Correctness properties defined
- [ ] Properties reference requirements
- [ ] Edge cases identified
- [ ] Testing strategy included

### Tasks
- [ ] All tasks numbered sequentially
- [ ] Each task references properties
- [ ] Each task references requirements
- [ ] Estimated effort provided
- [ ] Dependencies listed
- [ ] Manual tasks separated (if applicable)

### Cross-Document
- [ ] Requirement IDs consistent
- [ ] Property IDs consistent
- [ ] All requirements have properties
- [ ] All properties have tasks
- [ ] Traceability is complete

---

## Examples

### Good Requirement
```markdown
### Requirement 1: Monster Spawning

**User Story:** As a game designer, I want the monster to spawn at a configurable distance, so that I can control the initial threat level.

#### Acceptance Criteria

1. WHEN the game starts, THE MonsterController SHALL position the monster at startingDistance units from the camera
2. THE monster's Y position SHALL be set to 0 (ground level)
3. THE monster SHALL face toward the camera
```

### Good Property
```markdown
### P1: Spawn Position Correctness
**Property:** For any configured startingDistance, the monster spawns at exactly that distance from the camera with Y = 0
**Verification:** Distance between monster and camera equals startingDistance ± 0.01
**Covers:** AC1
```

### Good Task
```markdown
- [ ] 2. Implement Monster Spawn Logic
  - Implement Start() method
  - Calculate spawn position at startingDistance from camera
  - Use camera forward direction for positioning
  - Set monster Y position to 0
  - Rotate monster to face camera
  - _Properties: P1, P5_
  - _Requirements: AC1_
```

---

## Common Mistakes to Avoid

### Requirements
- ❌ Including implementation details
- ❌ Using vague language ("should", "might", "could")
- ❌ Missing user stories
- ❌ Non-EARS acceptance criteria

### Design
- ❌ Missing correctness properties
- ❌ Properties without requirement references
- ❌ No edge case analysis
- ❌ Vague algorithm descriptions

### Tasks
- ❌ Tasks without property/requirement references
- ❌ Vague task descriptions
- ❌ Missing estimated effort
- ❌ No separation of manual vs. coding tasks

---

## Summary

**Every spec MUST have:**
1. requirements.md with EARS-compliant acceptance criteria
2. design.md with correctness properties
3. tasks.md with traceable implementation steps

**Every element MUST be:**
- Numbered/ID'd consistently
- Cross-referenced between documents
- Testable and verifiable
- Clear and unambiguous

**Follow these conventions for:**
- Consistency across the project
- Easy navigation and understanding
- Complete traceability
- Quality assurance
- Maintainability

When in doubt, refer to existing specs (`unity-monster`, `unity-monster-movelist`) as examples.

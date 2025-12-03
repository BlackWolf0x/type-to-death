# FMOD Bank Preloading - Design

## Architecture Overview

The MainMenuManager handles FMOD bank preloading using a coroutine that:
1. Iterates through configured banks and starts loading each
2. Waits until all sample data is loaded
3. Allows the GameIsReady event to proceed (GameIsReady is managed by another spec)

## Component Structure

### MainMenuManager

**Responsibilities:**
- Expose bank list via Inspector with [BankRef] attribute
- Load banks asynchronously on Start
- Signal game readiness after loading completes

**Dependencies:**
- FMODUnity.RuntimeManager
- JavaScript interop (WebGL only)

## Data Model

### Configuration Variables
```csharp
[BankRef]
public List<string> Banks;
```

### Runtime State
- Coroutine handles loading state internally

## Core Algorithm

### Bank Loading Sequence
```
1. Start() triggers bank loading coroutine
2. For each bank in Banks list:
   - Call RuntimeManager.LoadBank(bank, true)
3. While RuntimeManager.AnySampleDataLoading():
   - Yield and wait
4. Log success
5. Allow GameIsReady event to proceed
```

Note: The GameIsReady event itself is managed by another spec. This spec ensures banks are loaded before that event fires.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

No automated property tests are applicable for this feature. The acceptance criteria involve:
- Unity Inspector configuration (design-time)
- FMOD runtime behavior (requires mocking)
- JavaScript interop (requires WebGL context)

Manual verification is appropriate for this simple integration feature.

## Testing Strategy

### Manual Testing
1. Configure banks in Inspector
2. Build for WebGL
3. Verify GameIsReady fires after banks load
4. Verify no audio delays during gameplay

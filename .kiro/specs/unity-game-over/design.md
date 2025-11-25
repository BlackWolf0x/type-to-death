# Unity Game Over - Design

## Architecture Overview

The Game Over system consists of a `GameManager` singleton that:
1. Subscribes to GameObserver.Notifier for lose completion updates
2. Triggers game over sequence when lose completion reaches 100%
3. Waits for configurable delay using coroutine
4. Activates black screen UI panel
5. Deactivates Monster GameObject

This creates a simple, centralized game over system.

## Component Structure

### GameManager (MonoBehaviour, Singleton)

**Responsibilities:**
- Implement singleton pattern
- Subscribe to GameObserver.Notifier
- Detect 100% lose completion
- Trigger game over coroutine
- Activate black screen panel after delay
- Deactivate Monster GameObject

**Dependencies:**
- GameObserver (Notifier action)
- UI Panel component (black screen)
- Monster GameObject reference

## Data Model

### Configuration Variables

```csharp
[Header("Game Over Settings")]
[SerializeField] private GameObject blackScreenPanel;
[SerializeField] private GameObject monsterObject;
[SerializeField] private float gameOverDelay = 1f;
```

### Runtime State

```csharp
private static GameManager instance;
private bool gameOverTriggered = false;
```

### Public Properties

```csharp
public static GameManager Instance => instance;
```

## Core Algorithms

### 1. Singleton Initialization

```
On Awake:
1. If instance == null:
   - Set instance = this
   - Call DontDestroyOnLoad(gameObject)
2. Else if instance != this:
   - Destroy(gameObject)
   - Return
```

### 2. Subscription Management

```
On OnEnable:
1. Subscribe to GameObserver.Notifier
2. GameObserver.Notifier += OnLoseCompletionChanged

On OnDisable:
1. Unsubscribe from GameObserver.Notifier
2. GameObserver.Notifier -= OnLoseCompletionChanged
```

### 3. Lose Completion Monitoring

```
OnLoseCompletionChanged(float percentage):
1. If gameOverTriggered == true:
   - Return (already triggered)
2. If percentage >= 100f:
   - Set gameOverTriggered = true
   - Start coroutine: GameOverSequence()
```

### 4. Game Over Sequence

```
Coroutine GameOverSequence():
1. yield return new WaitForSeconds(gameOverDelay)
2. Activate blackScreenPanel: SetActive(true)
3. Deactivate monsterObject: SetActive(false)
4. Log game over message
```

## Correctness Properties

### P1: Singleton Uniqueness
**Property:** For any game state, only one GameManager instance exists
**Verification:** instance != null and only one GameObject with GameManager
**Covers:** AC1.1, AC1.2

### P2: Singleton Persistence
**Property:** For any scene load, the GameManager instance persists
**Verification:** DontDestroyOnLoad called on singleton instance
**Covers:** AC1.3

### P3: Subscription Safety
**Property:** For any enable/disable cycle, subscription is properly managed
**Verification:** Subscribe in OnEnable, unsubscribe in OnDisable
**Covers:** AC2.1, AC2.2

### P4: Game Over Trigger
**Property:** When lose completion reaches 100%, game over triggers exactly once
**Verification:** gameOverTriggered flag prevents multiple triggers
**Covers:** AC2.3, AC2.4

### P5: Delayed Activation
**Property:** Black screen activates after gameOverDelay seconds
**Verification:** Coroutine uses WaitForSeconds(gameOverDelay)
**Covers:** AC3.2, AC3.3, AC3.4

### P6: Monster Deactivation
**Property:** When black screen activates, monster GameObject is deactivated
**Verification:** monsterObject.SetActive(false) called in coroutine
**Covers:** AC4.2, AC4.3

### P7: Initial State
**Property:** At game start, black screen is inactive
**Verification:** blackScreenPanel starts inactive in scene
**Covers:** AC3.5

## Implementation Details

### Singleton Pattern

```csharp
private static GameManager instance;

public static GameManager Instance => instance;

void Awake()
{
    if (instance == null)
    {
        instance = this;
        DontDestroyOnLoad(gameObject);
    }
    else if (instance != this)
    {
        Destroy(gameObject);
        return;
    }
}
```

### Subscription Pattern

```csharp
void OnEnable()
{
    GameObserver.Notifier += OnLoseCompletionChanged;
}

void OnDisable()
{
    GameObserver.Notifier -= OnLoseCompletionChanged;
}

void OnLoseCompletionChanged(float percentage)
{
    if (gameOverTriggered)
    {
        return;
    }
    
    if (percentage >= 100f)
    {
        gameOverTriggered = true;
        StartCoroutine(GameOverSequence());
    }
}
```

### Game Over Coroutine

```csharp
IEnumerator GameOverSequence()
{
    yield return new WaitForSeconds(gameOverDelay);
    
    blackScreenPanel.SetActive(true);
    monsterObject.SetActive(false);
    
    Debug.Log("GameManager: Game Over");
}
```

## Edge Cases

### E1: Multiple GameManager Instances
**Scenario:** Two GameManager GameObjects in scene
**Handling:** Singleton pattern destroys duplicate

### E2: Missing References
**Scenario:** blackScreenPanel or monsterObject not assigned
**Handling:** Validation in Start() logs warnings

### E3: Game Over Before Subscription
**Scenario:** 100% reached before OnEnable
**Handling:** Unlikely, but subscription happens in OnEnable before game starts

### E4: Rapid Percentage Updates
**Scenario:** Multiple notifications at 100%
**Handling:** gameOverTriggered flag prevents multiple coroutine starts

## Performance Considerations

- **Singleton Access**: O(1) static property access
- **Coroutine**: Single coroutine, minimal overhead
- **Monster Deactivation**: Stops Update() calls immediately
- **No Allocations**: Coroutine allocated once, reused by Unity

## Integration with GameObserver

```csharp
// GameManager subscribes to Notifier
void OnEnable()
{
    GameObserver.Notifier += OnLoseCompletionChanged;
}

// Receives percentage updates
void OnLoseCompletionChanged(float percentage)
{
    if (percentage >= 100f)
    {
        // Trigger game over
    }
}
```

## UI Setup

### Black Screen Panel
- Canvas with UI Panel
- Panel covers entire screen
- Black color (RGBA: 0, 0, 0, 255)
- Starts inactive in scene
- Activated by GameManager on game over

## Future Enhancements (Out of Scope)

- Restart button
- Game over text/UI
- Score display
- Fade to black effect
- Sound effects
- Menu navigation
- Statistics display
- Multiple game over conditions

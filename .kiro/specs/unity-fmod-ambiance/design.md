# Unity FMOD Ambiance - Design

## Architecture Overview

Extends AudioManager with ambiance EventReference and EventInstance. Ambiance starts on initialization and stops via GameManager calls.

## Data Model

```csharp
[Header("Ambiance")]
[SerializeField] private EventReference ambianceRef;

private EventInstance ambianceInstance;
```

## Core Methods

### PlayAmbiance()
```csharp
public void PlayAmbiance()
{
    if (!isInitialized) return;
    if (!ambianceInstance.isValid()) return;
    ambianceInstance.start();
}
```

### StopAmbiance()
```csharp
public void StopAmbiance()
{
    if (ambianceInstance.isValid())
    {
        ambianceInstance.stop(FMOD.Studio.STOP_MODE.ALLOWFADEOUT);
    }
}
```

## Integration Points

### AudioManager.InitializeWhenBanksLoaded()
- Create ambianceInstance from ambianceRef
- Call PlayAmbiance() after initialization

### GameManager.GameOverSequence()
- Add AudioManager.Instance.StopAmbiance()

### GameManager.GameWon()
- Add AudioManager.Instance.StopAmbiance()

### AudioManager.OnDisable()
- Stop and release ambianceInstance

## Correctness Properties

### P1: Ambiance Initialization
**Property:** Ambiance instance created after banks loaded
**Covers:** AC1.2, AC2.1

### P2: Ambiance Stop on Game End
**Property:** Ambiance stops on game over or win
**Covers:** AC3.1, AC3.2

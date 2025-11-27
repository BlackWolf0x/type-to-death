# Unity Camera Shake - Design

## Architecture Overview

The Camera Shake system consists of a single `CameraShake` script that:
1. Stores 4 shake intensity levels in a serialized array
2. Subscribes to GameObserver.Notifier for lose completion updates
3. Calculates which intensity to use based on percentage ranges
4. Shakes the camera every frame in Update() using current intensity
5. Randomly displaces camera on X and Y axes only
6. Provides StopShake() method to disable shake

This creates dynamic camera shake that intensifies with danger level.

## Component Structure

### CameraShake (MonoBehaviour)

**Responsibilities:**
- Store 4 shake intensity levels
- Subscribe to GameObserver.Notifier
- Calculate intensity index from lose completion
- Cache original camera position
- Shake camera every frame using current intensity
- Randomly displace camera on X and Y axes
- Preserve Z position
- Provide StopShake() method

**Dependencies:**
- Unity Transform component
- GameObserver (Notifier action)
- Random.Range for displacement

## Data Model

### Configuration Variables

```csharp
[Header("Shake Settings")]
[SerializeField] private float[] shakeIntensities = new float[4];
```

### Runtime State

```csharp
private Vector3 originalPosition;
private float currentIntensity = 0f;
```

## Core Algorithms

### 1. Initialization

```
On Start:
1. Cache originalPosition = transform.localPosition
```

### 2. GameObserver Subscription

```
On OnEnable:
1. Subscribe: GameObserver.Notifier += OnLoseCompletionChanged

On OnDisable:
1. Unsubscribe: GameObserver.Notifier -= OnLoseCompletionChanged
```

### 3. Intensity Calculation

```
GetShakeIndex(float loseCompletion):
1. If loseCompletion < 25: return 0
2. Else if loseCompletion < 50: return 1
3. Else if loseCompletion < 75: return 2
4. Else: return 3
```

### 4. Lose Completion Handler

```
OnLoseCompletionChanged(float percentage):
1. Calculate index = GetShakeIndex(percentage)
2. Set currentIntensity = shakeIntensities[index]
```

### 5. Perpetual Shake

```
On Update (every frame):
1. If currentIntensity == 0:
   - Set position = originalPosition
   - Return
2. Calculate randomX = Random.Range(-currentIntensity, currentIntensity)
3. Calculate randomY = Random.Range(-currentIntensity, currentIntensity)
4. Set position = originalPosition + (randomX, randomY, 0)
```

### 6. Stop Shake

```
StopShake():
1. Set currentIntensity = 0
```

## Correctness Properties

### P1: Z Position Preservation
**Property:** For any shake, the camera's Z position equals originalPosition.z
**Verification:** Shake only modifies X and Y, Z is always originalPosition.z
**Covers:** AC3.3

### P2: Random Displacement
**Property:** For any shake frame, X and Y displacement is within [-intensity, intensity]
**Verification:** Random.Range(-intensity, intensity) used for both axes
**Covers:** AC3.1, AC3.2, AC3.4

### P3: Intensity Level Mapping
**Property:** For any lose completion percentage, the correct intensity index is calculated
**Verification:** GetShakeIndex returns 0 for 0-24%, 1 for 25-49%, 2 for 50-74%, 3 for 75-100%
**Covers:** AC4.3, AC4.4, AC4.5, AC4.6

### P4: GameObserver Integration
**Property:** CameraShake receives lose completion updates from GameObserver
**Verification:** Subscribe to Notifier in OnEnable, unsubscribe in OnDisable
**Covers:** AC4.1, AC4.2

### P5: Zero Intensity Behavior
**Property:** When currentIntensity is 0, camera position equals originalPosition
**Verification:** Update() sets position to originalPosition when currentIntensity == 0
**Covers:** AC5.3, AC6.3

### P6: Continuous Shake
**Property:** When currentIntensity > 0, camera shakes every frame
**Verification:** Update() applies random displacement each frame
**Covers:** AC5.1, AC5.2

### P7: Stop Functionality
**Property:** StopShake() sets currentIntensity to 0
**Verification:** StopShake() method sets currentIntensity = 0
**Covers:** AC6.1, AC6.2

### P6: Original Position Caching
**Property:** Original position is cached on Start and never changes
**Verification:** originalPosition set once in Start()
**Covers:** AC1.3, AC5.2

## Implementation Details

### Update Method

```csharp
void Update()
{
    if (intensity == 0f)
    {
        transform.localPosition = originalPosition;
        return;
    }
    
    float randomX = Random.Range(-intensity, intensity);
    float randomY = Random.Range(-intensity, intensity);
    
    transform.localPosition = originalPosition + new Vector3(randomX, randomY, 0f);
}
```

## Edge Cases

### E1: Zero Intensity
**Scenario:** Intensity set to 0
**Handling:** Camera returns to originalPosition and stays there

### E2: Camera Moved After Start
**Scenario:** Camera position changed by other scripts
**Handling:** Shake uses cached originalPosition, may cause drift (expected behavior)

### E3: Negative Intensity
**Scenario:** Intensity set to negative value
**Handling:** Random.Range works with negative values, shake still functions

### E4: Very High Intensity
**Scenario:** Intensity set to very high value (e.g., 10)
**Handling:** Camera shakes with large displacement, may look erratic

## Performance Considerations

- **Update Method**: Runs every frame, minimal overhead
- **Random.Range**: Minimal CPU cost, called twice per frame
- **Vector3 Addition**: Simple math, negligible cost
- **No Allocations**: No allocations per frame
- **Early Return**: When intensity is 0, only one comparison per frame

## Usage Examples

### Example 1: Adjust Intensity in Inspector

```
1. Select Main Camera
2. Find CameraShake component
3. Adjust Intensity:
   - 0 = No shake
   - 0.05 = Subtle shake
   - 0.1 = Medium shake
   - 0.2 = Strong shake
```

### Example 2: Control Intensity from Script

```csharp
public class GameManager : MonoBehaviour
{
    private CameraShake cameraShake;
    
    void Start()
    {
        cameraShake = Camera.main.GetComponent<CameraShake>();
    }
    
    void OnLoseCompletionChanged(float percentage)
    {
        // Increase shake intensity as danger increases
        float shakeIntensity = percentage / 100f * 0.2f;
        // Note: Would need public intensity setter for this
    }
}
```

## Future Enhancements (Out of Scope)

- Shake curves/easing
- Directional shake
- Shake on Z axis option
- Public intensity setter for runtime control
- Shake intensity based on lose completion
- Smooth intensity transitions
- Frequency control

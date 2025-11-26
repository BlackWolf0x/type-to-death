# Unity Camera Shake - Implementation Plan

## Tasks Overview

- [x] 1. Create CameraShake Script Structure
  - Create `CameraShake.cs` in `Assets/Scripts/`
  - Add serialized field: intensity (default 0.1f)
  - Add private Vector3 originalPosition field
  - _Properties: P6_
  - _Requirements: AC1.1, AC1.2, AC2.1, AC2.2, AC2.3, AC2.4_

- [x] 2. Implement Initialization
  - Implement Start() method
  - Cache originalPosition = transform.localPosition
  - _Properties: P6_
  - _Requirements: AC1.3, AC5.3_

- [x] 3. Implement Perpetual Shake
  - Create Update() method
  - Check if intensity == 0f:
    - Set transform.localPosition = originalPosition
    - Return
  - Calculate randomX = Random.Range(-intensity, intensity)
  - Calculate randomY = Random.Range(-intensity, intensity)
  - Set transform.localPosition = originalPosition + new Vector3(randomX, randomY, 0f)
  - _Properties: P1, P2, P3, P4, P5_
  - _Requirements: AC1.4, AC2.3, AC3.1, AC3.2, AC3.3, AC3.4, AC4.1, AC4.2, AC4.3, AC4.4, AC5.1, AC5.2, AC5.4_

- [x] 4. Add Intensity Levels Array
  - Replace single intensity field with float[] shakeIntensities (size 4)
  - Add private float currentIntensity field (default 0f)
  - _Properties: P3_
  - _Requirements: AC2.1, AC2.2, AC2.3_

- [x] 5. Implement GameObserver Subscription
  - Add OnEnable() method
  - Subscribe: GameObserver.Notifier += OnLoseCompletionChanged
  - Add OnDisable() method
  - Unsubscribe: GameObserver.Notifier -= OnLoseCompletionChanged
  - _Properties: P4_
  - _Requirements: AC4.1, AC4.2_

- [x] 6. Implement Intensity Calculation
  - Create GetShakeIndex(float loseCompletion) method
  - If loseCompletion < 25f: return 0
  - Else if loseCompletion < 50f: return 1
  - Else if loseCompletion < 75f: return 2
  - Else: return 3
  - _Properties: P3_
  - _Requirements: AC4.3, AC4.4, AC4.5, AC4.6_

- [x] 7. Implement Lose Completion Handler
  - Create OnLoseCompletionChanged(float percentage) method
  - Calculate index = GetShakeIndex(percentage)
  - Set currentIntensity = shakeIntensities[index]
  - _Properties: P3, P4_
  - _Requirements: AC4.3, AC4.4, AC4.5, AC4.6_

- [x] 8. Update Shake Logic to Use Current Intensity
  - In Update(), change intensity checks to currentIntensity
  - Use currentIntensity in Random.Range calls
  - _Properties: P5, P6_
  - _Requirements: AC5.1, AC5.2, AC5.3_

- [x] 9. Implement StopShake Method
  - Create public StopShake() method
  - Set currentIntensity = 0
  - _Properties: P7_
  - _Requirements: AC6.1, AC6.2, AC6.3_

- [x] 10. Integrate with GameManager
  - Open GameManager.cs
  - Find GameOverSequence() coroutine
  - After blackScreenPanel.SetActive(true)
  - Add: Camera.main.GetComponent<CameraShake>().StopShake()
  - _Properties: P7_
  - _Requirements: AC6.4_

## Manual Unity Setup Tasks

### Setup Task A: Attach CameraShake to Main Camera
1. Select Main Camera in Hierarchy
2. Add Component → CameraShake
3. Adjust Intensity in Inspector (default 0.1)
4. Adjust Duration in Inspector (default 0.2)

### Setup Task B: Test Camera Shake
1. Press Play in Unity Editor
2. Verify camera shakes continuously
3. Verify camera shakes on X and Y only (Z unchanged)
4. Adjust Intensity in Inspector while playing
5. Set Intensity to 0, verify camera stops at original position
6. Set Intensity back to 0.1, verify shake resumes

## Implementation Notes

- **Simple Script**: Single MonoBehaviour, no dependencies
- **Update-Based**: Shake runs every frame in Update()
- **Z Preservation**: Always use originalPosition.z, never modify
- **Zero Intensity**: Camera returns to original position when intensity is 0
- **Perpetual**: Shakes continuously while intensity > 0
- **Minimal Comments**: Keep code clean and self-explanatory

## Estimated Effort

- Total Tasks: 3 coding tasks + 2 manual setup tasks
- Estimated Coding Time: 15 minutes
- Estimated Setup Time: 5 minutes
- Complexity: Low
- Risk Level: Low

## Dependencies

- Unity 6.1
- Main Camera GameObject
- Random.Range

## Usage Pattern

```csharp
// Shake runs automatically based on intensity field
// Set intensity in Inspector or via script (if public setter added)

// To disable shake: Set intensity to 0 in Inspector
// To enable shake: Set intensity > 0 in Inspector

// Example (requires public intensity setter):
CameraShake cameraShake = Camera.main.GetComponent<CameraShake>();
// cameraShake.intensity = 0.2f; // Would need public setter
```

## Performance Notes

- **Update Method**: Runs every frame
- **Early Return**: When intensity is 0, only one comparison per frame
- **Minimal Calculations**: Two Random.Range calls + Vector3 addition per frame when shaking
- **No Allocations**: No allocations per frame

## Code Style Notes

- **No XML summaries**: Keep code clean
- **Minimal comments**: Only comment non-obvious logic
- **Self-documenting**: Clear variable and method names
- **Concise**: Avoid verbose implementations

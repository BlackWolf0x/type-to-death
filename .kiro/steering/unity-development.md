# Unity Development Standards

## Overview

This project includes a Unity game located in `unity/kiroween/`. This document defines standards and best practices for Unity C# development.

**Unity Version: 6.1**

All code, APIs, and patterns must be compatible with Unity 6.1. This version includes:
- Unity 6 LTS features
- Enhanced performance and rendering
- Updated Input System
- Improved physics and animation systems

## File Organization

### Script Location

**All Unity C# scripts MUST be placed in:**
```
unity/kiroween/Assets/Scripts/
```

- Default location is the root Scripts folder
- Only create subfolders when explicitly instructed by the user
- Never create scripts outside the Assets/Scripts directory

### Naming Conventions

**Files:**
- PascalCase for all C# files: `PlayerController.cs`, `GameManager.cs`
- Match the class name exactly: `PlayerController.cs` contains `class PlayerController`

**Classes:**
- PascalCase: `PlayerController`, `EnemyAI`, `GameManager`
- MonoBehaviours should have descriptive names ending in purpose: `PlayerMovement`, `CameraFollow`
- Managers: `GameManager`, `AudioManager`, `UIManager`
- Controllers: `PlayerController`, `EnemyController`

**Variables:**
- Private fields: camelCase with no prefix: `moveSpeed`, `isGrounded`
- Public fields: PascalCase: `MaxHealth`, `JumpForce`
- Serialized fields: camelCase with `[SerializeField]`: `[SerializeField] private float moveSpeed;`
- Constants: UPPER_SNAKE_CASE: `MAX_PLAYERS`, `DEFAULT_SPEED`

**Methods:**
- PascalCase: `Move()`, `TakeDamage()`, `CheckGrounded()`
- Use descriptive verb-based names

## Unity-Specific Best Practices

### SerializeField Over Public

```csharp
// ✅ Correct - Private with SerializeField
[SerializeField] private float moveSpeed = 5f;

// ❌ Wrong - Public fields expose to other scripts unnecessarily
public float moveSpeed = 5f;
```

### Null Checks for Unity Objects

```csharp
// ✅ Correct - Always check Unity objects
if (player != null)
{
    player.TakeDamage(10);
}

// ✅ Also correct - Null-conditional operator
player?.TakeDamage(10);
```

### Cache Component References

```csharp
// ✅ Correct - Cache in Awake/Start
private Rigidbody rb;

void Awake()
{
    rb = GetComponent<Rigidbody>();
}

void Update()
{
    rb.AddForce(Vector3.up);
}

// ✅ Unity 6.1 - Use TryGetComponent for safer access
private Rigidbody rb;

void Awake()
{
    if (!TryGetComponent(out rb))
    {
        Debug.LogError("Rigidbody component not found!");
    }
}

// ❌ Wrong - GetComponent every frame
void Update()
{
    GetComponent<Rigidbody>().AddForce(Vector3.up);
}
```

### Use Appropriate Unity Lifecycle Methods

```csharp
// Awake - Initialize references, called before Start
void Awake()
{
    rb = GetComponent<Rigidbody>();
}

// Start - Initialize values, called after all Awakes
void Start()
{
    health = maxHealth;
}

// Update - Per-frame logic, input handling
void Update()
{
    HandleInput();
}

// FixedUpdate - Physics calculations
void FixedUpdate()
{
    rb.AddForce(moveDirection * moveSpeed);
}

// LateUpdate - Camera following, after all Updates
void LateUpdate()
{
    camera.transform.position = player.position;
}
```

### Avoid Update When Possible

```csharp
// ✅ Correct - Use events/callbacks
public event Action OnPlayerDeath;

void Die()
{
    OnPlayerDeath?.Invoke();
}

// ❌ Wrong - Checking every frame
void Update()
{
    if (health <= 0)
    {
        Die();
    }
}
```

### Use Coroutines for Timed Actions

```csharp
// ✅ Correct - Coroutine for delays
IEnumerator RespawnAfterDelay(float delay)
{
    yield return new WaitForSeconds(delay);
    Respawn();
}

// Start it with
StartCoroutine(RespawnAfterDelay(3f));
```

### Layer and Tag Usage

```csharp
// ✅ Correct - Use CompareTag
if (other.CompareTag("Player"))
{
    // Handle collision
}

// ❌ Wrong - String comparison creates garbage
if (other.tag == "Player")
{
    // Handle collision
}
```

### Vector Math Optimization

```csharp
// ✅ Correct - Use sqrMagnitude for distance checks
if ((target.position - transform.position).sqrMagnitude < detectionRange * detectionRange)
{
    // Target in range
}

// ❌ Wrong - Magnitude uses expensive sqrt
if (Vector3.Distance(target.position, transform.position) < detectionRange)
{
    // Target in range
}
```

## Code Structure

### MonoBehaviour Template

```csharp
using UnityEngine;

public class ExampleScript : MonoBehaviour
{
    // Serialized fields (visible in Inspector)
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private Transform target;
    
    // Private fields
    private Rigidbody rb;
    private bool isActive;
    
    // Constants
    private const float MAX_SPEED = 10f;
    
    // Unity lifecycle methods
    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }
    
    void Start()
    {
        isActive = true;
    }
    
    void Update()
    {
        if (isActive)
        {
            HandleMovement();
        }
    }
    
    // Public methods
    public void Activate()
    {
        isActive = true;
    }
    
    // Private methods
    private void HandleMovement()
    {
        // Movement logic
    }
}
```

### ScriptableObject Template

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "NewData", menuName = "Game/Data")]
public class GameData : ScriptableObject
{
    [Header("Player Settings")]
    [SerializeField] private float maxHealth = 100f;
    [SerializeField] private float moveSpeed = 5f;
    
    public float MaxHealth => maxHealth;
    public float MoveSpeed => moveSpeed;
}
```

## Documentation and Specs

### Unity Specs

All Unity-related specs MUST be prefixed with "unity-":
- `unity-player-movement.md`
- `unity-enemy-ai.md`
- `unity-inventory-system.md`

Store in `.kiro/specs/unity-*.md`

### Unity Documentation

All Unity-related AI-generated documentation MUST be prefixed with "unity-":
- `docs-ai/unity-architecture-overview.md`
- `docs-ai/unity-implementation-report.md`

### Code Comments

```csharp
// ✅ Correct - Explain WHY, not WHAT
// Delay respawn to allow death animation to complete
yield return new WaitForSeconds(2f);

// ❌ Wrong - Obvious comment
// Wait 2 seconds
yield return new WaitForSeconds(2f);
```

## Unity 6.1 Specific Features

### Awaitable (Async/Await Support)

Unity 6 introduces `Awaitable` as a more efficient alternative to coroutines for async operations:

```csharp
using UnityEngine;

public class AsyncExample : MonoBehaviour
{
    async void Start()
    {
        await DelayedAction();
    }
    
    // ✅ Unity 6.1 - Use Awaitable instead of IEnumerator
    private async Awaitable DelayedAction()
    {
        await Awaitable.WaitForSecondsAsync(2f);
        Debug.Log("Action completed");
    }
    
    // ✅ Awaitable with cancellation
    private async Awaitable LoadDataAsync(CancellationToken cancellationToken)
    {
        await Awaitable.WaitForSecondsAsync(1f, cancellationToken);
        // Load data
    }
    
    // Still valid - Coroutines for simple cases
    private IEnumerator SimpleDelay()
    {
        yield return new WaitForSeconds(1f);
        Debug.Log("Simple delay");
    }
}
```

### When to Use Awaitable vs Coroutines

```csharp
// ✅ Use Awaitable for:
// - Complex async operations
// - Operations that need cancellation
// - Better error handling with try/catch
// - Returning values from async methods

// ✅ Use Coroutines for:
// - Simple delays and animations
// - Frame-based operations (yield return null)
// - When you need WaitForEndOfFrame or WaitForFixedUpdate
```

## Common Patterns

### Singleton Pattern (Use Sparingly)

```csharp
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
```

### Object Pooling

```csharp
// For frequently instantiated objects (bullets, particles, etc.)
public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int poolSize = 10;
    
    private Queue<GameObject> pool = new Queue<GameObject>();
    
    void Start()
    {
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }
    
    public GameObject Get()
    {
        if (pool.Count > 0)
        {
            GameObject obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        return Instantiate(prefab);
    }
    
    public void Return(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## Input System (New Input System)

This project uses Unity's **New Input System**. Never use the old Input class.

### Input Actions Asset

The project has an Input Actions asset at:
```
unity/kiroween/Assets/InputSystem_Actions.inputactions
```

### Setting Up Input in Scripts

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    private PlayerInput playerInput;
    private InputAction moveAction;
    private InputAction jumpAction;
    
    void Awake()
    {
        playerInput = GetComponent<PlayerInput>();
        
        // Get actions from the Input Actions asset
        moveAction = playerInput.actions["Move"];
        jumpAction = playerInput.actions["Jump"];
    }
    
    void OnEnable()
    {
        // Subscribe to action events
        jumpAction.performed += OnJump;
    }
    
    void OnDisable()
    {
        // Unsubscribe to prevent memory leaks
        jumpAction.performed -= OnJump;
    }
    
    void Update()
    {
        // Read continuous input
        Vector2 moveInput = moveAction.ReadValue<Vector2>();
        Move(moveInput);
    }
    
    private void OnJump(InputAction.CallbackContext context)
    {
        // Handle jump action
        Jump();
    }
}
```

### Using Player Input Component

```csharp
// Option 1: Send Messages (simplest)
// Add PlayerInput component in Unity, set Behavior to "Send Messages"
// Then add these methods to your script:

public void OnMove(InputValue value)
{
    Vector2 moveInput = value.Get<Vector2>();
    // Handle movement
}

public void OnJump(InputValue value)
{
    if (value.isPressed)
    {
        // Handle jump
    }
}

// Option 2: Unity Events
// Set Behavior to "Invoke Unity Events" in PlayerInput component
// Then assign methods in the Inspector

// Option 3: C# Events (shown above, most flexible)
```

### Input Action Types

```csharp
// Button (Press/Release)
jumpAction.performed += ctx => Jump();
jumpAction.canceled += ctx => StopJumping();

// Value (Continuous like joystick)
Vector2 moveInput = moveAction.ReadValue<Vector2>();

// Pass-Through (Immediate response)
float lookDelta = lookAction.ReadValue<float>();
```

### Best Practices

```csharp
// ✅ Correct - Use New Input System
private InputAction moveAction;
Vector2 input = moveAction.ReadValue<Vector2>();

// ❌ Wrong - Never use old Input class
float horizontal = Input.GetAxis("Horizontal");
bool jump = Input.GetKeyDown(KeyCode.Space);
```

### Common Input Patterns

```csharp
// Reading 2D movement (WASD, joystick)
Vector2 moveInput = moveAction.ReadValue<Vector2>();
Vector3 moveDirection = new Vector3(moveInput.x, 0, moveInput.y);

// Reading mouse delta
Vector2 lookDelta = lookAction.ReadValue<Vector2>();

// Checking if button is pressed
bool isJumping = jumpAction.IsPressed();

// One-time button press
if (jumpAction.WasPressedThisFrame())
{
    Jump();
}

// Button released
if (jumpAction.WasReleasedThisFrame())
{
    StopJumping();
}
```

### Input System References

- Always cache InputAction references in Awake
- Subscribe to events in OnEnable, unsubscribe in OnDisable
- Use ReadValue<T>() for continuous input in Update
- Use performed/canceled callbacks for discrete actions

## Performance Considerations

1. **Avoid FindObjectOfType in Update** - Cache references, use FindAnyObjectByType for Unity 6+
2. **Use object pooling** for frequently spawned objects
3. **Minimize garbage collection** - avoid allocations in Update
4. **Use sqrMagnitude** instead of Distance for comparisons
5. **Layer masks** for raycasts to reduce checks
6. **Use Awaitable or Coroutines** instead of Update for timed actions
7. **Cache Input Actions** - Get references in Awake, not every frame
8. **Use TryGetComponent** instead of GetComponent with null checks
9. **Burst Compiler** - Consider for performance-critical math operations
10. **Jobs System** - For heavy computations that can be parallelized

## Communication with React

### Sending Data to React

```csharp
#if UNITY_WEBGL && !UNITY_EDITOR
[System.Runtime.InteropServices.DllImport("__Internal")]
private static extern void SendToReact(string eventName, string data);
#endif

public void NotifyReact(string eventName, string jsonData)
{
    #if UNITY_WEBGL && !UNITY_EDITOR
    SendToReact(eventName, jsonData);
    #endif
}
```

### Receiving Data from React

```csharp
// Method must be public to be called from React
public void ReceiveFromReact(string jsonData)
{
    // Parse and handle data
    var data = JsonUtility.FromJson<DataClass>(jsonData);
    // Process data
}
```

## Testing Workflow

1. **Write the script** - I create/modify C# files
2. **You test in Unity** - Open Unity Editor and test
3. **Report issues** - Tell me about errors or unexpected behavior
4. **Iterate** - I fix based on your feedback

## Resources

- [Unity Scripting Reference](https://docs.unity3d.com/ScriptReference/)
- [Unity Manual](https://docs.unity3d.com/Manual/)
- [Unity Best Practices](https://unity.com/how-to/programming-unity)

## Quick Reference

```csharp
// Component access (Unity 6.1)
TryGetComponent(out Rigidbody rb) // Preferred
GetComponent<Rigidbody>()
GetComponentInChildren<Renderer>()
GetComponentsInChildren<Collider>()

// GameObject operations
Instantiate(prefab, position, rotation)
Destroy(gameObject)
SetActive(true/false)

// Finding objects (Unity 6.1 - Updated API)
FindAnyObjectByType<GameManager>() // Replaces FindObjectOfType
FindFirstObjectByType<GameManager>() // More explicit
FindObjectsByType<Enemy>(FindObjectsSortMode.None) // Replaces FindObjectsOfType

// Transform operations
transform.position
transform.rotation
transform.localScale
transform.Translate(Vector3.forward)
transform.Rotate(Vector3.up, 90f)

// Physics
rb.AddForce(Vector3.up * force)
rb.velocity = new Vector3(x, y, z)
Physics.Raycast(origin, direction, out hit, distance)

// Async operations (Unity 6.1 - Awaitable)
await Awaitable.WaitForSecondsAsync(delay)
await Awaitable.NextFrameAsync()
await Awaitable.EndOfFrameAsync()
await Awaitable.FixedUpdateAsync()

// Coroutines (still valid)
StartCoroutine(MethodName())
StopCoroutine(MethodName())
yield return new WaitForSeconds(delay)
yield return null // Wait one frame

// Input (New Input System)
// See Input System section for proper usage

// Time
Time.deltaTime
Time.fixedDeltaTime
Time.time
Time.timeScale
```

## Unity 6.1 API Changes

### Deprecated APIs to Avoid

```csharp
// ❌ Deprecated in Unity 6
FindObjectOfType<T>() // Use FindAnyObjectByType<T>()
FindObjectsOfType<T>() // Use FindObjectsByType<T>(FindObjectsSortMode.None)

// ✅ Unity 6.1 replacements
FindAnyObjectByType<GameManager>()
FindFirstObjectByType<GameManager>()
FindObjectsByType<Enemy>(FindObjectsSortMode.None)
```

### New Features to Leverage

```csharp
// Awaitable for async operations
await Awaitable.WaitForSecondsAsync(1f);

// TryGetComponent for safer component access
if (TryGetComponent(out Rigidbody rb))
{
    rb.AddForce(Vector3.up);
}

// Enhanced physics and rendering APIs
// Check Unity 6.1 documentation for latest features
```

## Summary

- ✅ **All code must be compatible with Unity 6.1**
- ✅ Scripts go in `unity/kiroween/Assets/Scripts/`
- ✅ Prefix Unity specs/docs with "unity-"
- ✅ Use PascalCase for classes, camelCase for private fields
- ✅ Cache component references in Awake/Start with TryGetComponent
- ✅ Use SerializeField instead of public fields
- ✅ **Always use New Input System, never old Input class**
- ✅ Use FindAnyObjectByType instead of deprecated FindObjectOfType
- ✅ Prefer Awaitable for complex async operations, coroutines for simple cases
- ✅ Optimize with sqrMagnitude, object pooling, and proper lifecycle methods
- ✅ Document WHY, not WHAT

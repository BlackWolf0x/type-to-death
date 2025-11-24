using UnityEngine;
using UnityEngine.InputSystem;

public class MonsterController : MonoBehaviour
{
    // ===== Serialized Configuration Variables =====
    [Header("Monster Configuration")]
    [SerializeField] private int lives = 5;
    [Tooltip("Initial distance from camera where monster spawns")]
    [SerializeField] private float startingDistance = 10f;
    [Tooltip("Distance from camera where sprint attack begins")]
    [SerializeField] private float goalDistance = 2f;
    [Tooltip("Speed of final sprint attack in units per second")]
    [SerializeField] private float sprintSpeed = 5f;

    // ===== Private Runtime State Variables =====
    private int currentLives;
    private bool isSprinting = false;
    private float teleportDistance;
    private bool gameOver = false;

    // ===== Component References =====
    private Camera mainCamera;
    private Animator animator;
    
#if UNITY_EDITOR
    private InputAction testBlinkAction;
#endif

    void Awake()
    {
        // Cache main camera reference
        mainCamera = Camera.main;
        
        // Validate camera exists
        if (mainCamera == null)
        {
            Debug.LogError("MonsterController: Camera.main is null! Ensure a camera is tagged as MainCamera.");
            enabled = false;
            return;
        }

        // Try to get Animator component
        if (!TryGetComponent(out animator))
        {
            Debug.LogWarning("MonsterController: Animator component not found. Sprint animation will not play.");
            // Continue without animator - not critical for core functionality
        }

        Debug.Log("MonsterController: Awake completed successfully.");

        // Calculate spawn position at startingDistance from camera
        Vector3 cameraPosition = mainCamera.transform.position;
        Vector3 cameraForward = mainCamera.transform.forward.normalized;
        
        // Position monster at startingDistance in front of camera
        Vector3 spawnPosition = cameraPosition + (cameraForward * startingDistance);
        
        // Set Y position to 0 (ground level)
        spawnPosition.y = 0f;
        
        // Apply spawn position
        transform.position = spawnPosition;
        
        // Set up editor testing input (New Input System)
#if UNITY_EDITOR
        testBlinkAction = new InputAction("TestBlink", binding: "<Keyboard>/space");
        testBlinkAction.performed += OnTestBlinkPerformed;
#endif
    }
    
    void OnEnable()
    {
        #if UNITY_EDITOR
        testBlinkAction?.Enable();
        #endif
    }
    
    void OnDisable()
    {
        #if UNITY_EDITOR
        testBlinkAction?.Disable();
        #endif
    }
    
    #if UNITY_EDITOR
    private void OnTestBlinkPerformed(InputAction.CallbackContext context)
    {
        Debug.Log("MonsterController: [EDITOR] Spacebar pressed - simulating blink event.");
        OnBlinkDetected();
    }
    #endif

    void Start()
    {
        // Validate and correct configuration values
        ValidateConfiguration();

        // Initialize current lives
        currentLives = lives;

        // Calculate teleport distance per blink
        // Formula: (startingDistance - goalDistance) / (lives - 1)
        if (lives > 1)
        {
            teleportDistance = (startingDistance - goalDistance) / (lives - 1);
        }
        else
        {
            // Edge case: if lives is 1 or less, set to 0
            teleportDistance = 0f;
            Debug.LogWarning("MonsterController: Lives is set to 1 or less. Teleport distance set to 0.");
        }

    
        Debug.Log($"MonsterController: Spawned at distance {startingDistance} from camera. Lives: {currentLives}, Teleport Distance: {teleportDistance}");
    }


    void Update()
    {
        // Handle sprint movement
        if (isSprinting)
        {
            SprintTowardCamera();
        }
    }

    private void ValidateConfiguration()
    {
        bool configChanged = false;

        // Clamp lives to minimum of 2 (need at least 1 teleport + 1 sprint)
        if (lives < 2)
        {
            Debug.LogWarning($"MonsterController: Lives ({lives}) is less than 2. Clamping to 2 (minimum required for teleport + sprint).");
            lives = 2;
            configChanged = true;
        }

        // Ensure goalDistance < startingDistance
        if (goalDistance >= startingDistance)
        {
            Debug.LogWarning($"MonsterController: goalDistance ({goalDistance}) must be less than startingDistance ({startingDistance}). Auto-correcting goalDistance to {startingDistance - 1}.");
            goalDistance = startingDistance - 1f;
            configChanged = true;
        }

        // Ensure distances are positive
        if (startingDistance <= 0f)
        {
            Debug.LogWarning($"MonsterController: startingDistance ({startingDistance}) must be positive. Setting to 10.");
            startingDistance = 10f;
            configChanged = true;
        }

        if (goalDistance < 0f)
        {
            Debug.LogWarning($"MonsterController: goalDistance ({goalDistance}) must be non-negative. Setting to 2.");
            goalDistance = 2f;
            configChanged = true;
        }

        // Ensure sprint speed is positive
        if (sprintSpeed <= 0f)
        {
            Debug.LogWarning($"MonsterController: sprintSpeed ({sprintSpeed}) must be positive. Setting to 5.");
            sprintSpeed = 5f;
            configChanged = true;
        }

        if (configChanged)
        {
            Debug.Log($"MonsterController: Configuration validated and corrected. Lives: {lives}, StartingDistance: {startingDistance}, GoalDistance: {goalDistance}, SprintSpeed: {sprintSpeed}");
        }
    }

    private void SprintTowardCamera()
    {
        Vector3 cameraPosition = mainCamera.transform.position;
        Vector3 currentPosition = transform.position;

        // Calculate direction from monster to camera (on horizontal plane)
        Vector3 directionToCamera = cameraPosition - currentPosition;
        directionToCamera.y = 0f;
        
        // Check if monster has reached camera
        float distanceToCamera = directionToCamera.magnitude;
        if (distanceToCamera < 0.5f)
        {
            // Monster reached camera - trigger game over
            TriggerGameOver();
            return;
        }

        // Normalize direction
        directionToCamera.Normalize();

        // Move toward camera at sprint speed
        Vector3 newPosition = currentPosition + (directionToCamera * sprintSpeed * Time.deltaTime);
        newPosition.y = 0f; // Maintain Y at 0

        // Apply new position
        transform.position = newPosition;
    }

    private void TriggerGameOver()
    {
        if (gameOver)
        {
            return; // Already triggered
        }

        gameOver = true;
        isSprinting = false; // Stop movement

        Debug.Log("MonsterController: GAME OVER! Monster reached the camera.");
    }

    private void TeleportTowardCamera(float distance)
    {
        Vector3 cameraPosition = mainCamera.transform.position;
        Vector3 currentPosition = transform.position;

        // Calculate direction from monster to camera (on horizontal plane)
        Vector3 directionToCamera = cameraPosition - currentPosition;
        directionToCamera.y = 0f;
        directionToCamera.Normalize();

        // Calculate new position
        Vector3 newPosition = currentPosition + (directionToCamera * distance);
        newPosition.y = 0f; // Ensure Y stays at 0

        // Apply new position instantly (no lerp, no animation)
        transform.position = newPosition;
    }

    private void TeleportToGoalDistance()
    {
        Vector3 cameraPosition = mainCamera.transform.position;
        Vector3 directionFromCamera = transform.position - cameraPosition;
        directionFromCamera.y = 0f;
        directionFromCamera.Normalize();

        // Position at exactly goalDistance from camera
        Vector3 newPosition = cameraPosition + (directionFromCamera * goalDistance);
        newPosition.y = 0f; // Ensure Y stays at 0

        // Apply new position instantly
        transform.position = newPosition;
    }

    public void OnBlinkDetected()
    {
        // Early return if already sprinting
        if (isSprinting)
        {
            Debug.Log("MonsterController: Blink ignored - monster is already sprinting.");
            return;
        }

        // Decrement lives
        currentLives--;
        Debug.Log($"MonsterController: Blink detected! Lives remaining: {currentLives}");

        // Branch based on remaining lives
        if (currentLives > 1)
        {
            // Multiple lives remaining - teleport closer by teleportDistance
            TeleportTowardCamera(teleportDistance);
            Debug.Log($"MonsterController: Teleported {teleportDistance} units closer. Distance from camera: {Vector3.Distance(transform.position, mainCamera.transform.position):F2}");
        }
        else if (currentLives == 1)
        {
            // One life remaining - teleport to exactly goal distance
            TeleportToGoalDistance();
            Debug.Log($"MonsterController: Teleported to goal distance ({goalDistance} units from camera).");
        }
        else if (currentLives == 0)
        {
            // No lives remaining - trigger sprint
            // Monster should already be at goalDistance from previous blink
            isSprinting = true;
            
            // Trigger animator parameter if animator exists
            if (animator != null)
            {
                animator.SetBool("isSprinting", true);
                Debug.Log("MonsterController: Sprint animation triggered.");
            }
            
            Debug.Log("MonsterController: Sprint attack initiated! Monster is now moving toward camera.");
        }
    }
}

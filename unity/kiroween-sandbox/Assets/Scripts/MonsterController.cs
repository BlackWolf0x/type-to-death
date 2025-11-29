using UnityEngine;
using UnityEngine.InputSystem;

public class MonsterController : MonoBehaviour
{
    // ===== Serialized Configuration Variables =====
    [Header("Debug Settings")]
    [SerializeField] private bool enableLogging = true;
    
    [Header("Monster Configuration")]
    [SerializeField] private int lives = 5;
    [Tooltip("Initial distance from camera where monster spawns")]
    
    public int Lives {get {return lives;}}
    [SerializeField] private float startingDistance = 10f;
    [Tooltip("Distance from camera where sprint attack begins")]
    [SerializeField] private float goalDistance = 2f;
    [Tooltip("Speed of final sprint attack in units per second")]
    [SerializeField] private float sprintSpeed = 5f;
    
    [Header("Pose Configuration")]
    [Tooltip("Pose displayed when monster first spawns")]
    [SerializeField] private AnimationClip startingPose;
    [Tooltip("Pose displayed at goal distance before sprint begins")]
    [SerializeField] private AnimationClip finalPose;
    [Tooltip("Array of poses randomly selected during intermediate teleports")]
    [SerializeField] private AnimationClip[] randomPoses;

    // ===== Private Runtime State Variables =====
    private int currentLives;
    
    public int CurrentLives {get {return currentLives;}}
    [SerializeField] private bool isSprinting = false;
    private float teleportDistance;
    private bool gameOver = false;
    private AnimationClip lastRandomPose = null;

    // ===== Logging =====
    private enum LogType { Log, Warning, Error }
    
    private void MonsterLog(object message, LogType logType = LogType.Log)
    {
        if (!enableLogging) return;
        
        switch (logType)
        {
            case LogType.Log:
                Debug.Log($"MonsterController: {message}");
                break;
            case LogType.Warning:
                Debug.LogWarning($"MonsterController: {message}");
                break;
            case LogType.Error:
                Debug.LogError($"MonsterController: {message}");
                break;
        }
    }

    // ===== Component References =====
    private Camera mainCamera;
    private Animator animator;
    private AnimatorOverrideController overrideController;
    
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
            MonsterLog("Camera.main is null! Ensure a camera is tagged as MainCamera.", LogType.Error);
            enabled = false;
            return;
        }

        // Try to get Animator component
        if (!TryGetComponent(out animator))
        {
            MonsterLog("Animator component not found. Sprint animation will not play.", LogType.Warning);
            // Continue without animator - not critical for core functionality
        }
        else
        {
            // Create AnimatorOverrideController for dynamic pose swapping
            if (animator.runtimeAnimatorController != null)
            {
                overrideController = new AnimatorOverrideController(animator.runtimeAnimatorController);
                animator.runtimeAnimatorController = overrideController;
                MonsterLog("AnimatorOverrideController created for dynamic pose management.");
            }
            else
            {
                MonsterLog("Animator has no controller assigned. Poses will not work.", LogType.Warning);
            }
        }

        MonsterLog("Awake completed successfully.");

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
        MonsterLog("[EDITOR] Spacebar pressed - simulating blink event.");
        OnBlinkDetected();
    }
    #endif

    void Start()
    {
        // Validate and correct configuration values
        ValidateConfiguration();
        
        // Validate pose assignments
        ValidatePoses();

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
            MonsterLog("Lives is set to 1 or less. Teleport distance set to 0.", LogType.Warning);
        }

        
        // Rotate monster to face camera
        Vector3 cameraPosition = mainCamera.transform.position;
        Vector3 directionToCamera = cameraPosition - transform.position;
        directionToCamera.y = 0f; // Keep rotation on horizontal plane
        
        if (directionToCamera != Vector3.zero)
        {
            transform.rotation = Quaternion.LookRotation(directionToCamera);
        }
    
        MonsterLog($"Spawned at distance {startingDistance} from camera. Lives: {currentLives}, Teleport Distance: {teleportDistance}");
        
        // Apply starting pose
        ApplyPose(startingPose);
        MonsterLog("Starting pose applied.");
    }


    void Update()
    {
        // Handle sprint movement
        if (isSprinting)
        {
            SprintTowardCamera();
        }
    }

    private void ValidatePoses()
    {
        bool hasErrors = false;
        
        // Check if starting pose is assigned
        if (startingPose == null)
        {
            MonsterLog("Starting Pose is not assigned! Please assign a pose in the Inspector.", LogType.Error);
            hasErrors = true;
        }
        
        // Check if final pose is assigned
        if (finalPose == null)
        {
            MonsterLog("Final Pose is not assigned! Please assign a pose in the Inspector.", LogType.Error);
            hasErrors = true;
        }
        
        // Check if random poses array has at least 1 element
        if (randomPoses == null || randomPoses.Length == 0)
        {
            MonsterLog("Random Poses array is empty! Please assign at least one random pose.", LogType.Error);
            hasErrors = true;
        }
        else
        {
            // Check for null elements in random poses array
            int nullCount = 0;
            for (int i = 0; i < randomPoses.Length; i++)
            {
                if (randomPoses[i] == null)
                {
                    MonsterLog($"Random Poses[{i}] is null. This element will be skipped.", LogType.Warning);
                    nullCount++;
                }
            }
            
            // If all elements are null, that's an error
            if (nullCount == randomPoses.Length)
            {
                MonsterLog("All Random Poses are null! Please assign at least one valid pose.", LogType.Error);
                hasErrors = true;
            }
        }
        
        // Disable script if critical errors found
        if (hasErrors)
        {
            MonsterLog("Pose validation failed. Script disabled.", LogType.Error);
            enabled = false;
            return;
        }
        
        MonsterLog("Pose validation successful.");
    }
    
    private void ValidateConfiguration()
    {
        bool configChanged = false;

        // Clamp lives to minimum of 2 (need at least 1 teleport + 1 sprint)
        if (lives < 2)
        {
            MonsterLog($"Lives ({lives}) is less than 2. Clamping to 2 (minimum required for teleport + sprint).", LogType.Warning);
            lives = 2;
            configChanged = true;
        }

        // Ensure goalDistance < startingDistance
        if (goalDistance >= startingDistance)
        {
            MonsterLog($"goalDistance ({goalDistance}) must be less than startingDistance ({startingDistance}). Auto-correcting goalDistance to {startingDistance - 1}.", LogType.Warning);
            goalDistance = startingDistance - 1f;
            configChanged = true;
        }

        // Ensure distances are positive
        if (startingDistance <= 0f)
        {
            MonsterLog($"startingDistance ({startingDistance}) must be positive. Setting to 10.", LogType.Warning);
            startingDistance = 10f;
            configChanged = true;
        }

        if (goalDistance < 0f)
        {
            MonsterLog($"goalDistance ({goalDistance}) must be non-negative. Setting to 2.", LogType.Warning);
            goalDistance = 2f;
            configChanged = true;
        }

        // Ensure sprint speed is positive
        if (sprintSpeed <= 0f)
        {
            MonsterLog($"sprintSpeed ({sprintSpeed}) must be positive. Setting to 5.", LogType.Warning);
            sprintSpeed = 5f;
            configChanged = true;
        }

        if (configChanged)
        {
            MonsterLog($"Configuration validated and corrected. Lives: {lives}, StartingDistance: {startingDistance}, GoalDistance: {goalDistance}, SprintSpeed: {sprintSpeed}");
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

        MonsterLog("GAME OVER! Monster reached the camera.");
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
    

    private AnimationClip SelectRandomPose()
    {
        // Validate random poses array
        if (randomPoses == null || randomPoses.Length == 0)
        {
            MonsterLog("Cannot select random pose - randomPoses array is empty.", LogType.Warning);
            return null;
        }
        
        // Filter out null elements
        System.Collections.Generic.List<AnimationClip> validPoses = new();
        for (int i = 0; i < randomPoses.Length; i++)
        {
            if (randomPoses[i] != null)
            {
                validPoses.Add(randomPoses[i]);
            }
        }
        
        // Check if we have any valid poses
        if (validPoses.Count == 0)
        {
            MonsterLog("Cannot select random pose - all elements in randomPoses are null.", LogType.Warning);
            return null;
        }
        
        // If only one pose available, return it
        if (validPoses.Count == 1)
        {
            lastRandomPose = validPoses[0];
            MonsterLog($"Selected only available pose '{lastRandomPose.name}'");
            return lastRandomPose;
        }
        
        // Filter out the last pose to avoid repetition
        System.Collections.Generic.List<AnimationClip> availablePoses = new();
        for (int i = 0; i < validPoses.Count; i++)
        {
            if (validPoses[i] != lastRandomPose)
            {
                availablePoses.Add(validPoses[i]);
            }
        }
        
        // Select random index from available poses (excluding last pose)
        int randomIndex = Random.Range(0, availablePoses.Count);
        AnimationClip selectedPose = availablePoses[randomIndex];
        
        // Store for next time
        lastRandomPose = selectedPose;
        
        MonsterLog($"Selected random pose '{selectedPose.name}' (index {randomIndex} of {availablePoses.Count} available poses, excluding last)");
        
        return selectedPose;
    }
    

    private void ApplyPose(AnimationClip poseClip)
    {
        // Validate animator and pose clip
        if (animator == null || overrideController == null)
        {
            MonsterLog("Cannot apply pose - Animator or OverrideController is missing.", LogType.Warning);
            return;
        }
        
        if (poseClip == null)
        {
            MonsterLog("Cannot apply pose - Pose clip is null.", LogType.Warning);
            return;
        }
        
        // Override the "Pose" state's motion with the new pose clip
        overrideController["Pose"] = poseClip;
        
        // Play the "Pose" state at normalized time 0 (first frame)
        animator.Play("Pose", 0, 0f);
        
        MonsterLog($"Applied pose '{poseClip.name}' via AnimatorOverrideController");
    }

    public void OnBlinkDetected()
    {
        // Early return if already sprinting
        if (isSprinting)
        {
            MonsterLog("Blink ignored - monster is already sprinting.");
            return;
        }

        // Decrement lives
        currentLives--;
        MonsterLog($"Blink detected! Lives remaining: {currentLives}");
        
        // Notify GameObserver via static action
        GameObserver.BlinkTracker?.Invoke(currentLives);

        // Branch based on remaining lives
        if (currentLives > 1)
        {
            // Multiple lives remaining - teleport closer by teleportDistance
            TeleportTowardCamera(teleportDistance);
            MonsterLog($"Teleported {teleportDistance} units closer. Distance from camera: {Vector3.Distance(transform.position, mainCamera.transform.position):F2}");
            
            // Apply random pose
            AnimationClip randomPose = SelectRandomPose();
            if (randomPose != null)
            {
                ApplyPose(randomPose);
            }
        }
        else if (currentLives == 1)
        {
            // One life remaining - teleport to exactly goal distance
            TeleportToGoalDistance();
            MonsterLog($"Teleported to goal distance ({goalDistance} units from camera).");
            
            // Apply final pose
            ApplyPose(finalPose);
            MonsterLog("Final pose applied.");
        }
        else if (currentLives == 0)
        {
            // No lives remaining - trigger sprint
            // Monster should already be at goalDistance from previous blink
            isSprinting = true;
            
            // Trigger animator parameter if animator exists
            // This will override any active pose and transition to sprint animation
            if (animator != null)
            {
                animator.SetBool("isSprinting", true);
                MonsterLog("Sprint animation triggered - overriding final pose.");
            }
            
            MonsterLog("Sprint attack initiated! Monster is now moving toward camera.");
        }
    }


}

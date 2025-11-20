using UnityEngine;
using UnityEngine.InputSystem;

public class MonsterController : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float startingDistance = 10f;
    [SerializeField] private float walkSpeed = 1f;
    [SerializeField] private float goalDistance = 2f;
    
    [Header("Animation Settings")]
    [SerializeField] private float animationSpeed = 1f;
    
    // Private references
    private Camera mainCamera;
    private Animator animator;
    private bool isBeingWatched;
    private bool hasReachedGoal;
    
    void Awake()
    {
        // Cache references
        mainCamera = Camera.main;
        
        if (!TryGetComponent(out animator))
        {
            Debug.LogError("MonsterController: Animator component not found!");
        }
    }
    
    void Start()
    {
        // Position monster at starting distance from camera (on ground, y = 0)
        if (mainCamera != null)
        {
            Vector3 cameraForwardFlat = new Vector3(mainCamera.transform.forward.x, 0f, mainCamera.transform.forward.z).normalized;
            Vector3 startPosition = mainCamera.transform.position + cameraForwardFlat * startingDistance;
            startPosition.y = 0f; // Keep monster on ground
            transform.position = startPosition;
        }
        
        // Set initial animation speed
        if (animator != null)
        {
            animator.speed = animationSpeed;
        }
    }
    
    void Update()
    {
        if (hasReachedGoal || mainCamera == null)
            return;
        
        // Check if monster is being watched via raycast
        CheckIfBeingWatched();
        
        // Move toward camera if not being watched
        if (!isBeingWatched)
        {
            MoveTowardCamera();
            PlayWalkAnimation();
        }
        else
        {
            StopWalkAnimation();
        }
        
        // Check if reached goal distance
        CheckGoalDistance();
    }
    
    private void CheckIfBeingWatched()
    {
        // Get mouse position
        Vector2 mousePosition = Mouse.current.position.ReadValue();

        // Perform raycast from camera through mouse/cursor position
        Ray ray = mainCamera.ScreenPointToRay(mousePosition);
        
        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            // Check if the raycast hit this monster
            isBeingWatched = hit.transform == transform;
        }
        else
        {
            isBeingWatched = false;
        }
    }
    
    private void MoveTowardCamera()
    {
        // Calculate direction toward camera (ignore y-axis to keep on ground)
        Vector3 cameraPositionFlat = new Vector3(mainCamera.transform.position.x, 0f, mainCamera.transform.position.z);
        Vector3 monsterPositionFlat = new Vector3(transform.position.x, 0f, transform.position.z);
        Vector3 directionToCamera = (cameraPositionFlat - monsterPositionFlat).normalized;
        
        // Move monster toward camera (keeping y = 0)
        Vector3 newPosition = transform.position + directionToCamera * walkSpeed * Time.deltaTime;
        newPosition.y = 0f; // Keep on ground
        transform.position = newPosition;
        
        // Make monster face the camera (only rotate on y-axis)
        Vector3 lookTarget = new Vector3(mainCamera.transform.position.x, transform.position.y, mainCamera.transform.position.z);
        transform.LookAt(lookTarget);
    }
    
    private void PlayWalkAnimation()
    {
        if (animator != null)
        {
            animator.speed = animationSpeed;
        }
    }
    
    private void StopWalkAnimation()
    {
        if (animator != null)
        {
            animator.speed = 0f;
        }
    }
    
    private void CheckGoalDistance()
    {
        // Calculate horizontal distance only (ignore y-axis)
        Vector3 cameraPositionFlat = new Vector3(mainCamera.transform.position.x, 0f, mainCamera.transform.position.z);
        Vector3 monsterPositionFlat = new Vector3(transform.position.x, 0f, transform.position.z);
        float currentDistance = Vector3.Distance(monsterPositionFlat, cameraPositionFlat);
        
        if (currentDistance <= goalDistance)
        {
            hasReachedGoal = true;
            TriggerGameOver();
        }
    }
    
    private void TriggerGameOver()
    {
        // Stop all movement and animation
        StopWalkAnimation();
        
        Debug.Log("Game Over! Monster reached the player!");
        
        // TODO: Implement attack animation and game over sequence
        // This will be handled in a future spec
    }
    
    // Public method to check if game is over (can be called from other scripts)
    public bool HasReachedGoal()
    {
        return hasReachedGoal;
    }
    
    // Public method to get current distance (for UI/debugging)
    public float GetDistanceFromCamera()
    {
        if (mainCamera != null)
        {
            // Calculate horizontal distance only (ignore y-axis)
            Vector3 cameraPositionFlat = new Vector3(mainCamera.transform.position.x, 0f, mainCamera.transform.position.z);
            Vector3 monsterPositionFlat = new Vector3(transform.position.x, 0f, transform.position.z);
            return Vector3.Distance(monsterPositionFlat, cameraPositionFlat);
        }
        return 0f;
    }
}

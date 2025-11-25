using System;
using UnityEngine;
public class GameObserver : MonoBehaviour
{
    // ===== Static Event System =====
    public static Action<int> BlinkTracker;
    public static Action<float> Notifier;
    
    // ===== Configuration Variables =====
    [Header("Observer Configuration")]
    [Tooltip("Reference to the MonsterController to get initial lives count")]
    [SerializeField] private MonsterController monsterController;
    
    // ===== Runtime State Variables =====
    private int initialLives;
    [SerializeField] private float loseCompletionPercentage = 0f;
    
    
    public float LoseCompletionPercentage => loseCompletionPercentage;    void Start()
    {
        // Validate MonsterController reference
        if (monsterController == null)
        {
            Debug.LogError("GameObserver: MonsterController reference is not assigned! Please assign it in the Inspector.");
            enabled = false;
            return;
        }
        
        // Get initial lives from MonsterController
        initialLives = monsterController.Lives;
        
        // Initialize lose completion percentage to 0
        loseCompletionPercentage = 0f;
        
        // Subscribe to BlinkTracker action
        BlinkTracker += CalculateLoseCompletionPercentage;
        
        Debug.Log($"GameObserver: Initialized successfully. Initial lives: {initialLives}, Starting percentage: {loseCompletionPercentage}%");
    }
    
    void OnDisable()
    {
        // Unsubscribe to prevent memory leaks
        BlinkTracker -= CalculateLoseCompletionPercentage;
    }
    
    private void CalculateLoseCompletionPercentage(int currentLives)
    {
        // Handle edge case: no initial lives
        if (initialLives <= 0)
        {
            Debug.LogWarning("GameObserver: Initial lives is 0 or negative. Setting percentage to 100.");
            loseCompletionPercentage = 100f;
            Notifier?.Invoke(loseCompletionPercentage);
            return;
        }
        
        // Handle edge case: lives increased (unexpected but possible)
        if (currentLives > initialLives)
        {
            Debug.LogWarning($"GameObserver: Current lives ({currentLives}) exceeds initial lives ({initialLives}). Clamping to 0%.");
            loseCompletionPercentage = 0f;
            Notifier?.Invoke(loseCompletionPercentage);
            return;
        }
        
        // Handle edge case: negative lives (shouldn't happen but be safe)
        if (currentLives < 0)
        {
            Debug.LogWarning($"GameObserver: Current lives is negative ({currentLives}). Setting percentage to 100.");
            loseCompletionPercentage = 100f;
            Notifier?.Invoke(loseCompletionPercentage);
            return;
        }
        
        // Calculate lives lost
        int livesLost = initialLives - currentLives;
        
        // Calculate percentage: (livesLost / totalLives) * 100
        float newPercentage = ((float)livesLost / initialLives) * 100f;
        
        // Clamp to valid range [0, 100] (extra safety)
        newPercentage = Mathf.Clamp(newPercentage, 0f, 100f);
        
        // Check if percentage actually changed
        if (Mathf.Approximately(newPercentage, loseCompletionPercentage))
        {
            // Percentage unchanged, no notification needed
            return;
        }
        
        // Update stored percentage
        loseCompletionPercentage = newPercentage;
        
        Debug.Log($"GameObserver: Lose completion percentage updated to {loseCompletionPercentage:F1}%. Notifying subscribers.");
        
        // Invoke Notifier action to broadcast to all subscribers
        Notifier?.Invoke(loseCompletionPercentage);
    }
}

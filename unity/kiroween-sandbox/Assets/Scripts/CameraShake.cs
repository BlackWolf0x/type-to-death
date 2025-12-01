using UnityEngine;

public class CameraShake : MonoBehaviour
{
    [Header("Shake Settings")]
    [SerializeField] private float[] shakeIntensities = new float[4];
    
    private Vector3 originalPosition;
    private float currentIntensity = 0f;
    
    void Start()
    {
        originalPosition = transform.localPosition;
    }
    
    void OnEnable()
    {
        GameObserver.Notifier += OnLoseCompletionChanged;
    }
    
    void OnDisable()
    {
        GameObserver.Notifier -= OnLoseCompletionChanged;
    }
    
    void Update()
    {
        if (currentIntensity == 0f)
        {
            transform.localPosition = originalPosition;
            return;
        }
        
        float randomX = Random.Range(-currentIntensity, currentIntensity);
        float randomY = Random.Range(-currentIntensity, currentIntensity);
        
        transform.localPosition = originalPosition + new Vector3(randomX, randomY, 0f);
    }
    
    int GetShakeIndex(float loseCompletion)
    {
        if (loseCompletion < 25f) return 0;
        if (loseCompletion < 50f) return 1;
        if (loseCompletion < 75f) return 2;
        return 3;
    }
    
    void OnLoseCompletionChanged(float percentage)
    {
        int index = GetShakeIndex(percentage);
        currentIntensity = shakeIntensities[index];
    }
    
    public void StopShake()
    {
        currentIntensity = 0f;
    }
}

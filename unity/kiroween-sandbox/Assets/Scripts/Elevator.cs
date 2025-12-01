using UnityEngine;

public class Elevator : MonoBehaviour
{
    [Header("Descend Animation")]
    [SerializeField] private float startY = 3.7f;
    [SerializeField] private float endY = 1.7f;
    [SerializeField] private float descendDuration = 2f;
    
    [Header("Flicker Settings")]
    [SerializeField] private float minIntensity = 0.1f;
    [SerializeField] private float maxIntensity = 1.5f;
    [SerializeField] private float flickerSpeed = 10f;
    
    private Light pointLight;
    private float descendTimer;
    private bool isDescending = true;
    private float baseIntensity;

    void Awake()
    {
        if (!TryGetComponent(out pointLight))
        {
            Debug.LogError("LightDescendFlicker requires a Light component!");
            enabled = false;
            return;
        }
        
        baseIntensity = pointLight.intensity;
    }

    void Start()
    {
        Vector3 pos = transform.position;
        pos.y = startY;
        transform.position = pos;
        descendTimer = 0f;
        pointLight.intensity = 0f;
    }

    void Update()
    {
        if (isDescending)
        {
            Descend();
        }
        else
        {
            Flicker();
        }
    }

    private void Descend()
    {
        descendTimer += Time.deltaTime;
        float t = Mathf.Clamp01(descendTimer / descendDuration);
        
        // Smooth easing
        float easedT = t * t * (3f - 2f * t);
        
        // Position descend
        Vector3 pos = transform.position;
        pos.y = Mathf.Lerp(startY, endY, easedT);
        transform.position = pos;
        
        // Fade in intensity from 0 to 1
        pointLight.intensity = easedT;
        
        if (t >= 1f)
        {
            isDescending = false;
        }
    }

    private void Flicker()
    {
        float noise = Mathf.PerlinNoise(Time.time * flickerSpeed, 0f);
        pointLight.intensity = Mathf.Lerp(minIntensity, maxIntensity, noise);
    }
}

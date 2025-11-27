using FMOD.Studio;
using FMODUnity;
using UnityEngine;

public class AudioManager : MonoBehaviour
{
    private static AudioManager instance;
    
    [Header("FMOD Events")]
    [SerializeField] private EventReference gameOverRef;
    
    [Header("Heartbeat System")]
    [SerializeField] private EventReference[] heartbeatIntensities = new EventReference[4];
    
    public EventInstance gameOverSfx;
    private EventInstance heartbeatInstance;
    private int currentHeartbeatIndex = -1;
    
    public static AudioManager Instance => instance;
    public EventInstance GameOverSfx => gameOverSfx;
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else if (instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        InstantiateSFXs();
    }
    
    void Start()
    {
        ValidateHeartbeatReferences();
    }
    
    void InstantiateSFXs()
    {
        gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
        heartbeatInstance = default;
    }
    
    void ValidateHeartbeatReferences()
    {
        for (int i = 0; i < heartbeatIntensities.Length; i++)
        {
            if (heartbeatIntensities[i].IsNull)
            {
                Debug.LogWarning($"Heartbeat intensity {i} not assigned");
            }
        }
    }
    
    void OnEnable()
    {
        GameObserver.Notifier += OnLoseCompletionChanged;
    }
    
    void OnDisable()
    {
        GameObserver.Notifier -= OnLoseCompletionChanged;
        
        if (heartbeatInstance.isValid())
        {
            heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            heartbeatInstance.release();
        }
    }
    
    int GetHeartbeatIndex(float loseCompletion)
    {
        if (loseCompletion < 25f) return 0;
        if (loseCompletion < 50f) return 1;
        if (loseCompletion < 75f) return 2;
        return 3;
    }
    
    void OnLoseCompletionChanged(float percentage)
    {
        int newIndex = GetHeartbeatIndex(percentage);
        
        if (newIndex != currentHeartbeatIndex)
        {
            currentHeartbeatIndex = newIndex;
            PlayHeartbeat();
        }
    }
    
    public void PlayHeartbeat()
    {
        if (heartbeatInstance.isValid())
        {
            heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            heartbeatInstance.release();
        }
        
        if (currentHeartbeatIndex < 0 || currentHeartbeatIndex >= heartbeatIntensities.Length)
        {
            return;
        }
        
        EventReference eventRef = heartbeatIntensities[currentHeartbeatIndex];
        if (eventRef.IsNull) return;
        
        heartbeatInstance = RuntimeManager.CreateInstance(eventRef);
        heartbeatInstance.start();
    }
    
    public void StopHeartbeat()
    {
        if (heartbeatInstance.isValid())
        {
            heartbeatInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            heartbeatInstance.release();
        }
        currentHeartbeatIndex = -1;
    }
    
    public void PlaySfx(EventInstance sfx)
    {
        sfx.start();
    }
}

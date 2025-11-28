using System.Collections;
using FMOD.Studio;
using FMODUnity;
using UnityEngine;

[DefaultExecutionOrder(-100)]
public class AudioManager : MonoBehaviour
{
    private static AudioManager instance;
    
    [Header("FMOD Events")]
    [SerializeField] private EventReference gameOverRef;
    
    [Header("Heartbeat System")]
    [SerializeField] private EventReference[] heartbeatIntensities = new EventReference[4];
    
    public EventInstance gameOverSfx;
    private EventInstance[] heartbeatInstances = new EventInstance[4];
    private int currentHeartbeatIndex = -1;
    private bool isInitialized = false;
    
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
        
        ValidateHeartbeatReferences();
    }

    void Start()
    {
        StartCoroutine(InitializeWhenBanksLoaded());
    }
    
    IEnumerator InitializeWhenBanksLoaded()
    {
        while (!RuntimeManager.HaveAllBanksLoaded)
        {
            yield return null;
        }
        
        // Extra frame to ensure FMOD is fully ready
        yield return null;
        
        InstantiateSFXs();
        isInitialized = true;
        
        OnLoseCompletionChanged(0f);
    }
    
    void InstantiateSFXs()
    {
        gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
        
        for (int i = 0; i < heartbeatIntensities.Length; i++)
        {
            if (!heartbeatIntensities[i].IsNull)
            {
                heartbeatInstances[i] = RuntimeManager.CreateInstance(heartbeatIntensities[i]);
            }
        }
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
        
        for (int i = 0; i < heartbeatInstances.Length; i++)
        {
            if (heartbeatInstances[i].isValid())
            {
                heartbeatInstances[i].stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
                heartbeatInstances[i].release();
            }
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
        if (!isInitialized) return;
        
        if (currentHeartbeatIndex < 0 || currentHeartbeatIndex >= heartbeatInstances.Length)
        {
            return;
        }
        
        for (int i = 0; i < heartbeatInstances.Length; i++)
        {
            if (heartbeatInstances[i].isValid())
            {
                if (i == currentHeartbeatIndex)
                {
                    heartbeatInstances[i].start();
                }
                else
                {
                    heartbeatInstances[i].stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
                }
            }
        }
    }
    
    public void StopHeartbeat()
    {
        for (int i = 0; i < heartbeatInstances.Length; i++)
        {
            if (heartbeatInstances[i].isValid())
            {
                heartbeatInstances[i].stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            }
        }
        currentHeartbeatIndex = -1;
    }
    
    public void PlaySfx(EventInstance sfx)
    {
        if (!isInitialized) return;
        sfx.start();
    }
}

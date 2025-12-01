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
    [SerializeField] private EventReference introRef;
    
    [Header("Heartbeat System")]
    [SerializeField] private EventReference[] heartbeatIntensities = new EventReference[4];
    
    [Header("Ambiance")]
    [SerializeField] private EventReference ambianceRef;
    
    [Header("Timing")]
    [SerializeField] private float introDelay = 2f;
    
    public EventInstance gameOverSfx;
    public EventInstance introSfx;
    private EventInstance[] heartbeatInstances = new EventInstance[4];
    private EventInstance ambianceInstance;
    private int currentHeartbeatIndex = -1;
    private bool isInitialized = false;
    
    public static AudioManager Instance => instance;
    public EventInstance GameOverSfx => gameOverSfx;
    public EventInstance IntroSfx => introSfx;
    
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
        PlayAmbiance();
        StartCoroutine(PlayIntroAfterDelay());
    }
    
    IEnumerator PlayIntroAfterDelay()
    {
        yield return new WaitForSeconds(introDelay);
        PlaySfx(introSfx);
    }
    
    void InstantiateSFXs()
    {
        gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
        introSfx = RuntimeManager.CreateInstance(introRef);
        
        for (int i = 0; i < heartbeatIntensities.Length; i++)
        {
            if (!heartbeatIntensities[i].IsNull)
            {
                heartbeatInstances[i] = RuntimeManager.CreateInstance(heartbeatIntensities[i]);
            }
        }
        
        if (!ambianceRef.IsNull)
        {
            ambianceInstance = RuntimeManager.CreateInstance(ambianceRef);
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
        
        if (ambianceInstance.isValid())
        {
            ambianceInstance.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            ambianceInstance.release();
        }
        
        if (introSfx.isValid())
        {
            introSfx.stop(FMOD.Studio.STOP_MODE.IMMEDIATE);
            introSfx.release();
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
                    heartbeatInstances[i].stop(FMOD.Studio.STOP_MODE.ALLOWFADEOUT);
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
    
    public void PlayAmbiance()
    {
        if (!isInitialized) return;
        if (!ambianceInstance.isValid()) return;
        ambianceInstance.start();
    }
    
    public void StopAmbiance()
    {
        if (ambianceInstance.isValid())
        {
            ambianceInstance.stop(FMOD.Studio.STOP_MODE.ALLOWFADEOUT);
        }
    }
}

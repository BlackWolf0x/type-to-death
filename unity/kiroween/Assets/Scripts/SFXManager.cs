using System;
using UnityEngine;

public class SFXManager : MonoBehaviour
{
    private static SFXManager instance;
    
    [Header("Sound Effects")]
    [SerializeField] private SFX gameOver;
    public SFX GameOver => gameOver;
    
    [Header("Heartbeat System")]
    [SerializeField] private AudioClip[] heartbeatIntensities = new AudioClip[4];
    private AudioSource audioSource;
    private AudioSource heartbeatSource;
    private bool isMuted = false;
    private int currentHeartbeatIndex = -1;
    public static SFXManager Instance => instance;

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
        
        if (!TryGetComponent(out audioSource))
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
        
        audioSource.spatialBlend = 0f;
        audioSource.playOnAwake = false;
        
        heartbeatSource = gameObject.AddComponent<AudioSource>();
        heartbeatSource.loop = true;
        heartbeatSource.spatialBlend = 0f;
        heartbeatSource.playOnAwake = false;
        
        Debug.Log("SFXManager: Initialized");
    }
    
    void Start()
    {
        
        for (int i = 0; i < heartbeatIntensities.Length; i++)
        {
            if (heartbeatIntensities[i] == null)
            {
                Debug.LogWarning($"SFXManager: Heartbeat intensity {i} not assigned");
            }
        }
        
        currentHeartbeatIndex = 0;
        PlayHeartbeat();
    }
    
    void OnEnable()
    {
        GameObserver.Notifier += OnLoseCompletionChanged;
    }
    
    void OnDisable()
    {
        GameObserver.Notifier -= OnLoseCompletionChanged;
    }
    
    public void Play(SFX sfx)
    {
        if (sfx.clip == null)
        {
            Debug.LogWarning("SFXManager: Cannot play null AudioClip");
            return;
        }
        
        if (isMuted)
        {
            return;
        }
        
        audioSource.PlayOneShot(sfx.clip, sfx.volume);
    }
    
    public void Mute()
    {
        isMuted = true;
    }
    
    public void Unmute()
    {
        isMuted = false;
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
        if (isMuted) return;
        
        if (currentHeartbeatIndex < 0 || currentHeartbeatIndex >= heartbeatIntensities.Length)
        {
            return;
        }
        
        AudioClip clip = heartbeatIntensities[currentHeartbeatIndex];
        if (clip == null) return;
        
        heartbeatSource.clip = clip;
        heartbeatSource.Play();
    }
    
    public void StopHeartbeat()
    {
        heartbeatSource.Stop();
        currentHeartbeatIndex = -1;
    }
}


[Serializable]
public struct SFX
{
    public AudioClip clip;
    public float volume;
}

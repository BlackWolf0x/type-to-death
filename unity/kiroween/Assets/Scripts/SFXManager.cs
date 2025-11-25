using UnityEngine;

public class SFXManager : MonoBehaviour
{
    private static SFXManager instance;
    
    [Header("Sound Effects")]
    [SerializeField] private AudioClip scream;
    
    private AudioSource audioSource;
    private bool isMuted = false;
    
    public static SFXManager Instance => instance;
    public AudioClip Scream => scream;
    
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
        
        Debug.Log("SFXManager: Initialized");
    }
    
    void Start()
    {
        if (scream == null)
        {
            Debug.LogWarning("SFXManager: Scream AudioClip not assigned");
        }
    }
    
    public void Play(AudioClip clip)
    {
        if (clip == null)
        {
            Debug.LogWarning("SFXManager: Cannot play null AudioClip");
            return;
        }
        
        if (isMuted)
        {
            return;
        }
        
        audioSource.PlayOneShot(clip);
    }
    
    public void Mute()
    {
        isMuted = true;
    }
    
    public void Unmute()
    {
        isMuted = false;
    }
}

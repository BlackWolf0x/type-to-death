using FMOD.Studio;
using FMODUnity;
using UnityEngine;

public class AudioManager : MonoBehaviour
{
    private static AudioManager instance;
    
    [Header("FMOD Events")]
    [SerializeField] private EventReference gameOverRef;
    
    public EventInstance gameOverSfx;
    
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
    
    void InstantiateSFXs()
    {
        gameOverSfx = RuntimeManager.CreateInstance(gameOverRef);
    }
    
    public void PlaySfx(EventInstance sfx)
    {
        sfx.start();
    }
}

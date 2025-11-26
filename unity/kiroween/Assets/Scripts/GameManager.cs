using System.Collections;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    private static GameManager instance;
    
    [Header("Game Over Settings")]
    [SerializeField] private GameObject blackScreenPanel;
    [SerializeField] private GameObject monsterObject;
    [SerializeField] private float gameOverDelay = 1f;
    
    private bool gameOverTriggered = false;
    
    public static GameManager Instance => instance;
    
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
            return;
        }
    }
    
    void Start()
    {
        if (blackScreenPanel == null)
        {
            Debug.LogWarning("GameManager: Black Screen Panel not assigned");
        }
        
        if (monsterObject == null)
        {
            Debug.LogWarning("GameManager: Monster Object not assigned");
        }
    }
    
    void OnEnable()
    {
        GameObserver.Notifier += OnLoseCompletionChanged;
    }
    
    void OnDisable()
    {
        GameObserver.Notifier -= OnLoseCompletionChanged;
    }
    
    void OnLoseCompletionChanged(float percentage)
    {
        if (gameOverTriggered)
        {
            return;
        }
        
        if (percentage >= 100f)
        {
            gameOverTriggered = true;
            StartCoroutine(GameOverSequence());
        }
    }
    
    IEnumerator GameOverSequence()
    {
        yield return new WaitForSeconds(gameOverDelay);
        
        blackScreenPanel.SetActive(true);
        Camera.main.GetComponent<CameraShake>().StopShake();
        SFXManager.Instance.Play(SFXManager.Instance.GameOver);
        SFXManager.Instance.StopHeartbeat();
        monsterObject.SetActive(false);
        
        Debug.Log("GameManager: Game Over");
    }
}

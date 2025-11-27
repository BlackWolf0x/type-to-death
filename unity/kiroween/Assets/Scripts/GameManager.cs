using System.Collections;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    private static GameManager instance;

    [SerializeField] private GameObject restartButton;
    [SerializeField] private GameObject menuButton;


    [Header("Game Over Settings")]
    [SerializeField] private GameObject blackScreenPanel;
    [SerializeField] private GameObject monsterObject;
    [SerializeField] private float gameOverDelay = 1f;

    private bool gameOverTriggered = false;

    public static GameManager Instance => instance;

    [DllImport("__Internal")]
    private static extern void GameLost();

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

#if UNITY_WEBGL && !UNITY_EDITOR
        restartButton.SetActive(false);
        menuButton.SetActive(false);
#endif
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
        AudioManager.Instance.PlaySfx(AudioManager.Instance.GameOverSfx);
        SFXManager.Instance.StopHeartbeat();
        monsterObject.SetActive(false);

#if UNITY_WEBGL && !UNITY_EDITOR
        GameLost();
#endif

        Debug.Log("GameManager: Game Over");
    }

    public void RestartScene()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    public void GoToMainMenu()
    {
        SceneManager.LoadScene(Helper.MenuSceneIndex);
    }

    public void GameWon()
    {
        // To be implemented later
    }
}

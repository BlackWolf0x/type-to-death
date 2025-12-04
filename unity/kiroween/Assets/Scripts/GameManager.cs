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

    [Header("Game Win References")]
    [SerializeField] private GameObject directionalLight;
    [SerializeField] private Light playerLight;
    [SerializeField] private Light middleLight;
    [SerializeField] private Light bathroomLight;
    [SerializeField] private Light elevatorLight;
    [SerializeField] private MeshRenderer elevatorBulb;
    [SerializeField] private Material whiteBulbMat;
    [SerializeField] private float delayAfterWinSfx;


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

        // #if UNITY_EDITOR
        // Invoke(nameof(GameWon), 5f);
        // #endif
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
        float sfxHeadstart = 0.1f;
        yield return new WaitForSeconds(gameOverDelay - sfxHeadstart);
        AudioManager.Instance.PlaySfx(AudioManager.Instance.GameOverSfx);
        yield return new WaitForSeconds(sfxHeadstart);
        blackScreenPanel.SetActive(true);
        Camera.main.GetComponent<CameraShake>().StopShake();
        AudioManager.Instance.StopHeartbeat();
        AudioManager.Instance.StopAmbiance();
        monsterObject.SetActive(false);

#if UNITY_WEBGL && !UNITY_EDITOR
        GameLost();
#endif

        // Debug.Log("GameManager: Game Over");
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
        gameOverTriggered = true;
        AudioManager.Instance.StopHeartbeat();
        AudioManager.Instance.StopAmbiance();

        // Play win transition SFX
        AudioManager.Instance.PlaySfx(AudioManager.Instance.WinTransitionSfx);

        StartCoroutine(GameWonDelayedActions());
    }

    private IEnumerator GameWonDelayedActions()
    {
        yield return new WaitForSeconds(delayAfterWinSfx);

        monsterObject.SetActive(false);
        Camera.main.GetComponent<CameraShake>().StopShake();

        // Get color of middle light then disable its gameObject
        Color middleLightColor = middleLight.color;
        middleLight.gameObject.SetActive(false);

        // Apply color to playerLight and set intensity to 1
        playerLight.color = middleLightColor;
        playerLight.intensity = 1f;

        // Apply color to elevatorLight
        elevatorLight.color = middleLightColor;
        if (elevatorLight.TryGetComponent<Animator>(out var elevatorAnimator))
        {
            elevatorAnimator.enabled = false;
        }

        // Disable animator component on bathroom light
        if (bathroomLight.TryGetComponent<Animator>(out var bathroomAnimator))
        {
            bathroomAnimator.enabled = false;
        }

        // Apply whiteBulbMat to elevatorBulb
        elevatorBulb.material = whiteBulbMat;

        directionalLight.SetActive(true);

        // Safety
        AudioManager.Instance.StopHeartbeat();
        AudioManager.Instance.StopAmbiance();
        
    }
}

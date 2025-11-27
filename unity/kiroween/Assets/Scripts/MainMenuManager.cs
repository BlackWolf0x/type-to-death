using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuManager : MonoBehaviour
{
    [SerializeField] private GameObject startButton;

    [DllImport("__Internal")]
    private static extern void GameIsReady();

    void Start()
    {

#if UNITY_WEBGL && !UNITY_EDITOR
        GameIsReady();
        startButton.SetActive(false);
#endif

        Debug.Log("Game is ready");
    }

    public void GoToGameScene()
    {
        SceneManager.LoadScene(Helper.GameSceneIndex);
    }
}

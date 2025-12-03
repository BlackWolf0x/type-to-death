using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using FMODUnity;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuManager : MonoBehaviour
{
    [SerializeField] private GameObject startButton;

    // List of Banks to load
    [BankRef]
    public List<string> Banks;

    [DllImport("__Internal")]
    private static extern void GameIsReady();

    void Start()
    {
        StartCoroutine(LoadFMODBanksAndNotify());
    }

    private IEnumerator LoadFMODBanksAndNotify()
    {
        // Iterate all the Studio Banks and start them loading in the background
        // including the audio sample data
        foreach (var bank in Banks)
        {
            RuntimeManager.LoadBank(bank, true);
        }

        // Keep yielding the co-routine until all the Bank loading is done
        while (RuntimeManager.AnySampleDataLoading())
        {
            yield return null;
        }

        Debug.Log("FMOD banks loaded successfully");

#if UNITY_WEBGL && !UNITY_EDITOR
        GameIsReady();
        // startButton.SetActive(false);
#endif

        Debug.Log("Game is ready");
    }

    public void GoToGameScene()
    {
        SceneManager.LoadScene(Helper.GameSceneIndex);
    }
}

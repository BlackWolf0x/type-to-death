using System.Runtime.InteropServices;
using UnityEngine;

public class MainMenuManager : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void GameIsReady();

    void Start()
    {

#if UNITY_WEBGL && !UNITY_EDITOR
        GameIsReady();
#endif

        Debug.Log("Game is ready");
    }
}

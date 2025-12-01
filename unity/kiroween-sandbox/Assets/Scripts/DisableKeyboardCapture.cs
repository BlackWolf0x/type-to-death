using UnityEngine;

public class DisableKeyboardCapture : MonoBehaviour
{
    void Awake()
    {
        Debug.Log("Disabling keyboard capture for WebGL build.");
#if UNITY_WEBGL && !UNITY_EDITOR
        WebGLInput.captureAllKeyboardInput = false;
        Debug.Log("Disabled");
#endif

    }

}

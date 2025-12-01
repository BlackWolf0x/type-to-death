using UnityEngine;
using System.Collections;

public class AppearAfterDelay : MonoBehaviour
{

    [InspectorName("Off Duration (s)")]
    [Range(0f, 60f)]
    [Tooltip("How long (seconds) the object should remain disabled")]
    public float offDurationSeconds = 2f;

    void Start()
    {
        if (offDurationSeconds <= 0f)
        {
            Debug.LogWarning("StartAnimationAfterDelay: offDuration must be > 0.");
            return;
        }

        Debug.Log($"StartAnimationAfterDelay: disabling '{this.gameObject.name}' for {offDurationSeconds} seconds.");

        // Always operate on this GameObject. Use a helper so the coroutine survives while
        // this GameObject is inactive.
        ReenableHelper.Run(this.gameObject, offDurationSeconds);
    }

    // Removed DisableTemporarily method as it is no longer needed.

    // Helper MonoBehaviour that runs on its own GameObject so it is not disabled
    // when the target GameObject is turned off. It destroys itself after re-enabling.
    private class ReenableHelper : MonoBehaviour
    {
        public static void Run(GameObject targetObj, float duration)
        {
            GameObject go = new GameObject("StartAnimationAfterDelay_ReenableHelper");
            DontDestroyOnLoad(go);
            ReenableHelper helper = go.AddComponent<ReenableHelper>();
            helper.StartCoroutine(helper.ReenableCoroutine(targetObj, duration));
        }

        private IEnumerator ReenableCoroutine(GameObject targetObj, float duration)
        {
            if (targetObj == null)
            {
                Destroy(this.gameObject);
                yield break;
            }

            bool wasActive = targetObj.activeSelf;
            targetObj.SetActive(false);
            yield return new WaitForSeconds(duration);
            if (targetObj)
                targetObj.SetActive(wasActive);

            Destroy(this.gameObject);
        }
    }
}

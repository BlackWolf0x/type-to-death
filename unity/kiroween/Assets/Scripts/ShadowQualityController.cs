using UnityEngine;

/// <summary>
/// Controls shadow quality based on game completion percentage.
/// Attach this script to a Light component.
/// Switches from soft shadows to hard shadows when lose completion reaches threshold.
/// </summary>
[RequireComponent(typeof(Light))]
public class ShadowQualityController : MonoBehaviour
{
    [SerializeField] private float switchThreshold = 50f;

    private Light targetLight;
    private bool hasSwitched;

    void Awake()
    {
        targetLight = GetComponent<Light>();
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
        if (hasSwitched) return;

        if (percentage >= switchThreshold)
        {
            targetLight.shadows = LightShadows.Hard;
            hasSwitched = true;
        }
    }

    /// <summary>
    /// Reset the controller to allow switching again (call on game restart).
    /// </summary>
    public void ResetShadows()
    {
        hasSwitched = false;
        targetLight.shadows = LightShadows.Soft;
    }
}

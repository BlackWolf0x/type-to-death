mergeInto(LibraryManager.library, {
    GameIsReady: function () {
        window.dispatchReactUnityEvent("GameIsReady");
    },
    
    GameLost: function () {
        window.dispatchReactUnityEvent("GameLost");
    }
});

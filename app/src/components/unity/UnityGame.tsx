import { Unity, useUnityContext } from "react-unity-webgl";

export function UnityGame() {
	const { unityProvider, loadingProgression, isLoaded } = useUnityContext({
		loaderUrl: "/build/cursor-test-webgl-build.loader.js",
		dataUrl: "/build/cursor-test-webgl-build.data",
		frameworkUrl: "/build/cursor-test-webgl-build.framework.js",
		codeUrl: "/build/cursor-test-webgl-build.wasm",
	});


	return (
		<>
			{!isLoaded && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl z-20">
					Loading... {Math.round(loadingProgression * 100)}%
				</div>
			)}
			<Unity
				unityProvider={unityProvider}
				style={{ visibility: isLoaded ? "visible" : "hidden" }}
				className="fixed inset-0 w-screen h-screen z-0 pointer-events-none!"
			// tabIndex={1}
			/>
		</>
	);
}

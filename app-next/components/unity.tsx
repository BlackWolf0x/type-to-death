'use client';

import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "./ui/button";

export function UnityGame() {

	const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
		loaderUrl: "/game/build.loader.js",
		dataUrl: "/game/build.data",
		frameworkUrl: "/game/build.framework.js",
		codeUrl: "/game/build.wasm",
	});

	function handleStartGame() {
		sendMessage("MainMenuManager", "GoToGameScene");
	}

	function handleBlink() {
		sendMessage("Monster", "OnBlinkDetected");
	}


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
			/>

			<div className="fixed ">
				<Button onClick={handleStartGame} >
					Start
				</Button>
				<Button onClick={handleBlink} >
					Blink
				</Button>
			</div>
		</>
	);
}

import { useEffect } from 'react'
import './App.css'
import { UnityGame } from './components/unity/UnityGame'
import { Game } from './components/game/Game'
import { MainMenu } from './components/main-menu/MainMenu'
import { useAppStore } from './stores/appStore'

function App() {
	const initializeFromLocalStorage = useAppStore((state) => state.initializeFromLocalStorage)

	useEffect(() => {
		initializeFromLocalStorage()
	}, [initializeFromLocalStorage])

	return (
		<>
			<MainMenu />
			<UnityGame />
			<Game />
		</>
	)
}

export default App

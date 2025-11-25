import { useEffect } from 'react'
import './App.css'
// import { UnityGame } from '@/components/unity/UnityGame'
import { Game } from '@/components/game';
import { MainMenu } from '@/components/main-menu/MainMenu';
import { BackButton } from '@/components/ui/BackButton';
import { useAppStore } from '@/stores/appStore';
import { TypingGame } from './typing-game';
import { Toaster } from '@/components/ui/sonner';

function App() {
	const initializeFromLocalStorage = useAppStore((state) => state.initializeFromLocalStorage)

	useEffect(() => {
		initializeFromLocalStorage()
	}, [initializeFromLocalStorage])

	return (
		<>
			<Toaster position="top-center" />
			<MainMenu />
			<BackButton />
			{/* <UnityGame /> */}
			<div className='fixed top-0 left-0 right-0 bottom-0 -z-10'>
				<iframe
					className='w-full h-full'
					src='https://www.youtube.com/embed/cTiks9WZtMs?autoplay=1&mute=1&loop=1&playlist=cTiks9WZtMs&controls=0&showinfo=0&rel=0&modestbranding=0&start=50'
					allow='autoplay; encrypted-media'
					allowFullScreen
				/>
			</div>
			{/* <Game /> */}
			<TypingGame />
		</>
	)
}

export default App

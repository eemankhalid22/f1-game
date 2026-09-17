import { useGameStore } from './store/gameStore'
import { Game } from './components/Game'
import { StartScreen } from './components/StartScreen'
import { GameOver } from './components/GameOver'

export default function App() {
  const phase = useGameStore((state: any) => state.phase)

  return (
    <>
      {phase === 'menu' && <StartScreen />}
      {phase === 'playing' && <Game />}
      {phase === 'gameover' && <GameOver />}
    </>
  )
}

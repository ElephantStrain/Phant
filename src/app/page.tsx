import { GameLobby } from '@/components/GameLobby'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <GameLobby />
    </main>
  )
}

import { Chat } from '@/components/chat'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  )
}

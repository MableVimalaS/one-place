import { useAuth } from './hooks/useAuth'
import { AuthGate } from './components/auth/AuthGate'
import { Hub } from './components/Hub'
import { Aura } from './components/Aura'

export default function App() {
  const { session, user, loading } = useAuth()

  if (loading) {
    return (
      <>
        <Aura />
        <div className="boot">Loading your library…</div>
      </>
    )
  }

  if (!session || !user) {
    return (
      <>
        <Aura />
        <AuthGate />
      </>
    )
  }

  return (
    <>
      <Aura />
      <Hub user={user} />
    </>
  )
}

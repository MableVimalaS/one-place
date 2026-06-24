import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './auth.css'

type Mode = 'signin' | 'signup'

export function AuthGate() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const isSignup = mode === 'signup'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) {
      setMsg({ text: 'Email and password are required.', ok: false })
      return
    }
    setBusy(true)
    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) {
      setMsg({ text: error.message, ok: false })
      return
    }
    if (isSignup && !data.session) {
      setMsg({
        text: "Account created! Check your email to confirm, then sign in. (Tip: in Supabase → Authentication, turn off 'Confirm email' for instant login.)",
        ok: true,
      })
    }
    // On success with a session, useAuth picks it up automatically.
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <div className="orb" />
        <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <p>
          {isSignup
            ? "Pick an email and password — that's your login on every device."
            : 'Sign in to open your library.'}
        </p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? '…' : isSignup ? 'Create account' : 'Sign in'}
        </button>

        {msg && <div className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}

        <div className="switch">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'signin' : 'signup')
              setMsg(null)
            }}
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </button>
        </div>
      </form>
    </div>
  )
}

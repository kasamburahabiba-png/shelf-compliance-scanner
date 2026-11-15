import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setRole(''); return }
    supabase.from('profiles').select('full_name, role')
      .eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data) { setRole(data.role); setName(data.full_name || '') }
      })
  }, [session])

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    const result = isSignup
      ? await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setMsg(result.error.message)
  }

  const box = {
    maxWidth: 380, margin: '40px auto', padding: 24,
    border: '1px solid #ccc', borderRadius: 12, fontFamily: 'sans-serif',
  }
  const input = {
    width: '100%', padding: 12, marginBottom: 12,
    fontSize: 16, boxSizing: 'border-box',
  }
  const btn = {
    width: '100%', padding: 14, fontSize: 16, border: 'none',
    borderRadius: 8, background: '#16a34a', color: 'white', cursor: 'pointer',
  }

  if (session) {
    return (
      <div style={box}>
        <h2>Welcome{name ? ', ' + name : ''} 👋</h2>
        <p>Email: {session.user.email}</p>
        <p>Role: <b>{role || 'loading...'}</b></p>
        <button style={btn} onClick={() => supabase.auth.signOut()}>
          Log out
        </button>
      </div>
    )
  }

  return (
    <form style={box} onSubmit={handleSubmit}>
      <h2>{isSignup ? 'Create account' : 'Log in'}</h2>
      {isSignup && (
        <input style={input} placeholder="Full name" value={name}
          onChange={(e) => setName(e.target.value)} required />
      )}
      <input style={input} type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input style={input} type="password" placeholder="Password (6+ characters)"
        value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button style={btn} type="submit">
        {isSignup ? 'Sign up' : 'Log in'}
      </button>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      <p style={{ textAlign: 'center', cursor: 'pointer', color: '#2563eb' }}
        onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Already have an account? Log in' : 'New here? Create account'}
      </p>
    </form>
  )
}

export default App
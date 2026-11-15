import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [msg, setMsg] = useState('Checking connection...')

  useEffect(() => {
    supabase.from('products').select('*').then(({ data, error }) => {
      if (error) setMsg('Error: ' + error.message)
      else setMsg('Connected to Supabase ✅ (rows: ' + data.length + ')')
    })
  }, [])

  return <h1 style={{ padding: 20 }}>{msg}</h1>
}

export default App
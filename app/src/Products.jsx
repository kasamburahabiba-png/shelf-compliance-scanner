import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Products({ role }) {
  const [products, setProducts] = useState([])
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [aisle, setAisle] = useState('')
  const [msg, setMsg] = useState('')

  const canEdit = role === 'admin' || role === 'supervisor'

  async function load() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    else setProducts(data)
  }

  useEffect(() => { load() }, [])

  async function addProduct(e) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('products').insert({
      barcode: barcode.trim(),
      name: name.trim(),
      price: parseFloat(price),
      aisle: aisle.trim(),
    })
    if (error) { setMsg(error.message); return }
    setBarcode(''); setName(''); setPrice(''); setAisle('')
    load()
  }

  async function removeProduct(id) {
    if (!window.confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) setMsg(error.message)
    else load()
  }

  const input = {
    width: '100%', padding: 12, marginBottom: 10,
    fontSize: 16, boxSizing: 'border-box',
  }
  const btn = {
    width: '100%', padding: 14, fontSize: 16, border: 'none',
    borderRadius: 8, background: '#16a34a', color: 'white', cursor: 'pointer',
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Products ({products.length})</h3>

      {canEdit && (
        <form onSubmit={addProduct} style={{ marginBottom: 20 }}>
          <input style={input} placeholder="Barcode" value={barcode}
            onChange={(e) => setBarcode(e.target.value)} required />
          <input style={input} placeholder="Product name" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <input style={input} type="number" step="0.01" placeholder="Price"
            value={price} onChange={(e) => setPrice(e.target.value)} required />
          <input style={input} placeholder="Aisle (e.g. A3)" value={aisle}
            onChange={(e) => setAisle(e.target.value)} />
          <button style={btn} type="submit">Add product</button>
        </form>
      )}

      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

      {products.map((p) => (
        <div key={p.id} style={{
          border: '1px solid #ddd', borderRadius: 8,
          padding: 12, marginBottom: 8,
        }}>
          <b>{p.name}</b>
          <div>Price: {Number(p.price).toFixed(2)}</div>
          <div style={{ color: '#666', fontSize: 14 }}>
            Barcode: {p.barcode} {p.aisle ? '• Aisle ' + p.aisle : ''}
          </div>
          {canEdit && (
            <button onClick={() => removeProduct(p.id)}
              style={{ marginTop: 8, color: 'crimson',
                background: 'none', border: 'none', cursor: 'pointer' }}>
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
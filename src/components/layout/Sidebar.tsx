import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Item, Playlist } from '../../lib/types'
import { supabase } from '../../lib/supabase'
import { useAddPlaylist, useDeletePlaylist } from '../../hooks/usePlaylists'
import './sidebar.css'

interface Props {
  user: User
  playlists: Playlist[]
  items: Item[]
  localCount: number
  view: string
  onSelect: (view: string) => void
}

export function Sidebar({ user, playlists, items, localCount, view, onSelect }: Props) {
  const [name, setName] = useState('')
  const addPlaylist = useAddPlaylist()
  const deletePlaylist = useDeletePlaylist()

  const countFor = (id: string) => items.filter((it) => it.playlist_id === id).length

  function add() {
    const trimmed = name.trim()
    if (!trimmed) return
    addPlaylist.mutate(trimmed)
    setName('')
  }

  function remove(id: string) {
    if (playlists.length <= 1) {
      alert('Keep at least one playlist.')
      return
    }
    if (!confirm('Delete this playlist? Its items move to your first playlist.')) return
    const fallback = playlists.find((p) => p.id !== id)
    if (!fallback) return
    deletePlaylist.mutate({ id, fallbackId: fallback.id })
    if (view === id) onSelect('all')
  }

  return (
    <aside>
      <div className="brand">
        <span className="orb" />
        <div>
          <h1>One Place</h1>
          <small>your favorites</small>
        </div>
      </div>

      <div className="nav-label">Library</div>

      <button className={`pl ${view === 'all' ? 'on' : ''}`} onClick={() => onSelect('all')}>
        <span className="ic">◎</span> Everything
        <span className="ct">{items.length}</span>
      </button>

      <button className={`pl ${view === 'local' ? 'on' : ''}`} onClick={() => onSelect('local')}>
        <span className="ic">💾</span> On this device
        <span className="ct">{localCount}</span>
      </button>

      {playlists.map((p) => (
        <button
          key={p.id}
          className={`pl ${view === p.id ? 'on' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <span className="ic">♪</span> {p.name}
          <span className="ct">{countFor(p.id)}</span>
          <span
            className="x"
            role="button"
            aria-label={`Delete playlist ${p.name}`}
            onClick={(e) => {
              e.stopPropagation()
              remove(p.id)
            }}
          >
            ×
          </span>
        </button>
      ))}

      <div className="newpl">
        <input
          placeholder="New playlist…"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn-ghost" onClick={add} aria-label="Create playlist">
          ＋
        </button>
      </div>

      <div className="foot">
        <div className="me" title={user.email}>
          {user.email}
        </div>
        <button className="btn-ghost signout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

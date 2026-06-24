import { useState } from 'react'
import type { Playlist } from '../../lib/types'
import { useAddItem } from '../../hooks/useItems'

interface Props {
  view: string
  playlists: Playlist[]
}

export function PasteBar({ view, playlists }: Props) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const addItem = useAddItem()

  // Views that aren't real playlists — pasted links can't be filed into these.
  const SPECIAL_VIEWS = ['all', 'files', 'local']

  function save() {
    const raw = url.trim()
    if (!raw) return
    // Save into the active playlist when one is selected; otherwise the first playlist.
    const playlistId = SPECIAL_VIEWS.includes(view) ? (playlists[0]?.id ?? null) : view
    setError('')
    addItem.mutate(
      { url: raw, playlistId },
      {
        onSuccess: () => setUrl(''),
        onError: (e) => setError(e instanceof Error ? e.message : 'Could not save that link.'),
      },
    )
  }

  return (
    <div>
      <div className="paste">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
          <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </svg>
        <input
          placeholder="Paste a YouTube or Spotify link…"
          autoComplete="off"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
        <button className="btn-primary" onClick={save} disabled={addItem.isPending}>
          {addItem.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <div className="err-hint">{error}</div>}
    </div>
  )
}

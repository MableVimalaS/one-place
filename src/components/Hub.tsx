import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Item } from '../lib/types'
import { usePlaylists } from '../hooks/usePlaylists'
import { useItems } from '../hooks/useItems'
import { useLocalTracks } from '../hooks/useLocalTracks'
import { Sidebar } from './layout/Sidebar'
import { PasteBar } from './library/PasteBar'
import { Library } from './library/Library'
import { PlayerModal } from './player/PlayerModal'

export function Hub({ user }: { user: User }) {
  const [view, setView] = useState('all')
  const [search, setSearch] = useState('')
  const [queue, setQueue] = useState<Item[]>([])
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const { data: playlists = [] } = usePlaylists()
  const { data: items = [] } = useItems()
  const local = useLocalTracks()

  // `nowQueue` is the list of playable items currently shown, so prev/next and
  // auto-next move through exactly what the user sees.
  function play(item: Item, nowQueue: Item[]) {
    // Plain links open in a new tab; embeddable media plays in the modal.
    if (item.type === 'link') {
      window.open(item.url, '_blank', 'noopener')
      return
    }
    const i = nowQueue.findIndex((x) => x.id === item.id)
    if (i < 0) return
    setQueue(nowQueue)
    setPlayingIndex(i)
  }

  return (
    <>
      <div className="app">
        <Sidebar
          user={user}
          playlists={playlists}
          items={items}
          localCount={local.tracks.length}
          view={view}
          onSelect={setView}
        />
        <main>
          <div className="top">
            <PasteBar view={view} playlists={playlists} />
          </div>
          <Library
            items={items}
            playlists={playlists}
            local={local}
            view={view}
            search={search}
            onSearch={setSearch}
            onPlay={play}
          />
        </main>
      </div>
      {playingIndex !== null && queue[playingIndex] && (
        <PlayerModal
          queue={queue}
          index={playingIndex}
          onIndex={setPlayingIndex}
          onClose={() => setPlayingIndex(null)}
        />
      )}
    </>
  )
}

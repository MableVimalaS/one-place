import { useMemo } from 'react'
import type { Item, Playlist } from '../../lib/types'
import type { LocalApi } from '../../hooks/useLocalTracks'
import { useDeleteItem, useUpdateItem } from '../../hooks/useItems'
import { MediaCard } from './MediaCard'
import './library.css'

interface Props {
  items: Item[]
  playlists: Playlist[]
  local: LocalApi
  view: string
  search: string
  onSearch: (q: string) => void
  onPlay: (item: Item, queue: Item[]) => void
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'night'
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export function Library({ items, playlists, local, view, search, onSearch, onPlay }: Props) {
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const isLocal = view === 'local'

  const visible = useMemo(() => {
    const scoped = isLocal
      ? local.tracks
      : view === 'all'
        ? items
        : items.filter((it) => it.playlist_id === view)
    const q = search.trim().toLowerCase()
    return q ? scoped.filter((it) => (it.title ?? '').toLowerCase().includes(q)) : scoped
  }, [items, local.tracks, isLocal, view, search])

  const title = isLocal
    ? 'On this device'
    : view === 'all'
      ? 'Recently saved'
      : (playlists.find((p) => p.id === view)?.name ?? '')

  // The queue for prev/next + auto-next: the playable items currently shown, in order.
  const queue = useMemo(
    () => visible.filter((it) => it.embed || it.type === 'local'),
    [visible],
  )

  function play(item: Item) {
    onPlay(item, queue)
  }

  function rename(item: Item) {
    const next = prompt('Rename:', item.title ?? '')
    if (!next || !next.trim()) return
    if (item.type === 'local') local.rename(item.id, next.trim())
    else updateItem.mutate({ id: item.id, changes: { title: next.trim() } })
  }

  function move(item: Item) {
    if (item.type === 'local') {
      alert('Files on this device stay here — they can’t move into playlists.')
      return
    }
    const list = playlists.map((p, i) => `${i + 1}. ${p.name}`).join('\n')
    const choice = prompt(`Move to:\n${list}\n\nEnter a number:`, '1')
    const idx = Number(choice) - 1
    const target = playlists[idx]
    if (target) updateItem.mutate({ id: item.id, changes: { playlist_id: target.id } })
  }

  function remove(item: Item) {
    if (item.type === 'local') local.remove(item.id)
    else deleteItem.mutate(item.id)
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) local.addFiles(e.target.files)
    e.target.value = '' // allow re-picking the same file
  }

  return (
    <>
      <h2 className="greet">
        Good <span className="em">{greeting()}</span>
      </h2>
      <p className="greet-sub">
        Everything you love — videos and music, every platform, one place.
      </p>

      <div className="sec-head">
        <h2>{title}</h2>
        <span className="n">
          {visible.length} {visible.length === 1 ? 'item' : 'items'}
        </span>
        {isLocal && (
          <label className="btn-ghost addfiles">
            ＋ Add audio files
            <input type="file" accept="audio/*" multiple hidden onChange={onPickFiles} />
          </label>
        )}
        <div className="search">
          <input
            placeholder="Search…"
            autoComplete="off"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="big">{isLocal ? '💾' : '🌙'}</div>
          <p>
            <strong>Nothing here yet.</strong>
          </p>
          <p>
            {isLocal
              ? 'Add audio files you own — they play offline, right from this device.'
              : 'Paste a YouTube or Spotify link above to save your first favorite.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {visible.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onPlay={play}
              onRename={rename}
              onMove={move}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { Item } from '../../lib/types'
import { loadYouTubeApi, loadSpotifyApi } from '../../lib/players'
import { signedUrl } from '../../hooks/useCloudFiles'
import { gradientFor } from '../../lib/gradient'
import './player.css'

interface Props {
  queue: Item[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}

function youTubeId(embed: string | null): string | null {
  const m = embed?.match(/\/embed\/([^?]+)/)
  return m ? m[1] : null
}
function spotifyUri(embed: string | null): string | null {
  const m = embed?.match(/\/embed\/(\w+)\/(\w+)/)
  return m ? `spotify:${m[1]}:${m[2]}` : null
}

export function PlayerModal({ queue, index, onIndex, onClose }: Props) {
  const item = queue[index]
  const [autoNext, setAutoNext] = useState(true)
  const [fileSrc, setFileSrc] = useState<string | null>(null)

  // Uploaded media: local files have an object URL; cloud files need a signed URL.
  const isUpload = item?.type === 'local' || item?.type === 'file'
  const mediaSrc = item?.type === 'local' ? item.url : fileSrc
  const isVideoFile = item?.type === 'file' && !item.audio
  const isAudioMedia = item?.type === 'local' || (item?.type === 'file' && item.audio)

  const hasPrev = index > 0
  const hasNext = index < queue.length - 1

  // Latest values for use inside async player callbacks, without re-running setup.
  const refs = useRef({ index, hasNext, autoNext, onIndex })
  refs.current = { index, hasNext, autoNext, onIndex }

  const hostRef = useRef<HTMLDivElement>(null)
  // Auto-start playback for this item only after a navigation or auto-advance,
  // so the first card opens paused.
  const playOnLoad = useRef(false)

  function go(to: number) {
    playOnLoad.current = true
    refs.current.onIndex(to)
  }
  function autoAdvance() {
    const r = refs.current
    if (r.autoNext && r.hasNext) {
      playOnLoad.current = true
      r.onIndex(r.index + 1)
    }
  }

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Cloud files: fetch a fresh signed URL whenever the track changes.
  useEffect(() => {
    let active = true
    setFileSrc(null)
    if (item?.type === 'file' && item.storage_path) {
      signedUrl(item.storage_path).then((url) => {
        if (active) setFileSrc(url)
      })
    }
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  // Build the right player whenever the current track changes.
  useEffect(() => {
    const host = hostRef.current
    // Audio files are played by a native <audio> element below, not an iframe API.
    if (!host || !item || item.type === 'local' || item.type === 'file') return
    host.innerHTML = ''
    const el = document.createElement('div')
    host.appendChild(el)

    let cancelled = false
    let player: any = null
    const autostart = playOnLoad.current

    if (item.type === 'youtube') {
      const vid = youTubeId(item.embed)
      if (vid) {
        loadYouTubeApi().then((YT) => {
          if (cancelled) return
          player = new YT.Player(el, {
            width: '100%',
            height: '100%',
            videoId: vid,
            playerVars: { rel: 0, autoplay: autostart ? 1 : 0 },
            events: {
              onStateChange: (e: any) => {
                if (e.data === 0) autoAdvance() // 0 = ENDED
              },
            },
          })
        })
      }
    } else if (item.type === 'spotify') {
      const uri = spotifyUri(item.embed)
      if (uri) {
        loadSpotifyApi().then((api) => {
          if (cancelled) return
          api.createController(el, { uri, width: '100%', height: '352' }, (controller: any) => {
            player = controller
            if (autostart) controller.play?.()
            let ended = false
            controller.addListener?.('playback_update', (e: any) => {
              const d = e?.data
              if (!d || !d.duration) return
              if (!d.isPaused && d.position >= d.duration - 800 && !ended) {
                ended = true
                autoAdvance()
              }
            })
          })
        })
      }
    }

    return () => {
      cancelled = true
      try {
        player?.destroy?.()
      } catch {
        /* player may already be gone */
      }
      host.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id])

  if (!item) return null

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="player">
        {isVideoFile ? (
          <div className="stage filestage">
            {mediaSrc ? (
              <video
                key={`${item.id}:${mediaSrc}`}
                className="filevideo"
                src={mediaSrc}
                controls
                autoPlay={playOnLoad.current}
                onEnded={autoAdvance}
              />
            ) : (
              <div className="local-title">Loading…</div>
            )}
          </div>
        ) : isAudioMedia ? (
          <div className="stage audio localstage">
            <div className="grad" style={{ background: gradientFor(item.id) }} />
            <div className="local-title">🎵 {item.title ?? 'Untitled'}</div>
            {mediaSrc ? (
              <audio
                key={`${item.id}:${mediaSrc}`}
                className="localaudio"
                src={mediaSrc}
                controls
                autoPlay={playOnLoad.current}
                onEnded={autoAdvance}
              />
            ) : (
              <div className="local-title" style={{ opacity: 0.7 }}>
                Loading…
              </div>
            )}
          </div>
        ) : (
          <div className={`stage ${item.audio ? 'audio' : ''}`} ref={hostRef} />
        )}
        <div className="ctl">
          <button
            className="navbtn"
            onClick={() => go(index - 1)}
            disabled={!hasPrev}
            aria-label="Previous"
          >
            ⏮
          </button>
          <button
            className="navbtn"
            onClick={() => go(index + 1)}
            disabled={!hasNext}
            aria-label="Next"
          >
            ⏭
          </button>
          <span className="pt">{item.title ?? 'Untitled'}</span>
          <label className="autonext" title="Automatically play the next item when this one ends">
            <input
              type="checkbox"
              checked={autoNext}
              onChange={(e) => setAutoNext(e.target.checked)}
            />
            Auto-next
          </label>
          {!isUpload && (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Open ↗
            </a>
          )}
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

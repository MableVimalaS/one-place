import type { Item } from '../../lib/types'
import { gradientFor } from '../../lib/gradient'

interface Props {
  item: Item
  onPlay: (item: Item) => void
  onRename: (item: Item) => void
  onMove: (item: Item) => void
  onDelete: (item: Item) => void
}

const PLACEHOLDER: Record<string, string> = {
  spotify: '🎧',
  local: '🎵',
  youtube: '🎬',
  link: '🔗',
}
const SUBTITLE: Record<string, string> = {
  spotify: 'spotify',
  youtube: 'youtube',
  local: 'on this device',
  link: 'link',
}
const BADGE_LABEL: Record<string, string> = { local: 'device' }

export function MediaCard({ item, onPlay, onRename, onMove, onDelete }: Props) {
  // Cloud files are audio or video depending on the `audio` flag.
  const isVideoFile = item.type === 'file' && !item.audio
  const emoji =
    item.type === 'file' ? (isVideoFile ? '🎬' : '🎵') : (PLACEHOLDER[item.type] ?? '🎬')
  const badge =
    item.type === 'file' ? (isVideoFile ? 'video' : 'music') : (BADGE_LABEL[item.type] ?? item.type)
  const subtitle =
    item.type === 'file'
      ? isVideoFile
        ? 'my video'
        : 'my music'
      : (SUBTITLE[item.type] ?? item.type)

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div className="card" onClick={() => onPlay(item)}>
      <div className="art">
        {item.thumb ? (
          <img
            src={item.thumb}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <>
            <div className="grad" style={{ background: gradientFor(item.id) }} />
            <div className="ph">{emoji}</div>
          </>
        )}
        <div className="sheen" />
        <span className={`badge ${item.type}`}>{badge}</span>

        <div className="acts">
          <button className="iconbtn" onClick={stop(() => onRename(item))} aria-label="Rename">
            ✎
          </button>
          <button className="iconbtn" onClick={stop(() => onMove(item))} aria-label="Move to playlist">
            ⇄
          </button>
          <button className="iconbtn" onClick={stop(() => onDelete(item))} aria-label="Remove">
            🗑
          </button>
        </div>

        <button className="play" onClick={stop(() => onPlay(item))} aria-label="Play">
          ▶
        </button>
      </div>

      <div className="t">{item.title ?? 'Untitled'}</div>
      <div className="s">{subtitle}</div>
    </div>
  )
}

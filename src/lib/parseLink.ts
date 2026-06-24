import type { ParsedLink } from './types'

function youtube(id: string): ParsedLink {
  return {
    type: 'youtube',
    embed: `https://www.youtube.com/embed/${id}`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    audio: false,
    title: 'YouTube video',
  }
}

const SPOTIFY_KINDS = /\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/

/**
 * Turn a pasted URL into a media reference.
 * Returns null when the string is not a valid URL.
 *
 * Supported: YouTube (watch, youtu.be, shorts, embed, live) and
 * Spotify (track, album, playlist, episode, show, artist).
 * Anything else is kept as a plain external link.
 */
export function parseLink(raw: string): ParsedLink | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')

  // YouTube short links
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0]
    if (id) return youtube(id)
  }

  // YouTube full domain
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    const v = url.searchParams.get('v')
    if (url.pathname === '/watch' && v) return youtube(v)
    const m = url.pathname.match(/^\/(shorts|embed|live)\/([^/?#]+)/)
    if (m) return youtube(m[2])
  }

  // Spotify
  if (host === 'spotify.com' || host.endsWith('.spotify.com')) {
    const m = url.pathname.match(SPOTIFY_KINDS)
    if (m) {
      return {
        type: 'spotify',
        embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}`,
        thumb: null,
        audio: true,
        title: `Spotify ${m[1]}`,
      }
    }
  }

  // Fallback: keep the link, open it externally when played.
  return { type: 'link', embed: null, thumb: null, audio: false, title: host + url.pathname }
}

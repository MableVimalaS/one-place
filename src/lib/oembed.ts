import type { MediaType } from './types'

interface OEmbed {
  title?: string
  thumbnail_url?: string
}

/**
 * Best-effort title/thumbnail lookup via each platform's public oEmbed endpoint.
 * Returns null if the request is blocked (CORS), offline, or unsupported —
 * the caller falls back to a placeholder the user can rename.
 */
export async function fetchOEmbed(type: MediaType, url: string): Promise<OEmbed | null> {
  let endpoint: string | null = null
  if (type === 'youtube') {
    endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
  } else if (type === 'spotify') {
    endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  }
  if (!endpoint) return null

  try {
    const res = await fetch(endpoint)
    if (!res.ok) return null
    return (await res.json()) as OEmbed
  } catch {
    return null
  }
}

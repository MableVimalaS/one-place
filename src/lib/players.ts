// Loaders for the YouTube and Spotify iframe player APIs.
// These give us real playback events (like "ended") so the queue can auto-advance —
// something a plain <iframe> embed cannot report.

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
    onSpotifyIframeApiReady?: (api: any) => void
  }
}

let ytPromise: Promise<any> | null = null

export function loadYouTubeApi(): Promise<any> {
  if (ytPromise) return ytPromise
  ytPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytPromise
}

let spotifyPromise: Promise<any> | null = null

export function loadSpotifyApi(): Promise<any> {
  if (spotifyPromise) return spotifyPromise
  spotifyPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api)
    const tag = document.createElement('script')
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1'
    document.head.appendChild(tag)
  })
  return spotifyPromise
}

export {}

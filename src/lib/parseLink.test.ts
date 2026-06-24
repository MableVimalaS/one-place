import { describe, it, expect } from 'vitest'
import { parseLink } from './parseLink'

describe('parseLink', () => {
  it('parses a standard YouTube watch URL', () => {
    const r = parseLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(r?.type).toBe('youtube')
    expect(r?.embed).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(r?.thumb).toContain('dQw4w9WgXcQ')
    expect(r?.audio).toBe(false)
  })

  it('parses a youtu.be short link', () => {
    const r = parseLink('https://youtu.be/dQw4w9WgXcQ')
    expect(r?.type).toBe('youtube')
    expect(r?.embed).toContain('dQw4w9WgXcQ')
  })

  it('parses a YouTube Shorts link', () => {
    const r = parseLink('https://www.youtube.com/shorts/abc123XYZ')
    expect(r?.type).toBe('youtube')
    expect(r?.embed).toContain('abc123XYZ')
  })

  it('parses a Spotify track and marks it as audio', () => {
    const r = parseLink('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT')
    expect(r?.type).toBe('spotify')
    expect(r?.embed).toBe('https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT')
    expect(r?.audio).toBe(true)
  })

  it('parses a Spotify playlist', () => {
    const r = parseLink('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
    expect(r?.type).toBe('spotify')
    expect(r?.embed).toContain('/embed/playlist/')
  })

  it('keeps an unknown URL as a plain link', () => {
    const r = parseLink('https://example.com/cool-thing')
    expect(r?.type).toBe('link')
    expect(r?.embed).toBeNull()
  })

  it('returns null for a non-URL string', () => {
    expect(parseLink('not a url')).toBeNull()
    expect(parseLink('')).toBeNull()
  })
})

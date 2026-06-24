import { useCallback, useEffect, useRef, useState } from 'react'
import type { Item } from '../lib/types'
import * as store from '../lib/localStore'

export interface LocalApi {
  tracks: Item[]
  addFiles: (files: FileList | File[]) => Promise<void>
  rename: (id: string, title: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

/**
 * Lists locally-stored audio files as playable Items.
 * Each track gets a temporary object URL for the <audio> element; URLs are
 * revoked and recreated on every reload so we never leak them.
 */
export function useLocalTracks(): LocalApi {
  const [tracks, setTracks] = useState<Item[]>([])
  const urls = useRef<string[]>([])

  const load = useCallback(async () => {
    const rows = await store.list()
    urls.current.forEach(URL.revokeObjectURL)
    urls.current = []

    const mapped = rows
      .sort((a, b) => b.addedAt - a.addedAt)
      .map<Item>((r) => {
        const url = URL.createObjectURL(r.blob)
        urls.current.push(url)
        return {
          id: r.id,
          user_id: 'local',
          playlist_id: null,
          url,
          type: 'local',
          title: r.title,
          thumb: null,
          embed: null,
          audio: true,
          added_at: new Date(r.addedAt).toISOString(),
        }
      })
    setTracks(mapped)
  }, [])

  useEffect(() => {
    load()
    return () => {
      urls.current.forEach(URL.revokeObjectURL)
    }
  }, [load])

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('audio')) await store.addFile(file)
      }
      await load()
    },
    [load],
  )

  const rename = useCallback(
    async (id: string, title: string) => {
      await store.rename(id, title)
      await load()
    },
    [load],
  )

  const remove = useCallback(
    async (id: string) => {
      await store.remove(id)
      await load()
    },
    [load],
  )

  return { tracks, addFiles, rename, remove }
}

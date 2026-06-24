import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Item } from '../lib/types'

const BUCKET = 'library'

/** A short-lived URL for streaming a private file from storage. */
export async function signedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  return error ? null : data.signedUrl
}

/** Upload + delete for the user's own audio files, stored in the cloud and synced everywhere. */
export function useCloudFiles(userId: string) {
  const qc = useQueryClient()

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        const isAudio = file.type.startsWith('audio')
        const isVideo = file.type.startsWith('video')
        if (!isAudio && !isVideo) continue

        const safe = file.name.replace(/[^\w.\-]+/g, '_')
        const path = `${userId}/${crypto.randomUUID()}-${safe}`

        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)
        if (uploadError) throw uploadError

        const { error: rowError } = await supabase.from('items').insert({
          url: path,
          type: 'file',
          title: file.name.replace(/\.[^.]+$/, ''),
          audio: isAudio, // false for video → player shows a <video> element
          storage_path: path,
          playlist_id: null,
        })
        if (rowError) throw rowError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })

  // Fetch a file straight from a direct (legal) link and store it in the cloud,
  // so the user never has to have the file on their device.
  const uploadFromUrl = useMutation({
    mutationFn: async (rawUrl: string) => {
      const url = rawUrl.trim()

      let host = ''
      try {
        host = new URL(url).hostname.replace(/^www\./, '')
      } catch {
        throw new Error('That is not a valid link.')
      }
      if (/youtube\.com$|youtu\.be$|spotify\.com$/.test(host)) {
        throw new Error(
          'YouTube and Spotify links can’t be saved as files (copyright). Use a direct link from a free source like the Internet Archive.',
        )
      }

      let res: Response
      try {
        res = await fetch(url)
      } catch {
        throw new Error(
          'Could not fetch that link — the site may block direct downloads. Download the file, then use “Add audio or video”.',
        )
      }
      if (!res.ok) throw new Error(`Download failed (HTTP ${res.status}).`)

      const blob = await res.blob()
      const cleanUrl = url.split('?')[0]
      const ext = (cleanUrl.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase()
      const AUDIO_EXT = ['mp3', 'm4a', 'wav', 'ogg', 'flac', 'aac', 'opus']
      const VIDEO_EXT = ['mp4', 'webm', 'mov', 'mkv', 'ogv', 'm4v']

      const isAudio = blob.type.startsWith('audio') || (!blob.type.startsWith('video') && AUDIO_EXT.includes(ext))
      const isVideo = blob.type.startsWith('video') || VIDEO_EXT.includes(ext)
      if (!isAudio && !isVideo) {
        throw new Error('That link does not point to an audio or video file.')
      }

      const name = decodeURIComponent(cleanUrl.split('/').pop() || 'track')
      const safe = name.replace(/[^\w.\-]+/g, '_')
      const path = `${userId}/${crypto.randomUUID()}-${safe}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type || undefined })
      if (uploadError) throw new Error(uploadError.message)

      const { error: rowError } = await supabase.from('items').insert({
        url: path,
        type: 'file',
        title: name.replace(/\.[^.]+$/, ''),
        audio: isAudio,
        storage_path: path,
        playlist_id: null,
      })
      if (rowError) throw new Error(rowError.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })

  const remove = useMutation({
    mutationFn: async (item: Item) => {
      if (item.storage_path) await supabase.storage.from(BUCKET).remove([item.storage_path])
      const { error } = await supabase.from('items').delete().eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })

  return { upload, uploadFromUrl, remove }
}

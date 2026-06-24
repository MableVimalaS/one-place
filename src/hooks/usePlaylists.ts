import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Playlist } from '../lib/types'

async function fetchPlaylists(): Promise<Playlist[]> {
  const { data, error } = await supabase.from('playlists').select('*').order('created_at')
  if (error) throw error

  // Make sure every account always has at least one playlist to save into.
  if (!data || data.length === 0) {
    const { data: created, error: createError } = await supabase
      .from('playlists')
      .insert({ name: 'Watch later' })
      .select()
      .single()
    if (createError) throw createError
    return created ? [created] : []
  }

  return data
}

export function usePlaylists() {
  return useQuery({ queryKey: ['playlists'], queryFn: fetchPlaylists })
}

export function useAddPlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('playlists').insert({ name })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlists'] }),
  })
}

export function useDeletePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, fallbackId }: { id: string; fallbackId: string }) => {
      // Move this playlist's items to the fallback playlist, then remove it.
      await supabase.from('items').update({ playlist_id: fallbackId }).eq('playlist_id', id)
      const { error } = await supabase.from('playlists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] })
      qc.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

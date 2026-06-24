import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { parseLink } from '../lib/parseLink'
import { fetchOEmbed } from '../lib/oembed'
import type { Item } from '../lib/types'

async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('added_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useItems() {
  return useQuery({ queryKey: ['items'], queryFn: fetchItems })
}

export function useAddItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ url, playlistId }: { url: string; playlistId: string | null }) => {
      const parsed = parseLink(url)
      if (!parsed) throw new Error("That doesn't look like a link.")

      const { data, error } = await supabase
        .from('items')
        .insert({
          url,
          playlist_id: playlistId,
          type: parsed.type,
          title: parsed.title,
          thumb: parsed.thumb,
          embed: parsed.embed,
          audio: parsed.audio,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)

      // Best-effort: enrich the title/thumbnail after saving.
      if (data && parsed.type !== 'link') {
        const meta = await fetchOEmbed(parsed.type, url)
        if (meta?.title) {
          await supabase
            .from('items')
            .update({ title: meta.title, thumb: data.thumb ?? meta.thumbnail_url ?? null })
            .eq('id', data.id)
        }
      }
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Item> }) => {
      const { error } = await supabase.from('items').update(changes).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  })
}

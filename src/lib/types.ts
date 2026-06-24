// Shared domain types for One Place.

export type MediaType = 'youtube' | 'spotify' | 'link' | 'local' | 'file'

export interface Playlist {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  playlist_id: string | null
  url: string
  type: MediaType
  title: string | null
  thumb: string | null
  embed: string | null
  audio: boolean
  added_at: string
  /** Set for type 'file': the path of the uploaded audio in Supabase storage. */
  storage_path?: string | null
}

/** Result of parsing a pasted link, before it is saved. We store references, never files. */
export interface ParsedLink {
  type: MediaType
  embed: string | null
  thumb: string | null
  audio: boolean
  title: string
}

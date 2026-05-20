export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string
          title: string
          artist: string | null
          key: string | null
          bpm: number | null
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          key?: string | null
          bpm?: number | null
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string | null
          key?: string | null
          bpm?: number | null
          tags?: string[]
          notes?: string | null
          updated_at?: string
        }
      }
      song_sections: {
        Row: {
          id: string
          song_id: string
          type: string
          title: string
          observation: string | null
          content: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          type?: string
          title?: string
          observation?: string | null
          content?: string
          order_index?: number
          created_at?: string
        }
        Update: {
          type?: string
          title?: string
          observation?: string | null
          content?: string
          order_index?: number
        }
      }
      audio_files: {
        Row: {
          id: string
          song_id: string
          file_url: string
          file_name: string
          description: string | null
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          file_url: string
          file_name: string
          description?: string | null
          duration?: number | null
        }
        Update: {
          description?: string | null
          duration?: number | null
        }
      }
    }
  }
}

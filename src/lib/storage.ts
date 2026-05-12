import { supabase } from './supabase'

export const storage = {
  getPublicUrl(bucket: string, filePath: string): string {
    return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl
  },

  async upload(bucket: string, filePath: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })
    if (error) throw error
    return data
  },

  async remove(bucket: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) throw error
  },
}

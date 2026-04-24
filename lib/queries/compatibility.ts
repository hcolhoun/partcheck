import { createClient } from '@/lib/supabase/server'

export async function getPartDetails(partId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parts')
    .select(`
      id,
      name,
      part_categories (
        id,
        slug
      ),
      part_attributes (
        attribute_name,
        attribute_value_number,
        attribute_value_text
      ),
      part_standard_values (
        standards (
          standard_type,
          slug
        )
      )
    `)
    .eq('id', partId)
    .single()

  if (error) throw new Error(error.message)

  return data
}
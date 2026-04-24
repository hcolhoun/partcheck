import { createClient } from '@/lib/supabase/server'

export type PartListItem = {
  id: string
  name: string
  slug: string
  model_code: string | null
  description: string | null
  brand: {
    name: string
    slug: string
  } | null
  category: {
    name: string
    slug: string
  } | null
}

export async function getPartsByCategory(categorySlug: string): Promise<PartListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parts')
    .select(`
      id,
      name,
      slug,
      model_code,
      description,
      brands (
        name,
        slug
      ),
      part_categories (
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .eq('part_categories.slug', categorySlug)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to load parts for ${categorySlug}: ${error.message}`)
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    model_code: row.model_code,
    description: row.description,
    brand: Array.isArray(row.brands) ? row.brands[0] ?? null : row.brands ?? null,
    category: Array.isArray(row.part_categories)
      ? row.part_categories[0] ?? null
      : row.part_categories ?? null,
  }))
}
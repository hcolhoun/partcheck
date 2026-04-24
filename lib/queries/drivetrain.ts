import { createClient } from '@/lib/supabase/server'

type PartRow = {
  id: string
  name: string
  slug: string
  part_categories:
    | {
        slug: string
      }
    | {
        slug: string
      }[]
    | null
}

function getCategorySlug(part: PartRow) {
  if (!part.part_categories) return null
  if (Array.isArray(part.part_categories)) {
    return part.part_categories[0]?.slug ?? null
  }
  return part.part_categories.slug
}

export async function getDrivetrainParts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parts')
    .select(`
      id,
      name,
      slug,
      part_categories (
        slug
      )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const parts = (data ?? []) as PartRow[]

  return {
    cassettes: parts.filter((p) => getCategorySlug(p) === 'cassette'),
    chains: parts.filter((p) => getCategorySlug(p) === 'chain'),
    derailleurs: parts.filter((p) => getCategorySlug(p) === 'rear-derailleur'),
    shifters: parts.filter((p) => getCategorySlug(p) === 'shifter'),
    cranksets: parts.filter((p) => getCategorySlug(p) === 'crankset'),
    chainrings: parts.filter((p) => getCategorySlug(p) === 'chainring'),
    bottomBrackets: parts.filter((p) => getCategorySlug(p) === 'bottom-bracket'),
  }
}
import { createClient } from '@/lib/supabase/server'

export async function getCompatibilityRules() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('compatibility_rules')
    .select(`
      id,
      rule_name,
      status,
      left_category_id,
      right_category_id,
      rule_type,
      left_standard_type,
      right_standard_type,
      left_attribute_name,
      operator,
      right_attribute_name,
      right_fixed_value,
      message,
      severity,
      confidence_level,
      rule_sources (
        source_type,
        source_name,
        source_url,
        notes
      )
    `)
    .eq('status', 'active')

  if (error) throw new Error(error.message)

  return data ?? []
}
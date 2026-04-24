import { getPartDetails } from '@/lib/queries/compatibility'
import { getCompatibilityRules } from '@/lib/queries/rules'

type Severity = 'warning' | 'incompatible'
type Confidence = 'low' | 'medium' | 'high'

type Issue = {
  message: string
  severity: Severity
  confidence: Confidence
  sourceName: string | null
  sourceType: string | null
  sourceUrl: string | null
}

type NormalizedPart = {
  id: string
  name: string
  part_categories: { id?: string; slug?: string } | null
  part_attributes: {
    attribute_name: string
    attribute_value_number: number | null
    attribute_value_text: string | null
  }[]
  part_standard_values: {
    standards: {
      standard_type: string
      slug: string
    }
  }[]
}

function isBlank(value: unknown) {
  return value === null || value === undefined || String(value).trim() === ''
}

function addMissingFieldIssues(
  issuesMap: Map<string, Issue>,
  partName: string,
  missingFields: string[]
) {
  if (missingFields.length === 0) return

  const message = `${partName} is missing required custom spec fields: ${missingFields.join(
    ', '
  )}. Compatibility result is incomplete.`

  issuesMap.set(message, {
    message,
    severity: 'warning',
    confidence: 'low',
    sourceName: 'User-entered custom specs',
    sourceType: 'custom',
    sourceUrl: null,
  })
}

function makeCustomPart({
  id,
  name,
  categorySlug,
  attributes,
  standards,
}: {
  id: string
  name: string
  categorySlug: string
  attributes: Record<string, string | number | null | undefined>
  standards: Record<string, string | null | undefined>
}): NormalizedPart {
  return {
    id,
    name,
    part_categories: { slug: categorySlug },
    part_attributes: Object.entries(attributes)
      .filter(([, value]) => !isBlank(value))
      .map(([attribute_name, value]) => ({
        attribute_name,
        attribute_value_number:
          typeof value === 'number'
            ? value
            : !isNaN(Number(value))
            ? Number(value)
            : null,
        attribute_value_text:
          typeof value === 'string' && isNaN(Number(value)) ? value : null,
      })),
    part_standard_values: Object.entries(standards)
      .filter(([, slug]) => !isBlank(slug))
      .map(([standard_type, slug]) => ({
        standards: {
          standard_type,
          slug: slug as string,
        },
      })),
  }
}

export async function checkCompatibility({
  cassetteId,
  chainId,
  derailleurId,
  shifterId,
  cranksetId,
  chainringId,
  bottomBracketId,
  customCassette,
  customDerailleur,
  customChainring,
}: {
  cassetteId?: string | null
  chainId: string
  derailleurId?: string | null
  shifterId: string
  cranksetId: string
  chainringId?: string | null
  bottomBracketId: string
  customCassette?: any
  customDerailleur?: any
  customChainring?: any
}) {
  const issuesMap = new Map<string, Issue>()

  const [
    chain,
    shifter,
    crankset,
    bottomBracket,
    rules,
    cassetteFromDb,
    derailleurFromDb,
    chainringFromDb,
  ] = await Promise.all([
    getPartDetails(chainId),
    getPartDetails(shifterId),
    getPartDetails(cranksetId),
    getPartDetails(bottomBracketId),
    getCompatibilityRules(),
    cassetteId ? getPartDetails(cassetteId) : null,
    derailleurId ? getPartDetails(derailleurId) : null,
    chainringId ? getPartDetails(chainringId) : null,
  ])

  if (customCassette) {
    const missing = []

    if (isBlank(customCassette.speed)) missing.push('speed')
    if (isBlank(customCassette.min_tooth)) missing.push('min tooth')
    if (isBlank(customCassette.max_tooth)) missing.push('max tooth')
    if (isBlank(customCassette.freehub)) missing.push('freehub')
    if (isBlank(customCassette.chain_family)) missing.push('chain family')

    addMissingFieldIssues(
      issuesMap,
      customCassette.name || 'Custom cassette',
      missing
    )
  }

  if (customDerailleur) {
    const missing = []

    if (isBlank(customDerailleur.speed)) missing.push('speed')
    if (isBlank(customDerailleur.max_tooth)) missing.push('max tooth')
    if (isBlank(customDerailleur.actuation)) missing.push('actuation')

    addMissingFieldIssues(
      issuesMap,
      customDerailleur.name || 'Custom derailleur',
      missing
    )
  }

  if (customChainring) {
    const missing = []

    if (isBlank(customChainring.tooth_count)) missing.push('tooth count')
    if (isBlank(customChainring.chainring_mount)) {
      missing.push('chainring mount')
    }
    if (isBlank(customChainring.drivetrain_family)) {
      missing.push('drivetrain family')
    }

    addMissingFieldIssues(
      issuesMap,
      customChainring.name || 'Custom chainring',
      missing
    )
  }

  const cassette = customCassette
    ? makeCustomPart({
        id: 'custom-cassette',
        name: customCassette.name || 'Custom cassette',
        categorySlug: 'cassette',
        attributes: {
          speed: customCassette.speed,
          min_tooth: customCassette.min_tooth,
          max_tooth: customCassette.max_tooth,
        },
        standards: {
          freehub: customCassette.freehub,
          chain_family: customCassette.chain_family,
        },
      })
    : cassetteFromDb

  const derailleur = customDerailleur
    ? makeCustomPart({
        id: 'custom-derailleur',
        name: customDerailleur.name || 'Custom derailleur',
        categorySlug: 'rear-derailleur',
        attributes: {
          speed: customDerailleur.speed,
          max_tooth: customDerailleur.max_tooth,
        },
        standards: {
          actuation: customDerailleur.actuation,
        },
      })
    : derailleurFromDb

  const chainring = customChainring
    ? makeCustomPart({
        id: 'custom-chainring',
        name: customChainring.name || 'Custom chainring',
        categorySlug: 'chainring',
        attributes: {
          tooth_count: customChainring.tooth_count,
          offset_mm: customChainring.offset_mm,
        },
        standards: {
          chainring_mount: customChainring.chainring_mount,
          drivetrain_family: customChainring.drivetrain_family,
        },
      })
    : chainringFromDb

  const parts = [
    cassette,
    chain,
    derailleur,
    shifter,
    crankset,
    chainring,
    bottomBracket,
  ].filter(Boolean) as NormalizedPart[]

  const getStandard = (part: any, type: string) => {
    return part.part_standard_values?.find(
      (s: any) => s.standards?.standard_type === type
    )?.standards?.slug
  }

  const getAttribute = (part: any, name: string) => {
    return part.part_attributes?.find(
      (a: any) => a.attribute_name === name
    )?.attribute_value_number
  }

  const getCategory = (part: any) => {
    if (Array.isArray(part.part_categories)) {
      return part.part_categories[0] ?? null
    }

    return part.part_categories ?? null
  }

  const addIssue = (
    message: string,
    severity: Severity,
    confidence: Confidence,
    sourceName: string | null,
    sourceType: string | null,
    sourceUrl: string | null
  ) => {
    const existing = issuesMap.get(message)

    if (!existing) {
      issuesMap.set(message, {
        message,
        severity,
        confidence,
        sourceName,
        sourceType,
        sourceUrl,
      })
      return
    }

    if (existing.severity === 'warning' && severity === 'incompatible') {
      issuesMap.set(message, {
        message,
        severity,
        confidence,
        sourceName,
        sourceType,
        sourceUrl,
      })
    }
  }

  for (const rule of rules) {
    for (const leftPart of parts) {
      for (const rightPart of parts) {
        if (leftPart.id === rightPart.id) continue

        const leftCategory = getCategory(leftPart)
        const rightCategory = getCategory(rightPart)

        if (leftCategory?.id && leftCategory.id !== rule.left_category_id) {
          continue
        }

        if (rightCategory?.id && rightCategory.id !== rule.right_category_id) {
          continue
        }

        if (!leftCategory?.id && !leftCategory?.slug) continue
        if (!rightCategory?.id && !rightCategory?.slug) continue

        const firstSource = Array.isArray(rule.rule_sources)
          ? rule.rule_sources[0] ?? null
          : null

        const confidence: Confidence =
          rule.confidence_level === 'high' ||
          rule.confidence_level === 'medium' ||
          rule.confidence_level === 'low'
            ? rule.confidence_level
            : 'medium'

        if (rule.rule_type === 'standard_match') {
          const leftValue = getStandard(leftPart, rule.left_standard_type)
          const rightValue = getStandard(rightPart, rule.right_standard_type)

          if (leftValue && rightValue && leftValue !== rightValue) {
            let detailedMessage = rule.message

            if (
              rule.left_standard_type === 'chain_family' &&
              rule.right_standard_type === 'chain_family'
            ) {
              detailedMessage = `Cassette uses ${leftValue}, but selected chain uses ${rightValue}.`
            }

            if (
              rule.left_standard_type === 'actuation' &&
              rule.right_standard_type === 'actuation'
            ) {
              detailedMessage = `Rear derailleur uses ${leftValue}, but selected shifter uses ${rightValue}.`
            }

            if (
              rule.left_standard_type === 'chainring_mount' &&
              rule.right_standard_type === 'chainring_mount'
            ) {
              detailedMessage = `Crankset uses ${leftValue}, but selected chainring uses ${rightValue}.`
            }

            if (
              rule.left_standard_type === 'spindle' &&
              rule.right_standard_type === 'spindle'
            ) {
              detailedMessage = `Crankset spindle standard is ${leftValue}, but selected bottom bracket uses ${rightValue}.`
            }

            if (
              rule.left_standard_type === 'drivetrain_family' &&
              rule.right_standard_type === 'drivetrain_family'
            ) {
              detailedMessage = `Crankset drivetrain family is ${leftValue}, but selected chainring uses ${rightValue}.`
            }

            addIssue(
              detailedMessage,
              rule.severity === 'incompatible' ? 'incompatible' : 'warning',
              confidence,
              firstSource?.source_name ?? null,
              firstSource?.source_type ?? null,
              firstSource?.source_url ?? null
            )
          }
        }

        if (rule.rule_type === 'attribute_compare') {
          const leftVal = getAttribute(leftPart, rule.left_attribute_name)
          const rightVal = getAttribute(rightPart, rule.right_attribute_name)

          if (typeof leftVal === 'number' && typeof rightVal === 'number') {
            let failed = false

            if (rule.operator === '>=' && !(leftVal >= rightVal)) failed = true
            if (rule.operator === '<=' && !(leftVal <= rightVal)) failed = true
            if (rule.operator === '>' && !(leftVal > rightVal)) failed = true
            if (rule.operator === '<' && !(leftVal < rightVal)) failed = true
            if (rule.operator === '=' && !(leftVal === rightVal)) failed = true
            if (rule.operator === '!=' && !(leftVal !== rightVal)) failed = true

            if (failed) {
              let detailedMessage = rule.message

              if (
                rule.left_attribute_name === 'max_tooth' &&
                rule.right_attribute_name === 'max_tooth' &&
                leftCategory?.slug === 'rear-derailleur' &&
                rightCategory?.slug === 'cassette'
              ) {
                detailedMessage = `Rear derailleur max tooth is ${leftVal}T, but selected cassette max tooth is ${rightVal}T.`
              }

              if (
                rule.left_attribute_name === 'min_chainring_teeth' &&
                rule.right_attribute_name === 'tooth_count' &&
                leftCategory?.slug === 'crankset' &&
                rightCategory?.slug === 'chainring'
              ) {
                detailedMessage = `Crankset minimum supported chainring size is ${leftVal}T, but selected chainring is ${rightVal}T.`
              }

              if (
                rule.left_attribute_name === 'max_chainring_teeth' &&
                rule.right_attribute_name === 'tooth_count' &&
                leftCategory?.slug === 'crankset' &&
                rightCategory?.slug === 'chainring'
              ) {
                detailedMessage = `Crankset maximum supported chainring size is ${leftVal}T, but selected chainring is ${rightVal}T.`
              }

              addIssue(
                detailedMessage,
                rule.severity === 'incompatible' ? 'incompatible' : 'warning',
                confidence,
                firstSource?.source_name ?? null,
                firstSource?.source_type ?? null,
                firstSource?.source_url ?? null
              )
            }
          }
        }
      }
    }
  }

  const issues = Array.from(issuesMap.values())

  let status: 'compatible' | 'warning' | 'incompatible' = 'compatible'

  if (issues.some((issue) => issue.severity === 'incompatible')) {
    status = 'incompatible'
  } else if (issues.some((issue) => issue.severity === 'warning')) {
    status = 'warning'
  }

  return {
    status,
    issues,
  }
}
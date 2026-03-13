function getSafeArray(value) {
  return Array.isArray(value) ? value : []
}

export function getRuleCategoryOptions(rule = {}) {
  const options = getSafeArray(rule.category_options)
  if (options.length > 0) return options

  return [
    {
      id: null,
      category_id: rule.required_category_id ?? null,
      category_name: rule.required_category_name ?? 'Kategori',
      is_default: true,
      sort_order: 0,
    },
  ]
}

export function getDefaultCategoryOption(rule = {}) {
  const options = getRuleCategoryOptions(rule)
  return options.find((option) => option.is_default) || options[0]
}

export function getRuleMinSelect(rule = {}) {
  if (Number.isInteger(rule.min_select) && rule.min_select >= 0) return rule.min_select
  if (Number.isInteger(rule.required_qty) && rule.required_qty >= 0) return rule.required_qty
  return 0
}

export function getRuleMaxSelect(rule = {}) {
  if (Number.isInteger(rule.max_select) && rule.max_select > 0) return rule.max_select
  const fallback = getRuleMinSelect(rule)
  return fallback > 0 ? fallback : 1
}

export function createEmptyPackageEntry(rule = {}, categoryOption) {
  const fallbackCategory = categoryOption || getDefaultCategoryOption(rule)
  const defaultSource = rule.source_mode === 'custom_only' ? 'custom' : 'existing'

  return {
    package_menu_rule_id: rule.id ?? null,
    rule_category_option_id: fallbackCategory?.id ?? null,
    selection_source: defaultSource,
    selected_menu_id: '',
    selected_menu_name: '',
    selected_category_id: fallbackCategory?.category_id ?? rule.required_category_id ?? null,
    selected_category_name: fallbackCategory?.category_name ?? rule.required_category_name ?? '',
    custom_input_name: '',
    custom_input_price: '',
    selected_level: '',
    qty: 1,
    notes: '',
  }
}

export function createInitialRuleDraft(rule = {}) {
  const minSelect = getRuleMinSelect(rule)
  const initialCount = minSelect > 0 ? minSelect : 0
  const fallbackCategory = getDefaultCategoryOption(rule)

  return {
    entries: Array.from({ length: initialCount }, () => createEmptyPackageEntry(rule, fallbackCategory)),
  }
}

export function serializePackageSelections(selections = []) {
  if (!Array.isArray(selections) || selections.length === 0) return 'no-package'

  return [...selections]
    .map((entry) => ({
      package_menu_rule_id: entry.package_menu_rule_id ?? null,
      rule_category_option_id: entry.rule_category_option_id ?? null,
      selection_source: entry.selection_source || 'existing',
      selected_menu_id: entry.selected_menu_id ?? null,
      custom_input_name: entry.custom_input_name ?? '',
      custom_input_price: entry.custom_input_price ?? '',
      selected_category_id: entry.selected_category_id ?? null,
      selected_level: entry.selected_level ?? '',
      qty: entry.qty ?? 1,
      notes: entry.notes ?? '',
    }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
    .map((entry) => JSON.stringify(entry))
    .join('|')
}

export function getPackageSelectionTitle(entry = {}) {
  if (entry.selection_source === 'custom') {
    return entry.custom_input_name || 'Custom item'
  }
  return entry.selected_menu_name || (entry.selected_menu_id ? `Menu #${entry.selected_menu_id}` : 'Menu')
}

export function formatPackageSelectionLine(entry = {}) {
  const pieces = []
  const title = getPackageSelectionTitle(entry)
  const qty = Number(entry.qty) > 1 ? `${entry.qty}x ` : ''
  pieces.push(`${qty}${title}`)

  if (entry.selected_category_name) {
    pieces.push(entry.selected_category_name)
  }
  if (entry.selected_level) {
    pieces.push(`Level ${entry.selected_level}`)
  }
  if (entry.selection_source === 'custom' && Number(entry.custom_input_price) > 0) {
    pieces.push(`+${Number(entry.custom_input_price)}`)
  }

  return pieces.join(' • ')
}
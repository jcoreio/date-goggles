export type ParseOptions = {
  min?: number | Date | null | undefined
  max?: number | Date | null | undefined
  unit?: 'seconds' | 'milliseconds' | null | undefined
}

function normalizeBound(
  value: number | Date | null | undefined,
  unit: 'seconds' | 'milliseconds' | null | undefined,
  getDefault: () => number | Date
): number {
  if (value === undefined) value = getDefault()
  if (typeof value === 'number') return value
  if (value === null) return NaN
  if (value instanceof Date)
    return unit === 'seconds'
      ? Math.floor(value.getTime() / 1000)
      : value.getTime()
  throw new Error(`invalid value: ${value}`)
}

type DateGogglesAST = Array<string | Date>

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export function parse(
  text: string,
  options: ParseOptions = {}
): DateGogglesAST {
  if (
    options.unit == null &&
    typeof options.min != 'number' &&
    typeof options.max != 'number'
  ) {
    const msResult = parse(text, { ...options, unit: 'milliseconds' })
    return msResult.length > 1
      ? msResult
      : parse(text, { ...options, unit: 'seconds' })
  }
  const unit =
    options.unit ||
    (typeof options.min === 'number' &&
    options.min >= addYears(new Date(), -10).getTime() / 1000 &&
    typeof options.max === 'number' &&
    options.max <= addYears(new Date(), 5).getTime() / 1000
      ? 'seconds'
      : 'milliseconds')
  const min = normalizeBound(options.min, unit, () => addYears(new Date(), -10))
  const max = normalizeBound(options.max, unit, () => addYears(new Date(), 5))

  const minLen = !isNaN(min) ? String(min).length : null
  const maxLen = !isNaN(max) ? String(max).length : null
  const repeat =
    minLen == null && maxLen == null
      ? '+'
      : minLen === maxLen
      ? `{${minLen}}`
      : `{${minLen || '1'},${maxLen ?? ''}}`

  const rx = new RegExp(`\\d${repeat}(?![-+A-Za-z0-9])`, 'g')

  const result: DateGogglesAST = []

  let prev = 0
  let match
  while ((match = rx.exec(text))) {
    const timestamp = parseInt(match[0])
    if (
      timestamp < min ||
      timestamp > max ||
      /[-+A-Za-z0-9]/.test(text.charAt(match.index - 1))
    ) {
      continue
    }
    if (match.index > prev) result.push(text.substring(prev, match.index))
    result.push(new Date(unit === 'seconds' ? timestamp * 1000 : timestamp))
    prev = match.index + match[0].length
  }
  if (prev < text.length) result.push(text.substring(prev))

  return result
}

export type FormatOptions = {
  formatDate?: ((date: Date) => string) | null | undefined
}

export function format(
  ast: DateGogglesAST,
  options: FormatOptions = {}
): string {
  const formatDate =
    options.formatDate || ((date: Date): string => date.toLocaleString())
  return ast.map(v => (v instanceof Date ? formatDate(v) : v)).join('')
}

export function dateGoggles(
  text: string,
  options: ParseOptions & FormatOptions = {}
): string {
  return format(parse(text, options), options)
}

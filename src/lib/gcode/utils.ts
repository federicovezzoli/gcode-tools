export function fmt(n: number): string {
  return n.toFixed(3)
}

export function timestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

// Format Z string like the original: " Z{n}"
export function zup(pen_u: number): string {
  return ' Z' + pen_u
}

export function zdn(pen_d: number): string {
  return ' Z' + pen_d
}

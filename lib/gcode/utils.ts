export function fmt(n: number): string {
  return n.toFixed(3)
}

export function move(x: number, y: number, z: number, f: number): string {
  return `G1 X${fmt(x)} Y${fmt(y)} Z${fmt(z)} F${fmt(f)}\n`
}

export function rapid(x: number, y: number, z: number, f: number): string {
  return `G0 X${fmt(x)} Y${fmt(y)} Z${fmt(z)} F${fmt(f)}\n`
}

export function penDown(x: number, y: number, pen_d: number, pen_u: number, f_rapid: number, f_vertical: number): string {
  return rapid(x, y, pen_u, f_rapid) + move(x, y, pen_d, f_vertical)
}

export function penUp(x: number, y: number, pen_u: number, f_rapid: number, f_vertical: number): string {
  return move(x, y, pen_u, f_vertical)
}

export function timestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export const range = (n: number): number[] =>
  Array.from(Array(n).keys())

export function* splitEvery<T>(xs: T[], n: number): Generator<T[]> {
  const len = xs.length
  let m = 0
  for (; ;) {
    yield xs.slice(m, m + n)
    m += n
    if (m >= len) break
  }
}

export const sum = (xs: number[]): number =>
  xs.reduce((a, b) => a + b, 0)

export const randomElement = <T>(xs: T[]): T => {
  const randomIndex = Math.floor(Math.random() * xs.length)
  return xs[randomIndex]
}

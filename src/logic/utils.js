export const range = n =>
  Array.from(Array(n).keys())

export function* splitEvery(xs, n) {
  let len = xs.length
  let m = 0
  for (; ;) {
    yield xs.slice(m, m + n)
    m += n
    if (m >= len) break
  }
}

export const sum = xs =>
  xs.reduce((a, b) => a + b, 0)

export const randomElement = xs => {
  const randomIndex = Math.floor(Math.random() * xs.length)
  return xs[randomIndex]
}

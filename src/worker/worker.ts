import * as Logic from "../logic"

console.log('[worker.ts]', 'loaded')

console.log(Logic.MOVE_UP)
console.log(Logic.MOVE_DOWN)
console.log(Logic.MOVE_LEFT)
console.log(Logic.MOVE_RIGHT)

export const processData = (data: string): string => {
  console.log('[processData]', 'data:', data)
  return data.toUpperCase()
}

// https://en.wikipedia.org/wiki/Iterative_deepening_A*

const MAX_COST = Number.MAX_SAFE_INTEGER

type SearchResult = "FOUND" | number

export const configure_ida_star = <T>(
  h: (node: T) => number,
  isGoal: (node: T) => boolean,
  isNodeInPath: (node: T, path: T[]) => boolean,
  successors: (node: T) => T[],
  cost: (from: T, to: T) => number,
  checkForCancellation?: () => Promise<boolean>
) => {
  const search = async (path: T[], g: number, bound: number): Promise<SearchResult> => {
    if (checkForCancellation) {
      const cancelled = await checkForCancellation()
      if (cancelled) return MAX_COST
    }

    const node = path[path.length - 1]
    const f = g + h(node)
    if (f > bound) return f
    if (isGoal(node)) return "FOUND"
    let min = MAX_COST
    for (const succ of successors(node)) {
      if (!isNodeInPath(succ, path)) {
        path.push(succ)
        const t = await search(path, g + cost(node, succ), bound)
        if (t === "FOUND") return t
        if (t === MAX_COST) return MAX_COST
        if (t < min) min = t
        path.pop()
      }
    }
    return min
  }

  return async (root: T): Promise<{ path: T[]; bound: number } | null> => {
    let bound = h(root)
    const path = [root]
    for (; ;) {
      const t = await search(path, 0, bound)
      if (t === "FOUND") return { path, bound }
      if (t === MAX_COST) return null
      bound = t
    }
  }
}

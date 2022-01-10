// https://en.wikipedia.org/wiki/Iterative_deepening_A*

const MAX_COST = Number.MAX_SAFE_INTEGER

export const configure_ida_star = (h, isGoal, isNodeInPath, successors, cost, checkForCancellation) => {

  const ida_star = async root => {
    let bound = h(root)
    const path = [root]
    for (; ;) {
      const t = await search(path, 0, bound)
      if (t === 'FOUND') return { path, bound }
      if (t === MAX_COST) return null
      bound = t
    }
  }

  const search = async (path, g, bound) => {

    if (checkForCancellation) {
      const cancelled = await checkForCancellation()
      if (cancelled) return MAX_COST
    }

    const node = path[path.length - 1]
    const f = g + h(node)
    if (f > bound) return f
    if (isGoal(node)) return 'FOUND'
    let min = MAX_COST
    for (const succ of successors(node)) {
      if (!isNodeInPath(succ, path)) {
        path.push(succ)
        const t = await search(path, g + cost(node, succ), bound)
        if (t === 'FOUND') return t
        if (t === MAX_COST) return MAX_COST
        if (t < min) min = t
        path.pop()
      }
    }
    return min
  }

  return ida_star
}

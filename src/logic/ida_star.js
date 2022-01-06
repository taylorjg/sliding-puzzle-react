// https://en.wikipedia.org/wiki/Iterative_deepening_A*

const MAX_COST = Number.MAX_SAFE_INTEGER

export const configure_ida_star = (h, isGoal, isNodeInPath, successors, cost) => {

  const ida_star = root => {
    let bound = h(root)
    const path = [root]
    for (; ;) {
      const t = search(path, 0, bound)
      if (t === 'FOUND') return { path, bound }
      if (t === MAX_COST) return null
      bound = t
    }
  }

  const search = (path, g, bound) => {
    const node = path[path.length - 1]
    const f = g + h(node)
    if (f > bound) return f
    if (isGoal(node)) return 'FOUND'
    let min = MAX_COST
    for (const succ of successors(node)) {
      if (!isNodeInPath(succ, path)) {
        path.push(succ)
        const t = search(path, g + cost(node, succ), bound)
        if (t === 'FOUND') return t
        if (t < min) min = t
        path.pop()
      }
    }
    return min
  }

  return ida_star
}

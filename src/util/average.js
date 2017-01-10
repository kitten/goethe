import boundary from './boundary'

export default function average(x, y, factor) {
  factor = boundary(factor, 0, 1)
  return Math.floor((1 - factor) * x + factor * y)
}


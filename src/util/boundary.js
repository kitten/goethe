export default function boundary(val, min = 0, max = 255) {
  return Math.min(max, Math.max(val, min))
}


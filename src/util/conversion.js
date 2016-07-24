// Source of the RGB <---> HSV conversion functions:
// https://gist.github.com/mjackson/5311256

export function RGBtoHSV([ r, g, b, a ]) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  const delta = max - min
  const s = (max === 0) ? 0 : delta / max
  const v = max

  let h
  if (max === min) {
    h = 0
  } else if (max === r) {
    h = (g - b) / delta + (g < b ? 6 : 0)
  } else if (max === g) {
    h = (b - r) / delta + 2
  } else if (max === b) {
    h = (r - g) / delta + 4
  }

  h /= 6

  return [ h, s, v, a ]
}

export function HSVtoRGB([ h, s, v, a ]) {
  let r
  let g
  let b

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (Math.floor(h * 6) % 6) {
    case 0: {
      r = v
      g = t
      b = p
      break
    }

    case 1: {
      r = q
      g = v
      b = p
      break
    }

    case 2: {
      r = p
      g = v
      b = t
      break
    }

    case 3: {
      r = p
      g = q
      b = v
      break
    }

    case 4: {
      r = t
      g = p
      b = v
      break
    }

    default: {
      r = v
      g = p
      b = q
    }
  }

  r *= 255
  g *= 255
  b *= 255

  return [ r, g, b, a ]
}


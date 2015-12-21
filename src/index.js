import {
  getRgba,
  hexString,
  rgbString,
  percentString,
  keyword,
  hslString
} from 'color-string'
import assert from './util/assert'

const WHITE = [ 255, 255, 255, 1 ]

function boundary(val, min = 0, max = 255) {
  return Math.floor(Math.min(max, Math.max(val, min)))
}

const proto = {
  // Manually set RGBA
  red(val) {
    const x = this.data
    return createColor([
      boundary(val), x[1], x[2], x[3]
    ])
  },
  green(val) {
    const x = this.data
    return createColor([
      x[0], boundary(val), x[2], x[3]
    ])
  },
  blue(val) {
    const x = this.data
    return createColor([
      x[0], x[1], boundary(val), x[3]
    ])
  },
  opacity(val) {
    const x = this.data
    return createColor([
      x[0], x[1], x[2], boundary(val, 0, 1)
    ])
  },

  // Factor opacity
  clearer(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      r, g, b, boundary(a * factor, 0, 1)
    ])
  },
  opaquer(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      r, g, b, boundary(a / factor, 0, 1)
    ])
  },

  // Factor RGB
  darken(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      ...[ r, g, b ].map(x => boundary(x * (1 - factor))),
      a
    ])
  },
  lighten(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      ...[ r, g, b ].map(x => boundary(x + (255 - x) * (1 - factor))),
      a
    ])
  },

  // Raw return values
  getRaw() {
    return this.data.slice()
  },
  raw() {
    return this.data.slice()
  },

  // Convert to object
  toRGB() {
    const x = this.data
    return { r: x[0], g: x[1], b: x[2], a: x[3] }
  },
  toRGBA() {
    return this.toRGB()
  },
  toObject() {
    return this.toRGB()
  },

  // Convert to String
  toString(mode) {
    if (mode === 'hex') {
      return hexString(this.data)
    } else if (mode === 'percent') {
      return percentString(this.data)
    } else if (mode === 'keyword') {
      return keyword(this.data)
    } else if (mode === 'hsl') {
      return hslString(this.data)
    }

    return rgbString(this.data)
  },

  // Compatibility
  hexString() {
    return this.toString('hex')
  },
  rgbString() {
    return this.toString()
  },

  // Automatically display a hex string
  valueOf() {
    return this.toString()
  }
}

function isRGB(x) {
  return typeof x === 'number' && x >= 0 && x < 256
}

function isRGBArray(arr) {
  return arr.reduce(
    (state = true, x) => state && isRGB(x)
  )
}

function createColor(tupel) {
  const res = Object.create(proto)
  res.data = tupel || WHITE.slice()
  return res
}

export default function Color(init) {
  if (typeof init === 'string') {
    return createColor(getRgba(init))
  } else if (Array.isArray(init)) {
    assert((
      init.length === 3 || init.length === 4
    ) && isRGBArray(init), 'Expected array to only contain RGB numbers.')

    if (init.length === 3) {
      return createColor([ ...init, 1 ])
    }
    return createColor(init.slice())
  } else if (typeof init === 'object') {
    assert(
      isRGB(init.r) && isRGB(init.g) && isRGB(init.b),
      'Expected object to contain RGB properties.'
    )
    return createColor([ init.r, init.g, init.b, boundary(init.a || 1, 0, 1) ])
  }

  return createColor()
}

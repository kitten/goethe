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
  return Math.min(max, Math.max(val, min))
}

// Source of the RGB <---> HSL conversion functions:
// http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

function RGBtoHSL(data) {
  let [ r, g, b, a ] = data.slice()
  r /= 255
  b /= 255
  g /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r: {
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      }
      case g: {
        h = (b - r) / delta + 2
        break
      }
      case b: {
        h = (r - g) / delta + 4
        break
      }
    }
    h /= 6
  }

  return [ h, s, l, a ]
}

function HSLtoRGB(data) {
  let [ h, s, l, a ] = data.slice()
  let r, g, b = 0

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
    a
  ]
}

function luminance(val) {
  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
}

function average(x, y, factor) {
  factor = boundary(factor, 0, 1)
  return ((1 - factor) * x + factor * y) / 2
}

const proto = {
  // Manually set RGBA
  red(val) {
    if (typeof val === 'undefined') {
      return this.data[0]
    }
    const x = this.data
    return createColor([
      Math.floor(boundary(val)), x[1], x[2], x[3]
    ])
  },
  green(val) {
    if (typeof val === 'undefined') {
      return this.data[2]
    }
    const x = this.data
    return createColor([
      x[0], Math.floor(boundary(val)), x[2], x[3]
    ])
  },
  blue(val) {
    if (typeof val === 'undefined') {
      return this.data[3]
    }
    const x = this.data
    return createColor([
      x[0], x[1], Math.floor(boundary(val)), x[3]
    ])
  },
  opacity(val) {
    if (typeof val === 'undefined') {
      return this.data[4]
    }
    const x = this.data
    return createColor([
      x[0], x[1], x[2], boundary(val, 0, 1)
    ])
  },

  // Get raw values
  getRed() {
    return this.data[0]
  },
  getGreen() {
    return this.data[1]
  },
  getBlue() {
    return this.data[2]
  },
  getOpacity() {
    return this.data[3]
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

  // Factor HSL
  saturate(factor) {
    const [ h, s, l, a ] = RGBtoHSL(this.data)
    const val = boundary(s + (1 - s) * factor, 0, 1)
    return HSLtoRGB([ h, val, l, a ])
  },
  desaturate(factor) {
    const [ h, s, l, a ] = RGBtoHSL(this.data)
    const val = boundary(s * factor, 0, 1)
    return HSLtoRGB([ h, val, l, a ])
  },

  // Greyscale / Grayscale
  greyscale() {
    const x = RGBtoHSL(this.data)
    return HSLtoRGB([ x[0], 0, x[2], x[3] ])
  },
  grayscale() {
    return this.greyscale()
  },

  // Rotate hue in HSL
  rotate(deg) {
    const [ h, s, l, a ] = RGBtoHSL(this.data)
    const val = boundary(h + (deg % 360) / 360, 0, 1)
    return HSLtoRGB([ val, s, l, a ])
  },
  invert() {
    return this.rotate(180)
  },

  // Factor RGB
  darken(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      ...[ r, g, b ].map(x => Math.floor(boundary(x * (1 - factor)))),
      a
    ])
  },
  lighten(factor) {
    const [ r, g, b, a ] = this.data
    return createColor([
      ...[ r, g, b ].map(x => Math.floor(boundary(x + (255 - x) * (1 - factor)))),
      a
    ])
  },

  //Luminance http://www.w3.org/TR/WCAG20/#relativeluminancedef
  luminance() {
    const x = this.data
    return 0.2126 * luminance(x[0]) + 0.7152 * luminance(x[1]) + 0.0722 * luminance(x[2])
  },
  luminosity() {
    return this.luminance()
  },

  // Contrast ratio http://www.w3.org/TR/WCAG20/#contrast-ratiodef
  contrast(c) {
    assert(c instanceof proto, 'Expected argument to be a Color instance.')

    const _luminance = this.luminance()
    const _compareLuminance = c.luminance()

    return _luminance > _compareLuminance ?
      (_luminance + 0.05) / (_compareLuminance + 0.05) :
      (_compareLuminance + 0.05) / (_luminance + 0.05)
  },

  // Mix colors
  mix(c, factor = 0.5) {
    assert(c instanceof proto, 'Expected argument to be a Color instance.')
    const x = this.data
    const y = c

    return createColor([
      boundary(average(x[0], y[0], factor)),
      boundary(average(x[1], y[1], factor)),
      boundary(average(x[2], y[2], factor)),
      x[3]
    ])
  },

  // HWB without HWB through mixing
  whiten(factor) {
    return this.mix(Color([ 255, 255, 255 ]), factor)
  },
  blacken(factor) {
    return this.mix(Color([ 0, 0, 0 ]), factor)
  },

  // Luminosity deciders
  isLight() {
    return this.luminance() > 0.5
  },
  isDark() {
    return this.luminance() <= 0.5
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
  },

  // Shallow copying
  copy() {
    return createColor(this.data.slice())
  },
  clone() {
    return this.copy()
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
    if (init.data && init instanceof proto) {
      return createColor(init.data.slice())
    }

    assert(
      isRGB(init.r) && isRGB(init.g) && isRGB(init.b),
      'Expected object to contain RGB properties.'
    )
    return createColor([ init.r, init.g, init.b, boundary(init.a || 1, 0, 1) ])
  }

  return createColor()
}

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

// Source of the RGB <---> HSV conversion functions:
// https://gist.github.com/mjackson/5311256

function RGBtoHSV(data) {
  let [ r, g, b, a ] = data
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h = max
  let s = max
  let v = max

  const delta = max - min
  s = (max == 0) ? 0 : delta / max

  if (max === min) {
    h = 0
  } else {
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

  return [ h, s, v, a ]
}

function HSVtoRGB(data) {
  let [ h, s, v, a ] = data
  let r, g, b

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break
    case 1: r = q, g = v, b = p; break
    case 2: r = p, g = v, b = t; break
    case 3: r = p, g = q, b = v; break
    case 4: r = t, g = p, b = v; break
    case 5: r = v, g = p, b = q; break
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
    a
  ]
}

function luminance(input) {
  const val = input / 255
  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
}

function average(x, y, factor) {
  factor = boundary(factor, 0, 1)
  return Math.floor(((1 - factor) * x + 2 * factor * y) / 2)
}

const proto = {
  // Manually set RGBA
  red(val) {
    if (val === undefined) {
      return this.data[0]
    }
    const x = this.data
    return createColor([
      Math.floor(boundary(val)), x[1], x[2], x[3]
    ])
  },
  green(val) {
    if (val === undefined) {
      return this.data[1]
    }
    const x = this.data
    return createColor([
      x[0], Math.floor(boundary(val)), x[2], x[3]
    ])
  },
  blue(val) {
    if (val === undefined) {
      return this.data[2]
    }
    const x = this.data
    return createColor([
      x[0], x[1], Math.floor(boundary(val)), x[3]
    ])
  },
  opacity(val) {
    if (val === undefined) {
      return this.data[3]
    }
    const x = this.data
    return createColor([
      x[0], x[1], x[2], boundary(val, 0, 1)
    ])
  },

  // Setters for completeness
  setRed(val) {
    this.red(val)
  },
  setGreen(val) {
    this.green(val)
  },
  setBlue(val) {
    this.blue(val)
  },
  setOpacity(val) {
    this.opacity(val)
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

  // Get arrays
  rgbArray() {
    return this.data.slice()
  },
  getRaw() {
    return this.rgbArray()
  },
  raw() {
    return this.rgbArray()
  },
  hsvArray() {
    return RGBtoHSV(this.data)
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
    const [ h, s, v, a ] = RGBtoHSV(this.data)
    const val = s + (1 - s) * boundary(factor, 0, 1)
    return createColor(HSVtoRGB([ h, val, v, a ]))
  },
  desaturate(factor) {
    const [ h, s, v, a ] = RGBtoHSV(this.data)
    const val = s - s * boundary(factor, 0, 1)
    return createColor(HSVtoRGB([ h, val, v, a ]))
  },

  // Greyscale / Grayscale
  greyscale() {
    const x = RGBtoHSV(this.data)
    return createColor(HSVtoRGB([ x[0], 0, x[2], x[3] ]))
  },
  grayscale() {
    return this.greyscale()
  },

  // Rotate hue in HSL
  rotate(deg) {
    const [ h, s, v, a ] = RGBtoHSV(this.data)
    const val = boundary((h + (deg % 360) / 360) % 1, 0, 1)
    return createColor(HSVtoRGB([ val, s, v, a ]))
  },
  invert() {
    return this.rotate(180)
  },

  // Factor RGB
  darken(factor) {
    const [ r, g, b, a ] = this.data
    const val = boundary(factor, 0, 1)
    return createColor([
      ...[ r, g, b ].map(x => Math.floor(
        boundary(x - x * val)
      )),
      a
    ])
  },
  lighten(factor) {
    const [ r, g, b, a ] = this.data
    const val = boundary(factor, 0, 1)
    return createColor([
      ...[ r, g, b ].map(x => Math.floor(
        boundary(x + (255 - x) * val)
      )),
      a
    ])
  },

  // Luminance http://www.w3.org/TR/WCAG20/#relativeluminancedef
  luminance() {
    const x = this.data
    return 0.2126 * luminance(x[0]) + 0.7152 * luminance(x[1]) + 0.0722 * luminance(x[2])
  },
  luminosity() {
    return this.luminance()
  },

  // Contrast ratio http://www.w3.org/TR/WCAG20/#contrast-ratiodef
  contrast(c) {
    assert(proto.isPrototypeOf(c), 'Expected argument to be a Color instance.')

    const _luminance = this.luminance()
    const _compareLuminance = c.luminance()

    return _luminance > _compareLuminance ?
      (_luminance + 0.05) / (_compareLuminance + 0.05) :
      (_compareLuminance + 0.05) / (_luminance + 0.05)
  },

  // Mix colors
  mix(c, factor = 0.5) {
    assert(proto.isPrototypeOf(c), 'Expected argument to be a Color instance.')
    const x = this.data
    const y = c.data

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
    ) && init.every(isRGB), 'Expected array to only contain RGB numbers.')

    if (init.length === 3) {
      return createColor([ ...init, 1 ])
    }
    return createColor(init.slice())
  } else if (typeof init === 'object') {
    if (init.data && proto.isPrototypeOf(init)) {
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

// Check whether an object is a Color
Color.is = obj => typeof obj === 'object' && proto.isPrototypeOf(obj)

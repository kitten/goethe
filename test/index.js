import expect from 'expect'
import Color from '../src/index'

describe('Color', () => {
  it('Getters', () => {
    const color = Color([ 1, 2, 3, 0.5 ])

    expect(color.red()).toBe(1)
    expect(color.green()).toBe(2)
    expect(color.blue()).toBe(3)
    expect(color.opacity()).toBe(0.5)
  })

  it('Setters', () => {
    const color = Color([ 0, 0, 0, 1 ])

    expect(color.red(1).red()).toBe(1)
    expect(color.green(2).green()).toBe(2)
    expect(color.blue(3).blue()).toBe(3)
    expect(color.opacity(0.5).opacity()).toBe(0.5)
  })

  it('.clearer(factor)', () => {
    const color = Color([ 0, 0, 0, 0.5 ])

    expect(color.clearer(0.5).opacity()).toBe(0.25)
    expect(color.clearer(2).opacity()).toBe(1)
  })

  it('.opaquer(factor)', () => {
    const color = Color([ 0, 0, 0, 0.5 ])

    expect(color.opaquer(0.5).opacity()).toBe(1)
    expect(color.opaquer(2).opacity()).toBe(0.25)
  })

  it('.saturate(factor)', () => {
    const color = Color([ 132, 188, 132, 1 ])

    expect(color.saturate(0.5).raw())
      .toEqual([ 66, 188, 66, 1 ])
  })

  it('.desaturate(factor)', () => {
    const color = Color([ 98, 222, 98, 1 ])

    expect(color.saturate(0.5).raw())
      .toEqual([ 49, 222, 49, 1 ])
  })

  it('.grayscale()', () => {
    const color = Color([ 98, 222, 98, 1 ])

    expect(color.grayscale().raw())
      .toEqual([ 222, 222, 222, 1 ])
  })

  it('.rotate()', () => {
    const color = Color([ 100, 10, 10, 1 ])

    expect(color.rotate(120).raw())
      .toEqual([ 10, 100, 10, 1 ])
  })

  it('.invert()', () => {
    const color = Color([ 100, 10, 10, 1 ])

    expect(color.invert().raw())
      .toEqual([ 10, 100, 100, 1 ])
  })

  it('.darken()', () => {
    const color = Color([ 10, 20, 30, 1 ])

    expect(color.darken(0.5).raw())
      .toEqual([ 5, 10, 15, 1 ])
  })

  it('.lighten()', () => {
    const color = Color([ 10, 20, 30, 1 ])

    expect(color.lighten(0.5).raw())
      .toEqual([ 132, 137, 142, 1 ])
  })

  it('.mix()', () => {
    const black = Color('black')
    const white = Color('white')

    expect(black.mix(white, 0.5).raw())
      .toEqual([ 127, 127, 127, 1 ])

    expect(black.mix(white, 0).raw())
      .toEqual(black.raw())

    expect(black.mix(white, 1).raw())
      .toEqual(white.raw())
  })

  it('.isLight() and .isDark()', () => {
    const black = Color('black')
    const white = Color('white')

    expect(black.isDark()).toBeTruthy()
    expect(black.isLight()).toBeFalsy()
    expect(white.isDark()).toBeFalsy()
    expect(white.isLight()).toBeTruthy()
  })

  it('.is()', () => {
    const color = Color('black')
    const obj = {}

    expect(Color.is(color)).toBeTruthy()
    expect(Color.is(obj)).toBeFalsy()
  })
})


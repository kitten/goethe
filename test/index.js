import test from 'tape'
import Color from '../src/index'

function close(expected, actual, delta = 0.1) {
  return (
    Math.min(expected - delta, actual) === expected - delta &&
    Math.max(expected + delta, actual) === expected + delta
  )
}

test('Getters', t => {
  const color = Color([ 1, 2, 3, 0.5 ])

  t.equal(color.red(), 1)
  t.equal(color.green(), 2)
  t.equal(color.blue(), 3)
  t.equal(color.opacity(), 0.5)

  t.end()
})

test('Setters', t => {
  const color = Color([ 0, 0, 0, 1 ])

  t.equal(color.red(1).red(), 1)
  t.equal(color.green(2).green(), 2)
  t.equal(color.blue(3).blue(), 3)
  t.equal(color.opacity(0.5).opacity(), 0.5)

  t.end()
})

test('.clearer(factor)', t => {
  const color = Color([ 0, 0, 0, 0.5 ])

  t.equal(color.clearer(0.5).opacity(), 0.25)
  t.equal(color.clearer(2).opacity(), 1)

  t.end()
})

test('.opaquer(factor)', t => {
  const color = Color([ 0, 0, 0, 0.5 ])

  t.equal(color.opaquer(0.5).opacity(), 1)
  t.equal(color.opaquer(2).opacity(), 0.25)

  t.end()
})

test('.saturate(factor)', t => {
  const color = Color([ 132, 188, 132, 1 ])

  t.deepEqual(
    color.saturate(0.5).raw(),
    [ 66, 188, 66, 1 ]
  )

  t.end()
})

test('.desaturate(factor)', t => {
  const color = Color([ 98, 222, 98, 1 ])

  t.deepEqual(
    color.saturate(0.5).raw(),
    [ 49, 222, 49, 1 ]
  )

  t.end()
})

test('.grayscale()', t => {
  const color = Color([ 98, 222, 98, 1 ])

  t.deepEqual(
    color.grayscale().raw(),
    [ 222, 222, 222, 1 ]
  )

  t.end()
})

test('.rotate()', t => {
  const color = Color([ 100, 10, 10, 1 ])

  t.deepEqual(
    color.rotate(120).raw(),
    [ 10, 100, 10, 1 ]
  )

  t.end()
})

test('.invert()', t => {
  const color = Color([ 100, 10, 10, 1 ])

  t.deepEqual(
    color.invert().raw(),
    [ 10, 100, 100, 1 ]
  )

  t.end()
})

test('.darken()', t => {
  const color = Color([ 10, 20, 30, 1 ])

  t.deepEqual(
    color.darken(0.5).raw(),
    [ 5, 10, 15, 1 ]
  )

  t.end()
})

test('.lighten()', t => {
  const color = Color([ 10, 20, 30, 1 ])

  t.deepEqual(
    color.lighten(0.5).raw(),
    [ 132, 137, 142, 1 ]
  )

  t.end()
})

test('.luminance()', t => {
  t.ok(close(Color([ 230, 230, 230 ]).luminance(), 0.791, 0.01))
  t.ok(close(Color([ 255, 255, 255 ]).luminance(), 1, 0.01))
  t.ok(close(Color([ 0, 0, 0 ]).luminance(), 0, 0.01))

  t.end()
})

test('.contrast()', t => {
  const black = Color('black')
  const white = Color('white')

  t.ok(close(black.contrast(white), 21, 0.01))

  t.end()
})

test('.mix()', t => {
  const black = Color('black')
  const white = Color('white')

  t.deepEqual(
    black.mix(white, 0.5).raw(),
    [ 127, 127, 127, 1 ]
  )

  t.deepEqual(
    black.mix(white, 0).raw(),
    black.raw()
  )

  t.deepEqual(
    black.mix(white, 1).raw(),
    white.raw()
  )

  t.end()
})

test('.isLight() and .isDark()', t => {
  const black = Color('black')
  const white = Color('white')

  t.ok(black.isDark())
  t.notOk(black.isLight())
  t.notOk(white.isDark())
  t.ok(white.isLight())

  t.end()
})

test('.is()', t => {
  const color = Color('black')
  const obj = {}

  t.ok(Color.is(color))
  t.notOk(Color.is(obj))

  t.end()
})

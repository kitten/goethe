# Goethe

Immutable color utility with conversion and manipulation. Basically an immutable
version of [MoOx/color](https://github.com/MoOx/color) but fully functional /
immutable.

[![build status](https://img.shields.io/travis/philplckthun/goethe/master.svg)](https://travis-ci.org/philplckthun/goethe)
[![npm version](https://img.shields.io/npm/v/goethe.svg)](https://www.npmjs.com/package/goethe)

## Installation

To install the latest version:

```
npm install --save goethe
```

## Usage

```
import Color from 'goethe';

const black = Color('black');
```

## Constructors

You can input a lot into Goethe's `Color` constructor.

### CSS Color String

```js
Color('#000000')
Color('blue')
Color('rgb(0, 0, 0)')
```

### RGB or RGBA array

```js
Color([0, 0, 0])
Color([0, 0, 0, 1])
```

### RGB(A) object

```js
Color({ r: 0, g: 0, b: 0, a: 0.5 })
```

The opacity `a` is optional and is set to `1` by default.

## Setters

```js
color.red(234)
color.green(234)
color.blue(234)
color.opacity(0.5)
```

## Getters

```js
color.red()
color.green()
color.blue()
color.opacity()

// For completeness
color.getRed()
color.getGreen()
color.getRed()
color.getOpacity()

color.rgbArray()
color.hsvArray()
color.raw()
color.getRaw()

// Luminance between 0 and 1
color.luminance()

color.isLight()
color.isDark()

// These all convert to { r: 0, g: 0, b: 0, a: 0}
color.toRGB()
color.toRGBA()
color.toObject()
```

There are some special methods to convert the Color to a string:

`.toString()` converts the color to an RGB(A) string by default. You can
change that behavior by setting the argument to one of these modes:

- hex
- percent
- keyword
- hsl

There's also a `.valueOf()` method that converts the Color to an RGB(a) string
if JavaScript casts it to a string. This allows you to use the object without
explicitly converting it.

## Methods

```js
// Relatively change opacity by a factor
color.clearer(factor)
color.opaquer(factor)

// Relatively change saturation by a factor
color.saturate(factor)
color.desaturate(factor)

// Get the grayscale of a color
color.greyscale()
color.grayscale()

// Rotate hue
color.rotate(deg)
color.invert() // Rotates by 180 degrees

// Relatively change brightness by a factor
color.darken(factor)
color.lighten(factor)

// Returns the contrast ratio of two colors which is a value between 0 and 21
color.contrast(another_color)

// Mixes the second color to the first by the factor
color.mix(another_color, factor)

// Whiten / Blacken color by factor
color.whiten(factor)
color.blacken(factor)

// Copy / Clone color
color.copy()
color.clone()
```

## License

MIT

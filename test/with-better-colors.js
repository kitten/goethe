import expect from 'expect'

import colorsCSS from 'colors.css'
import Color from '../src/with-better-colors'

describe('colors.css support', () => {
  it('works as expected', () => {
    for (const name in colorsCSS) {
      if (colorsCSS.hasOwnProperty(name)) {
        expect(Color(name).toString())
          .toBe(Color(colorsCSS[name]).toString())
      }
    }
  })
})

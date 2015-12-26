import test from 'tape'

import colors_css from 'colors.css'
import Color from '../src/with-better-colors'

test('Colors.css support', t => {
  for (let name in colors_css) {
    t.equal(
      Color(name).toString(),
      Color(colors_css[name]).toString()
    )
  }

  t.end()
})

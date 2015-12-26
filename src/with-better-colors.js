import Color from './index'

import colors_css from 'colors.css'

// Wrapper that adds support for mrmrs/colors
// http://clrs.cc/
export default function Color_withBetterColors(init) {
  if (
    typeof init === 'string' &&
    typeof colors_css[init] === 'string'
  ) {
    return Color(colors_css[init])
  }

  return Color(init)
}

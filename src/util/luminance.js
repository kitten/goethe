export default function luminance(input) {
  const val = input / 255
  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
}


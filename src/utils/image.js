/**
 * Returns true only if the string is a safe, usable image src:
 *   - a proper http/https URL, OR
 *   - a complete, non-truncated data URI (must contain a comma separator)
 */
export function isValidImageSrc(src) {
  if (!src || typeof src !== 'string') return false
  if (src.startsWith('http://') || src.startsWith('https://')) return true
  // data URIs must have the form  data:<mediatype>;base64,<data>
  // A truncated one will be missing the comma or have no data after it
  if (src.startsWith('data:')) {
    const commaIdx = src.indexOf(',')
    return commaIdx > 10 && commaIdx < src.length - 10
  }
  return false
}

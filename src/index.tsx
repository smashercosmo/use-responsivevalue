import { useEffect, useMemo, useState } from 'react'

const WHITE_SPACE_REGEXP = /\s+/g
const WIDTH_REGEXP = /(\d+)px/
const MEDIA_QUERY_REGEXP = /^\((?:min|max)-width:\d+px\)/

type MediaQueryValuePairs<Value> = (readonly [string, Value])[]
type MediaQueryListValuePairs<Value> = (readonly [MediaQueryList, Value])[]
type Options<Value> = {
  initialValue?: Value
  __dangerouslyForceInitialValue?: boolean
}

/**
 * Sorts mediaQueryValuePairs from largest to smallest
 *
 * @param {string} mediaQueryValuePair1 ( e.g. '(min-width: 480px) 2' or just '2' )
 * @param {string} mediaQueryValuePair2 ( e.g. '(min-width: 720px) 4' or just '4' )
 * @returns {number}
 */
function sortMediaQueryValuePairs(
  mediaQueryValuePair1: string,
  mediaQueryValuePair2: string,
) {
  const mediaQuery1Match = mediaQueryValuePair1.match(WIDTH_REGEXP)
  const mediaQuery2Match = mediaQueryValuePair2.match(WIDTH_REGEXP)
  const width1 = mediaQuery1Match ? mediaQuery1Match[1] : 0
  const width2 = mediaQuery2Match ? mediaQuery2Match[1] : 0
  return Number(width2) - Number(width1)
}

/**
 * Parses media expression
 *
 * @param {string} mediaExpression ( e.g. '(min-width: 480px) 2, (min-width: 720px) 3, 1' )
 * @returns {[string, string][]} parsed expression ( e.g. [['(min-width: 480px)', '2'], ['(min-width: 720px)', '3'], ['all', '1']] )
 */
function parseMediaExpression<Value extends string = string>(
  mediaExpression: string,
): MediaQueryValuePairs<Value> {
  return mediaExpression
    .trim()
    .replace(WHITE_SPACE_REGEXP, '')
    .split(',')
    .sort(sortMediaQueryValuePairs)
    .map(function createMediaQueryValuePair(mediaQueryValueString) {
      const mediaQueryMatch = mediaQueryValueString.match(MEDIA_QUERY_REGEXP)
      const mediaQuery = mediaQueryMatch ? mediaQueryMatch[0] : 'all'
      const value = (mediaQueryMatch
        ? mediaQueryValueString.substr(mediaQuery.length)
        : mediaQueryValueString) as Value
      return [mediaQuery, value] as const
    })
}

/**
 * Creates mediaQueryListValuePairs out of mediaQueryValuePairs
 *
 * @param {string} mediaQueryValuePairs ( e.g. [['(min-width: 480px)', '2'], ['(min-width: 720px)', '3'], ['all', '1']] )
 * @returns {[MediaQueryList, string][]}
 */
function createMediaQueryListValuePairs<Value extends string = string>(
  mediaQueryValuePairs: MediaQueryValuePairs<Value>,
): MediaQueryListValuePairs<Value> {
  return mediaQueryValuePairs.map(function createMediaQueryListValuePair(
    mediaQueryValuePair,
  ) {
    const mediaQuery = mediaQueryValuePair[0]
    const value = mediaQueryValuePair[1] as Value
    const mediaQueryList =
      typeof window === 'undefined'
        ? ({ matches: true, media: mediaQuery } as MediaQueryList)
        : window.matchMedia(mediaQuery)
    return [mediaQueryList, value] as const
  })
}

/**
 * Gets value, that corresponds to the most relevant media query
 * (in this case 'most relevant' means 'first one, that matches')
 *
 * @param {[MediaQueryList, string][]} mediaQueryListValuePairs
 * @returns {string}
 */
function getValue<Value extends string = string>(
  mediaQueryListValuePairs: MediaQueryListValuePairs<Value>,
): Value {
  return mediaQueryListValuePairs.filter(
    function filterOutNonRelevantMediaQueryLists(mediaQueryListValuePair) {
      const mediaQueryList = mediaQueryListValuePair[0]
      return mediaQueryList.matches
    },
  )[0][1]
}

/**
 * React hook to deal with responsive values
 *
 * @param {string} mediaExpression ( e.g. '(min-width: 480px) 2, (min-width: 720px) 3, 1' )
 * @param {object} options
 * @param {string} options.initialValue
 * @param {boolean} options.__dangerouslyForceInitialValue for testing only
 * @returns {string}
 */
function useResponsiveValue<Value extends string = string>(
  mediaExpression: string,
  options?: Options<Value>,
) {
  const { initialValue, __dangerouslyForceInitialValue } = options || {}
  const mediaQueryValuePairs = useMemo(
    () => parseMediaExpression<Value>(mediaExpression),
    [mediaExpression],
  )

  const [value, setValue] = useState<Value>(() => {
    if (
      (typeof window === 'undefined' || __dangerouslyForceInitialValue) &&
      typeof initialValue !== 'undefined'
    ) {
      return initialValue
    }
    return getValue<Value>(
      createMediaQueryListValuePairs<Value>(mediaQueryValuePairs),
    )
  })

  /**
   * Second render pass to prevent markup mismatch
   * in case of SSR
   */
  useEffect(
    function onMount() {
      const valueOnMount = getValue<Value>(
        createMediaQueryListValuePairs<Value>(mediaQueryValuePairs),
      )
      if (typeof initialValue === 'string' && valueOnMount !== initialValue) {
        setValue(valueOnMount)
      }
    },
    [initialValue, mediaQueryValuePairs],
  )

  useEffect(
    function onMediaExpressionChange() {
      const mediaQueryListValuePairs = createMediaQueryListValuePairs(
        mediaQueryValuePairs,
      )

      function onMediaQueryStateChange() {
        setValue(getValue<Value>(mediaQueryListValuePairs))
      }

      mediaQueryListValuePairs.forEach(function addListeners(
        mediaQueryListValuePair,
      ) {
        const mediaQueryList = mediaQueryListValuePair[0]
        mediaQueryList.addListener(onMediaQueryStateChange)
      })

      return function onUnMount() {
        mediaQueryListValuePairs.forEach(function removeListeners(
          mediaQueryListValuePair,
        ) {
          const mediaQueryList = mediaQueryListValuePair[0]
          mediaQueryList.removeListener(onMediaQueryStateChange)
        })
      }
    },
    [mediaQueryValuePairs],
  )

  return value
}

export { useResponsiveValue }
export default useResponsiveValue

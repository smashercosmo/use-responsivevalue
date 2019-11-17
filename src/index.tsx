import { useEffect, useMemo, useState } from 'react'

const WHITE_SPACE_REGEXP = /\s+/g
const WIDTH_REGEXP = /(\d+)px/
const MEDIA_QUERY_REGEXP = /^\((?:min|max)-width:\d+px\)/

type MediaQueryValuePairs = (readonly [string, string])[]
type MediaQueryListValuePairs = (readonly [MediaQueryList, string])[]

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
): number {
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
function parseMediaExpression(mediaExpression: string): MediaQueryValuePairs {
  return mediaExpression
    .trim()
    .replace(WHITE_SPACE_REGEXP, '')
    .split(',')
    .sort(sortMediaQueryValuePairs)
    .map(function createMediaQueryValuePair(mediaQueryValueString) {
      const mediaQueryMatch = mediaQueryValueString.match(MEDIA_QUERY_REGEXP)
      const mediaQuery = mediaQueryMatch ? mediaQueryMatch[0] : 'all'
      const value = mediaQueryMatch
        ? mediaQueryValueString.substr(mediaQuery.length)
        : mediaQueryValueString
      return [mediaQuery, value] as const
    })
}

/**
 * Creates mediaQueryListValuePairs out of mediaQueryValuePairs
 *
 * @param {string} mediaQueryValuePairs ( e.g. [['(min-width: 480px)', '2'], ['(min-width: 720px)', '3'], ['all', '1']] )
 * @returns {[MediaQueryList, string][]}
 */
function createMediaQueryListValuePairs(
  mediaQueryValuePairs: MediaQueryValuePairs,
): MediaQueryListValuePairs {
  return mediaQueryValuePairs.map(function createMediaQueryListValuePair(
    mediaQueryValuePair,
  ) {
    const mediaQuery = mediaQueryValuePair[0]
    const value = mediaQueryValuePair[1]
    const mediaQueryList = window.matchMedia(mediaQuery)
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
function getValue(mediaQueryListValuePairs: MediaQueryListValuePairs): string {
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
 * @returns {string}
 */
function useResponsiveValue(mediaExpression: string): string {
  const mediaQueryValuePairs = useMemo(
    () => parseMediaExpression(mediaExpression),
    [mediaExpression],
  )

  const state = useState(
    getValue(createMediaQueryListValuePairs(mediaQueryValuePairs)),
  )

  const stateValue = state[0]
  const setStateValue = state[1]

  useEffect(
    function onMediaExpressionChange() {
      const mediaQueryListValuePairs = createMediaQueryListValuePairs(
        mediaQueryValuePairs,
      )

      function onMediaQueryStateChange(): void {
        setStateValue(getValue(mediaQueryListValuePairs))
      }

      mediaQueryListValuePairs.forEach(function addListeners(
        mediaQueryListValuePair,
      ) {
        const mediaQueryList = mediaQueryListValuePair[0]
        mediaQueryList.addListener(onMediaQueryStateChange)
      })

      return function onUnMount(): void {
        mediaQueryListValuePairs.forEach(function removeListeners(
          mediaQueryListValuePair,
        ) {
          const mediaQueryList = mediaQueryListValuePair[0]
          mediaQueryList.removeListener(onMediaQueryStateChange)
        })
      }
    },
    // https://github.com/facebook/react/issues/17366
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mediaQueryValuePairs],
  )

  return stateValue
}

export { useResponsiveValue }
export default useResponsiveValue

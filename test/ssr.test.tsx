/** @jest-environment node */

import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { useResponsiveValue } from '../src'

it('should return value for the highest media query on the server', () => {
  function Component() {
    const value = useResponsiveValue(
      '(min-width: 480px) 2, (min-width: 720px) 3, (min-width: 1024px) 4, 1',
    )
    return React.createElement('span', {}, value)
  }

  const result = ReactDOMServer.renderToString(React.createElement(Component))
  expect(result).toBe('<span data-reactroot="">4</span>')
})

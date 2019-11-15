import { renderHook, act } from '@testing-library/react-hooks'
import matchMediaPolyfill from 'mq-polyfill'

import { useResponsiveValue } from '../src'

matchMediaPolyfill(window)

window.resizeTo = function resizeTo(width, height) {
  Object.assign(this, {
    innerWidth: width,
    innerHeight: height,
    outerWidth: width,
    outerHeight: height,
  }).dispatchEvent(new this.Event('resize'))
}

function resize(width: number) {
  act(() => {
    window.resizeTo(width, 500)
  })
}

function render(mediaExpression: string) {
  const { result } = renderHook<{}, string>(() =>
    useResponsiveValue(mediaExpression),
  )
  return result
}

beforeEach(() => {
  resize(0)
})

it('should return default value', () => {
  const result = render('10')
  expect(result.current).toBe('10')
})

it('should return value for the initially matched media query', () => {
  resize(720)
  const result = render(
    '(min-width: 480px) 2, (min-width: 720px) 3, (min-width: 1024px) 4, 1',
  )
  expect(result.current).toBe('3')
})

it('should change values depending on the matched media query', () => {
  const result = render(
    '(min-width: 480px) 2, (min-width: 720px) 3, (min-width: 1024px) 4, 1',
  )
  expect(result.current).toBe('1')
  resize(480)
  expect(result.current).toBe('2')
  resize(720)
  expect(result.current).toBe('3')
  resize(1024)
  expect(result.current).toBe('4')
  resize(320)
  expect(result.current).toBe('1')
})

it('should not depend on the order of media queries', () => {
  const result = render(
    '(min-width: 720px) 3, (min-width: 480px) 2, (min-width: 1024px) 4, 1',
  )
  resize(720)
  expect(result.current).toBe('3')
  resize(1024)
  expect(result.current).toBe('4')
  resize(480)
  expect(result.current).toBe('2')
})

it('should be white-space tolerant', () => {
  const result = render(
    '  (   min-width: 720px ) 3  , (min-width:      480px ) 2, ( min-width:   1024px) 4 , 1   ',
  )
  resize(720)
  expect(result.current).toBe('3')
  resize(1024)
  expect(result.current).toBe('4')
  resize(480)
  expect(result.current).toBe('2')
})

it('should be error tolerant', () => {
  const result = render('(min-width: 720) 3, (min-width:      480px ) 2')
  resize(720)
  expect(result.current).toBe('2')
  resize(320)
  expect(result.current).toBe('(min-width:720)3')
})

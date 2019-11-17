import React from 'react'

import { useResponsiveValue } from '../src'

function App() {
  const width = useResponsiveValue(
    '(min-width: 480px) 480, (min-width: 720px) 720, (min-width: 1024px) 1024, 0',
  )

  return (
    <div>
      <div
        style={{
          width: 1024,
          padding: '50px 50px 50px 0',
          background: 'pink',
        }}>
        <div
          style={{
            width: 720,
            padding: '50px 50px 50px 0',
            background: 'orange',
          }}>
          <div
            style={{
              width: 480,
              padding: '50px 50px 50px 0',
              background: 'red',
            }}>
            Current break point: &gt;{width}px
          </div>
        </div>
      </div>
    </div>
  )
}

export { App }

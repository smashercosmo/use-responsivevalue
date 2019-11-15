# use-responsivevalue

React hook for dealing with responsive values.
It borrows its syntax from the ```<img />``` tag 'sizes' attribute.

## Usage

```js
import React from 'react'
import useResponsiveValue from 'use-responsivevalue'

export default function App() {
  const value = useResponsiveValue('(min-width: 480px) 2, (min-width: 720px) 3, 1')

  return <div>current value is: {value}</div>
}
```
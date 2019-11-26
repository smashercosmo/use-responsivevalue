# use-responsivevalue

React hook for dealing with responsive values.
It borrows its syntax from the ```<img />``` tag 'sizes' attribute.

## Usage

```
npm install use-responsivevalue --save-exact
```

```js
import React from 'react'
import useResponsiveValue from 'use-responsivevalue'

export default function App() {
  const value = useResponsiveValue('(min-width: 480px) 2, (min-width: 720px) 3, 1')

  return <div>current value is: {value}</div>
}
```

## Usage with TypeScript

TypeScript users can optionally have strongly typed responsive value

```js
import React from 'react'
import useResponsiveValue from 'use-responsivevalue'

export default function App() {
  const value = useResponsiveValue<'2' | '3' | '1'>('(min-width: 480px) 2, (min-width: 720px) 3, 1')

  return <div>current value is: {value}</div>
}
```

## Usage on the server

On the server all queries will be in matched state. And value for the largest one will be returned
(this behaviour is a subject to change). 

```js
import React from 'react'
import useResponsiveValue from 'use-responsivevalue'

export default function App() {
  // On the server value will be '3'
  const value = useResponsiveValue('(min-width: 480px) 2, (min-width: 720px) 3, 1')

  return <div>current value is: {value}</div>
}
```
# reselect-mapper

> this is a small package that will help us to define and use your selectors in a **clean**, **easy** and **fast** way.

more specifically it will help us to

- **define all our selectors in a linear way**
- **one and only one way to combine selecotrs**
- **use named selector hooks** to avoid importing a lot of selectors in a file and have a fast access to all our selectors.

[![NPM](https://img.shields.io/npm/v/reselect-mapper.svg)](https://www.npmjs.com/package/reselect-mapper)

## Install

```bash
npm install --save reselect-mapper
```

## Package content

Here are what we can import from the package

- mapSelectors
- createParamsSelectorHook
- createNamedSelectorHook,

```tsx
import {
  mapSelectors,
  createParamsSelectorHook,
  createNamedSelectorHook
} from 'reselect-mapper'
```

## mapSelectors

this helper uses _createSelector_ from **reselect** and brings out 2 main benefits

- **a simple way to combine selectors using records**

```tsx
import { mapSelectors } from 'reselect-mapper'

const getMin = (state: State) => state.min
const getMax = (state: State) => state.max
// now if we want to get the difference between the max and the min,
// taking account of the state offset, we can proceed like this
const getOffsetDiff = mapSelectors(
  // selectors are passed using a record,
  // so the mapping is done directly here
  { min: getMin, max: getMax },
  (
    map, // map signature is { min: number, max: number }, => low risk to have typos when accessing selected value
    state: State
  ) => state.offset + map.max - map.min
)
```

- **no extra efforts needed when combining selectors with params**: the synthax does not change

```tsx
const getUserById = (state: State, id: string) => state.users[id]
const getPostByIndex = (state: State, index: number) => state.posts[index]

const getUserAndPost = mapSelectors(
  { user: getUserById, post: getPostByIndex },
  (map) => map // map here is { user: User, post: Post }
)
```

instead if we used _createSelector_ from _reselect_ package, the synthax would be a curry function and a bit complex

```tsx
const getUserById = (id: string) => (state: State) => state.users[id]
const getPostByIndex = (index: number) => (state: State) => state.posts[index]

const getUserAndPost = (id: string, index: number) =>
  // curry function
  createSelector(
    // selectors are passed in an array and should not be curry functions
    [
      // so we need to pass all the parameters again here
      getUserById(id),
      getPostByIndex(index)
    ],
    // the mapping is done in the callback params
    // => high risk of introducing bad mapping while dealing with a lot of selectors:
    // => we can easily define (post, user) => any instead of (user, post) => any
    (user, post) => ({
      user,
      post
    })
  )
```

let's now have a look to this **selectors.ts** file example to see how it will look like in a real project

```tsx
import { mapSelectors } from 'reselect-mapper'
type State = {
  group: string
  creationDate: string
  users: { [K: string]: User }
  posts: { [K: number]: Post }
}
// no params selector
export const getGroup = (state: State) => state.group
export const getCreationDate = (state: State) => state.creationDate
// selector with params
export const getUserById = (state: State, id: string) => state.users[id]
export const getPostByIndex = (state: State, index: number) => state.posts[index]
// combining no params selectors
export const getGroupAndCreationDate = mapSelectors(
  // selectors record
  { group: getGroup, date: getCreationDate },
  (map) => map // map signature is { group: string, date: string }
)
// this will return the following selector
// (state: State) => { group: string, date: string }

// mixing selectors where some of them require params: same synthax as before
export const getUserAndGroup = mapSelectors(
  {  user: getUserById, group: getGroup, },
  (map) => map // map signature is  { user: User, group: string }
)
// this will return the following selector
// (state: State, params: { user: string }) => { user: User, group: string }

// here you can notice that, the params is a record and has only one key
// "user" which is what will be passed to getUserById selector.

// combining selectors where all of them require params: again same synthax
export const getUserAndPost = mapSelectors(
  {  user: getUserById, post: getPostByIndex },
  (map) => map // map signature is { user: User, post: post }
)
// this will return the following selector
// (state: State, params: { user: string, post: number })
//            => {  user: User, post: Post }

// here instead, we passed 2 selectors and the params record has also 2 keys
// "user": parameter to be passed to getUserById selector
// "post": parameter to be passed to getPostByIndex selector
}
```

now we we can use these selectors in our component **MyComponent.tsx**
let's first try to use **useSelector** from **react-redux**

```tsx
import { useSelector } from 'react-redux'

import {
  getGroup,
  getUserById,
  getCreationDate,
  getGroupAndCreationDate,
  getUserAndGroup,
  getUserAndPost
} from './selectors'

const MyComponent = () => {
  // how to use a no params selector
  const group = useSelector(getGroup)
  const date = useSelector(getCreationDate)
  // how to use a no params combined selector
  const groupAndDate = useSelector(getGroupAndCreationDate)
  // how to use a selector with params
  const user = useSelector((state) => getUserById(state, 'userId'))
  const userAndGroup = useSelector((state) =>
    getUserAndGroup(state, { user: 'userId' })
  )
  const userAndPost = useSelector((state) =>
    getUserAndPost(state, {
      user: 'userId',
      post: 3
    })
  )
  return <div>test</div>
}
```

## createParamsSelectorHook

as we could notice, when it comes to pass parameters to the selector using the standard _useSelector_ from _redux_, we have to use a curry function. but we can remove it by creating a **params selector hook**

### creating a params selector hook using store

```ts
import { createStore } from 'redux'
import reducers, { initialState } from './reducers'
import { createParamsSelectorHook } from 'reselect-mapper'

const store = createStore(reducers, initialState)
const useSelector = createParamsSelectorHook(store)

// now we can use it like this
const value1 = useSelector(selectorWithNoParams)
const value2 = useSelector(selectorWithParams, params)
```

### creating a params selector hook using useSelector hook

```ts
import { useSelector as useDefaultSelector } from 'react-redux'
import { createParamsSelectorHook } from 'reselect-mapper'

const useSelector = createParamsSelectorHook(useDefaultSelector)

// now we can use it like follows
const value1 = useSelector(selectorWithNoParams)
const value2 = useSelector(selectorWithParams, params)
```

## createNamedSelectorHook

in the previous example we saw how to use our selectors but one thing we can notice is that we had to import all the desired selectors in our component file. And this is an operation we will often do.
That means, we should deal many times with the following situations:

- **repetitive imports**: we are importing the same selector functions many times in different files => more line of codes => more file size

- **conflicting selectors**: let's imagine we have both _getX_ and _getY_ from _./pippo/selectors.ts_ and _./pluto/selectors.ts_. it can happen to import the wrong _getX_ or the wrong _getY_ due to the multiple imports we can have in our file.
  But more often, we'll have to import both of them in the same file, and in this case, to avoid conflictual imports, we need to rename all those selectors like follows:

```tsx
import { getX as getPippoX, getY as getPippoY } from '/pippo/selectors'
import { getX as getPlutoX, getY as getPlutoY } from '/pluto/selectors'
```

these situations are not a big deal, but since they will come over and over in our daily work, using a named selector hook will eventually have a global impact at the end of the day because it will help us to have a clean file with less imports, to avoid selectors conflict and have a fast access to all our selectors.

so let's then define a **hooks.ts** file where we can create our a named selector hook and see how to use it

we need the selectors records and either the **store** or the _default useSelector_ to create named hooks

```tsx
import { createNamedSelectorHook } from 'reselect-mapper'
import { useSelector, shallowEqual, createSelectorHook } from 'react-redux'
import { store } from './configs'
import * as userSelectors from './selectors'

// creating useUserSelectors from store
export const useUserSelectors = createNamedSelectorHook(store)(userSelectors)

// creating useUserSelectors from useSelector
export const useUserSelectorsShallEq = createNamedSelectorHook(useSelector)(
  userSelectors
)

const useShallowEqualSelector = (selector: Selector) =>
  useSelector(selector, shallowEqual)
// creating useUserSelectors from useShallowEqualSelector
export const useUserSelectorsShallEq = createNamedSelectorHook(
  useShallowEqualSelector
)(userSelectors)

const useSelectorInSomeContext = createSelectorHook(myContext)
// creating useUserSelectors from useSelectorInSomeContext
export const useUserSelectorsInContext = createNamedSelectorHook(
  useSelectorInSomeContext
)(userSelectors)
```

now we defined the _useUserSelectors_, we can change the _MyComponent.tsx_ file removing all the imported selectors, import only our named hook and use it instead of _useSelector_

```tsx
// we have only 1 import here instead of 7
import { useUserSelectors } from './hooks'
// import { useSelector } from 'reselect-mapper'
/*import {
  getGroup,
  getUserById,
  getCreationDate,
  getGroupAndCreationDate,
  getUserAndGroup,
  getUserAndPost
  } from './selectors'
  */

const MyComponent = () => {
  // how to use a no params selector
  const group = useUserSelectors('getGroup')
  const date = useUserSelectors('getCreationDate')
  // how to use a no params combined selector
  const groupAndDate = useUserSelectors('getGroupAndCreationDate')
  // how to use a selector with params
  const user = useUserSelectors('getUserById', 'userId')
  const userAndGroup = useUserSelectors('getUserAndGroup', { user: 'userId' })
  const userAndPost = useUserSelectors('getUserAndPost', {
    user: 'userId',
    post: 3
  })
  return <div>test</div>
}
```

Also here, the named selector hook accepts 1 or 2 arguments.

- **the selector name**: first and required argument, a string reference of a desired selector
- **the selector's parameter**: required if the given selector from the selector name requires a parameter

as you can see, in this case, we directly also avoid selectors names conflicts

```tsx
// import { getX as getPippoX, getY as getPippoY } from '/pippo/selectors'
// import { getX as getPlutoX, getY as getPlutoY } from '/pluto/selectors'
import { usePippoSelectors } from '/pippo/hooks'
import { usePlutoSelectors } from '/pluto/hooks'

const MyComponent = () => {
  const pippoX = usePippoSelectors('getX')
  const plutoX = usePlutoSelectors('getX')
  return <div>test</div>
}
```

try it out! see this [code sandbox example](https://codesandbox.io/s/selector-utils-example-d0889?file=/src/App.js)

## see also

- [react-requests-manager](https://www.npmjs.com/package/react-requests-manager)
- [react-hooks-in-callback](https://www.npmjs.com/package/react-hooks-in-callback)
- [react-context-selector](https://www.npmjs.com/package/react-context-selector)

## License

MIT © [https://github.com/fernandoem88/react-context-selector](https://github.com/https://github.com/fernandoem88/react-context-selector)

import { useRef, useState, useCallback, useEffect } from 'react'
import { StateManagerStore, Get2ndParams, CreateSelectorHook } from 'types'
import { shallowEqual } from 'shallow-utils'
import { useForceUpdate, useShallowEqualRef } from '../../hooks.ts'
import { doUnsubscribe, copy } from '../helpers.ts'

const createSelectorHookFromStore = <State>(
  store: StateManagerStore<State>
) => {
  const useSelector = <Selector extends (state: State, params: any) => any>(
    selector: Selector,
    ...args: Get2ndParams<Selector>
  ) => {
    const [params] = args
    // am using useState to not define the initial state again

    const [initialState] = useState(store.getState)

    const selectorRef = useRef(selector)
    selectorRef.current = selector
    const [initialSelectedValue] = useState(() => {
      return copy(selector(initialState, params)) as ReturnType<Selector>
    })
    const selectedValueRef = useRef({
      value: initialSelectedValue
    })
    // checkUpdate returns true if the selected value is updated
    const checkUpdate = useCallback(() => {
      const state = store.getState()
      const newSelectedValue = selectorRef.current(state, paramsRef.current)
      const isEqual = shallowEqual(
        { value: newSelectedValue },
        { value: selectedValueRef.current.value }
      )
      if (isEqual) return false
      selectedValueRef.current = { value: copy(newSelectedValue) }
      return true
    }, [])
    // if shouldCheckUpdateInMainBodyRef.current is true, we will check for update in the body of this hook not in the useEffect
    const shouldCheckUpdateInMainBodyRef = useRef(false)
    // const shouldCheckUpdateInUseEffectRef = useRef(false)
    const paramsRef = useShallowEqualRef(params)

    if (shouldCheckUpdateInMainBodyRef.current) {
      // shouldCheckUpdateInUseEffectRef.current = false
      checkUpdate()
    } else {
      // it's false only when there was an update in useEffect so to avoid checking it twice
      shouldCheckUpdateInMainBodyRef.current = true
    }
    const forceUpdate = useForceUpdate()

    useEffect(() => {
      const doUpdate = () => {
        const shouldUpdate = checkUpdate()
        if (shouldUpdate) {
          shouldCheckUpdateInMainBodyRef.current = false
          forceUpdate()
        }
      }

      doUpdate() // first update
      const subscription = store.subscribe(doUpdate)
      return () => doUnsubscribe(subscription)
    }, [checkUpdate, forceUpdate])
    return selectedValueRef.current.value as ReturnType<Selector>
  }

  return useSelector
}

const createSelectorHookFromHook = <State = any>(
  useHook: (selector: (state: any) => any) => any
) => {
  const useSelector = <Selector extends (state: State, params: any) => any>(
    selector: Selector,
    ...args: Get2ndParams<Selector>
  ) => {
    const [params] = args
    const paramsRef = useShallowEqualRef(params)
    return useHook((state) =>
      selector(state, paramsRef.current)
    ) as ReturnType<Selector>
  }

  return useSelector
}

const createSelectorHook: CreateSelectorHook = (params: any) => {
  if (typeof params === 'function') return createSelectorHookFromHook(params)
  return createSelectorHookFromStore(params)
}

export default createSelectorHook

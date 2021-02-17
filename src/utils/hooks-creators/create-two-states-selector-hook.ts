import { useRef, useState, useCallback, useEffect } from 'react'
import { StateManagerStore, Get2ndParams } from 'types'
import { shallowEqual } from 'shallow-utils'
import { useForceUpdate, useShallowEqualRef } from '../../hooks.ts'
import { doUnsubscribe, copy } from '../helpers.ts'

const createTwoStatesSelectorHook = <State1, State2>(
  store1: StateManagerStore<State1>,
  store2: StateManagerStore<State2>
) => {
  const getState = () => ({
    state1: store1.getState(),
    state2: store2.getState()
  })
  const useSelector = <
    Selector extends (state1: State1, state2: State2, params: any) => any
  >(
    selector: Selector,
    ...args: Get2ndParams<Selector>
  ) => {
    const [params] = args
    // am using useState to not define the initial state again

    const [initialState] = useState(getState)

    const selectorRef = useRef(selector)
    selectorRef.current = selector
    const [initialSelectedValue] = useState(() => {
      return copy(
        selector(initialState.state1, initialState.state2, params)
      ) as ReturnType<Selector>
    })
    const selectedValueRef = useRef({
      value: initialSelectedValue
    })
    // checkUpdate returns true if the selected value is updated
    const checkUpdate = useCallback(() => {
      const { state1, state2 } = getState()
      const newSelectedValue = selectorRef.current(
        state1,
        state2,
        paramsRef.current
      )
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
      const subscription1 = store1.subscribe(doUpdate)
      const subscription2 = store2.subscribe(doUpdate)
      return () => {
        doUnsubscribe(subscription1)
        doUnsubscribe(subscription2)
      }
    }, [checkUpdate, forceUpdate])
    return selectedValueRef.current.value as ReturnType<Selector>
  }

  return useSelector
}

export default createTwoStatesSelectorHook

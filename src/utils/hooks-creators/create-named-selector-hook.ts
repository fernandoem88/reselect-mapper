import { Get2ndParams, StateManagerStore, CreateNamedSelectorHook } from 'types'
import createParamsHook from './create-selector-hook'
import { useShallowEqualRef } from '../../hooks.ts'

const createSelectorHookFromStore = <State = any>(
  store: StateManagerStore<State>
) => {
  const useSelector = createParamsHook(store)
  const useNameSelectors = <
    State,
    Selectors extends Record<any, (state: State, params: any) => any>
  >(
    selectors: Selectors
  ) => __createNamedSelectorHook(useSelector, selectors)
  return useNameSelectors
}

const createSelectorHookFromHook = <State = any>(
  useHook: (selector: (state: any) => any) => any
) => {
  const useSelector = createParamsHook(useHook)
  const useNameSelectors = <
    State,
    Selectors extends Record<any, (state: State, params: any) => any>
  >(
    selectors: Selectors
  ) => __createNamedSelectorHook(useSelector, selectors)
  return useNameSelectors
}

export const __createNamedSelectorHook = <
  State,
  Selectors extends Record<any, (state: State, params: any) => any>
>(
  useSelector: (selector: any, params: any) => any,
  selectors: Selectors
) => {
  return <Key extends keyof Selectors>(
    key: Key,
    ...parameters: Get2ndParams<Selectors[Key]>
  ) => {
    const [params] = parameters
    const paramsRef = useShallowEqualRef(params)

    const selector = selectors[key]
    return useSelector(selector, paramsRef.current) as ReturnType<
      Selectors[Key]
    >
  }
}

const createNamedSelectorHook = ((storeOrHook: any) => {
  if (typeof storeOrHook === 'function')
    return createSelectorHookFromHook(storeOrHook)
  return createSelectorHookFromStore(storeOrHook)
}) as CreateNamedSelectorHook

export default createNamedSelectorHook

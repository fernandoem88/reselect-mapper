import { Get2ndParams, StateManagerStore, CreateNamedSelectorHook } from 'types'
import createParamsSelectorHook from './create-selector-hook'
// import { useShallowEqualRef } from '../../hooks.ts'

const createSelectorHookFromStore = <State = any>(
  store: StateManagerStore<State>
) => {
  const useParamsSelector = createParamsSelectorHook(store)
  const createUseNamedSelectors = <
    State,
    Selectors extends Record<any, (state: State, params: any) => any>
  >(
    selectors: Selectors
  ) => __createNamedSelectorHook(useParamsSelector, selectors)
  return createUseNamedSelectors
}

const createSelectorHookFromHook = <State = any>(
  useSelector: (selector: (state: State) => any) => any
) => {
  const useParamsSelector = createParamsSelectorHook(useSelector)
  const createUseNamedSelectors = <
    State,
    Selectors extends Record<any, (state: State, params: any) => any>
  >(
    selectors: Selectors
  ) => __createNamedSelectorHook(useParamsSelector, selectors)
  return createUseNamedSelectors
}

export const __createNamedSelectorHook = <
  State,
  Selectors extends Record<any, (state: State, params: any) => any>
>(
  useParamsSelector: (selector: any, params: any) => any,
  selectors: Selectors
) => {
  const useNamedSelectors = <Key extends keyof Selectors>(
    key: Key,
    ...parameters: Get2ndParams<Selectors[Key]>
  ) => {
    const [params] = parameters
    const selector = selectors[key]
    return useParamsSelector(selector, params) as ReturnType<Selectors[Key]>
  }
  return useNamedSelectors
}

const createNamedSelectorHook = ((storeOrHook: any) => {
  if (typeof storeOrHook === 'function')
    return createSelectorHookFromHook(storeOrHook)
  return createSelectorHookFromStore(storeOrHook)
}) as CreateNamedSelectorHook

export default createNamedSelectorHook

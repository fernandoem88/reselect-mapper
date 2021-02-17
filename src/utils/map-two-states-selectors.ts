import { mapRecord } from './map-record'
import { createSelector } from 'reselect'
import { OmitKeysOfType, GetFirstParams, Get2ndParams } from 'types'

export const mapTwoStatesSelectors = <
  Selectors extends Record<any, (state1: any, state2: any, params: any) => any>,
  Mapper extends (
    map: { [K in keyof Selectors]: ReturnType<Selectors[K]> },
    state1: GetFirstParams<Selectors[keyof Selectors]>[0],
    state2: Get2ndParams<Selectors[keyof Selectors]>[0]
  ) => any
>(
  selectors: Selectors,
  mapper: Mapper
) => {
  type SelectorKey = keyof Selectors
  type State1 = GetFirstParams<Selectors[SelectorKey]>[0]
  type State2 = Get2ndParams<Selectors[SelectorKey]>[0]
  type SParam<K extends SelectorKey> = Selectors[K] extends (
    s1: any,
    s2: any,
    params: infer Params
  ) => any
    ? Params
    : undefined

  type NoParamsSelector = (s1: any, s2: any) => any
  type RequiredKeys = OmitKeysOfType<NoParamsSelector, Selectors>
  type SelectorsParams = {
    [K in keyof RequiredKeys]: SParam<K>
  }
  type LastParams = keyof SelectorsParams extends never ? [] : [SelectorsParams]

  const mapperSelector = createSelector(mapper, (selected) => selected)

  return (state1: State1, state2: State2, ...params: LastParams) => {
    const map = mapRecord(selectors, (nthSelector, key) => {
      const selectedParams =
        params && key in params ? params[key as keyof typeof params] : undefined
      // to be sure this is a reselect selector
      const selector = createSelector(nthSelector, (nthValue) => nthValue)
      return selector(state1, state2, selectedParams)
    })

    return mapperSelector(map, state1, state2) as ReturnType<Mapper>
  }
}

// const select1 = (s1: number, s2: string) => s1 > 2 && s2 === ''

// const select2 = (s1: number, s2: string, params: string) =>
//   s1 > 2 && s2 === '' && !!params ? 1 : 2

// const select3 = mapTwoStatesSelectors(
//   { bool: select1, str: select2 },
//   (map) => map.str
// )

// select3(1, '', { str: '£df' })

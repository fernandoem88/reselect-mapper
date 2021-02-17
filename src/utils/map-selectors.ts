import { mapRecord } from './map-record'
import { createSelector } from 'reselect'
import { OmitKeysOfType, GetFirstParams } from 'types'

export const mapSelectors = <
  Selectors extends Record<any, (state: any, params: any) => any>,
  Mapper extends (
    map: { [K in keyof Selectors]: ReturnType<Selectors[K]> },
    state: GetFirstParams<Selectors[keyof Selectors]>[0]
  ) => any
>(
  selectors: Selectors,
  mapper: Mapper
) => {
  type SelectorKey = keyof Selectors
  type State = GetFirstParams<Selectors[SelectorKey]>[0]
  type SParam<K extends SelectorKey> = Selectors[K] extends (
    s: any,
    params: infer Params
  ) => any
    ? Params
    : undefined

  type NoParamsSelector = (s: any) => any
  type RequiredKeys = OmitKeysOfType<NoParamsSelector, Selectors>
  type SelectorsParams = {
    [K in keyof RequiredKeys]: SParam<K>
  }
  type LastParams = keyof SelectorsParams extends never ? [] : [SelectorsParams]

  const selectorMapper = createSelector(mapper, (selected) => selected)

  return (state: State, ...params: LastParams) => {
    const map = mapRecord(selectors, (nthSelector, key) => {
      const selectedParams =
        params && key in params ? params[key as keyof typeof params] : undefined
      // to be sure this is a reselect selector
      const selector = createSelector(nthSelector, (nthValue) => nthValue)
      return selector(state, selectedParams)
    })

    return selectorMapper(map, state) as ReturnType<Mapper>
  }
}

const select1 = (s1: number) => s1 > 2

const select2 = (s1: number, params: string) => (s1 > 2 && !!params ? 1 : 2)

const select3 = mapSelectors({ bool: select1, str: select2 }, (map) => map.str)

select3(1, { str: '£df' })

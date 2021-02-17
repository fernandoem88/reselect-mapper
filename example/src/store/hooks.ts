import { createNamedSelectorHook } from 'reselect-mapper'

import { useSelector, shallowEqual } from 'react-redux'
import * as selectors from './selectors'

export const useCompanySelectors = createNamedSelectorHook(useSelector)(
  selectors
)

export const useCompanyShallowSelectors = createNamedSelectorHook(
  function useShallowEqualSelector(selector: any) {
    return useSelector(selector, shallowEqual)
  }
)(selectors)

declare module 'types' {
  export type GetFirstParams<Selector> = Selector extends (
    state: infer State,
    ...params: any
  ) => any
    ? [State]
    : []

  export type Get2ndParams<Selector> = Selector extends (
    state: any,
    ...params: infer Params
  ) => any
    ? Params[0] extends undefined
      ? []
      : [Params[0]]
    : []

  export type Get3rdParams<Selector> = Selector extends (
    param1: any,
    reqs: any,
    ...params: infer Params
  ) => any
    ? Params[0] extends undefined
      ? []
      : [Params[0]]
    : []

  export type MapRecord<Value> = <
    Rec extends Record<any, Value>,
    R,
    Mapper extends (value: Value) => R
  >(
    record: Rec,
    mapper: Mapper
  ) => Record<keyof Rec, R>

  export type KeySymbol = string | number | symbol
  type KeysRecord<T, Obj extends {}> = {
    [K in keyof Obj]: Obj[K] extends T ? K : never
  }
  export type KeysOfType<T, Obj extends {}> = KeysRecord<
    T,
    Obj
  >[keyof Obj] extends never
    ? never
    : KeysRecord<T, Obj>[keyof Obj]

  export type PickKeysOfType<T, Obj extends {}> = {
    [K in KeysOfType<T, Obj>]: Obj[K]
  }
  export type OmitKeysOfType<T, Obj extends {}> = {
    [K in keyof Omit<Obj, KeysOfType<T, Obj>>]: Obj[K]
  }

  export interface StateManagerStore<State = any> {
    getState: () => State
    subscribe: (listener: () => void) => Function | { unsubscribe: Function }
  }

  export interface Dictionary<T> {
    [K: string]: T
  }
  export interface CreateSelectorHook {
    <State>(store: StateManagerStore<State>): <
      Selector extends (state: State, params: any) => any
    >(
      selector: Selector,
      ...args: Get2ndParams<Selector>
    ) => ReturnType<Selector>

    <State = any>(useSelector: (selector: (state: any) => any) => any): <
      Selector extends (state: State, params: any) => any
    >(
      selector: Selector,
      ...args: Get2ndParams<Selector>
    ) => ReturnType<Selector>
  }

  export interface UseNamedSelectors<State> {
    <Selectors extends Record<any, (state: State, params: any) => any>>(
      selectors: Selectors
    ): <Key extends keyof Selectors>(
      key: Key,
      ...parameters: Get2ndParams<Selectors[Key]>
    ) => ReturnType<Selectors[Key]>
  }

  export interface CreateNamedSelectorHook {
    <State = any>(store: StateManagerStore<State>): UseNamedSelectors<State>
    <State = any>(
      useSelector: (selector: (state: any) => any) => any
    ): UseNamedSelectors<State>
  }
}

declare module 'shallow-utils' {
  export function shallowEqual<T extends any>(v1: T, v2: T): boolean
  export function shallowEqualExcept(): any
  export function shallowItemsDifferExcept(): any
}

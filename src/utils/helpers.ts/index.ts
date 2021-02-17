import produce from 'immer'
import { Dictionary } from 'types'

export const doUnsubscribe = (subscription: any) => {
  if (typeof subscription === 'function') {
    subscription()
  } else if ('unsubscribe' in subscription) {
    subscription.unsubscribe()
  }
}

export const copy = <V>(value: V) => produce(value, () => {}) as V

export const mapRecord = <
  Rec extends Record<any, any> | Dictionary<any>,
  Mapper extends (value: Rec[keyof Rec], key: keyof Rec) => any
>(
  record: Rec,
  mapper: Mapper
) => {
  return Object.entries(record).reduce((acc: any, [key, value]) => {
    return { ...acc, [key]: mapper(value, key) }
  }, {}) as Record<keyof Rec, ReturnType<Mapper>>
}

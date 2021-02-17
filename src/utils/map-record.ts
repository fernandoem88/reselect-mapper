import { Dictionary } from 'types'

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

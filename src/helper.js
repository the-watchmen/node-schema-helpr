// import _ from 'lodash'
// import debug from 'debug'

// const dbg = debug('lib:schema-helpr')

// export function alternativesToMap({alternatives}) {
//   assert(alternatives.meta)
//   return _.transform(
//     alternatives,
//     (result, alt) => {
//       result
//     },
//     {}
//   )
// }

export function pushParent({parent, key}) {
  return parent ? `${parent}.${key}` : key
}

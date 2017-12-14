// import _ from 'lodash'
// import {assert} from '@watchmen/helpr'

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

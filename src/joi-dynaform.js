import _ from 'lodash'
import {stringify, merge, assert} from '@watchmen/helpr'
import debug from 'debug'
import {pushParent} from './helper'

const dbg = debug('lib:schema-helpr:joi-dynaform')

// const schema = {
//   type: 'alternatives',
//   meta: [
//     {
//       discriminator: 'type._id'
//     }
//   ],
//   alternatives: [
//     {
//       type: 'object',
//       children: {
//         _id: {
//           type: 'string',
//           invalids: ['']
//         },
//         type: {
//           type: 'object',
//           children: {
//             _id: {
//               type: 'string',
//               flags: {
//                 allowOnly: true
//               },
//               valids: ['t1'],
//               invalids: [''],
//               label: 'type one'
//             }
//           }
//         },
//         f1: {
//           type: 'string',
//           flags: {
//             presence: 'required'
//           },
//           invalids: ['']
//         }
//       }
//     },
//     {
//       type: 'object',
//       children: {
//         _id: {
//           type: 'string',
//           invalids: ['']
//         },
//         type: {
//           type: 'object',
//           children: {
//             _id: {
//               type: 'string',
//               flags: {
//                 allowOnly: true
//               },
//               valids: ['t2'],
//               invalids: [''],
//               label: 'type two'
//             }
//           }
//         },
//         f2: {
//           type: 'string',
//           flags: {
//             presence: 'required'
//           },
//           invalids: ['']
//         }
//       }
//     },
//     {
//       type: 'object',
//       children: {
//         _id: {
//           type: 'string',
//           invalids: ['']
//         },
//         type: {
//           type: 'object',
//           children: {
//             _id: {
//               type: 'string',
//               flags: {
//                 allowOnly: true
//               },
//               valids: ['t3'],
//               invalids: [''],
//               label: 'type three'
//             }
//           }
//         },
//         f3: {
//           type: 'string',
//           flags: {
//             presence: 'required'
//           },
//           invalids: ['']
//         }
//       }
//     }
//   ]
// }

export function getAlternativeDiscriminators({alternatives}) {
  assert(
    alternatives.alternatives,
    () => `alternatives required for alternatives=${stringify(alternatives)}`
  )
  assert(alternatives.meta, () => `meta required for alternatives=${stringify(alternatives)}`)
  const meta = merge(alternatives.meta)
  assert(meta.discriminator, () => `discriminator required for meta=${stringify(meta)}`)
  return getDiscriminators({
    alternatives: alternatives.alternatives,
    discriminator: meta.discriminator
  })
}

// collects discriminators from property on array of schema alternatives
//
export function getDiscriminators({alternatives, discriminator}) {
  assert(
    _.isArray(alternatives),
    () => `array required for alternatives=${stringify(alternatives)}`
  )
  assert(
    _.isString(discriminator),
    () => `string required for discriminator=${stringify(discriminator)}`
  )

  // 'a.b.c' -> 'children.a.children.b.children.c'
  const _property = `children.${discriminator.replace(/\./g, '.children.')}`
  dbg('get-discriminators: _property=%o', _property)

  return _.transform(
    alternatives,
    (result, alternative) => {
      const propVal = _.get(alternative, _property)
      assert(
        propVal,
        () => `property=${_property} required on alternative=${stringify(alternative)}`
      )
      assert(propVal.valids[0], () => `valids[0] required on property=${stringify(propVal)}`)
      assert(propVal.label, () => `label required on property=${stringify(propVal)}`)
      result[propVal.valids[0]] = propVal.label
    },
    {}
  )
}

export function getFields({schema, adapter, result = [], parent, isCreate, className}) {
  dbg(
    'get-fields: schema=%o, result.length=%o, parent=%o, is-create=%o, class-name=%o',
    schema,
    result.length,
    parent,
    isCreate,
    className
  )
  assert(schema.children, `children required for schema=${stringify(schema)}`)
  return _.transform(
    schema.children,
    (result, property, key) => {
      const meta = merge(property.meta)
      dbg('get-fields: property=%o, key=%o, meta=%o', property, key, meta)
      if (
        !(
          (isCreate && meta.generated) ||
          (isCreate && meta.isDiscriminator) ||
          (!isCreate && meta.hidden)
        )
      ) {
        if (property.type === 'object') {
          // allow adapter to wrap in some kind of container?
          result.push(
            ...getFields({
              schema: property,
              adapter,
              result,
              parent: pushParent({parent, key}),
              isCreate,
              className
            })
          )
        } else {
          result.push(adapter.getField({key, property, parent, className}))
        }
      } else {
        dbg('get-fields: skipping property=%o', pushParent({parent, key}))
      }
    },
    result
  )
}

import _ from 'lodash'
import {stringify, merge, assert} from '@watchmen/helpr'
import debug from 'debug'
import {pushParent} from './helper'

const dbg = debug('lib:schema-helpr:dynaform')

export function getFields({schema, adapter, result = [], parent, isCreate, className}) {
  dbg(
    'get-fields: schema=%o, result.length=%o, parent=%o, is-create=%o, class-name=%o',
    schema,
    result.length,
    parent,
    isCreate,
    className
  )
  assert(adapter, 'adapter required')
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
          getFields({
            schema: property,
            adapter,
            result,
            parent: pushParent({parent, key}),
            isCreate,
            className
          })
        } else {
          const readOnly = meta.generated || meta.isDiscriminator
          result.push(adapter.getField({key, property, parent, className, readOnly}))
        }
      } else {
        dbg('get-fields: skipping property=%o', pushParent({parent, key}))
      }
    },
    result
  )
}

export function getModeFields({schema, adapter, className}) {
  return {
    create: getFields({schema, adapter, isCreate: true, className}),
    edit: getFields({schema, adapter, className})
  }
}

// args: alternatives
//
// {
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
//               label: 'type one'
//             }
//           }
//         },
//         f1: {
//           type: 'string',
//           flags: {
//             presence: 'required'
//           }
//         }
//       }
//     },
//     {
//       type: 'object',
//       children: {
//         _id: {
//           type: 'string'
//         },
//         type: {
//           type: 'object',
//           children: {
//             _id: {
//               type: 'string',
//               flags: {
//                 allowOnly: true
//               },
//               valids: ['t2']
//               label: 'type two'
//             }
//           }
//         },
//         f2: {
//           type: 'string',
//           flags: {
//             presence: 'required'
//           }
//         }
//       }
//     }
//   ]
// }
//
// returns:
//
// {
//   t1: {
//     label: 'type one',
//     alternative: {
//       create: [],
//       edit: []
//     }
//   },
//   t2: {
//     label: 'type two',
//     alternative: {
//       create: [],
//       edit: []
//     }
//   }
// }
//
export function getAlternativeModeFields({alternatives, adapter, className}) {
  const _alternatives = alternatives.alternatives
  assert(
    _alternatives && _.isArray(_alternatives),
    () => `alternatives array required for alternatives=${stringify(alternatives)}`
  )

  assert(alternatives.meta, () => `meta required for alternatives=${stringify(alternatives)}`)
  const meta = merge(alternatives.meta)

  const _discriminator = meta.discriminator
  assert(
    _discriminator && _.isString(_discriminator),
    () => `discriminator string required for meta=${stringify(meta)}`
  )

  // 'a.b.c' -> 'children.a.children.b.children.c'
  const _property = `children.${_discriminator.replace(/\./g, '.children.')}`
  dbg('get-alternative-mode-fields: _property=%o', _property)

  return _.transform(
    _alternatives,
    (result, alternative) => {
      const propVal = _.get(alternative, _property)
      assert(
        propVal,
        () => `property=${_property} required on alternative=${stringify(alternative)}`
      )
      assert(propVal.valids[0], () => `valids[0] required on property=${stringify(propVal)}`)
      assert(propVal.label, () => `label required on property=${stringify(propVal)}`)
      result[propVal.valids[0]] = {
        label: propVal.label,
        fields: getModeFields({schema: alternative, adapter, className})
      }
    },
    {}
  )
}

// args:
//
// {
//   t1: {
//     label: 'type one',
//     alternative: {
//       create: [],
//       edit: []
//     }
//   },
//   t2: {
//     label: 'type two',
//     alternative: {
//       create: [],
//       edit: []
//     }
//   }
// }
//
// returns:
//
// {t1: 'type one', t2: 'type two'}
//
export function getDiscriminators({modeFields}) {
  return _.transform(modeFields, (result, alternative, key) => {
    result[key] = alternative.label
  })
}

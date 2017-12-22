import _ from 'lodash'
import {stringify, merge, assert} from '@watchmen/helpr'
import debug from 'debug'

const dbg = debug('lib:schema-helpr:dynaform')

export function pushParent({parent, key}) {
  return parent ? `${parent}.${key}` : key
}

// 'a.b.c' -> 'children.a.children.b.children.c'
export function getSchemaProperty({property}) {
  return `children.${property.replace(/\./g, '.children.')}`
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
  assert(adapter, 'adapter required')
  assert(schema.children, `children required for schema=${stringify(schema)}`)
  return _.transform(
    schema.children,
    (result, property, key) => {
      const meta = merge(property.meta)
      dbg('get-fields: property=%o, key=%o, meta=%o', property, key, meta)
      if (
        !(
          (isCreate && meta.isGenerated) ||
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
          const readOnly = meta.isGenerated || meta.isDiscriminator
          // let field
          // if (meta.isDiscriminator) {
          //   field = adapter.getDiscriminator({key, property, parent, meta, className})
          // } else {
          //   field = adapter.getField({key, property, parent, meta, className, readOnly})
          // }
          const field = adapter.getField({key, property, parent, meta, className, readOnly})
          result.push(field)
        }
      } else {
        dbg('get-fields: skipping property=%o', pushParent({parent, key}))
      }
    },
    result
  )
}

// args: alternatives (from joi.describe() with discriminator meta set):
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
//     alternative: getAlternativeValue({alternative})
//   },
//   t2: {
//     label: 'type two',
//     alternative: getAlternativeValue({alternative})
//   }
// }
//
export function getAlternativeValues({alternatives, getAlternativeValue}) {
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

  const _property = getSchemaProperty({property: _discriminator})
  dbg('get-alternative-schemas: _property=%o', _property)

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
        alternative: getAlternativeValue({alternative})
      }
    },
    {}
  )
}

export function getModeFields({schema, adapter, className}) {
  return {
    create: getFields({schema, adapter, isCreate: true, className}),
    edit: getFields({schema, adapter, className})
  }
}

// returns:
//
// {
//   t1: {
//     label: 'type one',
//     alternative: {
//       create: [...],
//       edit: [...]
//     }
//   },
//   t2: {
//     label: 'type two',
//     alternative: {
//       create: [...],
//       edit: [...]
//     }
//   }
// }
//
export function getAlternativeModeFields({alternatives, adapter, className}) {
  return getAlternativeValues({
    alternatives,
    getAlternativeValue: ({alternative}) => {
      return getModeFields({schema: alternative, adapter, className})
    }
  })
}

// returns:
//
// {
//   t1: {
//     label: 'type one',
//     alternative
//   },
//   t2: {
//     label: 'type two',
//     alternative:
//   }
// }
//
export function getAlternativeSchemas({alternatives}) {
  return getAlternativeValues({
    alternatives,
    getAlternativeValue: ({alternative}) => alternative
  })
}

// args:
//
// {
//   t1: {
//     label: 'type one',
//     alternative: {...}
//   },
//   t2: {
//     label: 'type two',
//     alternative: {...}
//   }
// }
//
// returns:
//
// {t1: 'type one', t2: 'type two'}
//
export function getAlternativeDiscriminators({alternatives}) {
  return _.transform(alternatives, (result, alternative, key) => {
    result[key] = alternative.label
  })
}

export function getUpdatePaths({schema, parent, result = []}) {
  dbg('get-updatable-paths: schema=%j, result=%o', schema, result)
  return _.transform(
    schema.children,
    (result, property, key) => {
      dbg('transform: key=%o, property=%o, result=%o', key, property, result)
      var meta = merge(property.meta)
      if (!(meta.isDiscriminator || meta.isGenerated)) {
        if (property.type === 'object') {
          getUpdatePaths({
            schema: property,
            parent: pushParent({parent: parent, key: key}),
            result: result
          })
        } else {
          result.push(pushParent({parent: parent, key: key}))
        }
      }
    },
    []
  )
}

export function getUpdateData({data, schema, paths}) {
  var _paths = paths || getUpdatePaths({schema: schema})
  dbg('paths=%o', _paths)
  return _.pick(data, _paths)
}

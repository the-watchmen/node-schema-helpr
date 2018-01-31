import _ from 'lodash'
import {merge, assert} from '@watchmen/helpr'
import debug from 'debug'

const dbg = debug('lib:schema-helpr')

export function propertyPath({parent, key}) {
  return parent ? `${parent}.${key}` : key
}

// 'a.b.c' -> 'children.a.children.b.children.c'
export function getSchemaProperty({property}) {
  return `children.${property.replace(/\./g, '.children.')}`
}

export function getSchemaValue({schema, property}) {
  return _.get(schema, getSchemaProperty({property}))
}

export function getFields({
  schema,
  adapter,
  result = [],
  parent,
  isCreate,
  className,
  readOnly,
  hooks,
  values
}) {
  dbg('get-fields: args=%o', arguments[0])
  assert(adapter, 'adapter required')
  assert(schema.children, `children required for schema=${stringify(schema)}`)
  return _.transform(
    schema.children,
    (result, property, key) => {
      const meta = merge(property.meta)
      dbg('get-fields: property=%o, key=%o, meta=%o', property, key, meta)
      const path = propertyPath({parent, key})
      if (
        !(
          (isCreate && meta.isGenerated) ||
          (isCreate && meta.isDiscriminator) ||
          (!isCreate && meta.hidden)
        )
      ) {
        const _readOnly = readOnly || meta.isGenerated || meta.isDiscriminator
        if (property.type === 'object') {
          // allow adapter to wrap in some kind of container provided by getSection
          const {getSection} = adapter
          const _result = getFields({
            schema: property,
            adapter,
            result: getSection ? [] : result,
            parent: path,
            isCreate,
            className,
            readOnly: _readOnly,
            values
          })

          if (getSection && !_.isEmpty(_result)) {
            result.push(getSection({fields: _result, parent, key}))
          }
        } else {
          const hook = _.get(hooks, path)
          const value = _.get(values, path)
          dbg('value=%o', value)
          const field = hook
            ? hook({key, property, parent, className, readOnly, meta, value, path})
            : adapter.getField({
                key,
                property,
                parent,
                meta,
                className,
                readOnly: _readOnly,
                value,
                path
              })

          result.push(field)
        }
      } else {
        dbg('get-fields: skipping property=%o', path)
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
//   t1: getAlternativeValue({alternative}),
//   t2: getAlternativeValue({alternative})
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
      // result[propVal.valids[0]] = {
      //   label: propVal.label,
      //   alternative: getAlternativeValue({alternative})
      // }
      result[propVal.valids[0]] = getAlternativeValue({alternative, label: propVal.label})
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
//     create: [...],
//     edit: [...]
//   },
//   t2: {
//     create: [...],
//     edit: [...]
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
//   t1: alternative,
//   t2: alternative
// }
//
export function getAlternativeSchemas({alternatives}) {
  return getAlternativeValues({
    alternatives,
    getAlternativeValue: ({alternative}) => alternative
  })
}

// returns:
//
// {
//   t1: 'type one',
//   t2: 'type two'
// }
//
// export function getAlternativeDiscriminators({alternatives}) {
//   return _.transform(alternatives, (result, alternative, key) => {
//     result[key] = alternative.label
//   })
// }

export function getAlternativeDiscriminators({alternatives}) {
  return getAlternativeValues({
    alternatives,
    getAlternativeValue: ({label}) => label
  })
}

export function getUpdatePaths({schema, parent, result = []}) {
  dbg('get-updatable-paths: schema=%j, result=%o', schema, result)
  return _.transform(
    schema.children,
    (result, property, key) => {
      dbg('transform: key=%o, property=%j, result=%o', key, property, result)
      var meta = merge(property.meta)
      if (!meta.isGenerated) {
        const _parent = propertyPath({parent: parent, key: key})
        if (property.type === 'object') {
          getUpdatePaths({
            schema: property,
            parent: _parent,
            result: result
          })
        } else {
          result.push(_parent)
        }
      }
    },
    result
  )
}

export function getAlternativeUpdatePaths({alternatives}) {
  return getAlternativeValues({
    alternatives,
    getAlternativeValue: ({alternative}) => getUpdatePaths({schema: alternative})
  })
}

export function getUpdateData({data, schema, paths}) {
  var _paths = paths || getUpdatePaths({schema: schema})
  dbg('paths=%o', _paths)
  return _.pick(data, _paths)
}

export function isRequired({property}) {
  return _.get(property, 'flags.presence') === 'required'
}

export function isString({property}) {
  return _.get(property, 'type') === 'string'
}

export function isNumber({property}) {
  return _.get(property, 'type') === 'number'
}

export function isCreditCard({property}) {
  return (
    _.get(property, 'type') === 'string' && getRuleArg({property, name: 'name'}) === 'creditCard'
  )
}

export function getRuleArg({property, name}) {
  const rule = _.find(property.rules, rule => rule.name === name)
  return rule && rule.arg
}

export function getMin({property}) {
  return getRuleArg({property, name: 'min'})
}

export function getMax({property}) {
  return getRuleArg({property, name: 'max'})
}

export function getRegex({property}) {
  const arg = getRuleArg({property, name: 'regex'})
  return arg && arg.pattern
}

export function stringify({schema}) {
  // https://github.com/hapijs/joi/issues/207#issuecomment-361247374
  return JSON.stringify(schema, (k, v) => (v instanceof RegExp ? v.toString().slice(1, -1) : v))
}

import assert from 'assert'
import _ from 'lodash'
import {stringify} from '@watchmen/helpr'
import debug from 'debug'

const dbg = debug('lib:dynaform:json-schema')

// collects discriminators from property on array of (json-schema) variants
export function getDiscriminators({variants, property}) {
  assert(_.isArray(variants), 'variants must be an array')
  assert(_.isString(property), 'property must be an array')
  // 'a.b.c' -> 'properties.a.properties.b.properties.c'
  const _property = `properties.${property.replace(/\./g, '.properties.')}`
  dbg('get-discriminators: _property=%o', _property)
  return _.transform(
    variants,
    (result, variant) => {
      const propVal = _.get(variant, _property)
      if (!propVal) {
        throw new Error(`unable to find property=${property} on variant=${stringify(variant)}`)
      }
      assert(propVal.enum, `enum required on property=${propVal}`)
      assert(propVal.title, `title required on property=${propVal}`)
      result[propVal.enum] = propVal.title
    },
    {}
  )
}

// json-schema syntax:
//
// const schema = {
//   type: 'object',
//   properties: {
//     _id: {
//       type: 'string'
//     },
//     type: {
//       type: 'object',
//       properties: {
//         _id: {
//           title: 'type three',
//           enum: ['t3'],
//           type: 'string'
//         }
//       },
//       additionalProperties: false,
//       patterns: []
//     },
//     f3: {
//       type: 'string'
//     }
//   },
//   additionalProperties: false,
//   patterns: [],
//   required: ['f3']
// }

// joi syntax
//
// const schema = {
//   type: 'object',
//   children: {
//     _id: {
//       type: 'string',
//       flags: {},
//       meta: [
//         {
//           readOnly: true
//         }
//       ],
//       invalids: [''],
//       label: 'id'
//     },
//     type: {
//       type: 'object',
//       children: {
//         _id: {
//           type: 'string',
//           flags: {
//             allowOnly: true
//           },
//           meta: [
//             {
//               readOnly: true
//             }
//           ],
//           valids: ['t1'],
//           invalids: [''],
//           label: 'type one'
//         }
//       }
//     },
//     f1: {
//       type: 'string',
//       flags: {
//         presence: 'required'
//       },
//       invalids: ['']
//     }
//   }
// }

export function getForm({schema, adapter, result = [], parent, isCreate}) {
  dbg('get-form: parent=%o, is-create=%o', parent, isCreate)
  assert(schema.properties, `properties required for schema=${stringify(schema)}`)
  return _.transform(
    schema.properties,
    (result, property, key) => {
      dbg('get-form: property=%o, key=%o', property, key)
      result.push(adapter.getComponent({property}))
    },
    result
  )
}

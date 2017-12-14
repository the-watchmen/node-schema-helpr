import test from 'ava'
import {getDiscriminators} from '../../src/json-schema-dynaform'

const requests = [
  {
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      },
      type: {
        type: 'object',
        properties: {
          _id: {
            title: 'type one',
            enum: ['t1'],
            type: 'string'
          }
        },
        additionalProperties: false,
        patterns: []
      },
      f1: {
        type: 'string'
      }
    },
    additionalProperties: false,
    patterns: [],
    required: ['f1']
  },
  {
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      },
      type: {
        type: 'object',
        properties: {
          _id: {
            title: 'type two',
            enum: ['t2'],
            type: 'string'
          }
        },
        additionalProperties: false,
        patterns: []
      },
      f2: {
        type: 'string'
      }
    },
    additionalProperties: false,
    patterns: [],
    required: ['f2']
  },
  {
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      },
      type: {
        type: 'object',
        properties: {
          _id: {
            title: 'type three',
            enum: ['t3'],
            type: 'string'
          }
        },
        additionalProperties: false,
        patterns: []
      },
      f3: {
        type: 'string'
      }
    },
    additionalProperties: false,
    patterns: [],
    required: ['f3']
  }
]

test('getOptions', t => {
  const options = getDiscriminators({variants: requests, property: 'type._id'})
  t.deepEqual(options, {t1: 'type one', t2: 'type two', t3: 'type three'})
})

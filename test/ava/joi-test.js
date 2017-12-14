import test from 'ava'
import debug from 'debug'
import {pretty} from '@watchmen/helpr'
import joi from 'joi'
import _ from 'lodash'
import requestValidator from './fixtures/request-1'
import {check} from './_helper'

const dbg = debug('test:joi')

const alt = joi
  .alternatives()
  .meta({discriminator: '_id.valids', label: '_id.label'})
  .try(
    joi.object({
      _id: joi
        .string()
        .valid('t1')
        .label('type one')
        .meta({foo: 'bar'})
        .meta({bar: 'baz'}),
      f1: joi.string().required()
    }),
    joi.object({
      _id: joi
        .string()
        .valid('t2')
        .label('type two'),
      f2: joi.string().required()
    })
  )

test('describe', t => {
  const described = alt.describe()
  dbg('described:\n', pretty(described))
  t.truthy(described)
  // meta is provided as an array, so test out merge routine
  const meta = _.transform(
    described.alternatives[0].children._id.meta,
    (result, elt) => Object.assign(result, elt),
    {}
  )
  t.deepEqual(meta, {foo: 'bar', bar: 'baz'})
})

test('describe: request', t => {
  const described = requestValidator.describe()
  dbg('described:\n', pretty(described))
  t.truthy(described)
})

test('validate', t => {
  let result = alt.validate({_id: 't1', f1: 'foo'})
  check({result})
  t.truthy(result.value)

  result = alt.validate({_id: 't2', f2: 'foo'})
  check({result})
  t.truthy(result.value)

  result = alt.validate({_id: 't3'})
  check({result})
  t.falsy(result.value)
})

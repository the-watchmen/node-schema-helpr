import test from 'ava'
import joi from 'joi'
import debug from '@watchmen/debug'
import _ from 'lodash'
import {pretty} from '@watchmen/helpr'
import {isRequired, isString, isNumber, getMin, getMax, getRegex, stringify} from '../../src'

const dbg = debug(__filename)

test('required', t => {
  const property = joi
    .any()
    .required()
    .describe()
  dbg('schema=%s', pretty(property))
  t.truthy(isRequired({property}))
})

test('string', t => {
  const property = joi.string().describe()
  dbg('schema=%s', pretty(property))
  t.truthy(isString({property}))
})

test('number', t => {
  const property = joi.number().describe()
  dbg('schema=%s', pretty(property))
  t.truthy(isNumber({property}))
})

test('min: number', t => {
  let property = joi
    .number()
    .min(1)
    .describe()
  dbg('schema=%s', pretty(property))
  let limit = getMin({property})
  t.truthy(_.isNumber(limit))
  t.is(limit, 1)

  property = joi.number().describe()
  dbg('schema=%s', pretty(property))
  limit = getMin({property})
  t.falsy(_.isNumber(limit))
})

test('max: number', t => {
  let property = joi
    .number()
    .max(1)
    .describe()
  dbg('schema=%s', pretty(property))
  let limit = getMax({property})
  t.truthy(_.isNumber(limit))
  t.is(limit, 1)

  property = joi.number().describe()
  dbg('schema=%s', pretty(property))
  limit = getMax({property})
  t.falsy(_.isNumber(limit))
})

test('min: string', t => {
  let property = joi
    .string()
    .min(1)
    .describe()
  dbg('schema=%s', pretty(property))
  let limit = getMin({property})
  t.truthy(_.isNumber(limit))
  t.is(limit, 1)

  property = joi.number().describe()
  dbg('schema=%s', pretty(property))
  limit = getMin({property})
  t.falsy(_.isNumber(limit))
})

test('max: string', t => {
  let property = joi
    .string()
    .max(1)
    .describe()
  dbg('schema=%s', pretty(property))
  let limit = getMax({property})
  t.truthy(_.isNumber(limit))
  t.is(limit, 1)

  property = joi.number().describe()
  dbg('schema=%s', pretty(property))
  limit = getMax({property})
  t.falsy(_.isNumber(limit))
})

test('regex', t => {
  const regex = /^\d{3}-\d{3}-\d{4}$/
  dbg('regex=%s', regex)
  let property = joi.string().regex(regex)
  let result = joi.validate('111-222-3333', property)
  dbg('result=%o', result)
  t.falsy(result.error)
  result = joi.validate('111-222-333', property)
  dbg('result=%o', result)
  t.truthy(result.error)
  let schema = property.describe()
  schema = JSON.parse(stringify({schema}))
  dbg('schema=%s', pretty(schema))
  const _regex = getRegex({property: schema})
  t.is(_regex, '^\\d{3}-\\d{3}-\\d{4}$')
})

import test from 'ava'
import joi from 'joi'
import debug from '@watchmen/debug'
import {isLike} from '@watchmen/helpr'
import {stringify} from '../../src'
import requestValidator from './fixtures/request'
import {check} from './_helper'

const dbg = debug(__filename)

test('request: success', t => {
  const result = joi.validate({type: {_id: 't1'}, f1: 'foo'}, requestValidator)
  check({result})
  t.truthy(result.value)
})

test('request: success: with _id', t => {
  const result = joi.validate({_id: 'r1', type: {_id: 't1'}, f1: 'foo'}, requestValidator)
  check({result})
  t.truthy(result.value)
})

test('request: fail: extra field', t => {
  const result = joi.validate(
    {_id: 'r1', type: {_id: 't1'}, f1: 'foo', nope: 'doh'},
    requestValidator
  )
  check({result})
  t.falsy(result.value)
})

test('request: fail: unknown type', t => {
  const result = joi.validate({_id: 'r1', type: {_id: 't4'}}, requestValidator)
  check({result})
  t.falsy(result.value)
})

test('request: fail: missing field', t => {
  const result = joi.validate({_id: 'r1', type: {_id: 't1'}}, requestValidator)
  check({result})
  t.falsy(result.value)
})

test('regex', t => {
  const schema = joi
    .string()
    .required()
    .regex(/\d{3}-\d{3}-\d{4}/)
    .describe()
  const _schema = stringify({schema})
  const actual = JSON.parse(_schema)
  dbg('regex=%o', actual.rules[0].arg.pattern)
  t.true(
    isLike({
      expected: {rules: [{name: 'regex', arg: {pattern: '\\d{3}-\\d{3}-\\d{4}'}}]},
      actual
    })
  )
})

import test from 'ava'
import joi from 'joi'
import requestValidator from './fixtures/request'
import {check} from './_helper'

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

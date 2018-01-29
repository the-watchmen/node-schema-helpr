import test from 'ava'
import debug from '@watchmen/debug'
import {pretty, deepClean, isLike, stringify} from '@watchmen/helpr'
import {
  getAlternativeModeFields,
  getFields,
  getAlternativeDiscriminators,
  getAlternativeSchemas
} from '../../src'
import adapter from './fixtures/adapter'
import requests from './fixtures/request'

const dbg = debug(__filename)

const _requests = requests.describe()
dbg('requests=%s', pretty(_requests))

test('getAlternativeModeFields', t => {
  const modeFields = getAlternativeModeFields({alternatives: _requests, adapter})
  dbg('mode-fields=%s', pretty(deepClean(modeFields)))
  t.truthy(modeFields)

  t.true(
    isLike({
      actual: modeFields,
      expected: {
        t1: {},
        t2: {},
        t3: {}
      }
    })
  )

  t.is(modeFields.t1.create.length, 1)
  t.is(modeFields.t1.edit.length, 3)
  t.is(modeFields.t2.create.length, 1)
  t.is(modeFields.t2.edit.length, 3)
  t.is(modeFields.t3.create.length, 1)
  t.is(modeFields.t3.edit.length, 3)
})

test('getAlternativeDiscriminators', t => {
  const discriminators = getAlternativeDiscriminators({alternatives: _requests})
  dbg('discriminators=%o', stringify(discriminators))
  t.truthy(discriminators)
  t.deepEqual(discriminators, {t1: 'type one', t2: 'type two', t3: 'type three'})
})

test('getAlternativeSchemas', t => {
  const schemas = getAlternativeSchemas({alternatives: _requests})
  dbg('schemas=%s', pretty(deepClean(schemas)))
  t.truthy(schemas)
  t.true(
    isLike({
      actual: schemas,
      expected: {
        t1: {type: 'object'},
        t2: {type: 'object'},
        t3: {type: 'object'}
      }
    })
  )
  t.is(schemas.t1.children.type.children._id.valids[0], 't1')
  t.is(schemas.t2.children.type.children._id.valids[0], 't2')
  t.is(schemas.t3.children.type.children._id.valids[0], 't3')
})

test('getFields: create', t => {
  const schema = _requests.alternatives[0]
  dbg('get-fields: schema=%s', pretty(schema))
  const className = 'class-1'
  const fields = getFields({schema, adapter, isCreate: true, className})
  dbg('create-fields=%s', pretty(deepClean(fields)))
  t.truthy(fields)
  t.is(fields.length, 1)
  t.is(fields[0].props.name, 'f1')
})

test('getFields: edit', t => {
  const schema = _requests.alternatives[0]
  dbg('get-fields: schema=%s', pretty(schema))
  const className = 'class-1'
  const fields = getFields({schema, adapter, className})
  dbg('edit-fields=%s', pretty(deepClean(fields)))
  t.truthy(fields)
  t.true(
    isLike({
      actual: fields,
      expected: [{props: {name: '_id'}}, {props: {name: 'type._id'}}, {props: {name: 'f1'}}]
    })
  )
})

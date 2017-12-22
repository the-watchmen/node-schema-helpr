import test from 'ava'
import debug from 'debug'
import {pretty, deepClean, isLike, stringify} from '@watchmen/helpr'
import {
  getAlternativeModeFields,
  getFields,
  getAlternativeDiscriminators,
  getAlternativeSchemas
} from '../../src'
import adapter from './fixtures/adapter'
import requests from './fixtures/request'

const dbg = debug('test:dynaform-test')

const _requests = requests.describe()
dbg('requests=%s', pretty(_requests))

test('getAlternativeModeFields', t => {
  const modeFields = getAlternativeModeFields({alternatives: _requests, adapter})
  dbg('mode-fields=%s', pretty(deepClean(modeFields)))
  t.truthy(modeFields)

  t.true(
    isLike({
      actual: modeFields,
      expected: {t1: {label: 'type one'}, t2: {label: 'type two'}, t3: {label: 'type three'}}
    })
  )

  const discriminators = getAlternativeDiscriminators({alternatives: modeFields})
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
      expected: {t1: {label: 'type one'}, t2: {label: 'type two'}, t3: {label: 'type three'}}
    })
  )

  const discriminators = getAlternativeDiscriminators({alternatives: schemas})
  dbg('discriminators=%o', stringify(discriminators))
  t.truthy(discriminators)
  t.deepEqual(discriminators, {t1: 'type one', t2: 'type two', t3: 'type three'})
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
  // t.is(fields.length, 3)
  // t.is(fields[0].props.name, '_id')
  // t.is(fields[1].props.name, 'type._id')
  // t.is(fields[1].props.name, 'type._id')
})

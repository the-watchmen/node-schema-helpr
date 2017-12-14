import test from 'ava'
import debug from 'debug'
import {pretty, deepClean} from '@watchmen/helpr'
import {getAlternativeDiscriminators, getFields} from '../../src/joi-dynaform'
import adapter from '../../src/mui-redux-adapter'
import requests from './fixtures/request'

const dbg = debug('test:dynaform-joi-test')

const _requests = requests.describe()
dbg('requests=%s', pretty(_requests))

test('getDiscriminators', t => {
  const options = getAlternativeDiscriminators({alternatives: _requests})
  dbg('options=%o', options)
  t.deepEqual(options, {t1: 'type one', t2: 'type two', t3: 'type three'})
})

test('getFields: create', t => {
  const schema = _requests.alternatives[0]
  dbg('get-fields: schema=%s', pretty(schema))
  const className = 'class-1'
  const fields = getFields({schema, adapter, isCreate: true, className})
  dbg('fields=%s', pretty(deepClean(fields)))
  t.truthy(fields)
  t.is(fields.length, 1)
  t.is(fields[0].props.name, 'f1')
})

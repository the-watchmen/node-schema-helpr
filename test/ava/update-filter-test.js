import test from 'ava'
import debug from 'debug'
import {pretty} from '@watchmen/helpr'
import {getUpdatePaths, getUpdateData, getAlternativeUpdatePaths} from '../../src'
import requests from './fixtures/request'

const dbg = debug('test:schema-helpr:update-filter')

const _requests = requests.describe()
dbg('requests=%s', pretty(_requests))
const request = _requests.alternatives[0]

test('getUpdatePaths', t => {
  const paths = getUpdatePaths({schema: request})
  dbg('paths=%o', paths)
  t.truthy(paths)
})

test('updateFilter', t => {
  t.deepEqual(
    getUpdateData({
      data: {
        foo: 'bar',
        _id: '123',
        type: {
          _id: 't1',
          name: 'type one'
        },
        f1: 'v1'
      },
      schema: request
    }),
    {f1: 'v1'}
  )
})

test('getAlternativeUpdatePaths', t => {
  const paths = getAlternativeUpdatePaths({alternatives: _requests})
  dbg('paths=%o', paths)
  t.truthy(paths)
  t.deepEqual(paths.t1, ['f1'])
  t.deepEqual(paths.t2, ['f2'])
  t.deepEqual(paths.t3, ['f3'])
})

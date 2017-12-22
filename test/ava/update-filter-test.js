import test from 'ava'
import debug from 'debug'
import {pretty} from '@watchmen/helpr'
import {getUpdatePaths, getUpdateData} from '../../src'
import requests from './fixtures/request-1'

const dbg = debug('test:schema-helpr:update-filter')

const _requests = requests.describe()
dbg('requests=%s', pretty(_requests))

test('getUpdatePaths', t => {
  const paths = getUpdatePaths({schema: _requests})
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
      schema: _requests
    }),
    {f1: 'v1'}
  )
})

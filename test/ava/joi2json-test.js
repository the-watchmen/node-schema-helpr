import test from 'ava'
import {pretty} from '@watchmen/helpr'
import joi2json from 'joi-to-json-schema'
import debug from 'debug'
import r1 from './fixtures/request-1'

const dbg = debug(__filename)

test('convert', t => {
  const schema = joi2json(r1)
  t.truthy(schema)
  dbg('schema=\n%s', pretty(schema))
})

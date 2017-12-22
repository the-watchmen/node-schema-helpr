import test from 'ava'
import {pushParent, getSchemaProperty} from '../../src'

test('pushParent', t => {
  t.is(pushParent({key: 'k'}), 'k')
  t.is(pushParent({parent: 'p', key: 'k'}), 'p.k')
})

test('getSchemaProperty', t => {
  t.is(getSchemaProperty({property: 'a.b.c'}), 'children.a.children.b.children.c')
})

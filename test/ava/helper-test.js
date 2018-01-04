import test from 'ava'
import {propertyPath, getSchemaProperty} from '../../src'

test('propertyPath', t => {
  t.is(propertyPath({key: 'k'}), 'k')
  t.is(propertyPath({parent: 'p', key: 'k'}), 'p.k')
})

test('getSchemaProperty', t => {
  t.is(getSchemaProperty({property: 'a.b.c'}), 'children.a.children.b.children.c')
})

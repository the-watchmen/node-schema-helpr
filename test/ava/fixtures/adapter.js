import debug from 'debug'
import {propertyPath} from '../../../src'

const dbg = debug('test:schema-helpr:adapter')

// property is joi.describe() format as used by '@watchmen/schema-helpr'
/* eslint-disable no-unused-vars */

export default {
  getField({key, property, parent, className, readOnly}) {
    dbg('get-field: args=%o', arguments[0])

    return {props: {name: propertyPath({parent, key})}}
  },
  getDiscriminator({key, property, parent, meta, className}) {
    dbg('get-discriminator: args=%o', arguments[0])

    return {props: {name: propertyPath({parent, key})}}
  }
}

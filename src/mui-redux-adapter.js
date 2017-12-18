// eslint-disable-next-line no-unused-vars
import React from 'react'
// eslint-disable-next-line no-unused-vars
import {Field} from 'redux-form'
import {TextField} from 'redux-form-material-ui'
import {stringify, assert} from '@watchmen/helpr'
import debug from 'debug'
import {pushParent} from './helper'

const dbg = debug('lib:schema-helpr:mui-redux-adapter')

const componentMap = {
  string: TextField
}

export default {
  getField({key, property, parent, className, readOnly}) {
    dbg('get-field: args=%o', arguments[0])

    assert(property.type, () => `type required for property=${stringify(property)}`)

    const component = componentMap[property.type]
    assert(component, () => `unable to obtain component for property=${stringify(property)}`)

    return (
      <Field
        className={className}
        name={pushParent({parent, key})}
        label={property.label || key}
        component={component}
        disabled={readOnly}
      />
    )
  }
}

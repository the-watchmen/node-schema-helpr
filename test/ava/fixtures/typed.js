import joi from 'joi'
import {discriminated} from './validators'

export default function({value, label}) {
  return joi.object({
    type: discriminated({name: '_id', value, label, altName: 'type'}).concat(
      joi.object({
        /* future type fields here */
      })
    )
  })
}

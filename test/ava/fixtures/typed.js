import joi from 'joi'
import identified from './identified'

export default function({value, label}) {
  return joi.object({
    type: identified({value, label}).concat(
      joi.object({
        /* future type fields here */
      })
    )
  })
}

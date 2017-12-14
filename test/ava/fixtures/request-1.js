import joi from 'joi'
import identified from './identified'
import typed from './typed'

export default identified()
  .concat(typed({value: 't1', label: 'type one'}))
  .concat(
    joi.object({
      f1: joi.string().required()
    })
  )

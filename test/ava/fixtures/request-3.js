import joi from 'joi'
import identified from './identified'
import typed from './typed'

export default identified()
  .concat(typed({value: 't3', label: 'type three'}))
  .concat(
    joi.object({
      f3: joi.string().required()
    })
  )

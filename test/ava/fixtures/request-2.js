import joi from 'joi'
import {identified} from './validators'
import typed from './typed'

export default identified.concat(typed({value: 't2', label: 'type two'})).concat(
  joi.object({
    f2: joi.string().required()
  })
)

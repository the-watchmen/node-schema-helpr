import assert from 'assert'
import joi from 'joi'

export default function({value, label} = {}) {
  let _id = joi.string()
  value && assert(label, 'label required with value')
  if (value) {
    _id = _id
      .valid(value)
      .label(label)
      .meta({isDiscriminator: true})
  } else {
    _id = _id.meta({generated: true}).label('id')
  }
  return joi.object({
    _id
  })
}

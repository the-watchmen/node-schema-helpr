import assert from 'assert'
import joi from 'joi'

export const identified = joi.object({
  _id: joi
    .string()
    .meta({isGenerated: true})
    .label('id')
})

export function discriminated({name, value, label, altName} = {}) {
  assert(name && value && label, 'name, value and label required')
  return joi.object({
    [name]: joi
      .string()
      .valid(value)
      .label(label)
      .meta({isDiscriminator: true, label: altName || name})
  })
}

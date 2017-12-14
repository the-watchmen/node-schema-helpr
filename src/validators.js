import joi from 'joi'

export const humanName = joi.object({
  first: joi
    .string()
    .min(1)
    .max(32),
  last: joi
    .string()
    .min(1)
    .max(32)
})

export const _id = joi.string()
export const email = joi.string().email()

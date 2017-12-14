import joi from 'joi'
import request1 from './request-1'
import request2 from './request-2'
import request3 from './request-3'

export default joi
  .alternatives()
  .meta({discriminator: 'type._id'})
  .try(request1, request2, request3)

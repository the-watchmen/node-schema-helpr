import debug from 'debug'

const dbg = debug('test:ava:helper')

export function check({result}) {
  result.error && dbg('error=%o', result.error)
}

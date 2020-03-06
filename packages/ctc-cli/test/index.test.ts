import {expect, test} from '@oclif/test'

import {run} from '../src'

describe('index', () => {
  test.it(() => {
    expect(run.name).to.equal('run')
  })
})

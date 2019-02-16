import {expect, test} from '@oclif/test'

import {run} from '../src/index'

describe('index', () => {
  test.it(() => {
    expect(run.name).to.equal('run')
  })
})

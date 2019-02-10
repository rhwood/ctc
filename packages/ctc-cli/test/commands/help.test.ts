import {expect, test} from '@oclif/test'

describe('help', () => {
  test
    .stdout()
    .command(['help'])
    .it('runs help', ctx => {
      expect(ctx.stdout).to.contain('Centralized Traffic Control for Model Railroads')
      expect(ctx.stdout).to.contain('$ ctc [COMMAND]')
    })
})

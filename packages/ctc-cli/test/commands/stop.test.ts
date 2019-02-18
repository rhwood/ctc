import {expect, test} from '@oclif/test'

describe('command stop', () => {
  test
    .stdout()
    .command(['help', 'stop'])
    .it('runs help', ctx => {
      expect(ctx.stdout).to.contain('$ ctc stop [PATH]')
      expect(ctx.stdout).to.contain('--pid=pid')
      expect(ctx.stdout).to.contain('--port=port')
      expect(ctx.stdout).to.contain('--server=server')
    })
})

describe('invalid stops', () => {
  test
    .stderr()
    .command(['stop'])
    .it('working dir is not a project', ctx => {
      expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
    })
  test
    .stderr()
    .command(['stop', '--pid=0'])
    .it('pid = 0', ctx => {
      // falls through to project since PID is falsy
      expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
    })
  test
    .stdout()
    .stderr()
    .command(['stop', `--pid=${process.pid}`])
    .it('pid = [test process pid]', ctx => {
      expect(ctx.stderr + ctx.stdout).to.contain(`No CTC process with id ${process.pid} appears to be running`)
    })
})

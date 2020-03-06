import {expect, test} from '@oclif/test'

describe('command stop', () => {
  test
  .stdout()
  .command(['help', 'stop'])
  .it('help stop', ctx => {
    expect(ctx.stdout).to.contain('$ ctc stop [PATH]')
    expect(ctx.stdout).to.contain('-P, --pid=pid')
    expect(ctx.stdout).to.contain('-p, --port=port')
    expect(ctx.stdout).to.contain('-s, --server=server')
  })
  test
  .stderr()
  .command(['stop'])
  .it('stop (PWD not project)', ctx => {
    expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
  })
  test
  .stderr()
  .command(['stop', '--pid=0'])
  .it('stop --pid=0', ctx => {
    // falls through to project since PID is falsy
    expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
  })
  test
  .stdout()
  .stderr()
  .command(['stop', `--pid=${process.pid}`])
  .it('stop --pid=[test process pid]', ctx => {
    expect(ctx.stderr + ctx.stdout).to.contain(`No CTC process with id ${process.pid} appears to be running`)
  })
})

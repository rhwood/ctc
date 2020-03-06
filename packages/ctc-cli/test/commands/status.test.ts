import {expect, test} from '@oclif/test'

describe('command status', () => {
  test
  .stdout()
  .command(['help', 'status'])
  .it('help status', ctx => {
    expect(ctx.stdout).to.contain('$ ctc status [PATH]')
    expect(ctx.stdout).to.contain('-P, --pid=pid')
    expect(ctx.stdout).to.contain('-p, --port=port')
    expect(ctx.stdout).to.contain('-s, --server=server')
  })
  test
  .stderr()
  .command(['status'])
  .it('status (PWD not project)', ctx => {
    expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
  })
  test
  .stderr()
  .command(['status', '--pid=0'])
  .it('status --pid=0', ctx => {
    // falls through to project since PID is falsy
    expect(ctx.stderr.replace(/›/g, '').replace(/\s+/g, ' ')).to.contain(' is not a project')
  })
  test
  .stdout()
  .stderr()
  .command(['status', `--pid=${process.pid}`])
  .it('status --pid=[test process pid]', ctx => {
    expect(ctx.stderr + ctx.stdout).to.contain(`No CTC process with id ${process.pid} appears to be running`)
  })
})

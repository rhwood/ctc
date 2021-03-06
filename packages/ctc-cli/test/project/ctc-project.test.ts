import {expect, test} from '@oclif/test'
import * as fs from 'fs-extra'
import * as path from 'path'

import {CtcProject} from '../../src/project/ctc-project'

describe('CtcProject.isProject', () => {
  const project = test
  .add('dir', path.resolve('.', 'tmp', 'project'))
  .do(ctx => {
    fs.removeSync(ctx.dir)
    fs.ensureDirSync(ctx.dir)
  })
  project.it('empty dir', ctx => {
    expect(CtcProject.isProject(ctx.dir)).to.be.false
  })
  project.it('project', ctx => {
    fs.ensureFileSync(path.resolve(ctx.dir, 'project.json'))
    expect(CtcProject.isProject(ctx.dir)).to.be.true
  })
})

describe('CtcProject.isLocked', () => {
  const project = test
  .add('dir', path.resolve('.', 'tmp', 'project'))
  .add('lock', ctx => path.resolve(ctx.dir, 'lock'))
  .do(ctx => {
    fs.removeSync(ctx.dir)
    fs.ensureDirSync(ctx.dir)
  })
  project.it('unlocked', ctx => {
    expect(CtcProject.isLocked(ctx.dir)).to.be.false
  })
  project.it('locked with valid PID', ctx => {
    fs.writeFileSync(ctx.lock, process.pid.toString())
    expect(CtcProject.isLocked(ctx.dir)).to.be.true
  })
  project.it('locked with invalid PID', ctx => {
    fs.writeFileSync(ctx.lock, '1')
    expect(CtcProject.isLocked(ctx.dir)).to.be.false
  })
})

describe('CtcProject.lock and .unlock', () => {
  const project = test
  .add('dir', path.resolve('.', 'tmp', 'project'))
  .add('lock', ctx => path.resolve(ctx.dir, 'lock'))
  .add('project', ctx => new CtcProject(ctx.dir, CtcProject.createConfig('test', 0, '')))
  .stderr()
  .do(ctx => {
    fs.removeSync(ctx.dir)
    fs.ensureDirSync(ctx.dir)
  })
  project.it('lock (lockable)', ctx => {
    if (CtcProject.isLocked(ctx.dir)) {
      ctx.project.unlock()
    }
    ctx.project.lock()
    expect(CtcProject.isLocked(ctx.dir)).to.be.true
  })
  project.it('unlock (lockable)', ctx => {
    if (!CtcProject.isLocked(ctx.dir)) {
      ctx.project.lock()
    }
    ctx.project.unlock()
    expect(CtcProject.isLocked(ctx.dir)).to.be.false
  })
  project.it('lock (not lockable)', ctx => {
    fs.removeSync(ctx.lock)
    fs.chmodSync(ctx.dir, '500')
    ctx.project.lock()
    fs.chmodSync(ctx.dir, '700')
    expect(ctx.stderr).to.contain('Unable to lock project')
  })
  project.it('unlock (not lockable)', ctx => {
    fs.chmodSync(ctx.dir, '700')
    ctx.project.lock()
    fs.chmodSync(ctx.dir, '500')
    ctx.project.unlock()
    fs.chmodSync(ctx.dir, '700')
    expect(ctx.stderr).to.contain('Unable to unlock project')
  })
})

describe('CtcProject constructor from file', () => {
  const pt = test
  .add('dir', path.resolve('.', 'tmp', 'project'))
  .add('json', ctx => path.resolve(ctx.dir, 'project.json'))
  .stdout()
  .stderr()
  pt
  .do(ctx => {
    fs.removeSync(ctx.dir)
    fs.mkdirsSync(ctx.dir)
    const project = new CtcProject(ctx.dir, CtcProject.createConfig('test', 0, ''))
    project.saveSync()
  })
  .it('valid project.json', ctx => {
    const project = new CtcProject(ctx.dir)
    expect(project.config.name).to.equal('test')
    expect(project.config.control.hostname).to.equal('localhost')
    expect(project.config.control.port).to.equal(0)
    expect(project.config.control.socket).to.equal('')
  })
  pt
  .do(ctx => {
    fs.writeFileSync(ctx.json, '')
    const project = new CtcProject(ctx.dir)
    expect(project.path).exist
  })
  .catch(error => expect(error.message).to.contain(' has an invalid project.json file.'))
  .it('invalid project.json')
  pt
  .do(ctx => {
    fs.unlinkSync(ctx.json)
    const project = new CtcProject(ctx.dir)
    expect(project.path).exist
  })
  .catch(error => expect(error.message).to.contain(' is not a project.'))
  .it('missing project.json')
})

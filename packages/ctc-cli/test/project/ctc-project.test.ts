import {expect, test} from '@oclif/test'
import * as fs from 'fs-extra'
import * as path from 'path'

import {CtcProject} from '../../src/project/ctc-project'

describe('CtcProject.isProject', () => {
  let project = test
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
  let project = test
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
    fs.writeFileSync(ctx.lock, process.pid)
    expect(CtcProject.isLocked(ctx.dir)).to.be.true
  })
  project.it('locked with invalid PID', ctx => {
    fs.writeFileSync(ctx.lock, 1)
    expect(CtcProject.isLocked(ctx.dir)).to.be.false
  })
})

describe('CtcProject.lock and .unlock', () => {
  let project = test
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

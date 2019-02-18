import {Config} from '@oclif/config'
import {expect, test} from '@oclif/test'
import * as fs from 'fs-extra'
import * as path from 'path'
//import * as waitUntil from 'wait-until'
const waitUntil = require('wait-until')

import {CtcProject} from '../../src/project/ctc-project'
import {CtcServer, CtcServerStatus} from '../../src/server/ctc-server'

describe('CtcServer.cachePID', () => {
  let projectConfig = CtcProject.createConfig('Test Project', 0, '')
  let cacheDir = path.resolve('.', 'tmp', 'cache')
  let pidCache = test
    .env({XDG_CACHE_HOME: cacheDir})
    .stderr()
    .stdout()
    .add('cacheFile', path.resolve(cacheDir, `pid-${process.pid}.json`))
    .add('serverConfig', new Config({root: ''}))
    .add('project', new CtcProject(`${cacheDir}`, projectConfig))
    .do(ctx => {
      ctx.serverConfig.cacheDir = `${cacheDir}`
    })
  pidCache
    .do(() => { fs.removeSync(`${cacheDir}`) })
    .it('empty cache', ctx => {
      expect(fs.pathExistsSync(ctx.cacheFile)).to.false
    })
  pidCache.it('cache no args', ctx => {
    let server = new CtcServer(ctx.project, ctx.serverConfig)
    server.cachePID()
    expect(fs.pathExistsSync(ctx.cacheFile)).to.true
  })
  pidCache.it('remove cache with arg', ctx => {
    let server = new CtcServer(ctx.project, ctx.serverConfig)
    server.cachePID(true)
    expect(fs.pathExistsSync(ctx.cacheFile)).to.false
  })
  pidCache.it('cache with arg', ctx => {
    let server = new CtcServer(ctx.project, ctx.serverConfig)
    server.cachePID(false)
    expect(fs.pathExistsSync(ctx.cacheFile)).to.true
  })
  pidCache
    .do(() => { fs.removeSync(`${cacheDir}`) })
    .it('cleanup', ctx => {
      expect(fs.pathExistsSync(ctx.cacheFile)).to.false
    })
})

describe('CtcServer.start and .stop (IPC)', () => {
  let projectConfig = CtcProject.createConfig('Test Project', 4243, '')
  let cacheDir = path.resolve('.', 'tmp', 'cache')
  let server: CtcServer
  let ctc = test
    .env({XDG_CACHE_HOME: cacheDir})
    .stderr()
    .stdout()
    .add('serverConfig', new Config({root: ''}))
    .add('project', new CtcProject(`${cacheDir}`, projectConfig))
    .do(ctx => {
      fs.ensureDirSync(cacheDir)
      ctx.serverConfig.cacheDir = `${cacheDir}`
      server = new CtcServer(ctx.project, ctx.serverConfig)
    })
  ctc.it('starts', ctx => {
    expect(CtcProject.isLocked(ctx.project.path)).is.false
    server.start()
    expect(CtcProject.isLocked(ctx.project.path)).is.true
    waitUntil()
      .interval(100)
      .times(20)
      .condition(() => server.ipcStatus === CtcServerStatus.Started)
      .done((result: any) => {
        expect(result).to.be.true
      })
  })
  ctc.it('stops', ctx => {
    expect(CtcProject.isLocked(ctx.project.path)).is.true
    server.stop()
    expect(CtcProject.isLocked(ctx.project.path)).is.false
    waitUntil()
      .interval(100)
      .times(20)
      .condition(() => server.ipcStatus === CtcServerStatus.Stopped)
      .done((result: any) => {
        expect(result).to.be.true
      })
  })
})

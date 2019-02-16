import {Config} from '@oclif/config'
import {expect, test} from '@oclif/test'
import * as fs from 'fs-extra'
import * as path from 'path'

import {CtcProject} from '../../src/project/ctc-project'
import {CtcProjectConfig} from '../../src/project/ctc-project-config'
import {CtcServer} from '../../src/server/ctc-server'

describe('cachePID', () => {
  let projectConfig: CtcProjectConfig = {
    name: 'Test Project',
    control: {hostname: 'localhost', port: 0, socket: ''},
    http: {hostname: 'localhost', port: 0, secure: false},
    ctc: {version: '0.0.0'}
  }
  let cacheDir = path.resolve('./tmp')
  let pidCache = test
    .env({XDG_CACHE_HOME: cacheDir})
    .stderr()
    .stdout()
    .add('cacheFile', `${cacheDir}/pid-${process.pid}.json`)
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

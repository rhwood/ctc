import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import * as http from 'http'
import * as net from 'net'
import * as log from 'npmlog'
import * as Path from 'path'

import {CtcProject} from '../project/ctc-project'
import {CtcControlConfig} from '../project/ctc-project-config'

interface PID {
  pid: number,
  project: string,
  control: CtcControlConfig
}

export enum CtcServerStatus {Starting, Started, Stopping, Stopped}

export class CtcServer {
  readonly project: CtcProject
  readonly config: IConfig
  // tslint:disable-next-line:no-unused // remove when request is used
  readonly httpServer = http.createServer((request, response) => {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/plain')
    response.end('Hello World\n')
  })
  readonly ipcServer = net.createServer(connection => {
    cli.debug('Received new connection...')
    connection.on('data', data => {
      cli.debug(`Received ${data}`)
      if (data.toString() === 'stop') {
        connection.end()
        this.stop()
      }
    })
  })
  httpStatus: CtcServerStatus = CtcServerStatus.Stopped
  ipcStatus: CtcServerStatus = CtcServerStatus.Stopped

  constructor(project: CtcProject, config: IConfig) {
    this.project = project
    this.config = config
  }

  start() {
    this.project.lock()
    this.ipcStatus = CtcServerStatus.Starting
    if (this.project.config.http.port) {
      this.httpServer.listen(this.project.config.http.port, this.project.config.http.hostname, () => {
        let protocol = this.project.config.http.secure ? 'https' : 'http'
        let url = `${protocol}://${this.project.config.http.hostname}:${this.project.config.http.port}/`
        cli.info('HTTP server running at:')
        cli.url(url, url)
      })
    }
    this.ipcServer.on('error', this.ipcOnError)
    this.ipcServer.on('listening', this.ipcOnListening)
    if (this.project.config.control.port) {
      this.ipcServer.listen(this.project.config.control.port, this.project.config.control.hostname)
    } else if (this.project.config.control.socket) {
      this.ipcServer.listen(this.project.config.control.socket)
    }
    process.on('SIGTERM', () => { this.stop() })
    process.on('SIGINT', () => { this.stop() })
    process.on('SIGHUP', () => { this.stop() })
    process.on('SIGBREAK', () => { this.stop() })
  }

  stop() {
    cli.debug('Stopping server...')
    this.httpServer.close()
    this.ipcServer.close()
    this.project.unlock()
  }

  cachePID(remove?: boolean | undefined) {
    let cache = Path.join(this.config.cacheDir, `pid-${process.pid}.json`)
    let pid: PID = {
      pid: process.pid,
      project: this.project.path,
      control: this.project.config.control
    }
    try {
      if (remove) {
        fs.removeSync(cache)
      } else {
        fs.ensureFileSync(cache)
        fs.writeJsonSync(cache, pid)
      }
    } catch (err) {
      log.error('ERROR writing PID', '%s', err)
    }
  }

  ipcOnError(err: Error) {
    log.error('ERROR (IPC)', err.message)
    this.stop()
  }

  ipcOnListening() {
    this.ipcStatus = CtcServerStatus.Started
  }
}

import http = require('http')
import {CtcProject} from '../project/ctc-project';
import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import * as Path from 'path'
import * as fs from 'fs-extra'
let ipc = new (require('node-ipc')).IPC()

export class CtcServer {

  readonly project: CtcProject
  readonly config: IConfig
  readonly httpServer = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello World\n');
  })
  readonly ipcServer: any

  constructor(project: CtcProject, config: IConfig) {
    this.project = project
    this.config = config
    if (this.project.config.control.port) {
      ipc.serveNet(this.project.config.control.hostname, this.project.config.control.port, this.ipcServerCallback)
    } else {
      ipc.serve(this.project.config.control.socket, this.ipcServerCallback)
    }
    this.ipcServer = ipc.server
  }

  start() {
    this.project.lock()
    if (this.project.config.http.port) {
      this.httpServer.listen(this.project.config.http.port, this.project.config.http.hostname, () => {
        let url = `http://${this.project.config.http.hostname}:${this.project.config.http.port}/`
        cli.info('HTTP server running at:')
        cli.url(url, url)
      })
    }
    this.ipcServer.start()
    process.on('SIGTERM', () => { this.stop() })
    process.on('SIGINT', () => { this.stop() })
    process.on('SIGHUP', () => { this.stop() })
    process.on('SIGBREAK', () => { this.stop() })
  }

  stop() {
    cli.debug('Stopping server...')
    this.httpServer.close()
    this.ipcServer.stop()
    this.project.unlock()
  }

  ipcServerCallback() {
    ipc.server.on(
      'stop', function(data: any, socket: any) {
        stop()
      }
    )
  }
 
  cacheMetaData(remove: boolean | undefined) {
    let cache = Path.join(this.config.cacheDir, 'server.json')
    let contents: Array<any> = []
    if (fs.existsSync(cache)) {
      contents = fs.readJsonSync(cache)
      if (remove) {
        contents = contents.filter((value) => {value.pid != process.pid})
        if (!contents.length) {
          fs.remove(cache)
        } else {
          fs.writeJsonSync(cache, contents)
        }
        return // short circut after removing existing entry
      }
    }
    if (!remove) {
      let pid = {
        pid: process.pid,
        project: this.project.path,
        control: {hostname: '', port: '', socket: ''}
      }
      contents[contents.length] = pid
      fs.writeJsonSync(cache, contents)
    }
  }
}

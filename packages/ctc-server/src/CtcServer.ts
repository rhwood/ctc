import http = require('http')
import {CtcProject} from './CtcProject';
import {cli} from 'cli-ux'
let ipc = new (require('node-ipc')).IPC()

export class CtcServer {

  readonly project: CtcProject
  readonly httpServer = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello World\n');
  })
  readonly ipcServer: any

  constructor(project: CtcProject) {
    this.project = project
    if (this.project.control.port) {
      ipc.serveNet(this.project.control.hostname, this.project.control.port, this.ipcServerCallback)
    } else {
      ipc.serve(this.project.control.socket, this.ipcServerCallback)
    }
    this.ipcServer = ipc.server
  }

  start() {
    if (this.project.http.port) {
      this.httpServer.listen(this.project.http.port, this.project.http.hostname, () => {
        let url = `http://${this.project.http.hostname}:${this.project.http.port}/`
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
  }

  ipcServerCallback() {
    ipc.server.on(
      'stop', function(data: any, socket: any) {
        stop()
      }
    )
  }
 
}

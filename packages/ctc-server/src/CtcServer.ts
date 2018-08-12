import http = require('http')
import {IPC} from 'node-ipc'

export class CtcServer {

  readonly hostname: string = '127.0.0.1'
  readonly port: number = 0
  readonly socket: string = ''
  readonly server = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello World\n');
  })
  readonly ipcServer: IPC.Server

  constructor(hostname: string, port: number, socket: string) {
    this.hostname = hostname
    this.port = port
    this.socket = socket
  }

  start() {
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Server running at http://${this.hostname}:${this.port}/`)
    })

  }
}

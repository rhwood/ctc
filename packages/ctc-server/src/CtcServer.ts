import http = require('http')
let ipc = new (require('node-ipc')).IPC()

export class CtcServer {

  readonly hostname: string = '127.0.0.1'
  readonly port: number = 0
  readonly socket: string = ''
  readonly server = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello World\n');
  })
  readonly ipcServer: any

  constructor(hostname: string, port: number, socket: string) {
    this.hostname = hostname
    this.port = port
    this.socket = socket
    if (this.port) {
      ipc.serveNet(this.hostname, this.port, this.ipcServerCallback)
    } else {
      ipc.serve(this.socket, this.ipcServerCallback)
    }
    this.ipcServer = ipc.server
  }

  start() {
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Server running at http://${this.hostname}:${this.port}/`)
    })
    this.ipcServer.start()
  }

  stop() {
    this.server.close()
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

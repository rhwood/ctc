import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import JsonSocket from 'json-socket'
import * as net from 'net'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'
import {PID} from '../server/ctc-server'

export default class Stop extends Command {
  static description = 'Stop a running CTC process'

  static examples = [
    `$ ctc stop
    Stop the CTC process running the project in the current directory
    (presuming the current directory is a CTC project)
    `,
    `$ ctc stop --pid=4242
    Stop the CTC process with process ID 4242
    `,
    `$ ctc stop --server=192.168.4.4 --port=4242
    Stop the CTC process on port 4242 at IP address 192.168.4.4
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    pid: flags.integer({
      char: 'P',
      description: 'stop CTC running at process id',
      exclusive: ['server', 'port']
    }),
    port: flags.integer({
      char: 'p',
      description: 'stop CTC running at port',
      exclusive: ['pid'],
    }),
    server: flags.string({
      char: 's',
      description: 'stop CTC running on server',
      dependsOn: ['port'],
      exclusive: ['pid'],
    }),
  }

  static args = [{name: 'path', descripton: 'project directory', default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Stop)
    if (flags.pid) {
      this.stopPID(flags.pid)
    } else if (flags.port) {
      this.stopServer((flags.server !== undefined) ? flags.server : 'localhost', flags.port)
    } else {
      this.stopProject(args.path)
    }
  }

  sendStop(socket: JsonSocket) {
    socket.sendEndMessage({command: 'stop'}, () => {})
  }

  stopSocket(socket: string) {
    let connection = new JsonSocket(new net.Socket())
    connection.connect(socket)
    connection.on('connect', () => { this.sendStop(connection) })
  }

  stopServer(server: string, port: number) {
    let connection = new JsonSocket(new net.Socket())
    connection.connect(port, server)
    connection.on('connect', () => { this.sendStop(connection) })
  }

  stopPID(pid: number) {
    let cache = path.resolve(this.config.cacheDir, `pid-${pid}.json`)
    fs.pathExists(cache)
      .then(() => {
        fs.readJson(cache)
          .then((json: PID) => {
            if (json.control.port) {
              this.stopServer(json.control.hostname, json.control.port)
            } else {
              this.stopSocket(json.control.socket)
            }
          }, () => {
            cli.error(`Unable to read connection data for process ID ${pid}`, {exit: false})
          })
      }, () => {
        cli.error(`No CTC process with ID ${pid} appears to be running.`, {exit: false})
      })
  }

  stopProject(project: string) {
    if (CtcProject.isProject(project)) {
      if (CtcProject.isLocked(project)) {
        this.stopPID(Number(fs.readFileSync(path.resolve(project, 'lock'))))
      } else {
        cli.error(`${project} is not in use by a CTC server`, {exit: false})
      }
    } else {
      cli.error(`${project} is not a project`, {exit: false})
    }
  }
}

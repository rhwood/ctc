import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import JsonSocket from 'json-socket'
import * as net from 'net'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'
import {PID} from '../server/ctc-server'

export default class Status extends Command {
  static description = 'Get the status of a CTC process'

  static examples = [
    `$ ctc status
    Get status of CTC process running the project in current directory
    (presuming the current directory is a CTC project)
    `,
    `$ ctc status --pid=4242
    Get status of CTC process with process ID 4242
    `,
    `$ ctc status --server=192.168.4.4 --port=4242
    Get status of CTC process on port 4242 at IP address 192.168.4.4
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    pid: flags.integer({
      char: 'P',
      description: 'CTC process id',
      exclusive: ['server', 'port']
    }),
    port: flags.integer({
      char: 'p',
      description: 'port of CTC process',
      exclusive: ['pid'],
    }),
    server: flags.string({
      char: 's',
      description: 'server CTC process is running on',
      dependsOn: ['port'],
      exclusive: ['pid'],
    }),
    filter: flags.string({
      char: 'F',
      description: 'filter status results',
      options: ['all', 'http'],
      default: 'all'
    }),
    format: flags.string({
      char: 'f',
      description: 'format of the status messages',
      options: ['json', 'url'],
      default: 'json'
    })
  }

  static args = [{name: 'path', descripton: 'project directory', default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Status)
    let filter = flags.filter !== undefined ? flags.filter : 'all'
    let format = flags.format !== undefined ? flags.format : 'json'
    if (flags.pid) {
      this.statusPID(filter, format, flags.pid)
    } else if (flags.port) {
      this.sendServer(filter, format, (flags.server !== undefined) ? flags.server : 'localhost', flags.port)
    } else {
      this.statusProject(filter, format, args.path)
    }
  }

  sendStatus(filter: string, format: string, socket: JsonSocket) {
    socket.sendMessage({command: 'status', data: {filter}}, () => {})
    socket.on('message', message => {
      try {
        switch (format) {
        case 'url':
          let url = this.httpStatus(filter, message)
          cli.url(url, url)
          break
        case 'json':
        default:
          cli.info(JSON.stringify(message, null, 2))
        }
      } catch {
        cli.error(`filter=${filter} and format=${format} are incompatible`)
      }
      socket.end()
    })
  }

  sendSocket(filter: string, format: string, socket: string) {
    let connection = new JsonSocket(new net.Socket())
    connection.connect(socket)
    connection.on('connect', () => { this.sendStatus(filter, format, connection) })
  }

  sendServer(filter: string, format: string, server: string, port: number) {
    let connection = new JsonSocket(new net.Socket())
    connection.connect(port, server)
    connection.on('connect', () => { this.sendStatus(filter, format, connection) })
  }

  statusPID(filter: string, format: string, pid: number) {
    let cache = path.resolve(this.config.cacheDir, `pid-${pid}.json`)
    if (fs.pathExistsSync(cache)) {
      fs.readJson(cache)
        .then((json: PID) => {
          if (json.control.port) {
            this.sendServer(filter, format, json.control.hostname, json.control.port)
          } else {
            this.sendSocket(filter, format, json.control.socket)
          }
        }, () => {
          cli.error(`Unable to read connection data for process ID ${pid}`, {exit: false})
        })
    } else {
      cli.error(`No CTC process with id ${pid} appears to be running`, {exit: false})
    }
  }

  statusProject(filter: string, format: string, project: string) {
    if (CtcProject.isProject(project)) {
      if (CtcProject.isLocked(project)) {
        this.statusPID(filter, format, Number(fs.readFileSync(path.resolve(project, 'lock'))))
      } else {
        cli.info(`${project} is not in use by a CTC process`)
      }
    } else {
      cli.error(`${project} is not a project`, {exit: false})
    }
  }

  httpStatus(filter: string, message: any): string {
    let http
    if (filter === 'all') {
      http = message.project.http
    } else if (filter === 'http') {
      http = message
    }
    if (http !== undefined) {
      let protocol = (http.secure) ? 'https' : 'http'
      return `${protocol}://${http.hostname}:${http.port}`
    }
    throw new Error(filter)
  }
}

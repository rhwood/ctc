import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as path from 'path'

import Server from './server'

export default class Start extends Server {
  static description = 'Start a CTC server'

  // override hiding server in help contents
  static hidden = false

  static examples = [
    `$ ctc start
    Start a ctc server as a background process and exit.
    `,
    `$ ctc start --no-dameon
    Start a ctc server that blocks the curren process until
    it exits.
    `,
  ]

  static flags = {
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'start as a server', default: true}),
    help: flags.help({char: 'h'}),
    port: flags.string({
      char: 'p',
      description: 'use networkable port for server control',
      exclusive: ['socket'],
    }),
    socket: flags.string({
      char: 's',
      description: 'use local socket for server control',
      exclusive: ['port'],
    }),
  }

  static args = [{name: 'project', descripton: 'project directory', required: true, default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Start)
    this.runCommon(args, flags)
  }

  runDaemon(args: any, flags: any) {
    let dargs: string[] = [process.argv[1], 'server']
    dargs.push((flags.daemon ? '--daemon' : '--no-daemon'))
    if (flags.port) {
      dargs.push('--port=' + flags.port)
    }
    if (flags.socket) {
      dargs.push('--socket=' + flags.socket)
    }
    dargs.push(path.resolve(args.project))
    this.debug(`Using ${process.argv[0]} (${dargs}) as the server`)

    const server = spawn(process.argv[0], dargs, {
      detached: true,
      stdio: 'ignore'
    })
    server.unref()
    this.debug(`Server PID is: ${server.pid}`)
  }
}

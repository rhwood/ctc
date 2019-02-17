import {flags} from '@oclif/command'
import {spawn} from 'child_process'
import {cli} from 'cli-ux'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'

import Server from './server'

export default class Start extends Server {
  static description = 'Start a CTC server'

  // override hiding server in help contents
  static hidden = false

  static examples = [
    `$ ctc start
    Start a ctc server that runs until this command exits. This is
    equivalent to the command:
    $ ctc server --no-daemon
    `,
    `$ ctc start --dameon
    Start a ctc server as a separate process and exit. This is
    equivalent to the command:
    $ ctc server --daemon &
    `,
  ]

  static flags = {
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'start as a server', default: false}),
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

  static args = [{name: 'project', descripton: 'use project', default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Start)
    let dir = path.resolve(args.project)
    if (CtcProject.isLocked(dir)) {
      cli.error('Project is in use by another application.')
    } else {
      if (flags.daemon) {
        this.runDaemon(args, flags)
      } else {
        this.runNoDaemon(args, flags)
      }
    }
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

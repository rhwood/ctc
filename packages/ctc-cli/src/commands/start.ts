import {Command, flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as path from 'path'
import { cli } from 'cli-ux'
import {Project} from 'ctc-server'

export default class Start extends Command {
  static description = 'Start a CTC server as a separate process'

  static examples = [
    `$ ctc start
    Start a ctc server as a separate process and exit.
    `,
    `$ ctc start --no-daemon
    Start a ctc server that runs until this command exits. This is
    equivalent to the command:
    $ ctc server
    `,
  ]

  static flags = {
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'start as a server', default: true}),
    force: flags.boolean({char: 'f', description: 'force CTC server to start'}),
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

    if (flags.force) {
      this.warn('Forcing unsafe start...')
    }

    let dir = path.resolve(args.project)
    let dargs: string[] = [process.argv[1], 'server']
    dargs.push((flags.daemon ? '--daemon' : '--no-daemon'))
    if (flags.port) {
      dargs.push('--port=' + flags.port)
    }
    if (flags.socket) {
      dargs.push('--socket=' + flags.socket)
    }
    if (args.project) {
      dargs.push(dir)
    } else {
      cli.error('Project directory not specified or is invalid.')
    }

    if (Project.isLocked(dir)) {
      cli.error('Project is in use by another application.')
    }

    if (this.config.debug) {
      this.log(`Using ` + process.argv[0] + ` (` + dargs + `) as the server`)
    }

    const server = spawn(process.argv[0], dargs, {
      detached: (flags.daemon),
      stdio: (flags.daemon) ? 'ignore' : 'inherit',
    })


    if (flags.daemon) {
      server.unref()
      if (this.config.debug) {
        this.log(`Server PID is: ${server.pid}`)
      }
      // TODO: ensure PID is written to file; log control and public http(s) ports
    }

  }
}

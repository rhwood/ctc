import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as Path from 'path'

import {CtcProject} from '../project/ctc-project'
import {CtcServer} from '../server/ctc-server'

import Init from './init'

export default class Server extends Command {
  static description = 'Run a CTC server'

  // do not list server in help contents
  static hidden = false

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    port: flags.string({
      char: 'p',
      description: 'use networkable port for server control',
      exclusive: ['socket'],
    }),
    socket: flags.string({
      char: 's',
      description: 'use local socket for server control',
      exclusive: ['port'],
    })
  }

  static args = [{name: 'project', default: Path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Server)

    this.debug('Preparing server...')

    if (flags.daemon) {
      this.runDaemon(args, flags)
    } else {
      this.runNoDaemon(args, flags)
    }
  }

  runDaemon(args: any, flags: any) {
    if (!CtcProject.isProject(args.project)) {
      this.log(`${args.project} is not a project.`)
      if (cli.confirm('Initialize a project?')) {
        Init.run([args.project])
      } else {
        this.exit()
      }
    }
    new CtcServer(this.getProject(args, flags), this.config).start()
  }

  runNoDaemon(args: any, flags: any) {
    if (CtcProject.isProject(args.project)) {
      new CtcServer(this.getProject(args, flags), this.config).start()
    } else {
      this.error(`${args.project} is not a project.`)
    }
  }

  getProject(args: any, flags: any): CtcProject {
    let project = new CtcProject(args.project)
    if (flags.port) {
      project.config.control.port = flags.port
    }
    if (flags.socket) {
      project.config.control.port = 0
      project.config.control.socket = flags.socket
    }
    return project
  }
}

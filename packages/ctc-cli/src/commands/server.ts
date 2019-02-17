import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'
import {CtcServer} from '../server/ctc-server'

import Init from './init'

export default class Server extends Command {
  static description = 'Run a CTC server'

  // do not list server in help contents
  static hidden = true

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

  static args = [{name: 'project', descripton: 'project directory', required: true, default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Server)
    this.runCommon(args, flags)
  }

  runCommon(args: any, flags: any) {
    if (CtcProject.isLocked(path.resolve(args.project))) {
      cli.error('Project is in use by another application.')
    } else {
      if (flags.daemon) {
        this.runDaemon(args, flags)
      } else {
        // TODO: figure out how to make this catch "real"
        this.runNoDaemon(args, flags).catch(error => { cli.error(error.message) })
      }
    }
  }

  runDaemon(args: any, flags: any) {
    if (CtcProject.isProject(args.project)) {
      new CtcServer(this.getProject(args, flags), this.config).start()
    } else {
      this.error(`${args.project} is not a project.`)
    }
  }

  async runNoDaemon(args: any, flags: any) {
    if (!CtcProject.isProject(args.project)) {
      this.log(`${args.project} is not a project.`)
      if (await cli.confirm('Initialize a project?')) {
        await Init.run([args.project])
      } else {
        return // abort here
      }
    }
    new CtcServer(this.getProject(args, flags), this.config).start()
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

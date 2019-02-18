import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'
import {CtcServer} from '../server/ctc-server'

import Init from './init'

export default class Server extends Command {
  static description = 'Run a CTC server process'

  // do not list server in help contents
  static hidden = true

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    port: flags.string({
      char: 'p',
      description: 'use networkable port for process control',
      exclusive: ['socket'],
    }),
    socket: flags.string({
      char: 's',
      description: 'use local socket for process control',
      exclusive: ['port'],
    })
  }

  static args = [{name: 'path', descripton: 'project directory', default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Server)
    this.runCommon(args, flags)
  }

  runCommon(args: any, flags: any) {
    if (CtcProject.isLocked(path.resolve(args.path))) {
      cli.error('Project is in use by another application.')
    } else {
      if (flags.daemon) {
        this.runDaemon(args, flags)
      } else {
        this.runNoDaemon(args, flags)
          .then(() => {}, error => { cli.error(error.message, {exit: false}) })
          .catch(error => { cli.error(error.message) })
      }
    }
  }

  runDaemon(args: any, flags: any) {
    if (CtcProject.isProject(args.path)) {
      new CtcServer(this.getProject(args, flags), this.config).start()
    } else {
      this.error(`${args.path} is not a project.`)
    }
  }

  async runNoDaemon(args: any, flags: any) {
    if (!CtcProject.isProject(args.path)) {
      cli.info(`${args.path} is not a project.`)
      if (await cli.confirm('Initialize a project?')) {
        Init.run([args.path]).then(() => {
          if (CtcProject.isProject(args.path)) {
            // TODO: figure out how to pass rejection from Init.run so if is not needed
            new CtcServer(this.getProject(args, flags), this.config).start()
          }
        }, rejection => { cli.error(rejection, {exit: false}) })
      }
    } else {
      new CtcServer(this.getProject(args, flags), this.config).start()
    }
  }

  getProject(args: any, flags: any): CtcProject {
    let project = new CtcProject(args.path)
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

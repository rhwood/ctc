import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import * as path from 'path'

import {CtcProject} from '../project/ctc-project'
import {CtcProjectConfig} from '../project/ctc-project-config'

export default class Init extends Command {
  static description = 'Create a CTC project'

  static examples = [
    `$ ctc init myProject
    Create a CTC project in the directory 'myProject'
    `,
  ]

  static flags = {
    name: flags.string({char: 'n', description: 'project name', default: ''}),
    overwrite: flags.boolean({char: 'u', description: 'overwrite existing project if one exists'}),
    port: flags.integer({
      char: 'p',
      description: 'use networkable port for process control',
      exclusive: ['socket'],
    }),
    socket: flags.string({
      char: 's',
      description: 'use local socket for process control',
      exclusive: ['port'],
    }),
  }

  static args = [{name: 'path', descripton: 'project directory', default: path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Init)
    this.createProject(args, flags)
  }

  createProject(args: any, flags: any) {
    if (flags.port && isNaN(Number(flags.port))) {
      cli.error(`Port "${flags.port}" is not a networkable port.`, {exit: false})
    }
    this.createProjectDir(args.path, flags.overwrite)
    .then(() => {
      this.createConfig(flags.name, (flags.port) ? Number(flags.port) : 4242, (flags.socket) ? flags.socket : '')
      .then(config => {
        const project = new CtcProject(args.path, config)
        project.save().catch((error: Error) => {
          cli.error(`Unable to write project: ${error.message}`, {exit: false})
        })
      })
      .catch()
    }, rejection => {
      cli.error(rejection, {exit: false})
    })
    .catch()
  }

  async createProjectDir(dir: string, overwrite: boolean) {
    if (fs.pathExistsSync(dir)) {
      if (!overwrite) {
        return Promise.reject(new Error('Project directory already exists.'))
      }
      fs.removeSync(dir)
    }
    fs.mkdirsSync(dir)
  }

  async createConfig(name: string, port: number, socket: string): Promise<CtcProjectConfig> {
    if (!name) {
      name = await cli.prompt('Project name')
    }
    return CtcProject.createConfig(name, port, socket)
  }
}

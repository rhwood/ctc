import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as fs from 'fs-extra'
import * as path from 'path'

import {CtcProjectConfig} from '../project/ctc-project-config'

export default class Init extends Command {
  static description = 'Create a CTC server project'

  static examples = [
    `$ ctc init myProject
    Create a CTC server project in the directory 'myProject'.
    `,
  ]

  static flags = {
    overwrite: flags.boolean({char: 'u', description: 'overwrite existing project if one exists'}),
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
    const {args, flags} = this.parse(Init)
    this.createProject(args, flags)
  }

  createProject(args: any, flags: any) {
    if (flags.port && isNaN(Number(flags.port))) {
      cli.error(`Port "${flags.port}" is not a networkable port.`, {exit: false})
    }
    this.createProjectDir(args.project, flags.overwrite)
      .then(() => {
        this.createConfig((flags.port) ? Number(flags.port) : 4242, (flags.socket) ? flags.socket : '')
          .then(config => {
            let properties: string = path.join(args.project, 'project.json')
            fs.writeJson(properties, config, {spaces: 2}).catch((error: Error) => {
              cli.error(`Unable to write ${properties}: ${error.message}`, {exit: false})
            })
          })
          .catch()
      }, rejection => { cli.error(rejection, {exit: false}) })
      .catch()
  }

  async createProjectDir(dir: string, overwrite: boolean) {
    if (fs.pathExistsSync(dir)) {
      if (!overwrite) {
        return Promise.reject('Project directory already exists.')
      } else {
        fs.removeSync(dir)
      }
    }
    fs.mkdirsSync(dir)
  }

  async createConfig(port: number, socket: string): Promise<CtcProjectConfig> {
    let name = await cli.prompt('Project name')
    let hostname = '127.0.0.1'
    let config: CtcProjectConfig = {
      name,
      control: {hostname, port, socket},
      http: {hostname, port: 0, secure: false},
      ctc: {version: this.config.version}
    }
    return config
  }
}

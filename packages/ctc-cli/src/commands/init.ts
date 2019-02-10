import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as Path from 'path'
import {cli} from 'cli-ux'
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

  static args = [{name: 'project', descripton: 'project directory', required: true, default: Path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Init)

    if (!args.project) {
      this.error('Project directory not specified or is invalid.')
    }
    if (flags.port) {
      if (isNaN(Number(flags.port))) {
        this.error(`Port "${flags.port}" is not a networkable port.`)
      }
    }

    if (fs.pathExistsSync(args.project)) {
      if (!flags.overwrite) {
        this.error('Project directory already exists.')
      } else {
        fs.removeSync(args.project)
        fs.mkdirsSync(args.project)
      }
    } else {
      fs.mkdirsSync(args.project)
    }

    let name = await cli.prompt("Project name")
    let port = (flags.port) ? Number(flags.port) : 4242
    let socket = (flags.socket) ? flags.socket : ''
    let hostname = '127.0.0.1'
    let config: CtcProjectConfig = {
      name: name,
      control: {hostname: hostname, port: port, socket: socket},
      http: {hostname: hostname, port: 0, secure: false},
      ctc: {version: this.config.version}
    }

    let properties: string = Path.join(args.project, 'project.json')

    fs.writeJson(properties, config, {spaces: 2})
  }
}

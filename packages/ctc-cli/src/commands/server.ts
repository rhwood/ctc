import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as Path from 'path'
import cli from 'cli-ux'
import Init from './init'
import {CtcServer} from '../server/ctc-server'
import {CtcProject} from '../project/ctc-project'

export default class Server extends Command {
  static description = 'Run a CTC server'

  // do not list server in help contents
  static hidden = false

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    force: flags.boolean({char: 'f'}),
    port: flags.string({char: 'p', description: 'use port for remote control'}),
    socket: flags.string({char: 's', description: 'use socket for local control'})
  }

  static args = [{name: 'project', default: Path.resolve()}]

  async run() {
    const {args, flags} = this.parse(Server)

    if (!args.project) {
      this.error('Project directory not specified or is invalid.')
    }

    if (this.config.debug) {
      this.log('Preparing server...')
    }

    if (!CtcProject.isProject(args.project)) {
      if (!args.daemon) {
        this.log(`${args.project} is not a project.`)
        if (await cli.confirm('Initialize a project?')) {
          await Init.run([args.project])
        } else {
          this.exit()
        }
      } else {
        this.error(`${args.project} is not a project.`)
      }
    }

    let project: CtcProject = new CtcProject(args.project, fs.readJsonSync(Path.join(args.project, 'project.json')))

    let server = new CtcServer(project, this.config)
    server.start()
  }
}

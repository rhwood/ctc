import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as Path from 'path'
import cli from 'cli-ux'
import Init from './init'
import {Server as CtcServer, Project} from 'ctc-server'

export default class Server extends Command {
  static description = 'Control a CTC server'

  // do not list server in help contents
  static hidden = true

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    force: flags.boolean({char: 'f'}),
    port: flags.string({char: 'p', description: 'use port for remote control'}),
    socket: flags.string({char: 's', description: 'use socket for local control'})
  }

  static args = [{name: 'project'}]

  private isProject(project: string): boolean {
    let properties: string = Path.join(project, 'project.json')
    return fs.existsSync(properties)
  }

  async run() {
    const {args, flags} = this.parse(Server)

    if (!args.project) {
      this.error('Project not specified')
    }

    if (this.config.debug) {
      this.log('Preparing server...')
    }

    if (!this.isProject(args.project)) {
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

    let project: Project = fs.readJsonSync(Path.join(args.project, 'project.json'))

    let server = new CtcServer(project)
    server.start()
  }
}

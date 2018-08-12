import {Command, flags} from '@oclif/command'
import {CtcServer} from './CtcServer'

class CtcServerCli extends Command {
  static description = 'Centralized Traffic Control server for model railroads'

  // do not list server in help contents
  static hidden = true

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    force: flags.boolean({char: 'f'}),
    port: flags.string({char: 'p', description: 'use port for remote control'}),
    socket: flags.string({char: 's', description: 'use socket for local control'}),
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
  }

  static args = [{name: 'project'}]

  async run() {
    const {args, flags} = this.parse(CtcServerCli)

    const port = (flags.port) ? flags.port : '0'
    const socket = (flags.socket) ? flags.socket : ''
    const server = new CtcServer('127.0.0.1', Number(port), socket)
    server.start()
  }
}

export = CtcServerCli

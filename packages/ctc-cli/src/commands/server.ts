import {Command, flags} from '@oclif/command'

export default class Server extends Command {
  static description = 'describe the command here'

  // do not list server in help contents
  static hidden = true

  static flags = {
    help: flags.help({char: 'h'}),
    daemon: flags.boolean({char: 'd', allowNo: true, description: 'run as a daemon'}),
    force: flags.boolean({char: 'f'}),
    port: flags.string({char: 'p', description: 'use port for remote control'}),
    socket: flags.string({char: 's', description: 'use socket for local control'}),
  }

  static args = [{name: 'project'}]

  async run() {
    const {args, flags} = this.parse(Server)

    if (this.config.debug) {
      this.log(`🚦 Starting server...`)
    }
  }
}

import * as fs from 'fs-extra'
import * as log from 'npmlog'
import * as Path from 'path'

import {CtcProjectConfig} from './ctc-project-config'

export class CtcProject {
  static isProject(dir: string): boolean {
    return fs.existsSync(Path.join(dir, 'project.json'))
  }

  static isLocked(dir: string): boolean {
    let lock: string = Path.join(dir, 'lock')
    if (fs.existsSync(lock)) {
      let pid = Number(fs.readFileSync(lock))
      try {
        process.kill(pid, 0)
        return true
      } catch {
        // remove lock because its invalid
        fs.removeSync(lock)
        return false
      }
    }
    return false
  }

  readonly config: CtcProjectConfig
  readonly path: string

  constructor(path: string, config?: CtcProjectConfig | undefined) {
    this.path = Path.resolve(path)
    if (config === undefined) {
      let json = Path.join(this.path, 'project.json')
      if (fs.existsSync(json)) {
        this.config = fs.readJsonSync(json)
      } else {
        throw new Error(`Path "${path}" is not a project.`)
      }
    } else {
      this.config = config
    }
  }

  public lock() {
    let lock: string = Path.join(this.path, 'lock')
    try {
      fs.writeFileSync(lock, process.pid)
    } catch (err) {
      log.error('ERROR', 'Unable to lock project: %s', err)
    }
  }

  public unlock() {
    let lock: string = Path.join(this.path, 'lock')
    try {
      fs.removeSync(lock)
    } catch (err) {
      log.error('ERROR', 'Unable to unlock project: %s', err)
    }
  }
}
